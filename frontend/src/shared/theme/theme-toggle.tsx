'use client';

import { Moon, Sun } from 'lucide-react';

import { useTheme } from '@/shared/providers/theme-provider';

import { IconButton } from '../components/ui/icon-button';

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();

  const isDark = resolvedTheme === 'dark';

  return (
    <IconButton
      className={className}
      variant="ghost"
      icon={isDark ? Sun : Moon}
      label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    />
  );
}
