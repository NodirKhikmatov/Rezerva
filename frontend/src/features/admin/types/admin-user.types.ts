import type { Locale, PlatformRole } from '@rezerva/shared-constants';

export const AdminUserStatus = {
  active: 'active',
  suspended: 'suspended',
  pending: 'pending',
} as const;

export type AdminUserStatus =
  (typeof AdminUserStatus)[keyof typeof AdminUserStatus];

export type AdminUserRecord = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  email: string | null;
  username: string | null;
  role: PlatformRole;
  status: AdminUserStatus;
  locale: Locale;
  bookingsCount: number;
  createdAt: string;
  lastActiveAt: string | null;
  suspendReason: string | null;
};

export type AdminUserFilters = {
  search: string;
  status: AdminUserStatus | 'all';
  role: PlatformRole | 'all';
};

export type AdminUserUpdateInput = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  locale: Locale;
  role: PlatformRole;
};
