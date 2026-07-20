import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TwitterApi } from 'twitter-api-v2';

export interface TweetMetrics {
  impressions: number;
  likes: number;
  reposts: number;
  replies: number;
  bookmarks: number;
}

export interface MentionItem {
  id: string;
  authorUsername: string;
  text: string;
}

/**
 * Thin wrapper around the official X API v2 client. Every call here is
 * queued through BullMQ by the callers (never invoked in a tight loop) so
 * the platform's rate limits are respected by construction.
 */
@Injectable()
export class TwitterService {
  private readonly logger = new Logger(TwitterService.name);
  private client: TwitterApi;

  constructor(private readonly config: ConfigService) {
    this.client = new TwitterApi({
      appKey: this.config.get<string>('x.apiKey') ?? '',
      appSecret: this.config.get<string>('x.apiSecret') ?? '',
      accessToken: this.config.get<string>('x.accessToken') ?? '',
      accessSecret: this.config.get<string>('x.accessTokenSecret') ?? '',
    });
  }

  async postTweet(content: string, mediaUrl?: string): Promise<string> {
    const rw = this.client.readWrite;
    let mediaId: string | undefined;

    if (mediaUrl) {
      const response = await fetch(mediaUrl);
      const buffer = Buffer.from(await response.arrayBuffer());
      mediaId = await rw.v1.uploadMedia(buffer, { mimeType: 'image/png' });
    }

    const tweet = await rw.v2.tweet({
      text: content,
      ...(mediaId ? { media: { media_ids: [mediaId] } } : {}),
    });

    this.logger.log(`Published tweet ${tweet.data.id}`);
    return tweet.data.id;
  }

  async fetchTweetMetrics(xTweetId: string): Promise<TweetMetrics> {
    const result = await this.client.readOnly.v2.singleTweet(xTweetId, {
      'tweet.fields': ['public_metrics'],
    });

    const metrics = result.data.public_metrics;
    return {
      impressions: metrics?.impression_count ?? 0,
      likes: metrics?.like_count ?? 0,
      reposts: metrics?.retweet_count ?? 0,
      replies: metrics?.reply_count ?? 0,
      bookmarks: metrics?.bookmark_count ?? 0,
    };
  }

  async fetchMentions(sinceId?: string): Promise<MentionItem[]> {
    const username = this.config.get<string>('x.username');
    if (!username) {
      this.logger.warn('PABLO_X_USERNAME is not configured, skipping mention fetch.');
      return [];
    }

    const user = await this.client.readOnly.v2.userByUsername(username);
    const mentions = await this.client.readOnly.v2.userMentionTimeline(user.data.id, {
      since_id: sinceId,
      'tweet.fields': ['author_id', 'text'],
      expansions: ['author_id'],
    });

    const authorsById = new Map(
      (mentions.includes?.users ?? []).map((u) => [u.id, u.username]),
    );

    return mentions.data.data?.map((tweet) => ({
      id: tweet.id,
      authorUsername: authorsById.get(tweet.author_id ?? '') ?? 'unknown',
      text: tweet.text,
    })) ?? [];
  }
}
