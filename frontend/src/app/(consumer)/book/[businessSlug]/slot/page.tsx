import { notFound } from 'next/navigation';

import { AuthGuard } from '@/features/auth/components/auth-guard';
import { getBusinessBySlug } from '@/features/business/api/business.api';
import { SlotSelectStep } from '@/features/booking/components/slot-select-step';

type BookSlotPageProps = {
  params: Promise<{ businessSlug: string }>;
};

export default async function BookSlotPage({ params }: BookSlotPageProps) {
  const { businessSlug } = await params;

  try {
    const business = await getBusinessBySlug(businessSlug);
    return (
      <AuthGuard returnPath={`/book/${businessSlug}/slot`}>
        <SlotSelectStep business={business} />
      </AuthGuard>
    );
  } catch {
    notFound();
  }
}
