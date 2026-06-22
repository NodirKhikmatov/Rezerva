import type { BusinessCategory } from '@rezerva/shared-constants';

import type {
  AdminBusinessSlaStatus,
  AdminBusinessVerificationStatus,
} from '../types/admin-business.types';

export function getVerificationStatusLabel(
  status: AdminBusinessVerificationStatus,
): string {
  switch (status) {
    case 'pending':
      return 'Kutilmoqda';
    case 'approved':
      return 'Tasdiqlangan';
    case 'rejected':
      return 'Rad etilgan';
  }
}

export function getVerificationStatusVariant(
  status: AdminBusinessVerificationStatus,
): 'warning' | 'success' | 'destructive' {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'approved':
      return 'success';
    case 'rejected':
      return 'destructive';
  }
}

export function getSlaLabel(status: AdminBusinessSlaStatus): string {
  switch (status) {
    case 'ok':
      return '< 24 soat';
    case 'warning':
      return '24–48 soat';
    case 'critical':
      return '> 48 soat';
  }
}

export function getSlaVariant(
  status: AdminBusinessSlaStatus,
): 'success' | 'warning' | 'destructive' {
  switch (status) {
    case 'ok':
      return 'success';
    case 'warning':
      return 'warning';
    case 'critical':
      return 'destructive';
  }
}

export function getCategoryLabel(category: BusinessCategory): string {
  const labels: Record<BusinessCategory, string> = {
    football: 'Football',
    salon: 'Salon',
    restaurant: 'Restaurant',
    clinic: 'Clinic',
    coworking: 'Coworking',
    hotel: 'Hotel',
  };

  return labels[category];
}

export const REJECT_REASON_OPTIONS = [
  { value: 'invalid_license', label: 'Litsenziya yaroqsiz' },
  { value: 'incomplete_documents', label: "Hujjatlar to'liq emas" },
  { value: 'address_mismatch', label: 'Manzil mos kelmaydi' },
  { value: 'policy_violation', label: 'Qoidalar buzilishi' },
  { value: 'other', label: 'Boshqa' },
] as const;
