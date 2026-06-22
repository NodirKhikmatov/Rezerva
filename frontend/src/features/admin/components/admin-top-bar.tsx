'use client';

import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { IconButton } from '@/shared/components/ui/icon-button';
import { Breadcrumbs } from '@/shared/components/navigation/breadcrumbs';

import { buildAdminBreadcrumbs } from '../utils/admin-breadcrumbs.utils';
import { AdminEnvironmentBadge } from './admin-environment-badge';
import { AdminMobileNav } from './admin-mobile-nav';
import { AdminTopBarActions } from './admin-user-menu';

export function AdminTopBar() {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const breadcrumbs = buildAdminBreadcrumbs(pathname);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex h-16 items-center gap-4 px-4 md:px-6">
          <IconButton
            className="md:hidden"
            icon={Menu}
            label="Open navigation menu"
            onClick={() => setMobileNavOpen(true)}
          />

          <div className="min-w-0 flex-1">
            <Breadcrumbs items={breadcrumbs} className="hidden sm:block" />
            <p className="truncate text-sm font-medium sm:hidden">
              {breadcrumbs.at(-1)?.label ?? 'Admin'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <AdminEnvironmentBadge />
            <AdminTopBarActions />
          </div>
        </div>
      </header>

      <AdminMobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
    </>
  );
}
