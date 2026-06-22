import type { AdminPendingApprovalSla } from '../types/admin-dashboard.types';

const ACTIVITY_LABELS: Record<string, string> = {
  'verification.approve': 'Biznes tasdiqlandi',
  'verification.reject': 'Biznes rad etildi',
  'dispute.resolve': 'Nizo hal qilindi',
  'booking.force_cancel': 'Bron bekor qilindi',
  'business.suspend': "Biznes to'xtatildi",
  'business.reinstate': 'Biznes qayta faollashtirildi',
  'featured.create': "Tanlangan qo'shildi",
  'review.moderate': 'Sharh moderatsiya qilindi',
  'payment.refund_override': 'Qaytarish amalga oshirildi',
};

export function formatActivityAction(action: string): string {
  return ACTIVITY_LABELS[action] ?? action;
}

export function getSlaLabel(status: AdminPendingApprovalSla): string {
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
  status: AdminPendingApprovalSla,
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
