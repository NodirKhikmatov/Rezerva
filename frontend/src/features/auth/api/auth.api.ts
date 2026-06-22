import { apiRequest } from '@/shared/lib/api-client';

import type { AuthSession, TelegramLoginPayload } from '../types/auth.types';

export async function loginWithTelegram(
  payload: TelegramLoginPayload,
): Promise<AuthSession> {
  return apiRequest<AuthSession>('/v1/auth/telegram', {
    method: 'POST',
    body: payload,
  });
}

export async function sendOtp(phone: string): Promise<void> {
  await apiRequest<void>('/v1/auth/otp/send', {
    method: 'POST',
    body: { phone },
  });
}

export async function verifyOtp(
  phone: string,
  code: string,
): Promise<AuthSession> {
  return apiRequest<AuthSession>('/v1/auth/otp/verify', {
    method: 'POST',
    body: { phone, code },
  });
}
