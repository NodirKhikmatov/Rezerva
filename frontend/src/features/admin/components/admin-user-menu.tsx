'use client';

import { ChevronDown, Home, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/shared/theme/theme-toggle';
import { buttonVariants } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';

function getDisplayName(
  firstName: string | null,
  lastName: string | null,
  username: string | null,
): string {
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();

  if (fullName) {
    return fullName;
  }

  if (username) {
    return `@${username}`;
  }

  return 'Admin';
}

function getInitials(
  firstName: string | null,
  lastName: string | null,
  username: string | null,
): string {
  const source = getDisplayName(firstName, lastName, username);
  const parts = source.replace('@', '').split(' ').filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

export function AdminUserMenu() {
  const router = useRouter();
  const { user, clearSession } = useAuth();

  const displayName = getDisplayName(
    user?.firstName ?? null,
    user?.lastName ?? null,
    user?.username ?? null,
  );
  const initials = getInitials(
    user?.firstName ?? null,
    user?.lastName ?? null,
    user?.username ?? null,
  );

  const handleLogout = () => {
    clearSession();
    router.replace('/login');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'sm' }),
          'gap-2 px-2',
        )}
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          {initials}
        </span>
        <span className="hidden max-w-32 truncate md:inline">
          {displayName}
        </span>
        <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/')}>
          <Home className="size-4" aria-hidden />
          Consumer site
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} destructive>
          <LogOut className="size-4" aria-hidden />
          Chiqish
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AdminTopBarActions() {
  return (
    <div className="flex items-center gap-2">
      <ThemeToggle />
      <AdminUserMenu />
    </div>
  );
}
