import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostgresLockService } from './postgres-lock.service';
import { RedisModule } from '../redis/redis.module';
import { AppLock } from '@ThLOG/lock/entities/app-lock.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AppLock]), RedisModule],
  providers: [PostgresLockService],
  exports: [PostgresLockService],
})
export class LocksModule {}
