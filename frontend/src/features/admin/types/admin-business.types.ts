import type { BusinessCategory } from '@rezerva/shared-constants';

export const AdminBusinessVerificationStatus = {
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected',
} as const;

export type AdminBusinessVerificationStatus =
  (typeof AdminBusinessVerificationStatus)[keyof typeof AdminBusinessVerificationStatus];

export const AdminBusinessSlaStatus = {
  ok: 'ok',
  warning: 'warning',
  critical: 'critical',
} as const;

export type AdminBusinessSlaStatus =
  (typeof AdminBusinessSlaStatus)[keyof typeof AdminBusinessSlaStatus];

export type AdminBusinessRecord = {
  id: string;
  verificationId: string;
  name: string;
  slug: string;
  category: BusinessCategory;
  city: string;
  district: string;
  address: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string | null;
  taxId: string | null;
  verificationStatus: AdminBusinessVerificationStatus;
  slaStatus: AdminBusinessSlaStatus;
  documentsCount: number;
  submittedAt: string;
  reviewedAt: string | null;
  rejectReason: string | null;
  rejectMessage: string | null;
  approvalNotes: string | null;
};

export type AdminBusinessFilters = {
  search: string;
  verificationStatus: AdminBusinessVerificationStatus | 'all';
  category: BusinessCategory | 'all';
  city: string | 'all';
};

export type AdminBusinessRejectInput = {
  reason: string;
  message: string;
};
