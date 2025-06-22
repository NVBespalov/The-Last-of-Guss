import { Global, Module } from '@nestjs/common';
import { GameModule } from '../game/game.module';
import { AppGateway } from '@ThLOG/gateways/app.gateway';
import { RoundsModule } from '@ThLOG/round/round.module';
import { AuthModule } from '@ThLOG/auth';

@Global()
@Module({
  imports: [GameModule, RoundsModule, GameModule, AuthModule],
  providers: [AppGateway],
  exports: [AppGateway],
})
export class WebSocketModule {}
