'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { cancelAdminBooking, listAdminBookings } from '../api/admin.api';
import { ADMIN_QUERY_KEYS } from '../constants/admin-query.constants';
import { mapAdminBookingListItem } from '../mappers/admin-booking.mapper';
import type { AdminBookingFilters } from '../types/admin-booking.types';
import { useAdminAccessToken } from './use-admin-access-token';

const BOOKINGS_FETCH_LIMIT = 100;

function buildServerFilters(filters: AdminBookingFilters) {
  const trimmedSearch = filters.search.trim();

  return {
    referenceCode: trimmedSearch.startsWith('RZ-') ? trimmedSearch : undefined,
    status: filters.status === 'all' ? undefined : filters.status,
    from: filters.dateFrom || undefined,
    to: filters.dateTo || undefined,
  };
}

export function useAdminBookings(filters: AdminBookingFilters) {
  const token = useAdminAccessToken();
  const serverFilters = buildServerFilters(filters);

  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.bookings(serverFilters),
    enabled: Boolean(token),
    queryFn: async () => {
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await listAdminBookings(token, {
        ...serverFilters,
        limit: BOOKINGS_FETCH_LIMIT,
        page: 1,
      });

      return response.data.map(mapAdminBookingListItem);
    },
  });
}

export function useAdminBookingMutations() {
  const token = useAdminAccessToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bookingId,
      reason,
      refundOverride,
      notes,
    }: {
      bookingId: string;
      reason: string;
      refundOverride: 'none' | 'partial' | 'full';
      notes: string;
    }) => {
      if (!token) {
        throw new Error('Authentication required');
      }

      return cancelAdminBooking(token, bookingId, {
        reason,
        refundOverride,
        notes,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
      await queryClient.invalidateQueries({
        queryKey: ADMIN_QUERY_KEYS.overview,
      });
      await queryClient.invalidateQueries({
        queryKey: ['admin', 'analytics-bookings'],
      });
    },
  });
}
