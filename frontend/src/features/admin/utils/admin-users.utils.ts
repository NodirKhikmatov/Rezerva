import type { PlatformRole } from '@rezerva/shared-constants';

import type { PaginationMeta } from '@/shared/types/pagination.types';

import type {
  AdminUserFilters,
  AdminUserRecord,
  AdminUserStatus,
} from '../types/admin-user.types';

export const ADMIN_USERS_PAGE_SIZE = 10;

export function getUserDisplayName(user: AdminUserRecord): string {
  const fullName = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();

  if (fullName) {
    return fullName;
  }

  if (user.username) {
    return `@${user.username}`;
  }

  return user.phone ?? user.email ?? user.id;
}

export function getUserInitials(user: AdminUserRecord): string {
  const name = getUserDisplayName(user).replace('@', '');
  const parts = name.split(' ').filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase();
  }

  return name.slice(0, 2).toUpperCase();
}

function matchesSearch(user: AdminUserRecord, search: string): boolean {
  const query = search.trim().toLowerCase();

  if (!query) {
    return true;
  }

  const haystack = [
    user.firstName,
    user.lastName,
    user.phone,
    user.email,
    user.username,
    user.id,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
}

function matchesStatus(
  user: AdminUserRecord,
  status: AdminUserStatus | 'all',
): boolean {
  return status === 'all' || user.status === status;
}

function matchesRole(
  user: AdminUserRecord,
  role: PlatformRole | 'all',
): boolean {
  return role === 'all' || user.role === role;
}

export function filterAdminUsers(
  users: AdminUserRecord[],
  filters: AdminUserFilters,
): AdminUserRecord[] {
  return users.filter(
    (user) =>
      matchesSearch(user, filters.search) &&
      matchesStatus(user, filters.status) &&
      matchesRole(user, filters.role),
  );
}

export function paginateAdminUsers(
  users: AdminUserRecord[],
  page: number,
  limit = ADMIN_USERS_PAGE_SIZE,
): { data: AdminUserRecord[]; meta: PaginationMeta } {
  const total = users.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * limit;

  return {
    data: users.slice(start, start + limit),
    meta: {
      page: safePage,
      limit,
      total,
      totalPages,
    },
  };
}

export function maskPhone(phone: string | null): string {
  if (!phone) {
    return '—';
  }

  if (phone.length < 8) {
    return phone;
  }

  return `${phone.slice(0, 7)} *** ** ${phone.slice(-2)}`;
}
