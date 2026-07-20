import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PromptRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromptVersionDto } from './dto/create-prompt.dto';

/**
 * Versioned prompt store: every agent role owns an independent history of
 * prompt versions. Only one version per role is "active" at a time, and
 * that is the version agents actually use at inference time.
 */
@Injectable()
export class PromptsService {
  private readonly logger = new Logger(PromptsService.name);
  private activeCache = new Map<PromptRole, string>();

  constructor(private readonly prisma: PrismaService) {}

  async getActivePrompt(role: PromptRole): Promise<string> {
    if (this.activeCache.has(role)) {
      return this.activeCache.get(role)!;
    }
    const active = await this.prisma.promptTemplate.findFirst({
      where: { role, isActive: true },
      orderBy: { version: 'desc' },
    });
    if (!active) {
      throw new NotFoundException(`Aucun prompt actif pour le rôle ${role}.`);
    }
    this.activeCache.set(role, active.content);
    return active.content;
  }

  async listByRole(role: PromptRole) {
    return this.prisma.promptTemplate.findMany({ where: { role }, orderBy: { version: 'desc' } });
  }

  async createVersion(dto: CreatePromptVersionDto) {
    const latest = await this.prisma.promptTemplate.findFirst({
      where: { role: dto.role },
      orderBy: { version: 'desc' },
    });
    const nextVersion = (latest?.version ?? 0) + 1;

    const created = await this.prisma.$transaction(async (tx) => {
      await tx.promptTemplate.updateMany({
        where: { role: dto.role, isActive: true },
        data: { isActive: false },
      });
      return tx.promptTemplate.create({
        data: {
          role: dto.role,
          version: nextVersion,
          title: dto.title,
          content: dto.content,
          changelog: dto.changelog,
          isActive: true,
        },
      });
    });

    this.activeCache.delete(dto.role);
    this.logger.log(`Prompt ${dto.role} bumped to v${nextVersion}.`);
    return created;
  }

  async activateVersion(role: PromptRole, version: number) {
    const target = await this.prisma.promptTemplate.findUnique({
      where: { role_version: { role, version } },
    });
    if (!target) {
      throw new NotFoundException(`Prompt ${role} v${version} introuvable.`);
    }
    await this.prisma.$transaction([
      this.prisma.promptTemplate.updateMany({ where: { role, isActive: true }, data: { isActive: false } }),
      this.prisma.promptTemplate.update({ where: { id: target.id }, data: { isActive: true } }),
    ]);
    this.activeCache.delete(role);
    return target;
  }
}
