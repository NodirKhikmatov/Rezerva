import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import type { LucideIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { Spinner } from './spinner';

const buttonVariants = cva(
  'group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all duration-200 ease-out outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/40 active:not-aria-[haspopup]:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline:
          'border-border bg-background text-foreground hover:bg-muted dark:border-input dark:bg-background',
        ghost: 'text-foreground hover:bg-muted',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 gap-1.5 px-3 text-xs [&_svg:not([class*="size-"])]:size-3.5',
        default: 'h-10 gap-2 px-4 [&_svg:not([class*="size-"])]:size-4',
        lg: 'h-12 gap-2 px-6 text-base [&_svg:not([class*="size-"])]:size-5',
        icon: 'size-10 [&_svg:not([class*="size-"])]:size-4',
        'icon-sm': 'size-8 [&_svg:not([class*="size-"])]:size-3.5',
        'icon-lg': 'size-12 [&_svg:not([class*="size-"])]:size-5',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      fullWidth: false,
    },
  },
);

type ButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
    leftIcon?: LucideIcon;
    rightIcon?: LucideIcon;
    asChild?: boolean;
  };

function Button({
  className,
  variant = 'default',
  size = 'default',
  fullWidth = false,
  loading = false,
  disabled,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  children,
  asChild = false,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const classes = cn(buttonVariants({ variant, size, fullWidth, className }));

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ className?: string }>;

    return React.cloneElement(child, {
      className: cn(classes, child.props.className),
    });
  }

  return (
    <ButtonPrimitive
      data-slot="button"
      aria-busy={loading || undefined}
      disabled={isDisabled}
      className={classes}
      {...props}
    >
      {loading ? (
        <Spinner size={size === 'sm' ? 'sm' : 'default'} />
      ) : (
        LeftIcon && <LeftIcon aria-hidden />
      )}
      {children}
      {!loading && RightIcon && <RightIcon aria-hidden />}
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants };
