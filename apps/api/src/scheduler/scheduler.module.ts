import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { JobName } from '@pablo/shared';
import { CalendarModule } from '../calendar/calendar.module';
import { SchedulerService } from './scheduler.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CalendarModule,
    BullModule.registerQueue(
      { name: JobName.PUBLISH_TWEET },
      { name: JobName.FETCH_TWEET_METRICS },
      { name: JobName.FETCH_MENTIONS },
      { name: JobName.SCAN_TRENDS },
      { name: JobName.ANALYZE_PERFORMANCE },
      { name: JobName.GENERATE_CONTENT_IDEAS },
    ),
  ],
  providers: [SchedulerService],
})
export class SchedulerModule {}
