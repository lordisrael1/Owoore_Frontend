import * as React from 'react';
import { cn } from '@/lib/cn';

interface EmptyStateProps {
  title:    string;
  message?: string;
  icon?:    React.ReactNode;
  action?:  React.ReactNode;
  compact?: boolean;
  className?: string;
}

const DefaultIcon = () => (
  <svg
    className="w-10 h-10 text-gray-300 dark:text-gray-600"
    viewBox="0 0 40 40"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
  >
    <rect x="6" y="10" width="28" height="22" rx="3" />
    <path d="M12 17h16M12 22h10" strokeLinecap="round" />
    <circle cx="28" cy="28" r="7" fill="white" className="dark:fill-gray-900" />
    <path d="M25.5 28h5M28 25.5v5" strokeLinecap="round" />
  </svg>
);

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon,
  action,
  compact   = false,
  className,
}) => (
  <div
    className={cn(
      'flex flex-col items-center text-center',
      compact ? 'py-4 gap-1.5' : 'py-12 gap-3',
      className,
    )}
  >
    {!compact && (
      <div className="mb-1">
        {icon ?? <DefaultIcon />}
      </div>
    )}
    <p className={cn(
      'font-medium text-gray-600 dark:text-gray-400',
      compact ? 'text-xs' : 'text-sm',
    )}>
      {title}
    </p>
    {message && (
      <p className={cn(
        'text-gray-400 dark:text-gray-500 max-w-xs leading-relaxed',
        compact ? 'text-xs' : 'text-sm',
      )}>
        {message}
      </p>
    )}
    {action && <div className="mt-1">{action}</div>}
  </div>
);