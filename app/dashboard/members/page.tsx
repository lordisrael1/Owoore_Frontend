'use client';
import Link  from 'next/link';
import { useMembers, useMemberStatusTable } from '@/hooks/useMember';
import { useUiStore } from '@/store/uiStore';
import { Table, Pagination } from '@/components/ui/Table';
import { Badge }   from '@/components/ui/Badge';
import { Avatar }  from '@/components/ui/Avatar';
import { Select }  from '@/components/ui/Select';
import { CardSkeleton } from '@/components/ui/Spinner';
import { EmptyState }   from '@/components/ui/EmptyState';
import { formatNairaCompact, formatTimeAgo } from '@/lib/format';
import type { Column } from '@/components/ui/Table';
import type { AdminMember } from '@/lib/api/members.api';

/**
 * app/dashboard/members/page.tsx — Member management.
 *
 * Two sections:
 *   1. Member status table  — who paid / who owes (GET /dashboard/member-status)
 *   2. Full member list     — all members paginated (GET /members)
 */

const STATUS_OPTIONS = [
  { value: '',       label: 'All statuses' },
  { value: 'PAID',   label: 'Paid ✓' },
  { value: 'PARTIAL',label: 'Partial' },
  { value: 'UNPAID', label: 'Unpaid' },
];

export default function MembersPage() {
  const { activePeriod } = useUiStore();
  const {
    rows, isLoading: statusLoading,
    statusFilter, setStatusFilter,
  } = useMemberStatusTable(activePeriod);

  const {
    members, total, isLoading: listLoading,
    offset, limit,
    nextPage, prevPage,
  } = useMembers();

  const statusColumns: Column<typeof rows[0]>[] = [
    {
      key:    'member',
      header: 'Member',
      width:  '35%',
      render: (r) => (
        <Link href={`/dashboard/members/${r.member_id}`} className="flex items-center gap-2 hover:opacity-80">
          <Avatar name={r.member_name} size="sm" />
          <div>
            <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{r.member_name}</p>
            <p className="text-[10px] text-gray-400 font-mono">{r.member_code}</p>
          </div>
        </Link>
      ),
    },
    {
      key:    'fund',
      header: 'Fund',
      width:  '20%',
      render: (r) => <span className="text-xs text-gray-600 dark:text-gray-400">{r.fund_name}</span>,
    },
    {
      key:    'paid',
      header: 'Paid',
      width:  '18%',
      align:  'right',
      render: (r) => (
        <span className="text-xs font-medium font-mono">
          {r.total_paid_display ?? formatNairaCompact(Number(r.total_paid_kobo))}
        </span>
      ),
    },
    {
      key:    'expected',
      header: 'Expected',
      width:  '16%',
      align:  'right',
      render: (r) => (
        <span className="text-xs text-gray-400 font-mono">
          {r.expected_display ?? (r.expected_kobo ? formatNairaCompact(Number(r.expected_kobo)) : '—')}
        </span>
      ),
    },
    {
      key:    'status',
      header: 'Status',
      width:  '11%',
      align:  'right',
      render: (r) => <Badge status={r.payment_status} size="xs" />,
    },
  ];

  const memberColumns: Column<AdminMember>[] = [
    {
      key:    'name',
      header: 'Member',
      width:  '40%',
      render: (m) => (
        <Link href={`/dashboard/members/${m.id}`} className="flex items-center gap-2 hover:opacity-80">
          <Avatar name={m.display_name} size="sm" />
          <div>
            <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{m.display_name}</p>
            <p className="text-[10px] text-gray-400 font-mono">{m.member_code}</p>
          </div>
        </Link>
      ),
    },
    {
      key:    'email',
      header: 'Email',
      width:  '28%',
      render: (m) => <span className="text-xs text-gray-500 font-mono">{m.email}</span>,
    },
    {
      key:    'joined',
      header: 'Joined',
      width:  '20%',
      render: (m) => <span className="text-xs text-gray-400">{formatTimeAgo(m.joined_at)}</span>,
    },
    {
      key:    'status',
      header: '',
      width:  '12%',
      align:  'right',
      render: (m) => m.is_active
        ? <Badge variant="paid" size="xs">Active</Badge>
        : <Badge variant="cancelled" size="xs">Inactive</Badge>,
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100">Members</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {total.toLocaleString()} active members · {activePeriod}
          </p>
        </div>
      </div>

      {/* ── Full Member List ── */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">All members</h2>
        </div>
        <div className="overflow-x-auto">
          <Table
            data={members}
            columns={memberColumns}
            keyExtractor={(m) => m.id}
            loading={listLoading}
            emptyTitle="No members yet"
            emptyMessage="Members appear here once they join via your church link."
            onRowClick={(m) => window.location.href = `/dashboard/members/${m.id}`}
          />
        </div>
        <div className="p-4">
          <Pagination
            total={total}
            limit={limit}
            offset={offset}
            onChange={(o) => o > offset ? nextPage() : prevPage()}
          />
        </div>
      </div>

      {/* ── Payment Activity Table ── */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {rows.some((r) => r.expected_kobo != null) ? 'Payment status' : 'Giving activity'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {activePeriod} ·{' '}
              {rows.some((r) => r.expected_kobo != null)
                ? 'pledge tracking — who paid, who owes'
                : 'voluntary giving recorded this period'}
            </p>
          </div>
          {rows.length > 0 && (
            <div className="w-36">
              <Select
                options={STATUS_OPTIONS}
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="All statuses"
              />
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          {statusLoading ? (
            <div className="p-4 space-y-2"><CardSkeleton /><CardSkeleton /></div>
          ) : rows.length === 0 ? (
            <EmptyState
              title="No giving recorded"
              message="Payments will appear here once members transfer to their account numbers."
              compact
              className="py-8"
            />
          ) : (
            <Table
              data={rows}
              columns={statusColumns}
              keyExtractor={(r) => `${r.member_id}-${r.fund_type_id}`}
              loading={statusLoading}
            />
          )}
        </div>
      </div>

      
    </div>
  );
}