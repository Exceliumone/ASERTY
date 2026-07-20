import { type LucideIcon, TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string;
  delta?: number;
  icon: LucideIcon;
  suffix?: string;
}

export function StatCard({ label, value, delta, icon: Icon, suffix }: StatCardProps) {
  const isPositive = (delta ?? 0) >= 0;

  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-start justify-between p-6">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-display text-2xl font-bold tabular-nums">
            {value}
            {suffix && <span className="ml-1 text-sm font-normal text-muted-foreground">{suffix}</span>}
          </p>
          {typeof delta === 'number' && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs font-medium',
                isPositive ? 'text-emerald-500' : 'text-red-500',
              )}
            >
              {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {Math.abs(delta).toFixed(1)}% vs 7j précédents
            </div>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-pablo-solanaPurple/20 to-pablo-solanaGreen/20">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
}
