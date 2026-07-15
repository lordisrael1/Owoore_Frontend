'use client';
import * as React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { TiltCard } from './TiltCard';

const signatories = [
  { name: 'Pastor Emmanuel', role: 'Senior Pastor',  status: 'APPROVED' as const, delay: 0 },
  { name: 'Deacon Chukwu',   role: 'Board Deacon',   status: 'APPROVED' as const, delay: 400 },
  { name: 'Elder Ngozi',     role: 'Church Elder',   status: 'PENDING'  as const, delay: 800 },
];

const checks = [
  'Multi-signatory email approval — Pastor, Deacon, Elder',
  'Any one decline immediately kills the request',
  'Immutable audit trail — every action timestamped',
  'Auto-sweep to church bank account on quorum',
];

const CheckIcon = () => (
  <svg className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M3 8l3.5 3.5 6.5-7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const FeatureGovernance: React.FC = () => {
  const leftRef  = useScrollReveal<HTMLDivElement>(0.1);
  const rightRef = useScrollReveal<HTMLDivElement>(0.1);
  const [visible, setVisible] = React.useState(false);

  // Trigger signatory animation when card enters view
  React.useEffect(() => {
    const el = leftRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="border-t border-gray-100 dark:border-gray-800 py-20 sm:py-28" id="for-churches">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left: approval card */}
          <div ref={leftRef} className="reveal-left order-2 lg:order-1">
          <TiltCard className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-xl shadow-black/5">
            {/* Header */}
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Payout approval</p>
              <Badge status="PENDING" dot>Awaiting quorum</Badge>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
              Building fund → GTBank · Grace Bible Church
            </p>

            {/* Amount */}
            <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight mb-2">
              ₦500,000
            </p>

            {/* Destination */}
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2.5 mb-5 text-xs text-gray-500 dark:text-gray-400">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <rect x="1" y="3" width="12" height="8" rx="1.5"/>
                <path d="M1 6h12" strokeLinecap="round"/>
              </svg>
              GTBank · Grace Bible Church · *6789 · Roof contractor payment
            </div>

            {/* Signatories — animate in sequence */}
            <div className="space-y-3 mb-5">
              {signatories.map((s, i) => (
                <div
                  key={s.name}
                  className="flex items-center justify-between transition-all duration-500"
                  style={{
                    opacity:   visible ? 1 : 0,
                    transform: visible ? 'translateX(0)' : 'translateX(-12px)',
                    transitionDelay: visible ? `${s.delay}ms` : '0ms',
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <Avatar name={s.name} size="sm" />
                      {s.status === 'APPROVED' && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-900 flex items-center justify-center">
                          <svg className="w-1.5 h-1.5 text-white" fill="none" viewBox="0 0 6 6" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M1 3l1.5 1.5 3-3" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{s.name}</p>
                      <p className="text-[10px] text-gray-400">{s.role}</p>
                    </div>
                  </div>
                  <Badge status={s.status} size="xs" />
                </div>
              ))}
            </div>

            {/* Progress */}
            <ProgressBar value={66} label="" color="green" size="xs" animate />
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5 mb-4">
              2 of 3 approvals · transfer fires automatically on quorum
            </p>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button className="py-2.5 rounded-xl bg-green-700 text-white text-xs font-semibold hover:bg-green-800 transition-colors shadow-sm shadow-green-900/20">
                Approve transfer
              </button>
              <button className="py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Decline
              </button>
            </div>
          </TiltCard>
          </div>

          {/* Right: copy */}
          <div ref={rightRef} className="reveal-right order-1 lg:order-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-green-700 dark:text-green-400 mb-3">
              Treasury governance
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 mb-4 leading-snug">
              No single person controls the money.{' '}
              <span className="text-green-700 dark:text-green-400">By design.</span>
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
              Nigerian churches have faced treasurer fraud. Owoore encodes financial
              governance into software — payouts above your threshold require M-of-N
              signatory approval before a single naira moves.
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

        </div>
      </div>
    </section>
  );
};
