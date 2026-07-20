export enum AgentType {
  CONTENT = 'CONTENT',
  TREND = 'TREND',
  ANALYTICS = 'ANALYTICS',
  COMMUNITY = 'COMMUNITY',
  IMAGE = 'IMAGE',
}

export enum TweetStatus {
  DRAFT = 'DRAFT',
  SUGGESTED = 'SUGGESTED',
  SCHEDULED = 'SCHEDULED',
  PUBLISHED = 'PUBLISHED',
  FAILED = 'FAILED',
  ARCHIVED = 'ARCHIVED',
}

export enum ImageStyle {
  COMIC = 'COMIC',
  THREE_D = 'THREE_D',
  PIXAR = 'PIXAR',
  ANIME = 'ANIME',
  CYBERPUNK = 'CYBERPUNK',
  PAINTING = 'PAINTING',
  REALISTIC = 'REALISTIC',
  MEME = 'MEME',
  PIXEL_ART = 'PIXEL_ART',
  VINTAGE = 'VINTAGE',
  NOIR = 'NOIR',
  SYNTHWAVE = 'SYNTHWAVE',
}

export enum ReplyStatus {
  SUGGESTED = 'SUGGESTED',
  APPROVED = 'APPROVED',
  SENT = 'SENT',
  FLAGGED = 'FLAGGED',
  DISMISSED = 'DISMISSED',
}

export enum TrendSource {
  CRYPTO = 'CRYPTO',
  MEMECOIN = 'MEMECOIN',
  SOLANA = 'SOLANA',
  BITCOIN = 'BITCOIN',
  ETHEREUM = 'ETHEREUM',
  PUMPFUN = 'PUMPFUN',
  BANTER = 'BANTER',
  MEME_CULTURE = 'MEME_CULTURE',
}

export enum PromptRole {
  CONTENT_AGENT = 'CONTENT_AGENT',
  TREND_AGENT = 'TREND_AGENT',
  ANALYTICS_AGENT = 'ANALYTICS_AGENT',
  COMMUNITY_AGENT = 'COMMUNITY_AGENT',
  IMAGE_AGENT = 'IMAGE_AGENT',
}

export enum JobName {
  GENERATE_CONTENT_IDEAS = 'generate-content-ideas',
  SCAN_TRENDS = 'scan-trends',
  GENERATE_IMAGE = 'generate-image',
  ANALYZE_PERFORMANCE = 'analyze-performance',
  SUGGEST_REPLIES = 'suggest-replies',
  PUBLISH_TWEET = 'publish-tweet',
  FETCH_TWEET_METRICS = 'fetch-tweet-metrics',
  FETCH_MENTIONS = 'fetch-mentions',
}

export enum UserRole {
  OWNER = 'OWNER',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
}
