'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { listBusinessServices } from '@/features/business/api/business.api';
import type { BusinessDetail } from '@/features/business/types/business.types';
import {
  loadBookingDraft,
  saveBookingDraft,
} from '@/features/booking/utils/booking-draft.storage';
import { formatPrice } from '@/shared/lib/format';
import { Container } from '@/shared/components/layout/container';
import { Section } from '@/shared/components/layout/section';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Typography } from '@/shared/components/ui/typography';

import { BookingStepper } from './booking-stepper';

type ServiceSelectStepProps = {
  business: BusinessDetail;
};

export function ServiceSelectStep({ business }: ServiceSelectStepProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<
    Awaited<ReturnType<typeof listBusinessServices>>['data']
  >([]);

  useEffect(() => {
    void listBusinessServices(business.id).then((response) => {
      setServices(response.data);
      const draft = loadBookingDraft(business.slug);
      if (draft?.serviceId) setSelectedId(draft.serviceId);
      setLoading(false);
    });
  }, [business.id, business.slug]);

  const handleContinue = () => {
    const service = services.find((item) => item.id === selectedId);
    if (!service) return;

    saveBookingDraft({
      businessId: business.id,
      businessSlug: business.slug,
      businessName: business.name,
      serviceId: service.id,
      serviceName: service.name,
      resourceId: service.resourceIds[0] ?? '',
      resourceName: '',
      startsAt: '',
      endsAt: '',
      price: service.price,
      currency: service.currency,
    });

    router.push(`/book/${business.slug}/slot`);
  };

  return (
    <Section spacing="default">
      <Container className="flex max-w-2xl flex-col gap-8">
        <BookingStepper currentStep={1} />
        <div className="space-y-2">
          <Typography variant="h2">Choose a service</Typography>
          <Typography variant="muted">{business.name}</Typography>
        </div>

        {loading && (
          <Typography variant="muted">Loading services...</Typography>
        )}

        <div className="grid gap-3">
          {services.map((service) => {
            const isSelected = selectedId === service.id;
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => setSelectedId(service.id)}
                className="text-left"
              >
                <Card
                  variant={isSelected ? 'outline' : 'default'}
                  className={isSelected ? 'ring-2 ring-primary' : ''}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <Typography variant="label">{service.name}</Typography>
                      <Typography variant="muted">
                        {service.durationMinutes} min
                      </Typography>
                    </div>
                    <Typography variant="label">
                      {formatPrice(service.price, service.currency)}
                    </Typography>
                  </div>
                </Card>
              </button>
            );
          })}
        </div>

        <Button size="lg" disabled={!selectedId} onClick={handleContinue}>
          Continue
        </Button>
      </Container>
    </Section>
  );
}
