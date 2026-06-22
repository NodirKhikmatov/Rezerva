'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

import { IconButton } from '@/shared/components/ui/icon-button';

import { ADMIN_SIDEBAR_COLLAPSED_KEY } from '../constants/admin-storage.constants';
import { AdminSidebarNav } from './admin-sidebar-nav';

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(ADMIN_SIDEBAR_COLLAPSED_KEY);
    setCollapsed(stored === 'true');
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((value) => {
      const nextValue = !value;
      localStorage.setItem(ADMIN_SIDEBAR_COLLAPSED_KEY, String(nextValue));
      return nextValue;
    });
  };

  return (
    <aside
      data-slot="admin-sidebar"
      data-collapsed={collapsed}
      className={cn(
        'hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 md:flex',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      <div className="flex h-16 items-center justify-between gap-2 border-b border-sidebar-border px-3">
        {!collapsed && (
          <Link href="/admin" className="min-w-0 flex-1 truncate px-1">
            <span className="text-sm font-semibold tracking-tight">
              Rezerva Admin
            </span>
          </Link>
        )}
        <IconButton
          variant="ghost"
          size="sm"
          icon={collapsed ? ChevronRight : ChevronLeft}
          label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={toggleCollapsed}
        />
      </div>

      <AdminSidebarNav collapsed={collapsed} />

      {!collapsed && (
        <div className="border-t border-sidebar-border p-4">
          <p className="text-xs text-muted-foreground">Trust & Operations</p>
        </div>
      )}
    </aside>
  );
}
