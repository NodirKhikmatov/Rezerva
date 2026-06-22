import { ShieldOff } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/shared/components/ui/button';
import { Typography } from '@/shared/components/ui/typography';

export default function AdminForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted">
          <ShieldOff className="size-8 text-muted-foreground" aria-hidden />
        </div>
        <div className="space-y-2">
          <Typography variant="h1">Kirish taqiqlangan</Typography>
          <Typography variant="muted">
            Ushbu bo&apos;lim faqat platforma administratorlari uchun.
          </Typography>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/">Bosh sahifaga qaytish</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/login?returnUrl=%2Fadmin">
              Boshqa hisob bilan kirish
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
