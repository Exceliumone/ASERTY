'use client';

import * as React from 'react';
import useSWR from 'swr';
import { KeyRound, ShieldCheck, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { SectionHeader } from '@/components/dashboard/section-header';
import { usePabloMemory } from '@/lib/hooks';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface CredentialSummary {
  id: string;
  provider: string;
  label: string;
  updatedAt: string;
}

function ApiKeysTab() {
  const { data: credentials, mutate } = useSWR<CredentialSummary[]>('/credentials', (p: string) =>
    api.get<CredentialSummary[]>(p),
  );
  const [provider, setProvider] = React.useState('X');
  const [label, setLabel] = React.useState('default');
  const [value, setValue] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await api.post('/credentials', { provider, label, value });
      setValue('');
      await mutate();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Ajouter / mettre à jour une clé</CardTitle>
          <CardDescription>Les clés sont chiffrées (AES-256-GCM) avant stockage.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Provider (X, OPENAI)" value={provider} onChange={(e) => setProvider(e.target.value)} />
            <Input placeholder="Label" value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <Input placeholder="Valeur de la clé" type="password" value={value} onChange={(e) => setValue(e.target.value)} />
          <Button variant="gradient" className="w-full" disabled={!value || saving} onClick={handleSave}>
            <KeyRound className="mr-2 h-4 w-4" /> {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clés configurées</CardTitle>
          <CardDescription>Les valeurs déchiffrées ne sont jamais renvoyées par l&apos;API.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {credentials?.map((cred) => (
            <div key={cred.id} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium">
                    {cred.provider} <span className="text-muted-foreground">/ {cred.label}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">Mis à jour {formatDate(cred.updatedAt)}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={async () => {
                  await api.delete(`/credentials/${cred.id}`);
                  await mutate();
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {!credentials?.length && (
            <p className="py-8 text-center text-sm text-muted-foreground">Aucune clé configurée.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PabloMemoryTab() {
  const { data: memory, mutate } = usePabloMemory();
  const [raw, setRaw] = React.useState('');
  const [changelog, setChangelog] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (memory) setRaw(JSON.stringify(memory, null, 2));
  }, [memory]);

  async function handleSave() {
    setSaving(true);
    try {
      const data = JSON.parse(raw);
      await api.post('/pablo-memory/versions', { data, changelog });
      setChangelog('');
      await mutate();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mémoire de Pablo</CardTitle>
        <CardDescription>
          Identité, personnalité, vocabulaire, mots interdits, identité visuelle. Chaque agent charge cette mémoire
          avant de générer du contenu. Toute modification crée une nouvelle version.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea value={raw} onChange={(e) => setRaw(e.target.value)} className="min-h-[420px] font-mono text-xs" />
        <div className="flex gap-2">
          <Input placeholder="Changelog" value={changelog} onChange={(e) => setChangelog(e.target.value)} />
          <Button variant="gradient" disabled={saving} onClick={handleSave}>
            {saving ? 'Enregistrement...' : 'Publier une nouvelle version'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ReglagesPage() {
  return (
    <div className="space-y-8">
      <SectionHeader title="Réglages" description="Clés API, identité de Pablo, et préférences de la plateforme." />
      <Tabs defaultValue="api-keys">
        <TabsList>
          <TabsTrigger value="api-keys">Clés API</TabsTrigger>
          <TabsTrigger value="memory">Mémoire de Pablo</TabsTrigger>
        </TabsList>
        <TabsContent value="api-keys">
          <ApiKeysTab />
        </TabsContent>
        <TabsContent value="memory">
          <PabloMemoryTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
