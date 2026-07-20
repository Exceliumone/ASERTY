import { Injectable, Logger } from '@nestjs/common';
import { AgentType, PromptRole, TrendSource } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PromptsService } from '../../prompts/prompts.service';
import { OpenAiService } from '../openai/openai.service';
import { DecisionLogService } from '../decision-log/decision-log.service';

interface TrendAgentResult {
  trends: {
    topic: string;
    source: string;
    score: number;
    summary: string;
    suggestedAngle: string;
  }[];
}

const KNOWN_SOURCES = new Set(Object.values(TrendSource));

/**
 * Trend Agent — turns raw market/culture signals into ranked, actionable
 * content angles for the Content Agent to pick up.
 */
@Injectable()
export class TrendAgentService {
  private readonly logger = new Logger(TrendAgentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly prompts: PromptsService,
    private readonly openAi: OpenAiService,
    private readonly decisionLog: DecisionLogService,
  ) {}

  async scanTrends(signals: string[] = []): Promise<void> {
    const promptTemplate = await this.prompts.getActivePrompt(PromptRole.TREND_AGENT);

    const userPrompt = signals.length
      ? `Signaux à analyser:\n${signals.map((s, i) => `${i + 1}. ${s}`).join('\n')}`
      : 'Aucun signal externe fourni: propose des sujets probables et intemporels pour la niche Solana/memecoin/Pump.fun.';

    const result = await this.openAi.completeJson<TrendAgentResult>({
      systemPrompt: promptTemplate,
      userPrompt,
      temperature: 0.6,
    });

    for (const trend of result.trends ?? []) {
      const source = KNOWN_SOURCES.has(trend.source as TrendSource)
        ? (trend.source as TrendSource)
        : TrendSource.CRYPTO;

      const created = await this.prisma.trendInsight.create({
        data: {
          source,
          topic: trend.topic,
          score: trend.score,
          summary: trend.summary,
          suggestedAngle: trend.suggestedAngle,
        },
      });

      await this.decisionLog.record({
        agentType: AgentType.TREND,
        action: 'detect_trend',
        reasoning: `${trend.summary} Angle proposé: ${trend.suggestedAngle}`,
        metricsUsed: ['external_signals', 'trend_score'],
      });

      this.logger.log(`Trend detected: ${created.topic} (score ${created.score})`);
    }
  }

  async listRecent(limit = 20) {
    return this.prisma.trendInsight.findMany({ orderBy: { detectedAt: 'desc' }, take: limit });
  }
}
