import { IdentityProvider, Locale, PlatformRole } from '@prisma/client';

export type UserIdentitySummary = {
  provider: IdentityProvider;
  providerId: string;
};

export type UserProfile = {
  id: string;
  phone: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  photoUrl: string | null;
  locale: Locale;
  role: PlatformRole;
  identities: UserIdentitySummary[];
  createdAt: string;
  updatedAt: string;
};

export type UpdateUserProfileInput = {
  firstName?: string;
  lastName?: string;
  email?: string | null;
  locale?: Locale;
};
