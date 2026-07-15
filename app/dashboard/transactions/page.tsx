'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { dashboardApi } from '@/lib/api/dashboard.api';
import { useFunds }     from '@/hooks/useFunds';
import { Select }       from '@/components/ui/Select';
import { Button }       from '@/components/ui/Button';
import { Badge }        from '@/components/ui/Badge';
import { Avatar }       from '@/components/ui/Avatar';
import { CardSkeleton } from '@/components/ui/Spinner';
import { EmptyState }   from '@/components/ui/EmptyState';
import { recentPeriods, formatDate } from '@/lib/format';

/**
 * app/dashboard/transactions/page.tsx — the giving ledger.
 *
 * Every naira that came in: member payments (attributed) and anonymous
 * inflows, newest first. GET /dashboard/transactions — paginated,
 * filterable by fund and period.
 *
 * Anonymous rows deliberately show no giver identity — the backend
 * never returns it, so there is nothing to leak here.
 */

const PAGE_SIZE = 25;

export default function TransactionsPage() {
  const { activeFunds } = useFunds();

  const [period,     setPeriod]     = useState('');
  const [fundFilter, setFundFilter] = useState('');
  const [page,       setPage]       = useState(0);

  const { data, isLoading } = useSWR(
    ['dashboard/transactions', period, fundFilter, page],
    () => dashboardApi.transactions({
      period:     period     || undefined,
      fundTypeId: fundFilter || undefined,
      limit:      PAGE_SIZE,
      offset:     page * PAGE_SIZE,
    }),
    { refreshInterval: 30_000, revalidateOnFocus: true },
  );

  const rows      = data?.transactions ?? [];
  const total     = data?.total ?? 0;
  const lastPage  = Math.max(Math.ceil(total / PAGE_SIZE) - 1, 0);

  const periodOptions = [{ value: '', label: 'All time' }, ...recentPeriods(12)];
  const fundOptions   = [
    { value: '', label: 'All funds' },
    ...activeFunds.map((f) => ({ value: f.id, label: f.name })),
  ];

  // Reset to page 0 whenever a filter changes
  const changePeriod = (v: string) => { setPeriod(v); setPage(0); };
  const changeFund   = (v: string) => { setFundFilter(v); setPage(0); };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100">Transactions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Every payment received, auto-reconciled from Nomba webhooks
          </p>
        </div>
        <Link href="/dashboard/reports">
          <Button size="sm" variant="outline">Reports →</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="w-44">
          <Select options={periodOptions} value={period} onChange={changePeriod} />
        </div>
        <div className="w-44">
          <Select options={fundOptions} value={fundFilter} onChange={changeFund} placeholder="All funds" />
        </div>
      </div>

      {/* Ledger table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">Giving ledger</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {total.toLocaleString()} payment{total === 1 ? '' : 's'}
          </p>
        </div>

        {isLoading && rows.length === 0 ? (
          <div className="p-4 space-y-2">{[...Array(5)].map((_, i) => <CardSkeleton key={i} />)}</div>
        ) : rows.length === 0 ? (
          <EmptyState
            compact
            className="py-10"
            title="No payments yet"
            message="Payments appear here the moment members transfer to their dedicated account numbers."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  {['Date', 'Giver', 'Fund', 'Amount', 'Status', 'From bank'].map((h) => (
                    <th key={h} className="text-left text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider py-2.5 px-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {rows.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="py-2.5 px-4 text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(tx.created_at)}
                    </td>
                    <td className="py-2.5 px-4">
                      {tx.source === 'ANONYMOUS' ? (
                        <span className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-xs shrink-0" aria-hidden="true">
                            🕊
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 italic">Anonymous</span>
                        </span>
                      ) : (
                        <Link href={`/dashboard/members/${tx.member_id}`} className="flex items-center gap-2.5 group">
                          <Avatar name={tx.member_name ?? ''} size="sm" />
                          <span className="min-w-0">
                            <span className="block text-xs font-medium text-gray-800 dark:text-gray-200 truncate group-hover:text-green-700 dark:group-hover:text-green-400">
                              {tx.member_name}
                            </span>
                            <span className="block text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                              {tx.member_code}
                            </span>
                          </span>
                        </Link>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-xs text-gray-600 dark:text-gray-300">{tx.fund_name}</td>
                    <td className="py-2.5 px-4 text-xs font-mono font-medium text-green-700 dark:text-green-400 whitespace-nowrap">
                      {tx.amount_display}
                    </td>
                    <td className="py-2.5 px-4">
                      <Badge status={tx.payment_status} size="xs" />
                    </td>
                    <td className="py-2.5 px-4 text-xs text-gray-400 dark:text-gray-500">
                      {tx.sender_bank ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pager */}
        {total > PAGE_SIZE && (
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total.toLocaleString()}
            </p>
            <div className="flex gap-2">
              <Button size="xs" variant="outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                ← Previous
              </Button>
              <Button size="xs" variant="outline" disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)}>
                Next →
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
