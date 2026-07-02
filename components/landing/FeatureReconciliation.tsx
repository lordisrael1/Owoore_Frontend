'use client';
import * as React from 'react';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { useScrollReveal, useStaggerReveal } from '@/hooks/useScrollReveal';

const funds = [
  { name: 'Tithe',               pct: 84,  amt: '₦4.2M',  color: 'green'  as const },
  { name: 'Building fund',       pct: 93,  amt: '₦18.7M', color: 'blue'   as const },
  { name: 'Offering',            pct: 100, amt: '₦1.4M',  color: 'green'  as const },
  { name: 'Pastor appreciation', pct: 73,  amt: '₦1.1M',  color: 'amber'  as const },
];

const checks = [
  'Underpayment and overpayment detected automatically',
  'Pledge progress tracked across campaigns',
  'Monthly and annual giving statements — CSV download',
  'Member deficit reminders sent automatically',
];

const CheckIcon = () => (
  <svg className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M3 8l3.5 3.5 6.5-7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const FeatureReconciliation: React.FC = () => {
  const leftRef  = useScrollReveal<HTMLDivElement>(0.15);
  const rightRef = useScrollReveal<HTMLDivElement>(0.1);

  return (
    <section className="border-t border-gray-100 dark:border-gray-800 py-20 sm:py-28" id="product">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left: copy */}
          <div ref={leftRef} className="reveal-left">
            <p className="text-xs font-semibold uppercase tracking-widest text-green-700 dark:text-green-400 mb-3">
              Reconciliation engine
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 mb-4 leading-snug">
              Know who paid, who owes —{' '}
              <span className="text-green-700 dark:text-green-400">without lifting a finger</span>
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
              No more comparing WhatsApp screenshots to bank statements. Every inbound
              transfer is matched to a member and fund the moment it lands.
            </p>
            <ul className="space-y-3">
              {checks.map((c) => (
                <li key={c} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                  <CheckIcon />
                  {c}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: live fund panel */}
          <div
            ref={rightRef}
            className="reveal-right bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-xl shadow-black/5"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">July 2026 — fund collection</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Grace Bible Church</p>
              </div>
              <Badge status="PAID" dot>All reconciled</Badge>
            </div>

            <div className="space-y-4">
              {funds.map((f, i) => (
                <div
                  key={f.name}
                  style={{ animationDelay: `${i * 120}ms` }}
                >
                  <ProgressBar
                    value={f.pct}
                    label={f.name}
                    sublabel={`${f.pct}% · ${f.amt}`}
                    color={f.color}
                    size="sm"
                    showPercent={false}
                    animate
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-50 dark:border-gray-800">
              <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" aria-hidden="true" />
                3 members with deficit
              </div>
              <button className="text-xs text-green-700 dark:text-green-400 font-medium hover:underline">
                View all →
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
