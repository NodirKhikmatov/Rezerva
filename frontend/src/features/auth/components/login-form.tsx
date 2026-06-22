'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Typography } from '@/shared/components/ui/typography';

import { sendOtp } from '../api/auth.api';
import { useAuth } from '../hooks/use-auth';
import type { AuthSession } from '../types/auth.types';
import {
  loginPhoneSchema,
  type LoginPhoneFormValues,
} from '../validation/login.schema';
import { TelegramLoginButton } from './telegram-login-button';

type LoginFormProps = {
  botUsername?: string;
  returnUrl?: string;
};

export function LoginForm({ botUsername, returnUrl }: LoginFormProps) {
  const router = useRouter();
  const { setSession } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginPhoneFormValues>({
    resolver: zodResolver(loginPhoneSchema),
    defaultValues: { phone: '' },
  });

  const redirectAfterAuth = () => {
    router.push(returnUrl && returnUrl.startsWith('/') ? returnUrl : '/');
    router.refresh();
  };

  const handleTelegramSuccess = (session: AuthSession) => {
    setSession(session);
    redirectAfterAuth();
  };

  const onSubmit = async (values: LoginPhoneFormValues) => {
    setApiError(null);

    try {
      await sendOtp(values.phone);
      const params = new URLSearchParams({ phone: values.phone });
      if (returnUrl) {
        params.set('returnUrl', returnUrl);
      }
      router.push(`/verify?${params.toString()}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to send OTP';
      setApiError(message);
    }
  };

  return (
    <div className="flex w-full flex-col gap-8">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">Phone number</Label>
          <div className="flex gap-2">
            <span className="inline-flex h-10 items-center rounded-xl border border-input bg-muted px-3 text-sm font-medium">
              +998
            </span>
            <Input
              id="phone"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="90 123 45 67"
              aria-invalid={Boolean(errors.phone)}
              className="flex-1"
              {...register('phone')}
            />
          </div>
          {errors.phone && (
            <Typography
              variant="small"
              className="text-destructive"
              role="alert"
            >
              {errors.phone.message}
            </Typography>
          )}
        </div>

        {apiError && (
          <Typography variant="small" className="text-destructive" role="alert">
            {apiError}
          </Typography>
        )}

        <Button type="submit" fullWidth loading={isSubmitting}>
          Continue with SMS
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-card px-3 text-xs text-muted-foreground">
            or continue with
          </span>
        </div>
      </div>

      {botUsername ? (
        <TelegramLoginButton
          botUsername={botUsername}
          onSuccess={handleTelegramSuccess}
          onError={(error) => setApiError(error.message)}
        />
      ) : (
        <Typography variant="muted" className="text-center">
          Set NEXT_PUBLIC_TELEGRAM_BOT_USERNAME to enable Telegram login.
        </Typography>
      )}
    </div>
  );
}
