import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisCacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheService.name);
  private client: Redis;
  private readonly DEFAULT_TTL = 60; // 60 секунд по умолчанию

  constructor(private readonly configService: ConfigService) {}

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
      this.logger.log('Соединение с Redis закрыто');
    }
  }

  onModuleInit() {
    this.client = new Redis({
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: parseInt(this.configService.get('REDIS_PORT', '6379')),
      password: this.configService.get('REDIS_PASSWORD', ''),
      db: parseInt(this.configService.get('REDIS_DB', '0')),
    });

    this.client.on('error', (err) => {
      this.logger.error(
        `Ошибка подключения к Redis: ${err.message}`,
        err.stack,
      );
    });

    this.client.on('connect', () => {
      this.logger.log('Успешное подключение к Redis');
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch (error) {
      this.logger.error(
        `Ошибка при получении из кэша: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }

  async set(
    key: string,
    value: any,
    ttlSeconds: number = this.DEFAULT_TTL,
  ): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await this.client.set(key, serializedValue, 'EX', ttlSeconds);
    } catch (error) {
      this.logger.error(
        `Ошибка при записи в кэш: ${error.message}`,
        error.stack,
      );
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.error(
        `Ошибка при удалении из кэша: ${error.message}`,
        error.stack,
      );
    }
  }

  async getOrSet<T>(
    key: string,
    callback: () => Promise<T>,
    ttlSeconds: number = this.DEFAULT_TTL,
  ): Promise<T> {
    try {
      const cachedValue = await this.get<T>(key);
      if (cachedValue !== null) {
        return cachedValue;
      }

      const freshValue = await callback();
      await this.set(key, freshValue, ttlSeconds);
      return freshValue;
    } catch (error) {
      this.logger.error(`Ошибка в getOrSet: ${error.message}`, error.stack);
      return await callback(); // Возвращаем свежее значение при ошибке кэша
    }
  }

  // Метод для распределенной блокировки с помощью Redis
  async acquireLock(lockKey: string, ttlMs: number = 5000): Promise<boolean> {
    try {
      const result = await this.client.set(
        `lock:${lockKey}`,
        Date.now().toString(),
        'PX',
        ttlMs,
        'NX',
      );
      return result === 'OK';
    } catch (error) {
      this.logger.error(
        `Ошибка при получении блокировки: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  async releaseLock(lockKey: string): Promise<void> {
    try {
      await this.client.del(`lock:${lockKey}`);
    } catch (error) {
      this.logger.error(
        `Ошибка при освобождении блокировки: ${error.message}`,
        error.stack,
      );
    }
  }

  getClient(): Redis {
    return this.client;
  }
}
