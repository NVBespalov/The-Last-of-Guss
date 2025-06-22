import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '@ThLOG/auth/decorators';
import {
  InvalidTokenException,
  TokenExpiredException,
} from '@ThLOG/auth/exceptions';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
  handleRequest(err, user, info) {
    if (info instanceof Error) {
      this.logger.error(`JWT ошибка: ${info.message}`);

      if (info.name === 'TokenExpiredError') {
        throw new TokenExpiredException();
      } else if (info.name === 'JsonWebTokenError') {
        throw new InvalidTokenException();
      }
    }

    if (err || !user) {
      this.logger.error('Ошибка авторизации JWT', err);
      throw err || new UnauthorizedException();
    }

    return user;
  }
}
