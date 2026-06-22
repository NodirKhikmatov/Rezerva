'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Typography } from '@/shared/components/ui/typography';

import { sendOtp, verifyOtp } from '../api/auth.api';
import { useAuth } from '../hooks/use-auth';
import {
  verifyOtpSchema,
  type VerifyOtpFormValues,
} from '../validation/verify.schema';

const RESEND_COOLDOWN_SECONDS = 60;

type OtpVerifyFormProps = {
  phone: string;
  returnUrl?: string;
};

export function OtpVerifyForm({ phone, returnUrl }: OtpVerifyFormProps) {
  const router = useRouter();
  const { setSession } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN_SECONDS);
  const [isResending, setIsResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { code: '' },
  });

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((value) => value - 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  const redirectAfterAuth = () => {
    router.push(returnUrl && returnUrl.startsWith('/') ? returnUrl : '/');
    router.refresh();
  };

  const onSubmit = async (values: VerifyOtpFormValues) => {
    setApiError(null);

    try {
      const session = await verifyOtp(phone, values.code);
      setSession(session);
      redirectAfterAuth();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Invalid verification code';
      setApiError(message);
    }
  };

  const handleResend = async () => {
    if (secondsLeft > 0 || isResending) {
      return;
    }

    setApiError(null);
    setIsResending(true);

    try {
      await sendOtp(phone);
      setSecondsLeft(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to resend OTP';
      setApiError(message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <Typography variant="muted" className="text-center">
        Code sent to {phone}
      </Typography>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="code">Verification code</Label>
          <Input
            id="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            maxLength={6}
            aria-invalid={Boolean(errors.code)}
            {...register('code')}
          />
          {errors.code && (
            <Typography
              variant="small"
              className="text-destructive"
              role="alert"
            >
              {errors.code.message}
            </Typography>
          )}
        </div>

        {apiError && (
          <Typography variant="small" className="text-destructive" role="alert">
            {apiError}
          </Typography>
        )}

        <Button type="submit" fullWidth loading={isSubmitting}>
          Verify and continue
        </Button>
      </form>

      <div className="flex flex-col items-center gap-2 text-center">
        <Button
          type="button"
          variant="ghost"
          disabled={secondsLeft > 0 || isResending}
          onClick={handleResend}
        >
          {secondsLeft > 0 ? `Resend code in ${secondsLeft}s` : 'Resend code'}
        </Button>
        <Link
          href="/login"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          Use a different number
        </Link>
      </div>
    </div>
  );
}
