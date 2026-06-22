import type { AdminUserStatus } from '../types/admin-user.types';

export function getUserStatusLabel(status: AdminUserStatus): string {
  switch (status) {
    case 'active':
      return 'Faol';
    case 'suspended':
      return "To'xtatilgan";
    case 'pending':
      return 'Kutilmoqda';
  }
}

export function getUserStatusVariant(
  status: AdminUserStatus,
): 'success' | 'destructive' | 'warning' {
  switch (status) {
    case 'active':
      return 'success';
    case 'suspended':
      return 'destructive';
    case 'pending':
      return 'warning';
  }
}

export function getUserRoleLabel(role: string): string {
  return role === 'admin' ? 'Admin' : 'Consumer';
}
