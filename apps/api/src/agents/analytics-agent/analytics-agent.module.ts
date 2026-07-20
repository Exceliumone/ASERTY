import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JobName } from '@pablo/shared';
import { AnalyticsAgentController } from './analytics-agent.controller';
import { AnalyticsAgentService } from './analytics-agent.service';
import { AnalyticsAgentProcessor } from './analytics-agent.processor';

@Module({
  imports: [BullModule.registerQueue({ name: JobName.ANALYZE_PERFORMANCE })],
  controllers: [AnalyticsAgentController],
  providers: [AnalyticsAgentService, AnalyticsAgentProcessor],
  exports: [AnalyticsAgentService],
})
export class AnalyticsAgentModule {}
