import { LoginPageClient } from '@/features/auth/components/login-page-client';

type LoginPageProps = {
  searchParams: Promise<{ returnUrl?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? '';

  return (
    <LoginPageClient botUsername={botUsername} returnUrl={params.returnUrl} />
  );
}
