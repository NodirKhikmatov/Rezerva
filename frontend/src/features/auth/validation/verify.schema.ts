import { otpSchema } from '@rezerva/shared-validation';
import { z } from 'zod';

export const verifyOtpSchema = z.object({
  code: otpSchema,
});

export type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>;
