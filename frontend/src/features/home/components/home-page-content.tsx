import { Container } from '@/shared/components/layout/container';
import { Section } from '@/shared/components/layout/section';
import { Typography } from '@/shared/components/ui/typography';

import { CategoryGrid } from './category-grid';
import { HomeHero } from './home-hero';

export function HomePageContent() {
  return (
    <>
      <HomeHero />
      <Section spacing="default">
        <Container className="flex flex-col gap-6">
          <div className="space-y-1">
            <Typography variant="h2">Browse by category</Typography>
            <Typography variant="muted">
              Placeholder grid for M0 — listings arrive in M2.
            </Typography>
          </div>
          <CategoryGrid />
        </Container>
      </Section>
    </>
  );
}
