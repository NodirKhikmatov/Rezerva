import type { LucideIcon } from 'lucide-react';

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badgeKey?: 'pendingVerifications' | 'openDisputes' | 'flaggedReviews';
};
