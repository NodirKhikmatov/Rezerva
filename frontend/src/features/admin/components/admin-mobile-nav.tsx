'use client';

import { AdminSidebarNav } from './admin-sidebar-nav';
import { Sheet, SheetHeader } from '@/shared/components/ui/sheet';

type AdminMobileNavProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AdminMobileNav({ open, onOpenChange }: AdminMobileNavProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} side="left">
      <SheetHeader title="Rezerva Admin" onClose={() => onOpenChange(false)} />
      <AdminSidebarNav
        onNavigate={() => onOpenChange(false)}
        className="px-2 py-4"
      />
    </Sheet>
  );
}
