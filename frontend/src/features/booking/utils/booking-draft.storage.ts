import type { BookingDraft } from '@/features/booking/types/booking.types';

const DRAFT_PREFIX = 'rezerva.booking.draft.';

export function getBookingDraftKey(businessSlug: string): string {
  return `${DRAFT_PREFIX}${businessSlug}`;
}

export function loadBookingDraft(businessSlug: string): BookingDraft | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(getBookingDraftKey(businessSlug));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BookingDraft;
  } catch {
    return null;
  }
}

export function saveBookingDraft(draft: BookingDraft): void {
  sessionStorage.setItem(
    getBookingDraftKey(draft.businessSlug),
    JSON.stringify(draft),
  );
}

export function clearBookingDraft(businessSlug: string): void {
  sessionStorage.removeItem(getBookingDraftKey(businessSlug));
}
