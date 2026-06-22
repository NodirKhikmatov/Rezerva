import { z } from 'zod';

const UZBEKISTAN_E164_REGEX = /^\+998\d{9}$/;

export function normalizeUzbekistanPhone(value: string): string {
  const digits = value.replace(/\D/g, '');

  if (digits.startsWith('998') && digits.length === 12) {
    return `+${digits}`;
  }

  if (digits.length === 9) {
    return `+998${digits}`;
  }

  if (value.startsWith('+998') && UZBEKISTAN_E164_REGEX.test(value)) {
    return value;
  }

  return value;
}

export const phoneSchema = z
  .string()
  .trim()
  .transform(normalizeUzbekistanPhone)
  .refine((value) => UZBEKISTAN_E164_REGEX.test(value), {
    message: 'Phone must be a valid Uzbekistan E.164 number (+998XXXXXXXXX)',
  });

export type PhoneInput = z.input<typeof phoneSchema>;
export type PhoneValue = z.output<typeof phoneSchema>;
