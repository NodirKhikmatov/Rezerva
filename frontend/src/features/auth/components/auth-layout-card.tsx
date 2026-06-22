import Link from 'next/link';

import { Typography } from '@/shared/components/ui/typography';

type AuthLayoutCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function AuthLayoutCard({
  title,
  description,
  children,
}: AuthLayoutCardProps) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
            R
          </span>
          <Typography variant="h4" as="span">
            Rezerva
          </Typography>
        </Link>
        <div className="space-y-1">
          <Typography variant="h3">{title}</Typography>
          <Typography variant="muted">{description}</Typography>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        {children}
      </div>
    </div>
  );
}
