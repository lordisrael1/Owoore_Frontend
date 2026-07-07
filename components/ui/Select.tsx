'use client';
import * as React from 'react';
import { cn } from '@/lib/cn';

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  options:     SelectOption[];
  value?:      string;
  onChange:    (value: string) => void;
  placeholder?: string;
  label?:      string;
  error?:      string;
  disabled?:   boolean;
  fullWidth?:  boolean;
  className?:  string;
  searchable?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  label,
  error,
  disabled    = false,
  fullWidth   = true,
  className,
  searchable  = false,
}) => {
  const [open,   setOpen]   = React.useState(false);
  const [search, setSearch] = React.useState('');
  const ref                 = React.useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = searchable
    ? options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase()) ||
        o.value.toLowerCase().includes(search.toLowerCase()),
      )
    : options;

  // Close on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (opt: SelectOption) => {
    onChange(opt.value);
    setOpen(false);
    setSearch('');
  };

  const id = label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={cn('relative', fullWidth && 'w-full', className)} ref={ref}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5"
        >
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'w-full flex items-center justify-between gap-2',
          'px-3 py-2.5 rounded-xl text-sm text-left',
          'bg-white dark:bg-gray-900 border',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-offset-0',
          error
            ? 'border-red-400'
            : 'border-gray-200 dark:border-gray-700',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={cn(selected ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400')}>
          {selected?.label ?? placeholder}
        </span>
        <svg
          className={cn('w-4 h-4 text-gray-400 shrink-0 transition-transform', open && 'rotate-180')}
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M4.22 6.22a.75.75 0 011.06 0L8 8.94l2.72-2.72a.75.75 0 111.06 1.06l-3.25 3.25a.75.75 0 01-1.06 0L4.22 7.28a.75.75 0 010-1.06z" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className={cn(
            'absolute z-40 w-full mt-1.5 rounded-xl shadow-soft-lg dark:shadow-lg',
            'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800',
            'overflow-hidden',
          )}
          role="listbox"
        >
          {searchable && (
            <div className="p-2 border-b border-gray-100 dark:border-gray-800">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search banks…"
                className={cn(
                  'w-full px-3 py-2 text-xs rounded-md',
                  'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
                  'focus:outline-none focus:ring-1 focus:ring-green-700',
                  'text-gray-900 dark:text-gray-100 placeholder:text-gray-400',
                )}
                autoFocus
              />
            </div>
          )}
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="py-3 px-3 text-xs text-gray-400 text-center">No results</p>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={opt.value === value}
                  onClick={() => handleSelect(opt)}
                  className={cn(
                    'w-full text-left px-3 py-2.5 text-sm',
                    'transition-colors duration-100',
                    opt.value === value
                      ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
                  )}
                >
                  {opt.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 mt-1.5" role="alert">{error}</p>
      )}
    </div>
  );
};