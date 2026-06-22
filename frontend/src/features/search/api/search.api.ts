import { apiRequest } from '@/shared/lib/api-client';
import type { PaginatedResponse } from '@/shared/types/pagination.types';

import type {
  BusinessSearchItem,
  SearchBusinessesParams,
} from '../types/search.types';

export async function searchBusinesses(
  params: SearchBusinessesParams = {},
): Promise<PaginatedResponse<BusinessSearchItem>> {
  const searchParams = new URLSearchParams();

  if (params.category) searchParams.set('category', params.category);
  if (params.q) searchParams.set('q', params.q);
  if (params.cityId) searchParams.set('cityId', params.cityId);
  if (params.districtId) searchParams.set('districtId', params.districtId);
  if (params.minRating) searchParams.set('minRating', String(params.minRating));
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.sort) searchParams.set('sort', params.sort);

  const query = searchParams.toString();
  return apiRequest<PaginatedResponse<BusinessSearchItem>>(
    `/v1/businesses${query ? `?${query}` : ''}`,
  );
}
