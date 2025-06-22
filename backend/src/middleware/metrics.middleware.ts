import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

declare global {
  namespace NodeJS {
    interface Global {
      metrics: {
        httpRequestsTotal: any;
      };
    }
  }
}

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // const start = Date.now();

    res.on('finish', () => {
      // const duration = Date.now() - start;

      if (global.metrics && global.metrics.httpRequestsTotal) {
        global.metrics.httpRequestsTotal.inc({
          method: req.method,
          path: req.path,
          status: res.statusCode,
        });
      }
    });

    next();
  }
}
