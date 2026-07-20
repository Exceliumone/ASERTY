'use client';

import useSWR from 'swr';
import { api } from '@/lib/api';
import type {
  AgentDecisionLogDto,
  AnalyticsSnapshotDto,
  CalendarEntryDto,
  CommunityReplySuggestionDto,
  DashboardKpiDto,
  GeneratedImageDto,
  PabloMemory,
  PromptTemplate,
  TrendInsightDto,
  TweetSuggestionDto,
} from '@pablo/shared';

const fetcher = <T>(path: string) => api.get<T>(path);

export function useDashboardKpis() {
  return useSWR<DashboardKpiDto>('/analytics/kpis', fetcher, { refreshInterval: 30_000 });
}

export function useEngagementHistory(days = 30) {
  return useSWR<AnalyticsSnapshotDto[]>(`/analytics/history?days=${days}`, fetcher);
}

export interface AnalyticsInsightDto {
  id: string;
  kind: string;
  label: string;
  score: number;
  computedAt: string;
}

export function useAnalyticsInsights(kind: string) {
  return useSWR<AnalyticsInsightDto[]>(`/analytics/insights/${kind}`, fetcher);
}

export function useTweets(status?: string) {
  return useSWR<TweetSuggestionDto[]>(`/tweets${status ? `?status=${status}` : ''}`, fetcher);
}

export function useCalendarRange(from: string, to: string) {
  return useSWR<CalendarEntryDto[]>(`/calendar?from=${from}&to=${to}`, fetcher);
}

export function useImages() {
  return useSWR<GeneratedImageDto[]>('/agents/image', fetcher);
}

export function usePromptsByRole(role: string) {
  return useSWR<PromptTemplate[]>(`/prompts/${role}`, fetcher);
}

export function usePabloMemory() {
  return useSWR<PabloMemory>('/pablo-memory/active', fetcher);
}

export function useDecisionLogs() {
  return useSWR<AgentDecisionLogDto[]>('/agents/logs', fetcher, { refreshInterval: 15_000 });
}

export function useTrends() {
  return useSWR<TrendInsightDto[]>('/agents/trend/recent', fetcher);
}

export function useCommunityQueue() {
  return useSWR<CommunityReplySuggestionDto[]>('/agents/community/pending', fetcher, {
    refreshInterval: 20_000,
  });
}
