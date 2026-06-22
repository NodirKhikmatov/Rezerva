import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { AuthProvider } from '@/features/auth/hooks/use-auth';
import { ThemeProvider } from '@/shared/providers/theme-provider';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Rezerva',
  description: 'Multi-vertical booking platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider defaultTheme="system">
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
