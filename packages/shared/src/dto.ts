import { AgentType, ImageStyle, ReplyStatus, TrendSource, TweetStatus } from './enums';

export interface TweetSuggestionDto {
  id: string;
  content: string;
  status: TweetStatus;
  themes: string[];
  hashtags: string[];
  imagePromptId?: string;
  agentReasoning: string;
  scheduledAt?: string;
  createdAt: string;
}

export interface TrendInsightDto {
  id: string;
  source: TrendSource;
  topic: string;
  score: number;
  summary: string;
  suggestedAngle: string;
  detectedAt: string;
}

export interface AnalyticsSnapshotDto {
  id: string;
  tweetId?: string;
  impressions: number;
  likes: number;
  reposts: number;
  replies: number;
  bookmarks: number;
  engagementRate: number;
  followersDelta: number;
  capturedAt: string;
}

export interface CommunityReplySuggestionDto {
  id: string;
  originalMessageId: string;
  originalAuthor: string;
  originalText: string;
  suggestedReply: string;
  status: ReplyStatus;
  sensitiveFlag: boolean;
  flagReason?: string;
  createdAt: string;
}

export interface GeneratedImageDto {
  id: string;
  prompt: string;
  style: ImageStyle;
  scenario: string;
  url: string;
  thumbnailUrl: string;
  linkedTweetId?: string;
  createdAt: string;
}

export interface AgentDecisionLogDto {
  id: string;
  agentType: AgentType;
  action: string;
  reasoning: string;
  metricsUsed: string[];
  createdAt: string;
}

export interface CalendarEntryDto {
  id: string;
  tweetId: string;
  scheduledAt: string;
  status: TweetStatus;
  imageUrl?: string;
}

export interface DashboardKpiDto {
  followersCount: number;
  followersDelta7d: number;
  avgEngagementRate: number;
  tweetsThisWeek: number;
  bestPostingHour: number;
  pendingSuggestions: number;
}
