'use client';
import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';

const Logo: React.FC = () => (
  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
    <path d="M8 1.5a.75.75 0 01.75.75V4h1.5a.75.75 0 010 1.5H8.75V8h2.5a.75.75 0 01.75.75V14a.5.5 0 01-.5.5h-7a.5.5 0 01-.5-.5V8.75A.75.75 0 014.75 8h2.5V5.5H5.75a.75.75 0 010-1.5h1.5V2.25A.75.75 0 018 1.5z"/>
  </svg>
);

const ArrowIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M2 6h8M6 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const navLinks = [
  { href: '#product',      label: 'Product' },
  { href: '#how',          label: 'How it works' },
  { href: '#for-churches', label: 'For churches' },
  { href: '#faq',          label: 'FAQ' },
];

export const LandingNav: React.FC = () => {
  const [scrolled,    setScrolled]    = React.useState(false);
  const [mobileOpen,  setMobileOpen]  = React.useState(false);
  const [activeSection, setActiveSection] = React.useState('');

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Highlight active nav section via IntersectionObserver
  React.useEffect(() => {
    const ids = ['product', 'how', 'for-churches', 'faq'];
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(`#${e.target.id}`);
        });
      },
      { rootMargin: '-40% 0px -50% 0px' },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled
          ? 'nav-glass shadow-sm border-b border-gray-200/60 dark:border-gray-700/50'
          : 'bg-transparent border-b border-transparent',
      )}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group animate-fade-down"
            style={{ animationDelay: '0ms' }}
            aria-label="Owoore home"
          >
            <div className="w-7 h-7 rounded-lg bg-green-700 flex items-center justify-center shrink-0 group-hover:bg-green-800 group-hover:scale-105 transition-all duration-150">
              <Logo />
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
              Owoore
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5 animate-fade-down delay-100" aria-label="Main navigation">
            {navLinks.map((link) => (
              // Plain <a> — same-page anchors must not go through the Next
              // router, or the client-side transition re-renders the page and
              // resets the scroll-reveal state (sections stay invisible).
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  'relative px-3 py-1.5 rounded-lg text-sm transition-colors duration-150',
                  activeSection === link.href
                    ? 'text-gray-900 dark:text-gray-100 bg-gray-100/80 dark:bg-gray-800/80'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/60',
                )}
              >
                {link.label}
                {activeSection === link.href && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-green-600" />
                )}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2.5 animate-fade-down delay-200">
            <Link
              href="/login"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors px-2 py-1"
            >
              Sign in
            </Link>
            <Link href="/register">
              <Button size="sm" iconRight={<ArrowIcon />} className="shadow-sm">
                Get started free
              </Button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
            className="md:hidden pb-5 border-t border-gray-100 dark:border-gray-800 mt-1 pt-3 animate-fade-down"
            aria-label="Mobile navigation"
          >
            <div className="flex flex-col gap-0.5 mb-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'px-3 py-2.5 rounded-lg text-sm',
                    activeSection === link.href
                      ? 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/40 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800',
                  )}
                >
                  {link.label}
                </a>
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
