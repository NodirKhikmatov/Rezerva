import { HomeClient } from '@/components/home-client';
import { api } from '@/lib/api';

export default async function Home() {
  let products: Awaited<ReturnType<typeof api.getProducts>> = [];

  try {
    products = await api.getProducts();
  } catch {
    products = [];
  }

  return (
    <main className="min-h-full bg-background">
      <HomeClient products={products} />
    </main>
  );
}
