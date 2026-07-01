'use client';
import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useVirtualAccount }    from '@/hooks/useVirtualAccount';
import { useMemberFunds }       from '@/hooks/useFunds';
import { VirtualAccountDisplay } from '@/components/member/VirtualAccountDisplay';
import { PageLoader }           from '@/components/ui/Spinner';
import { Button }               from '@/components/ui/Button';
import Link                     from 'next/link';

/**
 * app/portal/funds/[fundId]/page.tsx — Get/create a VA for a fund.
 *
 * POST /me/funds/:fundId/account → NUBAN account number
 *
 * This is the core UX moment:
 *   Member taps Tithe card → lands here → sees their NUBAN → copies it → pays
 *
 * Auto-triggers VA creation on mount.
 * If VA already exists (common case), backend returns instantly from DB.
 * If new, creates via Nomba API (~1-2 seconds).
 *
 * PWA offline: if offline and VA was previously cached, show it.
 */

export default function FundAccountPage() {
  const params  = useParams();
  const router  = useRouter();
  const fundId  = params.fundId as string;

  const { activeFunds, getFundById, isLoading: fundsLoading } = useMemberFunds();
  const { va, creating, error, create } = useVirtualAccount(fundId);

  const fund = getFundById(fundId);

  // For shared VAs already initialised, the number is embedded in the fund data —
  // no POST needed. Only POST when: (a) personal fund, or (b) shared fund whose
  // VA hasn't been created yet (shared_va_number is null → first member to tap triggers creation).
  const sharedVaReady = !!(fund?.is_shared_va && fund?.shared_va_number);

  const displayVa = sharedVaReady
    ? {
        va_number:         fund!.shared_va_number!,
        bank_name:         fund!.shared_va_bank ?? '',
        account_reference: '',
        is_new:            false,
        instructions:      `Transfer to ${fund!.shared_va_number} (${fund!.shared_va_bank})`,
      }
    : va ?? undefined;

  useEffect(() => {
    if (!fund || sharedVaReady) return; // shared VA with number — skip POST
    if (fundId && !va && !creating) create();
  }, [fundId, sharedVaReady, fund?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (fundsLoading) return <PageLoader message="Loading fund details…" />;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Back nav */}
      <div className="flex items-center gap-2">
        <Link
          href="/portal"
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M10 4L6 8l4 4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </Link>
      </div>

      {/* Fund name */}
      <div>
        <h1 className="text-xl font-medium text-gray-900 dark:text-gray-100">
          {fund?.name ?? 'Fund account'}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {fund?.is_shared_va
            ? 'Shared giving account'
            : fund?.kind === 'CAMPAIGN' ? 'Campaign fund' : 'Recurring giving'}
          {!fund?.is_shared_va && fund?.expected_amt_kobo ? ` · Monthly pledge: ₦${(Number(fund.expected_amt_kobo) / 100).toLocaleString()}` : ''}
        </p>
      </div>

      {/* VA display — loading / error / success */}
      <VirtualAccountDisplay
        va={displayVa}
        fundName={fund?.name}
        isShared={fund?.is_shared_va}
        loading={!sharedVaReady && creating}
        error={!sharedVaReady ? (error ?? undefined) : undefined}
        onRetry={!sharedVaReady ? create : undefined}
      />

      {/* Campaign expiry warning */}
      {fund?.kind === 'CAMPAIGN' && fund.expires_at && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3.5 text-xs text-amber-700 dark:text-amber-300">
          ⏰ This campaign ends on{' '}
          <strong>{new Date(fund.expires_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>.
          Transfer before the deadline to count this period's contribution.
        </div>
      )}
    </div>
  );
}