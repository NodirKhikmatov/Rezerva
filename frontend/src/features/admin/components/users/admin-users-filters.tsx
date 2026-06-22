'use client';

import { Search } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

import type { AdminUserFilters } from '../../types/admin-user.types';

const selectClassName =
  'flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30';

type AdminUsersFiltersProps = {
  filters: AdminUserFilters;
  onChange: (filters: AdminUserFilters) => void;
};

export function AdminUsersFilters({
  filters,
  onChange,
}: AdminUsersFiltersProps) {
  const updateFilter = <K extends keyof AdminUserFilters>(
    key: K,
    value: AdminUserFilters[K],
  ) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div className="space-y-2 md:col-span-2 xl:col-span-2">
        <Label htmlFor="users-search">Qidirish</Label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="users-search"
            value={filters.search}
            onChange={(event) => updateFilter('search', event.target.value)}
            placeholder="Ism, telefon, email yoki username"
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="users-status">Status</Label>
        <select
          id="users-status"
          value={filters.status}
          onChange={(event) =>
            updateFilter(
              'status',
              event.target.value as AdminUserFilters['status'],
            )
          }
          className={cn(selectClassName)}
        >
          <option value="all">Barchasi</option>
          <option value="active">Faol</option>
          <option value="suspended">To&apos;xtatilgan</option>
          <option value="pending">Kutilmoqda</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="users-role">Rol</Label>
        <select
          id="users-role"
          value={filters.role}
          onChange={(event) =>
            updateFilter('role', event.target.value as AdminUserFilters['role'])
          }
          className={cn(selectClassName)}
        >
          <option value="all">Barchasi</option>
          <option value="consumer">Consumer</option>
          <option value="admin">Admin</option>
        </select>
      </div>
    </div>
  );
}
