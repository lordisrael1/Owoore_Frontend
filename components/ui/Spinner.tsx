import * as React from 'react';
import { cn } from '@/lib/cn';

interface SpinnerProps {
  size?:      'xs' | 'sm' | 'md' | 'lg';
  color?:     'green' | 'white' | 'gray';
  className?: string;
  label?:     string; // sr-only label for accessibility
}

const sizes = {
  xs: 'w-3 h-3 border-[1.5px]',
  sm: 'w-4 h-4 border-2',
  md: 'w-5 h-5 border-2',
  lg: 'w-8 h-8 border-[3px]',
};

const colors = {
  green: 'border-green-200 border-t-green-700',
  white: 'border-white/30 border-t-white',
  gray:  'border-gray-200 dark:border-gray-700 border-t-gray-500 dark:border-t-gray-300',
};

export const Spinner: React.FC<SpinnerProps> = ({
  size  = 'md',
  color = 'green',
  className,
  label = 'Loading…',
}) => (
  <span role="status" className={cn('inline-flex items-center justify-center', className)}>
    <span
      className={cn(
        'rounded-full animate-spin border-solid',
        sizes[size],
        colors[color],
      )}
      aria-hidden="true"
    />
    <span className="sr-only">{label}</span>
  </span>
);

// ── Full-page loading overlay ─────────────────────────────────────────────────

export const PageLoader: React.FC<{ message?: string }> = ({
  message = 'Loading…',
}) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
    <Spinner size="lg" />
    <p className="text-sm text-gray-400">{message}</p>
  </div>
);

// ── Section skeleton — three rows ─────────────────────────────────────────────

export const SkeletonRow: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('animate-pulse bg-gray-100 dark:bg-gray-800 rounded', className)} />
);

export const CardSkeleton: React.FC = () => (
  <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-3">
    <SkeletonRow className="h-4 w-1/3" />
    <SkeletonRow className="h-7 w-1/2" />
    <SkeletonRow className="h-3 w-1/4" />
  </div>
);