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
  AdminBookingCancelInput,
  AdminBookingRecord,
  AdminBookingRefundOverride,
} from '../../types/admin-booking.types';
import {
  CANCEL_REASON_OPTIONS,
  REFUND_OVERRIDE_OPTIONS,
} from '../../utils/admin-booking-labels.utils';

const selectClassName =
  'flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30';

type AdminBookingCancelDialogProps = {
  booking: AdminBookingRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (bookingId: string, input: AdminBookingCancelInput) => void;
};

export function AdminBookingCancelDialog({
  booking,
  open,
  onOpenChange,
  onConfirm,
}: AdminBookingCancelDialogProps) {
  const [reason, setReason] = useState<string>(CANCEL_REASON_OPTIONS[0].value);
  const [refundOverride, setRefundOverride] =
    useState<AdminBookingRefundOverride>('full');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setReason(CANCEL_REASON_OPTIONS[0].value);
    setRefundOverride('full');
    setNotes('');
  }, [booking]);

  const handleConfirm = () => {
    if (!booking) {
      return;
    }

    onConfirm(booking.id, {
      reason,
      refundOverride,
      notes: notes.trim(),
    });
    onOpenChange(false);
  };

  return (
    <DialogModal open={open} onOpenChange={onOpenChange}>
      <DialogHeader
        title="Bronni bekor qilish"
        description={
          booking
            ? `${booking.referenceCode} bronini majburiy bekor qilasiz.`
            : undefined
        }
        onClose={() => onOpenChange(false)}
      />

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cancel-reason">Sabab</Label>
          <select
            id="cancel-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className={cn(selectClassName)}
          >
            {CANCEL_REASON_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cancel-refund">Qaytarish</Label>
          <select
            id="cancel-refund"
            value={refundOverride}
            onChange={(event) =>
              setRefundOverride(
                event.target.value as AdminBookingRefundOverride,
              )
            }
            className={cn(selectClassName)}
          >
            {REFUND_OVERRIDE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cancel-notes">Ichki izoh (ixtiyoriy)</Label>
          <Textarea
            id="cancel-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Support ticket yoki qo'shimcha tafsilotlar"
            rows={3}
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Bekor qilish
        </Button>
        <Button variant="destructive" onClick={handleConfirm}>
          Bronni bekor qilish
        </Button>
      </DialogFooter>
    </DialogModal>
  );
}
