import { notFound } from 'next/navigation';

import { getBusinessBySlug } from '@/features/business/api/business.api';
import { BusinessProfile } from '@/features/business/components/business-profile';

type BusinessPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BusinessPage({ params }: BusinessPageProps) {
  const { slug } = await params;

  try {
    const business = await getBusinessBySlug(slug);
    return <BusinessProfile business={business} />;
  } catch {
    notFound();
  }
}
