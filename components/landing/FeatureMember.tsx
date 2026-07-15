'use client';
import * as React from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { cn } from '@/lib/cn';
import { TiltCard } from './TiltCard';

const checks = [
  'Email OTP — no password to forget',
  'Same account number every visit — save as bank beneficiary',
  'Email confirmation on every payment received',
  'Anonymous giving option — no registration needed',
];

const CheckIcon = () => (
  <svg className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M3 8l3.5 3.5 6.5-7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CopyIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <rect x="4" y="4" width="8" height="8" rx="1"/>
    <path d="M2 10V3a1 1 0 011-1h7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AccountReveal: React.FC = () => {
  const [copied, setCopied] = React.useState(false);
  const [revealed, setRevealed] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 600);
    return () => clearTimeout(t);
  }, []);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-all duration-700',
        revealed
          ? 'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800/50'
          : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700',
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest text-green-700 dark:text-green-400 mb-2">
        Your Tithe account
      </p>
      <div className="flex items-center justify-between">
        <div>
          <p className={cn(
            'text-xl font-mono font-medium tracking-[0.12em] transition-all duration-700',
            revealed ? 'text-green-800 dark:text-green-300' : 'text-gray-300 dark:text-gray-700 blur-sm',
          )}>
            0123 456 789
          </p>
          <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">Providus Bank</p>
        </div>
        <button
          onClick={handleCopy}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
            copied
              ? 'bg-green-600 text-white'
              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-green-300 hover:text-green-700',
          )}
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 animate-tick" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M2 7l3.5 3.5 7-6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Copied!
            </>
          ) : (
            <>
              <CopyIcon />
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export const FeatureMember: React.FC = () => {
  const leftRef  = useScrollReveal<HTMLDivElement>(0.15);
  const rightRef = useScrollReveal<HTMLDivElement>(0.1);

  return (
    <section className="border-t border-gray-100 dark:border-gray-800 py-20 sm:py-28">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left: copy */}
          <div ref={leftRef} className="reveal-left">
            <p className="text-xs font-semibold uppercase tracking-widest text-green-700 dark:text-green-400 mb-3">
              Member experience
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 mb-4 leading-snug">
              Zero friction.{' '}
              <span className="text-green-700 dark:text-green-400">Works on any ₦30k Android.</span>
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
              Members tap a WhatsApp link, verify their email, and get a permanent
              NUBAN — same account every time. No app download. No password.
              Works from any bank in Nigeria.
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

          {/* Right: browser mock */}
          <div ref={rightRef} className="reveal-right">
          <TiltCard className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-xl shadow-black/5">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" aria-hidden="true"/>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" aria-hidden="true"/>
              <span className="w-2.5 h-2.5 rounded-full bg-green-400" aria-hidden="true"/>
              <span className="flex-1 text-center text-[10px] text-gray-400 font-mono bg-white dark:bg-gray-900 rounded-md px-2 py-1 mx-2">
                owoore.ng/join/grace-bible-church
              </span>
            </div>

            {/* Content */}
            <div className="p-5">
              {/* Church header */}
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-50 dark:border-gray-800">
                <div className="w-9 h-9 rounded-xl bg-green-700 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M8 1.5a.75.75 0 01.75.75V4h1.5a.75.75 0 010 1.5H8.75V8h2.5a.75.75 0 01.75.75V14a.5.5 0 01-.5.5h-7a.5.5 0 01-.5-.5V8.75A.75.75 0 014.75 8h2.5V5.5H5.75a.75.75 0 010-1.5h1.5V2.25A.75.75 0 018 1.5z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Grace Bible Church</h3>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">Select a fund to get your account number</p>
                </div>
              </div>

              {/* Fund cards */}
              <div className="space-y-2 mb-4">
                {[
                  { name: 'Tithe',    icon: '♥', sub: 'Monthly · No fixed amount', color: 'text-red-400' },
                  { name: 'Offering', icon: '🎁', sub: 'Open giving' },
                ].map((fund) => (
                  <button
                    key={fund.name}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-green-200 dark:hover:border-green-800 transition-colors bg-white dark:bg-gray-900 text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-950/50 flex items-center justify-center text-base">
                        {fund.icon}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">{fund.name}</p>
                        <p className="text-[10px] text-gray-400">{fund.sub}</p>
                      </div>
                    </div>
                    <svg className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <path d="M5 3.5l4 4.5-4 4.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                ))}
              </div>

              {/* Account reveal */}
              <AccountReveal />
            </div>
          </TiltCard>
          </div>

        </div>
      </div>
    </section>
  );
};
