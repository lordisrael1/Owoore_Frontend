'use client';
import * as React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { formatNairaCompact } from '@/lib/format';
import type { PayoutRequest } from '@/lib/api/payouts.api';

interface PayoutApprovalCardProps {
  payout?:   PayoutRequest;
  loading?:  boolean;
  onCancel?: (id: string) => Promise<void>;
}

// Mock signatory data — in production fetched from GET /payouts/:id with approvals
const MOCK_SIGNATORIES = [
  { name: 'Pastor Emmanuel', status: 'APPROVED' as const },
  { name: 'Deacon Chukwu',   status: 'APPROVED' as const },
  { name: 'Elder Ngozi',     status: 'PENDING'  as const },
];

export const PayoutApprovalCard: React.FC<PayoutApprovalCardProps> = ({
  payout,
  loading  = false,
  onCancel,
}) => {
  const { error, success } = useToast();
  const [cancelling, setCancelling] = React.useState(false);

  if (!payout && !loading) return null;
  if (loading) {
    return (
      <Card>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-2/3"/>
          <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-1/2"/>
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-full"/>
        </div>
      </Card>
    );
  }

  const handleCancel = async () => {
    if (!payout || !onCancel) return;
    setCancelling(true);
    try {
      await onCancel(payout.id);
      success('Payout cancelled', 'The funds have been unlocked.');
    } catch {
      error('Could not cancel', 'Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const approvedCount = MOCK_SIGNATORIES.filter((s) => s.status === 'APPROVED').length;
  const totalCount    = MOCK_SIGNATORIES.length;
  const pct           = (approvedCount / totalCount) * 100;

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Payout approval</p>
        <Badge status="PENDING" dot>Awaiting</Badge>
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
        Building fund → GTBank · Grace Bible Church
      </p>

      {/* Amount */}
      <p className="text-2xl font-medium text-gray-900 dark:text-gray-100 tracking-tight mb-2">
        {payout ? formatNairaCompact(payout.amount_kobo) : '₦500,000'}
      </p>

      {/* Purpose */}
      <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2.5 mb-4 text-xs text-gray-500 dark:text-gray-400">
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <rect x="1" y="3" width="12" height="8" rx="1.5"/>
          <path d="M1 6h12" strokeLinecap="round"/>
        </svg>
        {payout?.purpose ?? 'Roof contractor payment'}
      </div>

      {/* Signatories */}
      <div className="space-y-3 mb-4">
        {MOCK_SIGNATORIES.map((s) => (
          <div key={s.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Avatar name={s.name} size="xs" />
              <span className="text-xs text-gray-700 dark:text-gray-300">{s.name}</span>
            </div>
            <Badge status={s.status} size="xs" />
          </div>
        ))}
      </div>

      {/* Progress */}
      <ProgressBar value={pct} color="green" size="xs" animate className="mb-1.5" />
      <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-4">
        {approvedCount} of {totalCount} approvals · transfer fires on quorum
      </p>

      {/* Cancel button */}
      {payout?.status === 'PENDING' && onCancel && (
        <Button
          variant="outline"
          size="sm"
          fullWidth
          loading={cancelling}
          onClick={handleCancel}
        >
          Cancel request
        </Button>
      )}
    </Card>
  );
};