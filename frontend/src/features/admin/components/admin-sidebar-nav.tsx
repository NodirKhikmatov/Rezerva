'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

import { Badge } from '@/shared/components/ui/badge';

import { ADMIN_NAV_ITEMS } from '../constants/admin-nav.constants';
import type { AdminNavItem } from '../types/admin-nav.types';

type AdminNavBadges = Partial<
  Record<NonNullable<AdminNavItem['badgeKey']>, number>
>;

type AdminSidebarNavProps = {
  collapsed?: boolean;
  badges?: AdminNavBadges;
  onNavigate?: () => void;
  className?: string;
};

function isNavItemActive(pathname: string, href: string): boolean {
  if (href === '/admin') {
    return pathname === '/admin';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebarNav({
  collapsed = false,
  badges,
  onNavigate,
  className,
}: AdminSidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin navigation"
      className={cn('flex-1 space-y-1 p-2', className)}
    >
      {ADMIN_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isNavItemActive(pathname, item.href);
        const badgeCount = item.badgeKey ? badges?.[item.badgeKey] : undefined;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            title={collapsed ? item.label : undefined}
            className={cn(
              'relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-primary/10 text-primary'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              collapsed && 'justify-center px-2',
            )}
          >
            {active && (
              <span
                aria-hidden
                className="absolute top-1/2 left-0 h-6 w-0.5 -translate-y-1/2 rounded-full bg-primary"
              />
            )}
            <Icon className="size-4 shrink-0" aria-hidden />
            {!collapsed && (
              <>
                <span className="truncate">{item.label}</span>
                {typeof badgeCount === 'number' && badgeCount > 0 && (
                  <Badge variant="warning" className="ml-auto">
                    {badgeCount}
                  </Badge>
                )}
              </>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
