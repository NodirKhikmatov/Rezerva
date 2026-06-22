'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { Spinner } from '@/shared/components/ui/spinner';

type AuthGuardProps = {
  children: React.ReactNode;
  returnPath: string;
};

export function AuthGuard({ children, returnPath }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?returnUrl=${encodeURIComponent(returnPath)}`);
    }
  }, [isAuthenticated, isLoading, returnPath, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return children;
}
