'use client';
import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { HeroCanvas } from './HeroCanvas';
import { TiltCard } from './TiltCard';

const ArrowIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M2 7h10M7 2l5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ── Word-by-word rising headline ──────────────────────────────────────────────

const RisingWords: React.FC<{ words: string[]; startDelay?: number; accentFrom?: number }> = ({
  words,
  startDelay = 150,
  accentFrom = Infinity,
}) => (
  <>
    {words.map((word, i) => (
      <span key={`${word}-${i}`} className="word-mask">
        <span
          className={cn('word-rise', i >= accentFrom && 'text-gradient-green')}
          style={{ animationDelay: `${startDelay + i * 90}ms` }}
        >
          {word}
        </span>
        {i < words.length - 1 && <span>&nbsp;</span>}
      </span>
    ))}
  </>
);

// ── Animated receipt card (centered, 3D-tilted) ───────────────────────────────

const ReceiptCard: React.FC = () => {
  const [stage, setStage] = React.useState(0);

  React.useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 500);
    const t2 = setTimeout(() => setStage(2), 1200);
    const t3 = setTimeout(() => setStage(3), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="relative w-full max-w-sm mx-auto animate-scale-in delay-500 perspective-1200">
      {/* Glow shadow */}
      <div
        className="absolute -inset-8 rounded-[2rem] opacity-40 blur-3xl animate-ring-pulse"
        style={{ background: 'radial-gradient(ellipse, rgba(22,163,74,.35) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      {/* Floating chip — live notification */}
      <div
        className={cn(
          'absolute -top-5 -right-3 sm:-right-10 z-30 flex items-center gap-1.5 px-3 py-1.5',
          'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full shadow-lg shadow-green-900/10',
          'text-xs font-medium text-gray-700 dark:text-gray-300',
          'transition-all duration-500 ease-out animate-float-3d-a',
          stage >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-90',
        )}
        aria-live="polite"
      >
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" aria-hidden="true" />
        ₦50,000 tithe received · just now
      </div>

      {/* Floating chip — trend */}
      <div
        className={cn(
          'absolute -bottom-4 -left-3 sm:-left-12 z-30 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-3 py-2 shadow-lg shadow-green-900/10',
          'text-xs font-medium text-gray-700 dark:text-gray-300',
          'transition-all duration-500 ease-out animate-float-3d-b',
          stage >= 3 ? 'opacity-100' : 'opacity-0',
        )}
        aria-hidden="true"
      >
        <span className="text-green-600 font-semibold">↑ 12%</span> vs last month
      </div>

      {/* Floating chip — auto reconcile */}
      <div
        className={cn(
          'absolute top-1/3 -right-4 sm:-right-16 z-30 hidden sm:flex items-center gap-1.5 px-2.5 py-1.5',
          'bg-green-700 text-white rounded-lg shadow-lg shadow-green-900/25 text-[11px] font-semibold',
          'transition-all duration-500 ease-out animate-float-3d-c',
          stage >= 3 ? 'opacity-100' : 'opacity-0',
        )}
        aria-hidden="true"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2">
          <path d="M2 6l2.5 2.5 5.5-5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Auto-matched
      </div>

      <TiltCard className="rounded-2xl" max={9}>
        {/* Main receipt card */}
        <div
          className={cn(
            'relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-2xl shadow-green-900/10 text-left',
            'transition-all duration-700 ease-out',
            stage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
          )}
        >
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
              { label: 'Tithe — July 2026',    amt: '₦50,000', done: true },
              { label: 'Building fund pledge', amt: '₦30,000', done: true },
              { label: 'Mission offering',     amt: '₦5,000',  done: stage >= 3 },
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
      </TiltCard>
    </div>
  );
};

// ── Stats strip ───────────────────────────────────────────────────────────────

const stats = [
  { num: '₦0',     label: 'to get started' },
  { num: '<2 min', label: 'member onboarding' },
  { num: 'Auto',   label: 'reconciliation' },
  { num: 'M‑of‑N', label: 'payout governance' },
];

// ── Bank marquee ──────────────────────────────────────────────────────────────

const banks = [
  'GTBank', 'Access Bank', 'Zenith', 'UBA', 'First Bank', 'Kuda',
  'OPay', 'Moniepoint', 'PalmPay', 'Providus', 'Stanbic IBTC', 'Fidelity',
];

const BankMarquee: React.FC = () => (
  <div className="marquee-mask w-full animate-fade-up delay-800" aria-hidden="true">
    <div className="marquee-track items-center gap-10 py-1">
      {[...banks, ...banks].map((bank, i) => (
        <span
          key={`${bank}-${i}`}
          className="flex items-center gap-10 text-sm font-semibold tracking-tight text-gray-300 dark:text-gray-600 whitespace-nowrap select-none"
        >
          {bank}
          <span className="w-1 h-1 rounded-full bg-green-300 dark:bg-green-800 shrink-0" />
        </span>
      ))}
    </div>
  </div>
);

// ── Hero ──────────────────────────────────────────────────────────────────────

export const Hero: React.FC = () => (
  <section className="relative overflow-hidden">
    {/* 3D scene layers */}
    <div className="hero-aurora" aria-hidden="true" />
    <div className="hero-floor" aria-hidden="true" />
    <HeroCanvas />

    <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 pt-16 pb-10 sm:pt-24 sm:pb-14 flex flex-col items-center text-center">

      {/* Pill badge */}
      <div className="animate-fade-up delay-100">
        <div className="inline-flex items-center gap-2 bg-green-50/90 dark:bg-green-950/60 text-green-700 dark:text-green-400 text-xs font-semibold px-3.5 py-1.5 rounded-full border border-green-100 dark:border-green-900/50 mb-7 shadow-sm backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" aria-hidden="true" />
          Built on Nomba virtual accounts · Nigeria
        </div>
      </div>

      {/* Headline — words rise one by one */}
      <h1 className="text-[44px] sm:text-6xl lg:text-[68px] font-semibold tracking-[-2.5px] leading-[1.04] mb-6 text-gray-900 dark:text-gray-100">
        <RisingWords words={['Church', 'treasury']} startDelay={200} />
        <br />
        <RisingWords words={['built', 'different']} startDelay={420} accentFrom={0} />
      </h1>

      {/* Subheadline */}
      <div className="animate-fade-up delay-500">
        <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-9 max-w-lg mx-auto">
          Every member gets a <strong className="text-gray-700 dark:text-gray-300 font-medium">dedicated bank account number</strong>.
          Every naira reconciles automatically. No spreadsheets, no confusion, no Sunday stress.
        </p>
      </div>

      {/* CTAs */}
      <div className="animate-fade-up delay-600 flex flex-wrap items-center justify-center gap-3 mb-14">
        <Link href="/register">
          <button className="btn-shine group inline-flex items-center gap-2 px-6 py-3.5 bg-green-700 hover:bg-green-800 active:bg-green-900 text-white text-sm font-semibold rounded-xl transition-all duration-150 shadow-lg shadow-green-900/25 hover:shadow-xl hover:shadow-green-900/30 hover:-translate-y-0.5">
            Register your church
            <span className="transition-transform duration-200 group-hover:translate-x-0.5"><ArrowIcon /></span>
          </button>
        </Link>
        <a
          href="#how"
          className="inline-flex items-center gap-2 px-5 py-3.5 border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm text-sm text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-150"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M7 3v8M3 7l4 4 4-4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          See how it works
        </a>
      </div>

      {/* Receipt card — centered, 3D-tilted */}
      <ReceiptCard />

      {/* Stats strip */}
      <div className="animate-fade-up delay-700 w-full max-w-xl mt-14 mb-10">
        <div className="flex flex-wrap gap-0 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm shadow-soft">
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

      {/* Bank marquee */}
      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3 animate-fade-up delay-800">
        Members transfer from any Nigerian bank
      </p>
      <BankMarquee />
    </div>
  </section>
);
