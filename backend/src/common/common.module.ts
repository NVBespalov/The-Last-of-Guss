import { Global, Module } from '@nestjs/common';
import { MetricsModule } from './metrics/metrics.module';
import { AuthModule } from '@ThLOG/auth';

@Global()
@Module({
  imports: [AuthModule, MetricsModule],
  providers: [],
  exports: [MetricsModule],
})
export class CommonModule {}
