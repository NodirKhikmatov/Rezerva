export type CreateHoldPayload = {
  businessId: string;
  serviceId: string;
  resourceId: string;
  startsAt: string;
  endsAt: string;
  partySize?: number;
};

export type ConfirmBookingPayload = {
  holdId: string;
  paymentMethod: 'pay_at_venue' | 'online';
  notes?: string;
  participants?: { name: string; phone?: string }[];
  intakeResponses?: unknown[];
};

export type BookingHold = {
  holdId: string;
  expiresAt: string;
  expiresInSeconds: number;
  serviceId: string;
  resourceId: string;
  startsAt: string;
  endsAt: string;
  price: number;
  currency: string;
  depositAmount: number;
};

export type BookingSummary = {
  id: string;
  referenceCode: string;
  status: string;
  businessName: string;
  venueName: string;
  startsAt: string;
  endsAt: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
};

export type BookingDetail = {
  id: string;
  referenceCode: string;
  status: string;
  timeline?: { status: string; at: string; actor: string }[];
  business?: { id: string; name: string; slug: string };
  businessId?: string;
  businessName?: string;
  venue?: { id: string; name: string; addressLine: string };
  venueId?: string;
  lineItems?: {
    serviceId: string;
    name: string;
    durationMinutes: number;
    price: number;
  }[];
  allocations?: {
    resourceId: string;
    resourceName: string;
    startsAt: string;
    endsAt: string;
  }[];
  totalAmount: number;
  depositAmount?: number;
  currency: string;
  paymentMethod?: string;
  policySnapshot?: Record<string, unknown>;
  qrCodeUrl?: string;
  canCancel?: boolean;
  canReview?: boolean;
  createdAt?: string;
  startsAt?: string;
  endsAt?: string;
  serviceId?: string;
  resourceId?: string;
};

export type BookingDraft = {
  businessId: string;
  businessSlug: string;
  businessName: string;
  serviceId: string;
  serviceName: string;
  resourceId: string;
  resourceName: string;
  startsAt: string;
  endsAt: string;
  price: number;
  currency: string;
  holdId?: string;
  holdExpiresAt?: string;
};
