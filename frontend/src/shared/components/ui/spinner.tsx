import { cn } from '@/lib/utils';

type SpinnerProps = {
  className?: string;
  size?: 'sm' | 'default' | 'lg';
};

const sizeClasses = {
  sm: 'size-3 border',
  default: 'size-4 border-2',
  lg: 'size-6 border-2',
} as const;

export function Spinner({ className, size = 'default' }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        'inline-block animate-spin rounded-full border-current border-t-transparent',
        sizeClasses[size],
        className,
      )}
    />
  );
}
