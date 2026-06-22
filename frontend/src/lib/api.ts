/** @deprecated Import from `@/features/auth` or `@/shared/lib/api-client` instead. */
export type {
  AuthSession as AuthResponse,
  AuthUser,
} from '@/features/auth/types/auth.types';
export { loginWithTelegram } from '@/features/auth/api/auth.api';

import { apiRequest } from '@/shared/lib/api-client';

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  isAvailable: boolean;
};

export const api = {
  loginWithTelegram: (payload: Record<string, unknown>) =>
    import('@/features/auth/api/auth.api').then((m) =>
      m.loginWithTelegram(payload),
    ),

  getProducts: () => apiRequest<Product[]>('/v1/orders/products'),

  getMyOrders: (token: string) =>
    apiRequest<unknown[]>('/v1/orders/me', { token }),

  createOrder: (
    token: string,
    body: { items: { productId: string; quantity: number }[]; notes?: string },
  ) =>
    apiRequest<unknown>('/v1/orders', {
      method: 'POST',
      token,
      body,
    }),
};
