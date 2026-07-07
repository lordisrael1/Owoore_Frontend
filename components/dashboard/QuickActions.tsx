import * as React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';

const actions = [
  {
    label:  'New payout',
    href:   '/dashboard/payouts/new',
    icon:   <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 10h14M10 3l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    color:  'text-green-700 dark:text-green-400',
  },
  {
    label:  'Add signatory',
    href:   '/dashboard/signatories',
    icon:   <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="8" cy="7" r="3.5"/><path d="M2 18c0-3.314 2.686-6 6-6M14 13v6M11 16h6" strokeLinecap="round"/></svg>,
    color:  'text-blue-700 dark:text-blue-400',
  },
  {
    label:  'Export CSV',
    href:   '/dashboard/reports',
    icon:   <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M10 3v10M6 9l4 4 4-4" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 16h14" strokeLinecap="round"/></svg>,
    color:  'text-amber-700 dark:text-amber-400',
  },
  {
    label:  'Share join link',
    href:   '/dashboard/settings',
    icon:   <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M10.5 5.5a5 5 0 015 5v2M4.5 10.5a5 5 0 005-5V3M10 10l5-5M10 10l-5 5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    color:  'text-purple-700 dark:text-purple-400',
  },
];

export const QuickActions: React.FC = () => (
  <Card>
    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Quick actions</p>
    <div className="grid grid-cols-2 gap-2">
      {actions.map((a) => (
        <Link
          key={a.href}
          href={a.href}
          className={cn(
            'flex flex-col items-center gap-2 py-4 px-3 rounded-xl text-center',
            'border border-gray-100 dark:border-gray-800',
            'hover:border-gray-200 dark:hover:border-gray-700',
            'hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:-translate-y-px',
            'transition-all duration-150',
            a.color,
          )}
        >
          {a.icon}
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{a.label}</span>
        </Link>
      ))}
    </div>
  </Card>
);