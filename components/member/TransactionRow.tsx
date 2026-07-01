import * as React from 'react';
import { Badge } from '@/components/ui/Badge';
import { formatNaira, formatTimeAgo, formatPeriod } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { Transaction } from '@/lib/api/members.api';

interface TransactionRowProps {
  tx:       Transaction;
  compact?: boolean;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({ tx, compact = false }) => {
  const isShort = tx.payment_status === 'UNDERPAYMENT';
  const isOver  = tx.payment_status === 'OVERPAYMENT';

  return (
    <div className={cn(
      'flex items-center gap-3 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0',
    )}>
      {/* Left: fund indicator */}
      <div className={cn(
        'w-1.5 shrink-0 self-stretch rounded-full',
        tx.payment_status === 'EXACT'        && 'bg-green-400',
        tx.payment_status === 'UNDERPAYMENT' && 'bg-amber-400',
        tx.payment_status === 'OVERPAYMENT'  && 'bg-blue-400',
      )} aria-hidden="true" />

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{tx.fund_name}</p>
          <Badge status={tx.payment_status} size="xs" />
        </div>
        <p className="text-[10px] text-gray-400 dark:text-gray-500">
          {formatPeriod(tx.period_month)}
          {tx.narration && ` · ${tx.narration}`}
        </p>
        {isShort && (
          <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">
            Short by {formatNaira(Math.abs(Number(tx.variance_kobo)))} — transfer to same account
          </p>
        )}
      </div>

      {/* Amount */}
      <div className="text-right shrink-0">
        <p className="text-xs font-medium text-gray-900 dark:text-gray-100 font-mono">
          {formatNaira(Number(tx.amount_kobo))}
        </p>
        <p className="text-[10px] text-gray-400 font-mono mt-0.5">
          {formatTimeAgo(tx.created_at)}
        </p>
      </div>
    </div>
  );
};