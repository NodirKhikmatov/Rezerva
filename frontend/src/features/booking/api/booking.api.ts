import { apiRequest } from '@/shared/lib/api-client';
import type { PaginatedResponse } from '@/shared/types/pagination.types';

import type {
  BookingDetail,
  BookingHold,
  BookingSummary,
  ConfirmBookingPayload,
  CreateHoldPayload,
} from '../types/booking.types';

export async function createHold(
  token: string,
  payload: CreateHoldPayload,
): Promise<BookingHold> {
  return apiRequest<BookingHold>('/v1/bookings/holds', {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function releaseHold(
  token: string,
  holdId: string,
): Promise<void> {
  return apiRequest<void>(`/v1/bookings/holds/${holdId}`, {
    method: 'DELETE',
    token,
  });
}

export async function confirmBooking(
  token: string,
  payload: ConfirmBookingPayload,
): Promise<BookingDetail> {
  return apiRequest<BookingDetail>('/v1/bookings', {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function listMyBookings(
  token: string,
  params: { status?: string; page?: number; limit?: number } = {},
): Promise<PaginatedResponse<BookingSummary>> {
  const searchParams = new URLSearchParams();
  if (params.status) searchParams.set('status', params.status);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  const query = searchParams.toString();

  return apiRequest<PaginatedResponse<BookingSummary>>(
    `/v1/bookings/me${query ? `?${query}` : ''}`,
    { token },
  );
}

export async function getBookingDetail(
  token: string,
  bookingId: string,
): Promise<BookingDetail> {
  return apiRequest<BookingDetail>(`/v1/bookings/${bookingId}`, { token });
}
