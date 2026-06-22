'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { ADMIN_CHART_COLORS } from '../../constants/admin-chart.constants';
import type { AdminDailyMetric } from '../../types/admin-analytics.types';
import { AdminAnalyticsChartCard } from './admin-analytics-chart-card';
import { AdminChartTooltip } from './admin-chart-tooltip';

type AdminDailyBookingsChartProps = {
  data: AdminDailyMetric[];
};

export function AdminDailyBookingsChart({
  data,
}: AdminDailyBookingsChartProps) {
  return (
    <AdminAnalyticsChartCard
      title="Kunlik bronlar"
      description="Kun bo'yicha tasdiqlangan va yakunlangan bronlar soni."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
            width={40}
          />
          <Tooltip
            cursor={{ fill: ADMIN_CHART_COLORS.primarySoft }}
            content={<AdminChartTooltip />}
          />
          <Bar
            dataKey="bookings"
            name="Bronlar"
            fill={ADMIN_CHART_COLORS.primary}
            radius={[6, 6, 0, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </AdminAnalyticsChartCard>
  );
}
