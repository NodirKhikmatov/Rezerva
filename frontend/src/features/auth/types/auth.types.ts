import type { PlatformRole } from '@rezerva/shared-constants';

export type AuthUser = {
  id: string;
  telegramId: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  photoUrl: string | null;
  role?: PlatformRole;
};

export type AuthSession = {
  accessToken: string;
  user: AuthUser;
};

export type TelegramLoginPayload = Record<string, unknown>;
