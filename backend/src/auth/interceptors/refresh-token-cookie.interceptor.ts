import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RefreshTokenCookieInterceptor implements NestInterceptor {
  constructor(private configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap((data) => {
        // Проверяем, есть ли в ответе refresh token
        if (data && data.data && data.data.refreshToken) {
          const response = context.switchToHttp().getResponse();

          // Устанавливаем refresh token в cookie
          response.cookie('refresh_token', data.data.refreshToken, {
            httpOnly: true,
            secure: this.configService.get<string>('NODE_ENV') === 'production',
            sameSite: 'strict',
            maxAge: this.getRefreshTokenTTL() * 1000, // В миллисекундах
            path: '/auth/refresh', // Доступен только для эндпоинта обновления токена
          });

          // Удаляем refresh token из тела ответа (опционально)
          // delete data.data.refreshToken;
        }
      }),
    );
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
