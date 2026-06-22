'use client';

import { Search } from 'lucide-react';
import { BusinessCategory } from '@rezerva/shared-constants';

import { cn } from '@/lib/utils';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

import type { AdminBusinessFilters } from '../../types/admin-business.types';
import { getCategoryLabel } from '../../utils/admin-business-labels.utils';

const selectClassName =
  'flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30';

type AdminBusinessesFiltersProps = {
  filters: AdminBusinessFilters;
  cities: string[];
  onChange: (filters: AdminBusinessFilters) => void;
};

export function AdminBusinessesFilters({
  filters,
  cities,
  onChange,
}: AdminBusinessesFiltersProps) {
  const updateFilter = <K extends keyof AdminBusinessFilters>(
    key: K,
    value: AdminBusinessFilters[K],
  ) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div className="space-y-2 md:col-span-2 xl:col-span-2">
        <Label htmlFor="businesses-search">Qidirish</Label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="businesses-search"
            value={filters.search}
            onChange={(event) => updateFilter('search', event.target.value)}
            placeholder="Biznes nomi, egasi, shahar yoki slug"
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="businesses-status">Tasdiqlash</Label>
        <select
          id="businesses-status"
          value={filters.verificationStatus}
          onChange={(event) =>
            updateFilter(
              'verificationStatus',
              event.target.value as AdminBusinessFilters['verificationStatus'],
            )
          }
          className={cn(selectClassName)}
        >
          <option value="all">Barchasi</option>
          <option value="pending">Kutilmoqda</option>
          <option value="approved">Tasdiqlangan</option>
          <option value="rejected">Rad etilgan</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="businesses-category">Kategoriya</Label>
        <select
          id="businesses-category"
          value={filters.category}
          onChange={(event) =>
            updateFilter(
              'category',
              event.target.value as AdminBusinessFilters['category'],
            )
          }
          className={cn(selectClassName)}
        >
          <option value="all">Barchasi</option>
          {Object.values(BusinessCategory).map((category) => (
            <option key={category} value={category}>
              {getCategoryLabel(category)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2 md:col-span-2 xl:col-span-4 xl:max-w-xs">
        <Label htmlFor="businesses-city">Shahar</Label>
        <select
          id="businesses-city"
          value={filters.city}
          onChange={(event) =>
            updateFilter(
              'city',
              event.target.value as AdminBusinessFilters['city'],
            )
          }
          className={cn(selectClassName)}
        >
          <option value="all">Barchasi</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
