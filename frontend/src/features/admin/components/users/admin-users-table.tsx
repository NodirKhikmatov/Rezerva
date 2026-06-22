'use client';

import { Eye, MoreHorizontal, Pencil, UserX } from 'lucide-react';

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

import type { AdminUserRecord } from '../../types/admin-user.types';
import {
  getUserDisplayName,
  getUserInitials,
  maskPhone,
} from '../../utils/admin-users.utils';
import { getUserRoleLabel } from '../../utils/admin-user-labels.utils';
import { AdminUserStatusBadge } from './admin-user-status-badge';

type AdminUsersTableProps = {
  users: AdminUserRecord[];
  onView: (user: AdminUserRecord) => void;
  onEdit: (user: AdminUserRecord) => void;
  onSuspend: (user: AdminUserRecord) => void;
};

export function AdminUsersTable({
  users,
  onView,
  onEdit,
  onSuspend,
}: AdminUsersTableProps) {
  if (users.length === 0) {
    return (
      <Card variant="elevated" padding="lg">
        <CardContent className="py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Filtrlarga mos foydalanuvchi topilmadi.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated" padding="none">
      <CardHeader className="border-b border-border px-6 py-4">
        <CardTitle>Foydalanuvchilar</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <th className="px-6 py-3 font-medium text-muted-foreground">
                Foydalanuvchi
              </th>
              <th className="px-6 py-3 font-medium text-muted-foreground">
                Telefon
              </th>
              <th className="px-6 py-3 font-medium text-muted-foreground">
                Rol
              </th>
              <th className="px-6 py-3 font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-6 py-3 font-medium text-muted-foreground">
                Bronlar
              </th>
              <th className="px-6 py-3 font-medium text-muted-foreground">
                Faollik
              </th>
              <th className="px-6 py-3 font-medium text-muted-foreground">
                Amallar
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-muted/30">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {getUserInitials(user)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {getUserDisplayName(user)}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user.id}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {maskPhone(user.phone)}
                </td>
                <td className="px-6 py-4">{getUserRoleLabel(user.role)}</td>
                <td className="px-6 py-4">
                  <AdminUserStatusBadge status={user.status} />
                </td>
                <td className="px-6 py-4">{user.bookingsCount}</td>
                <td className="px-6 py-4 text-muted-foreground">
                  {user.lastActiveAt
                    ? formatRelativeTime(user.lastActiveAt)
                    : '—'}
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
                      <DropdownMenuItem onClick={() => onView(user)}>
                        <Eye className="size-4" aria-hidden />
                        Ko&apos;rish
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(user)}>
                        <Pencil className="size-4" aria-hidden />
                        Tahrirlash
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        destructive
                        onClick={() => onSuspend(user)}
                      >
                        <UserX className="size-4" aria-hidden />
                        {user.status === 'suspended'
                          ? 'Faollashtirish'
                          : "To'xtatish"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
