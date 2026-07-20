import { Injectable, Logger } from '@nestjs/common';
import { AgentType, PromptRole, ReplyStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PabloMemoryService } from '../../pablo-memory/pablo-memory.service';
import { PromptsService } from '../../prompts/prompts.service';
import { OpenAiService } from '../openai/openai.service';
import { DecisionLogService } from '../decision-log/decision-log.service';
import { SuggestReplyDto } from './dto/suggest-reply.dto';

interface CommunityAgentResult {
  suggestedReply: string | null;
  sensitiveFlag: boolean;
  flagReason: string | null;
  reasoning: string;
}

/**
 * Community Agent — drafts in-character reply suggestions to comments, and
 * flags anything sensitive for mandatory human review instead of guessing.
 */
@Injectable()
export class CommunityAgentService {
  private readonly logger = new Logger(CommunityAgentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pabloMemory: PabloMemoryService,
    private readonly prompts: PromptsService,
    private readonly openAi: OpenAiService,
    private readonly decisionLog: DecisionLogService,
  ) {}

  async suggestReply(dto: SuggestReplyDto) {
    const [identityPrimer, promptTemplate] = await Promise.all([
      this.pabloMemory.buildIdentityPrimer(),
      this.prompts.getActivePrompt(PromptRole.COMMUNITY_AGENT),
    ]);

    const result = await this.openAi.completeJson<CommunityAgentResult>({
      systemPrompt: `${identityPrimer}\n\n${promptTemplate}`,
      userPrompt: `Auteur: @${dto.originalAuthor}\nMessage: "${dto.originalText}"`,
      temperature: 0.7,
    });

    const status = result.sensitiveFlag ? ReplyStatus.FLAGGED : ReplyStatus.SUGGESTED;

    const reply = await this.prisma.communityReply.upsert({
      where: { originalMessageId: dto.originalMessageId },
      update: {
        suggestedReply: result.suggestedReply ?? '',
        sensitiveFlag: result.sensitiveFlag,
        flagReason: result.flagReason ?? undefined,
        status,
      },
      create: {
        originalMessageId: dto.originalMessageId,
        originalAuthor: dto.originalAuthor,
        originalText: dto.originalText,
        suggestedReply: result.suggestedReply ?? '',
        sensitiveFlag: result.sensitiveFlag,
        flagReason: result.flagReason ?? undefined,
        status,
      },
    });

    await this.decisionLog.record({
      agentType: AgentType.COMMUNITY,
      action: result.sensitiveFlag ? 'flag_for_review' : 'suggest_reply',
      reasoning: result.reasoning,
      metricsUsed: ['message_sentiment', 'sensitivity_guardrails'],
    });

    if (result.sensitiveFlag) {
      this.logger.warn(`Message ${dto.originalMessageId} flagged for manual review: ${result.flagReason}`);
    }

    return reply;
  }

  async listPendingReview() {
    return this.prisma.communityReply.findMany({
      where: { status: { in: [ReplyStatus.SUGGESTED, ReplyStatus.FLAGGED] } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approve(id: string, userId: string) {
    return this.prisma.communityReply.update({
      where: { id },
      data: { status: ReplyStatus.APPROVED, approvedById: userId },
    });
  }

  async dismiss(id: string) {
    return this.prisma.communityReply.update({
      where: { id },
      data: { status: ReplyStatus.DISMISSED },
    });
  }
}
