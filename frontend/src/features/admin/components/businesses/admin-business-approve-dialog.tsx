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

import type { AdminBusinessRecord } from '../../types/admin-business.types';

type AdminBusinessApproveDialogProps = {
  business: AdminBusinessRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (verificationId: string, notes: string) => void;
};

export function AdminBusinessApproveDialog({
  business,
  open,
  onOpenChange,
  onConfirm,
}: AdminBusinessApproveDialogProps) {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setNotes('');
  }, [business]);

  const handleConfirm = () => {
    if (!business) {
      return;
    }

    onConfirm(business.verificationId, notes.trim());
    onOpenChange(false);
  };

  return (
    <DialogModal open={open} onOpenChange={onOpenChange}>
      <DialogHeader
        title="Biznesni tasdiqlash"
        description={
          business
            ? `${business.name} biznesini faollashtirishni tasdiqlaysizmi?`
            : undefined
        }
        onClose={() => onOpenChange(false)}
      />

      <div className="space-y-2">
        <Label htmlFor="approve-notes">Izoh (ixtiyoriy)</Label>
        <Textarea
          id="approve-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Masalan: Hujjatlar tekshirildi"
          rows={3}
        />
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Bekor qilish
        </Button>
        <Button onClick={handleConfirm}>Tasdiqlash</Button>
      </DialogFooter>
    </DialogModal>
  );
}
