import { apiRequest } from '@/shared/lib/api-client';
import type { PaginatedResponse } from '@/shared/types/pagination.types';

import type { NotificationItem } from '../types/notification.types';

export async function listNotifications(
  token: string,
  params: { unreadOnly?: boolean; page?: number; limit?: number } = {},
): Promise<PaginatedResponse<NotificationItem> & { unreadCount: number }> {
  const searchParams = new URLSearchParams();
  if (params.unreadOnly) searchParams.set('unreadOnly', 'true');
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  const query = searchParams.toString();

  return apiRequest<
    PaginatedResponse<NotificationItem> & { unreadCount: number }
  >(`/v1/notifications${query ? `?${query}` : ''}`, { token });
}

export async function markNotificationRead(
  token: string,
  notificationId: string,
): Promise<{ id: string; isRead: boolean }> {
  return apiRequest<{ id: string; isRead: boolean }>(
    `/v1/notifications/${notificationId}/read`,
    { method: 'PATCH', token },
  );
}

export async function markAllNotificationsRead(
  token: string,
): Promise<{ markedCount: number }> {
  return apiRequest<{ markedCount: number }>('/v1/notifications/read-all', {
    method: 'POST',
    token,
  });
}

export async function getUnreadNotificationCount(
  token: string,
): Promise<{ count: number }> {
  return apiRequest<{ count: number }>('/v1/notifications/unread-count', {
    token,
  });
}
