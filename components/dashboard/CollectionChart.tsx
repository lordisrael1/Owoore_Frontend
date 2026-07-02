'use client';
import * as React from 'react';
import { cn } from '@/lib/cn';
import { Card, CardHeader } from '@/components/ui/Card';
import { formatNairaCompact, formatPeriod } from '@/lib/format';
import type { DashboardSummary } from '@/lib/api/dashboard.api';

interface CollectionChartProps {
  trend?:   DashboardSummary['trend'];
  loading?: boolean;
}

const PLACEHOLDER = [
  { period_month: '2026-01', total_collected_kobo: 1800000000 },
  { period_month: '2026-02', total_collected_kobo: 1900000000 },
  { period_month: '2026-03', total_collected_kobo: 2100000000 },
  { period_month: '2026-04', total_collected_kobo: 2000000000 },
  { period_month: '2026-05', total_collected_kobo: 2100000000 },
  { period_month: '2026-06', total_collected_kobo: 2430000000 },
];

export const CollectionChart: React.FC<CollectionChartProps> = ({
  trend,
  loading = false,
}) => {
  const data   = trend ?? PLACEHOLDER;
  const maxVal = Math.max(...data.map((d) => d.total_collected_kobo), 1);
  const current = data[data.length - 1]?.period_month;

  const [animated, setAnimated] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setAnimated(true); obs.unobserve(el); } },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const ytdTotal = data.reduce((s, d) => s + d.total_collected_kobo, 0);

  return (
    <Card>
      <CardHeader
        title="Monthly collections"
        subtitle={`${data.length}-month trend`}
        action={
          <button className="text-xs text-green-700 dark:text-green-400 flex items-center gap-1 hover:underline">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M2 9V3.5L6 7l4-3.5V9" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1 10h10" strokeLinecap="round"/>
            </svg>
            Export CSV
          </button>
        }
      />

      {loading ? (
        <div className="h-36 bg-gray-50 dark:bg-gray-800 rounded-xl animate-pulse" />
      ) : (
        <>
          {/* Bar chart */}
          <div
            ref={ref}
            className="flex items-end gap-1.5 h-36 mb-3"
            role="img"
            aria-label="Monthly collection bar chart"
          >
            {data.map((d, i) => {
              const pct     = (d.total_collected_kobo / maxVal) * 100;
              const isCurr  = d.period_month === current;
              const label   = formatPeriod(d.period_month).split(' ')[0].slice(0, 3);
              const display = formatNairaCompact(d.total_collected_kobo);
              const animDelay = i * 60;

              return (
                <div
                  key={d.period_month}
                  className="flex-1 flex flex-col items-center gap-1.5 group"
                  title={`${formatPeriod(d.period_month)}: ${display}`}
                >
                  {/* Hover value label */}
                  <span className="text-[9px] text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {display}
                  </span>

                  {/* Bar */}
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className={cn(
                        'w-full rounded-t-lg transition-all ease-out',
                        isCurr
                          ? 'bg-linear-to-t from-green-600 to-green-400'
                          : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700',
                      )}
                      style={{
                        height:          animated ? `${pct}%` : '0%',
                        transitionDuration: '700ms',
                        transitionDelay: animated ? `${animDelay}ms` : '0ms',
                        minHeight:       animated && pct > 0 ? '4px' : '0',
                      }}
                      aria-label={`${formatPeriod(d.period_month)}: ${display}`}
                    />
                  </div>

                  {/* Month label */}
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

          {/* Legend + YTD */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-800">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                <span className="w-2 h-2 rounded-sm bg-linear-to-t from-green-600 to-green-400 shrink-0" aria-hidden="true" />
                Current month
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                <span className="w-2 h-2 rounded-sm bg-gray-200 dark:bg-gray-700 shrink-0" aria-hidden="true" />
                Previous months
              </div>
            </div>
            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
              {formatNairaCompact(ytdTotal)} YTD
            </p>
          </div>
        </>
      )}
    </Card>
  );
};
