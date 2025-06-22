import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from '@ThLOG/auth/services';
import { ROLES_KEY } from '@ThLOG/auth/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Если роли не указаны, доступ разрешен
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.id) {
      this.logger.warn('Попытка доступа без авторизации');
      return false;
    }

    // Загружаем полные данные пользователя вместе с ролью
    const fullUser = await this.usersService.findByIdWithRole(user.id);

    if (!fullUser || !fullUser.role) {
      this.logger.warn(`Пользователь с ID ${user.id} не имеет роли`);
      return false;
    }

    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      this.logger.warn(
        `Пользователь с ID ${user.id} и ролью ${fullUser.role} пытается получить доступ к ресурсу, требующему роли: ${requiredRoles.join(', ')}`,
      );
    }

    return hasRole;
  }
}
