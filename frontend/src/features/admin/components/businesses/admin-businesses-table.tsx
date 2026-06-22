'use client';

import { Check, Eye, MoreHorizontal, X } from 'lucide-react';

import { formatRelativeTime } from '@/shared/lib/format';
import { cn } from '@/lib/utils';
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

import type { AdminBusinessRecord } from '../../types/admin-business.types';
import {
  getCategoryLabel,
  getSlaLabel,
  getSlaVariant,
} from '../../utils/admin-business-labels.utils';
import { maskOwnerPhone } from '../../utils/admin-businesses.utils';
import { AdminBusinessVerificationBadge } from './admin-business-verification-badge';

type AdminBusinessesTableProps = {
  businesses: AdminBusinessRecord[];
  onView: (business: AdminBusinessRecord) => void;
  onApprove: (business: AdminBusinessRecord) => void;
  onReject: (business: AdminBusinessRecord) => void;
};

export function AdminBusinessesTable({
  businesses,
  onView,
  onApprove,
  onReject,
}: AdminBusinessesTableProps) {
  if (businesses.length === 0) {
    return (
      <Card variant="elevated" padding="lg">
        <CardContent className="py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Filtrlarga mos biznes topilmadi.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated" padding="none">
      <CardHeader className="border-b border-border px-6 py-4">
        <CardTitle>Bizneslar</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <th className="px-6 py-3 font-medium text-muted-foreground">
                Biznes
              </th>
              <th className="px-6 py-3 font-medium text-muted-foreground">
                Kategoriya
              </th>
              <th className="px-6 py-3 font-medium text-muted-foreground">
                Shahar
              </th>
              <th className="px-6 py-3 font-medium text-muted-foreground">
                Egasi
              </th>
              <th className="px-6 py-3 font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-6 py-3 font-medium text-muted-foreground">
                SLA
              </th>
              <th className="px-6 py-3 font-medium text-muted-foreground">
                Yuborilgan
              </th>
              <th className="px-6 py-3 font-medium text-muted-foreground">
                Amallar
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {businesses.map((business) => {
              const isPending = business.verificationStatus === 'pending';

              return (
                <tr key={business.id} className="hover:bg-muted/30">
                  <td className="px-6 py-4">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{business.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {business.slug}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getCategoryLabel(business.category)}
                  </td>
                  <td className="px-6 py-4">{business.city}</td>
                  <td className="px-6 py-4">
                    <div className="min-w-0">
                      <p className="truncate">{business.ownerName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {maskOwnerPhone(business.ownerPhone)}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <AdminBusinessVerificationBadge
                      status={business.verificationStatus}
                    />
                  </td>
                  <td className="px-6 py-4">
                    {isPending ? (
                      <Badge variant={getSlaVariant(business.slaStatus)}>
                        {getSlaLabel(business.slaStatus)}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {formatRelativeTime(business.submittedAt)}
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
                        <DropdownMenuItem onClick={() => onView(business)}>
                          <Eye className="size-4" aria-hidden />
                          Ko&apos;rish
                        </DropdownMenuItem>
                        {isPending && (
                          <>
                            <DropdownMenuItem
                              onClick={() => onApprove(business)}
                            >
                              <Check className="size-4" aria-hidden />
                              Tasdiqlash
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              destructive
                              onClick={() => onReject(business)}
                            >
                              <X className="size-4" aria-hidden />
                              Rad etish
                            </DropdownMenuItem>
                          </>
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
