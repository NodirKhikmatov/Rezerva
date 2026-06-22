import { BusinessCategory } from '@rezerva/shared-constants';

import { addDays, toDateKey } from '@/shared/lib/format';

import type {
  AdminAnalyticsData,
  AdminCategoryMetric,
  AdminDailyMetric,
} from '../types/admin-analytics.types';

const ANALYTICS_DAYS = 90;

const CATEGORY_WEIGHTS: Record<
  (typeof BusinessCategory)[keyof typeof BusinessCategory],
  number
> = {
  [BusinessCategory.salon]: 0.28,
  [BusinessCategory.football]: 0.22,
  [BusinessCategory.restaurant]: 0.18,
  [BusinessCategory.clinic]: 0.14,
  [BusinessCategory.hotel]: 0.1,
  [BusinessCategory.coworking]: 0.08,
};

function seededValue(seed: number, min: number, max: number): number {
  const normalized = Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1;
  return Math.round(min + normalized * (max - min));
}

function formatDayLabel(date: Date): string {
  return new Intl.DateTimeFormat('uz-UZ', {
    day: 'numeric',
    month: 'short',
    timeZone: 'Asia/Tashkent',
  }).format(date);
}

function buildDailyMetrics(): AdminDailyMetric[] {
  const endDate = new Date();
  endDate.setHours(0, 0, 0, 0);
  const startDate = addDays(endDate, -(ANALYTICS_DAYS - 1));

  return Array.from({ length: ANALYTICS_DAYS }, (_, index) => {
    const date = addDays(startDate, index);
    const dayOfWeek = date.getDay();
    const weekendBoost = dayOfWeek === 0 || dayOfWeek === 6 ? 1.25 : 1;
    const trendBoost = 1 + index / ANALYTICS_DAYS / 2;
    const seed = index + 1;

    const bookings = Math.round(
      seededValue(seed, 42, 98) * weekendBoost * trendBoost,
    );
    const revenue = bookings * seededValue(seed + 100, 85000, 145000);
    const activeUsers = Math.round(
      seededValue(seed + 200, 820, 1480) * trendBoost,
    );

    return {
      date: toDateKey(date),
      label: formatDayLabel(date),
      bookings,
      revenue,
      activeUsers,
    };
  });
}

function buildCategoryMetrics(
  daily: AdminDailyMetric[],
): AdminCategoryMetric[] {
  const totalBookings = daily.reduce((sum, day) => sum + day.bookings, 0);
  const totalRevenue = daily.reduce((sum, day) => sum + day.revenue, 0);

  return Object.entries(CATEGORY_WEIGHTS).map(([category, weight], index) => {
    const bookings = Math.round(totalBookings * weight);
    const revenue = Math.round(
      (totalRevenue * weight * seededValue(index, 95, 105)) / 100,
    );

    return {
      category: category as AdminCategoryMetric['category'],
      bookings,
      revenue,
      sharePercent: Math.round(weight * 100),
    };
  });
}

function buildSummary(
  daily: AdminDailyMetric[],
  categories: AdminCategoryMetric[],
): AdminAnalyticsData['summary'] {
  const totalBookings = daily.reduce((sum, day) => sum + day.bookings, 0);
  const totalRevenue = daily.reduce((sum, day) => sum + day.revenue, 0);
  const averageActiveUsers = Math.round(
    daily.reduce((sum, day) => sum + day.activeUsers, 0) / daily.length,
  );
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

export function getAdminAnalyticsMock(): AdminAnalyticsData {
  const daily = buildDailyMetrics();
  const categories = buildCategoryMetrics(daily);

  return {
    currency: 'UZS',
    daily,
    categories,
    summary: buildSummary(daily, categories),
  };
}
