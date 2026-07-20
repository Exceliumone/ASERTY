import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../common/encryption/encryption.service';
import { UpsertCredentialDto } from './dto/upsert-credential.dto';

/**
 * Manages third-party API credentials (X, OpenAI, ...) encrypted at rest.
 * Decrypted values are never returned by the API — only metadata (provider,
 * label, last update) so the frontend can show "configured" state safely.
 */
@Injectable()
export class CredentialsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
  ) {}

  async list() {
    const credentials = await this.prisma.apiCredential.findMany({
      select: { id: true, provider: true, label: true, isActive: true, updatedAt: true },
      orderBy: { provider: 'asc' },
    });
    return credentials;
  }

  async upsert(dto: UpsertCredentialDto) {
    const { encryptedValue, iv, authTag } = this.encryption.encrypt(dto.value);

    const credential = await this.prisma.apiCredential.upsert({
      where: { provider_label: { provider: dto.provider, label: dto.label } },
      update: { encryptedValue, iv, authTag, isActive: true },
      create: { provider: dto.provider, label: dto.label, encryptedValue, iv, authTag },
    });

    return { id: credential.id, provider: credential.provider, label: credential.label };
  }

  async getDecryptedValue(provider: string, label: string): Promise<string | null> {
    const credential = await this.prisma.apiCredential.findUnique({
      where: { provider_label: { provider, label } },
    });
    if (!credential || !credential.isActive) return null;
    return this.encryption.decrypt({
      encryptedValue: credential.encryptedValue,
      iv: credential.iv,
      authTag: credential.authTag,
    });
  }

  async remove(id: string) {
    await this.prisma.apiCredential.delete({ where: { id } });
  }
}
