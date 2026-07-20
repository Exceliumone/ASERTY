'use client';

import * as React from 'react';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'destructive';
}

type Listener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
const listeners: Listener[] = [];

function emit() {
  listeners.forEach((listener) => listener(toasts));
}

function dismiss(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

/**
 * Minimal module-level toast queue (no external state library needed):
 * `toast()` can be called from anywhere (event handlers, hooks), and any
 * component using `useToast()` re-renders when the queue changes.
 */
export function toast(item: Omit<ToastItem, 'id'>) {
  const id = crypto.randomUUID();
  toasts = [...toasts, { id, ...item }];
  emit();
  setTimeout(() => dismiss(id), 6000);
  return id;
}

export function useToast() {
  const [state, setState] = React.useState<ToastItem[]>(toasts);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  return { toasts: state, dismiss };
}
