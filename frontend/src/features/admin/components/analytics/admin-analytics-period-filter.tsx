'use client';

import { cn } from '@/lib/utils';

import type { AdminAnalyticsPeriod } from '../../types/admin-analytics.types';
import {
  ADMIN_ANALYTICS_PERIODS,
  getPeriodLabel,
} from '../../utils/admin-analytics.utils';

type AdminAnalyticsPeriodFilterProps = {
  value: AdminAnalyticsPeriod;
  onChange: (period: AdminAnalyticsPeriod) => void;
};

export function AdminAnalyticsPeriodFilter({
  value,
  onChange,
}: AdminAnalyticsPeriodFilterProps) {
  return (
    <div
      role="group"
      aria-label="Davr filtri"
      className="inline-flex rounded-xl border border-border bg-muted/40 p-1"
    >
      {ADMIN_ANALYTICS_PERIODS.map((period) => {
        const isActive = period === value;

        return (
          <button
            key={period}
            type="button"
            onClick={() => onChange(period)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {getPeriodLabel(period)}
          </button>
        );
      })}
    </div>
  );
}
