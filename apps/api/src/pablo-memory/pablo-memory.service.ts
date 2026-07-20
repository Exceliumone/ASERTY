import { Injectable, Logger } from '@nestjs/common';
import { PabloMemory } from '@pablo/shared';
import { PrismaService } from '../prisma/prisma.service';
import { defaultPabloMemory } from './data/pablo-memory.default';

/**
 * Single source of truth for Pablo's identity. Every content-producing
 * agent (Content, Trend, Community, Image) must call `getActiveMemory()`
 * before calling OpenAI so the character never drifts.
 */
@Injectable()
export class PabloMemoryService {
  private readonly logger = new Logger(PabloMemoryService.name);
  private cache: { version: number; data: PabloMemory } | null = null;

  constructor(private readonly prisma: PrismaService) {}

  async getActiveMemory(): Promise<PabloMemory> {
    if (this.cache) {
      return this.cache.data;
    }

    const active = await this.prisma.pabloMemoryVersion.findFirst({
      where: { isActive: true },
      orderBy: { version: 'desc' },
    });

    if (!active) {
      this.logger.warn('No active Pablo memory version found, falling back to default bundle.');
      return defaultPabloMemory;
    }

    this.cache = { version: active.version, data: active.data as unknown as PabloMemory };
    return this.cache.data;
  }

  /** Builds the system-prompt fragment injected before every agent prompt. */
  async buildIdentityPrimer(): Promise<string> {
    const memory = await this.getActiveMemory();
    return [
      `Tu es ${memory.identity.name}, ${memory.identity.species}. ${memory.identity.biography}`,
      `Ton ton: ${memory.personality.tone}. Traits: ${memory.personality.traits.join(', ')}.`,
      `Style d'humour: ${memory.personality.humorStyle.join(', ')}.`,
      `Expressions signature à réutiliser avec parcimonie: ${memory.vocabulary.signatureExpressions.join(', ')}.`,
      `Hashtags de base: ${memory.vocabulary.hashtagsCore.join(', ')}.`,
      `Mots et sujets STRICTEMENT interdits: ${[...memory.vocabulary.forbiddenWords, ...memory.vocabulary.forbiddenTopics].join(', ')}.`,
      `Thèmes favoris: ${memory.themes.favoriteTopics.join(', ')}.`,
    ].join('\n');
  }

  async listVersions() {
    return this.prisma.pabloMemoryVersion.findMany({ orderBy: { version: 'desc' } });
  }

  async createVersion(data: PabloMemory, changelog?: string) {
    const latest = await this.prisma.pabloMemoryVersion.findFirst({ orderBy: { version: 'desc' } });
    const nextVersion = (latest?.version ?? 0) + 1;

    await this.prisma.$transaction([
      this.prisma.pabloMemoryVersion.updateMany({ data: { isActive: false }, where: { isActive: true } }),
      this.prisma.pabloMemoryVersion.create({
        data: { version: nextVersion, data: data as any, isActive: true, changelog },
      }),
    ]);

    this.cache = null;
    this.logger.log(`Pablo memory bumped to v${nextVersion}.`);
    return this.getActiveMemory();
  }

  async activateVersion(version: number) {
    const target = await this.prisma.pabloMemoryVersion.findUnique({ where: { version } });
    if (!target) {
      throw new Error(`Pablo memory version ${version} introuvable.`);
    }
    await this.prisma.$transaction([
      this.prisma.pabloMemoryVersion.updateMany({ data: { isActive: false }, where: { isActive: true } }),
      this.prisma.pabloMemoryVersion.update({ where: { id: target.id }, data: { isActive: true } }),
    ]);
    this.cache = null;
  }
}
