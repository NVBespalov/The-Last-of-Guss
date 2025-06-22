import { Injectable, Logger, Optional } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from './user.service';
import {
  AccountDeactivatedException,
  InvalidCredentialsException,
  InvalidRefreshTokenException,
  RefreshTokenExpiredException,
} from '@ThLOG/auth/exceptions';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '@ThLOG/auth/utils';
import { PrometheusService } from '@ThLOG/common/metrics/prometheus.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Optional() private prometheusService: PrometheusService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    try {
      const user = await this.usersService.findOne(username);

      if (!user) {
        this.logger.warn(
          `Попытка входа с несуществующим пользователем: ${username}`,
        );
        throw new InvalidCredentialsException();
      }

      if (!user.isActive) {
        this.logger.warn(
          `Попытка входа в деактивированный аккаунт: ${username}`,
        );
        throw new AccountDeactivatedException();
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        this.logger.warn(`Неверный пароль для пользователя: ${username}`);
        throw new InvalidCredentialsException();
      }

      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      if (
        error instanceof InvalidCredentialsException ||
        error instanceof AccountDeactivatedException
      ) {
        throw error;
      }

      this.logger.error(
        `Ошибка при валидации пользователя: ${error.message}`,
        error.stack,
      );
      throw new InvalidCredentialsException();
    }
  }

  async login(user: any) {
    try {
      let dbUser = await this.usersService.findOne(user.username, {
        select: { password: false },
      });

      if (!dbUser) {
        dbUser = await this.usersService.create(user);
      }

      if (!bcrypt.compareSync(user.password, dbUser.password)) {
        throw new InvalidCredentialsException();
      }

      const payload = {
        username: dbUser.username,
        sub: dbUser.id,
        role: dbUser.role,
      };

      return {
        success: true,
        data: {
          access_token: this.jwtService.sign(payload),
          user: dbUser,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Ошибка при входе пользователя: ${error.message}`,
        error.stack,
      );
      if (this.prometheusService) {
        this.prometheusService.recordAuthAttempt('failure', 'login');
      }

      throw error;
    }
  }

  async logout(userId: string) {
    try {
      // Удаляем refresh token из базы данных
      await this.usersService.removeRefreshToken(userId);

      this.logger.log(`Пользователь успешно вышел из системы: ${userId}`);

      return {
        success: true,
        message: 'Выход выполнен успешно',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Ошибка при выходе пользователя: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      this.logger.error(`Ошибка верификации токена: ${error.message}`);
      throw new InvalidCredentialsException();
    }
  }

  async refreshTokens(userId: string, refreshToken: string) {
    try {
      // Проверяем существование пользователя
      const user = await this.usersService.findById(userId);

      if (!user || !user.refreshToken) {
        this.logger.warn(
          `Попытка обновления токена для пользователя без refresh token: ${userId}`,
        );
        throw new InvalidRefreshTokenException();
      }

      // Проверяем, не истек ли срок действия refresh token
      if (user.refreshTokenExpires && user.refreshTokenExpires < new Date()) {
        this.logger.warn(
          `Попытка использования истекшего refresh token: ${userId}`,
        );
        throw new RefreshTokenExpiredException();
      }

      // Проверяем соответствие refresh token
      const refreshTokenMatches = await bcrypt.compare(
        refreshToken,
        user.refreshToken,
      );

      if (!refreshTokenMatches) {
        this.logger.warn(`Неверный refresh token для пользователя: ${userId}`);
        throw new InvalidRefreshTokenException();
      }

      // Генерируем новые токены
      const tokens = await this.getTokens(user.id, user.username);

      // Сохраняем новый refresh token
      await this.usersService.updateRefreshToken(
        user.id,
        tokens.refreshToken,
        new Date(Date.now() + this.getRefreshTokenTTL() * 1000),
      );

      this.logger.log(
        `Токены успешно обновлены для пользователя: ${user.username}`,
      );

      return {
        success: true,
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (
        error instanceof InvalidRefreshTokenException ||
        error instanceof RefreshTokenExpiredException
      ) {
        throw error;
      }

      this.logger.error(
        `Ошибка при обновлении токенов: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getTokens(userId: string, username: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.getAccessTokenTTL(),
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret:
            this.configService.get<string>('JWT_REFRESH_SECRET') ||
            this.configService.get<string>('JWT_SECRET') + '_refresh',
          expiresIn: this.getRefreshTokenTTL(),
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private getAccessTokenTTL(): string {
    return this.configService.get<string>('JWT_ACCESS_EXPIRES') || '15m';
  }

  private getRefreshTokenTTL(): number {
    const ttlStr =
      this.configService.get<string>('JWT_REFRESH_EXPIRES') || '7d';

    // Преобразуем строку формата '7d', '30d', '24h' и т.д. в секунды
    const unit = ttlStr.slice(-1);
    const value = parseInt(ttlStr.slice(0, -1), 10);

    switch (unit) {
      case 'd':
        return value * 24 * 60 * 60;
      case 'h':
        return value * 60 * 60;
      case 'm':
        return value * 60;
      case 's':
        return value;
      default:
        return 7 * 24 * 60 * 60; // 7 дней по умолчанию
    }
  }
}
