'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useFunds } from '@/hooks/useFunds';
import { useAuth }  from '@/hooks/useAuth';
import { Badge }    from '@/components/ui/Badge';
import { Button }   from '@/components/ui/Button';
import type { FundType } from '@/lib/api/funds.api';
import { ConfirmModal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { CardSkeleton } from '@/components/ui/Spinner';
import { EmptyState }   from '@/components/ui/EmptyState';
import { formatNairaCompact, formatDate } from '@/lib/format';
import { isExpired, isCampaign, daysUntilExpiry } from '@/types/fund.types';

/**
 * app/dashboard/funds/page.tsx — Fund type management.
 * GET /orgs/:orgId/funds
 */
export default function FundsPage() {
  const { success, error } = useToast();
  const { isTreasurer } = useAuth();
  const { funds, activeFunds, inactiveFunds, isLoading, deactivateFund, updateFund } = useFunds(true);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deactivating, setDeactivating] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggleShared = async (fund: FundType) => {
    setTogglingId(fund.id);
    try {
      await updateFund(fund.id, { is_shared_va: !fund.is_shared_va });
      success(
        fund.is_shared_va ? 'Switched to per-member' : 'Switched to shared',
        fund.is_shared_va
          ? `${fund.name} will now create a personal account for each member.`
          : `${fund.name} will now show the same account number to every member.`,
      );
    } catch (err: any) {
      error('Could not update fund', err.message);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeactivate = async () => {
    if (!confirmId) return;
    setDeactivating(true);
    try {
      await deactivateFund(confirmId);
      success('Fund deactivated', 'The fund has been hidden from members.');
      setConfirmId(null);
    } catch (err: any) {
      error('Could not deactivate', err.message);
    } finally {
      setDeactivating(false);
    }
  };

  const PlusIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M7 2v10M2 7h10" strokeLinecap="round"/>
    </svg>
  );

  if (isLoading) return (
    <div className="space-y-3">{[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}</div>
  );

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100">Fund types</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {activeFunds.length} active · {inactiveFunds.length} inactive
          </p>
        </div>
        {!isTreasurer && (
          <Link href="/dashboard/funds/new">
            <Button size="sm" icon={<PlusIcon />}>New fund</Button>
          </Link>
        )}
      </div>

      {/* Active funds */}
      {activeFunds.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">Active funds</h2>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {activeFunds.map((fund) => {
              const days = isCampaign(fund) ? daysUntilExpiry(fund) : null;
              return (
                <div key={fund.id} className="flex items-center gap-3 px-4 py-3.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{fund.name}</p>
                      <Badge variant={isCampaign(fund) ? 'new' : 'default'} size="xs">
                        {isCampaign(fund) ? 'Campaign' : 'Recurring'}
                      </Badge>
                      {fund.is_shared_va && (
                        <Badge variant="default" size="xs">Shared</Badge>
                      )}
                      {days !== null && days <= 7 && (
                        <Badge variant="partial" size="xs">Ends in {days}d</Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {fund.is_shared_va
                        ? 'Shared account — same number for all members'
                        : fund.expected_amt_kobo
                          ? `₦${formatNairaCompact(Number(fund.expected_amt_kobo))} expected · `
                          : 'Per-member accounts · '}
                      {!fund.is_shared_va && (fund.expires_at ? `Expires ${formatDate(fund.expires_at)}` : 'No expiry')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!isTreasurer && (
                      <Button
                        variant="ghost"
                        size="xs"
                        loading={togglingId === fund.id}
                        onClick={() => handleToggleShared(fund)}
                        title={fund.is_shared_va ? 'Switch to per-member accounts' : 'Switch to shared account'}
                      >
                        {fund.is_shared_va ? 'Per-member' : 'Make shared'}
                      </Button>
                    )}
                    <Link href={`/dashboard/funds/${fund.id}`}>
                      <Button variant="ghost" size="xs">{isTreasurer ? 'View' : 'Edit'}</Button>
                    </Link>
                    {!isTreasurer && (
                      <Button
                        variant="ghost"
                        size="xs"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                        onClick={() => setConfirmId(fund.id)}
                      >
                        Deactivate
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeFunds.length === 0 && (
        <EmptyState
          title="No active funds"
          message={isTreasurer
            ? 'No funds yet — ask an admin to create the first fund type.'
            : 'Create your first fund type to let members start giving.'}
          action={isTreasurer ? undefined : (
            <Link href="/dashboard/funds/new"><Button size="sm">Create fund</Button></Link>
          )}
        />
      )}

      {/* Inactive funds */}
      {inactiveFunds.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden opacity-60">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Inactive</h2>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {inactiveFunds.map((fund) => (
              <div key={fund.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-500 line-through">{fund.name}</p>
                </div>
                <Link href={`/dashboard/funds/${fund.id}`}>
                  <Button variant="ghost" size="xs">{isTreasurer ? 'View' : 'Reactivate'}</Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirm deactivate */}
      <ConfirmModal
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={handleDeactivate}
        loading={deactivating}
        title="Deactivate fund"
        description="Members will no longer be able to give to this fund. Existing transactions and account numbers are preserved. You can reactivate it later."
        confirmLabel="Deactivate"
        confirmVariant="danger"
      />
    </div>
  );
}