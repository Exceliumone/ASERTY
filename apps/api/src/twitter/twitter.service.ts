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
 *
 * The client is built lazily: without X credentials configured, the app
 * still boots normally and every agent keeps working in "draft-only" mode —
 * only an actual publish/fetch attempt fails, with a clear error.
 */
@Injectable()
export class TwitterService {
  private readonly logger = new Logger(TwitterService.name);
  private client: TwitterApi | null = null;

  constructor(private readonly config: ConfigService) {}

  private getClient(): TwitterApi {
    if (this.client) {
      return this.client;
    }

    const appKey = this.config.get<string>('x.apiKey');
    const appSecret = this.config.get<string>('x.apiSecret');
    const accessToken = this.config.get<string>('x.accessToken');
    const accessSecret = this.config.get<string>('x.accessTokenSecret');

    if (!appKey || !appSecret || !accessToken || !accessSecret) {
      throw new Error(
        "Clés API X non configurées : impossible de publier ou de lire les métriques. Renseignez X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN et X_ACCESS_TOKEN_SECRET.",
      );
    }

    this.client = new TwitterApi({ appKey, appSecret, accessToken, accessSecret });
    return this.client;
  }

  async postTweet(content: string, mediaUrl?: string): Promise<string> {
    const rw = this.getClient().readWrite;
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
    const result = await this.getClient().readOnly.v2.singleTweet(xTweetId, {
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

    const client = this.getClient();
    const user = await client.readOnly.v2.userByUsername(username);
    const mentions = await client.readOnly.v2.userMentionTimeline(user.data.id, {
      since_id: sinceId,
      'tweet.fields': ['author_id', 'text'],
      expansions: ['author_id'],
    });

    const authorsById = new Map(
      (mentions.includes?.users ?? []).map((u) => [u.id, u.username]),
    );

    return (
      mentions.data.data?.map((tweet) => ({
        id: tweet.id,
        authorUsername: authorsById.get(tweet.author_id ?? '') ?? 'unknown',
        text: tweet.text,
      })) ?? []
    );
  }
}
