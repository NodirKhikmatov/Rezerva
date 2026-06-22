import type { BookingStatus } from '@rezerva/shared-constants';

export type AdminBookingPaymentMethod = 'payme' | 'click' | 'pay_at_venue';

export type AdminBookingPaymentStatus = 'paid' | 'pending' | 'refunded';

export type AdminBookingRefundOverride = 'none' | 'partial' | 'full';

export type AdminBookingRecord = {
  id: string;
  referenceCode: string;
  status: BookingStatus;
  businessId: string;
  businessName: string;
  consumerId: string;
  consumerName: string;
  consumerPhone: string;
  serviceName: string;
  resourceName: string;
  city: string;
  startsAt: string;
  endsAt: string;
  totalAmount: number;
  currency: string;
  paymentMethod: AdminBookingPaymentMethod;
  paymentStatus: AdminBookingPaymentStatus;
  createdAt: string;
  cancelledAt: string | null;
  cancelReason: string | null;
  refundOverride: AdminBookingRefundOverride | null;
  adminNotes: string | null;
};

export type AdminBookingFilters = {
  search: string;
  status: BookingStatus | 'all';
  paymentMethod: AdminBookingPaymentMethod | 'all';
  dateFrom: string;
  dateTo: string;
};

export type AdminBookingCancelInput = {
  reason: string;
  refundOverride: AdminBookingRefundOverride;
  notes: string;
};
