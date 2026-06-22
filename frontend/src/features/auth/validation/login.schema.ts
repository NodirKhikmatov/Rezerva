import { phoneSchema } from '@rezerva/shared-validation';
import { z } from 'zod';

export const loginPhoneSchema = z.object({
  phone: phoneSchema,
});

export type LoginPhoneFormValues = z.infer<typeof loginPhoneSchema>;
