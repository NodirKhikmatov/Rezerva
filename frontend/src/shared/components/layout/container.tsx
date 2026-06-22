import * as React from 'react';

import { cn } from '@/lib/utils';

type ContainerProps = React.ComponentProps<'div'> & {
  size?: 'default' | 'narrow' | 'wide' | 'full';
};

const sizeClasses = {
  default: 'max-w-6xl',
  narrow: 'max-w-3xl',
  wide: 'max-w-7xl',
  full: 'max-w-none',
} as const;

function Container({ className, size = 'default', ...props }: ContainerProps) {
  return (
    <div
      data-slot="container"
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}

export { Container };
