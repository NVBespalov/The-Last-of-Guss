import * as prom from 'prom-client';
import { Global, Injectable } from '@nestjs/common';

let metricsInitialized = false;
@Global()
@Injectable()
export class PrometheusService {
  private readonly httpRequestCounter: prom.Counter;
  private readonly httpRequestDuration: prom.Histogram;
  private readonly memoryUsageGauge: prom.Gauge;
  private readonly cpuUsageGauge: prom.Gauge;
  private readonly activeConnectionsGauge: prom.Gauge;
  private readonly uptime: prom.Gauge;
  private readonly eventLoopLagGauge: prom.Gauge;
  private readonly gcDurationGauge: prom.Gauge;
  private readonly dbQueryDurationHistogram: prom.Histogram;
  private readonly authAttemptsCounter: prom.Counter;

  constructor() {
    // Инициализируем метрики только один раз глобально
    if (!metricsInitialized) {
      // Очищаем реестр на всякий случай
      prom.register.clear();

      // Стандартные метрики Node.js
      prom.collectDefaultMetrics({
        prefix: 'nestjs_',
        labels: { app: 'backend' },
      });

      metricsInitialized = true;
    }

    // Инициализируем кастомные метрики безопасно
    this.httpRequestCounter = this.getOrCreateMetric(
      'http_requests_total',
      () =>
        new prom.Counter({
          name: 'http_requests_total',
          help: 'Общее количество HTTP запросов',
          labelNames: ['method', 'path', 'status'],
        }),
    ) as prom.Counter;

    this.httpRequestDuration = this.getOrCreateMetric(
      'http_request_duration_seconds',
      () =>
        new prom.Histogram({
          name: 'http_request_duration_seconds',
          help: 'Продолжительность HTTP запросов в секундах',
          labelNames: ['method', 'path', 'status'],
          buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
        }),
    ) as prom.Histogram;

    this.memoryUsageGauge = this.getOrCreateMetric(
      'app_memory_usage_bytes',
      () =>
        new prom.Gauge({
          name: 'app_memory_usage_bytes',
          help: 'Использование памяти приложением в байтах',
          labelNames: ['type'],
        }),
    ) as prom.Gauge;

    this.cpuUsageGauge = this.getOrCreateMetric(
      'app_cpu_usage_percent',
      () =>
        new prom.Gauge({
          name: 'app_cpu_usage_percent',
          help: 'Использование CPU приложением в процентах',
        }),
    ) as prom.Gauge;

    this.activeConnectionsGauge = this.getOrCreateMetric(
      'app_active_connections',
      () =>
        new prom.Gauge({
          name: 'app_active_connections',
          help: 'Количество активных WebSocket подключений',
        }),
    ) as prom.Gauge;

    this.uptime = this.getOrCreateMetric(
      'app_uptime_seconds',
      () =>
        new prom.Gauge({
          name: 'app_uptime_seconds',
          help: 'Время работы приложения в секундах',
        }),
    ) as prom.Gauge;

    this.eventLoopLagGauge = this.getOrCreateMetric(
      'node_event_loop_lag_seconds',
      () =>
        new prom.Gauge({
          name: 'node_event_loop_lag_seconds',
          help: 'Задержка цикла событий Node.js в секундах',
        }),
    ) as prom.Gauge;

    this.gcDurationGauge = this.getOrCreateMetric(
      'node_gc_duration_seconds',
      () =>
        new prom.Gauge({
          name: 'node_gc_duration_seconds',
          help: 'Продолжительность сборки мусора в секундах',
          labelNames: ['gc_type'],
        }),
    ) as prom.Gauge;

    this.dbQueryDurationHistogram = this.getOrCreateMetric(
      'db_query_duration_seconds',
      () =>
        new prom.Histogram({
          name: 'db_query_duration_seconds',
          help: 'Продолжительность выполнения запросов к базе данных',
          labelNames: ['query_type', 'entity'],
          buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2],
        }),
    ) as prom.Histogram;

    this.authAttemptsCounter = this.getOrCreateMetric(
      'auth_attempts_total',
      () =>
        new prom.Counter({
          name: 'auth_attempts_total',
          help: 'Общее количество попыток авторизации',
          labelNames: ['status', 'method'],
        }),
    ) as prom.Counter;
  }

  private getOrCreateMetric(name: string, factory: () => any): any {
    try {
      return prom.register.getSingleMetric(name) || factory();
    } catch (error) {
      // Если метрика уже существует, получаем её
      return prom.register.getSingleMetric(name);
    }
  }

  updateResourceMetrics(): void {
    try {
      const mem = process.memoryUsage();
      this.memoryUsageGauge.set({ type: 'rss' }, mem.rss);
      this.memoryUsageGauge.set({ type: 'heapTotal' }, mem.heapTotal);
      this.memoryUsageGauge.set({ type: 'heapUsed' }, mem.heapUsed);

      this.uptime.set(process.uptime());
    } catch (error) {
      console.error('Ошибка при обновлении метрик ресурсов:', error);
    }
  }

  recordDbQuery(queryType: string, entity: string, duration: number) {
    try {
      this.dbQueryDurationHistogram.observe(
        { query_type: queryType, entity },
        duration,
      );
    } catch (error) {
      console.error('Ошибка при записи метрики DB запроса:', error);
    }
  }

  recordAuthAttempt(
    status: 'success' | 'failure',
    method: 'login' | 'register',
  ) {
    try {
      this.authAttemptsCounter.inc({ status, method });
    } catch (error) {
      console.error('Ошибка при записи метрики авторизации:', error);
    }
  }

  recordHttpRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
  ): void {
    try {
      this.httpRequestCounter.inc({
        method: method.toUpperCase(),
        path,
        status: statusCode.toString(),
      });

      this.httpRequestDuration.observe(
        {
          method: method.toUpperCase(),
          path,
          status: statusCode.toString(),
        },
        duration / 1000,
      );
    } catch (error) {
      console.error('Ошибка при записи HTTP метрики:', error);
    }
  }

  setActiveConnections(count: number): void {
    try {
      this.activeConnectionsGauge.set(count);
    } catch (error) {
      console.error('Ошибка при записи метрики активных соединений:', error);
    }
  }

  async getMetrics(): Promise<string> {
    try {
      return await prom.register.metrics();
    } catch (error) {
      console.error('Ошибка при получении метрик:', error);
      return '';
    }
  }
}
