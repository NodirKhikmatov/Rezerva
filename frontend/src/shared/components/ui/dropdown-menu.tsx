'use client';

import { Menu } from '@base-ui/react/menu';
import * as React from 'react';

import { cn } from '@/lib/utils';

function DropdownMenu({ children }: { children: React.ReactNode }) {
  return <Menu.Root>{children}</Menu.Root>;
}

type DropdownMenuTriggerProps = {
  children: React.ReactNode;
  className?: string;
};

function DropdownMenuTrigger({
  children,
  className,
}: DropdownMenuTriggerProps) {
  return <Menu.Trigger className={className}>{children}</Menu.Trigger>;
}

type DropdownMenuContentProps = {
  children: React.ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'bottom';
};

function DropdownMenuContent({
  children,
  className,
  align = 'end',
  side = 'bottom',
}: DropdownMenuContentProps) {
  return (
    <Menu.Portal>
      <Menu.Positioner align={align} side={side} sideOffset={8}>
        <Menu.Popup
          className={cn(
            'z-50 min-w-48 overflow-hidden rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lg outline-none',
            className,
          )}
        >
          {children}
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  );
}

type DropdownMenuItemProps = {
  children: React.ReactNode;
  className?: string;
  destructive?: boolean;
  onClick?: () => void;
};

function DropdownMenuItem({
  children,
  className,
  destructive = false,
  onClick,
}: DropdownMenuItemProps) {
  return (
    <Menu.Item
      onClick={onClick}
      className={cn(
        'flex cursor-default items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none select-none data-highlighted:bg-muted',
        destructive && 'text-destructive data-highlighted:bg-destructive/10',
        className,
      )}
    >
      {children}
    </Menu.Item>
  );
}

function DropdownMenuSeparator({ className }: { className?: string }) {
  return (
    <div className={cn('my-1 h-px bg-border', className)} role="separator" />
  );
}

function DropdownMenuLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('px-3 py-2 text-xs text-muted-foreground', className)}>
      {children}
    </div>
  );
}

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
};
