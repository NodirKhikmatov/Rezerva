import type { BusinessCategory } from '@rezerva/shared-constants';

import type { AdminVerificationListItem } from '../api/admin-api.types';
import {
  AdminBusinessSlaStatus,
  AdminBusinessVerificationStatus,
  type AdminBusinessRecord,
} from '../types/admin-business.types';

function mapVerificationStatus(
  status: string,
): AdminBusinessVerificationStatus {
  if (status === AdminBusinessVerificationStatus.approved) {
    return AdminBusinessVerificationStatus.approved;
  }

  if (status === AdminBusinessVerificationStatus.rejected) {
    return AdminBusinessVerificationStatus.rejected;
  }

  return AdminBusinessVerificationStatus.pending;
}

function resolveSlaStatus(submittedAt: string): AdminBusinessSlaStatus {
  const hours =
    (Date.now() - new Date(submittedAt).getTime()) / (1000 * 60 * 60);

  if (hours >= 48) {
    return AdminBusinessSlaStatus.critical;
  }

  if (hours >= 24) {
    return AdminBusinessSlaStatus.warning;
  }

  return AdminBusinessSlaStatus.ok;
}

export function mapVerificationToBusinessRecord(
  item: AdminVerificationListItem,
): AdminBusinessRecord {
  return {
    id: item.business.id,
    verificationId: item.id,
    name: item.business.name,
    slug: item.business.slug,
    category: item.business.category as BusinessCategory,
    city: item.business.cityName,
    district: item.business.districtName ?? '—',
    address: item.business.addressLine ?? '—',
    ownerName: item.business.ownerName,
    ownerPhone: item.business.ownerPhone ?? '—',
    ownerEmail: item.business.ownerEmail,
    taxId: null,
    verificationStatus: mapVerificationStatus(item.status),
    slaStatus: resolveSlaStatus(item.submittedAt),
    documentsCount: item.documentsCount,
    submittedAt: item.submittedAt,
    reviewedAt: item.reviewedAt,
    rejectReason: item.rejectReason,
    rejectMessage: item.rejectMessage,
    approvalNotes: item.notes,
  };
}
