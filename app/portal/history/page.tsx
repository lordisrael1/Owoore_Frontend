'use client';
import React           from 'react';
import { useGivingHistory } from '@/hooks/useGivingHistory';
import { useMemberFunds }   from '@/hooks/useFunds';
import { TransactionRow }   from '@/components/member/TransactionRow';
import { PageLoader }       from '@/components/ui/Spinner';
import { EmptyState }       from '@/components/ui/EmptyState';
import { Select }           from '@/components/ui/Select';
import Link                 from 'next/link';

/**
 * app/portal/history/page.tsx — Member giving history.
 *
 * GET /me/giving-history?fund_type_id=...&period=...
 *
 * Filterable by fund and period (YYYY-MM).
 * Paginated with "Load more" pattern.
 *
 * PWA offline: service worker caches last-fetched history.
 * Shows cached results with a subtle "Showing cached data" notice.
 */

function getPeriodOptions() {
  const options = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d   = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const val = d.toISOString().slice(0, 7);
    const lbl = d.toLocaleDateString('en-NG', { month: 'long', year: 'numeric' });
    options.push({ value: val, label: lbl });
  }
  return options;
}

export default function HistoryPage() {
  const {
    transactions, isLoading, fundTypeId, period,
    setFundTypeId, setPeriod, clearFilters, hasFilters,
    canNext, setOffset, offset, limit,
  } = useGivingHistory();

  const { activeFunds } = useMemberFunds();

  const fundOptions = [
    { value: '', label: 'All funds' },
    ...activeFunds.map((f) => ({ value: f.id, label: f.name })),
  ];

  const periodOptions = [
    { value: '', label: 'All time' },
    ...getPeriodOptions(),
  ];

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      <div>
        <h1 className="text-xl font-medium text-gray-900 dark:text-gray-100">Giving history</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          All your contributions to {activeFunds[0]?.org_id ? 'your church' : 'this church'}
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-2.5">
        <Select
          options={fundOptions}
          value={fundTypeId ?? ''}
          onChange={(v) => setFundTypeId(v || undefined)}
          placeholder="All funds"
        />
        <Select
          options={periodOptions}
          value={period ?? ''}
          onChange={(v) => setPeriod(v || undefined)}
          placeholder="All time"
        />
      </div>

      {hasFilters && (
        <button onClick={clearFilters} className="text-xs text-green-700 dark:text-green-400 font-medium">
          Clear filters ×
        </button>
      )}

      {/* Transactions */}
      {isLoading ? (
        <PageLoader message="Loading history…" />
      ) : transactions.length === 0 ? (
        <EmptyState
          title="No transactions yet"
          message={hasFilters
            ? 'No payments match your current filters.'
            : 'Your giving history will appear here after your first transfer.'}
          action={hasFilters
            ? <button onClick={clearFilters} className="text-sm text-green-700 dark:text-green-400">Clear filters</button>
            : <Link href="/portal" className="text-sm text-green-700 dark:text-green-400">Get your account number →</Link>}
        />
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-50 dark:divide-gray-800 overflow-hidden">
          {transactions.map((tx) => (
            <div key={tx.id} className="px-4">
              <TransactionRow tx={tx} />
            </div>
          ))}
        </div>
      )}

      {canNext && (
        <button
          onClick={() => setOffset(offset + limit)}
          className="w-full py-2.5 text-sm text-green-700 dark:text-green-400 font-medium border border-green-200 dark:border-green-800/50 rounded-xl hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors"
        >
          Load more
        </button>
      )}
    </div>
  );
}