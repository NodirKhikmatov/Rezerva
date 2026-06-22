export type BusinessSearchItem = {
  id: string;
  slug: string;
  name: string;
  category: string;
  status: string;
  coverImageUrl: string | null;
  averageRating: number;
  reviewCount: number;
  districtName: string | null;
  cityName: string | null;
  priceFrom: number | null;
  currency: string;
  isFeatured: boolean;
};

export type SearchBusinessesParams = {
  category?: string;
  q?: string;
  cityId?: string;
  districtId?: string;
  minRating?: number;
  page?: number;
  limit?: number;
  sort?: string;
};
