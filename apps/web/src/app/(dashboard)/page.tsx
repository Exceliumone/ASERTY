'use client';

import * as React from 'react';
import { Users, Zap, FileText, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/dashboard/section-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { FadeIn } from '@/components/dashboard/fade-in';
import { useDashboardKpis, useDecisionLogs, useTweets } from '@/lib/hooks';
import { formatDate, formatNumber, formatPercent } from '@/lib/utils';
import { api, ApiError } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export default function HomePage() {
  const { data: kpis } = useDashboardKpis();
  const { data: suggestions, mutate: mutateSuggestions } = useTweets('SUGGESTED');
  const { data: logs } = useDecisionLogs();
  const [generating, setGenerating] = React.useState(false);

  async function handleGenerateIdeas() {
    setGenerating(true);
    try {
      const created = await api.post<unknown[]>('/agents/content/generate', { count: 3 });
      await mutateSuggestions();
      toast({
        title: 'Nouvelles idées générées',
        description: `${created.length} suggestion(s) ajoutée(s) — à retrouver dans Suggestions.`,
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Échec de la génération',
        description: error instanceof ApiError ? error.message : 'Une erreur inattendue est survenue.',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-border bg-gradient-to-br from-pablo-solanaPurple/10 to-pablo-solanaGreen/10 p-6 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Bonjour 👋</p>
            <h1 className="font-display text-2xl font-bold">
              Pablo tourne <span className="gradient-text">24h/24</span> pour vous.
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Voici un résumé de l&apos;activité de vos agents IA aujourd&apos;hui.
            </p>
          </div>
          <Button variant="gradient" size="lg" disabled={generating} onClick={handleGenerateIdeas}>
            {generating ? 'Génération en cours...' : 'Générer de nouvelles idées'}
          </Button>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Abonnés"
            value={formatNumber(kpis?.followersCount ?? 0)}
            delta={kpis?.followersDelta7d}
            icon={Users}
          />
          <StatCard
            label="Taux d'engagement moyen"
            value={formatPercent(kpis?.avgEngagementRate ?? 0)}
            icon={Zap}
          />
          <StatCard label="Publiées sur X cette semaine" value={String(kpis?.tweetsThisWeek ?? 0)} icon={FileText} />
          <StatCard
            label="Meilleure heure de publication"
            value={`${kpis?.bestPostingHour ?? 0}h`}
            suffix="UTC"
            icon={Clock}
          />
        </div>
      </FadeIn>

      <div className="grid gap-6 lg:grid-cols-3">
        <FadeIn delay={0.1} className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Suggestions en attente</CardTitle>
                <CardDescription>Générées par le Content Agent, prêtes à être validées.</CardDescription>
              </div>
              <Badge variant="secondary">{suggestions?.length ?? 0}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {suggestions?.slice(0, 5).map((tweet) => (
                <div key={tweet.id} className="rounded-lg border border-border p-4">
                  <p className="text-sm">{tweet.content}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {tweet.hashtags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{tweet.agentReasoning}</p>
                </div>
              ))}
              {!suggestions?.length && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Aucune suggestion en attente pour le moment.
                </p>
              )}
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.15}>
          <Card>
            <CardHeader>
              <CardTitle>Décisions récentes des agents</CardTitle>
              <CardDescription>Raisonnement métier, pas de chaîne de pensée brute.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {logs?.slice(0, 6).map((log) => (
                <div key={log.id} className="border-l-2 border-primary/50 pl-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{log.agentType}</Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(log.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm">{log.reasoning}</p>
                </div>
              ))}
              {!logs?.length && (
                <p className="py-8 text-center text-sm text-muted-foreground">Aucune décision enregistrée.</p>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
