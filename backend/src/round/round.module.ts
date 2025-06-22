import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Round } from './entities/round.entity';
import { RoundParticipation } from './entities/round-participations.entity';
import { RoundsController } from './round.controller';
import { RoundsService } from './round.service';
import { TimerModule } from '@ThLOG/common/timer/timer.module';
import { GameModule } from '@ThLOG/game/game.module';
import { AuthModule } from '@ThLOG/auth';
@Module({
  imports: [
    TypeOrmModule.forFeature([Round, RoundParticipation]),
    TimerModule,
    GameModule,
    AuthModule,
  ],
  controllers: [RoundsController],
  providers: [RoundsService],
  exports: [RoundsService],
})
export class RoundsModule {}
