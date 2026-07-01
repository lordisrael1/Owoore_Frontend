'use client';
import React from 'react';
import Link  from 'next/link';
import { reportsApi }  from '@/lib/api/reports.api';
import { useOrgStore } from '@/store/orgStore';
import { Avatar }      from '@/components/ui/Avatar';
import { Badge }       from '@/components/ui/Badge';
import { Button }      from '@/components/ui/Button';
import { PageLoader }  from '@/components/ui/Spinner';
import { EmptyState }  from '@/components/ui/EmptyState';
import { formatNairaCompact } from '@/lib/format';
import useSWR from 'swr';

/**
 * app/dashboard/reports/arrears/page.tsx — Members with deficits.
 * GET /reports/arrears
 */
export default function ArrearsPage() {
  const org   = useOrgStore();
  const orgId = org.orgId ?? '';

  const { data: arrears, isLoading } = useSWR(
    orgId ? 'reports/arrears' : null,
    () => reportsApi.arrears(),
    { revalidateOnFocus: false },
  );

  if (isLoading) return <PageLoader message="Loading arrears…" />;

  const total = (arrears ?? []).reduce((s, m) => s + Number(m.total_deficit_kobo), 0);

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/dashboard/reports" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M10 4L6 8l4 4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Reports
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100">Member arrears</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {(arrears ?? []).length} members with outstanding balances ·{' '}
            <span className="text-red-600 dark:text-red-400 font-medium">
              {formatNairaCompact(total)} total
            </span>
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-xl p-3.5 text-xs text-blue-700 dark:text-blue-300">
        💡 Members on this list receive automated Monday morning reminders by email.
        Ensure their email is correctly registered.
      </div>

      {/* Arrears list */}
      {!arrears?.length ? (
        <EmptyState
          title="No arrears"
          message="All members are up to date with their giving. 🎉"
          icon={
            <div className="w-14 h-14 rounded-2xl bg-green-50 dark:bg-green-950/50 flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          }
        />
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {arrears.map((member) => (
              <div key={member.member_id} className="px-4 py-3.5">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar name={member.member_name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/members/${member.member_id}`}
                        className="text-sm font-medium text-gray-800 dark:text-gray-200 hover:underline"
                      >
                        {member.member_name}
                      </Link>
                      <span className="text-[10px] font-mono text-gray-400">{member.member_code}</span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">{member.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                      {formatNairaCompact(Number(member.total_deficit_kobo))} owed
                    </p>
                    <Badge status="UNPAID" size="xs" className="mt-0.5" />
                  </div>
                </div>

                {/* Per-fund breakdown */}
                <div className="flex flex-wrap gap-2 ml-9">
                  {member.funds.map((f) => (
                    <span
                      key={f.fund_name}
                      className="inline-flex items-center gap-1 text-[10px] bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full"
                    >
                      {f.fund_name}: {formatNairaCompact(Number(f.deficit_kobo))}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}