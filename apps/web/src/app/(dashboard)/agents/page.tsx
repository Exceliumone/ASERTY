'use client';

import * as React from 'react';
import { PenLine, TrendingUp, BarChart3, MessagesSquare, ImagePlus, type LucideIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/dashboard/section-header';
import { FadeIn } from '@/components/dashboard/fade-in';
import { api } from '@/lib/api';

interface AgentDefinition {
  key: string;
  name: string;
  description: string;
  icon: LucideIcon;
  action: { label: string; run: () => Promise<unknown> };
}

const agents: AgentDefinition[] = [
  {
    key: 'content',
    name: 'Content Agent',
    description: "Rédige les publications en conservant la personnalité de Pablo, sans jamais se répéter.",
    icon: PenLine,
    action: { label: 'Générer 3 tweets', run: () => api.post('/agents/content/generate', { count: 3 }) },
  },
  {
    key: 'trend',
    name: 'Trend Agent',
    description: 'Surveille Solana, Bitcoin, Ethereum, Pump.fun et la culture meme pour détecter les tendances.',
    icon: TrendingUp,
    action: { label: 'Scanner les tendances', run: () => api.post('/agents/trend/scan', { signals: [] }) },
  },
  {
    key: 'analytics',
    name: 'Analytics Agent',
    description: "Analyse l'engagement, identifie les meilleurs formats et heures de publication.",
    icon: BarChart3,
    action: { label: 'Lancer une analyse', run: () => api.post('/agents/analytics/analyze') },
  },
  {
    key: 'community',
    name: 'Community Agent',
    description: 'Prépare des réponses humoristiques et signale les messages sensibles à valider.',
    icon: MessagesSquare,
    action: { label: 'Voir la file de modération', run: () => api.get('/agents/community/pending') },
  },
  {
    key: 'image',
    name: 'Image Agent',
    description: 'Génère des scènes visuelles de Pablo cohérentes avec son identité, selon le contexte.',
    icon: ImagePlus,
    action: { label: 'Voir la bibliothèque', run: () => api.get('/agents/image') },
  },
];

export default function AgentsPage() {
  const [running, setRunning] = React.useState<string | null>(null);
  const [lastRun, setLastRun] = React.useState<Record<string, string>>({});

  async function handleRun(agent: AgentDefinition) {
    setRunning(agent.key);
    try {
      await agent.action.run();
      setLastRun((prev) => ({ ...prev, [agent.key]: new Date().toLocaleTimeString('fr-FR') }));
    } finally {
      setRunning(null);
    }
  }

  return (
    <div className="space-y-8">
      <SectionHeader title="Agents IA" description="Cinq agents spécialisés, chacun avec un rôle métier précis." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {agents.map((agent, index) => {
          const Icon = agent.icon;
          return (
            <FadeIn key={agent.key} delay={index * 0.05}>
              <Card className="flex h-full flex-col">
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-pablo-solanaPurple/20 to-pablo-solanaGreen/20">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>{agent.name}</CardTitle>
                  <CardDescription>{agent.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  {lastRun[agent.key] && (
                    <Badge variant="success">Dernière exécution: {lastRun[agent.key]}</Badge>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant="gradient"
                    disabled={running === agent.key}
                    onClick={() => handleRun(agent)}
                  >
                    {running === agent.key ? 'En cours...' : agent.action.label}
                  </Button>
                </CardFooter>
              </Card>
            </FadeIn>
          );
        })}
      </div>
    </div>
  );
}
