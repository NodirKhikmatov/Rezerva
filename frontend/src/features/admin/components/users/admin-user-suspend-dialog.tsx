'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import {
  DialogFooter,
  DialogHeader,
  DialogModal,
} from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';

import { AdminUserStatus } from '../../types/admin-user.types';
import type { AdminUserRecord } from '../../types/admin-user.types';
import { getUserDisplayName } from '../../utils/admin-users.utils';

type AdminUserSuspendDialogProps = {
  user: AdminUserRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (userId: string, reason: string) => void;
  onReinstate: (userId: string) => void;
};

export function AdminUserSuspendDialog({
  user,
  open,
  onOpenChange,
  onConfirm,
  onReinstate,
}: AdminUserSuspendDialogProps) {
  const [reason, setReason] = useState('');
  const isSuspended = user?.status === AdminUserStatus.suspended;

  useEffect(() => {
    setReason(user?.suspendReason ?? '');
  }, [user]);

  const handleConfirm = () => {
    if (!user || !reason.trim()) {
      return;
    }

    onConfirm(user.id, reason.trim());
    onOpenChange(false);
  };

  const handleReinstate = () => {
    if (!user) {
      return;
    }

    onReinstate(user.id);
    onOpenChange(false);
  };

  return (
    <DialogModal open={open} onOpenChange={onOpenChange}>
      <DialogHeader
        title={
          isSuspended
            ? 'Foydalanuvchini faollashtirish'
            : "Foydalanuvchini to'xtatish"
        }
        description={
          isSuspended
            ? `${user ? getUserDisplayName(user) : 'Foydalanuvchi'} hisobini qayta faollashtirasizmi?`
            : "To'xtatish sababini kiriting. Bu foydalanuvchi platformadan foydalana olmaydi."
        }
        onClose={() => onOpenChange(false)}
      />

      {!isSuspended && (
        <div className="space-y-2">
          <Label htmlFor="suspend-reason">Sabab</Label>
          <Textarea
            id="suspend-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Masalan: firibgarlik, qoidalar buzilishi..."
            rows={4}
          />
        </div>
      )}

      {isSuspended && user?.suspendReason && (
        <p className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
          Joriy sabab: {user.suspendReason}
        </p>
      )}

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Bekor qilish
        </Button>
        {isSuspended ? (
          <Button onClick={handleReinstate}>Faollashtirish</Button>
        ) : (
          <Button
            variant="destructive"
            disabled={!reason.trim()}
            onClick={handleConfirm}
          >
            To&apos;xtatish
          </Button>
        )}
      </DialogFooter>
    </DialogModal>
  );
}
