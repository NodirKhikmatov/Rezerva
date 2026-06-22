'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import type { PaginationMeta } from '@/shared/types/pagination.types';

type AdminTablePaginationProps = {
  meta: PaginationMeta;
  entityLabel: string;
  onPageChange: (page: number) => void;
};

export function AdminTablePagination({
  meta,
  entityLabel,
  onPageChange,
}: AdminTablePaginationProps) {
  const { page, total, totalPages } = meta;
  const start = total === 0 ? 0 : (page - 1) * meta.limit + 1;
  const end = Math.min(page * meta.limit, total);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        {total === 0
          ? 'Natija topilmadi'
          : `${start}–${end} / ${total} ${entityLabel}`}
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          leftIcon={ChevronLeft}
        >
          Oldingi
        </Button>
        <span className="px-2 text-sm text-muted-foreground">
          {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          rightIcon={ChevronRight}
        >
          Keyingi
        </Button>
      </div>
    </div>
  );
}
