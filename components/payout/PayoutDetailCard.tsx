import * as React from 'react';
import { Card } from '@/components/ui/Card';
import { PayoutStatusBadge } from './PayoutStatusBadge';
import { formatNaira, formatDateTime, maskAccount } from '@/lib/format';
import type { PayoutRequest } from '@/lib/api/payouts.api';

interface PayoutDetailCardProps {
  payout:    PayoutRequest;
  fundName?: string;
  bankName?: string;
}

export const PayoutDetailCard: React.FC<PayoutDetailCardProps> = ({
  payout,
  fundName,
  bankName,
}) => (
  <Card>
    {/* Status + Amount */}
    <div className="flex items-start justify-between mb-4">
      <div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Payout amount</p>
        <p className="text-2xl font-medium text-gray-900 dark:text-gray-100 tracking-tight">
          {formatNaira(payout.amount_kobo)}
        </p>
      </div>
      <PayoutStatusBadge status={payout.status} />
    </div>

    {/* Details grid */}
    <dl className="space-y-3 text-sm">
      {[
        { label: 'Fund',        value: fundName ?? payout.fund_type_id },
        { label: 'Destination', value: bankName ? `${bankName} · *${payout.bank_account_id?.slice(-4)}` : '—' },
        { label: 'Purpose',     value: payout.purpose },
        { label: 'Requested',   value: formatDateTime(payout.created_at) },
        payout.executed_at && { label: 'Transferred', value: formatDateTime(payout.executed_at) },
        payout.nomba_transfer_ref && { label: 'Transfer ref', value: payout.nomba_transfer_ref },
        payout.transfer_error && { label: 'Error', value: payout.transfer_error },
      ]
        .filter(Boolean)
        .map((row: any) => (
          <div key={row.label} className="flex items-start justify-between gap-4">
            <dt className="text-xs text-gray-400 dark:text-gray-500 shrink-0 w-24">{row.label}</dt>
            <dd className={`text-xs text-right flex-1 ${
              row.label === 'Error' ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'
            }`}>
              {row.label === 'Transfer ref' ? (
                <code className="font-mono text-[10px]">{row.value}</code>
              ) : row.value}
            </dd>
          </div>
        ))}
    </dl>
  </Card>
);