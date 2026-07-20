import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JobName } from '@pablo/shared';
import { TrendAgentController } from './trend-agent.controller';
import { TrendAgentService } from './trend-agent.service';
import { TrendAgentProcessor } from './trend-agent.processor';

@Module({
  imports: [BullModule.registerQueue({ name: JobName.SCAN_TRENDS })],
  controllers: [TrendAgentController],
  providers: [TrendAgentService, TrendAgentProcessor],
  exports: [TrendAgentService],
})
export class TrendAgentModule {}
