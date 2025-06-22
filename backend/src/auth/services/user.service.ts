import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, MoreThan, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '@ThLOG/auth/entities';
import { UserNotFoundException } from '@ThLOG/auth/exceptions';
import { RegisterDto } from '@ThLOG/auth/dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(
    username: string,
    options?: FindOneOptions<User>,
  ): Promise<User | null> {
    try {
      return this.usersRepository.findOne({ where: { username }, ...options });
    } catch (error) {
      this.logger.error(
        `Ошибка при поиске пользователя по имени: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findById(id: string): Promise<User | undefined> {
    try {
      const user = await this.usersRepository.findOne({ where: { id } });
      if (!user) {
        throw new UserNotFoundException(`с ID ${id}`);
      }
      return user;
    } catch (error) {
      if (error instanceof UserNotFoundException) {
        throw error;
      }
      this.logger.error(
        `Ошибка при поиске пользователя по ID: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async create(registerDto: RegisterDto): Promise<User> {
    try {
      const user = new User();
      user.username = registerDto.username;
      user.email = registerDto.email;

      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(registerDto.password, salt);

      user.role = UserRole.ADMIN;

      return this.usersRepository.save(user);
    } catch (error) {
      this.logger.error(
        `Ошибка при создании пользователя: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async updateLastLogin(id: string): Promise<void> {
    try {
      await this.usersRepository.update(id, {});
    } catch (error) {
      this.logger.error(
        `Ошибка при обновлении времени последнего входа: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findByRefreshToken(refreshToken: string): Promise<User | null> {
    try {
      return this.usersRepository.findOne({
        where: {
          refreshToken,
          refreshTokenExpires: MoreThan(new Date()),
        },
      });
    } catch (error) {
      this.logger.error(
        `Ошибка при поиске пользователя по refresh token: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findByIdWithRole(id: string): Promise<User | undefined> {
    try {
      const user = await this.usersRepository.findOne({
        where: { id },
      });

      if (!user) {
        throw new UserNotFoundException(`с ID ${id}`);
      }

      return user;
    } catch (error) {
      if (error instanceof UserNotFoundException) {
        throw error;
      }
      this.logger.error(
        `Ошибка при поиске пользователя с ролью: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
    expiresIn?: Date,
  ): Promise<void> {
    try {
      const updateData: Partial<User> = {};

      if (refreshToken === null) {
        updateData.refreshToken = undefined;
        updateData.refreshTokenExpires = undefined;
      } else {
        // Иначе сохраняем новый refresh token
        const salt = await bcrypt.genSalt();
        updateData.refreshToken = await bcrypt.hash(refreshToken, salt);
        updateData.refreshTokenExpires =
          expiresIn || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // По умолчанию 7 дней
      }

      await this.usersRepository.update(userId, updateData);
      this.logger.log(`Refresh token обновлен для пользователя с ID ${userId}`);
    } catch (error) {
      this.logger.error(
        `Ошибка при обновлении refresh token: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async validateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<boolean> {
    try {
      const user = await this.findById(userId);

      if (!user || !user.refreshToken) {
        return false;
      }

      // Проверяем, не истек ли срок действия refresh token
      if (user.refreshTokenExpires && user.refreshTokenExpires < new Date()) {
        return false;
      }

      // Проверяем соответствие хешированного токена
      return bcrypt.compare(refreshToken, user.refreshToken);
    } catch (error) {
      this.logger.error(
        `Ошибка при валидации refresh token: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  async removeRefreshToken(userId: string): Promise<void> {
    try {
      await this.updateRefreshToken(userId, null);
      this.logger.log(`Refresh token удален для пользователя с ID ${userId}`);
    } catch (error) {
      this.logger.error(
        `Ошибка при удалении refresh token: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async changeRole(
    userId: string,
    roleCode: UserRole,
  ): Promise<User | undefined> {
    try {
      await this.usersRepository.update(userId, { role: roleCode });

      this.logger.log(
        `Роль пользователя с ID ${userId} изменена на ${roleCode}`,
      );

      return this.findByIdWithRole(userId);
    } catch (error) {
      this.logger.error(
        `Ошибка при изменении роли пользователя: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
