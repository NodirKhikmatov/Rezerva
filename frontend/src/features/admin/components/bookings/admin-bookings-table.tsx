'use client';

import { Eye, MoreHorizontal, XCircle } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  formatPrice,
  formatSlotDate,
  formatSlotTime,
} from '@/shared/lib/format';
import { buttonVariants } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Badge } from '@/shared/components/ui/badge';

import type { AdminBookingRecord } from '../../types/admin-booking.types';
import {
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  getPaymentStatusVariant,
} from '../../utils/admin-booking-labels.utils';
import {
  canCancelBooking,
  maskConsumerPhone,
} from '../../utils/admin-bookings.utils';
import { AdminBookingStatusBadge } from './admin-booking-status-badge';

type AdminBookingsTableProps = {
  bookings: AdminBookingRecord[];
  onView: (booking: AdminBookingRecord) => void;
  onCancel: (booking: AdminBookingRecord) => void;
};

export function AdminBookingsTable({
  bookings,
  onView,
  onCancel,
}: AdminBookingsTableProps) {
  if (bookings.length === 0) {
    return (
      <Card variant="elevated" padding="lg">
        <CardContent className="py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Filtrlarga mos bron topilmadi.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated" padding="none">
      <CardHeader className="border-b border-border px-6 py-4">
        <CardTitle>Bronlar</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[1040px] text-left text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <th className="px-6 py-3 font-medium text-muted-foreground">
                Reference
              </th>
              <th className="px-6 py-3 font-medium text-muted-foreground">
                Biznes
              </th>
              <th className="px-6 py-3 font-medium text-muted-foreground">
                Mijoz
              </th>
              <th className="px-6 py-3 font-medium text-muted-foreground">
                Slot
              </th>
              <th className="px-6 py-3 font-medium text-muted-foreground">
                Summa
              </th>
              <th className="px-6 py-3 font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-6 py-3 font-medium text-muted-foreground">
                To&apos;lov
              </th>
              <th className="px-6 py-3 font-medium text-muted-foreground">
                Amallar
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bookings.map((booking) => {
              const cancellable = canCancelBooking(booking);

              return (
                <tr key={booking.id} className="hover:bg-muted/30">
                  <td className="px-6 py-4">
                    <p className="font-medium">{booking.referenceCode}</p>
                    <p className="text-xs text-muted-foreground">
                      {booking.city}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {booking.businessName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {booking.serviceName}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="min-w-0">
                      <p className="truncate">{booking.consumerName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {maskConsumerPhone(booking.consumerPhone)}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    <p>{formatSlotDate(booking.startsAt)}</p>
                    <p className="text-xs">
                      {formatSlotTime(booking.startsAt)} –{' '}
                      {formatSlotTime(booking.endsAt)}
                    </p>
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {formatPrice(booking.totalAmount, booking.currency)}
                  </td>
                  <td className="px-6 py-4">
                    <AdminBookingStatusBadge status={booking.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        {getPaymentMethodLabel(booking.paymentMethod)}
                      </p>
                      <Badge
                        variant={getPaymentStatusVariant(booking.paymentStatus)}
                      >
                        {getPaymentStatusLabel(booking.paymentStatus)}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className={cn(
                          buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
                        )}
                      >
                        <MoreHorizontal className="size-4" aria-hidden />
                        <span className="sr-only">Open actions</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(booking)}>
                          <Eye className="size-4" aria-hidden />
                          Ko&apos;rish
                        </DropdownMenuItem>
                        {cancellable && (
                          <DropdownMenuItem
                            destructive
                            onClick={() => onCancel(booking)}
                          >
                            <XCircle className="size-4" aria-hidden />
                            Bekor qilish
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
