import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';

const ChurchIcon = () => (
  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
    <path d="M8 1.5a.75.75 0 01.75.75V4h1.5a.75.75 0 010 1.5H8.75V8h2.5a.75.75 0 01.75.75V14a.5.5 0 01-.5.5h-7a.5.5 0 01-.5-.5V8.75A.75.75 0 014.75 8h2.5V5.5H5.75a.75.75 0 010-1.5h1.5V2.25A.75.75 0 018 1.5z"/>
  </svg>
);

const LockIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <rect x="2" y="6" width="8" height="5.5" rx="1"/>
    <path d="M4 6V4.5a2 2 0 014 0V6" strokeLinecap="round"/>
  </svg>
);

const footerLinks = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms',   label: 'Terms' },
  { href: '/docs',    label: 'Documentation' },
  { href: 'mailto:hello@owoore.ng', label: 'Contact' },
];

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className }) => (
  <footer
    className={cn(
      'border-t border-gray-100 dark:border-gray-800',
      'bg-white dark:bg-gray-950',
      className,
    )}
  >
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        {/* Brand + tagline */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-green-700 flex items-center justify-center shrink-0">
            <ChurchIcon />
          </div>
          <div>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Owoore</span>
            <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
              Church treasury infrastructure
            </span>
          </div>
        </div>

        {/* Nomba badge */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 px-2.5 py-1.5 border border-gray-200 dark:border-gray-700 rounded-full">
          <LockIcon />
          Payments powered by Nomba
        </div>

        {/* Links */}
        <nav className="flex items-center gap-5" aria-label="Footer navigation">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom row */}
      <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          © {new Date().getFullYear()} Owoore. All rights reserved.
        </p>
        <p className="text-xs text-gray-300 dark:text-gray-600">
          Built for Nigerian churches
        </p>
      </div>
    </div>
  </footer>
);