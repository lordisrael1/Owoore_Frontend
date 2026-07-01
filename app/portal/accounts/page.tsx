'use client';
import React from 'react';
import { useAllVAs }        from '@/hooks/useVirtualAccount';
import { useMemberFunds }   from '@/hooks/useFunds';
import { AccountDisplay }   from '@/components/ui/CopyButton';
import { PageLoader, CardSkeleton } from '@/components/ui/Spinner';
import { EmptyState }       from '@/components/ui/EmptyState';
import Link                 from 'next/link';

/**
 * app/portal/accounts/page.tsx — All member VAs.
 *
 * GET /me/accounts → list of all NUBANs across all funds.
 *
 * This is the "save to beneficiary" page — members use this to
 * quickly copy any of their account numbers without tapping into each fund.
 *
 * PWA offline: service worker caches this response — works without connectivity.
 */
export default function AccountsPage() {
  const { accounts, isLoading } = useAllVAs();
  const { funds } = useMemberFunds();

  if (isLoading) return <PageLoader message="Loading your accounts…" />;

  const isShared = (fundTypeId: string) =>
    funds.find((f) => f.id === fundTypeId)?.is_shared_va ?? false;

  return (
    <div className="space-y-5 animate-fade-in pb-20">
      <div>
        <h1 className="text-xl font-medium text-gray-900 dark:text-gray-100">My accounts</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          All your dedicated giving account numbers in one place.
        </p>
      </div>

      {accounts.length === 0 ? (
        <div className="py-4">
          <EmptyState
            title="No accounts yet"
            message="Tap a fund on the home screen to get your dedicated account number."
            action={<Link href="/portal" className="text-sm text-green-700 dark:text-green-400 font-medium">Go to home →</Link>}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {accounts.map((account) => (
            <AccountDisplay
              key={account.fund_type_id}
              accountNumber={account.va_number}
              bankName={account.bank_name}
              label={isShared(account.fund_type_id) ? `${account.fund_name} (shared)` : account.fund_name}
            />
          ))}
        </div>
      )}

      {/* Tip */}
      {accounts.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-xl p-4 text-xs text-blue-700 dark:text-blue-300">
          <p className="font-medium mb-1">💡 Save as beneficiaries</p>
          <p className="leading-relaxed">
            Add each account number to your banking app's saved beneficiaries.
            This lets you pay in seconds every month — no need to re-enter the number.
          </p>
        </div>
      )}
    </div>
  );
}