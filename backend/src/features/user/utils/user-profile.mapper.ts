import { UserIdentitySummary, UserProfile } from '../types/user.types';

type UserWithIdentities = {
  id: string;
  phone: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  photoUrl: string | null;
  locale: UserProfile['locale'];
  role: UserProfile['role'];
  createdAt: Date;
  updatedAt: Date;
  identities: UserIdentitySummary[];
};

export function toUserProfile(user: UserWithIdentities): UserProfile {
  return {
    id: user.id,
    phone: user.phone,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    photoUrl: user.photoUrl,
    locale: user.locale,
    role: user.role,
    identities: user.identities,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
