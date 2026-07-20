import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomInt } from 'crypto';
import { OpenAiService } from '../openai/openai.service';

export interface ImageGenerationResult {
  url: string;
  b64?: string;
}

/**
 * Resolves image generation to whichever provider is configured
 * (`IMAGE_PROVIDER`): the OpenAI-compatible image model, or Pollinations.ai —
 * a free, keyless image API — so the Image Agent never has to know which
 * backend actually rendered the scene.
 */
@Injectable()
export class ImageProviderService {
  private readonly logger = new Logger(ImageProviderService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly openAi: OpenAiService,
  ) {}

  async generateImage(prompt: string): Promise<ImageGenerationResult> {
    const provider = this.config.get<string>('images.provider');

    if (provider === 'pollinations') {
      return this.generateWithPollinations(prompt);
    }

    return this.openAi.generateImage(prompt);
  }

  private async generateWithPollinations(prompt: string): Promise<ImageGenerationResult> {
    const seed = randomInt(1_000_000_000);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${seed}`;

    this.logger.log('Generating image via Pollinations.ai (free provider).');
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Pollinations.ai a renvoyé une erreur HTTP ${response.status}.`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    return { url: '', b64: buffer.toString('base64') };
  }
}
