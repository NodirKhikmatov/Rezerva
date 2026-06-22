import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import type { LucideIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

const iconButtonVariants = cva(
  'inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent transition-all duration-200 ease-out outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/40 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-pressed:bg-muted [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        ghost: 'text-foreground hover:bg-muted',
        outline: 'border-border bg-background text-foreground hover:bg-muted',
      },
      size: {
        sm: 'size-8 [&_svg:not([class*="size-"])]:size-3.5',
        default: 'size-10 [&_svg:not([class*="size-"])]:size-4',
        lg: 'size-12 [&_svg:not([class*="size-"])]:size-5',
      },
    },
    defaultVariants: {
      variant: 'ghost',
      size: 'default',
    },
  },
);

type IconButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof iconButtonVariants> & {
    icon: LucideIcon;
    label: string;
    pressed?: boolean;
  };

function IconButton({
  className,
  variant = 'ghost',
  size = 'default',
  icon: Icon,
  label,
  pressed,
  ...props
}: IconButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="icon-button"
      aria-label={label}
      aria-pressed={pressed}
      className={cn(iconButtonVariants({ variant, size, className }))}
      {...props}
    >
      <Icon aria-hidden />
    </ButtonPrimitive>
  );
}

export { IconButton, iconButtonVariants };
