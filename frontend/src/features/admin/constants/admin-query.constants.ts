export const ADMIN_QUERY_KEYS = {
  overview: ['admin', 'overview'] as const,
  auditLogs: (params: Record<string, unknown>) =>
    ['admin', 'audit-logs', params] as const,
  verifications: (params: Record<string, unknown>) =>
    ['admin', 'verifications', params] as const,
  verificationDetail: (verificationId: string) =>
    ['admin', 'verification', verificationId] as const,
  bookings: (params: Record<string, unknown>) =>
    ['admin', 'bookings', params] as const,
  analyticsBookings: (from: string, to: string) =>
    ['admin', 'analytics-bookings', from, to] as const,
} as const;
