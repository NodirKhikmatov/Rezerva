'use client';

import Link from 'next/link';
import { Calendar, Home, Search, User } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

const tabs = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Search', href: '/search', icon: Search },
  { label: 'Bookings', href: '/bookings', icon: Calendar },
  { label: 'Account', href: '/account', icon: User },
] as const;

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-4">
        {tabs.map((tab) => {
          const isActive =
            tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-2 py-3 text-xs font-medium transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="size-5" aria-hidden />
                <span>{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
