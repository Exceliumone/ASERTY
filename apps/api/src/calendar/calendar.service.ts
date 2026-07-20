import { Injectable, NotFoundException } from '@nestjs/common';
import { TweetStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ScheduleTweetDto } from './dto/schedule-tweet.dto';

@Injectable()
export class CalendarService {
  constructor(private readonly prisma: PrismaService) {}

  async schedule(dto: ScheduleTweetDto) {
    const tweet = await this.prisma.tweet.findUnique({ where: { id: dto.tweetId } });
    if (!tweet) {
      throw new NotFoundException('Tweet introuvable.');
    }

    const scheduledAt = new Date(dto.scheduledAt);

    return this.prisma.$transaction(async (tx) => {
      await tx.tweet.update({ where: { id: dto.tweetId }, data: { status: TweetStatus.SCHEDULED, scheduledAt } });
      return tx.calendarEntry.upsert({
        where: { tweetId: dto.tweetId },
        update: { scheduledAt, notes: dto.notes, status: TweetStatus.SCHEDULED },
        create: { tweetId: dto.tweetId, scheduledAt, notes: dto.notes, status: TweetStatus.SCHEDULED },
      });
    });
  }

  async reschedule(id: string, scheduledAt: string) {
    const entry = await this.prisma.calendarEntry.findUnique({ where: { id } });
    if (!entry) {
      throw new NotFoundException('Entrée du calendrier introuvable.');
    }
    const newDate = new Date(scheduledAt);
    return this.prisma.$transaction(async (tx) => {
      await tx.tweet.update({ where: { id: entry.tweetId }, data: { scheduledAt: newDate } });
      return tx.calendarEntry.update({ where: { id }, data: { scheduledAt: newDate } });
    });
  }

  async unschedule(id: string) {
    const entry = await this.prisma.calendarEntry.findUnique({ where: { id } });
    if (!entry) {
      throw new NotFoundException('Entrée du calendrier introuvable.');
    }
    return this.prisma.$transaction(async (tx) => {
      await tx.tweet.update({ where: { id: entry.tweetId }, data: { status: TweetStatus.DRAFT, scheduledAt: null } });
      return tx.calendarEntry.delete({ where: { id } });
    });
  }

  async listRange(from: Date, to: Date) {
    return this.prisma.calendarEntry.findMany({
      where: { scheduledAt: { gte: from, lte: to } },
      include: { tweet: { include: { images: true } } },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async listDue(before: Date) {
    return this.prisma.calendarEntry.findMany({
      where: { scheduledAt: { lte: before }, status: TweetStatus.SCHEDULED },
    });
  }
}
