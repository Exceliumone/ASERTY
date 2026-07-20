import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { JobName } from '@pablo/shared';
import { ImageAgentService } from './image-agent.service';
import { GenerateImageDto } from './dto/generate-image.dto';

@Processor(JobName.GENERATE_IMAGE)
export class ImageAgentProcessor extends WorkerHost {
  private readonly logger = new Logger(ImageAgentProcessor.name);

  constructor(private readonly imageAgentService: ImageAgentService) {
    super();
  }

  async process(job: Job<GenerateImageDto>) {
    this.logger.log(`Processing job ${job.id} (${job.name})`);
    return this.imageAgentService.generateImage(job.data);
  }
}
