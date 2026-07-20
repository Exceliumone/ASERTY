import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { JobName } from '@pablo/shared';
import { PrismaService } from '../prisma/prisma.service';
import { TwitterService } from './twitter.service';

/**
 * Rate-limit-aware BullMQ processors: publishing and metrics/mentions
 * polling all flow through these single-concurrency workers instead of
 * calling the X API directly from request handlers.
 */
@Processor(JobName.PUBLISH_TWEET, { concurrency: 1 })
export class PublishTweetProcessor extends WorkerHost {
  private readonly logger = new Logger(PublishTweetProcessor.name);

  constructor(
    private readonly twitterService: TwitterService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<{ tweetId: string }>) {
    const tweet = await this.prisma.tweet.findUniqueOrThrow({ where: { id: job.data.tweetId } });
    try {
      const image = await this.prisma.generatedImage.findFirst({ where: { linkedTweetId: tweet.id } });
      const xTweetId = await this.twitterService.postTweet(tweet.content, image?.url);
      await this.prisma.tweet.update({
        where: { id: tweet.id },
        data: { status: 'PUBLISHED', publishedAt: new Date(), xTweetId },
      });
      this.logger.log(`Tweet ${tweet.id} published as X tweet ${xTweetId}.`);
    } catch (error) {
      await this.prisma.tweet.update({
        where: { id: tweet.id },
        data: { status: 'FAILED', failureReason: (error as Error).message },
      });
      throw error;
    }
  }
}

@Processor(JobName.FETCH_TWEET_METRICS, { concurrency: 1 })
export class FetchMetricsProcessor extends WorkerHost {
  private readonly logger = new Logger(FetchMetricsProcessor.name);

  constructor(
    private readonly twitterService: TwitterService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<{ tweetId: string }>) {
    const tweet = await this.prisma.tweet.findUniqueOrThrow({ where: { id: job.data.tweetId } });
    if (!tweet.xTweetId) return;

    const metrics = await this.twitterService.fetchTweetMetrics(tweet.xTweetId);
    const engagementRate =
      metrics.impressions > 0
        ? (metrics.likes + metrics.reposts + metrics.replies) / metrics.impressions
        : 0;

    await this.prisma.analyticsSnapshot.create({
      data: {
        tweetId: tweet.id,
        impressions: metrics.impressions,
        likes: metrics.likes,
        reposts: metrics.reposts,
        replies: metrics.replies,
        bookmarks: metrics.bookmarks,
        engagementRate,
      },
    });
    this.logger.log(`Captured analytics snapshot for tweet ${tweet.id}.`);
  }
}

@Processor(JobName.FETCH_MENTIONS, { concurrency: 1 })
export class FetchMentionsProcessor extends WorkerHost {
  private readonly logger = new Logger(FetchMentionsProcessor.name);

  constructor(private readonly twitterService: TwitterService) {
    super();
  }

  async process(job: Job<{ sinceId?: string }>) {
    const mentions = await this.twitterService.fetchMentions(job.data.sinceId);
    this.logger.log(`Fetched ${mentions.length} mention(s).`);
    return mentions;
  }
}
