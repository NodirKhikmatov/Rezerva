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

type BookingDetailContentProps = {
  bookingId: string;
};

export function BookingDetailContent({ bookingId }: BookingDetailContentProps) {
  const { accessToken } = useAuth();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    void getBookingDetail(accessToken, bookingId)
      .then(setBooking)
      .catch((detailError) =>
        setError(
          detailError instanceof Error ? detailError.message : 'Not found',
        ),
      );
  }, [accessToken, bookingId]);

  if (error) {
    return (
      <Container className="py-12">
        <Typography variant="muted">{error}</Typography>
      </Container>
    );
  }

  if (!booking) {
    return (
      <Container className="py-12">
        <Typography variant="muted">Loading...</Typography>
      </Container>
    );
  }

  const startsAt = booking.startsAt ?? booking.allocations?.[0]?.startsAt;
  const endsAt = booking.endsAt ?? booking.allocations?.[0]?.endsAt;

  return (
    <Section spacing="default">
      <Container className="flex max-w-2xl flex-col gap-6">
        <div className="space-y-1">
          <Typography variant="h1">Booking {booking.referenceCode}</Typography>
          <Typography variant="muted" className="capitalize">
            {booking.status.replace('_', ' ')}
          </Typography>
        </div>

        <Card className="space-y-4">
          <Typography variant="label">
            {booking.business?.name ?? booking.businessName}
          </Typography>
          {booking.venue && (
            <Typography variant="muted">{booking.venue.addressLine}</Typography>
          )}
          {startsAt && endsAt && (
            <Typography variant="body">
              {formatSlotDate(startsAt)} · {formatSlotTime(startsAt)} –{' '}
              {formatSlotTime(endsAt)}
            </Typography>
          )}
          <Typography variant="h4">
            {formatPrice(booking.totalAmount, booking.currency)}
          </Typography>
        </Card>

        <Button variant="outline" asChild>
          <Link href="/bookings">Back to bookings</Link>
        </Button>
      </Container>
    </Section>
  );
}
