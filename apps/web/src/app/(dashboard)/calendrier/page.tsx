'use client';

import * as React from 'react';
import { addDays, format, isSameDay, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/dashboard/section-header';
import { FadeIn } from '@/components/dashboard/fade-in';
import { useCalendarRange } from '@/lib/hooks';
import { cn } from '@/lib/utils';

const DAYS_AHEAD = 14;

export default function CalendrierPage() {
  const from = startOfDay(new Date()).toISOString();
  const to = addDays(startOfDay(new Date()), DAYS_AHEAD).toISOString();
  const { data: entries } = useCalendarRange(from, to);

  const days = Array.from({ length: DAYS_AHEAD }, (_, i) => addDays(startOfDay(new Date()), i));

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Calendrier éditorial"
        description="Publications planifiées pour les 14 prochains jours. Modifiable avant publication."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {days.map((day, index) => {
          const dayEntries = entries?.filter((entry) => isSameDay(new Date(entry.scheduledAt), day)) ?? [];
          return (
            <FadeIn key={day.toISOString()} delay={index * 0.02}>
              <Card className={cn(dayEntries.length === 0 && 'opacity-60')}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span className="capitalize">{format(day, 'EEEE d MMMM', { locale: fr })}</span>
                    <Badge variant={dayEntries.length ? 'default' : 'outline'}>{dayEntries.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {dayEntries.map((entry) => (
                    <div key={entry.id} className="rounded-lg border border-border p-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{format(new Date(entry.scheduledAt), 'HH:mm')}</span>
                        <Badge variant="secondary">{entry.status}</Badge>
                      </div>
                      {entry.imageUrl && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                          <ImageIcon className="h-3 w-3" /> Image associée
                        </div>
                      )}
                    </div>
                  ))}
                  {dayEntries.length === 0 && (
                    <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
                      + Planifier une publication
                    </Button>
                  )}
                </CardContent>
              </Card>
            </FadeIn>
          );
        })}
      </div>
    </div>
  );
}
