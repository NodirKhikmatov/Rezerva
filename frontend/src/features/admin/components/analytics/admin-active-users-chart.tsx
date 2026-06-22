'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { ADMIN_CHART_COLORS } from '../../constants/admin-chart.constants';
import type { AdminDailyMetric } from '../../types/admin-analytics.types';
import { AdminAnalyticsChartCard } from './admin-analytics-chart-card';
import { AdminChartTooltip } from './admin-chart-tooltip';

type AdminActiveUsersChartProps = {
  data: AdminDailyMetric[];
};

export function AdminActiveUsersChart({ data }: AdminActiveUsersChartProps) {
  return (
    <AdminAnalyticsChartCard
      title="Faol foydalanuvchilar"
      description="Kunlik noyob faol foydalanuvchilar (DAU)."
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
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
            width={44}
          />
          <Tooltip content={<AdminChartTooltip />} />
          <Line
            type="monotone"
            dataKey="activeUsers"
            name="Faol foydalanuvchilar"
            stroke={ADMIN_CHART_COLORS.violet}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </AdminAnalyticsChartCard>
  );
}
