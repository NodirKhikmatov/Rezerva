'use client';

import { Dialog } from '@base-ui/react/dialog';
import { Building2, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/shared/lib/format';
import { IconButton } from '@/shared/components/ui/icon-button';

import type { AdminBusinessRecord } from '../../types/admin-business.types';
import {
  getCategoryLabel,
  getSlaLabel,
  getVerificationStatusLabel,
} from '../../utils/admin-business-labels.utils';
import { maskOwnerPhone } from '../../utils/admin-businesses.utils';
import { AdminBusinessVerificationBadge } from './admin-business-verification-badge';

type AdminBusinessViewSheetProps = {
  business: AdminBusinessRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="max-w-[60%] text-right text-sm font-medium">{value}</dd>
    </div>
  );
}

export function AdminBusinessViewSheet({
  business,
  open,
  onOpenChange,
}: AdminBusinessViewSheetProps) {
  if (!business) {
    return null;
  }

  const isPending = business.verificationStatus === 'pending';

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Popup
          className={cn(
            'fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-border bg-background shadow-xl outline-none',
          )}
        >
          <div className="flex items-start justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Building2 className="size-5" aria-hidden />
              </div>
              <div>
                <Dialog.Title className="text-lg font-semibold">
                  {business.name}
                </Dialog.Title>
                <Dialog.Description className="text-sm text-muted-foreground">
                  {business.slug}
                </Dialog.Description>
              </div>
            </div>
            <IconButton
              icon={X}
              label="Close business details"
              onClick={() => onOpenChange(false)}
              size="sm"
            />
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-2">
            <dl className="divide-y divide-border">
              <DetailRow
                label="Tasdiqlash"
                value={getVerificationStatusLabel(business.verificationStatus)}
              />
              <DetailRow
                label="Kategoriya"
                value={getCategoryLabel(business.category)}
              />
              <DetailRow label="Shahar" value={business.city} />
              <DetailRow label="Tuman" value={business.district} />
              <DetailRow label="Manzil" value={business.address} />
              <DetailRow label="Egasi" value={business.ownerName} />
              <DetailRow
                label="Telefon"
                value={maskOwnerPhone(business.ownerPhone)}
              />
              <DetailRow label="Email" value={business.ownerEmail ?? '—'} />
              <DetailRow label="STIR" value={business.taxId ?? '—'} />
              <DetailRow
                label="Hujjatlar"
                value={String(business.documentsCount)}
              />
              <DetailRow
                label="Yuborilgan"
                value={formatRelativeTime(business.submittedAt)}
              />
              {isPending && (
                <DetailRow
                  label="SLA"
                  value={getSlaLabel(business.slaStatus)}
                />
              )}
              {business.reviewedAt && (
                <DetailRow
                  label="Ko'rib chiqilgan"
                  value={formatRelativeTime(business.reviewedAt)}
                />
              )}
              {business.approvalNotes && (
                <DetailRow
                  label="Tasdiqlash izohi"
                  value={business.approvalNotes}
                />
              )}
              {business.rejectReason && (
                <DetailRow
                  label="Rad etish sababi"
                  value={business.rejectReason}
                />
              )}
              {business.rejectMessage && (
                <DetailRow label="Egaga xabar" value={business.rejectMessage} />
              )}
            </dl>
          </div>

          <div className="border-t border-border px-6 py-4">
            <AdminBusinessVerificationBadge
              status={business.verificationStatus}
            />
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
