'use client';

import * as React from 'react';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SectionHeader } from '@/components/dashboard/section-header';
import { FadeIn } from '@/components/dashboard/fade-in';
import { useImages } from '@/lib/hooks';
import { IMAGE_STYLES } from '@/lib/image-styles';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { notifyError } from '@/lib/notify-error';

export default function ImagesPage() {
  const { data: images, mutate, isLoading } = useImages();
  const [styleFilter, setStyleFilter] = React.useState<string>('ALL');
  const [context, setContext] = React.useState('');
  const [style, setStyle] = React.useState('MEME');
  const [generating, setGenerating] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const filtered = images?.filter((img) => styleFilter === 'ALL' || img.style === styleFilter);

  async function handleGenerate() {
    setGenerating(true);
    try {
      await api.post('/agents/image/generate', { context, style });
      await mutate();
      setOpen(false);
      setContext('');
      toast({ title: 'Image générée', variant: 'success' });
    } catch (error) {
      notifyError("Échec de la génération d'image", error);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <SectionHeader title="Bibliothèque d'images" description="Toutes les scènes de Pablo générées par l'Image Agent." />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient">
              <Sparkles className="mr-2 h-4 w-4" /> Générer une image
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouvelle scène pour Pablo</DialogTitle>
              <DialogDescription>
                Décris le contexte (ex: &quot;Pablo trader en pleine hausse&quot;) et choisis un style.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Contexte / tweet associé..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
              />
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger>
                  <SelectValue placeholder="Style graphique" />
                </SelectTrigger>
                <SelectContent>
                  {IMAGE_STYLES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="gradient" className="w-full" disabled={!context || generating} onClick={handleGenerate}>
                {generating ? 'Génération en cours...' : 'Générer'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge
          onClick={() => setStyleFilter('ALL')}
          variant={styleFilter === 'ALL' ? 'default' : 'outline'}
          className="cursor-pointer"
        >
          Tous
        </Badge>
        {IMAGE_STYLES.map((s) => (
          <Badge
            key={s.value}
            onClick={() => setStyleFilter(s.value)}
            variant={styleFilter === s.value ? 'default' : 'outline'}
            className="cursor-pointer"
          >
            {s.label}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filtered?.map((image, index) => (
          <FadeIn key={image.id} delay={index * 0.02}>
            <Card className="overflow-hidden">
              <div className="relative aspect-square bg-secondary">
                {image.url && (
                  <Image src={image.url} alt={image.scenario} fill className="object-cover" unoptimized />
                )}
              </div>
              <CardContent className="p-3">
                <Badge variant="secondary" className="mb-1">
                  {image.style}
                </Badge>
                <p className="line-clamp-2 text-xs text-muted-foreground">{image.scenario}</p>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
        {!isLoading && !filtered?.length && (
          <p className="col-span-full py-16 text-center text-sm text-muted-foreground">
            Aucune image pour ce filtre. Génère la première scène de Pablo !
          </p>
        )}
      </div>
    </div>
  );
}
