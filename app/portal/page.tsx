'use client';
import React from 'react';
import type { Metadata } from 'next';
import { useMemberPortal }  from '@/hooks/useMemberPortal';
import { useMemberFunds }   from '@/hooks/useFunds';
import { FundCard }         from '@/components/member/FundCard';
import { GivingSummary }    from '@/components/member/GivingSummary';
import { PageLoader, CardSkeleton } from '@/components/ui/Spinner';
import { EmptyState }       from '@/components/ui/EmptyState';
import { formatNairaCompact, formatPeriod, currentPeriod } from '@/lib/format';

/**
 * app/portal/page.tsx — Member portal home.
 *
 * GET /me → profile + fund summaries
 * GET /orgs/:orgId/funds → fund type list (for fund cards)
 *
 * Layout:
 *   1. Welcome header — member name + total this month
 *   2. Fund cards      — tap to get NUBAN account number
 *   3. Giving summary  — pledge progress + deficit per fund
 */

export default function PortalHomePage() {
  const { member, org, fundSummaries, isLoading, totalPaid } = useMemberPortal();
  const { activeFunds, isLoading: fundsLoading } = useMemberFunds();

  if (isLoading) return <PageLoader message="Loading your giving summary…" />;

  const period = currentPeriod();

  return (
    <div className="space-y-5 pb-24 animate-fade-in">
      {/* Welcome header */}
      <div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{formatPeriod(period)}</p>
        <h1 className="text-xl font-medium text-gray-900 dark:text-gray-100 tracking-tight">
          {member?.name ? `Hi, ${member.name.split(' ')[0]}` : 'Welcome'}
        </h1>
        {totalPaid > 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {formatNairaCompact(totalPaid)} given this month · {member?.memberCode}
          </p>
        )}
      </div>

      {/* Fund cards — tap to get NUBAN */}
      <section aria-label="Your giving accounts">
        <h2 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Tap a fund to get your account number
        </h2>

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
            {activeFunds.map((fund) => (
              <FundCard
                key={fund.id}
                fund={fund}
                summary={fundSummaries.find((s) => s.fund_type_id === fund.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Giving summary — pledge progress + deficits */}
      {fundSummaries.length > 0 && (
        <section aria-label="Giving summary">
          <h2 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            This month's summary
          </h2>
          <GivingSummary summaries={fundSummaries} />
        </section>
      )}
    </div>
  );
}