'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePayoutFundBalances, useBankList } from '@/hooks/usePayouts';
import { InitiatePayoutForm } from '@/components/payout/InitiatePayoutForm';
import { PageLoader } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';

/**
 * app/dashboard/payouts/new/page.tsx — Initiate a payout request.
 * POST /payouts → bank lookup + multi-step form
 *
 * Funds come from GET /payouts/fund-balances (not the fund-types list) so the
 * form can show what's actually available to disburse per fund — including
 * Anonymous Giving, which is hidden from member-facing fund lists but is
 * still payable out.
 */
export default function NewPayoutPage() {
  const router = useRouter();
  const {
    fundBalances,
    transferFeeKobo,
    isLoading: balancesLoading,
    hasError:  balancesError,
    refresh:   refreshBalances,
  } = usePayoutFundBalances();
  const { banks, isLoading: banksLoading } = useBankList();

  if (balancesLoading || banksLoading) return <PageLoader message="Loading payout form…" />;

  return (
    <div className="max-w-lg animate-fade-in">
      <Link href="/dashboard/payouts" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-5">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M10 4L6 8l4 4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Payouts
      </Link>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
        <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">Initiate payout</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Transfers above the threshold require multi-signatory approval before funds move.
        </p>
        {balancesError ? (
          <div className="text-center py-6 space-y-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Couldn't load your fund balances.
            </p>
            <Button variant="outline" size="sm" onClick={() => refreshBalances()}>
              Try again
            </Button>
          </div>
        ) : (
          <InitiatePayoutForm
            fundBalances={fundBalances}
            transferFeeKobo={transferFeeKobo}
            banks={banks}
            onSuccess={(payoutId) => router.push(`/dashboard/payouts/${payoutId}`)}
          />
        )}
      </div>
    </div>
  );
}
