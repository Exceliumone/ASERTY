import { Injectable } from '@nestjs/common';
import { AgentType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface RecordDecisionParams {
  agentType: AgentType;
  action: string;
  reasoning: string;
  metricsUsed?: string[];
  relatedTweetId?: string;
}

/**
 * Explainability log: every non-trivial agent decision (why a topic was
 * proposed, why a tweet is recommended, which metrics drove a
 * recommendation) is persisted here as a plain-language business
 * justification — never raw model chain-of-thought.
 */
@Injectable()
export class DecisionLogService {
  constructor(private readonly prisma: PrismaService) {}

  async record(params: RecordDecisionParams) {
    return this.prisma.agentDecisionLog.create({
      data: {
        agentType: params.agentType,
        action: params.action,
        reasoning: params.reasoning,
        metricsUsed: params.metricsUsed ?? [],
        relatedTweetId: params.relatedTweetId,
      },
    });
  }

  async listRecent(limit = 50) {
    return this.prisma.agentDecisionLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
