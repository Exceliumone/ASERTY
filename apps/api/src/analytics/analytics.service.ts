import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardKpis() {
    const [latestSnapshot, tweetsThisWeek, pendingSuggestions, bestHourInsight, avgEngagement] =
      await Promise.all([
        this.prisma.analyticsSnapshot.findFirst({ orderBy: { capturedAt: 'desc' } }),
        this.prisma.tweet.count({
          where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        }),
        this.prisma.tweet.count({ where: { status: 'SUGGESTED' } }),
        this.prisma.analyticsInsight.findFirst({ where: { kind: 'best_hour' }, orderBy: { computedAt: 'desc' } }),
        this.prisma.analyticsSnapshot.aggregate({ _avg: { engagementRate: true } }),
      ]);

    return {
      followersCount: latestSnapshot?.followersCount ?? 0,
      followersDelta7d: latestSnapshot?.followersDelta ?? 0,
      avgEngagementRate: avgEngagement._avg.engagementRate ?? 0,
      tweetsThisWeek,
      bestPostingHour: bestHourInsight ? parseInt(bestHourInsight.label, 10) || 0 : 0,
      pendingSuggestions,
    };
  }

  async getEngagementHistory(days = 30) {
    return this.prisma.analyticsSnapshot.findMany({
      where: { capturedAt: { gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) } },
      orderBy: { capturedAt: 'asc' },
    });
  }

  async getInsightsByKind(kind: string) {
    return this.prisma.analyticsInsight.findMany({ where: { kind }, orderBy: { computedAt: 'desc' }, take: 20 });
  }
}
