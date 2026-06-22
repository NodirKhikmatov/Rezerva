'use client';

import { useMemo, useState } from 'react';

import { Typography } from '@/shared/components/ui/typography';

import { getAdminUsersMock } from '../../data/admin-users.mock';
import {
  AdminUserStatus,
  type AdminUserFilters,
  type AdminUserRecord,
  type AdminUserUpdateInput,
} from '../../types/admin-user.types';
import {
  ADMIN_USERS_PAGE_SIZE,
  filterAdminUsers,
  paginateAdminUsers,
} from '../../utils/admin-users.utils';
import { AdminUserEditDialog } from './admin-user-edit-dialog';
import { AdminUserSuspendDialog } from './admin-user-suspend-dialog';
import { AdminUserViewSheet } from './admin-user-view-sheet';
import { AdminUsersFilters } from './admin-users-filters';
import { AdminTablePagination } from '../admin-table-pagination';
import { AdminUsersTable } from './admin-users-table';

const DEFAULT_FILTERS: AdminUserFilters = {
  search: '',
  status: 'all',
  role: 'all',
};

export function AdminUsersPageContent() {
  const [users, setUsers] = useState<AdminUserRecord[]>(() =>
    getAdminUsersMock(),
  );
  const [filters, setFilters] = useState<AdminUserFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(
    null,
  );
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);

  const filteredUsers = useMemo(
    () => filterAdminUsers(users, filters),
    [users, filters],
  );

  const { data: pageUsers, meta } = useMemo(
    () => paginateAdminUsers(filteredUsers, page, ADMIN_USERS_PAGE_SIZE),
    [filteredUsers, page],
  );

  const handleFiltersChange = (nextFilters: AdminUserFilters) => {
    setFilters(nextFilters);
    setPage(1);
  };

  const openForUser = (
    user: AdminUserRecord,
    dialog: 'view' | 'edit' | 'suspend',
  ) => {
    setSelectedUser(user);
    setViewOpen(dialog === 'view');
    setEditOpen(dialog === 'edit');
    setSuspendOpen(dialog === 'suspend');
  };

  const handleEditSave = (userId: string, input: AdminUserUpdateInput) => {
    setUsers((current) =>
      current.map((user) =>
        user.id === userId
          ? {
              ...user,
              ...input,
              firstName: input.firstName || null,
              lastName: input.lastName || null,
              phone: input.phone || null,
              email: input.email || null,
            }
          : user,
      ),
    );
    setSelectedUser((current) =>
      current?.id === userId
        ? {
            ...current,
            ...input,
            firstName: input.firstName || null,
            lastName: input.lastName || null,
            phone: input.phone || null,
            email: input.email || null,
          }
        : current,
    );
  };

  const handleSuspend = (userId: string, reason: string) => {
    setUsers((current) =>
      current.map((user) =>
        user.id === userId
          ? {
              ...user,
              status: AdminUserStatus.suspended,
              suspendReason: reason,
            }
          : user,
      ),
    );
  };

  const handleReinstate = (userId: string) => {
    setUsers((current) =>
      current.map((user) =>
        user.id === userId
          ? {
              ...user,
              status: AdminUserStatus.active,
              suspendReason: null,
            }
          : user,
      ),
    );
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <Typography variant="h1">Foydalanuvchilar</Typography>
        <Typography variant="muted">
          Platforma foydalanuvchilarini qidiring, filtrlang va boshqaring.
        </Typography>
      </header>

      <AdminUsersFilters filters={filters} onChange={handleFiltersChange} />

      <AdminUsersTable
        users={pageUsers}
        onView={(user) => openForUser(user, 'view')}
        onEdit={(user) => openForUser(user, 'edit')}
        onSuspend={(user) => openForUser(user, 'suspend')}
      />

      <AdminTablePagination
        meta={meta}
        entityLabel="foydalanuvchi"
        onPageChange={setPage}
      />

      <AdminUserViewSheet
        user={selectedUser}
        open={viewOpen}
        onOpenChange={setViewOpen}
      />
      <AdminUserEditDialog
        user={selectedUser}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={handleEditSave}
      />
      <AdminUserSuspendDialog
        user={selectedUser}
        open={suspendOpen}
        onOpenChange={setSuspendOpen}
        onConfirm={handleSuspend}
        onReinstate={handleReinstate}
      />
    </div>
  );
}
