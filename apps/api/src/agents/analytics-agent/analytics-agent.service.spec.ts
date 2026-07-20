import { AnalyticsAgentService } from './analytics-agent.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PromptsService } from '../../prompts/prompts.service';
import { OpenAiService } from '../openai/openai.service';
import { DecisionLogService } from '../decision-log/decision-log.service';

describe('AnalyticsAgentService', () => {
  let service: AnalyticsAgentService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      analyticsSnapshot: { findMany: jest.fn(), aggregate: jest.fn() },
      analyticsInsight: { create: jest.fn() },
    };
    service = new AnalyticsAgentService(
      prisma as unknown as PrismaService,
      {} as PromptsService,
      {} as OpenAiService,
      { record: jest.fn() } as unknown as DecisionLogService,
    );
  });

  describe('computeBestPostingHour', () => {
    it('returns hour 0 with zero average when there is no data', async () => {
      prisma.analyticsSnapshot.findMany.mockResolvedValue([]);

      const result = await service.computeBestPostingHour();

      expect(result).toEqual({ bestHour: 0, averageEngagementRate: 0, sampleSize: 0 });
    });

    it('picks the hour with the highest average engagement rate', async () => {
      prisma.analyticsSnapshot.findMany.mockResolvedValue([
        { engagementRate: 0.1, tweet: { publishedAt: new Date(Date.UTC(2026, 0, 1, 9)) } },
        { engagementRate: 0.5, tweet: { publishedAt: new Date(Date.UTC(2026, 0, 2, 18)) } },
        { engagementRate: 0.3, tweet: { publishedAt: new Date(Date.UTC(2026, 0, 3, 18)) } },
      ]);

      const result = await service.computeBestPostingHour();

      expect(result.bestHour).toBe(18);
      expect(result.averageEngagementRate).toBeCloseTo(0.4);
      expect(result.sampleSize).toBe(3);
    });

    it('ignores snapshots whose tweet was never published', async () => {
      prisma.analyticsSnapshot.findMany.mockResolvedValue([
        { engagementRate: 0.9, tweet: { publishedAt: null } },
        { engagementRate: 0.2, tweet: { publishedAt: new Date(Date.UTC(2026, 0, 1, 6)) } },
      ]);

      const result = await service.computeBestPostingHour();

      expect(result.bestHour).toBe(6);
    });
  });
});
