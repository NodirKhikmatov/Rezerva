'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { isAdminSession } from '@/features/admin/utils/admin-auth.utils';
import { Spinner } from '@/shared/components/ui/spinner';

type AdminGuardProps = {
  children: React.ReactNode;
};

export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, accessToken, user } = useAuth();
  const isAdmin = isAdminSession(accessToken, user?.role ?? null);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace(`/login?returnUrl=${encodeURIComponent('/admin')}`);
      return;
    }

    if (!isAdmin) {
      router.replace('/admin/403');
    }
  }, [isAdmin, isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  return children;
}
