import { apiRequest } from '@/shared/lib/api-client';

import type {
  AdminAuditLogsResponse,
  AdminBookingsResponse,
  AdminCancelBookingPayload,
  AdminOverviewResponse,
  AdminRejectVerificationPayload,
  AdminVerificationDetail,
  AdminVerificationsResponse,
} from './admin-api.types';

function buildQuery(
  params: Record<string, string | number | undefined>,
): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  }

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export async function getAdminOverview(
  token: string,
): Promise<AdminOverviewResponse> {
  return apiRequest<AdminOverviewResponse>('/v1/admin/overview', { token });
}

export async function listAdminVerifications(
  token: string,
  params: {
    status?: string;
    page?: number;
    limit?: number;
  } = {},
): Promise<AdminVerificationsResponse> {
  return apiRequest<AdminVerificationsResponse>(
    `/v1/admin/verifications${buildQuery(params)}`,
    { token },
  );
}

export async function getAdminVerification(
  token: string,
  verificationId: string,
): Promise<AdminVerificationDetail> {
  return apiRequest<AdminVerificationDetail>(
    `/v1/admin/verifications/${verificationId}`,
    { token },
  );
}

export async function approveAdminVerification(
  token: string,
  verificationId: string,
  notes: string,
): Promise<{ businessId: string; status: string; approvedAt: string }> {
  return apiRequest(`/v1/admin/verifications/${verificationId}/approve`, {
    method: 'POST',
    token,
    body: { notes },
  });
}

export async function rejectAdminVerification(
  token: string,
  verificationId: string,
  payload: AdminRejectVerificationPayload,
): Promise<{ status: string }> {
  return apiRequest(`/v1/admin/verifications/${verificationId}/reject`, {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function listAdminBookings(
  token: string,
  params: {
    referenceCode?: string;
    businessId?: string;
    userId?: string;
    status?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  } = {},
): Promise<AdminBookingsResponse> {
  return apiRequest<AdminBookingsResponse>(
    `/v1/admin/bookings${buildQuery(params)}`,
    { token },
  );
}

export async function cancelAdminBooking(
  token: string,
  bookingId: string,
  payload: AdminCancelBookingPayload,
): Promise<{
  id: string;
  status: string;
  cancellationFee: number;
  refundAmount: number;
  refundStatus: string | null;
}> {
  return apiRequest(`/v1/admin/bookings/${bookingId}/cancel`, {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function listAdminAuditLogs(
  token: string,
  params: {
    entityType?: string;
    entityId?: string;
    actorId?: string;
    action?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  } = {},
): Promise<AdminAuditLogsResponse> {
  return apiRequest<AdminAuditLogsResponse>(
    `/v1/admin/audit-logs${buildQuery(params)}`,
    { token },
  );
}
