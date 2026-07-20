'use client';

import * as React from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SectionHeader } from '@/components/dashboard/section-header';
import { FadeIn } from '@/components/dashboard/fade-in';
import { useCommunityQueue, useTweets } from '@/lib/hooks';
import { api } from '@/lib/api';

function TweetSuggestions() {
  const { data: tweets, mutate } = useTweets('SUGGESTED');
  const [scheduling, setScheduling] = React.useState<string | null>(null);
  const [date, setDate] = React.useState('');

  async function handleSchedule(tweetId: string) {
    if (!date) return;
    await api.post('/calendar', { tweetId, scheduledAt: new Date(date).toISOString() });
    await mutate();
    setScheduling(null);
  }

  async function handleArchive(tweetId: string) {
    await api.post(`/tweets/${tweetId}/archive`);
    await mutate();
  }

  return (
    <div className="space-y-4">
      {tweets?.map((tweet, index) => (
        <FadeIn key={tweet.id} delay={index * 0.03}>
          <Card>
            <CardContent className="space-y-3 p-5">
              <p className="text-sm">{tweet.content}</p>
              <div className="flex flex-wrap gap-2">
                {tweet.hashtags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{tweet.agentReasoning}</p>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {scheduling === tweet.id ? (
                  <>
                    <Input
                      type="datetime-local"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-auto"
                    />
                    <Button size="sm" variant="gradient" onClick={() => handleSchedule(tweet.id)}>
                      Confirmer
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="gradient" onClick={() => setScheduling(tweet.id)}>
                    Planifier
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => handleArchive(tweet.id)}>
                  Archiver
                </Button>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      ))}
      {!tweets?.length && (
        <p className="py-16 text-center text-sm text-muted-foreground">Aucune suggestion de tweet en attente.</p>
      )}
    </div>
  );
}

function CommunityQueue() {
  const { data: replies, mutate } = useCommunityQueue();

  async function approve(id: string) {
    await api.post(`/agents/community/${id}/approve`);
    await mutate();
  }
  async function dismiss(id: string) {
    await api.post(`/agents/community/${id}/dismiss`);
    await mutate();
  }

  return (
    <div className="space-y-4">
      {replies?.map((reply, index) => (
        <FadeIn key={reply.id} delay={index * 0.03}>
          <Card>
            <CardContent className="space-y-2 p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">@{reply.originalAuthor}</p>
                {reply.sensitiveFlag && (
                  <Badge variant="warning" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> À valider manuellement
                  </Badge>
                )}
              </div>
              <p className="rounded-lg bg-secondary p-3 text-sm">{reply.originalText}</p>
              {reply.suggestedReply && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Réponse suggérée: </span>
                  {reply.suggestedReply}
                </p>
              )}
              {reply.flagReason && <p className="text-xs text-amber-500">{reply.flagReason}</p>}
              <div className="flex gap-2 pt-1">
                <Button size="sm" variant="gradient" onClick={() => approve(reply.id)}>
                  <Check className="mr-1 h-4 w-4" /> Approuver
                </Button>
                <Button size="sm" variant="outline" onClick={() => dismiss(reply.id)}>
                  <X className="mr-1 h-4 w-4" /> Ignorer
                </Button>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      ))}
      {!replies?.length && (
        <p className="py-16 text-center text-sm text-muted-foreground">Aucune réponse en attente de modération.</p>
      )}
    </div>
  );
}

export default function SuggestionsPage() {
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Suggestions"
        description="Validez les tweets proposés par le Content Agent et modérez les réponses communautaires."
      />
      <Tabs defaultValue="tweets">
        <TabsList>
          <TabsTrigger value="tweets">Tweets</TabsTrigger>
          <TabsTrigger value="community">Réponses communautaires</TabsTrigger>
        </TabsList>
        <TabsContent value="tweets">
          <TweetSuggestions />
        </TabsContent>
        <TabsContent value="community">
          <CommunityQueue />
        </TabsContent>
      </Tabs>
    </div>
  );
}
