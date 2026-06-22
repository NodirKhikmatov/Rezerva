import { Locale, PlatformRole } from '@prisma/client';

export type RequestUser = {
  id: string;
  role: PlatformRole;
  locale: Locale;
  telegramId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
};
