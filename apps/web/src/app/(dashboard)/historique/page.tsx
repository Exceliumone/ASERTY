'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SectionHeader } from '@/components/dashboard/section-header';
import { FadeIn } from '@/components/dashboard/fade-in';
import { useDecisionLogs } from '@/lib/hooks';
import { formatDate } from '@/lib/utils';

const AGENT_FILTERS = ['ALL', 'CONTENT', 'TREND', 'ANALYTICS', 'COMMUNITY', 'IMAGE'];

export default function HistoriquePage() {
  const { data: logs } = useDecisionLogs();
  const [filter, setFilter] = React.useState('ALL');

  const filtered = logs?.filter((log) => filter === 'ALL' || log.agentType === filter);

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Historique des décisions"
        description="Chaque action des agents est journalisée avec sa justification métier."
      />

      <div className="flex flex-wrap gap-2">
        {AGENT_FILTERS.map((f) => (
          <Badge key={f} variant={filter === f ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilter(f)}>
            {f}
          </Badge>
        ))}
      </div>

      <Card>
        <CardContent className="divide-y divide-border p-0">
          {filtered?.map((log, index) => (
            <FadeIn key={log.id} delay={Math.min(index * 0.02, 0.3)}>
              <div className="flex items-start justify-between gap-4 p-4">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <Badge variant="secondary">{log.agentType}</Badge>
                    <span className="text-xs font-medium text-muted-foreground">{log.action}</span>
                  </div>
                  <p className="text-sm">{log.reasoning}</p>
                  {log.metricsUsed?.length > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Métriques utilisées: {log.metricsUsed.join(', ')}
                    </p>
                  )}
                </div>
                <span className="whitespace-nowrap text-xs text-muted-foreground">{formatDate(log.createdAt)}</span>
              </div>
            </FadeIn>
          ))}
          {!filtered?.length && (
            <p className="py-16 text-center text-sm text-muted-foreground">Aucune décision pour ce filtre.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
