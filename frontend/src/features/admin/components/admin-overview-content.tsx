'use client';

import { Building2, CalendarDays, CircleDollarSign, Users } from 'lucide-react';

import { Typography } from '@/shared/components/ui/typography';

import { AdminAsyncState } from './admin-async-state';
import { AdminPendingApprovals } from './admin-pending-approvals';
import { AdminRecentActivity } from './admin-recent-activity';
import { AdminStatCard } from './admin-stat-card';
import { useAdminOverview } from '../hooks/use-admin-overview';

export function AdminOverviewContent() {
  const { data, isLoading, isError, error, refetch } = useAdminOverview();

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <Typography variant="h1">Boshqaruv</Typography>
        <Typography variant="muted">
          Platforma ko&apos;rsatkichlari va operatsion navbatlar.
        </Typography>
      </header>

      <AdminAsyncState
        isLoading={isLoading}
        isError={isError}
        isEmpty={false}
        errorMessage={error instanceof Error ? error.message : undefined}
        emptyTitle=""
        emptyDescription=""
        onRetry={() => void refetch()}
      >
        {data && (
          <>
            <section
              aria-label="Platform statistics"
              className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
              <AdminStatCard
                label="Jami foydalanuvchilar"
                value={data.stats.totalUsers}
                icon={Users}
                trend={data.stats.trends.totalUsers}
                format="compact"
              />
              <AdminStatCard
                label="Jami bizneslar"
                value={data.stats.totalBusinesses}
                icon={Building2}
                trend={data.stats.trends.totalBusinesses}
              />
              <AdminStatCard
                label="Jami bronlar"
                value={data.stats.totalBookings}
                icon={CalendarDays}
                trend={data.stats.trends.totalBookings}
                format="compact"
              />
              <AdminStatCard
                label="Daromad"
                value={data.stats.revenue}
                icon={CircleDollarSign}
                trend={data.stats.trends.revenue}
                format="currency"
                currency={data.stats.currency}
              />
            </section>

            <section
              aria-label="Operational overview"
              className="grid gap-6 xl:grid-cols-2"
            >
              <AdminRecentActivity items={data.recentActivity} />
              <AdminPendingApprovals items={data.pendingApprovals} />
            </section>
          </>
        )}
      </AdminAsyncState>
    </div>
  );
}
