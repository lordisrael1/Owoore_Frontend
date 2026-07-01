'use client';
import * as React from 'react';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';

const funds = [
  { name: 'Tithe',              pct: 84, amt: '₦4.2M',  color: 'green'  as const },
  { name: 'Building fund',      pct: 93, amt: '₦18.7M', color: 'blue'   as const },
  { name: 'Offering',          pct: 100, amt: '₦1.4M',  color: 'green'  as const },
  { name: 'Pastor appreciation', pct: 73, amt: '₦1.1M', color: 'amber'  as const },
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

export const FeatureReconciliation: React.FC = () => (
  <section className="border-t border-gray-100 dark:border-gray-800 py-20" id="product">
    <div className="max-w-6xl mx-auto px-5 sm:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

        {/* Left: copy */}
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-green-700 dark:text-green-400 mb-3">
            Reconciliation engine
          </p>
          <h2 className="text-2xl font-medium tracking-tight text-gray-900 dark:text-gray-100 mb-4 leading-snug">
            Know who paid, who owes — without lifting a finger
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

        {/* Right: fund bars panel */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-medium text-gray-900 dark:text-gray-100">June 2026 — fund collection</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Grace Bible Church</p>
            </div>
            <Badge status="PAID" dot>All reconciled</Badge>
          </div>

          <div className="space-y-4">
            {funds.map((f) => (
              <ProgressBar
                key={f.name}
                value={f.pct}
                label={f.name}
                sublabel={`${f.pct}% · ${f.amt}`}
                color={f.color}
                size="sm"
                showPercent={false}
                animate
              />
            ))}
          </div>

          <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-400 dark:text-gray-500">3 members with deficit</p>
            <button className="text-xs text-green-700 dark:text-green-400 font-medium hover:underline">
              View all →
            </button>
          </div>
        </div>

      </div>
    </div>
  </section>
);