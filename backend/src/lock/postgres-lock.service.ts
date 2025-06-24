import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RedisCacheService } from '@ThLOG/redis/redis-cache.service';
import { AppLock } from '@ThLOG/lock/entities/app-lock.entity';

@Injectable()
export class PostgresLockService {
  private readonly logger = new Logger(PostgresLockService.name);
  private readonly useRedisLocks: boolean = true;

  constructor(
    private readonly dataSource: DataSource,
    private readonly redisService: RedisCacheService,
  ) {
    // Запускаем периодическую очистку устаревших блокировок в PostgreSQL
    setInterval(() => this.cleanupExpiredLocks(), 60000); // Раз в минуту
  }

  async acquireLock(
    lockKey: string,
    timeoutMs: number = 5000,
  ): Promise<boolean> {
    // Предпочитаем использовать Redis для блокировок, если он доступен
    if (this.useRedisLocks) {
      return this.redisService.acquireLock(lockKey, timeoutMs);
    }

    // Если Redis недоступен, используем PostgreSQL
    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + timeoutMs);

      const result = await this.dataSource.query(
        `INSERT INTO app_locks (lock_key, locked_at, expires_at)
         VALUES ($1, $2, $3) ON CONFLICT (lock_key)
         DO
        UPDATE SET locked_at = $2, expires_at = $3
        WHERE app_locks.expires_at
            < NOW()
          RETURNING *`,
        [lockKey, now, expiresAt],
      );

      return result.length > 0;
    } catch (error) {
      this.logger.error(
        `Ошибка при получении блокировки: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  async releaseLock(lockKey: string): Promise<void> {
    // Если используем Redis для блокировок
    if (this.useRedisLocks) {
      await this.redisService.releaseLock(lockKey);
      return;
    }

    // Если используем PostgreSQL для блокировок
    try {
      await this.dataSource
        .createQueryBuilder()
        .delete()
        .from(AppLock)
        .where('lockKey = :lockKey', { lockKey })
        .execute();
    } catch (error) {
      this.logger.error(
        `Ошибка при освобождении блокировки: ${error.message}`,
        error.stack,
      );
    }
  }

  private async cleanupExpiredLocks(): Promise<void> {
    try {
      await this.dataSource
        .createQueryBuilder()
        .delete()
        .from(AppLock)
        .where('expiresAt < NOW()')
        .execute();
    } catch (error) {
      this.logger.error(
        `Ошибка при очистке устаревших блокировок: ${error.message}`,
        error.stack,
      );
    }
  }
}
