'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import type { BusinessDetail } from '@/features/business/types/business.types';
import { confirmBooking } from '@/features/booking/api/booking.api';
import { useAuth } from '@/features/auth/hooks/use-auth';
import {
  clearBookingDraft,
  loadBookingDraft,
} from '@/features/booking/utils/booking-draft.storage';
import {
  formatPrice,
  formatSlotDate,
  formatSlotTime,
} from '@/shared/lib/format';
import { Container } from '@/shared/components/layout/container';
import { Section } from '@/shared/components/layout/section';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Textarea } from '@/shared/components/ui/textarea';
import { Typography } from '@/shared/components/ui/typography';

import { BookingStepper } from './booking-stepper';
import { HoldCountdown } from './hold-countdown';

type BookingSummaryStepProps = {
  business: BusinessDetail;
};

export function BookingSummaryStep({ business }: BookingSummaryStepProps) {
  const router = useRouter();
  const { accessToken } = useAuth();
  const draft = loadBookingDraft(business.slug);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!draft?.holdId) {
    router.replace(`/book/${business.slug}/slot`);
    return null;
  }

  const handleConfirm = async () => {
    if (!accessToken || !draft.holdId) return;

    setLoading(true);
    setError(null);

    try {
      const booking = await confirmBooking(accessToken, {
        holdId: draft.holdId,
        paymentMethod: 'pay_at_venue',
        notes: notes.trim() || undefined,
      });

      clearBookingDraft(business.slug);
      router.push(
        `/book/${business.slug}/success?bookingId=${booking.id}&reference=${booking.referenceCode}`,
      );
    } catch (confirmError) {
      setError(
        confirmError instanceof Error
          ? confirmError.message
          : 'Confirmation failed',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section spacing="default">
      <Container className="flex max-w-2xl flex-col gap-8">
        <BookingStepper currentStep={3} />
        <div className="space-y-2">
          <Typography variant="h2">Confirm booking</Typography>
          <Typography variant="muted">
            Review details before confirming.
          </Typography>
        </div>

        {draft.holdExpiresAt && (
          <HoldCountdown
            expiresAt={draft.holdExpiresAt}
            onExpired={() => router.replace(`/book/${business.slug}/slot`)}
          />
        )}

        <Card className="space-y-4">
          <div>
            <Typography variant="label">{business.name}</Typography>
            <Typography variant="muted">{draft.serviceName}</Typography>
          </div>
          <div>
            <Typography variant="muted">Date</Typography>
            <Typography variant="body">
              {formatSlotDate(draft.startsAt)}
            </Typography>
          </div>
          <div>
            <Typography variant="muted">Time</Typography>
            <Typography variant="body">
              {formatSlotTime(draft.startsAt)} – {formatSlotTime(draft.endsAt)}
            </Typography>
          </div>
          <div>
            <Typography variant="muted">Resource</Typography>
            <Typography variant="body">{draft.resourceName}</Typography>
          </div>
          <div>
            <Typography variant="muted">Total</Typography>
            <Typography variant="h4">
              {formatPrice(draft.price, draft.currency)}
            </Typography>
          </div>
        </Card>

        <div className="space-y-2">
          <Typography variant="label">Notes (optional)</Typography>
          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Any special requests..."
          />
        </div>

        {error && (
          <Typography variant="small" className="text-destructive">
            {error}
          </Typography>
        )}

        <Button size="lg" fullWidth loading={loading} onClick={handleConfirm}>
          Confirm booking
        </Button>
      </Container>
    </Section>
  );
}
