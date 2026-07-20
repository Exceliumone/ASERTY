import { Injectable, Logger } from '@nestjs/common';
import { AgentType, PromptRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PabloMemoryService } from '../../pablo-memory/pablo-memory.service';
import { PromptsService } from '../../prompts/prompts.service';
import { OpenAiService } from '../openai/openai.service';
import { MemoryStoreService } from '../memory-store/memory-store.service';
import { DecisionLogService } from '../decision-log/decision-log.service';
import { LocalStorageService } from '../../storage/local-storage.service';
import { GenerateImageDto } from './dto/generate-image.dto';

interface ImageAgentResult {
  imagePrompt: string;
  scenario: string;
  reasoning: string;
}

const STYLE_DESCRIPTORS: Record<string, string> = {
  COMIC: 'style bande dessinée, contours encrés marqués, couleurs vives',
  THREE_D: 'rendu 3D moderne, éclairage studio, textures détaillées',
  PIXAR: "style animation 3D façon studio d'animation familial, rond et chaleureux",
  ANIME: 'style anime japonais, lignes nettes, ombrages cel-shading',
  CYBERPUNK: 'ambiance cyberpunk néon, futuriste, contrastes violets et cyans',
  PAINTING: 'peinture numérique, coups de pinceau visibles, ambiance artistique',
  REALISTIC: 'rendu photoréaliste, éclairage naturel, textures réalistes',
  MEME: 'style meme internet volontairement brut et exagéré',
  PIXEL_ART: 'pixel art rétro façon jeu vidéo 16-bit',
  VINTAGE: 'esthétique vintage, grain de pellicule, couleurs désaturées',
  NOIR: 'noir et blanc contrasté, ambiance film noir',
  SYNTHWAVE: 'esthétique synthwave, néons roses et violets, grille rétro-futuriste',
};

/**
 * Image Agent — turns a tweet/context into a fully-specified image prompt
 * that keeps Pablo's visual identity locked (same character, same face, same
 * proportions), only varying outfit/scene per the requested style.
 */
@Injectable()
export class ImageAgentService {
  private readonly logger = new Logger(ImageAgentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pabloMemory: PabloMemoryService,
    private readonly prompts: PromptsService,
    private readonly openAi: OpenAiService,
    private readonly memoryStore: MemoryStoreService,
    private readonly decisionLog: DecisionLogService,
    private readonly storage: LocalStorageService,
  ) {}

  async generateImage(dto: GenerateImageDto) {
    const memory = await this.pabloMemory.getActiveMemory();
    const promptTemplate = await this.prompts.getActivePrompt(PromptRole.IMAGE_AGENT);
    const recentScenarios = await this.memoryStore.getRecentlyUsed('scenario');

    const visualBible = [
      `Personnage: ${memory.visualIdentity.species}. Visage: ${memory.visualIdentity.face}.`,
      `Proportions: ${memory.visualIdentity.proportions}. Tenue de base: ${memory.visualIdentity.outfitBase}.`,
      `Palette de couleurs: ${memory.visualIdentity.colorPalette.join(', ')}.`,
      `Règles de cohérence: ${memory.visualIdentity.consistencyRules.join(' ')}`,
    ].join('\n');

    const styleDescriptor = STYLE_DESCRIPTORS[dto.style] ?? dto.style;

    const draft = await this.openAi.completeJson<ImageAgentResult>({
      systemPrompt: `${visualBible}\n\n${promptTemplate}`,
      userPrompt: [
        `Contexte / tweet: ${dto.context}`,
        `Style graphique demandé: ${dto.style} (${styleDescriptor})`,
        `Scénarios déjà utilisés récemment (à éviter si possible): ${recentScenarios.join(', ') || 'aucun'}.`,
      ].join('\n'),
      temperature: 0.7,
    });

    const generated = await this.openAi.generateImage(draft.imagePrompt);

    let url = generated.url;
    let storageKey = '';
    if (generated.b64) {
      const stored = await this.storage.saveBase64Image(generated.b64);
      url = stored.url;
      storageKey = stored.storageKey;
    }

    const image = await this.prisma.generatedImage.create({
      data: {
        prompt: draft.imagePrompt,
        scenario: draft.scenario,
        style: dto.style,
        url,
        thumbnailUrl: url,
        storageKey,
        linkedTweetId: dto.linkedTweetId,
      },
    });

    await this.memoryStore.recordUsage('scenario', [draft.scenario]);
    await this.decisionLog.record({
      agentType: AgentType.IMAGE,
      action: 'generate_image',
      reasoning: draft.reasoning,
      metricsUsed: ['recent_scenarios', 'style_selection'],
      relatedTweetId: dto.linkedTweetId,
    });

    this.logger.log(`Generated image for scenario "${draft.scenario}" (style ${dto.style}).`);
    return image;
  }

  async list(limit = 60) {
    return this.prisma.generatedImage.findMany({ orderBy: { createdAt: 'desc' }, take: limit });
  }
}
