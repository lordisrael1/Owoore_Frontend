'use client';
import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';

const ArrowIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M2 7h10M7 2l5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PlayIcon = () => (
  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 14 14" aria-hidden="true">
    <path d="M3 2.5l9 4.5-9 4.5V2.5z"/>
  </svg>
);

// ── Animated receipt card ─────────────────────────────────────────────────────

const ReceiptCard: React.FC = () => {
  const [visible, setVisible] = React.useState(false);
  const [notifVisible, setNotifVisible] = React.useState(false);

  React.useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 300);
    const t2 = setTimeout(() => setNotifVisible(true), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Shadow card behind */}
      <div className="absolute top-3 left-3 right-0 bottom-0 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50" aria-hidden="true" />

      {/* Main receipt */}
      <div
        className={cn(
          'relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5',
          'transition-all duration-700 ease-out',
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        )}
      >
        {/* Notification pill */}
        <div
          className={cn(
            'absolute -top-3.5 right-4 flex items-center gap-1.5 px-3 py-1.5',
            'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full',
            'text-xs font-medium text-gray-700 dark:text-gray-300 shadow-sm',
            'transition-all duration-500 ease-out',
            notifVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2',
          )}
          aria-live="polite"
        >
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" aria-hidden="true" />
          ₦50,000 tithe received
        </div>

        {/* Receipt header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Grace Bible Church</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Bro. Adebayo · CHR-00142</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 dark:text-gray-500">Jun 27, 2026</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">10:42 AM</p>
          </div>
        </div>

        {/* VA box */}
        <div className="bg-green-50 dark:bg-green-950/50 rounded-xl p-3.5 mb-4 border border-green-100 dark:border-green-900/50">
          <p className="text-[10px] font-medium uppercase tracking-wide text-green-700 dark:text-green-400 mb-1">
            Dedicated account
          </p>
          <p className="text-lg font-medium tracking-[0.12em] text-green-800 dark:text-green-300 font-mono">
            0123 456 789
          </p>
          <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">Providus Bank · Tithe fund</p>
        </div>

        <hr className="border-dashed border-gray-200 dark:border-gray-700 mb-4" />

        {/* Line items */}
        {[
          ['Tithe — June 2026', '₦50,000'],
          ['Building fund pledge', '₦30,000'],
          ['Offering', '₦5,000'],
        ].map(([label, amt]) => (
          <div key={label} className="flex justify-between text-xs text-gray-500 dark:text-gray-400 py-1">
            <span>{label}</span>
            <span className="font-mono">{amt}</span>
          </div>
        ))}

        <hr className="border-dashed border-gray-200 dark:border-gray-700 my-3" />

        <div className="flex justify-between text-sm font-medium text-gray-900 dark:text-gray-100">
          <span>Total this month</span>
          <span className="font-mono">₦85,000</span>
        </div>

        {/* Status */}
        <div className="flex items-center gap-1.5 mt-3 text-xs text-green-600 dark:text-green-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" aria-hidden="true" />
          All funds reconciled automatically
        </div>
      </div>
    </div>
  );
};

// ── Hero ──────────────────────────────────────────────────────────────────────

export const Hero: React.FC = () => (
  <section className="relative overflow-hidden">
    {/* Subtle background glow */}
    <div
      className="absolute top-0 left-1/2 -translate-x-1/2 w-175 h-100 opacity-60 pointer-events-none"
      aria-hidden="true"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(15,110,86,.05) 0%, transparent 70%)',
      }}
    />

    <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-16 pb-12 sm:pt-24 sm:pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

        {/* Left: copy */}
        <div className="order-2 lg:order-1">
          {/* Chip */}
          <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-400 text-xs font-medium px-3 py-1.5 rounded-full border border-green-100 dark:border-green-900/50 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" aria-hidden="true" />
            Built on Nomba virtual accounts
          </div>

          <h1 className="text-4xl sm:text-5xl font-medium tracking-[-1.5px] leading-[1.1] mb-5 text-gray-900 dark:text-gray-100">
            Church treasury{' '}
            <span className="text-green-700 dark:text-green-400 relative">
              built different
              <span
                className="absolute bottom-0.5 left-0 right-0 h-0.5 bg-green-400 rounded-full"
                aria-hidden="true"
              />
            </span>
          </h1>

          <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed mb-8 max-w-md">
            Every member gets a dedicated bank account number. Every naira reconciles
            automatically. No spreadsheets, no confusion, no Sunday stress.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 mb-10">
            <Link href="/register">
              <button className="inline-flex items-center gap-2 px-5 py-3 bg-green-700 hover:bg-green-800 active:bg-green-900 text-white text-sm font-medium rounded-xl transition-colors">
                Register your church <ArrowIcon />
              </button>
            </Link>
            <button className="inline-flex items-center gap-2 px-4 py-3 border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <PlayIcon /> See how it works
            </button>
          </div>

          {/* Stats strip */}
          <div className="flex flex-wrap gap-0 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
            {[
              { num: '₦0',    label: 'to get started' },
              { num: '<2 min', label: 'member onboarding' },
              { num: 'Auto',  label: 'reconciliation' },
              { num: 'M-of-N',label: 'payout governance' },
            ].map(({ num, label }, i) => (
              <div
                key={num}
                className={cn(
                  'flex-1 min-w-22.5 px-4 py-3.5 text-center',
                  i > 0 && 'border-l border-gray-100 dark:border-gray-800',
                )}
              >
                <p className="text-base font-medium text-gray-900 dark:text-gray-100 tracking-tight">{num}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: receipt card */}
        <div className="order-1 lg:order-2">
          <ReceiptCard />
        </div>

      </div>
    </div>
  </section>
);