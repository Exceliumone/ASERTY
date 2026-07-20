import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { JobName } from '@pablo/shared';
import { ContentAgentService } from './content-agent.service';

@Processor(JobName.GENERATE_CONTENT_IDEAS)
export class ContentAgentProcessor extends WorkerHost {
  private readonly logger = new Logger(ContentAgentProcessor.name);

  constructor(private readonly contentAgentService: ContentAgentService) {
    super();
  }

  async process(job: Job<{ count?: number; context?: string }>) {
    this.logger.log(`Processing job ${job.id} (${job.name})`);
    return this.contentAgentService.generateSuggestions(job.data.count ?? 3, job.data.context);
  }
}
