import Link from 'next/link';

import { cn } from '@/lib/utils';

import { Container } from '../layout/container';
import { Typography } from '../ui/typography';

export type FooterLink = {
  label: string;
  href: string;
};

export type FooterColumn = {
  title: string;
  links: FooterLink[];
};

export type FooterProps = {
  logo?: React.ReactNode;
  description?: string;
  columns?: FooterColumn[];
  bottom?: React.ReactNode;
  className?: string;
};

function Footer({
  logo,
  description,
  columns = [],
  bottom,
  className,
}: FooterProps) {
  return (
    <footer
      data-slot="footer"
      className={cn('border-t border-border bg-muted/30', className)}
    >
      <Container className="py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4 lg:col-span-1">
            {logo}
            {description && (
              <Typography variant="muted">{description}</Typography>
            )}
          </div>

          {columns.map((column) => (
            <div key={column.title} className="space-y-3">
              <Typography variant="label">{column.title}</Typography>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {bottom && (
          <div className="mt-8 border-t border-border pt-6">{bottom}</div>
        )}
      </Container>
    </footer>
  );
}

export { Footer };
