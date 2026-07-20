'use client';

import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { SectionHeader } from '@/components/dashboard/section-header';
import { usePromptsByRole } from '@/lib/hooks';
import { api, ApiError } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';

const ROLES = [
  { value: 'CONTENT_AGENT', label: 'Content Agent' },
  { value: 'TREND_AGENT', label: 'Trend Agent' },
  { value: 'ANALYTICS_AGENT', label: 'Analytics Agent' },
  { value: 'COMMUNITY_AGENT', label: 'Community Agent' },
  { value: 'IMAGE_AGENT', label: 'Image Agent' },
];

function RolePromptPanel({ role }: { role: string }) {
  const { data: versions, mutate } = usePromptsByRole(role);
  const active = versions?.find((v) => v.isActive);
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [changelog, setChangelog] = React.useState('');
  const [editing, setEditing] = React.useState(false);

  React.useEffect(() => {
    if (active) {
      setTitle(active.title);
      setContent(active.content);
    }
    // Only re-sync local edit buffers when the active version itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id]);

  const [saving, setSaving] = React.useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await api.post('/prompts', { role, title, content, changelog });
      await mutate();
      setEditing(false);
      setChangelog('');
      toast({ title: 'Nouvelle version enregistrée', variant: 'success' });
    } catch (error) {
      toast({
        title: "Échec de l'enregistrement",
        description: error instanceof ApiError ? error.message : 'Une erreur inattendue est survenue.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{title || 'Prompt actif'}</CardTitle>
            <CardDescription>Version {active?.version ?? '—'} — modifiable, chaque édition crée une nouvelle version.</CardDescription>
          </div>
          {!editing ? (
            <Button variant="outline" onClick={() => setEditing(true)}>
              Éditer
            </Button>
          ) : (
            <Button variant="gradient" onClick={handleSave} disabled={saving}>
              {saving ? 'Enregistrement...' : 'Enregistrer (nouvelle version)'}
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} disabled={!editing} />
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={!editing}
            className="min-h-[280px] font-mono text-xs"
          />
          {editing && (
            <Input
              placeholder="Changelog (ex: ton plus direct)"
              value={changelog}
              onChange={(e) => setChangelog(e.target.value)}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historique</CardTitle>
          <CardDescription>Toutes les versions de ce prompt.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {versions?.map((v) => (
            <div key={v.id} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">v{v.version}</p>
                <p className="text-xs text-muted-foreground">{formatDate(v.createdAt)}</p>
              </div>
              {v.isActive ? (
                <Badge variant="success">Actif</Badge>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    try {
                      await api.post(`/prompts/${role}/${v.version}/activate`);
                      await mutate();
                      toast({ title: `Version ${v.version} activée`, variant: 'success' });
                    } catch (error) {
                      toast({
                        title: "Échec de l'activation",
                        description: error instanceof ApiError ? error.message : 'Une erreur inattendue est survenue.',
                        variant: 'destructive',
                      });
                    }
                  }}
                >
                  Activer
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function PromptsPage() {
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Bibliothèque de prompts"
        description="Chaque agent possède son propre prompt, versionné et modifiable depuis cette interface."
      />
      <Tabs defaultValue="CONTENT_AGENT">
        <TabsList className="flex-wrap">
          {ROLES.map((role) => (
            <TabsTrigger key={role.value} value={role.value}>
              {role.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {ROLES.map((role) => (
          <TabsContent key={role.value} value={role.value}>
            <RolePromptPanel role={role.value} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
