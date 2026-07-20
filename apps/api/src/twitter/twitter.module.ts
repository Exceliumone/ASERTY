import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JobName } from '@pablo/shared';
import { TwitterService } from './twitter.service';
import {
  PublishTweetProcessor,
  FetchMetricsProcessor,
  FetchMentionsProcessor,
} from './twitter.processor';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: JobName.PUBLISH_TWEET },
      { name: JobName.FETCH_TWEET_METRICS },
      { name: JobName.FETCH_MENTIONS },
    ),
  ],
  providers: [TwitterService, PublishTweetProcessor, FetchMetricsProcessor, FetchMentionsProcessor],
  exports: [TwitterService],
})
export class TwitterModule {}
