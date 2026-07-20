import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JobName } from '@pablo/shared';
import { ImageAgentController } from './image-agent.controller';
import { ImageAgentService } from './image-agent.service';
import { ImageAgentProcessor } from './image-agent.processor';

@Module({
  imports: [BullModule.registerQueue({ name: JobName.GENERATE_IMAGE })],
  controllers: [ImageAgentController],
  providers: [ImageAgentService, ImageAgentProcessor],
  exports: [ImageAgentService],
})
export class ImageAgentModule {}
