'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { getAvailability } from '@/features/business/api/business.api';
import type { BusinessDetail } from '@/features/business/types/business.types';
import { createHold } from '@/features/booking/api/booking.api';
import type { AvailabilitySlot } from '@/features/business/types/business.types';
import { useAuth } from '@/features/auth/hooks/use-auth';
import {
  loadBookingDraft,
  saveBookingDraft,
} from '@/features/booking/utils/booking-draft.storage';
import {
  addDays,
  formatPrice,
  formatSlotDate,
  formatSlotTime,
  toDateKey,
} from '@/shared/lib/format';
import { Container } from '@/shared/components/layout/container';
import { Section } from '@/shared/components/layout/section';
import { Button } from '@/shared/components/ui/button';
import { Typography } from '@/shared/components/ui/typography';
import { cn } from '@/lib/utils';

import { BookingStepper } from './booking-stepper';

type SlotSelectStepProps = {
  business: BusinessDetail;
};

export function SlotSelectStep({ business }: SlotSelectStepProps) {
  const router = useRouter();
  const { accessToken } = useAuth();
  const draft = loadBookingDraft(business.slug);
  const [selectedDate, setSelectedDate] = useState(toDateKey(new Date()));
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dates = useMemo(
    () =>
      Array.from({ length: 14 }, (_, index) =>
        toDateKey(addDays(new Date(), index)),
      ),
    [],
  );

  const loadSlots = useCallback(async () => {
    if (!draft?.serviceId) return;
    setLoading(true);
    setError(null);

    try {
      const response = await getAvailability(business.id, {
        serviceId: draft.serviceId,
        from: selectedDate,
        to: selectedDate,
      });
      setSlots(response.slots.filter((slot) => slot.available));
    } catch (slotError) {
      setError(
        slotError instanceof Error ? slotError.message : 'Failed to load slots',
      );
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [business.id, draft?.serviceId, selectedDate]);

  useEffect(() => {
    if (!draft?.serviceId) {
      router.replace(`/book/${business.slug}/service`);
      return;
    }
    void loadSlots();
  }, [draft?.serviceId, business.slug, loadSlots, router]);

  const handleContinue = async () => {
    if (!draft || !selectedSlot || !accessToken) return;

    setSubmitting(true);
    setError(null);

    try {
      const hold = await createHold(accessToken, {
        businessId: business.id,
        serviceId: draft.serviceId,
        resourceId: selectedSlot.resourceId,
        startsAt: selectedSlot.startsAt,
        endsAt: selectedSlot.endsAt,
      });

      saveBookingDraft({
        ...draft,
        resourceId: selectedSlot.resourceId,
        resourceName: selectedSlot.resourceName,
        startsAt: selectedSlot.startsAt,
        endsAt: selectedSlot.endsAt,
        price: selectedSlot.price,
        currency: selectedSlot.currency,
        holdId: hold.holdId,
        holdExpiresAt: hold.expiresAt,
      });

      router.push(`/book/${business.slug}/summary`);
    } catch (holdError) {
      setError(
        holdError instanceof Error
          ? holdError.message
          : 'Could not reserve slot',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!draft) return null;

  return (
    <Section spacing="default">
      <Container className="flex max-w-2xl flex-col gap-8">
        <BookingStepper currentStep={2} />
        <div className="space-y-2">
          <Typography variant="h2">Pick date & time</Typography>
          <Typography variant="muted">
            {draft.serviceName} · {business.name}
          </Typography>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {dates.map((date) => (
            <Button
              key={date}
              type="button"
              variant={selectedDate === date ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSelectedDate(date);
                setSelectedSlot(null);
              }}
            >
              {formatSlotDate(`${date}T12:00:00+05:00`)}
            </Button>
          ))}
        </div>

        {loading && (
          <Typography variant="muted">Loading availability...</Typography>
        )}
        {error && (
          <Typography variant="small" className="text-destructive">
            {error}
          </Typography>
        )}

        {!loading && slots.length === 0 && (
          <Typography variant="muted">
            No available slots for this date.
          </Typography>
        )}

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {slots.map((slot) => {
            const isSelected =
              selectedSlot?.startsAt === slot.startsAt &&
              selectedSlot.resourceId === slot.resourceId;

            return (
              <button
                key={`${slot.startsAt}-${slot.resourceId}`}
                type="button"
                onClick={() => setSelectedSlot(slot)}
                className={cn(
                  'rounded-xl border px-3 py-3 text-left transition-colors',
                  isSelected
                    ? 'border-primary bg-primary/5 ring-2 ring-primary'
                    : 'border-border hover:bg-muted',
                )}
              >
                <Typography variant="label">
                  {formatSlotTime(slot.startsAt)}
                </Typography>
                <Typography variant="small">{slot.resourceName}</Typography>
                <Typography variant="small">
                  {formatPrice(slot.price, slot.currency)}
                </Typography>
              </button>
            );
          })}
        </div>

        <Button
          size="lg"
          disabled={!selectedSlot || submitting}
          loading={submitting}
          onClick={handleContinue}
        >
          Reserve slot
        </Button>
      </Container>
    </Section>
  );
}
