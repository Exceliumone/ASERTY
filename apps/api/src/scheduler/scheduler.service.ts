import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Queue } from 'bullmq';
import { JobName } from '@pablo/shared';
import { CalendarService } from '../calendar/calendar.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * The 24/7 heartbeat of the platform. Runs on the VPS via PM2/Docker and
 * drives every recurring agent job: publishing due tweets, refreshing
 * metrics, scanning trends, running analytics, and generating fresh content
 * ideas — so the system keeps operating without manual triggers.
 */
@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly calendarService: CalendarService,
    private readonly prisma: PrismaService,
    @InjectQueue(JobName.PUBLISH_TWEET) private readonly publishQueue: Queue,
    @InjectQueue(JobName.FETCH_TWEET_METRICS) private readonly metricsQueue: Queue,
    @InjectQueue(JobName.FETCH_MENTIONS) private readonly mentionsQueue: Queue,
    @InjectQueue(JobName.SCAN_TRENDS) private readonly trendsQueue: Queue,
    @InjectQueue(JobName.ANALYZE_PERFORMANCE) private readonly analyticsQueue: Queue,
    @InjectQueue(JobName.GENERATE_CONTENT_IDEAS) private readonly contentQueue: Queue,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async publishDueTweets() {
    const due = await this.calendarService.listDue(new Date());
    for (const entry of due) {
      await this.publishQueue.add(JobName.PUBLISH_TWEET, { tweetId: entry.tweetId });
      this.logger.log(`Enqueued publish job for tweet ${entry.tweetId}.`);
    }
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async refreshMetrics() {
    const published = await this.prisma.tweet.findMany({
      where: { status: 'PUBLISHED', xTweetId: { not: null } },
      orderBy: { publishedAt: 'desc' },
      take: 50,
    });
    for (const tweet of published) {
      await this.metricsQueue.add(JobName.FETCH_TWEET_METRICS, { tweetId: tweet.id });
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async pollMentions() {
    await this.mentionsQueue.add(JobName.FETCH_MENTIONS, {});
  }

  @Cron(CronExpression.EVERY_4_HOURS)
  async scanTrends() {
    await this.trendsQueue.add(JobName.SCAN_TRENDS, {});
  }

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async runAnalytics() {
    await this.analyticsQueue.add(JobName.ANALYZE_PERFORMANCE, {});
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async generateDailyContentIdeas() {
    await this.contentQueue.add(JobName.GENERATE_CONTENT_IDEAS, { count: 5 });
  }
}
