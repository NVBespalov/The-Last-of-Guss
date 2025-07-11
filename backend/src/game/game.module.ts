import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Round } from '../round/entities/round.entity';
import { RoundParticipation } from '../round/entities/round-participations.entity';
import { User } from '@ThLOG/auth/entities';
import { TapService } from '@ThLOG/game/tap.service';
import { GameController } from '@ThLOG/game/game.controller';
import { AuthModule } from '@ThLOG/auth';
import { LockService } from '@ThLOG/common/services/lock.service';
import { TapLog } from '@ThLOG/game/entitties/tap-log.entity';
import { LocksModule } from '@ThLOG/lock/lock.module';
import { RedisModule } from '@ThLOG/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Round, RoundParticipation, User, TapLog]),
    AuthModule,
    LocksModule,
    RedisModule,
  ],
  controllers: [GameController],
  providers: [TapService, LockService],
  exports: [TapService],
})
export class GameModule {}
