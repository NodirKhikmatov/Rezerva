import Link from 'next/link';
import { MapPin, Star } from 'lucide-react';

import type { BusinessSearchItem } from '@/features/search/types/search.types';
import { formatPrice } from '@/shared/lib/format';
import { Card } from '@/shared/components/ui/card';
import { Typography } from '@/shared/components/ui/typography';

type VenueCardProps = {
  business: BusinessSearchItem;
};

export function VenueCard({ business }: VenueCardProps) {
  return (
    <Link href={`/businesses/${business.slug}`}>
      <Card variant="interactive" className="h-full gap-3">
        <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
          {business.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={business.coverImageUrl}
              alt={business.name}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
        </div>
        <div className="space-y-1">
          <Typography variant="label">{business.name}</Typography>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {business.districtName && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" aria-hidden />
                {business.districtName}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Star
                className="size-3.5 fill-warning text-warning"
                aria-hidden
              />
              {business.averageRating.toFixed(1)} ({business.reviewCount})
            </span>
          </div>
          {business.priceFrom !== null && (
            <Typography variant="small">
              From {formatPrice(business.priceFrom, business.currency)}
            </Typography>
          )}
        </div>
      </Card>
    </Link>
  );
}
