import { Module } from '@nestjs/common';
import { OpenAiModule } from './openai/openai.module';
import { ImageProviderModule } from './image-provider/image-provider.module';
import { DecisionLogModule } from './decision-log/decision-log.module';
import { MemoryStoreModule } from './memory-store/memory-store.module';
import { ContentAgentModule } from './content-agent/content-agent.module';
import { TrendAgentModule } from './trend-agent/trend-agent.module';
import { AnalyticsAgentModule } from './analytics-agent/analytics-agent.module';
import { CommunityAgentModule } from './community-agent/community-agent.module';
import { ImageAgentModule } from './image-agent/image-agent.module';

/**
 * Aggregates the five specialized agents (Content, Trend, Analytics,
 * Community, Image) plus their shared infrastructure (OpenAI-compatible
 * text client, image provider, decision log, anti-duplication memory store).
 */
@Module({
  imports: [
    OpenAiModule,
    ImageProviderModule,
    DecisionLogModule,
    MemoryStoreModule,
    ContentAgentModule,
    TrendAgentModule,
    AnalyticsAgentModule,
    CommunityAgentModule,
    ImageAgentModule,
  ],
})
export class AgentsModule {}
