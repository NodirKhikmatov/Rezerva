'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { listMyBookings } from '@/features/booking/api/booking.api';
import type { BookingSummary } from '@/features/booking/types/booking.types';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { AuthGuard } from '@/features/auth/components/auth-guard';
import {
  formatPrice,
  formatSlotDate,
  formatSlotTime,
} from '@/shared/lib/format';
import { Container } from '@/shared/components/layout/container';
import { Section } from '@/shared/components/layout/section';
import { Card } from '@/shared/components/ui/card';
import { Typography } from '@/shared/components/ui/typography';

function BookingsListContent() {
  const { accessToken } = useAuth();
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    void listMyBookings(accessToken, { status: 'upcoming', limit: 20 }).then(
      (response) => {
        setBookings(response.data);
        setLoading(false);
      },
    );
  }, [accessToken]);

  return (
    <Section spacing="default">
      <Container className="flex max-w-3xl flex-col gap-6">
        <Typography variant="h1">My bookings</Typography>

        {loading && <Typography variant="muted">Loading...</Typography>}

        {!loading && bookings.length === 0 && (
          <Typography variant="muted">No upcoming bookings.</Typography>
        )}

        <div className="grid gap-3">
          {bookings.map((booking) => (
            <Link key={booking.id} href={`/bookings/${booking.id}`}>
              <Card variant="interactive">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <Typography variant="label">
                      {booking.businessName}
                    </Typography>
                    <Typography variant="muted">{booking.venueName}</Typography>
                    <Typography variant="small">
                      {formatSlotDate(booking.startsAt)} ·{' '}
                      {formatSlotTime(booking.startsAt)}
                    </Typography>
                  </div>
                  <div className="text-right">
                    <Typography variant="small" className="capitalize">
                      {booking.status.replace('_', ' ')}
                    </Typography>
                    <Typography variant="label">
                      {formatPrice(booking.totalAmount, booking.currency)}
                    </Typography>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function BookingsPageContent() {
  return (
    <AuthGuard returnPath="/bookings">
      <BookingsListContent />
    </AuthGuard>
  );
}
