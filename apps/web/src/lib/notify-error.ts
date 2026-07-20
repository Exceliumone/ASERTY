import { ApiError } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

/** Surfaces any failed action as a visible toast instead of failing silently. */
export function notifyError(title: string, error: unknown) {
  toast({
    title,
    description: error instanceof ApiError ? error.message : 'Une erreur inattendue est survenue.',
    variant: 'destructive',
  });
}
