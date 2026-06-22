'use client';

import { ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { cn } from '@/lib/utils';

import { IconButton } from '../ui/icon-button';

export type SidebarNavItem = {
  label: string;
  href: string;
  icon?: LucideIcon;
  active?: boolean;
};

export type SidebarProps = {
  header?: React.ReactNode;
  items: SidebarNavItem[];
  footer?: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
};

function Sidebar({
  header,
  items,
  footer,
  collapsible = true,
  defaultCollapsed = false,
  className,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <aside
      data-slot="sidebar"
      data-collapsed={collapsed}
      className={cn(
        'hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 md:flex',
        collapsed ? 'w-16' : 'w-64',
        className,
      )}
    >
      <div className="flex h-16 items-center justify-between gap-2 border-b border-sidebar-border px-3">
        {!collapsed && header && (
          <div className="min-w-0 flex-1 truncate">{header}</div>
        )}
        {collapsible && (
          <IconButton
            variant="ghost"
            size="sm"
            icon={collapsed ? ChevronRight : ChevronLeft}
            label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => setCollapsed((value) => !value)}
          />
        )}
      </div>

      <nav aria-label="Sidebar navigation" className="flex-1 space-y-1 p-2">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.active ? 'page' : undefined}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                item.active
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                collapsed && 'justify-center px-2',
              )}
            >
              {Icon && <Icon className="size-4 shrink-0" aria-hidden />}
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {footer && !collapsed && (
        <div className="border-t border-sidebar-border p-3">{footer}</div>
      )}
    </aside>
  );
}

export { Sidebar };
