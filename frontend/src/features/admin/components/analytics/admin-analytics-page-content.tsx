'use client';

import { CalendarDays, CircleDollarSign, Layers3, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Typography } from '@/shared/components/ui/typography';

import { useAdminAnalytics } from '../../hooks/use-admin-analytics';
import type { AdminAnalyticsPeriod } from '../../types/admin-analytics.types';
import {
  buildPeriodSummary,
  sliceDailyMetrics,
} from '../../utils/admin-analytics.utils';
import { getCategoryLabel } from '../../utils/admin-business-labels.utils';
import { AdminAsyncState } from '../admin-async-state';
import { AdminStatCard } from '../admin-stat-card';
import { AdminActiveUsersChart } from './admin-active-users-chart';
import { AdminAnalyticsPeriodFilter } from './admin-analytics-period-filter';
import { AdminDailyBookingsChart } from './admin-daily-bookings-chart';
import { AdminPopularCategoriesChart } from './admin-popular-categories-chart';
import { AdminRevenueChart } from './admin-revenue-chart';

export function AdminAnalyticsPageContent() {
  const [period, setPeriod] = useState<AdminAnalyticsPeriod>('30d');
  const { data, isLoading, isError, error, refetch } =
    useAdminAnalytics(period);

  const dailyMetrics = useMemo(
    () => (data ? sliceDailyMetrics(data.daily, period) : []),
    [data, period],
  );

  const summary = useMemo(
    () => (data ? buildPeriodSummary(dailyMetrics, data.categories) : null),
    [data, dailyMetrics],
  );

  const topCategoryMetric = useMemo(
    () =>
      data?.categories.find(
        (category) => category.category === summary?.topCategory,
      ),
    [data?.categories, summary?.topCategory],
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <Typography variant="h1">Analitika</Typography>
          <Typography variant="muted">
            Platforma trendlari va kategoriya bo&apos;yicha taqsimot.
          </Typography>
        </div>
        <AdminAnalyticsPeriodFilter value={period} onChange={setPeriod} />
      </header>

      <AdminAsyncState
        isLoading={isLoading}
        isError={isError}
        isEmpty={!isLoading && !isError && dailyMetrics.length === 0}
        errorMessage={error instanceof Error ? error.message : undefined}
        emptyTitle="Analitika ma'lumoti yo'q"
        emptyDescription="Tanlangan davr uchun bronlar topilmadi."
        onRetry={() => void refetch()}
      >
        {data && summary && (
          <>
            <section
              aria-label="Analitika ko'rsatkichlari"
              className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
              <AdminStatCard
                label="Jami bronlar"
                value={summary.totalBookings}
                icon={CalendarDays}
                format="compact"
              />
              <AdminStatCard
                label="Daromad"
                value={summary.totalRevenue}
                icon={CircleDollarSign}
                format="currency"
                currency={data.currency}
              />
              <AdminStatCard
                label="O'rtacha DAU"
                value={summary.averageActiveUsers}
                icon={Users}
                format="compact"
              />
              <AdminStatCard
                label={`${getCategoryLabel(summary.topCategory)} bronlari`}
                value={topCategoryMetric?.bookings ?? 0}
                icon={Layers3}
                format="compact"
              />
            </section>

            <section
              aria-label="Analitika grafiklari"
              className="grid gap-6 xl:grid-cols-2"
            >
              <AdminDailyBookingsChart data={dailyMetrics} />
              <AdminRevenueChart data={dailyMetrics} currency={data.currency} />
              <AdminActiveUsersChart data={dailyMetrics} />
              <AdminPopularCategoriesChart data={data.categories} />
            </section>
          </>
        )}
      </AdminAsyncState>
    </div>
  );
}
