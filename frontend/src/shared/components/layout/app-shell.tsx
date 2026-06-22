import * as React from 'react';

import { cn } from '@/lib/utils';

type AppShellProps = {
  navbar?: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  mainClassName?: string;
};

function AppShell({
  navbar,
  sidebar,
  footer,
  children,
  className,
  mainClassName,
}: AppShellProps) {
  return (
    <div
      data-slot="app-shell"
      className={cn('flex min-h-screen flex-col bg-background', className)}
    >
      {navbar}
      <div className="flex flex-1">
        {sidebar}
        <main className={cn('flex-1', mainClassName)}>{children}</main>
      </div>
      {footer}
    </div>
  );
}

export { AppShell };
