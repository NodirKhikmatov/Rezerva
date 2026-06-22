'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  approveAdminVerification,
  listAdminVerifications,
  rejectAdminVerification,
} from '../api/admin.api';
import { ADMIN_QUERY_KEYS } from '../constants/admin-query.constants';
import { mapVerificationToBusinessRecord } from '../mappers/admin-business.mapper';
import type { AdminBusinessFilters } from '../types/admin-business.types';
import { useAdminAccessToken } from './use-admin-access-token';

const VERIFICATION_FETCH_LIMIT = 100;

export function useAdminBusinesses(filters: AdminBusinessFilters) {
  const token = useAdminAccessToken();

  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.verifications({
      status: filters.verificationStatus,
    }),
    enabled: Boolean(token),
    queryFn: async () => {
      if (!token) {
        throw new Error('Authentication required');
      }

      const statusParam =
        filters.verificationStatus === 'all'
          ? undefined
          : filters.verificationStatus;

      const response = await listAdminVerifications(token, {
        status: statusParam,
        limit: VERIFICATION_FETCH_LIMIT,
        page: 1,
      });

      return response.data.map(mapVerificationToBusinessRecord);
    },
  });
}

export function useAdminBusinessMutations() {
  const token = useAdminAccessToken();
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['admin', 'verifications'],
    });
    await queryClient.invalidateQueries({
      queryKey: ADMIN_QUERY_KEYS.overview,
    });
  };

  const approveMutation = useMutation({
    mutationFn: async ({
      verificationId,
      notes,
    }: {
      verificationId: string;
      notes: string;
    }) => {
      if (!token) {
        throw new Error('Authentication required');
      }

      return approveAdminVerification(token, verificationId, notes);
    },
    onSuccess: invalidate,
  });

  const rejectMutation = useMutation({
    mutationFn: async ({
      verificationId,
      reason,
      message,
    }: {
      verificationId: string;
      reason: string;
      message: string;
    }) => {
      if (!token) {
        throw new Error('Authentication required');
      }

      return rejectAdminVerification(token, verificationId, {
        reason,
        message,
      });
    },
    onSuccess: invalidate,
  });

  return { approveMutation, rejectMutation };
}
