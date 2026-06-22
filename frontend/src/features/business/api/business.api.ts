import { apiRequest } from '@/shared/lib/api-client';
import type { PaginatedResponse } from '@/shared/types/pagination.types';

import type {
  AvailabilityResponse,
  BusinessDetail,
  BusinessService,
  ListServicesParams,
} from '../types/business.types';

export async function getBusinessBySlug(slug: string): Promise<BusinessDetail> {
  return apiRequest<BusinessDetail>(`/v1/businesses/slug/${slug}`);
}

export async function listBusinessServices(
  businessId: string,
  params: ListServicesParams = {},
): Promise<PaginatedResponse<BusinessService>> {
  const searchParams = new URLSearchParams();
  if (params.venueId) searchParams.set('venueId', params.venueId);
  const query = searchParams.toString();

  return apiRequest<PaginatedResponse<BusinessService>>(
    `/v1/businesses/${businessId}/services${query ? `?${query}` : ''}`,
  );
}

export async function getAvailability(
  businessId: string,
  params: {
    serviceId: string;
    resourceId?: string;
    from: string;
    to: string;
    partySize?: number;
  },
): Promise<AvailabilityResponse> {
  const searchParams = new URLSearchParams({
    serviceId: params.serviceId,
    from: params.from,
    to: params.to,
  });
  if (params.resourceId) searchParams.set('resourceId', params.resourceId);
  if (params.partySize) searchParams.set('partySize', String(params.partySize));

  return apiRequest<AvailabilityResponse>(
    `/v1/businesses/${businessId}/availability?${searchParams.toString()}`,
  );
}
