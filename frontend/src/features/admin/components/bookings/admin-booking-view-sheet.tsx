'use client';

import { Dialog } from '@base-ui/react/dialog';
import { Calendar, Receipt, User, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  formatPrice,
  formatRelativeTime,
  formatSlotDate,
  formatSlotTime,
} from '@/shared/lib/format';
import { Badge } from '@/shared/components/ui/badge';
import { IconButton } from '@/shared/components/ui/icon-button';

import type { AdminBookingRecord } from '../../types/admin-booking.types';
import {
  getBookingStatusLabel,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  getPaymentStatusVariant,
  getRefundOverrideLabel,
} from '../../utils/admin-booking-labels.utils';
import { maskConsumerPhone } from '../../utils/admin-bookings.utils';
import { AdminBookingStatusBadge } from './admin-booking-status-badge';

type AdminBookingViewSheetProps = {
  booking: AdminBookingRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="max-w-[60%] text-right text-sm font-medium">{value}</dd>
    </div>
  );
}

export function AdminBookingViewSheet({
  booking,
  open,
  onOpenChange,
}: AdminBookingViewSheetProps) {
  if (!booking) {
    return null;
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Popup
          className={cn(
            'fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-border bg-background shadow-xl outline-none',
          )}
        >
          <div className="flex items-start justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Receipt className="size-5" aria-hidden />
              </div>
              <div>
                <Dialog.Title className="text-lg font-semibold">
                  {booking.referenceCode}
                </Dialog.Title>
                <Dialog.Description className="text-sm text-muted-foreground">
                  {booking.businessName}
                </Dialog.Description>
              </div>
            </div>
            <IconButton
              icon={X}
              label="Close booking details"
              onClick={() => onOpenChange(false)}
              size="sm"
            />
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-2">
            <dl className="divide-y divide-border">
              <DetailRow
                label="Status"
                value={getBookingStatusLabel(booking.status)}
              />
              <DetailRow label="Xizmat" value={booking.serviceName} />
              <DetailRow label="Resurs" value={booking.resourceName} />
              <DetailRow label="Shahar" value={booking.city} />
              <DetailRow
                label="Sana"
                value={formatSlotDate(booking.startsAt)}
              />
              <DetailRow
                label="Vaqt"
                value={`${formatSlotTime(booking.startsAt)} – ${formatSlotTime(booking.endsAt)}`}
              />
              <DetailRow
                label="Summa"
                value={formatPrice(booking.totalAmount, booking.currency)}
              />
              <DetailRow
                label="To'lov usuli"
                value={getPaymentMethodLabel(booking.paymentMethod)}
              />
              <DetailRow
                label="To'lov holati"
                value={getPaymentStatusLabel(booking.paymentStatus)}
              />
              <DetailRow label="Mijoz" value={booking.consumerName} />
              <DetailRow
                label="Telefon"
                value={maskConsumerPhone(booking.consumerPhone)}
              />
              <DetailRow
                label="Yaratilgan"
                value={formatRelativeTime(booking.createdAt)}
              />
              {booking.cancelledAt && (
                <DetailRow
                  label="Bekor qilingan"
                  value={formatRelativeTime(booking.cancelledAt)}
                />
              )}
              {booking.cancelReason && (
                <DetailRow
                  label="Bekor qilish sababi"
                  value={booking.cancelReason}
                />
              )}
              {booking.refundOverride && (
                <DetailRow
                  label="Qaytarish"
                  value={getRefundOverrideLabel(booking.refundOverride)}
                />
              )}
              {booking.adminNotes && (
                <DetailRow label="Admin izohi" value={booking.adminNotes} />
              )}
            </dl>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-border px-6 py-4">
            <AdminBookingStatusBadge status={booking.status} />
            <Badge variant={getPaymentStatusVariant(booking.paymentStatus)}>
              {getPaymentStatusLabel(booking.paymentStatus)}
            </Badge>
            <Badge variant="outline">
              <User className="mr-1 size-3" aria-hidden />
              {booking.consumerName}
            </Badge>
            <Badge variant="outline">
              <Calendar className="mr-1 size-3" aria-hidden />
              {formatSlotDate(booking.startsAt)}
            </Badge>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
