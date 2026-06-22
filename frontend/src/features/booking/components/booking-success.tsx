'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { getBookingDetail } from '@/features/booking/api/booking.api';
import type { BookingDetail } from '@/features/booking/types/booking.types';
import { useAuth } from '@/features/auth/hooks/use-auth';
import {
  formatPrice,
  formatSlotDate,
  formatSlotTime,
} from '@/shared/lib/format';
import { Container } from '@/shared/components/layout/container';
import { Section } from '@/shared/components/layout/section';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Typography } from '@/shared/components/ui/typography';

type BookingSuccessProps = {
  bookingId: string;
  referenceCode: string;
  businessSlug: string;
};

export function BookingSuccess({
  bookingId,
  referenceCode,
  businessSlug,
}: BookingSuccessProps) {
  const { accessToken } = useAuth();
  const [booking, setBooking] = useState<BookingDetail | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    void getBookingDetail(accessToken, bookingId).then(setBooking);
  }, [accessToken, bookingId]);

  const startsAt = booking?.startsAt ?? booking?.allocations?.[0]?.startsAt;
  const endsAt = booking?.endsAt ?? booking?.allocations?.[0]?.endsAt;

  return (
    <Section spacing="lg">
      <Container className="flex max-w-lg flex-col items-center gap-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-success/15 text-success">
          ✓
        </div>
        <div className="space-y-2">
          <Typography variant="h2">Booking confirmed</Typography>
          <Typography variant="muted">
            Reference {referenceCode || booking?.referenceCode}
          </Typography>
        </div>

        {booking && (
          <Card className="w-full space-y-3 text-left">
            <Typography variant="label">
              {booking.business?.name ?? booking.businessName}
            </Typography>
            {startsAt && endsAt && (
              <Typography variant="muted">
                {formatSlotDate(startsAt)} · {formatSlotTime(startsAt)} –{' '}
                {formatSlotTime(endsAt)}
              </Typography>
            )}
            <Typography variant="body">
              {formatPrice(booking.totalAmount, booking.currency)}
            </Typography>
          </Card>
        )}

        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href={`/bookings/${bookingId}`}>View booking</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/notifications">Notifications</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href={`/businesses/${businessSlug}`}>Back to venue</Link>
          </Button>
        </div>
      </Container>
    </Section>
  );
}
