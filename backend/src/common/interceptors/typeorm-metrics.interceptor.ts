import { Injectable } from '@nestjs/common';
import { PrometheusService } from '@ThLOG/common/metrics/prometheus.service';
import { DataSource, QueryRunner } from 'typeorm';

@Injectable()
export class TypeOrmMetricsInterceptor {
  constructor(
    private readonly dataSource: DataSource,
    private readonly prometheusService: PrometheusService,
  ) {
    this.setupQueryRunnerInterceptor();
  }

  private setupQueryRunnerInterceptor() {
    const originalCreateQueryRunner = this.dataSource.createQueryRunner.bind(
      this.dataSource,
    );
    const prometheus = this.prometheusService;
    this.dataSource.createQueryRunner = function (...args: any[]) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const queryRunner = originalCreateQueryRunner(...args) as QueryRunner;
      const originalQuery = queryRunner.query.bind(queryRunner);

      queryRunner.query = async function (
        query: string,
        parameters?: any[],
        ...rest: any[]
      ) {
        const startTime = process.hrtime();
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return
          return await originalQuery(query, parameters, ...rest);
        } finally {
          const [seconds, nanoseconds] = process.hrtime(startTime);
          const duration = seconds + nanoseconds / 1e9;

          // Определение типа запроса
          const queryType = query.trim().toLowerCase().startsWith('select')
            ? 'select'
            : query.trim().toLowerCase().startsWith('insert')
              ? 'insert'
              : query.trim().toLowerCase().startsWith('update')
                ? 'update'
                : query.trim().toLowerCase().startsWith('delete')
                  ? 'delete'
                  : 'other';

          // Попытка определить сущность
          let entity = 'unknown';
          if (query.includes('FROM')) {
            const fromMatch = query.match(
              /FROM\s+(?:"public"\.)?(?:")?([a-zA-Z0-9_]+)(?:")?/i,
            );
            if (fromMatch && fromMatch[1]) {
              entity = fromMatch[1];
            }
          } else if (query.includes('INTO')) {
            const intoMatch = query.match(
              /INTO\s+(?:"public"\.)?(?:")?([a-zA-Z0-9_]+)(?:")?/i,
            );
            if (intoMatch && intoMatch[1]) {
              entity = intoMatch[1];
            }
          } else if (query.includes('UPDATE')) {
            const updateMatch = query.match(
              /UPDATE\s+(?:"public"\.)?(?:")?([a-zA-Z0-9_]+)(?:")?/i,
            );
            if (updateMatch && updateMatch[1]) {
              entity = updateMatch[1];
            }
          }

          prometheus?.recordDbQuery(queryType, entity, duration);
        }
      };

      return queryRunner;
    };
  }
}
