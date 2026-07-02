import * as React from 'react';
import { MetricCard } from '@/components/ui/Card';
import { CardSkeleton } from '@/components/ui/Spinner';
import type { DashboardSummary } from '@/lib/api/dashboard.api';
import { formatNairaCompact } from '@/lib/format';

const TrendUpIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M2 11l4-5 3 3 5-6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const UsersIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <circle cx="6" cy="5" r="2.5"/><path d="M1 13c0-2.21 2.239-4 5-4" strokeLinecap="round"/>
    <circle cx="11.5" cy="5.5" r="2"/><path d="M8.5 13c0-1.93 1.343-3.5 3-3.5s3 1.57 3 3.5" strokeLinecap="round"/>
  </svg>
);
const SendIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M2 8h12M9 4l5 4-5 4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const AlertIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <circle cx="8" cy="8" r="6"/><path d="M8 5v3.5M8 11v.5" strokeLinecap="round"/>
  </svg>
);

interface MetricStripProps {
  data?:    DashboardSummary;
  loading?: boolean;
}

export const MetricStrip: React.FC<MetricStripProps> = ({
  data,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  const collected    = data?.total_collected_all_time_kobo ?? 0;
  const members      = data?.active_members ?? 0;
  const pending      = data?.pending_payouts_kobo ?? 0;
  const deficitCount = data?.deficit_member_count ?? 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" role="region" aria-label="Summary metrics">
      <MetricCard
        label="Total collected"
        value={data?.total_collected_display ?? formatNairaCompact(collected)}
        icon={<TrendUpIcon />}
        color="green"
      />
      <MetricCard
        label="Active members"
        value={members.toLocaleString()}
        icon={<UsersIcon />}
        color="blue"
      />
      <MetricCard
        label="Pending payout"
        value={data?.pending_payouts_display ?? formatNairaCompact(pending)}
        delta={pending > 0 ? 'Awaiting approval' : 'None pending'}
        deltaDir={pending > 0 ? 'warn' : 'neutral'}
        icon={<SendIcon />}
        color="amber"
      />
      <MetricCard
        label="Members with deficit"
        value={deficitCount}
        delta={deficitCount > 0 ? `${deficitCount} need follow-up` : 'All up to date'}
        deltaDir={deficitCount > 0 ? 'down' : 'neutral'}
        icon={<AlertIcon />}
        color={deficitCount > 0 ? 'red' : 'gray'}
      />
    </div>
  );
};