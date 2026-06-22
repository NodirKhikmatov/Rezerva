'use client';

import { AuthLayoutCard } from '@/features/auth/components/auth-layout-card';
import { GuestGuard } from '@/features/auth/components/guest-guard';
import { LoginForm } from '@/features/auth/components/login-form';

type LoginPageClientProps = {
  botUsername: string;
  returnUrl?: string;
};

export function LoginPageClient({
  botUsername,
  returnUrl,
}: LoginPageClientProps) {
  return (
    <GuestGuard
      redirectTo={returnUrl && returnUrl.startsWith('/') ? returnUrl : '/'}
    >
      <AuthLayoutCard
        title="Welcome back"
        description="Sign in with your phone number or Telegram account."
      >
        <LoginForm botUsername={botUsername} returnUrl={returnUrl} />
      </AuthLayoutCard>
    </GuestGuard>
  );
}
