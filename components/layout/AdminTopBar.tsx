'use client';
import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import { useUiStore } from '@/store/uiStore';
import { formatPeriod, currentPeriod, recentPeriods } from '@/lib/format';

interface AdminTopbarProps {
  title?:         string;
  subtitle?:      string;
  period?:        string;
  onPeriodChange?: (period: string) => void;
  notifCount?:    number;
  showNewPayout?: boolean;
  className?:     string;
}

const BellIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M8 2a4 4 0 014 4v2.5l1.25 1.5H2.75L4 8.5V6a4 4 0 014-4zM6.5 12.5a1.5 1.5 0 003 0" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PlusIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M7 2v10M2 7h10" strokeLinecap="round"/>
  </svg>
);

const MenuIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M3 5h14M3 10h14M3 15h14" strokeLinecap="round"/>
  </svg>
);

const ChevronIcon = () => (
  <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 12 12" aria-hidden="true">
    <path d="M3.22 4.72a.75.75 0 011.06 0L6 6.44l1.72-1.72a.75.75 0 111.06 1.06L6.53 8.03a.75.75 0 01-1.06 0L3.22 5.78a.75.75 0 010-1.06z"/>
  </svg>
);


export const AdminTopbar: React.FC<AdminTopbarProps> = ({
  title          = 'Dashboard',
  subtitle,
  period,
  onPeriodChange,
  notifCount     = 0,
  showNewPayout  = true,
  className,
}) => {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const [periodOpen, setPeriodOpen] = React.useState(false);
  const activePeriod = period ?? currentPeriod();
  const periods      = React.useMemo(() => recentPeriods(6), []);
  const periodRef    = React.useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (periodRef.current && !periodRef.current.contains(e.target as Node)) {
        setPeriodOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header
      className={cn(
        'flex items-center justify-between gap-2 px-4 sm:px-6 py-3.5',
        'bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800',
        'sticky top-0 z-20',
        className,
      )}
    >
      {/* Left: sidebar toggle (mobile/tablet) + title */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={toggleSidebar}
          className={cn(
            'lg:hidden shrink-0 -ml-2 w-10 h-10 flex items-center justify-center rounded-lg',
            'text-gray-600 dark:text-gray-300',
            'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-green-700',
          )}
          aria-label="Open navigation menu"
        >
          <MenuIcon />
        </button>
        <div className="min-w-0">
          <h1 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{title}</h1>
          {subtitle && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Period picker */}
        {onPeriodChange && (
          <div className="relative" ref={periodRef}>
            <button
              onClick={() => setPeriodOpen((o) => !o)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs',
                'border border-gray-200 dark:border-gray-700',
                'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400',
                'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-green-700',
              )}
              aria-expanded={periodOpen}
              aria-haspopup="listbox"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <rect x="2" y="3" width="10" height="9" rx="1.5"/>
                <path d="M5 2v2M9 2v2M2 6h10" strokeLinecap="round"/>
              </svg>
              {formatPeriod(activePeriod)}
              <ChevronIcon />
            </button>

            {periodOpen && (
              <div
                className={cn(
                  'absolute right-0 top-full mt-1 w-44 z-30 rounded-lg shadow-lg',
                  'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800',
                  'overflow-hidden',
                )}
                role="listbox"
                aria-label="Select period"
              >
                {periods.map((p) => (
                  <button
                    key={p.value}
                    role="option"
                    aria-selected={p.value === activePeriod}
                    onClick={() => {
                      onPeriodChange(p.value);
                      setPeriodOpen(false);
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2.5 text-xs',
                      p.value === activePeriod
                        ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notification bell */}
        <div className="relative">
          <button
            className={cn(
              'w-8 h-8 flex items-center justify-center rounded-lg',
              'border border-gray-200 dark:border-gray-700',
              'text-gray-500 dark:text-gray-400',
              'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-green-700',
            )}
            aria-label={`Notifications${notifCount > 0 ? ` (${notifCount} unread)` : ''}`}
          >
            <BellIcon />
          </button>
          {notifCount > 0 && (
            <span
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center"
              aria-hidden="true"
            >
              {notifCount > 9 ? '9+' : notifCount}
            </span>
          )}
        </div>

        {/* New payout CTA — icon-only below sm to keep the bar on one line */}
        {showNewPayout && (
          <Link href="/dashboard/payouts/new" aria-label="New payout">
            <Button size="sm" variant="primary" icon={<PlusIcon />}>
              <span className="hidden sm:inline">New payout</span>
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
};