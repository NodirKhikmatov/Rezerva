import type { BookingStatus } from '@rezerva/shared-constants';

import type { AdminBookingListItem } from '../api/admin-api.types';
import type {
  AdminBookingPaymentMethod,
  AdminBookingPaymentStatus,
  AdminBookingRecord,
} from '../types/admin-booking.types';

function mapPaymentMethod(
  paymentMethod: string,
  provider: string | null,
): AdminBookingPaymentMethod {
  if (paymentMethod === 'pay_at_venue') {
    return 'pay_at_venue';
  }

  if (provider === 'click') {
    return 'click';
  }

  return 'payme';
}

function mapPaymentStatus(status: string | null): AdminBookingPaymentStatus {
  if (status === 'paid') {
    return 'paid';
  }

  if (status === 'refunded' || status === 'partially_refunded') {
    return 'refunded';
  }

  return 'pending';
}

export function mapAdminBookingListItem(
  item: AdminBookingListItem,
): AdminBookingRecord {
  return {
    id: item.id,
    referenceCode: item.referenceCode,
    status: item.status as BookingStatus,
    businessId: item.businessId,
    businessName: item.businessName,
    consumerId: item.userId ?? '',
    consumerName: item.customerName ?? '—',
    consumerPhone: item.customerPhone ?? '—',
    serviceName: item.serviceName ?? '—',
    resourceName: item.resourceName ?? '—',
    city: item.city ?? '—',
    startsAt: item.startsAt,
    endsAt: item.endsAt,
    totalAmount: item.totalAmount,
    currency: item.currency,
    paymentMethod: mapPaymentMethod(item.paymentMethod, item.paymentProvider),
    paymentStatus: mapPaymentStatus(item.paymentStatus),
    createdAt: item.createdAt,
    cancelledAt: item.cancelledAt,
    cancelReason: item.cancellationReason,
    refundOverride: null,
    adminNotes: null,
  };
}
