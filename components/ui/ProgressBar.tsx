'use client';
import * as React from 'react';
import { cn } from '@/lib/cn';

interface ProgressBarProps {
  value:       number;   // 0–100
  max?:        number;
  label?:      string;
  sublabel?:   string;   // e.g. "₦4.2M / ₦5M"
  color?:      'green' | 'blue' | 'amber' | 'red';
  size?:       'xs' | 'sm' | 'md';
  showPercent?: boolean;
  animate?:    boolean;
  className?:  string;
}

const trackColors = {
  green: 'bg-green-500',
  blue:  'bg-blue-500',
  amber: 'bg-amber-400',
  red:   'bg-red-500',
};

const heights = { xs: 'h-1', sm: 'h-1.5', md: 'h-2' };

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max       = 100,
  label,
  sublabel,
  color     = 'green',
  size      = 'sm',
  showPercent = false,
  animate   = true,
  className,
}) => {
  const pct     = Math.min(100, Math.max(0, (value / max) * 100));
  const rounded = Math.round(pct);

  // Animate on mount
  const [width, setWidth] = React.useState(animate ? 0 : pct);
  React.useEffect(() => {
    if (!animate) { setWidth(pct); return; }
    const t = setTimeout(() => setWidth(pct), 80);
    return () => clearTimeout(t);
  }, [pct, animate]);

  return (
    <div className={cn('w-full', className)}>
      {/* Top row: label + percent */}
      {(label || showPercent) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
              {label}
            </span>
          )}
          {showPercent && (
            <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums ml-2 shrink-0">
              {rounded}%
            </span>
          )}
        </div>
      )}

      {/* Track */}
      <div
        className={cn(
          'w-full rounded-full overflow-hidden',
          'bg-gray-100 dark:bg-gray-800',
          heights[size],
        )}
        role="progressbar"
        aria-valuenow={rounded}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? `${rounded}% complete`}
      >
        <div
          className={cn(
            'h-full rounded-full',
            trackColors[color],
            animate && 'transition-[width] duration-700 ease-out',
          )}
          style={{ width: `${width}%` }}
        />
      </div>

      {/* Bottom row: sublabel */}
      {sublabel && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sublabel}</p>
      )}
    </div>
  );
};