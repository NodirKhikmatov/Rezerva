import { PlaceholderPage } from '@/shared/components/feedback/placeholder-page';

type CategoryPageProps = {
  params: Promise<{ category: string }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;

  return (
    <PlaceholderPage
      title={category.charAt(0).toUpperCase() + category.slice(1)}
      description="Category listings arrive in M2."
    />
  );
}
