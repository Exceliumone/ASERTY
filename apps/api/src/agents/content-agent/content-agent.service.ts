import { Injectable, Logger } from '@nestjs/common';
import { AgentType, PromptRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PabloMemoryService } from '../../pablo-memory/pablo-memory.service';
import { PromptsService } from '../../prompts/prompts.service';
import { OpenAiService } from '../openai/openai.service';
import { MemoryStoreService } from '../memory-store/memory-store.service';
import { DecisionLogService } from '../decision-log/decision-log.service';

interface ContentAgentResult {
  content: string;
  themes: string[];
  hashtags: string[];
  reasoning: string;
  suggestedImageScenario: string | null;
}

/**
 * Content Agent — writes tweet drafts that stay in-character for Pablo,
 * actively avoiding themes/hashtags/expressions used recently.
 */
@Injectable()
export class ContentAgentService {
  private readonly logger = new Logger(ContentAgentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pabloMemory: PabloMemoryService,
    private readonly prompts: PromptsService,
    private readonly openAi: OpenAiService,
    private readonly memoryStore: MemoryStoreService,
    private readonly decisionLog: DecisionLogService,
  ) {}

  async generateSuggestions(count = 3, context?: string) {
    const [identityPrimer, promptTemplate, recentThemes, recentExpressions, recentHashtags] =
      await Promise.all([
        this.pabloMemory.buildIdentityPrimer(),
        this.prompts.getActivePrompt(PromptRole.CONTENT_AGENT),
        this.memoryStore.getRecentlyUsed('theme'),
        this.memoryStore.getRecentlyUsed('expression'),
        this.memoryStore.getRecentlyUsed('hashtag'),
      ]);

    const created = [];
    for (let i = 0; i < count; i += 1) {
      const userPrompt = [
        context ? `Contexte fourni: ${context}` : 'Aucun contexte spécifique fourni, propose une idée originale.',
        `Thèmes déjà utilisés récemment (à éviter si possible): ${recentThemes.join(', ') || 'aucun'}.`,
        `Expressions déjà utilisées récemment (à varier): ${recentExpressions.join(', ') || 'aucune'}.`,
        `Hashtags déjà utilisés récemment (à varier): ${recentHashtags.join(', ') || 'aucun'}.`,
        'Propose UNE seule publication.',
      ].join('\n');

      const result = await this.openAi.completeJson<ContentAgentResult>({
        systemPrompt: `${identityPrimer}\n\n${promptTemplate}`,
        userPrompt,
        temperature: 0.9,
      });

      const tweet = await this.prisma.tweet.create({
        data: {
          content: result.content,
          status: 'SUGGESTED',
          themes: result.themes ?? [],
          hashtags: result.hashtags ?? [],
          agentReasoning: result.reasoning,
          createdByAgent: AgentType.CONTENT,
        },
      });

      await this.memoryStore.recordUsage('theme', result.themes ?? []);
      await this.memoryStore.recordUsage('hashtag', result.hashtags ?? []);
      await this.decisionLog.record({
        agentType: AgentType.CONTENT,
        action: 'suggest_tweet',
        reasoning: result.reasoning,
        metricsUsed: ['recent_themes', 'recent_expressions', 'recent_hashtags'],
        relatedTweetId: tweet.id,
      });

      created.push({ tweet, suggestedImageScenario: result.suggestedImageScenario });
    }

    this.logger.log(`Generated ${created.length} tweet suggestion(s).`);
    return created;
  }
}
