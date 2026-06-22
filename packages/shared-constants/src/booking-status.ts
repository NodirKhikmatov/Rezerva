export const BookingStatus = {
  pendingPayment: 'pending_payment',
  pendingApproval: 'pending_approval',
  confirmed: 'confirmed',
  checkedIn: 'checked_in',
  completed: 'completed',
  cancelled: 'cancelled',
  noShow: 'no_show',
} as const;

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export const BOOKING_STATUSES = Object.values(BookingStatus);
