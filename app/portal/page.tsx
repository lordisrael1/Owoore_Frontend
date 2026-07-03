'use client';
import React from 'react';
import { useMemberPortal }  from '@/hooks/useMemberPortal';
import { useMemberFunds }   from '@/hooks/useFunds';
import { FundCard }         from '@/components/member/FundCard';
import { PageLoader, CardSkeleton } from '@/components/ui/Spinner';
import { EmptyState }       from '@/components/ui/EmptyState';
import { formatPeriod, currentPeriod } from '@/lib/format';
import { cn } from '@/lib/cn';

/**
 * app/portal/page.tsx — Member portal home.
 * GET /me → profile + fund summaries
 * GET /orgs/:orgId/funds → fund type list
 */

const WaveEmoji: React.FC = () => {
  const [waved, setWaved] = React.useState(false);
  return (
    <button
      onClick={() => setWaved(true)}
      className="inline-block select-none focus:outline-none"
      title="Wave back!"
      aria-label="Wave emoji"
    >
      <span
        className={cn(
          'text-2xl inline-block origin-bottom-right',
          waved ? 'animate-[wiggle_.5s_ease-in-out]' : '',
        )}
        style={waved ? { animation: 'float .4s ease-in-out 2' } : {}}
      >
        👋
      </span>
    </button>
  );
};

export default function PortalHomePage() {
  const { member, fundSummaries, isLoading } = useMemberPortal();
  const { activeFunds, isLoading: fundsLoading } = useMemberFunds();

  if (isLoading) return <PageLoader message="Loading your giving summary…" />;

  const period     = currentPeriod();
  const firstName  = member?.name?.split(' ')[0] ?? '';

  return (
    <div className="space-y-6 pb-24 animate-fade-in">

      {/* ── Welcome header ──────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-linear-to-br from-green-700 to-green-800 p-5 text-white relative overflow-hidden shadow-lg shadow-green-900/20">
        {/* Background texture */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top right, #86efac, transparent 60%)' }}
          aria-hidden="true"
        />

        <div className="relative">
          <p className="text-xs text-green-200/70 font-medium mb-1">{formatPeriod(period)}</p>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                {firstName ? (
                  <span className="flex items-center gap-2">
                    Hi, {firstName} <WaveEmoji />
                  </span>
                ) : (
                  'Welcome'
                )}
              </h1>
            </div>
            {member?.memberCode && (
              <div className="shrink-0 text-right">
                <p className="text-[10px] text-green-200/60 mb-0.5">Member</p>
                <p className="text-xs font-mono font-semibold text-green-100 bg-white/10 px-2 py-1 rounded-lg border border-white/10">
                  {member.memberCode}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Fund cards ──────────────────────────────────────────────────── */}
      <section aria-label="Your giving accounts">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Tap a fund to pay
          </h2>
          {activeFunds.length > 0 && (
            <span className="text-[10px] text-gray-400 dark:text-gray-600">
              {activeFunds.length} fund{activeFunds.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {fundsLoading ? (
          <div className="space-y-2.5">
            {[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : activeFunds.length === 0 ? (
          <EmptyState
            title="No active funds"
            message="Your church hasn't set up any funds yet. Check back soon."
          />
        ) : (
          <div className="space-y-2.5">
            {activeFunds.map((fund, i) => (
              <div
                key={fund.id}
                className="animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <FundCard
                  fund={fund}
                  summary={fundSummaries.find((s) => s.fund_type_id === fund.id)}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── How to pay hint ─────────────────────────────────────────────── */}
      <div className="rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4">
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">How to give</p>
        <div className="space-y-2">
          {[
            'Tap any fund above to get your account number',
            'Transfer from GTBank, OPay, Kuda, or any bank',
            'You\'ll receive an email confirmation instantly',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
