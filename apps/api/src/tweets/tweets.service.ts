import { Injectable, NotFoundException } from '@nestjs/common';
import { TweetStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateTweetDto } from './dto/update-tweet.dto';

@Injectable()
export class TweetsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(status?: TweetStatus) {
    return this.prisma.tweet.findMany({
      where: status ? { status } : undefined,
      include: { images: true, calendarEntry: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const tweet = await this.prisma.tweet.findUnique({
      where: { id },
      include: { images: true, calendarEntry: true, analytics: true, decisionLogs: true },
    });
    if (!tweet) {
      throw new NotFoundException('Tweet introuvable.');
    }
    return tweet;
  }

  async update(id: string, dto: UpdateTweetDto) {
    await this.findOne(id);
    return this.prisma.tweet.update({ where: { id }, data: dto });
  }

  async archive(id: string) {
    await this.findOne(id);
    return this.prisma.tweet.update({ where: { id }, data: { status: TweetStatus.ARCHIVED } });
  }
}
