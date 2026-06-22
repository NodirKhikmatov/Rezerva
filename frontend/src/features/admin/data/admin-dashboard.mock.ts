import type { AdminDashboardData } from '../types/admin-dashboard.types';

export const ADMIN_DASHBOARD_MOCK: AdminDashboardData = {
  stats: {
    totalUsers: 12847,
    totalBusinesses: 342,
    totalBookings: 28491,
    revenue: 425000000,
    currency: 'UZS',
    trends: {
      totalUsers: { value: 12.4, direction: 'up' },
      totalBusinesses: { value: 5.8, direction: 'up' },
      totalBookings: { value: 8.2, direction: 'up' },
      revenue: { value: 3.1, direction: 'down' },
    },
  },
  recentActivity: [
    {
      id: 'act-001',
      action: 'verification.approve',
      actor: 'Sardor Karimov',
      entity: 'Arena Football Club',
      timestamp: '2026-06-22T09:42:00.000Z',
    },
    {
      id: 'act-002',
      action: 'dispute.resolve',
      actor: 'Malika Yusupova',
      entity: 'Booking #RZ-10482',
      timestamp: '2026-06-22T09:18:00.000Z',
    },
    {
      id: 'act-003',
      action: 'booking.force_cancel',
      actor: 'Javohir Tursunov',
      entity: 'Booking #RZ-10471',
      timestamp: '2026-06-22T08:55:00.000Z',
    },
    {
      id: 'act-004',
      action: 'business.suspend',
      actor: 'Sardor Karimov',
      entity: 'Beauty Studio Lux',
      timestamp: '2026-06-22T08:12:00.000Z',
    },
    {
      id: 'act-005',
      action: 'featured.create',
      actor: 'Malika Yusupova',
      entity: 'Chilanzar Sport Arena',
      timestamp: '2026-06-22T07:36:00.000Z',
    },
    {
      id: 'act-006',
      action: 'review.moderate',
      actor: 'Javohir Tursunov',
      entity: 'Review on Elite Clinic',
      timestamp: '2026-06-22T07:01:00.000Z',
    },
  ],
  pendingApprovals: [
    {
      id: 'ver-001',
      businessName: 'Chilanzar Sport Arena',
      category: 'Football',
      submittedAt: '2026-06-21T14:20:00.000Z',
      slaStatus: 'ok',
    },
    {
      id: 'ver-002',
      businessName: 'Beauty Studio Lux',
      category: 'Salon',
      submittedAt: '2026-06-21T09:05:00.000Z',
      slaStatus: 'warning',
    },
    {
      id: 'ver-003',
      businessName: 'Samarkand Dental Clinic',
      category: 'Clinic',
      submittedAt: '2026-06-20T16:40:00.000Z',
      slaStatus: 'critical',
    },
    {
      id: 'ver-004',
      businessName: 'Registan Hotel',
      category: 'Hotel',
      submittedAt: '2026-06-20T11:15:00.000Z',
      slaStatus: 'critical',
    },
    {
      id: 'ver-005',
      businessName: 'Oshxona 24',
      category: 'Restaurant',
      submittedAt: '2026-06-22T06:50:00.000Z',
      slaStatus: 'ok',
    },
  ],
};
