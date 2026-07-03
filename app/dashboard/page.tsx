'use client';
import { useDashboard, useMemberStatus } from '@/hooks/useDashboard';
import { useUiStore }                    from '@/store/uiStore';
import { MetricStrip }       from '@/components/dashboard/MetricStrip';
import { CollectionChart }   from '@/components/dashboard/CollectionChart';
import { FundPerformance }   from '@/components/dashboard/FundPerformance';
import { PayoutApprovalCard } from '@/components/dashboard/PayoutApprovalCard';
import { MemberStatusPanel } from '@/components/dashboard/MemberStatusPanel';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { ActivityFeed }      from '@/components/dashboard/ActivityFeed';
import { QuickActions }      from '@/components/dashboard/QuickActions';
import { usePayouts }        from '@/hooks/usePayouts';
import type { TransactionRow } from '@/components/dashboard/RecentTransactions';

/**
 * app/dashboard/page.tsx — Main dashboard.
 *
 * Fetches:
 *   GET /dashboard/summary        → metric strip + trend chart
 *   GET /dashboard/fund-breakdown → fund performance panel
 *   GET /dashboard/member-status  → member status panel (lazy)
 *   GET /payouts?status=PENDING   → pending payout approval card
 *
 * Two-column layout on desktop:
 *   Left (2/3):  metrics, chart, fund performance, transactions
 *   Right (1/3): pending payout, member status, quick actions
 */
export default function DashboardPage() {
  const { activePeriod } = useUiStore();
  const {
    summary, funds, payoutHistory, activity,
    summaryLoading, fundLoading, activityLoading, isLoading,
  } = useDashboard(activePeriod);

  const { members, isLoading: membersLoading } = useMemberStatus(activePeriod);
  const { payouts, cancelPayout } = usePayouts('PENDING');

  const pendingPayout = payouts[0] ?? null;

  // Shape payout history as TransactionRow for the table
  const recentTx: TransactionRow[] = (payoutHistory ?? []).map((p) => ({
    id:             p.id,
    member_name:    p.initiated_by,
    member_code:    '',
    fund_name:      p.fund_name,
    amount_kobo:    p.amount_kobo,
    payment_status: p.status,
    created_at:     p.created_at,
  }));

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Metric strip */}
      <MetricStrip
        data={summary}
        loading={summaryLoading}
      />

      {/* Two-column grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* LEFT: 2/3 width */}
        <div className="xl:col-span-2 space-y-4">
          <CollectionChart trend={summary?.trend} loading={summaryLoading} />
          <FundPerformance funds={funds} loading={fundLoading} />
          <RecentTransactions transactions={recentTx} loading={isLoading} />
        </div>

        {/* RIGHT: 1/3 width */}
        <div className="space-y-4">
          {pendingPayout && (
            <PayoutApprovalCard
              payout={pendingPayout}
              onCancel={cancelPayout}
            />
          )}
          <MemberStatusPanel
            members={members?.slice(0, 6)}
            loading={membersLoading}
            period={activePeriod}
          />
          <QuickActions />
          <ActivityFeed items={activity} loading={activityLoading} />
        </div>
      </div>
    </div>
  );
}