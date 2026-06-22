import { notFound } from 'next/navigation';

import { AuthGuard } from '@/features/auth/components/auth-guard';
import { getBusinessBySlug } from '@/features/business/api/business.api';
import { BookingSummaryStep } from '@/features/booking/components/booking-summary-step';

type BookSummaryPageProps = {
  params: Promise<{ businessSlug: string }>;
};

export default async function BookSummaryPage({
  params,
}: BookSummaryPageProps) {
  const { businessSlug } = await params;

  try {
    const business = await getBusinessBySlug(businessSlug);
    return (
      <AuthGuard returnPath={`/book/${businessSlug}/summary`}>
        <BookingSummaryStep business={business} />
      </AuthGuard>
    );
  } catch {
    notFound();
  }
}
