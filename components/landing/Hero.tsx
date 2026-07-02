'use client';
import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';

const ArrowIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M2 7h10M7 2l5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ── Animated receipt card ─────────────────────────────────────────────────────

const ReceiptCard: React.FC = () => {
  const [stage, setStage] = React.useState(0);

  React.useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 400);
    const t2 = setTimeout(() => setStage(2), 1000);
    const t3 = setTimeout(() => setStage(3), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="relative w-full max-w-sm mx-auto animate-scale-in delay-300">
      {/* Glow shadow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-30 blur-2xl"
        style={{ background: 'radial-gradient(ellipse, rgba(22,163,74,.4) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      {/* Stacked shadow card */}
      <div
        className="absolute top-4 left-4 right-0 bottom-0 rounded-2xl border border-green-100 dark:border-green-900/40 bg-green-50/30 dark:bg-green-950/20"
        aria-hidden="true"
      />

      {/* Main receipt card */}
      <div
        className={cn(
          'relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-xl shadow-black/5',
          'transition-all duration-700 ease-out',
          stage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
        )}
      >
        {/* Live notification pill */}
        <div
          className={cn(
            'absolute -top-4 right-5 flex items-center gap-1.5 px-3 py-1.5',
            'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full shadow-md',
            'text-xs font-medium text-gray-700 dark:text-gray-300',
            'transition-all duration-500 ease-out',
            stage >= 2 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-3 scale-95',
          )}
          aria-live="polite"
        >
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" aria-hidden="true" />
          ₦50,000 tithe received · just now
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Grace Bible Church</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Bro. Adebayo · CHR-00142</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 dark:text-gray-500">Jul 2, 2026</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">10:42 AM</p>
          </div>
        </div>

        {/* Dedicated account box */}
        <div className="bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-950/60 dark:to-emerald-950/40 rounded-xl p-4 mb-4 border border-green-100 dark:border-green-900/40">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-green-700 dark:text-green-400 mb-1.5">
            Dedicated account · Tithe fund
          </p>
          <p className="text-2xl font-medium tracking-[0.15em] text-green-800 dark:text-green-300 font-mono">
            0123 456 789
          </p>
          <p className="text-xs text-green-600 dark:text-green-500 mt-1">Providus Bank</p>
        </div>

        <hr className="border-dashed border-gray-100 dark:border-gray-800 mb-4" />

        {/* Fund breakdown */}
        <div className="space-y-2 mb-4">
          {[
            { label: 'Tithe — July 2026',      amt: '₦50,000', done: true },
            { label: 'Building fund pledge',   amt: '₦30,000', done: true },
            { label: 'Mission offering',       amt: '₦5,000',  done: stage >= 3 },
          ].map(({ label, amt, done }) => (
            <div
              key={label}
              className={cn(
                'flex justify-between items-center text-xs py-0.5 transition-all duration-500',
                done ? 'text-gray-600 dark:text-gray-400' : 'text-gray-300 dark:text-gray-700',
              )}
            >
              <span>{label}</span>
              <span className="font-mono font-medium">{amt}</span>
            </div>
          ))}
        </div>

        <hr className="border-dashed border-gray-100 dark:border-gray-800 mb-3" />

        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Total this month</span>
          <span className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100">₦85,000</span>
        </div>

        {/* Reconciled badge */}
        <div
          className={cn(
            'flex items-center gap-1.5 mt-3 text-xs text-green-600 dark:text-green-400 font-medium',
            'transition-all duration-500 delay-200',
            stage >= 2 ? 'opacity-100' : 'opacity-0',
          )}
        >
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M2 7l3.5 3.5 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          All funds reconciled automatically
        </div>
      </div>

      {/* Floating badges */}
      <div
        className={cn(
          'absolute -bottom-3 -left-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-3 py-2 shadow-md',
          'text-xs font-medium text-gray-700 dark:text-gray-300',
          'transition-all duration-500 ease-out',
          stage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3',
        )}
        aria-hidden="true"
      >
        <span className="text-green-600 font-semibold">↑ 12%</span> vs last month
      </div>
    </div>
  );
};

// ── Stats strip with counter animation ───────────────────────────────────────

const stats = [
  { num: '₦0',     label: 'to get started' },
  { num: '<2 min', label: 'member onboarding' },
  { num: 'Auto',   label: 'reconciliation' },
  { num: 'M‑of‑N', label: 'payout governance' },
];

// ── Hero ──────────────────────────────────────────────────────────────────────

export const Hero: React.FC = () => (
  <section className="relative overflow-hidden pt-2">
    {/* Background blobs */}
    <div
      className="hero-blob hero-blob-green"
      style={{ width: '700px', height: '500px', top: '-100px', left: '50%', transform: 'translateX(-30%)' }}
      aria-hidden="true"
    />
    <div
      className="hero-blob hero-blob-teal"
      style={{ width: '400px', height: '400px', top: '200px', left: '-100px' }}
      aria-hidden="true"
    />

    <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pt-14 pb-12 sm:pt-20 sm:pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

        {/* Left: copy */}
        <div className="order-2 lg:order-1">

          {/* Pill badge */}
          <div className="animate-fade-up delay-100">
            <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-950/60 text-green-700 dark:text-green-400 text-xs font-semibold px-3.5 py-1.5 rounded-full border border-green-100 dark:border-green-900/50 mb-6 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" aria-hidden="true" />
              Built on Nomba virtual accounts · Nigeria
            </div>
          </div>

          {/* Headline */}
          <div className="animate-fade-up delay-150">
            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-semibold tracking-[-2px] leading-[1.05] mb-5 text-gray-900 dark:text-gray-100">
              Church treasury{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-green-700 dark:text-green-400">built different</span>
                <span
                  className="absolute bottom-1 left-0 right-0 h-3 bg-green-100 dark:bg-green-900/40 rounded-sm z-0"
                  aria-hidden="true"
                />
              </span>
            </h1>
          </div>

          {/* Subheadline */}
          <div className="animate-fade-up delay-200">
            <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-8 max-w-md">
              Every member gets a <strong className="text-gray-700 dark:text-gray-300 font-medium">dedicated bank account number</strong>.
              Every naira reconciles automatically. No spreadsheets, no confusion, no Sunday stress.
            </p>
          </div>

          {/* CTAs */}
          <div className="animate-fade-up delay-300 flex flex-wrap items-center gap-3 mb-10">
            <Link href="/register">
              <button className="group inline-flex items-center gap-2 px-5 py-3 bg-green-700 hover:bg-green-800 active:bg-green-900 text-white text-sm font-semibold rounded-xl transition-all duration-150 shadow-md shadow-green-900/20 hover:shadow-lg hover:shadow-green-900/25 hover:-translate-y-0.5">
                Register your church
                <ArrowIcon />
              </button>
            </Link>
            <Link
              href="#how"
              className="inline-flex items-center gap-2 px-4 py-3 border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-150"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M7 3v8M3 7l4 4 4-4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              See how it works
            </Link>
          </div>

          {/* Stats strip */}
          <div className="animate-fade-up delay-400">
            <div className="flex flex-wrap gap-0 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm">
              {stats.map(({ num, label }, i) => (
                <div
                  key={num}
                  className={cn(
                    'flex-1 min-w-22.5 px-4 py-3.5 text-center',
                    i > 0 && 'border-l border-gray-100 dark:border-gray-800',
                  )}
                >
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-tight">{num}</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: receipt card */}
        <div className="order-1 lg:order-2 flex justify-center">
          <ReceiptCard />
        </div>

      </div>
    </div>
  </section>
);
