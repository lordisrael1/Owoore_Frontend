'use client';
import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { Avatar } from '@/components/ui/Avatar';
import { getCurrentMember } from '@/lib/auth/guards';

interface MemberNavProps {
  orgName?:   string;
  logoUrl?:   string | null;
}

const ChurchIcon = () => (
  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
    <path d="M8 1.5a.75.75 0 01.75.75V4h1.5a.75.75 0 010 1.5H8.75V8h2.5a.75.75 0 01.75.75V14a.5.5 0 01-.5.5h-7a.5.5 0 01-.5-.5V8.75A.75.75 0 014.75 8h2.5V5.5H5.75a.75.75 0 010-1.5h1.5V2.25A.75.75 0 018 1.5z"/>
  </svg>
);

const navLinks = [
  { href: '/portal',          label: 'Overview',      exact: true },
  { href: '/portal/accounts', label: 'My accounts' },
];

export const MemberNav: React.FC<MemberNavProps> = ({
  orgName = 'Your Church',
  logoUrl,
}) => {
  const pathname = usePathname();
  const member   = getCurrentMember();

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname.startsWith(href);

  const handleLogout = () => {
    localStorage.removeItem('owoore_member_token');
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Brand — min-w-0 so a long church name truncates instead of
              pushing the nav + sign-out past the viewport edge */}
          <Link href="/portal" className="flex items-center gap-2 group min-w-0">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={orgName}
                className="w-7 h-7 rounded-lg object-cover shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-green-700 flex items-center justify-center shrink-0">
                <ChurchIcon />
              </div>
            )}
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {orgName}
            </span>
          </Link>

          {/* Nav links — hidden on mobile, shown on sm+ */}
          <nav className="hidden sm:flex items-center gap-1 shrink-0" aria-label="Member navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                  isActive(link.href, link.exact)
                    ? 'bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800',
                )}
                aria-current={isActive(link.href, link.exact) ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: avatar + sign out */}
          <div className="flex items-center gap-2 shrink-0">
            {member && (
              <span className="hidden sm:block text-xs text-gray-400 dark:text-gray-500 max-w-30 truncate">
                {member.email}
              </span>
            )}
            <button
              onClick={handleLogout}
              className={cn(
                'text-xs text-gray-400 dark:text-gray-500',
                'hover:text-gray-700 dark:hover:text-gray-300 transition-colors',
                'px-2 py-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800',
              )}
              aria-label="Sign out"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Mobile nav — shown below header */}
        <div className="sm:hidden flex gap-1 pb-2 overflow-x-auto no-scrollbar" role="navigation" aria-label="Member navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                isActive(link.href, link.exact)
                  ? 'bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-400'
                  : 'text-gray-500 dark:text-gray-400',
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};