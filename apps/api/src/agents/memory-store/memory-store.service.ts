import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type MemoryItemKind = 'theme' | 'expression' | 'hashtag' | 'scenario';

/**
 * Anti-duplication memory backed by `UsedMemoryItem`. The Content Agent and
 * Image Agent consult this before generating new material so Pablo doesn't
 * repeat the same theme, expression, hashtag or visual scenario too often.
 */
@Injectable()
export class MemoryStoreService {
  constructor(private readonly prisma: PrismaService) {}

  async getRecentlyUsed(kind: MemoryItemKind, limit = 30): Promise<string[]> {
    const items = await this.prisma.usedMemoryItem.findMany({
      where: { kind },
      orderBy: { lastUsedAt: 'desc' },
      take: limit,
    });
    return items.map((item) => item.value);
  }

  async recordUsage(kind: MemoryItemKind, values: string[]): Promise<void> {
    for (const value of values) {
      if (!value) continue;
      await this.prisma.usedMemoryItem.upsert({
        where: { kind_value: { kind, value } },
        update: { usageCount: { increment: 1 }, lastUsedAt: new Date() },
        create: { kind, value },
      });
    }
  }
}
