import type { BreadcrumbItem } from '@/shared/components/navigation/breadcrumbs';

import {
  ADMIN_NAV_ITEMS,
  ADMIN_ROUTE_LABELS,
} from '../constants/admin-nav.constants';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function formatSegmentLabel(segment: string): string {
  if (UUID_PATTERN.test(segment)) {
    return `${segment.slice(0, 8)}…`;
  }

  return ADMIN_ROUTE_LABELS[segment] ?? segment;
}

export function buildAdminBreadcrumbs(pathname: string): BreadcrumbItem[] {
  if (pathname === '/admin') {
    return [{ label: 'Boshqaruv' }];
  }

  const segments = pathname.split('/').filter(Boolean);
  const crumbs: BreadcrumbItem[] = [];
  let currentPath = '';

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;
    const navMatch = ADMIN_NAV_ITEMS.find((item) => item.href === currentPath);

    crumbs.push({
      label: navMatch?.label ?? formatSegmentLabel(segment),
      href: isLast ? undefined : currentPath,
    });
  });

  return crumbs;
}
