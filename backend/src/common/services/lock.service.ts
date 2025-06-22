import { Injectable } from '@nestjs/common';

@Injectable()
export class LockService {
  // Храним активные блокировки в памяти
  private locks: Map<string, { expiresAt: Date }> = new Map();

  acquireLock(lockKey: string, timeoutMs: number = 5000) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + timeoutMs);

    // Проверяем, есть ли активная блокировка
    const existingLock = this.locks.get(lockKey);
    if (existingLock && existingLock.expiresAt > now) {
      return false; // Блокировка уже существует и не истекла
    }

    // Устанавливаем блокировку
    this.locks.set(lockKey, { expiresAt });
    return true;
  }

  releaseLock(lockKey: string): void {
    this.locks.delete(lockKey);
  }

  // Периодическая очистка устаревших блокировок
  cleanupExpiredLocks(): void {
    const now = new Date();
    for (const [key, lock] of this.locks.entries()) {
      if (lock.expiresAt < now) {
        this.locks.delete(key);
      }
    }
  }
}
