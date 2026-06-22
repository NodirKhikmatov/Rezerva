import { AuthGuard } from '@/features/auth/components/auth-guard';
import { BookingDetailContent } from '@/features/booking/components/booking-detail-content';

type BookingDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BookingDetailPage({
  params,
}: BookingDetailPageProps) {
  const { id } = await params;

  return (
    <AuthGuard returnPath={`/bookings/${id}`}>
      <BookingDetailContent bookingId={id} />
    </AuthGuard>
  );
}
