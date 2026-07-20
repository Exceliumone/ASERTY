import { NotFoundException } from '@nestjs/common';
import { PromptRole } from '@prisma/client';
import { PromptsService } from './prompts.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PromptsService', () => {
  let service: PromptsService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      promptTemplate: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        updateMany: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn(async (fn: any) => (typeof fn === 'function' ? fn(prisma) : Promise.all(fn))),
    };
    service = new PromptsService(prisma as unknown as PrismaService);
  });

  describe('getActivePrompt', () => {
    it('throws NotFoundException when no active prompt exists for the role', async () => {
      prisma.promptTemplate.findFirst.mockResolvedValue(null);

      await expect(service.getActivePrompt(PromptRole.CONTENT_AGENT)).rejects.toThrow(NotFoundException);
    });

    it('caches the active prompt content after the first lookup', async () => {
      prisma.promptTemplate.findFirst.mockResolvedValue({ content: 'system prompt v1' });

      const first = await service.getActivePrompt(PromptRole.CONTENT_AGENT);
      const second = await service.getActivePrompt(PromptRole.CONTENT_AGENT);

      expect(first).toBe('system prompt v1');
      expect(second).toBe('system prompt v1');
      expect(prisma.promptTemplate.findFirst).toHaveBeenCalledTimes(1);
    });
  });

  describe('createVersion', () => {
    it('increments the version number relative to the latest existing version', async () => {
      prisma.promptTemplate.findFirst.mockResolvedValue({ version: 3 });
      prisma.promptTemplate.create.mockResolvedValue({ version: 4 });

      const result = await service.createVersion({
        role: PromptRole.CONTENT_AGENT,
        title: 'Updated',
        content: 'new content',
      });

      expect(prisma.promptTemplate.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ version: 4, isActive: true }) }),
      );
      expect(result.version).toBe(4);
    });
  });
});
