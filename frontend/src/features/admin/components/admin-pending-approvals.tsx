import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';

import { formatRelativeTime } from '@/shared/lib/format';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

import type { AdminPendingApproval } from '../types/admin-dashboard.types';
import { getSlaLabel, getSlaVariant } from '../utils/admin-dashboard.utils';

type AdminPendingApprovalsProps = {
  items: AdminPendingApproval[];
};

export function AdminPendingApprovals({ items }: AdminPendingApprovalsProps) {
  return (
    <Card variant="elevated" padding="none" className="h-full">
      <CardHeader className="flex-row items-center justify-between border-b border-border px-6 py-4">
        <CardTitle>Kutilayotgan tasdiqlash</CardTitle>
        <Badge variant="warning">{items.length}</Badge>
      </CardHeader>

      <CardContent className="divide-y divide-border px-6 py-0">
        {items.map((item) => (
          <article
            key={item.id}
            className="flex items-start justify-between gap-4 py-4"
          >
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck
                  className="size-4 shrink-0 text-primary"
                  aria-hidden
                />
                <p className="truncate text-sm font-medium">
                  {item.businessName}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">{item.category}</p>
              <p className="text-xs text-muted-foreground">
                {formatRelativeTime(item.submittedAt)}
              </p>
            </div>
            <Badge variant={getSlaVariant(item.slaStatus)}>
              {getSlaLabel(item.slaStatus)}
            </Badge>
          </article>
        ))}
      </CardContent>

      <CardFooter className="px-6 py-4">
        <Button asChild variant="ghost" size="sm" className="ml-auto">
          <Link href="/admin/verifications">
            Navbatni ko&apos;rish
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
