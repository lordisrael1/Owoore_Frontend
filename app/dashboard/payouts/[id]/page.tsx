'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { usePayoutDetail } from '@/hooks/usePayouts';
import { useFunds }        from '@/hooks/useFunds';
import { PayoutDetailCard } from '@/components/payout/PayoutDetailCard';
import { ApprovalTimeline } from '@/components/payout/ApprovalTimeline';
import { Button }           from '@/components/ui/Button';
import { Badge }            from '@/components/ui/Badge';
import { useToast }         from '@/components/ui/Toast';
import { PageLoader }       from '@/components/ui/Spinner';
import { formatDateTime }  from '@/lib/format';
import type { ApprovalStep } from '@/components/payout/ApprovalTimeline';

/**
 * app/dashboard/payouts/[id]/page.tsx — Payout detail + approval status.
 * GET /payouts/:id — auto-refreshes every 15s (approval can happen any moment)
 */
export default function PayoutDetailPage() {
  const { id }   = useParams();
  const { success, error } = useToast();
  const { payout, isLoading, cancel } = usePayoutDetail(id as string);
  const { getFundById } = useFunds();

  const [cancelling, setCancelling] = React.useState(false);

  if (isLoading) return <PageLoader message="Loading payout…" />;
  if (!payout)   return null;

  const fund = getFundById(payout.fund_type_id);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancel();
      success('Payout cancelled', 'Funds have been unlocked.');
    } catch (err: any) {
      error('Could not cancel', err.message);
    } finally {
      setCancelling(false);
    }
  };

  // Mock approval steps — replace with real /payouts/:id/approvals endpoint
  const approvalSteps: ApprovalStep[] = [
    {
      id:            '1',
      signatoryName: 'Pastor Emmanuel',
      role:          'Senior Pastor',
      status:        payout.approvals_received >= 1 ? 'APPROVED' : 'PENDING',
      actedAt:       payout.approvals_received >= 1 ? payout.updated_at : undefined,
    },
    {
      id:            '2',
      signatoryName: 'Deacon Chukwu',
      role:          'Board Deacon',
      status:        payout.approvals_received >= 2 ? 'APPROVED' : 'PENDING',
      actedAt:       payout.approvals_received >= 2 ? payout.updated_at : undefined,
    },
    {
      id:            '3',
      signatoryName: 'Elder Ngozi',
      role:          'Church Elder',
      status:        payout.status === 'DECLINED' ? 'DECLINED' : payout.approvals_received >= 3 ? 'APPROVED' : 'PENDING',
    },
  ];

  // APPROVED = auto-approved (below threshold) or all signatories approved — no further action needed
  // TRANSFERRING = Nomba transfer fired, waiting for webhook
  const isTerminal = ['APPROVED', 'TRANSFERRING', 'TRANSFERRED', 'DECLINED', 'EXPIRED', 'FAILED', 'CANCELLED'].includes(payout.status);

  return (
    <div className="max-w-2xl animate-fade-in space-y-4">
      {/* Back */}
      <Link href="/dashboard/payouts" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M10 4L6 8l4 4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Payouts
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: payout detail */}
        <div className="space-y-4">
          <PayoutDetailCard
            payout={payout}
            fundName={fund?.name}
          />

          {/* Transfer error */}
          {payout.status === 'FAILED' && payout.transfer_error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl p-4">
              <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">Transfer failed</p>
              <p className="text-xs text-red-600 dark:text-red-400">{payout.transfer_error}</p>
              <p className="text-xs text-gray-400 mt-2">Contact Nomba support or initiate a new payout request.</p>
            </div>
          )}

          {/* Cancel button */}
          {payout.status === 'PENDING' && (
            <Button
              variant="outline"
              fullWidth
              loading={cancelling}
              onClick={handleCancel}
              className="border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              Cancel payout request
            </Button>
          )}

          {/* New payout (on failure) */}
          {payout.status === 'FAILED' && (
            <Link href="/dashboard/payouts/new">
              <Button fullWidth>Retry with new request</Button>
            </Link>
          )}
        </div>

        {/* Right: approval timeline */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
          <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Approval status</h2>
          {isTerminal ? (
            <div className="flex flex-col items-center py-4">
              <Badge status={payout.status} size="sm" dot className="mb-2" />
              {payout.executed_at && (
                <p className="text-xs text-gray-400 text-center mt-1">
                  {payout.status === 'TRANSFERRED' ? 'Transferred at ' : 'Completed at '}
                  {formatDateTime(payout.executed_at)}
                </p>
              )}
              {payout.nomba_transfer_ref && (
                <p className="text-[10px] text-gray-400 font-mono mt-2">
                  Ref: {payout.nomba_transfer_ref}
                </p>
              )}
            </div>
          ) : (
            <ApprovalTimeline
              steps={approvalSteps}
              minApprovers={2}
            />
          )}

          {/* Auto-refresh note */}
          {!isTerminal && (
            <p className="text-[10px] text-gray-300 dark:text-gray-700 mt-4 text-center">
              This page refreshes every 15 seconds
            </p>
          )}
        </div>
      </div>
    </div>
  );
}