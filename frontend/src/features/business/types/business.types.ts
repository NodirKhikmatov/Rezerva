export type BusinessDetail = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  status: string;
  phone: string;
  averageRating: number;
  reviewCount: number;
  coverImageUrl: string | null;
  gallery: {
    id: string;
    url: string;
    isCover: boolean;
    sortOrder: number;
  }[];
  venues: {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  }[];
  servicesSummary: {
    id: string;
    name: string;
    durationMinutes: number;
    priceFrom: number;
  }[];
  policies: {
    cancellationHoursBefore: number;
    cancellationFeePercent: number;
    depositPercent: number;
    requiresApproval: boolean;
  } | null;
  workingHoursSummary: string;
};

export type BusinessService = {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number;
  currency: string;
  pricingModel: string;
  isActive: boolean;
  resourceIds: string[];
  venueId: string;
};

export type ListServicesParams = {
  venueId?: string;
};

export type AvailabilitySlot = {
  startsAt: string;
  endsAt: string;
  resourceId: string;
  resourceName: string;
  price: number;
  currency: string;
  available: boolean;
};

export type AvailabilityResponse = {
  serviceId: string;
  timezone: string;
  slots: AvailabilitySlot[];
};

export type VenueDetail = {
  id: string;
  businessId: string;
  businessSlug: string;
  name: string;
  addressLine: string;
  districtId: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  workingHours: {
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }[];
  resources: {
    id: string;
    name: string;
    type: string;
    capacity: number;
    surfaceType?: string;
  }[];
};
