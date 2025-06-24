import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@ThLOG/config/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from '@ThLOG/config/database.config';
import { HealthModule } from '@ThLOG/health/health.module';
import { AuthModule } from '@ThLOG/auth';
import { PrometheusService } from '@ThLOG/common/metrics/prometheus.service';
import { TypeOrmMetricsInterceptor } from '@ThLOG/common/interceptors/typeorm-metrics.interceptor';
import { DataSource } from 'typeorm';
import { RoundsModule } from '@ThLOG/round/round.module';
import { GameModule } from '@ThLOG/game/game.module';
import { CommonModule } from '@ThLOG/common/common.module';
import { TimerModule } from '@ThLOG/common/timer/timer.module';
import { WebSocketModule } from '@ThLOG/gateways/web-socket.module';
import { AppGateway } from '@ThLOG/gateways';
import { LocksModule } from '@ThLOG/lock/lock.module';
import { RedisModule } from '@ThLOG/redis/redis.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    CommonModule,
    HealthModule,
    AuthModule,
    RoundsModule,
    RedisModule,
    LocksModule,
    GameModule,
    TimerModule,
    WebSocketModule,
  ],
  controllers: [],
  providers: [AppGateway],
  exports: [],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly dataSource: DataSource,
    private readonly prometheusService: PrometheusService,
  ) {}

  onModuleInit() {
    // Настраиваем перехватчик запросов TypeORM для метрик
    new TypeOrmMetricsInterceptor(this.dataSource, this.prometheusService);
  }
}
