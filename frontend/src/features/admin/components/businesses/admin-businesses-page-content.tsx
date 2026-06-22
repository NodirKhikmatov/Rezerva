'use client';

import { useMemo, useState } from 'react';

import { Typography } from '@/shared/components/ui/typography';

import {
  useAdminBusinessMutations,
  useAdminBusinesses,
} from '../../hooks/use-admin-businesses';
import type {
  AdminBusinessFilters,
  AdminBusinessRecord,
  AdminBusinessRejectInput,
} from '../../types/admin-business.types';
import {
  ADMIN_BUSINESSES_PAGE_SIZE,
  filterAdminBusinesses,
  paginateAdminBusinesses,
} from '../../utils/admin-businesses.utils';
import { AdminAsyncState } from '../admin-async-state';
import { AdminTablePagination } from '../admin-table-pagination';
import { AdminBusinessApproveDialog } from './admin-business-approve-dialog';
import { AdminBusinessRejectDialog } from './admin-business-reject-dialog';
import { AdminBusinessViewSheet } from './admin-business-view-sheet';
import { AdminBusinessesFilters } from './admin-businesses-filters';
import { AdminBusinessesTable } from './admin-businesses-table';

const DEFAULT_FILTERS: AdminBusinessFilters = {
  search: '',
  verificationStatus: 'all',
  category: 'all',
  city: 'all',
};

export function AdminBusinessesPageContent() {
  const [filters, setFilters] = useState<AdminBusinessFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [selectedBusiness, setSelectedBusiness] =
    useState<AdminBusinessRecord | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const {
    data: businesses = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useAdminBusinesses(filters);
  const { approveMutation, rejectMutation } = useAdminBusinessMutations();

  const businessCities = useMemo(
    () => [...new Set(businesses.map((business) => business.city))].sort(),
    [businesses],
  );

  const filteredBusinesses = useMemo(
    () => filterAdminBusinesses(businesses, filters),
    [businesses, filters],
  );

  const { data: pageBusinesses, meta } = useMemo(
    () =>
      paginateAdminBusinesses(
        filteredBusinesses,
        page,
        ADMIN_BUSINESSES_PAGE_SIZE,
      ),
    [filteredBusinesses, page],
  );

  const handleFiltersChange = (nextFilters: AdminBusinessFilters) => {
    setFilters(nextFilters);
    setPage(1);
  };

  const openForBusiness = (
    business: AdminBusinessRecord,
    dialog: 'view' | 'approve' | 'reject',
  ) => {
    setSelectedBusiness(business);
    setViewOpen(dialog === 'view');
    setApproveOpen(dialog === 'approve');
    setRejectOpen(dialog === 'reject');
  };

  const handleApprove = async (verificationId: string, notes: string) => {
    await approveMutation.mutateAsync({ verificationId, notes });
  };

  const handleReject = async (
    verificationId: string,
    input: AdminBusinessRejectInput,
  ) => {
    await rejectMutation.mutateAsync({
      verificationId,
      reason: input.reason,
      message: input.message,
    });
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <Typography variant="h1">Bizneslar</Typography>
        <Typography variant="muted">
          Bizneslarni qidiring, tasdiqlang yoki rad eting.
        </Typography>
      </header>

      <AdminBusinessesFilters
        filters={filters}
        cities={businessCities}
        onChange={handleFiltersChange}
      />

      <AdminAsyncState
        isLoading={isLoading}
        isError={isError}
        isEmpty={!isLoading && !isError && pageBusinesses.length === 0}
        errorMessage={error instanceof Error ? error.message : undefined}
        emptyTitle="Biznes topilmadi"
        emptyDescription="Filtrlarni kengaytiring yoki tasdiqlash navbatini tekshiring."
        onRetry={() => void refetch()}
      >
        <>
          <AdminBusinessesTable
            businesses={pageBusinesses}
            onView={(business) => openForBusiness(business, 'view')}
            onApprove={(business) => openForBusiness(business, 'approve')}
            onReject={(business) => openForBusiness(business, 'reject')}
          />

          <AdminTablePagination
            meta={meta}
            entityLabel="biznes"
            onPageChange={setPage}
          />
        </>
      </AdminAsyncState>

      <AdminBusinessViewSheet
        business={selectedBusiness}
        open={viewOpen}
        onOpenChange={setViewOpen}
      />
      <AdminBusinessApproveDialog
        business={selectedBusiness}
        open={approveOpen}
        onOpenChange={setApproveOpen}
        onConfirm={handleApprove}
      />
      <AdminBusinessRejectDialog
        business={selectedBusiness}
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        onConfirm={handleReject}
      />
    </div>
  );
}
