'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '@/features/auth/hooks/use-auth';

type GuestGuardProps = {
  children: React.ReactNode;
  redirectTo?: string;
};

export function GuestGuard({ children, redirectTo = '/' }: GuestGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

  if (isLoading || isAuthenticated) {
    return null;
  }

  return children;
}
