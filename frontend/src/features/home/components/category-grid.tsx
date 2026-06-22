import {
  Building2,
  Dumbbell,
  Hotel,
  Scissors,
  Stethoscope,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';

import { BusinessCategory } from '@rezerva/shared-constants';

import { Card } from '@/shared/components/ui/card';
import { Typography } from '@/shared/components/ui/typography';

type CategoryItem = {
  id: (typeof BusinessCategory)[keyof typeof BusinessCategory];
  label: string;
  icon: LucideIcon;
};

const categories: CategoryItem[] = [
  { id: BusinessCategory.football, label: 'Football', icon: Dumbbell },
  { id: BusinessCategory.salon, label: 'Beauty & Salon', icon: Scissors },
  {
    id: BusinessCategory.restaurant,
    label: 'Restaurants',
    icon: UtensilsCrossed,
  },
  { id: BusinessCategory.clinic, label: 'Clinics', icon: Stethoscope },
  { id: BusinessCategory.coworking, label: 'Coworking', icon: Building2 },
  { id: BusinessCategory.hotel, label: 'Hotels', icon: Hotel },
];

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {categories.map((category) => {
        const Icon = category.icon;

        return (
          <Link key={category.id} href={`/search?category=${category.id}`}>
            <Card
              variant="interactive"
              padding="lg"
              className="h-full items-center text-center"
            >
              <span className="mb-3 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-6" aria-hidden />
              </span>
              <Typography variant="label">{category.label}</Typography>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
