import { PabloMemoryService } from './pablo-memory.service';
import { PrismaService } from '../prisma/prisma.service';
import { defaultPabloMemory } from './data/pablo-memory.default';

describe('PabloMemoryService', () => {
  let service: PabloMemoryService;
  let prisma: {
    pabloMemoryVersion: { findFirst: jest.Mock; updateMany: jest.Mock; create: jest.Mock };
    $transaction: jest.Mock;
  };

  beforeEach(() => {
    prisma = {
      pabloMemoryVersion: {
        findFirst: jest.fn(),
        updateMany: jest.fn(),
        create: jest.fn(),
      },
      $transaction: jest.fn(async (ops) => Promise.all(ops)),
    };
    service = new PabloMemoryService(prisma as unknown as PrismaService);
  });

  it('falls back to the bundled default memory when no active version exists', async () => {
    prisma.pabloMemoryVersion.findFirst.mockResolvedValue(null);

    const memory = await service.getActiveMemory();

    expect(memory.identity.name).toBe('Pablo');
  });

  it('caches the active memory after the first read', async () => {
    prisma.pabloMemoryVersion.findFirst.mockResolvedValue({ version: 1, data: defaultPabloMemory });

    await service.getActiveMemory();
    await service.getActiveMemory();

    expect(prisma.pabloMemoryVersion.findFirst).toHaveBeenCalledTimes(1);
  });

  it('builds an identity primer that includes forbidden words as guardrails', async () => {
    prisma.pabloMemoryVersion.findFirst.mockResolvedValue({ version: 1, data: defaultPabloMemory });

    const primer = await service.buildIdentityPrimer();

    expect(primer).toContain('Pablo');
    expect(primer).toContain(defaultPabloMemory.vocabulary.forbiddenWords[0]);
  });
});
