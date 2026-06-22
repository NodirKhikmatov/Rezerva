import Link from 'next/link';

import { Container } from '@/shared/components/layout/container';
import { Section } from '@/shared/components/layout/section';
import { Button } from '@/shared/components/ui/button';
import { Typography } from '@/shared/components/ui/typography';

type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <Section spacing="lg">
      <Container
        size="narrow"
        className="flex flex-col items-center gap-4 text-center"
      >
        <Typography variant="h2">{title}</Typography>
        <Typography variant="muted">{description}</Typography>
        <Button asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </Container>
    </Section>
  );
}
