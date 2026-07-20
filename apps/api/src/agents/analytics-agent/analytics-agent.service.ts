import { Injectable, Logger } from '@nestjs/common';
import { AgentType, PromptRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PromptsService } from '../../prompts/prompts.service';
import { OpenAiService } from '../openai/openai.service';
import { DecisionLogService } from '../decision-log/decision-log.service';

interface AnalyticsAgentResult {
  insights: { kind: string; label: string; score: number }[];
  recommendations: { recommendation: string; reasoning: string; metricsUsed: string[] }[];
}

/**
 * Analytics Agent — aggregates raw engagement snapshots into computed
 * metrics (best posting hour, top hashtags/topics/formats), then asks the
 * model for a short list of justified, actionable recommendations.
 */
@Injectable()
export class AnalyticsAgentService {
  private readonly logger = new Logger(AnalyticsAgentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly prompts: PromptsService,
    private readonly openAi: OpenAiService,
    private readonly decisionLog: DecisionLogService,
  ) {}

  async computeBestPostingHour() {
    const snapshots = await this.prisma.analyticsSnapshot.findMany({
      where: { tweetId: { not: null } },
      include: { tweet: true },
    });

    const engagementByHour = new Map<number, { total: number; count: number }>();
    for (const snapshot of snapshots) {
      const publishedAt = snapshot.tweet?.publishedAt;
      if (!publishedAt) continue;
      const hour = publishedAt.getUTCHours();
      const entry = engagementByHour.get(hour) ?? { total: 0, count: 0 };
      entry.total += snapshot.engagementRate;
      entry.count += 1;
      engagementByHour.set(hour, entry);
    }

    let bestHour = 0;
    let bestAvg = -1;
    for (const [hour, entry] of engagementByHour) {
      const avg = entry.total / entry.count;
      if (avg > bestAvg) {
        bestAvg = avg;
        bestHour = hour;
      }
    }

    return { bestHour, averageEngagementRate: bestAvg === -1 ? 0 : bestAvg, sampleSize: snapshots.length };
  }

  async analyzePerformance() {
    const [promptTemplate, bestHour, topSnapshots] = await Promise.all([
      this.prompts.getActivePrompt(PromptRole.ANALYTICS_AGENT),
      this.computeBestPostingHour(),
      this.prisma.analyticsSnapshot.findMany({
        orderBy: { engagementRate: 'desc' },
        take: 15,
        include: { tweet: true },
      }),
    ]);

    const metricsDigest = topSnapshots
      .map(
        (s) =>
          `Tweet "${s.tweet?.content?.slice(0, 60) ?? 'n/a'}" — impressions:${s.impressions} likes:${s.likes} reposts:${s.reposts} engagement:${(s.engagementRate * 100).toFixed(2)}% thèmes:${s.tweet?.themes.join(',') ?? ''} hashtags:${s.tweet?.hashtags.join(',') ?? ''}`,
      )
      .join('\n');

    const userPrompt = [
      `Meilleure heure de publication observée (UTC): ${bestHour.bestHour}h (engagement moyen ${(bestHour.averageEngagementRate * 100).toFixed(2)}%, échantillon ${bestHour.sampleSize}).`,
      `Top publications par engagement:\n${metricsDigest || 'Pas encore assez de données.'}`,
    ].join('\n\n');

    const result = await this.openAi.completeJson<AnalyticsAgentResult>({
      systemPrompt: promptTemplate,
      userPrompt,
      temperature: 0.4,
    });

    await this.prisma.analyticsInsight.create({
      data: { kind: 'best_hour', label: `${bestHour.bestHour}h UTC`, score: bestHour.averageEngagementRate },
    });

    for (const insight of result.insights ?? []) {
      await this.prisma.analyticsInsight.create({
        data: { kind: insight.kind, label: insight.label, score: insight.score },
      });
    }

    for (const rec of result.recommendations ?? []) {
      await this.decisionLog.record({
        agentType: AgentType.ANALYTICS,
        action: 'recommend_improvement',
        reasoning: `${rec.recommendation} — ${rec.reasoning}`,
        metricsUsed: rec.metricsUsed,
      });
    }

    this.logger.log(`Analytics run complete: ${result.recommendations?.length ?? 0} recommendation(s).`);
    return { bestHour, insights: result.insights, recommendations: result.recommendations };
  }
}
