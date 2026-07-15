'use client';
import * as React from 'react';
import { MetricCard } from '@/components/ui/Card';
import { CardSkeleton } from '@/components/ui/Spinner';
import type { DashboardSummary } from '@/lib/api/dashboard.api';
import { formatNairaCompact } from '@/lib/format';
import { cn } from '@/lib/cn';

// ── Icons ────────────────────────────────────────────────────────────────────

const WalletIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <rect x="1" y="4" width="14" height="9" rx="1.5"/>
    <path d="M1 7.5h14" strokeLinecap="round"/>
    <circle cx="12" cy="10.5" r="1" fill="currentColor" stroke="none"/>
  </svg>
);
const UsersIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <circle cx="6" cy="5" r="2.5"/>
    <path d="M1 13c0-2.21 2.239-4 5-4" strokeLinecap="round"/>
    <circle cx="11.5" cy="5.5" r="2"/>
    <path d="M8.5 13c0-1.93 1.343-3.5 3-3.5s3 1.57 3 3.5" strokeLinecap="round"/>
  </svg>
);
const SendIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M2 8h12M9 4l5 4-5 4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const AlertIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <circle cx="8" cy="8" r="6"/>
    <path d="M8 5v3.5M8 11v.5" strokeLinecap="round"/>
  </svg>
);

// ── Featured card with reveal animation ──────────────────────────────────────

interface FeaturedCardProps {
  available:    number;
  collected:    number;
  availDisplay?: string;
  collDisplay?:  string;
  momDelta?:     number | null; // % change in collections vs last month
}

const FeaturedCard: React.FC<FeaturedCardProps> = ({
  available, collected, availDisplay, collDisplay, momDelta,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [animated, setAnimated] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setAnimated(true); obs.unobserve(el); } },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        'col-span-2 lg:col-span-2',
        'metric-featured-gradient rounded-2xl p-5 flex flex-col relative overflow-hidden',
        'shadow-lg shadow-green-900/25',
      )}
    >
      {/* Background glow */}
      <div
        className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, white, transparent 70%)' }}
        aria-hidden="true"
      />

      {/* Icon */}
      <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center mb-3 text-white">
        <WalletIcon />
      </div>

      {/* Label */}
      <p className="text-xs text-white/70 font-medium mb-1">Available to disburse</p>

      {/* Animated reveal — very large balances fall back to the compact
          format (₦1.23bn) so the headline never clips at mobile widths */}
      <p
        className={cn(
          'text-3xl font-bold text-white tracking-tight tabular-nums transition-all duration-700',
          animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3',
        )}
      >
        {availDisplay && availDisplay.length <= 14 ? availDisplay : formatNairaCompact(available)}
      </p>

      {/* Month-over-month trend — mirrors the reference "% in last 30 days" chip */}
      {momDelta != null && (
        <p className={cn(
          'text-xs mt-1.5 flex items-center gap-1 font-medium',
          momDelta >= 0 ? 'text-green-200' : 'text-red-200',
        )}>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            {momDelta >= 0
              ? <path d="M2 8l3-3 2 2 3-4M10 3v3h-3" strokeLinecap="round" strokeLinejoin="round"/>
              : <path d="M2 4l3 3 2-2 3 4M10 9V6h-3" strokeLinecap="round" strokeLinejoin="round"/>}
          </svg>
          {momDelta >= 0 ? '+' : ''}{momDelta.toFixed(1)}% collections vs last month
        </p>
      )}

      {/* Footer context */}
      <div className="mt-auto pt-3 border-t border-white/15">
        <p className="text-xs text-white/50">
          {collDisplay ?? formatNairaCompact(collected)} received all time
        </p>
      </div>
    </div>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────

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
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="col-span-2 lg:col-span-2 h-36 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        {[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  const available    = data?.available_balance_kobo        ?? 0;
  const collected    = data?.total_collected_all_time_kobo ?? 0;
  const members      = data?.active_members                ?? 0;
  const pending      = data?.pending_payouts_kobo          ?? 0;
  const deficitCount = data?.deficit_member_count          ?? 0;
  const txCount      = data?.total_transactions            ?? 0;

  // Month-over-month collections delta from the 6-month trend.
  // Needs a real previous month to compare against — otherwise no chip.
  const trend     = data?.trend ?? [];
  const thisMonth = trend.find((t) => t.period_month === data?.period_month);
  const prevMonth = data?.period_month
    ? trend.filter((t) => t.period_month < data.period_month).at(-1)
    : undefined;
  const momDelta =
    thisMonth && prevMonth && Number(prevMonth.total_collected_kobo) > 0
      ? ((Number(thisMonth.total_collected_kobo) - Number(prevMonth.total_collected_kobo)) /
          Number(prevMonth.total_collected_kobo)) * 100
      : null;

  // deficit_member_count is only non-zero when pledge/campaign funds exist.
  // When all giving is voluntary, repurpose the card to show total transactions.
  const hasPledgeDeficit = deficitCount > 0;

  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-5 gap-3"
      role="region"
      aria-label="Summary metrics"
    >
      <FeaturedCard
        available={available}
        collected={collected}
        availDisplay={data?.available_display}
        collDisplay={data?.total_collected_display}
        momDelta={momDelta}
      />

      <MetricCard
        label="Active members"
        value={members.toLocaleString()}
        icon={<UsersIcon />}
        color="blue"
      />

      <MetricCard
        label="Pending payout"
        value={formatNairaCompact(pending)}
        delta={pending > 0 ? 'Awaiting approval' : 'None pending'}
        deltaDir={pending > 0 ? 'warn' : 'neutral'}
        icon={<SendIcon />}
        color="amber"
      />

      {hasPledgeDeficit ? (
        <MetricCard
          label="Members with deficit"
          value={deficitCount}
          delta={`${deficitCount} need follow-up`}
          deltaDir="down"
          icon={<AlertIcon />}
          color="red"
          className="col-span-2 sm:col-span-1"
        />
      ) : (
        <MetricCard
          label="Total payments"
          value={txCount.toLocaleString()}
          delta={txCount > 0 ? 'All time' : 'None yet'}
          deltaDir="neutral"
          icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 6h10M3 10h10M6.5 3l-1 10M10.5 3l-1 10" strokeLinecap="round"/></svg>}
          color="gray"
          className="col-span-2 sm:col-span-1"
        />
      )}
    </div>
  );
};
