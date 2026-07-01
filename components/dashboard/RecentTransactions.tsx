import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { CardSkeleton } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatNairaCompact, formatTimeAgo } from '@/lib/format';
import { cn } from '@/lib/cn';

export interface TransactionRow {
  id:             string;
  member_name:    string;
  member_code:    string;
  fund_name:      string;
  amount_kobo:    number;
  payment_status: string;
  created_at:     string;
}

interface RecentTransactionsProps {
  transactions?: TransactionRow[];
  loading?:      boolean;
}

const fundPillColor: Record<string, string> = {
  Tithe:        'bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400',
  Building:     'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
  Offering:     'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
  Campaign:     'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400',
};

function getFundColor(name: string): string {
  const key = Object.keys(fundPillColor).find((k) =>
    name.toLowerCase().includes(k.toLowerCase()),
  );
  return key ? fundPillColor[key] : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  loading = false,
}) => {
  if (loading) return <CardSkeleton />;

  const items = transactions?.slice(0, 6) ?? [];

  return (
    <Card>
      <CardHeader
        title="Recent transactions"
        subtitle="Auto-reconciled via Nomba webhook"
        action={
          <Link href="/dashboard/members" className="text-xs text-green-700 dark:text-green-400 hover:underline">
            View all →
          </Link>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          title="No transactions yet"
          message="Payments will appear here as soon as members transfer to their account numbers."
          compact
        />
      ) : (
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-xs min-w-130">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {['Member', 'Fund', 'Amount', 'Status', 'Time'].map((h) => (
                  <th key={h} className="text-left py-2 text-[10px] font-medium text-gray-400 dark:text-gray-500 pb-2.5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {items.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={tx.member_name} size="xs" />
                      <div>
                        <p className="text-xs font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">{tx.member_name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{tx.member_code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 pr-3">
                    <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full', getFundColor(tx.fund_name))}>
                      {tx.fund_name}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 font-medium text-gray-900 dark:text-gray-100 font-mono">
                    {formatNairaCompact(Number(tx.amount_kobo))}
                  </td>
                  <td className="py-2.5 pr-3">
                    <Badge status={tx.payment_status} size="xs" />
                  </td>
                  <td className="py-2.5 text-[10px] text-gray-400 font-mono whitespace-nowrap">
                    {formatTimeAgo(tx.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};