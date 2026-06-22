import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const typographyVariants = cva('', {
  variants: {
    variant: {
      h1: 'text-3xl font-semibold leading-tight tracking-tight sm:text-4xl',
      h2: 'text-2xl font-semibold leading-tight tracking-tight',
      h3: 'text-xl font-semibold leading-snug tracking-tight',
      h4: 'text-lg font-medium leading-snug',
      body: 'text-base leading-relaxed',
      lead: 'text-lg leading-relaxed text-muted-foreground',
      muted: 'text-sm leading-normal text-muted-foreground',
      small: 'text-xs leading-normal text-muted-foreground',
      label: 'text-sm font-medium leading-none',
    },
  },
  defaultVariants: {
    variant: 'body',
  },
});

type TypographyProps = React.HTMLAttributes<HTMLElement> &
  VariantProps<typeof typographyVariants> & {
    as?: React.ElementType;
  };

const defaultElements: Record<
  NonNullable<VariantProps<typeof typographyVariants>['variant']>,
  React.ElementType
> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  body: 'p',
  lead: 'p',
  muted: 'p',
  small: 'span',
  label: 'label',
};

export function Typography({
  className,
  variant = 'body',
  as,
  ...props
}: TypographyProps) {
  const Component = as ?? defaultElements[variant ?? 'body'] ?? 'p';

  return (
    <Component
      className={cn(typographyVariants({ variant, className }))}
      {...props}
    />
  );
}

export { typographyVariants };
