import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@ThLOG/auth/services';
import { InvalidTokenException } from '@ThLOG/auth/exceptions';
import { UserRole } from '@ThLOG/auth/entities';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'secret_key',
    });
  }

  async validate({
    role,
    sub,
    username,
  }: {
    role: UserRole;
    sub: string;
    username: string;
  }) {
    try {
      const user = await this.usersService.findById(sub);

      if (!user) {
        this.logger.warn(
          `Токен содержит ID несуществующего пользователя: ${sub}`,
        );
        throw new InvalidTokenException();
      }

      if (!user.isActive) {
        this.logger.warn(
          `Токен используется для деактивированного аккаунта: ${username}`,
        );
        throw new InvalidTokenException();
      }

      // Обновляем время последнего входа
      await this.usersService.updateLastLogin(user.id);

      return {
        id: sub,
        username: username,
        role: role,
      };
    } catch (error) {
      this.logger.error(
        `Ошибка при валидации JWT: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
