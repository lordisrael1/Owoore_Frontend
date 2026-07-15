'use client';
import * as React from 'react';
import { cn } from '@/lib/cn';
import { Card, CardHeader } from '@/components/ui/Card';
import { formatNaira, formatNairaCompact, formatPeriod, currentPeriod } from '@/lib/format';
import { reportsApi } from '@/lib/api/reports.api';
import { useOrgStore } from '@/store/orgStore';
import { useToast } from '@/components/ui/Toast';
import type { DashboardSummary } from '@/lib/api/dashboard.api';

interface CollectionChartProps {
  trend?:   DashboardSummary['trend'];
  loading?: boolean;
}

type TrendPoint = NonNullable<DashboardSummary['trend']>[number];

/**
 * CollectionChart — monthly collections, with a real export menu.
 *
 * The old version had a dead "Export CSV" button and rendered a single
 * full-width bar (a flat line) when an org had only one month of data.
 * This version:
 *   - shows the current month's total as the headline, with a month-over-
 *     month delta when there's history to compare against;
 *   - only draws the bar trend once there are ≥2 months, and centres a
 *     couple of bars instead of stretching one across the card;
 *   - exports data a church actually uses — detailed giving or a fund
 *     summary — scoped to this month or the whole year.
 */
export const CollectionChart: React.FC<CollectionChartProps> = ({
  trend,
  loading = false,
}) => {
  const org = useOrgStore();
  const { error } = useToast();

  const data: TrendPoint[] = trend ?? [];
  const hasData = data.length > 0;
  const multiMonth = data.length >= 2;

  const latest   = hasData ? data[data.length - 1] : null;
  const previous = data.length >= 2 ? data[data.length - 2] : null;

  const latestPeriod = latest?.period_month ?? currentPeriod();
  const latestKobo   = Number(latest?.total_collected_kobo ?? 0);
  const prevKobo     = Number(previous?.total_collected_kobo ?? 0);

  const momDelta = previous && prevKobo > 0
    ? ((latestKobo - prevKobo) / prevKobo) * 100
    : null;

  const ytdTotal = data.reduce((s, d) => s + Number(d.total_collected_kobo), 0);
  const maxVal   = Math.max(...data.map((d) => Number(d.total_collected_kobo)), 1);

  // ── Export menu ──────────────────────────────────────────────────────────
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [busy,     setBusy]     = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const monthLabel = formatPeriod(latestPeriod);
  const year       = Number(latestPeriod.slice(0, 4));

  const runExport = async (fn: () => Promise<void>) => {
    if (!org.orgId) { error('No church selected'); return; }
    setMenuOpen(false);
    setBusy(true);
    try {
      await fn();
    } catch (err: any) {
      error('Export failed', err?.message ?? 'Could not download the file.');
    } finally {
      setBusy(false);
    }
  };

  const exportOptions = [
    {
      label: `${monthLabel} — detailed giving`,
      desc:  'Every payment: who gave, to which fund, how much',
      run:   () => reportsApi.downloadGiving(org.orgId!, latestPeriod),
    },
    {
      label: `${monthLabel} — fund summary`,
      desc:  'Totals per fund for this month',
      run:   () => reportsApi.downloadFundSummary(org.orgId!, { period: latestPeriod }),
    },
    {
      label: `${year} — full-year summary`,
      desc:  'Every fund, every month, with a bottom-line total',
      run:   () => reportsApi.downloadFundSummary(org.orgId!, { year }),
    },
  ];

  const ExportMenu = (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setMenuOpen((o) => !o)}
        disabled={busy || !hasData}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        className={cn(
          'text-xs text-green-700 dark:text-green-400 flex items-center gap-1 hover:underline',
          'disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed',
        )}
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M6 2v5M4 5.5L6 7.5 8 5.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 9h8" strokeLinecap="round"/>
        </svg>
        {busy ? 'Exporting…' : 'Export CSV'}
      </button>

      {menuOpen && (
        <div
          role="menu"
          aria-label="Export options"
          className={cn(
            'absolute right-0 top-full mt-1.5 w-64 z-30 rounded-xl p-1',
            'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg',
          )}
        >
          {exportOptions.map((opt) => (
            <button
              key={opt.label}
              type="button"
              role="menuitem"
              onClick={() => runExport(opt.run)}
              className={cn(
                'w-full text-left rounded-lg px-3 py-2',
                'hover:bg-gray-50 dark:hover:bg-gray-800 focus:bg-gray-50 dark:focus:bg-gray-800',
                'focus:outline-none',
              )}
            >
              <span className="block text-xs font-medium text-gray-800 dark:text-gray-200">{opt.label}</span>
              <span className="block text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{opt.desc}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader
        title="Monthly collections"
        subtitle={multiMonth ? `Last ${data.length} months` : 'This month so far'}
        action={ExportMenu}
      />

      {loading ? (
        <div className="h-40 bg-gray-50 dark:bg-gray-800 rounded-xl animate-pulse" />
      ) : !hasData ? (
        <div className="h-40 flex flex-col items-center justify-center text-center gap-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">No collections yet</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Giving will appear here as members transfer to their accounts.
          </p>
        </div>
      ) : (
        <>
          {/* Headline — the number a pastor reads first */}
          <div className="flex items-end justify-between gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500">{monthLabel}</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight tabular-nums">
                {formatNaira(latestKobo)}
              </p>
            </div>
            {momDelta !== null && (
              <span className={cn(
                'inline-flex items-center gap-1 text-xs font-medium mb-1',
                momDelta >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400',
              )}>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  {momDelta >= 0
                    ? <path d="M2 8l3-3 2 2 3-4M10 3v3h-3" strokeLinecap="round" strokeLinejoin="round"/>
                    : <path d="M2 4l3 3 2-2 3 4M10 9V6h-3" strokeLinecap="round" strokeLinejoin="round"/>}
                </svg>
                {momDelta >= 0 ? '+' : ''}{momDelta.toFixed(1)}% vs {formatPeriod(previous!.period_month).split(' ')[0]}
              </span>
            )}
          </div>

          {/* Bar trend — only meaningful with ≥2 months */}
          {multiMonth ? (
            <div
              className="flex items-end justify-center gap-3 h-32 mb-3"
              role="img"
              aria-label={`Monthly collections over the last ${data.length} months`}
            >
              {data.map((d) => {
                const kobo    = Number(d.total_collected_kobo);
                const pct     = (kobo / maxVal) * 100;
                const isCurr  = d.period_month === latestPeriod;
                const label   = formatPeriod(d.period_month).split(' ')[0].slice(0, 3);

                return (
                  <div
                    key={d.period_month}
                    className="flex-1 max-w-14 flex flex-col items-center gap-1.5 group"
                    title={`${formatPeriod(d.period_month)}: ${formatNaira(kobo)}`}
                  >
                    <span className={cn(
                      'text-[9px] whitespace-nowrap transition-opacity',
                      isCurr ? 'text-gray-500 dark:text-gray-400 opacity-100'
                             : 'text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100',
                    )}>
                      {formatNairaCompact(kobo)}
                    </span>
                    <div className="w-full flex-1 flex items-end">
                      <div
                        className={cn(
                          'w-full rounded-t-lg transition-all duration-500 ease-out',
                          isCurr
                            ? 'bg-linear-to-t from-green-600 to-green-400'
                            : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700',
                        )}
                        style={{ height: `${Math.max(pct, 2)}%`, minHeight: '4px' }}
                      />
                    </div>
                    <span className={cn(
                      'text-[9px] font-semibold',
                      isCurr ? 'text-green-700 dark:text-green-400' : 'text-gray-400 dark:text-gray-500',
                    )}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
              A month-over-month trend appears here once you have a second month of giving.
            </p>
          )}

          {/* Footer — YTD */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-800">
            {multiMonth ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                  <span className="w-2 h-2 rounded-sm bg-linear-to-t from-green-600 to-green-400 shrink-0" aria-hidden="true" />
                  This month
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                  <span className="w-2 h-2 rounded-sm bg-gray-200 dark:bg-gray-700 shrink-0" aria-hidden="true" />
                  Earlier months
                </div>
              </div>
            ) : <span />}
            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
              {formatNairaCompact(ytdTotal)} in {year}
            </p>
          </div>
        </>
      )}
    </Card>
  );
};
