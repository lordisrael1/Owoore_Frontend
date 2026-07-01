'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useMemberStatement } from '@/hooks/useMember';
import { ProgressBar }  from '@/components/ui/ProgressBar';
import { Badge }        from '@/components/ui/Badge';
import { Avatar }       from '@/components/ui/Avatar';
import { Button }       from '@/components/ui/Button';
import { PageLoader }   from '@/components/ui/Spinner';
import { TransactionRow } from '@/components/member/TransactionRow';
import { formatNaira, formatNairaCompact, formatDate } from '@/lib/format';
import { membersApi } from '@/lib/api/members.api';

/**
 * app/dashboard/members/[id]/page.tsx — Member detail + statement.
 *
 * GET /members/:id/statement → full giving history + fund summary
 */
export default function MemberDetailPage() {
  const { id }  = useParams();
  const year    = new Date().getFullYear();
  const { statement, isLoading } = useMemberStatement(id as string, year);

  const handleDownload = () => {
    const url = membersApi.downloadStatementUrl(id as string, year);
    window.open(url, '_blank');
  };

  if (isLoading) return <PageLoader message="Loading member statement…" />;
  if (!statement) return null;

  const { member, fund_summary, transactions, total_paid_display } = statement;

  return (
    <div className="space-y-5 animate-fade-in max-w-3xl">
      {/* Back */}
      <Link href="/dashboard/members" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M10 4L6 8l4 4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        All members
      </Link>

      {/* Header card */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={member.name} size="lg" />
            <div>
              <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100">{member.name}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-0.5">{member.member_code}</p>
              <p className="text-xs text-gray-400 mt-0.5">Joined {formatDate(member.joined_at)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-medium text-gray-900 dark:text-gray-100 tracking-tight">{total_paid_display}</p>
            <p className="text-xs text-gray-400 mt-0.5">total {year}</p>
            <Button size="xs" variant="outline" className="mt-2" onClick={handleDownload}>
              ↓ Download CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Fund summary */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
        <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Fund giving — {year}</h2>
        <div className="space-y-4">
          {fund_summary.map((f) => (
            <div key={f.fund_name}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{f.fund_name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{f.total_paid_display}</span>
                  <Badge
                    status={f.pledge_progress_pct >= 100 ? 'PAID' : f.total_paid_kobo > 0 ? 'PARTIAL' : 'UNPAID'}
                    size="xs"
                  />
                </div>
              </div>
              {f.expected_kobo ? (
                <ProgressBar
                  value={f.pledge_progress_pct}
                  sublabel={`${f.total_paid_display} of ${f.expected_display ?? '—'}`}
                  color={f.pledge_progress_pct >= 100 ? 'green' : f.pledge_progress_pct > 50 ? 'amber' : 'red'}
                  size="xs"
                  showPercent
                  animate
                />
              ) : (
                <div className="h-1.5 bg-green-100 dark:bg-green-900/30 rounded-full" />
              )}
              {f.deficit_kobo > 0 && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                  Deficit: {formatNaira(f.deficit_kobo)}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Transaction history */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Giving history · {transactions.length} records
          </h2>
        </div>
        <div className="px-4 divide-y divide-gray-50 dark:divide-gray-800">
          {transactions.map((tx) => (
            <TransactionRow
              key={tx.id ?? tx.created_at}
              tx={{ ...tx, id: tx.created_at } as any}
            />
          ))}
        </div>
      </div>
    </div>
  );
}