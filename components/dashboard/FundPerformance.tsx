'use client';
import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CardSkeleton } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useMemberStatus } from '@/hooks/useDashboard';
import { formatNaira, formatNairaCompact } from '@/lib/format';
import type { FundBreakdownItem } from '@/lib/api/dashboard.api';
import { cn } from '@/lib/cn';

const COLORS: Array<'green' | 'blue' | 'amber' | 'red'> = ['green', 'blue', 'amber', 'red'];

interface FundPerformanceProps {
  funds?:    FundBreakdownItem[];
  loading?:  boolean;
  period?:   string;
}

/**
 * Funds with per-member accounts (Tithe, Building, …) open a giver list on
 * click. Shared-VA and anonymous funds are collective by design — anyone can
 * give without an account — so there is no member list to show. Those rows
 * carry no click affordance (no hover, no chevron) and instead say why.
 */
const isMemberTracked = (f: FundBreakdownItem) => !f.is_shared_va && !f.is_anonymous_only;

const collectiveNote = (f: FundBreakdownItem) =>
  f.is_anonymous_only
    ? 'Given privately — names are never recorded'
    : 'Given collectively — not tracked per member';

export const FundPerformance: React.FC<FundPerformanceProps> = ({
  funds,
  loading = false,
  period,
}) => {
  const [openFund, setOpenFund] = React.useState<FundBreakdownItem | null>(null);

  // Lazy — the member × fund query is expensive, only fetch once a fund is opened
  const { members, isLoading: membersLoading } = useMemberStatus(period, !!openFund);

  const givers = React.useMemo(() => {
    if (!openFund) return [];
    return members
      .filter((m) => m.fund_type_id === openFund.fund_type_id && m.transaction_count > 0)
      .sort((a, b) => Number(b.total_paid_kobo) - Number(a.total_paid_kobo));
  }, [members, openFund]);

  const giversTotalKobo = givers.reduce((sum, m) => sum + Number(m.total_paid_kobo), 0);
  const showStatusBadge = givers.some((m) => m.expected_kobo != null);

  if (loading) return <CardSkeleton />;

  const items = funds ?? [];

  return (
    <Card>
      <CardHeader
        title="Fund performance"
        subtitle="This period · vs target"
        action={
          <Link href="/dashboard/funds" className="text-xs text-green-700 dark:text-green-400 hover:underline flex items-center gap-0.5">
            View all
            <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M3 6h6M6 3l3 3-3 3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        }
      />

      <div className="space-y-1">
        {items.slice(0, 5).map((fund, i) => {
          const collected = Number(fund.total_collected_kobo);
          const hasTarget = false; // extend when backend sends expected
          const pct       = hasTarget ? 75 : 100;
          const color     = COLORS[i % COLORS.length];
          const tracked   = isMemberTracked(fund);

          const row = (
            <>
              {/* Icon */}
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm',
                color === 'green' && 'bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-400',
                color === 'blue'  && 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400',
                color === 'amber' && 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400',
                color === 'red'   && 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400',
              )}>
                {['♥','🏛','🎁','⭐'][i % 4]}
              </div>

              {/* Progress */}
              <div className="flex-1 min-w-0">
                <ProgressBar
                  value={pct}
                  label={fund.fund_name}
                  color={color}
                  size="xs"
                  animate
                />
                {!tracked && (
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                    {collectiveNote(fund)}
                  </p>
                )}
              </div>

              {/* Amount */}
              <div className="text-right shrink-0">
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                  {formatNairaCompact(collected)}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                  {tracked
                    ? `${fund.member_count_paid} ${fund.member_count_paid === 1 ? 'giver' : 'givers'}`
                    : `${fund.total_transactions} tx`}
                </p>
              </div>

              {/* Chevron — only tracked funds afford a click */}
              {tracked && (
                <svg className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 shrink-0" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </>
          );

          return tracked ? (
            <button
              key={fund.fund_type_id}
              type="button"
              onClick={() => setOpenFund(fund)}
              className="w-full flex items-center gap-3 rounded-lg px-2 py-2 -mx-2 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700"
              aria-label={`See who gave to ${fund.fund_name}`}
            >
              {row}
            </button>
          ) : (
            <div key={fund.fund_type_id} className="flex items-center gap-3 px-2 py-2 -mx-2">
              {row}
            </div>
          );
        })}

        {items.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">No fund data for this period</p>
        )}
      </div>

      {/* Giver list — who paid into the clicked fund this period */}
      <Modal
        open={!!openFund}
        onClose={() => setOpenFund(null)}
        title={openFund?.fund_name ?? ''}
        subtitle={`Members who gave · ${period ?? 'this period'}`}
      >
        {membersLoading ? (
          <p className="text-xs text-gray-400 text-center py-6">Loading members…</p>
        ) : givers.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">
            No member giving recorded for {openFund?.fund_name} this period.
          </p>
        ) : (
          <div className="space-y-0 divide-y divide-gray-50 dark:divide-gray-800 max-h-80 overflow-y-auto">
            {givers.map((m) => (
              <div key={m.member_id} className="flex items-center gap-2.5 py-2.5">
                <Avatar name={m.member_name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                    {m.member_name}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">
                    {m.member_code} · {m.transaction_count} {m.transaction_count === 1 ? 'payment' : 'payments'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                    {m.total_paid_display ?? formatNairaCompact(Number(m.total_paid_kobo))}
                  </p>
                  {showStatusBadge && (
                    <Badge status={m.payment_status} size="xs" className="mt-0.5" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {!membersLoading && givers.length > 0 && (
          <p className="text-[11px] text-gray-400 dark:text-gray-500 pt-3 mt-1 border-t border-gray-50 dark:border-gray-800">
            {givers.length} {givers.length === 1 ? 'member' : 'members'} · {formatNaira(giversTotalKobo)} total
          </p>
        )}
      </Modal>
    </Card>
  );
};
