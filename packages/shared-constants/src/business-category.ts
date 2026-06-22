export const BusinessCategory = {
  football: 'football',
  salon: 'salon',
  restaurant: 'restaurant',
  clinic: 'clinic',
  coworking: 'coworking',
  hotel: 'hotel',
} as const;

export type BusinessCategory =
  (typeof BusinessCategory)[keyof typeof BusinessCategory];

export const BUSINESS_CATEGORIES = Object.values(BusinessCategory);
