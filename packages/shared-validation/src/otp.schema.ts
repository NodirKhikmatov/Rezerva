import { z } from 'zod';

export const otpSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, 'OTP must be exactly 6 digits');

export type OtpInput = z.input<typeof otpSchema>;
export type OtpValue = z.output<typeof otpSchema>;
