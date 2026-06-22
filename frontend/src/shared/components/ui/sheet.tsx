'use client';

import { Dialog } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { IconButton } from './icon-button';

type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  side?: 'left' | 'right';
};

function Sheet({ open, onOpenChange, side = 'left', children }: SheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/50" />
        <Dialog.Popup
          className={cn(
            'fixed inset-y-0 z-50 flex w-72 flex-col border-border bg-sidebar shadow-xl outline-none',
            side === 'left' ? 'left-0 border-r' : 'right-0 border-l',
          )}
        >
          {children}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

type SheetHeaderProps = {
  title: string;
  onClose: () => void;
};

function SheetHeader({ title, onClose }: SheetHeaderProps) {
  return (
    <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
      <Dialog.Title className="text-sm font-semibold text-sidebar-foreground">
        {title}
      </Dialog.Title>
      <IconButton icon={X} label="Close menu" onClick={onClose} size="sm" />
    </div>
  );
}

export { Sheet, SheetHeader };
