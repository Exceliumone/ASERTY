import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface JsonCompletionParams {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
}

/**
 * Thin, shared wrapper around the OpenAI SDK. All five agents go through
 * this single service so model selection, retries and JSON-parsing live in
 * one place instead of being duplicated per agent.
 *
 * `openai.baseUrl` lets this target any OpenAI-compatible provider (e.g.
 * Groq's free tier) instead of api.openai.com — the SDK and call sites never
 * change, only the configured endpoint/key/model do.
 */
@Injectable()
export class OpenAiService {
  private readonly logger = new Logger(OpenAiService.name);
  private client: OpenAI;

  constructor(private readonly config: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.config.get<string>('openai.apiKey'),
      baseURL: this.config.get<string>('openai.baseUrl'),
    });
  }

  async completeJson<T>(params: JsonCompletionParams): Promise<T> {
    const model = this.config.get<string>('openai.textModel')!;
    const response = await this.client.chat.completions.create({
      model,
      temperature: params.temperature ?? 0.8,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: params.systemPrompt },
        { role: 'user', content: params.userPrompt },
      ],
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) {
      throw new Error('OpenAI a renvoyé une réponse vide.');
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      this.logger.error(`Failed to parse OpenAI JSON response: ${raw}`);
      throw new Error("Réponse du modèle non conforme au format JSON attendu.");
    }
  }

  async generateImage(prompt: string): Promise<{ url: string; b64?: string }> {
    const model = this.config.get<string>('openai.imageModel')!;
    const response = await this.client.images.generate({
      model,
      prompt,
      size: '1024x1024',
      n: 1,
    });

    const image = response.data?.[0];
    if (!image) {
      throw new Error("La génération d'image n'a retourné aucun résultat.");
    }
    return { url: image.url ?? '', b64: image.b64_json };
  }
}
