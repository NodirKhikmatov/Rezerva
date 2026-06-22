'use client';

import { useEffect, useState } from 'react';
import { Locale, PlatformRole } from '@rezerva/shared-constants';

import { Button } from '@/shared/components/ui/button';
import {
  DialogFooter,
  DialogHeader,
  DialogModal,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

import type {
  AdminUserRecord,
  AdminUserUpdateInput,
} from '../../types/admin-user.types';

const selectClassName =
  'flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30';

type AdminUserEditDialogProps = {
  user: AdminUserRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (userId: string, input: AdminUserUpdateInput) => void;
};

function buildFormState(user: AdminUserRecord | null): AdminUserUpdateInput {
  return {
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    phone: user?.phone ?? '',
    email: user?.email ?? '',
    locale: user?.locale ?? Locale.uz,
    role: user?.role ?? PlatformRole.consumer,
  };
}

export function AdminUserEditDialog({
  user,
  open,
  onOpenChange,
  onSave,
}: AdminUserEditDialogProps) {
  const [form, setForm] = useState<AdminUserUpdateInput>(buildFormState(user));

  useEffect(() => {
    setForm(buildFormState(user));
  }, [user]);

  const updateField = <K extends keyof AdminUserUpdateInput>(
    key: K,
    value: AdminUserUpdateInput[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSave = () => {
    if (!user) {
      return;
    }

    onSave(user.id, form);
    onOpenChange(false);
  };

  return (
    <DialogModal open={open} onOpenChange={onOpenChange}>
      <DialogHeader
        title="Foydalanuvchini tahrirlash"
        description="Profil ma'lumotlarini yangilang."
        onClose={() => onOpenChange(false)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="edit-first-name">Ism</Label>
          <Input
            id="edit-first-name"
            value={form.firstName}
            onChange={(event) => updateField('firstName', event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-last-name">Familiya</Label>
          <Input
            id="edit-last-name"
            value={form.lastName}
            onChange={(event) => updateField('lastName', event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-phone">Telefon</Label>
          <Input
            id="edit-phone"
            value={form.phone}
            onChange={(event) => updateField('phone', event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-email">Email</Label>
          <Input
            id="edit-email"
            type="email"
            value={form.email}
            onChange={(event) => updateField('email', event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-locale">Til</Label>
          <select
            id="edit-locale"
            value={form.locale}
            onChange={(event) =>
              updateField('locale', event.target.value as Locale)
            }
            className={selectClassName}
          >
            <option value={Locale.uz}>UZ</option>
            <option value={Locale.ru}>RU</option>
            <option value={Locale.en}>EN</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-role">Rol</Label>
          <select
            id="edit-role"
            value={form.role}
            onChange={(event) =>
              updateField('role', event.target.value as PlatformRole)
            }
            className={selectClassName}
          >
            <option value={PlatformRole.consumer}>Consumer</option>
            <option value={PlatformRole.admin}>Admin</option>
          </select>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Bekor qilish
        </Button>
        <Button onClick={handleSave}>Saqlash</Button>
      </DialogFooter>
    </DialogModal>
  );
}
