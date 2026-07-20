'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionHeader } from '@/components/dashboard/section-header';
import { FadeIn } from '@/components/dashboard/fade-in';
import { useAnalyticsInsights, useEngagementHistory } from '@/lib/hooks';
import { SEQUENTIAL_BLUE } from '@/lib/chart-colors';
import { formatDate, formatPercent } from '@/lib/utils';

function ChartTooltip({ active, payload, label, formatter }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-muted-foreground">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} className="text-foreground">
          {formatter ? formatter(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
}

export default function StatistiquesPage() {
  const { data: history } = useEngagementHistory(30);
  const { data: topHashtags } = useAnalyticsInsights('top_hashtag');
  const { data: topTopics } = useAnalyticsInsights('top_topic');
  const { data: topFormats } = useAnalyticsInsights('top_format');

  const engagementSeries =
    history?.map((snapshot) => ({
      date: formatDate(snapshot.capturedAt),
      engagement: snapshot.engagementRate,
    })) ?? [];

  const followersSeries =
    history?.map((snapshot) => ({
      date: formatDate(snapshot.capturedAt),
      followers: snapshot.followersDelta,
    })) ?? [];

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Statistiques"
        description="Croissance, engagement, performance des publications et heures optimales."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <FadeIn>
          <Card>
            <CardHeader>
              <CardTitle>Évolution de l&apos;engagement</CardTitle>
              <CardDescription>Taux d&apos;engagement moyen sur 30 jours.</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={engagementSeries}>
                  <defs>
                    <linearGradient id="engagementFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={SEQUENTIAL_BLUE[3]} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={SEQUENTIAL_BLUE[3]} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(v) => formatPercent(v)}
                    width={56}
                  />
                  <Tooltip content={<ChartTooltip formatter={(v: number) => formatPercent(v)} />} />
                  <Area
                    type="monotone"
                    dataKey="engagement"
                    stroke={SEQUENTIAL_BLUE[4]}
                    strokeWidth={2}
                    fill="url(#engagementFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.05}>
          <Card>
            <CardHeader>
              <CardTitle>Évolution des abonnés</CardTitle>
              <CardDescription>Delta d&apos;abonnés capturé à chaque snapshot.</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={followersSeries}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={40} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="followers" fill={SEQUENTIAL_BLUE[4]} radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <FadeIn delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle>Meilleurs hashtags</CardTitle>
              <CardDescription>Par score d&apos;engagement moyen.</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topHashtags ?? []} layout="vertical" margin={{ left: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" hide />
                  <YAxis
                    type="category"
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                    width={90}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="score" fill={SEQUENTIAL_BLUE[4]} radius={[0, 4, 4, 0]} maxBarSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.15}>
          <Card>
            <CardHeader>
              <CardTitle>Meilleurs sujets</CardTitle>
              <CardDescription>Thèmes générant le plus d&apos;engagement.</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topTopics ?? []} layout="vertical" margin={{ left: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" hide />
                  <YAxis
                    type="category"
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                    width={90}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="score" fill={SEQUENTIAL_BLUE[4]} radius={[0, 4, 4, 0]} maxBarSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle>Meilleurs formats</CardTitle>
              <CardDescription>Types de contenu les plus performants.</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topFormats ?? []} layout="vertical" margin={{ left: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" hide />
                  <YAxis
                    type="category"
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                    width={90}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="score" fill={SEQUENTIAL_BLUE[4]} radius={[0, 4, 4, 0]} maxBarSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
