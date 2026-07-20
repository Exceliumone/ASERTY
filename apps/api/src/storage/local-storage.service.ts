import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

const UPLOADS_ROOT = join(process.cwd(), 'uploads');
const IMAGES_DIR = join(UPLOADS_ROOT, 'images');

/**
 * Minimal local-disk storage for generated assets, served statically by
 * Nginx/Express under /uploads. Swappable for S3-compatible storage later
 * by re-implementing this single service.
 */
@Injectable()
export class LocalStorageService {
  private readonly logger = new Logger(LocalStorageService.name);

  async saveBase64Image(base64: string): Promise<{ storageKey: string; url: string }> {
    await fs.mkdir(IMAGES_DIR, { recursive: true });
    const storageKey = `${randomUUID()}.png`;
    const filePath = join(IMAGES_DIR, storageKey);
    await fs.writeFile(filePath, Buffer.from(base64, 'base64'));
    this.logger.log(`Stored generated image at ${filePath}`);
    return { storageKey, url: `/uploads/images/${storageKey}` };
  }
}
