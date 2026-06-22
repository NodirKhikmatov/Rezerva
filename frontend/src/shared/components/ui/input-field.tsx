import * as React from 'react';

import { cn } from '@/lib/utils';

import { Input } from './input';
import { Label } from './label';
import { Typography } from './typography';

type InputFieldProps = Omit<
  React.ComponentProps<typeof Input>,
  'id' | 'aria-describedby' | 'aria-invalid'
> & {
  id: string;
  label?: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
};

function InputField({
  id,
  label,
  hint,
  error,
  containerClassName,
  className,
  ...props
}: InputFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex flex-col gap-2', containerClassName)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <Input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={className}
        {...props}
      />
      {hint && !error && (
        <Typography id={hintId} variant="small">
          {hint}
        </Typography>
      )}
      {error && (
        <Typography
          id={errorId}
          variant="small"
          className="text-destructive"
          role="alert"
        >
          {error}
        </Typography>
      )}
    </div>
  );
}

export { InputField };
