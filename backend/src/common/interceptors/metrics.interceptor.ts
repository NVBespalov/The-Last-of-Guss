import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrometheusService } from '@ThLOG/common/metrics/prometheus.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private prometheusService: PrometheusService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() === 'http') {
      const req = context.switchToHttp().getRequest();
      const method = req.method;
      const path = req.route?.path || req.url;
      const startTime = Date.now();

      return next.handle().pipe(
        tap({
          next: () => {
            const res = context.switchToHttp().getResponse();
            const duration = (Date.now() - startTime) / 1000; // в секундах
            this.prometheusService.recordHttpRequest(
              method,
              path,
              res.statusCode,
              duration,
            );
          },
          error: (error) => {
            const status = error.status || 500;
            const duration = (Date.now() - startTime) / 1000; // в секундах
            this.prometheusService.recordHttpRequest(
              method,
              path,
              status,
              duration,
            );
          },
        }),
      );
    }

    return next.handle();
  }
}
