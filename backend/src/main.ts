import { NestFactory } from '@nestjs/core';
import { AppModule } from '@ThLOG//app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from '@ThLOG/common/filters';
import { Request, Response } from 'express';
import {
  TransformInterceptor,
  TypeOrmExceptionFilter,
} from '@ThLOG/common/interceptors';
import * as cookieParser from 'cookie-parser';
import { SwaggerModule } from '@nestjs/swagger';
import {
  createSwaggerConfig,
  swaggerCustomOptions,
} from '@ThLOG/common/config';
import { winstonLogger } from '@ThLOG/common/logger/winston.logger';
import { PrometheusService } from '@ThLOG/common/metrics/prometheus.service';
import { MetricsInterceptor } from '@ThLOG/common/interceptors/metrics.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: winstonLogger,
  });
  const prometheusService = app.get(PrometheusService);
  const configService = app.get(ConfigService);
  const apiPrefix = configService.getOrThrow<string>('apiPrefix');

  app.use(cookieParser());
  app.use(`/${apiPrefix}/metrics`, async (req: Request, res: Response) => {
    res.set('Content-Type', 'text/plain');
    const metrics = await prometheusService.getMetrics();
    res.end(metrics);
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const result = errors.map((error) => ({
          property: error.property,
          message: error?.constraints?.[Object.keys(error.constraints)[0]],
        }));
        return new BadRequestException(result);
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter(), new TypeOrmExceptionFilter());
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new MetricsInterceptor(prometheusService),
  );

  app.setGlobalPrefix(apiPrefix);

  const environment = process.env.NODE_ENV || 'development';
  const swaggerConfig = createSwaggerConfig(environment);
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, swaggerCustomOptions);

  // Получение порта из конфигурации
  const port = configService.getOrThrow<number>('port');
  // app.useWebSocketAdapter(new CustomIoAdapter(app));

  await app.listen(port);
  console.log(`Приложение запущено на порту: ${port}`);
  console.log(
    `Документация Swagger доступна по адресу: ${await app.getUrl()}/api`,
  );
}

void bootstrap();
