'use client';

import { useQuery } from '@tanstack/react-query';

import {
  getAdminOverview,
  listAdminAuditLogs,
  listAdminVerifications,
} from '../api/admin.api';
import { ADMIN_QUERY_KEYS } from '../constants/admin-query.constants';
import { mapOverviewToDashboard } from '../mappers/admin-dashboard.mapper';
import { useAdminAccessToken } from './use-admin-access-token';

export function useAdminOverview() {
  const token = useAdminAccessToken();

  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.overview,
    enabled: Boolean(token),
    queryFn: async () => {
      if (!token) {
        throw new Error('Authentication required');
      }

      const [overview, auditLogs, pendingVerifications] = await Promise.all([
        getAdminOverview(token),
        listAdminAuditLogs(token, { limit: 8, page: 1 }),
        listAdminVerifications(token, {
          status: 'pending',
          limit: 5,
          page: 1,
        }),
      ]);

      return mapOverviewToDashboard(
        overview,
        auditLogs.data,
        pendingVerifications.data,
      );
    },
  });
}
