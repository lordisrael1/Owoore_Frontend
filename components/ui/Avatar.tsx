'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';

type AvatarSize  = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type AvatarColor = 'green' | 'blue' | 'amber' | 'red' | 'purple' | 'auto';

const sizes: Record<AvatarSize, string> = {
  xs: 'w-5 h-5 text-[9px]',
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
  xl: 'w-14 h-14 text-lg',
};

const colors: Record<Exclude<AvatarColor, 'auto'>, string> = {
  green:  'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
  blue:   'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  amber:  'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  red:    'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300',
  purple: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
};

// Deterministically pick a color from the name
function autoColor(name: string): Exclude<AvatarColor, 'auto'> {
  const keys = Object.keys(colors) as Exclude<AvatarColor, 'auto'>[];
  const idx  = name.charCodeAt(0) % keys.length;
  return keys[idx];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface AvatarProps {
  name:       string;
  size?:      AvatarSize;
  color?:     AvatarColor;
  src?:       string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  size  = 'sm',
  color = 'auto',
  src,
  className,
}) => {
  const resolvedColor = color === 'auto' ? autoColor(name) : color;
  const [imgError, setImgError] = React.useState(false);

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setImgError(true)}
        className={cn(
          'rounded-full object-cover border border-gray-100 dark:border-gray-800 shrink-0',
          sizes[size],
          className,
        )}
      />
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium shrink-0',
        'border border-transparent',
        sizes[size],
        colors[resolvedColor],
        className,
      )}
      aria-label={name}
    >
      {initials(name)}
    </span>
  );
};

// ── Avatar group (stacked) ────────────────────────────────────────────────────

interface AvatarGroupProps {
  names:     string[];
  max?:      number;
  size?:     AvatarSize;
  className?: string;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  names,
  max   = 4,
  size  = 'sm',
  className,
}) => {
  const visible  = names.slice(0, max);
  const overflow = names.length - max;

  return (
    <div className={cn('flex -space-x-1.5', className)}>
      {visible.map((name) => (
        <Avatar
          key={name}
          name={name}
          size={size}
          className="ring-2 ring-white dark:ring-gray-900"
        />
      ))}
      {overflow > 0 && (
        <span
          className={cn(
            'inline-flex items-center justify-center rounded-full font-medium shrink-0',
            'ring-2 ring-white dark:ring-gray-900',
            'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
            sizes[size],
          )}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
};