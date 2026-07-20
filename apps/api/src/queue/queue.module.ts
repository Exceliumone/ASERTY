import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

/**
 * Central BullMQ connection registration (Redis connection + default job
 * options shared by every queue). Individual feature modules each call
 * `BullModule.registerQueue({ name })` for the specific queue(s) they
 * produce to or consume from — the standard NestJS/BullMQ pattern — while
 * this module guarantees they all share one Redis connection and retry
 * policy.
 */
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('redis.host'),
          port: config.get<number>('redis.port'),
          password: config.get<string>('redis.password') || undefined,
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: 500,
          removeOnFail: 1000,
        },
      }),
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
