const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export type AuthResponse = {
  accessToken: string;
  user: {
    id: string;
    telegramId: string;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    photoUrl: string | null;
  };
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  isAvailable: boolean;
};

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, headers, ...rest } = options;

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  loginWithTelegram: (payload: Record<string, unknown>) =>
    request<AuthResponse>('/auth/telegram', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getProducts: () => request<Product[]>('/orders/products'),

  getMyOrders: (token: string) => request<unknown[]>('/orders/me', { token }),

  createOrder: (
    token: string,
    body: { items: { productId: string; quantity: number }[]; notes?: string },
  ) =>
    request<unknown>('/orders', {
      method: 'POST',
      token,
      body: JSON.stringify(body),
    }),
};
