import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { CardSkeleton } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatNairaCompact } from '@/lib/format';
import type { MemberStatusItem } from '@/lib/api/dashboard.api';

interface MemberStatusPanelProps {
  members?:  MemberStatusItem[];
  loading?:  boolean;
  period?:   string;
}

export const MemberStatusPanel: React.FC<MemberStatusPanelProps> = ({
  members,
  loading = false,
  period,
}) => {
  if (loading) return <CardSkeleton />;

  const items = members?.slice(0, 6) ?? [];

  return (
    <Card>
      <CardHeader
        title="Member status"
        subtitle={period ?? 'This period'}
        action={
          <Link href="/dashboard/members" className="text-xs text-green-700 dark:text-green-400 hover:underline">
            All members →
          </Link>
        }
      />

      {items.length === 0 ? (
        <EmptyState title="No member data" message="Members appear here after their first payment." compact />
      ) : (
        <div className="space-y-0 divide-y divide-gray-50 dark:divide-gray-800">
          {items.map((m) => (
            <div key={`${m.member_id}-${m.fund_type_id}`} className="flex items-center gap-2.5 py-2.5">
              <Avatar name={m.member_name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                  {m.member_name}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">
                  {m.member_code} · {m.fund_name}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                  {m.total_paid_display ?? formatNairaCompact(Number(m.total_paid_kobo))}
                </p>
                <Badge
                  status={m.payment_status}
                  size="xs"
                  className="mt-0.5"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};