import * as React from 'react';

import { cn } from '@/lib/utils';

type SectionProps = React.ComponentProps<'section'> & {
  spacing?: 'none' | 'sm' | 'default' | 'lg';
};

const spacingClasses = {
  none: 'py-0',
  sm: 'py-8',
  default: 'py-12',
  lg: 'py-16',
} as const;

function Section({ className, spacing = 'default', ...props }: SectionProps) {
  return (
    <section
      data-slot="section"
      className={cn(spacingClasses[spacing], className)}
      {...props}
    />
  );
}

export { Section };
