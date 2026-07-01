'use client';
import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';

const ChurchIcon = () => (
  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
    <path d="M8 1.5a.75.75 0 01.75.75V4h1.5a.75.75 0 010 1.5H8.75V8h2.5a.75.75 0 01.75.75V14a.5.5 0 01-.5.5h-7a.5.5 0 01-.5-.5V8.75A.75.75 0 014.75 8h2.5V5.5H5.75a.75.75 0 010-1.5h1.5V2.25A.75.75 0 018 1.5z"/>
  </svg>
);

const ArrowIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M2 6h8M6 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const navLinks = [
  { href: '#product',    label: 'Product' },
  { href: '#how',        label: 'How it works' },
  { href: '#for-churches', label: 'For churches' },
  { href: '/docs',       label: 'Developers' },
];

export const LandingNav: React.FC = () => {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-shadow duration-200',
        'bg-white dark:bg-gray-950',
        scrolled && 'shadow-[0_1px_0_0_rgba(0,0,0,.06)] dark:shadow-[0_1px_0_0_rgba(255,255,255,.06)]',
        'border-b border-gray-100 dark:border-gray-800/60',
      )}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group" aria-label="Owoore home">
            <div className="w-7 h-7 rounded-lg bg-green-700 flex items-center justify-center shrink-0 group-hover:bg-green-800 transition-colors">
              <ChurchIcon />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Owoore</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm text-gray-500 dark:text-gray-400',
                  'hover:text-gray-900 dark:hover:text-gray-100',
                  'hover:bg-gray-50 dark:hover:bg-gray-800',
                  'transition-colors duration-100',
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2.5">
            <Link
              href="/login"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors px-2"
            >
              Sign in
            </Link>
            <Link href="/register">
              <Button size="sm" iconRight={<ArrowIcon />}>
                Get started free
              </Button>
            </Link>
          </div>

          {/* Mobile: hamburger */}
          <button
            className="md:hidden p-1.5 rounded-md text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              {mobileOpen
                ? <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round"/>
                : <path d="M3 6h14M3 10h14M3 14h14" strokeLinecap="round"/>}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <nav
            className="md:hidden pb-4 border-t border-gray-100 dark:border-gray-800 mt-1 pt-3"
            aria-label="Mobile navigation"
          >
            <div className="flex flex-col gap-1 mb-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
              <Link href="/login" className="w-full">
                <Button variant="outline" fullWidth size="sm">Sign in</Button>
              </Link>
              <Link href="/register" className="w-full">
                <Button fullWidth size="sm" iconRight={<ArrowIcon />}>Get started free</Button>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};