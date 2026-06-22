'use client';

import { useEffect, useState } from 'react';
import { Hero } from '@/components/hero';
import type { AuthResponse, Product } from '@/lib/api';

const AUTH_STORAGE_KEY = 'ordering.auth';

type HomeClientProps = {
  products: Product[];
};

export function HomeClient({ products }: HomeClientProps) {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as AuthResponse;
      setUser(parsed.user);
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  const handleLogin = (response: AuthResponse) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(response));
    setUser(response.user);
  };

  return <Hero products={products} user={user} onLogin={handleLogin} />;
}
