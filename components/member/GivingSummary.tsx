import * as React from 'react';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { formatNaira, formatNairaCompact, formatPeriod, currentPeriod } from '@/lib/format';
import type { FundSummary } from '@/lib/api/members.api';

interface GivingSummaryProps {
  summaries?: FundSummary[];
  loading?:   boolean;
}

export const GivingSummary: React.FC<GivingSummaryProps> = ({
  summaries,
  loading = false,
}) => {
  const period  = currentPeriod();
  const items   = summaries ?? [];
  const hasData = items.some((s) => s.total_paid_kobo > 0);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 space-y-2">
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/3"/>
            <div className="h-2 bg-gray-50 dark:bg-gray-800/50 rounded w-full"/>
          </div>
        ))}
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-400 dark:text-gray-500">No giving records yet</p>
        <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">
          Select a fund above to get your account number and start giving
        </p>
      </div>
    );
  }

  const totalPaid = items.reduce((s, i) => s + i.total_paid_kobo, 0);

  return (
    <div className="space-y-3">
      {/* Period header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {formatPeriod(period)} · giving summary
        </p>
        <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
          {formatNairaCompact(totalPaid)} total
        </p>
      </div>

      {/* Per-fund cards */}
      {items
        .filter((s) => s.transaction_count > 0 || s.expected_amt_kobo)
        .map((s) => (
          <Card key={s.fund_type_id} padding="sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{s.fund_name}</p>
              <Badge
                status={s.is_fulfilled ? 'PAID' : s.total_paid_kobo > 0 ? 'PARTIAL' : 'UNPAID'}
                size="xs"
              />
            </div>

            {s.expected_amt_kobo ? (
              <ProgressBar
                value={s.pledge_progress_pct}
                sublabel={`${formatNaira(s.total_paid_kobo)} of ${formatNaira(s.expected_amt_kobo)}`}
                color={s.is_fulfilled ? 'green' : s.pledge_progress_pct > 50 ? 'amber' : 'red'}
                size="xs"
                showPercent
                animate
              />
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {s.total_paid_kobo > 0
                  ? `${formatNairaCompact(s.total_paid_kobo)} contributed`
                  : 'No contribution yet'}
              </p>
            )}

            {s.deficit_kobo > 0 && (
              <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1.5">
                ₦{formatNairaCompact(s.deficit_kobo)} outstanding — transfer to same account to complete
              </p>
            )}
          </Card>
        ))}
    </div>
  );
};