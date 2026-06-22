import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  type LucideIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { formatCompactNumber, formatPrice } from '@/shared/lib/format';
import { Card, CardHeader, CardTitle } from '@/shared/components/ui/card';

import type { AdminDashboardTrend } from '../types/admin-dashboard.types';

type AdminStatCardProps = {
  label: string;
  value: number;
  icon: LucideIcon;
  trend?: AdminDashboardTrend;
  format?: 'number' | 'currency' | 'compact';
  currency?: string;
};

function formatStatValue(
  value: number,
  format: AdminStatCardProps['format'],
  currency: string,
): string {
  if (format === 'currency') {
    return formatPrice(value, currency);
  }

  if (format === 'compact') {
    return formatCompactNumber(value);
  }

  return new Intl.NumberFormat('uz-UZ').format(value);
}

function TrendIndicator({ trend }: { trend: AdminDashboardTrend }) {
  const Icon =
    trend.direction === 'up'
      ? ArrowUpRight
      : trend.direction === 'down'
        ? ArrowDownRight
        : Minus;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-xs font-medium',
        trend.direction === 'up' && 'text-success',
        trend.direction === 'down' && 'text-destructive',
        trend.direction === 'neutral' && 'text-muted-foreground',
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {trend.direction === 'neutral' ? '0%' : `${trend.value}%`}
    </span>
  );
}

export function AdminStatCard({
  label,
  value,
  icon: Icon,
  trend,
  format = 'number',
  currency = 'UZS',
}: AdminStatCardProps) {
  return (
    <Card variant="elevated" padding="lg">
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {label}
          </CardTitle>
          <p className="text-2xl font-semibold tracking-tight">
            {formatStatValue(value, format, currency)}
          </p>
          {trend && <TrendIndicator trend={trend} />}
        </div>
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden />
        </div>
      </CardHeader>
    </Card>
  );
}
