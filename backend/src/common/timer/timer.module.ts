import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Round } from '@ThLOG/round/entities/round.entity';
import { GameModule } from '@ThLOG/game/game.module';
import { RoundTimerService } from '@ThLOG/common/timer/round-timer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Round]),
    GameModule,
    forwardRef(() => GameModule),
  ],
  providers: [RoundTimerService],
  exports: [RoundTimerService],
})
export class TimerModule {}
