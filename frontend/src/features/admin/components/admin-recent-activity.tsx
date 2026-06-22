import Link from 'next/link';
import { ArrowRight, Clock3 } from 'lucide-react';

import { formatRelativeTime } from '@/shared/lib/format';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

import type { AdminActivityItem } from '../types/admin-dashboard.types';
import { formatActivityAction } from '../utils/admin-dashboard.utils';

type AdminRecentActivityProps = {
  items: AdminActivityItem[];
};

export function AdminRecentActivity({ items }: AdminRecentActivityProps) {
  return (
    <Card variant="elevated" padding="none" className="h-full">
      <CardHeader className="border-b border-border px-6 py-4">
        <CardTitle>So&apos;nggi faollik</CardTitle>
      </CardHeader>

      <CardContent className="divide-y divide-border px-6 py-0">
        {items.map((item) => (
          <article key={item.id} className="flex gap-3 py-4">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
              <Clock3 className="size-4 text-muted-foreground" aria-hidden />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-sm font-medium">
                {formatActivityAction(item.action)}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {item.actor} · {item.entity}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatRelativeTime(item.timestamp)}
              </p>
            </div>
          </article>
        ))}
      </CardContent>

      <CardFooter className="px-6 py-4">
        <Button asChild variant="ghost" size="sm" className="ml-auto">
          <Link href="/admin/audit">
            Audit jurnalini ko&apos;rish
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
