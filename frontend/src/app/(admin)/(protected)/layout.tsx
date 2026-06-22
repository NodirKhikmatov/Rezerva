import { AdminGuard } from '@/features/admin/components/admin-guard';
import { AdminShell } from '@/features/admin/components/admin-shell';
import { QueryProvider } from '@/shared/providers/query-provider';

export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <AdminGuard>
        <AdminShell>{children}</AdminShell>
      </AdminGuard>
    </QueryProvider>
  );
}
