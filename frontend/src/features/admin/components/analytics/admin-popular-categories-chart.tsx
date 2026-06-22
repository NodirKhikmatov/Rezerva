'use client';

import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { getCategoryLabel } from '../../utils/admin-business-labels.utils';
import { ADMIN_CHART_COLORS } from '../../constants/admin-chart.constants';
import type { AdminCategoryMetric } from '../../types/admin-analytics.types';
import { AdminAnalyticsChartCard } from './admin-analytics-chart-card';
import { AdminChartTooltip } from './admin-chart-tooltip';

type AdminPopularCategoriesChartProps = {
  data: AdminCategoryMetric[];
};

type CategoryChartRow = AdminCategoryMetric & {
  label: string;
};

export function AdminPopularCategoriesChart({
  data,
}: AdminPopularCategoriesChartProps) {
  const chartData = useMemo<CategoryChartRow[]>(
    () =>
      [...data]
        .sort((left, right) => right.bookings - left.bookings)
        .map((item) => ({
          ...item,
          label: getCategoryLabel(item.category),
        })),
    [data],
  );

  return (
    <AdminAnalyticsChartCard
      title="Mashhur kategoriyalar"
      description="Kategoriya bo'yicha bronlar ulushi."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
        >
          <CartesianGrid stroke={ADMIN_CHART_COLORS.grid} horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: ADMIN_CHART_COLORS.axis, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fill: ADMIN_CHART_COLORS.axis, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={88}
          />
          <Tooltip content={<AdminChartTooltip />} />
          <Bar
            dataKey="bookings"
            name="Bronlar"
            radius={[0, 6, 6, 0]}
            maxBarSize={20}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={entry.category}
                fill={
                  ADMIN_CHART_COLORS.categoryPalette[
                    index % ADMIN_CHART_COLORS.categoryPalette.length
                  ]
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </AdminAnalyticsChartCard>
  );
}
