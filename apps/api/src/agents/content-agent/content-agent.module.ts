import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JobName } from '@pablo/shared';
import { ContentAgentController } from './content-agent.controller';
import { ContentAgentService } from './content-agent.service';
import { ContentAgentProcessor } from './content-agent.processor';

@Module({
  imports: [BullModule.registerQueue({ name: JobName.GENERATE_CONTENT_IDEAS })],
  controllers: [ContentAgentController],
  providers: [ContentAgentService, ContentAgentProcessor],
  exports: [ContentAgentService],
})
export class ContentAgentModule {}
