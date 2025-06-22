import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import * as client from 'prom-client';

@Controller('health')
export class HealthController {
  private register: client.Registry;

  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    @InjectConnection() private connection: Connection,
  ) {
    // Создаем реестр Prometheus
    this.register = new client.Registry();
    client.collectDefaultMetrics({ register: this.register });

    // Создаем кастомные метрики
    const httpRequestsTotal = new client.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'path', 'status'],
      registers: [this.register],
    });

    // Добавляем метрики в глобальный объект для использования в middleware
    global.metrics = {
      httpRequestsTotal,
    };
  }

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database', { connection: this.connection }),
    ]);
  }

  @Get('metrics')
  getMetrics() {
    return this.register.metrics();
  }
}
