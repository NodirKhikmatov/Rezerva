import { Badge } from '@/shared/components/ui/badge';

import type { AdminUserStatus } from '../../types/admin-user.types';
import {
  getUserStatusLabel,
  getUserStatusVariant,
} from '../../utils/admin-user-labels.utils';

type AdminUserStatusBadgeProps = {
  status: AdminUserStatus;
};

export function AdminUserStatusBadge({ status }: AdminUserStatusBadgeProps) {
  return (
    <Badge variant={getUserStatusVariant(status)}>
      {getUserStatusLabel(status)}
    </Badge>
  );
}
