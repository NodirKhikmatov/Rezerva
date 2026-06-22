'use client';

import { useAuth } from '@/features/auth/hooks/use-auth';

export function useAdminAccessToken(): string | null {
  const { accessToken } = useAuth();
  return accessToken;
}
