'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { reportsApi } from '@/lib/api/reports.api';
import { useFunds }   from '@/hooks/useFunds';
import { useOrgStore } from '@/store/orgStore';
import { useUiStore }  from '@/store/uiStore';
import { Select }     from '@/components/ui/Select';
import { Button }     from '@/components/ui/Button';
import { Badge }      from '@/components/ui/Badge';
import { CardSkeleton } from '@/components/ui/Spinner';
import { EmptyState }   from '@/components/ui/EmptyState';
import { formatNairaCompact, recentPeriods } from '@/lib/format';
import useSWR from 'swr';

/**
 * app/dashboard/reports/page.tsx — Giving report + CSV download.
 * GET /orgs/:orgId/reports/giving?period=...&format=csv
 */

function getPeriodOptions() {
  return [{ value: '', label: 'All time (this year)' }, ...recentPeriods(12)];
}

export default function ReportsPage() {
  const org            = useOrgStore();
  const { activePeriod } = useUiStore();
  const { activeFunds }  = useFunds();

  const [period,     setPeriod]     = useState(activePeriod);
  const [fundFilter, setFundFilter] = useState('');

  const orgId = org.orgId ?? '';

  const { data: report, isLoading } = useSWR(
    orgId ? ['reports/giving', orgId, period, fundFilter] : null,
    () => reportsApi.givingReport(orgId, {
      period:       period || undefined,
      fund_type_id: fundFilter || undefined,
    }),
    { revalidateOnFocus: false },
  );

  const handleDownload = async () => {
    try {
      await reportsApi.downloadGiving(orgId, period || undefined, fundFilter || undefined);
    } catch {
      // download errors surface via the button state; nothing else to do
    }
  };

  const periodOptions = getPeriodOptions();
  const fundOptions   = [
    { value: '', label: 'All funds' },
    ...activeFunds.map((f) => ({ value: f.id, label: f.name })),
  ];

  const DownloadIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M7 2v7M4 6l3 3 3-3M2 11h10" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100">Reports</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Giving reports and member deficit analysis
          </p>
        </div>
        <Button size="sm" variant="outline" icon={<DownloadIcon />} onClick={handleDownload}>
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="w-48">
          <Select options={periodOptions} value={period} onChange={setPeriod} />
        </div>
        <div className="w-44">
          <Select options={fundOptions} value={fundFilter} onChange={setFundFilter} placeholder="All funds" />
        </div>
      </div>

      {/* Summary card */}
      {report && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total collected', value: formatNairaCompact(
                report.fund_totals.reduce((s, f) => s + Number(f.total_collected), 0)
              ), color: 'text-green-700 dark:text-green-400' },
            { label: 'Total paid out', value: formatNairaCompact(
                report.fund_totals.reduce((s, f) => s + Number(f.total_paid_out), 0)
              ), color: 'text-blue-700 dark:text-blue-400' },
            { label: 'Members with deficit', value: String(report.arrears_summary.members_with_deficit),
              color: 'text-amber-700 dark:text-amber-400' },
            { label: 'Total deficit', value: formatNairaCompact(Number(report.arrears_summary.total_deficit_kobo)),
              color: 'text-red-600 dark:text-red-400' },
          ].map((m) => (
            <div key={m.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{m.label}</p>
              <p className={`text-xl font-medium tracking-tight ${m.color}`}>{m.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Fund breakdown table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">Fund breakdown</h2>
          <Link href="/dashboard/reports/arrears">
            <Button variant="ghost" size="xs">View arrears →</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-2">{[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}</div>
        ) : !report?.fund_totals?.length ? (
          <EmptyState title="No data" message="No transactions found for this period." compact className="py-8" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  {['Fund', 'Period', 'Collected', 'Paid out', 'Members', 'Transactions'].map((h) => (
                    <th key={h} className="text-left text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider py-2.5 px-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {report.fund_totals.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 px-4 text-xs font-medium text-gray-800 dark:text-gray-200">{row.fund_name}</td>
                    <td className="py-3 px-4 text-xs text-gray-500">{row.period_display ?? row.period_month}</td>
                    <td className="py-3 px-4 text-xs font-mono font-medium text-green-700 dark:text-green-400">
                      {row.collected_display ?? formatNairaCompact(Number(row.total_collected))}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-gray-500">
                      {formatNairaCompact(Number(row.total_paid_out))}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500">{row.member_count}</td>
                    <td className="py-3 px-4 text-xs text-gray-500">{row.tx_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}