import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { JobName } from '@pablo/shared';
import { TrendAgentService } from './trend-agent.service';

@Processor(JobName.SCAN_TRENDS)
export class TrendAgentProcessor extends WorkerHost {
  private readonly logger = new Logger(TrendAgentProcessor.name);

  constructor(private readonly trendAgentService: TrendAgentService) {
    super();
  }

  async process(job: Job<{ signals?: string[] }>) {
    this.logger.log(`Processing job ${job.id} (${job.name})`);
    return this.trendAgentService.scanTrends(job.data.signals ?? []);
  }
}
