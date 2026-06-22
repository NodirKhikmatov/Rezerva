'use client';

import { Dialog } from '@base-ui/react/dialog';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/shared/lib/format';
import { IconButton } from '@/shared/components/ui/icon-button';

import type { AdminUserRecord } from '../../types/admin-user.types';
import {
  getUserDisplayName,
  getUserInitials,
  maskPhone,
} from '../../utils/admin-users.utils';
import {
  getUserRoleLabel,
  getUserStatusLabel,
} from '../../utils/admin-user-labels.utils';
import { AdminUserStatusBadge } from './admin-user-status-badge';

type AdminUserViewSheetProps = {
  user: AdminUserRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-medium">{value}</dd>
    </div>
  );
}

export function AdminUserViewSheet({
  user,
  open,
  onOpenChange,
}: AdminUserViewSheetProps) {
  if (!user) {
    return null;
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Popup
          className={cn(
            'fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-background shadow-xl outline-none',
          )}
        >
          <div className="flex items-start justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {getUserInitials(user)}
              </div>
              <div>
                <Dialog.Title className="text-lg font-semibold">
                  {getUserDisplayName(user)}
                </Dialog.Title>
                <Dialog.Description className="text-sm text-muted-foreground">
                  {user.id}
                </Dialog.Description>
              </div>
            </div>
            <IconButton
              icon={X}
              label="Close user details"
              onClick={() => onOpenChange(false)}
              size="sm"
            />
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-2">
            <dl className="divide-y divide-border">
              <DetailRow
                label="Status"
                value={getUserStatusLabel(user.status)}
              />
              <DetailRow label="Rol" value={getUserRoleLabel(user.role)} />
              <DetailRow label="Telefon" value={maskPhone(user.phone)} />
              <DetailRow label="Email" value={user.email ?? '—'} />
              <DetailRow
                label="Username"
                value={user.username ? `@${user.username}` : '—'}
              />
              <DetailRow label="Til" value={user.locale.toUpperCase()} />
              <DetailRow label="Bronlar" value={String(user.bookingsCount)} />
              <DetailRow
                label="Ro'yxatdan o'tgan"
                value={formatRelativeTime(user.createdAt)}
              />
              <DetailRow
                label="So'nggi faollik"
                value={
                  user.lastActiveAt
                    ? formatRelativeTime(user.lastActiveAt)
                    : '—'
                }
              />
              {user.suspendReason && (
                <DetailRow
                  label="To'xtatish sababi"
                  value={user.suspendReason}
                />
              )}
            </dl>
          </div>

          <div className="border-t border-border px-6 py-4">
            <AdminUserStatusBadge status={user.status} />
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
