'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { formatCompactNumber } from '@/shared/lib/format';

import { ADMIN_CHART_COLORS } from '../../constants/admin-chart.constants';
import type { AdminDailyMetric } from '../../types/admin-analytics.types';
import { AdminAnalyticsChartCard } from './admin-analytics-chart-card';
import { AdminChartTooltip } from './admin-chart-tooltip';

type AdminRevenueChartProps = {
  data: AdminDailyMetric[];
  currency: string;
};

function formatRevenue(value: number, currency: string): string {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function AdminRevenueChart({ data, currency }: AdminRevenueChartProps) {
  return (
    <AdminAnalyticsChartCard
      title="Daromad"
      description="Kunlik to'lovlar va komissiya yig'indisi."
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={ADMIN_CHART_COLORS.success}
                stopOpacity={0.35}
              />
              <stop
                offset="100%"
                stopColor={ADMIN_CHART_COLORS.success}
                stopOpacity={0.02}
              />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={ADMIN_CHART_COLORS.grid} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: ADMIN_CHART_COLORS.axis, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            tick={{ fill: ADMIN_CHART_COLORS.axis, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={(value: number) => formatCompactNumber(value)}
          />
          <Tooltip
            cursor={{ stroke: ADMIN_CHART_COLORS.success, strokeWidth: 1 }}
            content={
              <AdminChartTooltip
                formatter={(value) => formatRevenue(value ?? 0, currency)}
              />
            }
          />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Daromad"
            stroke={ADMIN_CHART_COLORS.success}
            strokeWidth={2}
            fill="url(#revenueGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </AdminAnalyticsChartCard>
  );
}
