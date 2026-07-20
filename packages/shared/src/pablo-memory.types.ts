/**
 * Structural contract for Pablo's "character bible". This is the single
 * source of truth every agent must load before generating content so that
 * Pablo's identity never drifts between agents or over time.
 */
export interface PabloMemory {
  identity: {
    name: string;
    species: string;
    origin: string;
    tagline: string;
    biography: string;
  };
  personality: {
    traits: string[];
    humorStyle: string[];
    tone: string;
    values: string[];
  };
  vocabulary: {
    signatureExpressions: string[];
    favoriteEmojis: string[];
    hashtagsCore: string[];
    forbiddenWords: string[];
    forbiddenTopics: string[];
  };
  themes: {
    favoriteTopics: string[];
    recurringReferences: string[];
  };
  visualIdentity: {
    species: string;
    face: string;
    proportions: string;
    outfitBase: string;
    colorPalette: string[];
    consistencyRules: string[];
  };
  emotions: {
    bullish: string;
    bearish: string;
    neutral: string;
    excited: string;
  };
  guardrails: {
    complianceNotes: string[];
    sensitiveSubjects: string[];
  };
}

export interface PromptTemplate {
  id: string;
  role: string;
  version: number;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  changelog?: string;
}
