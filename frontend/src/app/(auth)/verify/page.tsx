import Link from 'next/link';
import { redirect } from 'next/navigation';

import { AuthLayoutCard } from '@/features/auth/components/auth-layout-card';
import { OtpVerifyForm } from '@/features/auth/components/otp-verify-form';
import { Button } from '@/shared/components/ui/button';

type VerifyPageProps = {
  searchParams: Promise<{ phone?: string; returnUrl?: string }>;
};

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const params = await searchParams;

  if (!params.phone) {
    redirect('/login');
  }

  return (
    <AuthLayoutCard
      title="Enter verification code"
      description="We sent a 6-digit code to your phone."
    >
      <OtpVerifyForm phone={params.phone} returnUrl={params.returnUrl} />
      <div className="mt-6 flex justify-center">
        <Button variant="link" asChild>
          <Link href="/login">Back to login</Link>
        </Button>
      </div>
    </AuthLayoutCard>
  );
}
