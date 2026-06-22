import type { BusinessCategory } from '@rezerva/shared-constants';

export type AdminAnalyticsPeriod = '7d' | '30d' | '90d';

export type AdminDailyMetric = {
  date: string;
  label: string;
  bookings: number;
  revenue: number;
  activeUsers: number;
};

export type AdminCategoryMetric = {
  category: BusinessCategory;
  bookings: number;
  revenue: number;
  sharePercent: number;
};

export type AdminAnalyticsSummary = {
  totalBookings: number;
  totalRevenue: number;
  averageActiveUsers: number;
  topCategory: BusinessCategory;
};

export type AdminAnalyticsData = {
  currency: string;
  daily: AdminDailyMetric[];
  categories: AdminCategoryMetric[];
  summary: AdminAnalyticsSummary;
};
