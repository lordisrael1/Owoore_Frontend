'use client';
import React from 'react';
import Link from 'next/link';
import { usePayouts }   from '@/hooks/usePayouts';
import { Badge }        from '@/components/ui/Badge';
import { Button }       from '@/components/ui/Button';
import { Select }       from '@/components/ui/Select';
import { Table }        from '@/components/ui/Table';
import { Pagination }   from '@/components/ui/Table';
import { EmptyState }   from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Spinner';
import { formatNairaCompact, formatDateTime } from '@/lib/format';
import type { PayoutRequest } from '@/lib/api/payouts.api';
import type { Column } from '@/components/ui/Table';

const STATUS_OPTIONS = [
  { value: '',              label: 'All statuses'    },
  { value: 'PENDING',       label: 'Pending'         },
  { value: 'PARTIAL',       label: 'Partial approval'},
  { value: 'APPROVED',      label: 'Approved'        },
  { value: 'TRANSFERRED',   label: 'Transferred'     },
  { value: 'DECLINED',      label: 'Declined'        },
  { value: 'FAILED',        label: 'Failed'          },
  { value: 'CANCELLED',     label: 'Cancelled'       },
  { value: 'EXPIRED',       label: 'Expired'         },
];

/**
 * app/dashboard/payouts/page.tsx — Payout request list.
 * GET /payouts + GET /dashboard/payout-history
 */
export default function PayoutsPage() {
  const {
    payouts, isLoading, statusFilter, setStatusFilter,
    offset, limit, setOffset, canNext, canPrev, cancelPayout,
  } = usePayouts();

  const PlusIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M7 2v10M2 7h10" strokeLinecap="round"/>
    </svg>
  );

  const columns: Column<PayoutRequest>[] = [
    {
      key:    'amount',
      header: 'Amount',
      width:  '16%',
      render: (p) => (
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 font-mono">
          {formatNairaCompact(Number(p.amount_kobo))}
        </span>
      ),
    },
    {
      key:    'purpose',
      header: 'Purpose',
      width:  '30%',
      render: (p) => (
        <div>
          <p className="text-xs text-gray-700 dark:text-gray-300 truncate max-w-55">{p.purpose}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{p.fund_type_id?.slice(0, 8)}…</p>
        </div>
      ),
    },
    {
      key:    'status',
      header: 'Status',
      width:  '18%',
      render: (p) => (
        <div className="flex flex-col gap-1">
          <Badge status={p.status} size="xs" dot />
          {p.status === 'PARTIAL' && (
            <p className="text-[10px] text-amber-600 dark:text-amber-400">
              {p.approvals_received} signed
            </p>
          )}
        </div>
      ),
    },
    {
      key:    'date',
      header: 'Requested',
      width:  '22%',
      render: (p) => (
        <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
          {formatDateTime(p.created_at)}
        </span>
      ),
    },
    {
      key:    'actions',
      header: '',
      width:  '14%',
      align:  'right',
      render: (p) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link href={`/dashboard/payouts/${p.id}`}>
            <Button variant="ghost" size="xs">View</Button>
          </Link>
          {p.status === 'PENDING' && (
            <Button
              variant="ghost"
              size="xs"
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              onClick={() => cancelPayout(p.id)}
            >
              Cancel
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100">Payouts</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            All payout requests and their approval status
          </p>
        </div>
        <Link href="/dashboard/payouts/new">
          <Button size="sm" icon={<PlusIcon />}>New payout</Button>
        </Link>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <div className="w-52">
          <Select
            options={STATUS_OPTIONS}
            value={statusFilter ?? ''}
            onChange={(v) => setStatusFilter(v as any || undefined)}
            placeholder="All statuses"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : payouts.length === 0 ? (
          <EmptyState
            title="No payouts yet"
            message="Initiate your first payout to get started."
            action={
              <Link href="/dashboard/payouts/new">
                <Button size="sm">Initiate payout</Button>
              </Link>
            }
            className="py-12"
          />
        ) : (
          <>
            <Table
              data={payouts}
              columns={columns}
              keyExtractor={(p) => p.id}
              onRowClick={(p) => window.location.href = `/dashboard/payouts/${p.id}`}
            />
            <div className="px-4 pb-4">
              <Pagination
                total={999}
                limit={limit}
                offset={offset}
                onChange={setOffset}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}