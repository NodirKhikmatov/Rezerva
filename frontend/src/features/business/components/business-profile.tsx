'use client';

import Link from 'next/link';
import { MapPin, Star } from 'lucide-react';

import type { BusinessDetail } from '@/features/business/types/business.types';
import { formatPrice } from '@/shared/lib/format';
import { Container } from '@/shared/components/layout/container';
import { Section } from '@/shared/components/layout/section';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Typography } from '@/shared/components/ui/typography';

type BusinessProfileProps = {
  business: BusinessDetail;
};

export function BusinessProfile({ business }: BusinessProfileProps) {
  const primaryVenue = business.venues[0];

  return (
    <>
      <Section spacing="default" className="pt-6">
        <Container className="flex flex-col gap-6">
          <div className="aspect-[21/9] overflow-hidden rounded-2xl bg-muted">
            {business.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={business.coverImageUrl}
                alt={business.name}
                className="size-full object-cover"
              />
            ) : null}
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <Typography variant="h1">{business.name}</Typography>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1 capitalize">
                  {business.category}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Star className="size-4 fill-warning text-warning" />
                  {business.averageRating.toFixed(1)} ({business.reviewCount})
                </span>
                {primaryVenue && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-4" />
                    {primaryVenue.address}
                  </span>
                )}
              </div>
              {business.description && (
                <Typography variant="lead">{business.description}</Typography>
              )}
              <Typography variant="muted">
                {business.workingHoursSummary}
              </Typography>
            </div>
            <Button size="lg" asChild>
              <Link href={`/book/${business.slug}/service`}>Book now</Link>
            </Button>
          </div>
        </Container>
      </Section>

      <Section spacing="default">
        <Container className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <Typography variant="h3">Services</Typography>
            <div className="grid gap-3">
              {business.servicesSummary.map((service) => (
                <Card key={service.id} padding="default">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <Typography variant="label">{service.name}</Typography>
                      <Typography variant="muted">
                        {service.durationMinutes} min
                      </Typography>
                    </div>
                    <Typography variant="label">
                      {formatPrice(service.priceFrom)}
                    </Typography>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Typography variant="h3">Venues</Typography>
            <div className="grid gap-3">
              {business.venues.map((venue) => (
                <Card key={venue.id} padding="default">
                  <Typography variant="label">{venue.name}</Typography>
                  <Typography variant="muted">{venue.address}</Typography>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
