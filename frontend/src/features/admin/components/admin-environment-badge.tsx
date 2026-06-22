'use client';

import { Badge } from '@/shared/components/ui/badge';

export function AdminEnvironmentBadge() {
  const isProduction = process.env.NODE_ENV === 'production';

  return (
    <Badge variant={isProduction ? 'success' : 'secondary'}>
      {isProduction ? 'Production' : 'Development'}
    </Badge>
  );
}
