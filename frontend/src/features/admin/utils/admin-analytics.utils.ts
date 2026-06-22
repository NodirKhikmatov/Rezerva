import type {
  AdminAnalyticsData,
  AdminAnalyticsPeriod,
  AdminCategoryMetric,
  AdminDailyMetric,
} from '../types/admin-analytics.types';

const PERIOD_DAYS: Record<AdminAnalyticsPeriod, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

export function sliceDailyMetrics(
  daily: AdminDailyMetric[],
  period: AdminAnalyticsPeriod,
): AdminDailyMetric[] {
  const days = PERIOD_DAYS[period];
  return daily.slice(-days);
}

export function buildPeriodSummary(
  daily: AdminDailyMetric[],
  categories: AdminCategoryMetric[],
): AdminAnalyticsData['summary'] {
  const totalBookings = daily.reduce((sum, day) => sum + day.bookings, 0);
  const totalRevenue = daily.reduce((sum, day) => sum + day.revenue, 0);
  const averageActiveUsers = daily.length
    ? Math.round(
        daily.reduce((sum, day) => sum + day.activeUsers, 0) / daily.length,
      )
    : 0;
  const topCategory = categories.reduce((top, current) =>
    current.bookings > top.bookings ? current : top,
  ).category;

  return {
    totalBookings,
    totalRevenue,
    averageActiveUsers,
    topCategory,
  };
}

export function getPeriodLabel(period: AdminAnalyticsPeriod): string {
  switch (period) {
    case '7d':
      return '7 kun';
    case '30d':
      return '30 kun';
    case '90d':
      return '90 kun';
  }
}

export const ADMIN_ANALYTICS_PERIODS: AdminAnalyticsPeriod[] = [
  '7d',
  '30d',
  '90d',
];
