import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { JobName } from '@pablo/shared';
import { CommunityAgentService } from './community-agent.service';
import { SuggestReplyDto } from './dto/suggest-reply.dto';

@Processor(JobName.SUGGEST_REPLIES)
export class CommunityAgentProcessor extends WorkerHost {
  private readonly logger = new Logger(CommunityAgentProcessor.name);

  constructor(private readonly communityAgentService: CommunityAgentService) {
    super();
  }

  async process(job: Job<SuggestReplyDto>) {
    this.logger.log(`Processing job ${job.id} (${job.name})`);
    return this.communityAgentService.suggestReply(job.data);
  }
}
