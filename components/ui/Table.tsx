import * as React from 'react';
import { cn } from '@/lib/cn';
import { Spinner } from './Spinner';
import { EmptyState } from './EmptyState';

export interface Column<T> {
  key:        string;
  header:     string;
  render:     (row: T, index: number) => React.ReactNode;
  width?:     string;
  align?:     'left' | 'center' | 'right';
  sortable?:  boolean;
}

interface TableProps<T> {
  data:        T[];
  columns:     Column<T>[];
  loading?:    boolean;
  emptyTitle?:   string;
  emptyMessage?: string;
  keyExtractor: (row: T, index: number) => string;
  onRowClick?:  (row: T) => void;
  className?:  string;
}

export function Table<T>({
  data,
  columns,
  loading       = false,
  emptyTitle    = 'No results',
  emptyMessage  = 'Nothing to display yet.',
  keyExtractor,
  onRowClick,
  className,
}: TableProps<T>) {
  const alignClass = { left: 'text-left', center: 'text-center', right: 'text-right' };

  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      {/* min-w keeps table-fixed columns readable on narrow screens —
          below it the wrapper scrolls horizontally instead of squishing */}
      <table className="w-full min-w-xl text-sm table-fixed border-collapse">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={col.width ? { width: col.width } : undefined}
                className={cn(
                  'py-2.5 px-3 text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500',
                  'border-b border-gray-100 dark:border-gray-800',
                  alignClass[col.align ?? 'left'],
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center">
                <Spinner size="md" />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center">
                <EmptyState title={emptyTitle} message={emptyMessage} compact />
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={keyExtractor(row, i)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'border-b border-gray-50 dark:border-gray-800/60 last:border-0',
                  'transition-colors duration-100',
                  onRowClick && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30',
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'py-3 px-3 text-gray-700 dark:text-gray-300 align-middle',
                      alignClass[col.align ?? 'left'],
                    )}
                  >
                    {col.render(row, i)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── Pagination ─────────────────────────────────────────────────────────────────

interface PaginationProps {
  total:    number;
  limit:    number;
  offset:   number;
  onChange: (offset: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  total,
  limit,
  offset,
  onChange,
}) => {
  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800 mt-1">
      <p className="text-xs text-gray-400">
        {offset + 1}–{Math.min(offset + limit, total)} of {total.toLocaleString()}
      </p>
      <div className="flex gap-1.5">
        <button
          onClick={() => onChange(Math.max(0, offset - limit))}
          disabled={currentPage === 1}
          className={cn(
            'px-3 py-1.5 text-xs rounded-full border border-gray-200 dark:border-gray-700',
            'text-gray-600 dark:text-gray-400',
            'hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed',
          )}
        >
          ← Prev
        </button>
        <button
          onClick={() => onChange(offset + limit)}
          disabled={currentPage >= totalPages}
          className={cn(
            'px-3 py-1.5 text-xs rounded-full border border-gray-200 dark:border-gray-700',
            'text-gray-600 dark:text-gray-400',
            'hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed',
          )}
        >
          Next →
        </button>
      </div>
    </div>
  );
};