import type { BookingStatus } from '@rezerva/shared-constants';

import type {
  AdminBookingPaymentMethod,
  AdminBookingPaymentStatus,
  AdminBookingRefundOverride,
} from '../types/admin-booking.types';

export function getBookingStatusLabel(status: BookingStatus): string {
  const labels: Record<BookingStatus, string> = {
    pending_payment: "To'lov kutilmoqda",
    pending_approval: 'Tasdiqlash kutilmoqda',
    confirmed: 'Tasdiqlangan',
    checked_in: 'Check-in',
    completed: 'Yakunlangan',
    cancelled: 'Bekor qilingan',
    no_show: 'Kelmagan',
  };

  return labels[status];
}

export function getBookingStatusVariant(
  status: BookingStatus,
): 'default' | 'success' | 'warning' | 'destructive' | 'secondary' {
  switch (status) {
    case 'confirmed':
    case 'checked_in':
    case 'completed':
      return 'success';
    case 'pending_payment':
    case 'pending_approval':
      return 'warning';
    case 'cancelled':
    case 'no_show':
      return 'destructive';
    default:
      return 'secondary';
  }
}

export function getPaymentMethodLabel(
  method: AdminBookingPaymentMethod,
): string {
  const labels: Record<AdminBookingPaymentMethod, string> = {
    payme: 'Payme',
    click: 'Click',
    pay_at_venue: "Joyida to'lov",
  };

  return labels[method];
}

export function getPaymentStatusLabel(
  status: AdminBookingPaymentStatus,
): string {
  const labels: Record<AdminBookingPaymentStatus, string> = {
    paid: "To'langan",
    pending: 'Kutilmoqda',
    refunded: 'Qaytarilgan',
  };

  return labels[status];
}

export function getPaymentStatusVariant(
  status: AdminBookingPaymentStatus,
): 'success' | 'warning' | 'secondary' {
  switch (status) {
    case 'paid':
      return 'success';
    case 'pending':
      return 'warning';
    case 'refunded':
      return 'secondary';
  }
}

export function getRefundOverrideLabel(
  value: AdminBookingRefundOverride,
): string {
  const labels: Record<AdminBookingRefundOverride, string> = {
    none: "Qaytarish yo'q",
    partial: 'Qisman qaytarish',
    full: "To'liq qaytarish",
  };

  return labels[value];
}

export const CANCEL_REASON_OPTIONS = [
  { value: 'fraud_suspected', label: 'Firibgarlik shubhasi' },
  { value: 'customer_request', label: "Mijoz so'rovi" },
  { value: 'business_closed', label: 'Biznes yopiq' },
  { value: 'policy_violation', label: 'Qoidalar buzilishi' },
  { value: 'duplicate_booking', label: 'Takroriy bron' },
  { value: 'other', label: 'Boshqa' },
] as const;

export const REFUND_OVERRIDE_OPTIONS = [
  { value: 'none', label: "Qaytarish yo'q" },
  { value: 'partial', label: 'Qisman' },
  { value: 'full', label: "To'liq" },
] as const;
