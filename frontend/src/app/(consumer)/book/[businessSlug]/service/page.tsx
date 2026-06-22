import { notFound } from 'next/navigation';

import { getBusinessBySlug } from '@/features/business/api/business.api';
import { ServiceSelectStep } from '@/features/booking/components/service-select-step';

type BookServicePageProps = {
  params: Promise<{ businessSlug: string }>;
};

export default async function BookServicePage({
  params,
}: BookServicePageProps) {
  const { businessSlug } = await params;

  try {
    const business = await getBusinessBySlug(businessSlug);
    return <ServiceSelectStep business={business} />;
  } catch {
    notFound();
  }
}
