import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { JobName } from '@pablo/shared';
import { AnalyticsAgentService } from './analytics-agent.service';

@Processor(JobName.ANALYZE_PERFORMANCE)
export class AnalyticsAgentProcessor extends WorkerHost {
  private readonly logger = new Logger(AnalyticsAgentProcessor.name);

  constructor(private readonly analyticsAgentService: AnalyticsAgentService) {
    super();
  }

  async process(job: Job) {
    this.logger.log(`Processing job ${job.id} (${job.name})`);
    return this.analyticsAgentService.analyzePerformance();
  }
}
