import * as React from 'react';
import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'ghost' | 'outline' | 'danger' | 'success';
export type ButtonSize    = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  ButtonVariant;
  size?:     ButtonSize;
  loading?:  boolean;
  icon?:     React.ReactNode;   // left icon
  iconRight?: React.ReactNode;  // right icon
  fullWidth?: boolean;
  as?: 'button' | 'a';
  href?: string;
}

const variants: Record<ButtonVariant, string> = {
  primary: [
    'bg-green-700 text-white border-transparent shadow-sm shadow-green-900/20',
    'hover:bg-green-800 active:bg-green-900',
    'focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2',
    'disabled:bg-green-300 disabled:cursor-not-allowed disabled:shadow-none',
  ].join(' '),
  ghost: [
    'bg-transparent text-gray-700 dark:text-gray-300 border-transparent',
    'hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200',
    'disabled:text-gray-400 disabled:cursor-not-allowed',
  ].join(' '),
  outline: [
    'bg-transparent text-gray-800 dark:text-gray-200',
    'border border-gray-200 dark:border-gray-700',
    'hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100',
    'disabled:text-gray-400 disabled:border-gray-100 disabled:cursor-not-allowed',
  ].join(' '),
  danger: [
    'bg-red-600 text-white border-transparent',
    'hover:bg-red-700 active:bg-red-800',
    'focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
    'disabled:bg-red-300 disabled:cursor-not-allowed',
  ].join(' '),
  success: [
    'bg-emerald-600 text-white border-transparent',
    'hover:bg-emerald-700 active:bg-emerald-800',
    'disabled:bg-emerald-300 disabled:cursor-not-allowed',
  ].join(' '),
};

const sizes: Record<ButtonSize, string> = {
  xs: 'px-3 py-1.5 text-xs gap-1.5 rounded-full',
  sm: 'px-3.5 py-2 text-xs gap-1.5 rounded-full',
  md: 'px-5 py-2.5 text-sm gap-2 rounded-full',
  lg: 'px-6 py-3 text-sm gap-2 rounded-full',
};

const Spinner: React.FC<{ size: ButtonSize }> = ({ size }) => {
  const sz = size === 'xs' || size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  return (
    <svg
      className={cn(sz, 'animate-spin')}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant   = 'primary',
      size      = 'md',
      loading   = false,
      icon,
      iconRight,
      fullWidth = false,
      className,
      children,
      disabled,
      as: Tag = 'button',
      // Native <button> defaults to type="submit" — inside a form, a ghost
      // "Cancel" or icon button would silently submit it. Opt IN to submit.
      type = 'button',
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={cn(
          // Base
          'inline-flex items-center justify-center font-medium',
          'border transition-all duration-150 select-none',
          'active:scale-[0.98]',
          'focus:outline-none focus-visible:outline-none',
          // Variant + size
          variants[variant],
          sizes[size],
          // Width
          fullWidth && 'w-full',
          // Loading
          loading && 'cursor-wait',
          className,
        )}
        {...props}
      >
        {loading ? (
          <Spinner size={size} />
        ) : (
          icon && <span className="shrink-0">{icon}</span>
        )}
        {children && <span>{children}</span>}
        {!loading && iconRight && (
          <span className="shrink-0">{iconRight}</span>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';