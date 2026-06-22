import type { BookingStatus } from '@rezerva/shared-constants';

import type { PaginationMeta } from '@/shared/types/pagination.types';
import {
  formatPrice,
  formatSlotDate,
  formatSlotTime,
} from '@/shared/lib/format';

import type {
  AdminBookingFilters,
  AdminBookingPaymentMethod,
  AdminBookingRecord,
} from '../types/admin-booking.types';

export const ADMIN_BOOKINGS_PAGE_SIZE = 10;

function matchesSearch(booking: AdminBookingRecord, search: string): boolean {
  const query = search.trim().toLowerCase();

  if (!query) {
    return true;
  }

  const haystack = [
    booking.referenceCode,
    booking.businessName,
    booking.consumerName,
    booking.consumerPhone,
    booking.serviceName,
    booking.resourceName,
    booking.city,
    booking.id,
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
}

function matchesStatus(
  booking: AdminBookingRecord,
  status: BookingStatus | 'all',
): boolean {
  return status === 'all' || booking.status === status;
}

function matchesPaymentMethod(
  booking: AdminBookingRecord,
  method: AdminBookingPaymentMethod | 'all',
): boolean {
  return method === 'all' || booking.paymentMethod === method;
}

function matchesDateRange(
  booking: AdminBookingRecord,
  dateFrom: string,
  dateTo: string,
): boolean {
  const slotDate = booking.startsAt.slice(0, 10);

  if (dateFrom && slotDate < dateFrom) {
    return false;
  }

  if (dateTo && slotDate > dateTo) {
    return false;
  }

  return true;
}

export function filterAdminBookings(
  bookings: AdminBookingRecord[],
  filters: AdminBookingFilters,
): AdminBookingRecord[] {
  return bookings.filter(
    (booking) =>
      matchesSearch(booking, filters.search) &&
      matchesStatus(booking, filters.status) &&
      matchesPaymentMethod(booking, filters.paymentMethod) &&
      matchesDateRange(booking, filters.dateFrom, filters.dateTo),
  );
}

export function paginateAdminBookings(
  bookings: AdminBookingRecord[],
  page: number,
  limit = ADMIN_BOOKINGS_PAGE_SIZE,
): { data: AdminBookingRecord[]; meta: PaginationMeta } {
  const total = bookings.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * limit;

  return {
    data: bookings.slice(start, start + limit),
    meta: {
      page: safePage,
      limit,
      total,
      totalPages,
    },
  };
}

export function maskConsumerPhone(phone: string): string {
  if (phone.length < 8) {
    return phone;
  }

  return `${phone.slice(0, 7)} *** ** ${phone.slice(-2)}`;
}

function escapeCsvValue(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

export function exportBookingsToCsv(bookings: AdminBookingRecord[]): void {
  const headers = [
    'Reference',
    'Status',
    'Business',
    'Consumer',
    'Phone',
    'Service',
    'Resource',
    'City',
    'Date',
    'Start',
    'End',
    'Amount',
    'Payment Method',
    'Payment Status',
    'Created',
  ];

  const rows = bookings.map((booking) => [
    booking.referenceCode,
    booking.status,
    booking.businessName,
    booking.consumerName,
    maskConsumerPhone(booking.consumerPhone),
    booking.serviceName,
    booking.resourceName,
    booking.city,
    formatSlotDate(booking.startsAt),
    formatSlotTime(booking.startsAt),
    formatSlotTime(booking.endsAt),
    formatPrice(booking.totalAmount, booking.currency),
    booking.paymentMethod,
    booking.paymentStatus,
    booking.createdAt,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => escapeCsvValue(String(cell))).join(','))
    .join('\n');

  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `bookings_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function canCancelBooking(booking: AdminBookingRecord): boolean {
  return (
    booking.status !== 'cancelled' &&
    booking.status !== 'completed' &&
    booking.status !== 'no_show'
  );
}
