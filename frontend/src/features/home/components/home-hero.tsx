import Link from 'next/link';

import { Button } from '@/shared/components/ui/button';
import { Container } from '@/shared/components/layout/container';
import { Section } from '@/shared/components/layout/section';
import { Typography } from '@/shared/components/ui/typography';

export function HomeHero() {
  return (
    <Section spacing="lg" className="pt-8 md:pt-12">
      <Container className="flex flex-col items-center gap-6 text-center">
        <Typography variant="h1" className="max-w-3xl">
          Book anything, anywhere in Uzbekistan
        </Typography>
        <Typography variant="lead" className="max-w-2xl">
          Football pitches, salons, restaurants, clinics, and hotels — discover
          and reserve in seconds.
        </Typography>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/search">Explore venues</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </Container>
    </Section>
  );
}
