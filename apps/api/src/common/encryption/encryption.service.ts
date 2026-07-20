import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export interface EncryptedPayload {
  encryptedValue: string;
  iv: string;
  authTag: string;
}

/**
 * AES-256-GCM at-rest encryption for third-party API credentials (X keys,
 * OpenAI key overrides, ...). The 32-byte key comes from ENCRYPTION_KEY and
 * never leaves this service.
 */
@Injectable()
export class EncryptionService implements OnModuleInit {
  private key!: Buffer;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const hexKey = this.config.get<string>('security.encryptionKey');
    if (!hexKey || hexKey.length !== 64) {
      throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes).');
    }
    this.key = Buffer.from(hexKey, 'hex');
  }

  encrypt(plainText: string): EncryptedPayload {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
    return {
      encryptedValue: encrypted.toString('hex'),
      iv: iv.toString('hex'),
      authTag: cipher.getAuthTag().toString('hex'),
    };
  }

  decrypt(payload: EncryptedPayload): string {
    const decipher = createDecipheriv('aes-256-gcm', this.key, Buffer.from(payload.iv, 'hex'));
    decipher.setAuthTag(Buffer.from(payload.authTag, 'hex'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(payload.encryptedValue, 'hex')),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  }
}
