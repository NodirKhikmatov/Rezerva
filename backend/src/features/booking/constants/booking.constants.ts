export const HOLD_TTL_SECONDS = 600;
export const MAX_ACTIVE_HOLDS = 3;

export const BLOCKING_BOOKING_STATUSES = [
  'pending_payment',
  'pending_approval',
  'confirmed',
  'checked_in',
] as const;
