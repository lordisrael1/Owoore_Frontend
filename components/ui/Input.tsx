import * as React from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?:      string;
  error?:      string;
  hint?:       string;
  success?:    string;            // green confirmation line (e.g. "Passwords match")
  prefix?:     React.ReactNode;   // left icon / text (e.g. ₦ symbol)
  suffix?:     React.ReactNode;   // right icon / action (e.g. show-password toggle)
  fullWidth?:  boolean;
  wrapperClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      success,
      prefix,
      suffix,
      fullWidth = true,
      className,
      wrapperClassName,
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    const hasError = Boolean(error);

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full', wrapperClassName)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-gray-600 dark:text-gray-400"
          >
            {label}
            {props.required && (
              <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>
            )}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative flex items-center">
          {/* Prefix */}
          {prefix && (
            <div className="absolute left-3 flex items-center pointer-events-none text-gray-400 text-sm">
              {prefix}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              // Base
              'w-full rounded-xl border bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100',
              'text-sm placeholder:text-gray-400 dark:placeholder:text-gray-600',
              'transition-colors duration-150',
              // Focus
              'focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-offset-0',
              // Border
              hasError
                ? 'border-red-400 focus:ring-red-400'
                : 'border-gray-200 dark:border-gray-700 focus:border-transparent',
              // Disabled
              'disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed',
              // Padding — adjust for prefix/suffix
              prefix ? 'pl-9' : 'pl-3',
              suffix ? 'pr-9' : 'pr-3',
              'py-2.5',
              className,
            )}
            {...props}
          />

          {/* Suffix — interactive (e.g. show-password toggle) */}
          {suffix && (
            <div className="absolute right-3 flex items-center text-gray-400 text-sm">
              {suffix}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1" role="alert">
            <svg className="w-3 h-3 shrink-0" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
              <path d="M6 0a6 6 0 100 12A6 6 0 006 0zm0 9a.75.75 0 110-1.5A.75.75 0 016 9zm.75-3.75a.75.75 0 01-1.5 0V3.75a.75.75 0 011.5 0v1.5z"/>
            </svg>
            {error}
          </p>
        )}

        {/* Success confirmation */}
        {success && !error && (
          <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
            <svg className="w-3 h-3 shrink-0" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
              <path d="M6 0a6 6 0 100 12A6 6 0 006 0zm2.78 4.72a.75.75 0 00-1.06-1.06L5.25 6.13 4.28 5.16a.75.75 0 00-1.06 1.06l1.5 1.5a.75.75 0 001.06 0l3-3z"/>
            </svg>
            {success}
          </p>
        )}

        {/* Hint */}
        {hint && !error && !success && (
          <p className="text-xs text-gray-400 dark:text-gray-500">{hint}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';