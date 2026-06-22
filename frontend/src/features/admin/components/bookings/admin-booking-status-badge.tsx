import { Badge } from '@/shared/components/ui/badge';

import type { BookingStatus } from '@rezerva/shared-constants';

import {
  getBookingStatusLabel,
  getBookingStatusVariant,
} from '../../utils/admin-booking-labels.utils';

type AdminBookingStatusBadgeProps = {
  status: BookingStatus;
};

export function AdminBookingStatusBadge({
  status,
}: AdminBookingStatusBadgeProps) {
  return (
    <Badge variant={getBookingStatusVariant(status)}>
      {getBookingStatusLabel(status)}
    </Badge>
  );
}
