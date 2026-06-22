'use client';

import { Search } from 'lucide-react';
import { BookingStatus } from '@rezerva/shared-constants';

import { cn } from '@/lib/utils';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

import type { AdminBookingFilters } from '../../types/admin-booking.types';
import {
  getBookingStatusLabel,
  getPaymentMethodLabel,
} from '../../utils/admin-booking-labels.utils';

const selectClassName =
  'flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30';

type AdminBookingsFiltersProps = {
  filters: AdminBookingFilters;
  onChange: (filters: AdminBookingFilters) => void;
};

export function AdminBookingsFilters({
  filters,
  onChange,
}: AdminBookingsFiltersProps) {
  const updateFilter = <K extends keyof AdminBookingFilters>(
    key: K,
    value: AdminBookingFilters[K],
  ) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
      <div className="space-y-2 md:col-span-2 xl:col-span-2">
        <Label htmlFor="bookings-search">Qidirish</Label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="bookings-search"
            value={filters.search}
            onChange={(event) => updateFilter('search', event.target.value)}
            placeholder="Reference, biznes, mijoz yoki xizmat"
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bookings-status">Status</Label>
        <select
          id="bookings-status"
          value={filters.status}
          onChange={(event) =>
            updateFilter(
              'status',
              event.target.value as AdminBookingFilters['status'],
            )
          }
          className={cn(selectClassName)}
        >
          <option value="all">Barchasi</option>
          {Object.values(BookingStatus).map((status) => (
            <option key={status} value={status}>
              {getBookingStatusLabel(status)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bookings-payment">To&apos;lov</Label>
        <select
          id="bookings-payment"
          value={filters.paymentMethod}
          onChange={(event) =>
            updateFilter(
              'paymentMethod',
              event.target.value as AdminBookingFilters['paymentMethod'],
            )
          }
          className={cn(selectClassName)}
        >
          <option value="all">Barchasi</option>
          <option value="payme">{getPaymentMethodLabel('payme')}</option>
          <option value="click">{getPaymentMethodLabel('click')}</option>
          <option value="pay_at_venue">
            {getPaymentMethodLabel('pay_at_venue')}
          </option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bookings-from">Sanadan</Label>
        <Input
          id="bookings-from"
          type="date"
          value={filters.dateFrom}
          onChange={(event) => updateFilter('dateFrom', event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bookings-to">Sanagacha</Label>
        <Input
          id="bookings-to"
          type="date"
          value={filters.dateTo}
          onChange={(event) => updateFilter('dateTo', event.target.value)}
        />
      </div>
    </div>
  );
}
