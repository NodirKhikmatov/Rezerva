'use client';

import { useQuery } from '@tanstack/react-query';

import { addDays, toDateKey } from '@/shared/lib/format';

import { getAdminOverview, listAdminBookings } from '../api/admin.api';
import { ADMIN_QUERY_KEYS } from '../constants/admin-query.constants';
import { mapBookingsToAnalytics } from '../mappers/admin-analytics.mapper';
import type { AdminAnalyticsPeriod } from '../types/admin-analytics.types';
import { useAdminAccessToken } from './use-admin-access-token';

const ANALYTICS_FETCH_LIMIT = 100;

function getPeriodRange(period: AdminAnalyticsPeriod): {
  from: string;
  to: string;
} {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const endDate = new Date();
  endDate.setHours(0, 0, 0, 0);
  const startDate = addDays(endDate, -(days - 1));

  return {
    from: toDateKey(startDate),
    to: toDateKey(endDate),
  };
}

export function useAdminAnalytics(period: AdminAnalyticsPeriod) {
  const token = useAdminAccessToken();
  const range = getPeriodRange(period);

  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.analyticsBookings(range.from, range.to),
    enabled: Boolean(token),
    queryFn: async () => {
      if (!token) {
        throw new Error('Authentication required');
      }

      const [overview, bookingsResponse] = await Promise.all([
        getAdminOverview(token),
        listAdminBookings(token, {
          from: range.from,
          to: range.to,
          limit: ANALYTICS_FETCH_LIMIT,
          page: 1,
        }),
      ]);

      return mapBookingsToAnalytics(
        bookingsResponse.data,
        period,
        overview.currency,
      );
    },
  });
}
