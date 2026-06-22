'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { getUnreadNotificationCount } from '@/features/notification/api/notification.api';
import { Button } from '@/shared/components/ui/button';
import { ThemeToggle } from '@/shared/theme/theme-toggle';
import { cn } from '@/lib/utils';

import { Navbar } from '../navigation/navbar';

export function ConsumerHeader() {
  const { user, isAuthenticated, isLoading, accessToken } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!accessToken) {
      setUnreadCount(0);
      return;
    }

    void getUnreadNotificationCount(accessToken)
      .then((response) => setUnreadCount(response.count))
      .catch(() => setUnreadCount(0));
  }, [accessToken]);

  const displayName =
    user?.firstName ?? user?.username ?? user?.telegramId ?? 'Account';

  return (
    <Navbar
      logo={
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
            R
          </span>
          <span className="text-base font-semibold tracking-tight">
            Rezerva
          </span>
        </Link>
      }
      links={[
        { label: 'Search', href: '/search' },
        { label: 'Bookings', href: '/bookings' },
      ]}
      actions={
        <div className="flex items-center gap-1">
          <ThemeToggle />
          {!isLoading && isAuthenticated && (
            <Link
              href="/notifications"
              aria-label="Notifications"
              className={cn(
                'relative inline-flex size-10 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-muted',
              )}
            >
              <Bell className="size-4" aria-hidden />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          )}
          {!isLoading && isAuthenticated ? (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/account">{displayName}</Link>
            </Button>
          ) : (
            !isLoading && (
              <Button size="sm" asChild>
                <Link href="/login">Log in</Link>
              </Button>
            )
          )}
        </div>
      }
    />
  );
}
