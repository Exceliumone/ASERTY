import { MemoryStoreService } from './memory-store.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('MemoryStoreService', () => {
  let service: MemoryStoreService;
  let prisma: {
    usedMemoryItem: { findMany: jest.Mock; upsert: jest.Mock };
  };

  beforeEach(() => {
    prisma = {
      usedMemoryItem: {
        findMany: jest.fn(),
        upsert: jest.fn(),
      },
    };
    service = new MemoryStoreService(prisma as unknown as PrismaService);
  });

  describe('getRecentlyUsed', () => {
    it('returns only the value field, most recently used first', async () => {
      prisma.usedMemoryItem.findMany.mockResolvedValue([
        { value: 'trash to treasure' },
        { value: 'GM raton' },
      ]);

      const result = await service.getRecentlyUsed('expression');

      expect(result).toEqual(['trash to treasure', 'GM raton']);
      expect(prisma.usedMemoryItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { kind: 'expression' }, orderBy: { lastUsedAt: 'desc' } }),
      );
    });
  });

  describe('recordUsage', () => {
    it('upserts every non-empty value and skips empty strings', async () => {
      await service.recordUsage('hashtag', ['#Pablo', '', '#Solana']);

      expect(prisma.usedMemoryItem.upsert).toHaveBeenCalledTimes(2);
      expect(prisma.usedMemoryItem.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ where: { kind_value: { kind: 'hashtag', value: '#Pablo' } } }),
      );
    });
  });
});
