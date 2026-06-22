import {
  BarChart3,
  Building2,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  MessageSquareWarning,
  Percent,
  Scale,
  ScrollText,
  Settings,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react';

import type { AdminNavItem } from '../types/admin-nav.types';

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: 'Boshqaruv', href: '/admin', icon: LayoutDashboard },
  { label: 'Analitika', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Foydalanuvchilar', href: '/admin/users', icon: Users },
  {
    label: 'Tasdiqlash',
    href: '/admin/verifications',
    icon: ShieldCheck,
    badgeKey: 'pendingVerifications',
  },
  { label: 'Bronlar', href: '/admin/bookings', icon: CalendarDays },
  {
    label: 'Nizolar',
    href: '/admin/disputes',
    icon: Scale,
    badgeKey: 'openDisputes',
  },
  {
    label: 'Sharhlar',
    href: '/admin/reviews',
    icon: MessageSquareWarning,
    badgeKey: 'flaggedReviews',
  },
  { label: 'Bizneslar', href: '/admin/businesses', icon: Building2 },
  { label: 'Tanlangan', href: '/admin/featured', icon: Star },
  { label: 'Komissiya', href: '/admin/commission', icon: Percent },
  { label: "To'lovlar", href: '/admin/payments', icon: CreditCard },
  { label: 'Sozlamalar', href: '/admin/settings', icon: Settings },
  { label: 'Audit', href: '/admin/audit', icon: ScrollText },
];

export const ADMIN_ROUTE_LABELS: Record<string, string> = {
  admin: 'Boshqaruv',
  analytics: 'Analitika',
  users: 'Foydalanuvchilar',
  verifications: 'Tasdiqlash',
  bookings: 'Bronlar',
  disputes: 'Nizolar',
  reviews: 'Sharhlar',
  businesses: 'Bizneslar',
  featured: 'Tanlangan',
  commission: 'Komissiya',
  payments: "To'lovlar",
  settings: 'Sozlamalar',
  audit: 'Audit',
};
