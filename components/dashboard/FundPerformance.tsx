import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CardSkeleton } from '@/components/ui/Spinner';
import { formatNairaCompact } from '@/lib/format';
import type { FundBreakdownItem } from '@/lib/api/dashboard.api';
import { cn } from '@/lib/cn';

const COLORS: Array<'green' | 'blue' | 'amber' | 'red'> = ['green', 'blue', 'amber', 'red'];

interface FundPerformanceProps {
  funds?:    FundBreakdownItem[];
  loading?:  boolean;
}

export const FundPerformance: React.FC<FundPerformanceProps> = ({
  funds,
  loading = false,
}) => {
  if (loading) return <CardSkeleton />;

  const items = funds ?? [];

  return (
    <Card>
      <CardHeader
        title="Fund performance"
        subtitle="This period · vs target"
        action={
          <Link href="/dashboard/funds" className="text-xs text-green-700 dark:text-green-400 hover:underline flex items-center gap-0.5">
            View all
            <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M3 6h6M6 3l3 3-3 3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        }
      />

      <div className="space-y-4">
        {items.slice(0, 5).map((fund, i) => {
          const collected = Number(fund.total_collected_kobo);
          const hasTarget = false; // extend when backend sends expected
          const pct       = hasTarget ? 75 : 100;
          const color     = COLORS[i % COLORS.length];

          return (
            <div key={fund.fund_type_id} className="flex items-center gap-3">
              {/* Icon */}
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm',
                color === 'green' && 'bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-400',
                color === 'blue'  && 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400',
                color === 'amber' && 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400',
                color === 'red'   && 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400',
              )}>
                {['♥','🏛','🎁','⭐'][i % 4]}
              </div>

              {/* Progress */}
              <div className="flex-1 min-w-0">
                <ProgressBar
                  value={pct}
                  label={fund.fund_name}
                  color={color}
                  size="xs"
                  animate
                />
              </div>

              {/* Amount */}
              <div className="text-right shrink-0">
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                  {formatNairaCompact(collected)}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                  {fund.total_transactions} tx
                </p>
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">No fund data for this period</p>
        )}
      </div>
    </Card>
  );
};