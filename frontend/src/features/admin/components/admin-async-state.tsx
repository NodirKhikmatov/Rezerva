'use client';

import { AlertCircle, Inbox } from 'lucide-react';

import { Spinner } from '@/shared/components/ui/spinner';
import { Typography } from '@/shared/components/ui/typography';
import { Button } from '@/shared/components/ui/button';

type AdminAsyncStateProps = {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  errorMessage?: string;
  emptyTitle: string;
  emptyDescription: string;
  onRetry?: () => void;
  children: React.ReactNode;
};

export function AdminAsyncState({
  isLoading,
  isError,
  isEmpty,
  errorMessage,
  emptyTitle,
  emptyDescription,
  onRetry,
  children,
}: AdminAsyncStateProps) {
  if (isLoading) {
    return (
      <div
        className="flex min-h-48 flex-col items-center justify-center gap-3 py-12"
        aria-busy="true"
        aria-live="polite"
      >
        <Spinner className="size-8 text-primary" />
        <Typography variant="muted">Yuklanmoqda...</Typography>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center"
        role="alert"
      >
        <AlertCircle className="size-8 text-destructive" aria-hidden />
        <div className="space-y-1">
          <Typography variant="label">Ma&apos;lumot yuklanmadi</Typography>
          <Typography variant="muted">
            {errorMessage ??
              'Server bilan bog&apos;lanishda xatolik yuz berdi.'}
          </Typography>
        </div>
        {onRetry && (
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            Qayta urinish
          </Button>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
        <Inbox className="size-8 text-muted-foreground" aria-hidden />
        <div className="space-y-1">
          <Typography variant="label">{emptyTitle}</Typography>
          <Typography variant="muted">{emptyDescription}</Typography>
        </div>
      </div>
    );
  }

  return children;
}
