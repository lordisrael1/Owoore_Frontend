import * as React from 'react';
import { cn } from '@/lib/cn';

// ── Base Card ─────────────────────────────────────────────────────────────────

interface CardProps {
  children:   React.ReactNode;
  className?: string;
  padding?:   'none' | 'sm' | 'md' | 'lg';
  hover?:     boolean; // subtle hover effect for clickable cards
  onClick?:   () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = 'md',
  hover   = false,
  onClick,
}) => {
  const paddings = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' };

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft',
        paddings[padding],
        hover && 'cursor-pointer transition-all duration-150 hover:shadow-soft-lg hover:-translate-y-px',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {children}
    </div>
  );
};

// ── Card Header ───────────────────────────────────────────────────────────────

interface CardHeaderProps {
  title:      string;
  subtitle?:  string;
  action?:    React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  className,
}) => (
  <div className={cn('flex items-start justify-between mb-4', className)}>
    <div>
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h3>
      {subtitle && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
      )}
    </div>
    {action && <div className="shrink-0 ml-3">{action}</div>}
  </div>
);

// ── Metric Card ───────────────────────────────────────────────────────────────

type MetricColor = 'green' | 'amber' | 'blue' | 'red' | 'gray';

const iconBg: Record<MetricColor, string> = {
  green: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  blue:  'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  red:   'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300',
  gray:  'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

interface MetricCardProps {
  label:     string;
  value:     string | number;
  delta?:    string;
  deltaDir?: 'up' | 'down' | 'warn' | 'neutral';
  icon:      React.ReactNode;
  color?:    MetricColor;
  className?: string;
}

const DeltaArrow: React.FC<{ dir: 'up' | 'down' | 'warn' | 'neutral' }> = ({ dir }) => {
  if (dir === 'warn' || dir === 'neutral') return null;
  return (
    <svg
      className="w-3 h-3"
      viewBox="0 0 12 12"
      fill="currentColor"
      aria-hidden="true"
    >
      {dir === 'up'
        ? <path d="M6 2l4 5H2l4-5z" />
        : <path d="M6 10L2 5h8L6 10z" />}
    </svg>
  );
};

const deltaColor = {
  up:      'text-green-600 dark:text-green-400',
  down:    'text-red-500 dark:text-red-400',
  warn:    'text-amber-600 dark:text-amber-400',
  neutral: 'text-gray-400',
};

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  delta,
  deltaDir = 'neutral',
  icon,
  color    = 'green',
  className,
}) => (
  <Card className={cn('min-w-0', className)}>
    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', iconBg[color])}>
      {icon}
    </div>
    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</p>
    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight tabular-nums">{value}</p>
    {delta && (
      <p className={cn('text-xs flex items-center gap-0.5 mt-1', deltaColor[deltaDir])}>
        <DeltaArrow dir={deltaDir} />
        {delta}
      </p>
    )}
  </Card>
);