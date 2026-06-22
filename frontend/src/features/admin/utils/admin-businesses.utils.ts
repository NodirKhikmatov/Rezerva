import type { BusinessCategory } from '@rezerva/shared-constants';

import type { PaginationMeta } from '@/shared/types/pagination.types';

import type {
  AdminBusinessFilters,
  AdminBusinessRecord,
  AdminBusinessVerificationStatus,
} from '../types/admin-business.types';

export const ADMIN_BUSINESSES_PAGE_SIZE = 10;

function matchesSearch(business: AdminBusinessRecord, search: string): boolean {
  const query = search.trim().toLowerCase();

  if (!query) {
    return true;
  }

  const haystack = [
    business.name,
    business.slug,
    business.ownerName,
    business.ownerPhone,
    business.ownerEmail,
    business.city,
    business.district,
    business.id,
    business.taxId,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
}

function matchesVerificationStatus(
  business: AdminBusinessRecord,
  status: AdminBusinessVerificationStatus | 'all',
): boolean {
  return status === 'all' || business.verificationStatus === status;
}

function matchesCategory(
  business: AdminBusinessRecord,
  category: BusinessCategory | 'all',
): boolean {
  return category === 'all' || business.category === category;
}

function matchesCity(
  business: AdminBusinessRecord,
  city: string | 'all',
): boolean {
  return city === 'all' || business.city === city;
}

export function filterAdminBusinesses(
  businesses: AdminBusinessRecord[],
  filters: AdminBusinessFilters,
): AdminBusinessRecord[] {
  return businesses.filter(
    (business) =>
      matchesSearch(business, filters.search) &&
      matchesVerificationStatus(business, filters.verificationStatus) &&
      matchesCategory(business, filters.category) &&
      matchesCity(business, filters.city),
  );
}

export function paginateAdminBusinesses(
  businesses: AdminBusinessRecord[],
  page: number,
  limit = ADMIN_BUSINESSES_PAGE_SIZE,
): { data: AdminBusinessRecord[]; meta: PaginationMeta } {
  const total = businesses.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * limit;

  return {
    data: businesses.slice(start, start + limit),
    meta: {
      page: safePage,
      limit,
      total,
      totalPages,
    },
  };
}

export function maskOwnerPhone(phone: string): string {
  if (phone.length < 8) {
    return phone;
  }

  return `${phone.slice(0, 7)} *** ** ${phone.slice(-2)}`;
}
