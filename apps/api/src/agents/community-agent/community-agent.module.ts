import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JobName } from '@pablo/shared';
import { CommunityAgentController } from './community-agent.controller';
import { CommunityAgentService } from './community-agent.service';
import { CommunityAgentProcessor } from './community-agent.processor';

@Module({
  imports: [BullModule.registerQueue({ name: JobName.SUGGEST_REPLIES })],
  controllers: [CommunityAgentController],
  providers: [CommunityAgentService, CommunityAgentProcessor],
  exports: [CommunityAgentService],
})
export class CommunityAgentModule {}
