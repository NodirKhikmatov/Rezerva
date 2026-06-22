'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

export type NavbarLink = {
  label: string;
  href: string;
};

export type NavbarProps = {
  logo: React.ReactNode;
  links?: NavbarLink[];
  center?: React.ReactNode;
  actions?: React.ReactNode;
  variant?: 'solid' | 'transparent';
  sticky?: boolean;
  className?: string;
};

function Navbar({
  logo,
  links = [],
  center,
  actions,
  variant = 'solid',
  sticky = true,
  className,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isSolid = variant === 'solid' || scrolled;

  return (
    <header
      data-slot="navbar"
      className={cn(
        'z-50 w-full border-b transition-all duration-200',
        sticky && 'sticky top-0',
        isSolid
          ? 'border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80'
          : 'border-transparent bg-transparent',
        className,
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex shrink-0 items-center">{logo}</div>

        {center && (
          <div className="hidden flex-1 justify-center md:flex">{center}</div>
        )}

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-1 md:flex"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">{actions}</div>
      </div>
    </header>
  );
}

export { Navbar };
