'use client';

import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@/shared/components/ui/button';
import {
  DialogFooter,
  DialogHeader,
  DialogModal,
} from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';

import type {
  AdminBusinessRecord,
  AdminBusinessRejectInput,
} from '../../types/admin-business.types';
import { REJECT_REASON_OPTIONS } from '../../utils/admin-business-labels.utils';

const selectClassName =
  'flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30';

type AdminBusinessRejectDialogProps = {
  business: AdminBusinessRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (verificationId: string, input: AdminBusinessRejectInput) => void;
};

export function AdminBusinessRejectDialog({
  business,
  open,
  onOpenChange,
  onConfirm,
}: AdminBusinessRejectDialogProps) {
  const [reason, setReason] = useState<string>(REJECT_REASON_OPTIONS[0].value);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setReason(REJECT_REASON_OPTIONS[0].value);
    setMessage('');
  }, [business]);

  const handleConfirm = () => {
    if (!business || !message.trim()) {
      return;
    }

    onConfirm(business.verificationId, {
      reason,
      message: message.trim(),
    });
    onOpenChange(false);
  };

  return (
    <DialogModal open={open} onOpenChange={onOpenChange}>
      <DialogHeader
        title="Biznesni rad etish"
        description="Rad etish sababi va egaga ko'rsatiladigan xabar majburiy."
        onClose={() => onOpenChange(false)}
      />

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reject-reason">Sabab</Label>
          <select
            id="reject-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className={cn(selectClassName)}
          >
            {REJECT_REASON_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reject-message">Egaga xabar</Label>
          <Textarea
            id="reject-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Masalan: Biznes litsenziyasi muddati tugagan. Yangi hujjat yuklang."
            rows={4}
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Bekor qilish
        </Button>
        <Button
          variant="destructive"
          disabled={!message.trim()}
          onClick={handleConfirm}
        >
          Rad etish
        </Button>
      </DialogFooter>
    </DialogModal>
  );
}
