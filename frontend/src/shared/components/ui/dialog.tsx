'use client';

import { Dialog } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { IconButton } from './icon-button';

type DialogModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
};

function DialogModal({
  open,
  onOpenChange,
  children,
  className,
}: DialogModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Popup
          className={cn(
            'fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-background p-6 shadow-xl outline-none',
            className,
          )}
        >
          {children}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

type DialogHeaderProps = {
  title: string;
  description?: string;
  onClose: () => void;
};

function DialogHeader({ title, description, onClose }: DialogHeaderProps) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div className="space-y-1">
        <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
        {description && (
          <Dialog.Description className="text-sm text-muted-foreground">
            {description}
          </Dialog.Description>
        )}
      </div>
      <IconButton icon={X} label="Close dialog" onClick={onClose} size="sm" />
    </div>
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    />
  );
}

export { DialogModal, DialogHeader, DialogFooter };
