import { Badge } from '@/shared/components/ui/badge';

import type { AdminBusinessVerificationStatus } from '../../types/admin-business.types';
import {
  getVerificationStatusLabel,
  getVerificationStatusVariant,
} from '../../utils/admin-business-labels.utils';

type AdminBusinessVerificationBadgeProps = {
  status: AdminBusinessVerificationStatus;
};

export function AdminBusinessVerificationBadge({
  status,
}: AdminBusinessVerificationBadgeProps) {
  return (
    <Badge variant={getVerificationStatusVariant(status)}>
      {getVerificationStatusLabel(status)}
    </Badge>
  );
}
