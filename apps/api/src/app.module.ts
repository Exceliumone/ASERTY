import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import configuration from './config/configuration';
import { validationSchema } from './config/validation';

import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { QueueModule } from './queue/queue.module';
import { EncryptionModule } from './common/encryption/encryption.module';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HealthModule } from './health/health.module';

import { PabloMemoryModule } from './pablo-memory/pablo-memory.module';
import { PromptsModule } from './prompts/prompts.module';
import { AgentsModule } from './agents/agents.module';
import { StorageModule } from './storage/storage.module';

import { TwitterModule } from './twitter/twitter.module';
import { TweetsModule } from './tweets/tweets.module';
import { CalendarModule } from './calendar/calendar.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SchedulerModule } from './scheduler/scheduler.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),

    // Core infrastructure
    PrismaModule,
    RedisModule,
    QueueModule,
    EncryptionModule,
    StorageModule,

    // Auth & users
    AuthModule,
    UsersModule,
    HealthModule,

    // Pablo identity & prompts
    PabloMemoryModule,
    PromptsModule,

    // AI agents
    AgentsModule,

    // X integration & content lifecycle
    TwitterModule,
    TweetsModule,
    CalendarModule,
    AnalyticsModule,

    // 24/7 orchestration
    SchedulerModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
