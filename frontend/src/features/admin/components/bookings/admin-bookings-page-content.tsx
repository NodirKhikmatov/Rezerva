'use client';

import { Download } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Typography } from '@/shared/components/ui/typography';
import { Button } from '@/shared/components/ui/button';

import {
  useAdminBookingMutations,
  useAdminBookings,
} from '../../hooks/use-admin-bookings';
import type {
  AdminBookingCancelInput,
  AdminBookingFilters,
  AdminBookingRecord,
} from '../../types/admin-booking.types';
import {
  ADMIN_BOOKINGS_PAGE_SIZE,
  exportBookingsToCsv,
  filterAdminBookings,
  paginateAdminBookings,
} from '../../utils/admin-bookings.utils';
import { AdminAsyncState } from '../admin-async-state';
import { AdminTablePagination } from '../admin-table-pagination';
import { AdminBookingCancelDialog } from './admin-booking-cancel-dialog';
import { AdminBookingViewSheet } from './admin-booking-view-sheet';
import { AdminBookingsFilters } from './admin-bookings-filters';
import { AdminBookingsTable } from './admin-bookings-table';

const DEFAULT_FILTERS: AdminBookingFilters = {
  search: '',
  status: 'all',
  paymentMethod: 'all',
  dateFrom: '',
  dateTo: '',
};

export function AdminBookingsPageContent() {
  const [filters, setFilters] = useState<AdminBookingFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [selectedBooking, setSelectedBooking] =
    useState<AdminBookingRecord | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const {
    data: bookings = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useAdminBookings(filters);
  const cancelMutation = useAdminBookingMutations();

  const filteredBookings = useMemo(
    () => filterAdminBookings(bookings, filters),
    [bookings, filters],
  );

  const { data: pageBookings, meta } = useMemo(
    () =>
      paginateAdminBookings(filteredBookings, page, ADMIN_BOOKINGS_PAGE_SIZE),
    [filteredBookings, page],
  );

  const handleFiltersChange = (nextFilters: AdminBookingFilters) => {
    setFilters(nextFilters);
    setPage(1);
  };

  const openForBooking = (
    booking: AdminBookingRecord,
    dialog: 'view' | 'cancel',
  ) => {
    setSelectedBooking(booking);
    setViewOpen(dialog === 'view');
    setCancelOpen(dialog === 'cancel');
  };

  const handleCancel = async (
    bookingId: string,
    input: AdminBookingCancelInput,
  ) => {
    await cancelMutation.mutateAsync({
      bookingId,
      reason: input.reason,
      refundOverride: input.refundOverride,
      notes: input.notes,
    });
  };

  const handleExport = () => {
    exportBookingsToCsv(filteredBookings);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <Typography variant="h1">Bronlar</Typography>
          <Typography variant="muted">
            Platforma bo&apos;ylab barcha bronlarni qidiring va boshqaring.
          </Typography>
        </div>
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={filteredBookings.length === 0}
          leftIcon={Download}
        >
          CSV eksport
        </Button>
      </header>

      <AdminBookingsFilters filters={filters} onChange={handleFiltersChange} />

      <AdminAsyncState
        isLoading={isLoading}
        isError={isError}
        isEmpty={!isLoading && !isError && pageBookings.length === 0}
        errorMessage={error instanceof Error ? error.message : undefined}
        emptyTitle="Bron topilmadi"
        emptyDescription="Filtrlarni kengaytiring yoki qidiruv so'zini o'zgartiring."
        onRetry={() => void refetch()}
      >
        <>
          <AdminBookingsTable
            bookings={pageBookings}
            onView={(booking) => openForBooking(booking, 'view')}
            onCancel={(booking) => openForBooking(booking, 'cancel')}
          />

          <AdminTablePagination
            meta={meta}
            entityLabel="bron"
            onPageChange={setPage}
          />
        </>
      </AdminAsyncState>

      <AdminBookingViewSheet
        booking={selectedBooking}
        open={viewOpen}
        onOpenChange={setViewOpen}
      />
      <AdminBookingCancelDialog
        booking={selectedBooking}
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onConfirm={handleCancel}
      />
    </div>
  );
}
