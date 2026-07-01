'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatNaira, formatNairaCompact } from '@/lib/format';
import type { FundSummary } from '@/lib/api/members.api';
import type { FundType } from '@/lib/api/funds.api';

interface FundCardProps {
  fund:     FundType;
  summary?: FundSummary;
  onClick?: () => void;
}

const ICONS: Record<string, string> = {
  tithe:        '♥',
  offering:     '🎁',
  building:     '🏛',
  pastor:       '⭐',
  youth:        '⚡',
  mission:      '🌍',
  welfare:      '🤝',
};

function getFundIcon(name: string): string {
  const key = Object.keys(ICONS).find((k) => name.toLowerCase().includes(k));
  return key ? ICONS[key] : '₦';
}

export const FundCard: React.FC<FundCardProps> = ({ fund, summary, onClick }) => {
  const router  = useRouter();
  const icon    = getFundIcon(fund.name);
  const isCampaign   = fund.kind === 'CAMPAIGN';
  const isShared     = fund.is_shared_va;
  const hasProgress  = !isShared && summary && summary.expected_amt_kobo;
  const pct          = summary?.pledge_progress_pct ?? 0;
  const isFulfilled  = !isShared && (summary?.is_fulfilled ?? false);

  const handleClick = () => {
    if (onClick) { onClick(); return; }
    router.push(`/portal/funds/${fund.id}`);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full flex items-center justify-between p-4 rounded-xl text-left',
        'bg-white dark:bg-gray-900 border',
        isFulfilled
          ? 'border-green-200 dark:border-green-800/50 bg-green-50/30 dark:bg-green-950/20'
          : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700',
        'transition-all duration-150 active:scale-[.99]',
      )}
      aria-label={`${fund.name} — tap to get your account number`}
    >
      {/* Left: icon + info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0',
          isFulfilled
            ? 'bg-green-100 dark:bg-green-900/50'
            : 'bg-gray-50 dark:bg-gray-800',
        )}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{fund.name}</p>
            {isCampaign && <Badge variant="new" size="xs">Campaign</Badge>}
            {isShared && <Badge variant="default" size="xs">Shared</Badge>}
            {isFulfilled && <Badge status="PAID" size="xs">Done ✓</Badge>}
          </div>
          {isShared ? (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Same account number for everyone · tap to view
            </p>
          ) : hasProgress ? (
            <ProgressBar
              value={pct}
              sublabel={`${formatNairaCompact(summary!.total_paid_kobo)} paid`}
              color={isFulfilled ? 'green' : 'amber'}
              size="xs"
              animate
            />
          ) : (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {summary?.total_paid_kobo
                ? `${formatNairaCompact(summary.total_paid_kobo)} paid`
                : 'Tap to get your account number'}
            </p>
          )}
        </div>
      </div>

      {/* Right: chevron */}
      <svg
        className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0 ml-3"
        fill="none"
        viewBox="0 0 16 16"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
};