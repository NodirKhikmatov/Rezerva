import { Container } from '@/shared/components/layout/container';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col justify-center py-12">
      <Container size="narrow">{children}</Container>
    </div>
  );
}
