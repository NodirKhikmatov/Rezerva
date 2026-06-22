export type AdminDashboardTrend = {
  value: number;
  direction: 'up' | 'down' | 'neutral';
};

export type AdminDashboardStats = {
  totalUsers: number;
  totalBusinesses: number;
  totalBookings: number;
  revenue: number;
  currency: string;
  trends: {
    totalUsers: AdminDashboardTrend;
    totalBusinesses: AdminDashboardTrend;
    totalBookings: AdminDashboardTrend;
    revenue: AdminDashboardTrend;
  };
};

export type AdminActivityItem = {
  id: string;
  action: string;
  actor: string;
  entity: string;
  timestamp: string;
};

export type AdminPendingApprovalSla = 'ok' | 'warning' | 'critical';

export type AdminPendingApproval = {
  id: string;
  businessName: string;
  category: string;
  submittedAt: string;
  slaStatus: AdminPendingApprovalSla;
};

export type AdminDashboardData = {
  stats: AdminDashboardStats;
  recentActivity: AdminActivityItem[];
  pendingApprovals: AdminPendingApproval[];
};
