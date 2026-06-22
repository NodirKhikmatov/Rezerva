import { AuditEntityType } from '@prisma/client';

export type AuditContext = {
  ipAddress?: string;
  userAgent?: string;
};

export type AdminOverviewResponse = {
  pendingVerifications: number;
  openDisputes: number;
  bookingsToday: number;
  gmvToday: number;
  currency: string;
  activeBusinesses: number;
  newUsersToday: number;
};

export type AdminVerificationListItem = {
  id: string;
  status: string;
  submittedAt: string;
  reviewedAt: string | null;
  rejectReason: string | null;
  rejectMessage: string | null;
  notes: string | null;
  business: {
    id: string;
    name: string;
    slug: string;
    category: string;
    status: string;
    cityName: string;
    districtName: string | null;
    addressLine: string | null;
    ownerName: string;
    ownerPhone: string | null;
    ownerEmail: string | null;
  };
  documentsCount: number;
};

export type AdminVerificationDetail = AdminVerificationListItem & {
  notes: string | null;
  rejectReason: string | null;
  rejectMessage: string | null;
  documents: Array<{
    id: string;
    type: string;
    url: string;
    createdAt: string;
  }>;
  business: AdminVerificationListItem['business'] & {
    description: string | null;
    phone: string;
    onboardingStep: string;
    owner: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      phone: string | null;
      email: string | null;
    };
  };
};

export type AdminBookingListItem = {
  id: string;
  referenceCode: string;
  status: string;
  businessId: string;
  businessName: string;
  businessCategory: string;
  userId: string | null;
  customerName: string | null;
  customerPhone: string | null;
  serviceName: string | null;
  resourceName: string | null;
  city: string | null;
  paymentMethod: string;
  paymentProvider: string | null;
  totalAmount: number;
  currency: string;
  paymentStatus: string | null;
  startsAt: string;
  endsAt: string;
  createdAt: string;
  cancelledAt: string | null;
  cancellationReason: string | null;
};

export type AdminCancelBookingResponse = {
  id: string;
  status: string;
  cancellationFee: number;
  refundAmount: number;
  refundStatus: string | null;
};

export type AdminAuditLogItem = {
  id: string;
  actorId: string | null;
  actorEmail: string | null;
  action: string;
  entityType: AuditEntityType;
  entityId: string;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
};
