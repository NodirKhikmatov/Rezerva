import type { BusinessCategory } from '@rezerva/shared-constants';

import { addDays, toDateKey } from '@/shared/lib/format';

import type { AdminBookingListItem } from '../api/admin-api.types';
import type {
  AdminAnalyticsData,
  AdminAnalyticsPeriod,
  AdminCategoryMetric,
  AdminDailyMetric,
} from '../types/admin-analytics.types';
import { sliceDailyMetrics } from '../utils/admin-analytics.utils';

function formatDayLabel(date: Date): string {
  return new Intl.DateTimeFormat('uz-UZ', {
    day: 'numeric',
    month: 'short',
    timeZone: 'Asia/Tashkent',
  }).format(date);
}

function buildDailyMetrics(
  bookings: AdminBookingListItem[],
  from: Date,
  days: number,
): AdminDailyMetric[] {
  const dailyMap = new Map<
    string,
    { bookings: number; revenue: number; users: Set<string> }
  >();

  for (let index = 0; index < days; index += 1) {
    const date = addDays(from, index);
    dailyMap.set(toDateKey(date), {
      bookings: 0,
      revenue: 0,
      users: new Set(),
    });
  }

  for (const booking of bookings) {
    const dateKey = booking.startsAt.slice(0, 10);
    const bucket = dailyMap.get(dateKey);

    if (!bucket) {
      continue;
    }

    bucket.bookings += 1;
    bucket.revenue += booking.totalAmount;

    if (booking.userId) {
      bucket.users.add(booking.userId);
    }
  }

  return Array.from(dailyMap.entries()).map(([date, bucket]) => ({
    date,
    label: formatDayLabel(new Date(`${date}T12:00:00Z`)),
    bookings: bucket.bookings,
    revenue: bucket.revenue,
    activeUsers: bucket.users.size,
  }));
}

function buildCategoryMetrics(
  bookings: AdminBookingListItem[],
): AdminCategoryMetric[] {
  const totals = new Map<string, { bookings: number; revenue: number }>();

  for (const booking of bookings) {
    const category = booking.businessCategory;
    const current = totals.get(category) ?? { bookings: 0, revenue: 0 };
    current.bookings += 1;
    current.revenue += booking.totalAmount;
    totals.set(category, current);
  }

  const grandTotal = Array.from(totals.values()).reduce(
    (sum, item) => sum + item.bookings,
    0,
  );

  return Array.from(totals.entries()).map(([category, stats]) => ({
    category: category as BusinessCategory,
    bookings: stats.bookings,
    revenue: stats.revenue,
    sharePercent: grandTotal
      ? Math.round((stats.bookings / grandTotal) * 100)
      : 0,
  }));
}

export function mapBookingsToAnalytics(
  bookings: AdminBookingListItem[],
  period: AdminAnalyticsPeriod,
  currency: string,
): AdminAnalyticsData {
  const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const endDate = new Date();
  endDate.setHours(0, 0, 0, 0);
  const startDate = addDays(endDate, -(periodDays - 1));

  const daily = buildDailyMetrics(bookings, startDate, periodDays);
  const categories = buildCategoryMetrics(bookings);
  const periodDaily = sliceDailyMetrics(daily, period);

  const totalBookings = periodDaily.reduce((sum, day) => sum + day.bookings, 0);
  const totalRevenue = periodDaily.reduce((sum, day) => sum + day.revenue, 0);
  const averageActiveUsers = periodDaily.length
    ? Math.round(
        periodDaily.reduce((sum, day) => sum + day.activeUsers, 0) /
          periodDaily.length,
      )
    : 0;
  const topCategory = categories.reduce(
    (top, current) => (current.bookings > top.bookings ? current : top),
    categories[0] ?? {
      category: 'salon' as BusinessCategory,
      bookings: 0,
      revenue: 0,
      sharePercent: 0,
    },
  ).category;

  return {
    currency,
    daily,
    categories,
    summary: {
      totalBookings,
      totalRevenue,
      averageActiveUsers,
      topCategory,
    },
  };
}
