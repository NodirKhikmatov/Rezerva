import { Suspense } from 'react';

import { BookingSuccess } from '@/features/booking/components/booking-success';

type BookSuccessPageProps = {
  params: Promise<{ businessSlug: string }>;
  searchParams: Promise<{ bookingId?: string; reference?: string }>;
};

function SuccessContent({
  businessSlug,
  bookingId,
  referenceCode,
}: {
  businessSlug: string;
  bookingId: string;
  referenceCode: string;
}) {
  return (
    <BookingSuccess
      businessSlug={businessSlug}
      bookingId={bookingId}
      referenceCode={referenceCode}
    />
  );
}

export default async function BookSuccessPage({
  params,
  searchParams,
}: BookSuccessPageProps) {
  const { businessSlug } = await params;
  const query = await searchParams;

  if (!query.bookingId) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <SuccessContent
        businessSlug={businessSlug}
        bookingId={query.bookingId}
        referenceCode={query.reference ?? ''}
      />
    </Suspense>
  );
}
