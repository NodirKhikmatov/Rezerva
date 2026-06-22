import type {
  AdminActivityItem,
  AdminDashboardData,
  AdminPendingApproval,
  AdminPendingApprovalSla,
} from '../types/admin-dashboard.types';
import type {
  AdminAuditLogItem,
  AdminOverviewResponse,
  AdminVerificationListItem,
} from '../api/admin-api.types';
import { getCategoryLabel } from '../utils/admin-business-labels.utils';

function resolveSlaStatus(submittedAt: string): AdminPendingApprovalSla {
  const hours =
    (Date.now() - new Date(submittedAt).getTime()) / (1000 * 60 * 60);

  if (hours >= 48) {
    return 'critical';
  }

  if (hours >= 24) {
    return 'warning';
  }

  return 'ok';
}

export function mapAuditLogToActivity(
  item: AdminAuditLogItem,
): AdminActivityItem {
  const entityLabel =
    typeof item.newValues?.name === 'string'
      ? item.newValues.name
      : item.entityId.slice(0, 8);

  return {
    id: item.id,
    action: item.action,
    actor: item.actorEmail ?? 'Tizim',
    entity: entityLabel,
    timestamp: item.createdAt,
  };
}

export function mapVerificationToPendingApproval(
  item: AdminVerificationListItem,
): AdminPendingApproval {
  return {
    id: item.id,
    businessName: item.business.name,
    category: getCategoryLabel(
      item.business.category as Parameters<typeof getCategoryLabel>[0],
    ),
    submittedAt: item.submittedAt,
    slaStatus: resolveSlaStatus(item.submittedAt),
  };
}

export function mapOverviewToDashboard(
  overview: AdminOverviewResponse,
  auditLogs: AdminAuditLogItem[],
  pendingVerifications: AdminVerificationListItem[],
): AdminDashboardData {
  return {
    stats: {
      totalUsers: overview.newUsersToday,
      totalBusinesses: overview.activeBusinesses,
      totalBookings: overview.bookingsToday,
      revenue: overview.gmvToday,
      currency: overview.currency,
      trends: {
        totalUsers: { value: 0, direction: 'neutral' },
        totalBusinesses: { value: 0, direction: 'neutral' },
        totalBookings: { value: 0, direction: 'neutral' },
        revenue: { value: 0, direction: 'neutral' },
      },
    },
    recentActivity: auditLogs.map(mapAuditLogToActivity),
    pendingApprovals: pendingVerifications.map(
      mapVerificationToPendingApproval,
    ),
  };
}
