'use client';
import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useVirtualAccount }    from '@/hooks/useVirtualAccount';
import { useMemberFunds }       from '@/hooks/useFunds';
import { VirtualAccountDisplay } from '@/components/member/VirtualAccountDisplay';
import { PageLoader }           from '@/components/ui/Spinner';
import Link                     from 'next/link';
import { cn }                   from '@/lib/cn';

/**
 * app/portal/funds/[fundId]/page.tsx — Get/create a VA for a fund.
 *
 * Core UX moment: member taps Tithe card → lands here → NUBAN reveals → copies → pays.
 * Auto-triggers VA creation on mount. Celebrates new VAs with an animation burst.
 */

const FUND_COLORS: Record<string, string> = {
  tithe:    'from-green-600 to-green-700',
  offering: 'from-blue-600 to-blue-700',
  building: 'from-amber-600 to-amber-700',
  pastor:   'from-purple-600 to-purple-700',
  mission:  'from-teal-600 to-teal-700',
  welfare:  'from-rose-600 to-rose-700',
  youth:    'from-orange-500 to-orange-600',
};

function getFundGradient(name: string): string {
  const key = Object.keys(FUND_COLORS).find((k) => name.toLowerCase().includes(k));
  return key ? FUND_COLORS[key] : 'from-green-600 to-green-700';
}

const ConfettiPiece = ({ delay, x, color }: { delay: number; x: number; color: string }) => (
  <div
    className="absolute top-0 w-1.5 h-3 rounded-sm pointer-events-none"
    style={{
      left:             `${x}%`,
      backgroundColor:  color,
      animation:        `confetti-fall 1.2s ease-out ${delay}ms both`,
    }}
    aria-hidden="true"
  />
);

const CONFETTI_COLORS = ['#16a34a', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

export default function FundAccountPage() {
  const params  = useParams();
  const fundId  = params.fundId as string;

  const { getFundById, isLoading: fundsLoading } = useMemberFunds();
  const { va, creating, error, create } = useVirtualAccount(fundId);

  const fund     = getFundById(fundId);
  const gradient = fund ? getFundGradient(fund.name) : 'from-green-600 to-green-700';

  const sharedVaReady = !!(fund?.is_shared_va && fund?.shared_va_number);

  const displayVa = sharedVaReady
    ? {
        va_number:         fund!.shared_va_number!,
        bank_name:         fund!.shared_va_bank ?? '',
        account_reference: '',
        is_new:            false,
        instructions:      `Transfer to ${fund!.shared_va_number} (${fund!.shared_va_bank})`,
      }
    : va ?? undefined;

  // Confetti celebration for newly created VAs
  const [showCelebration, setShowCelebration] = useState(false);
  const confettiPieces = useMemo(
    () => Array.from({ length: 18 }, (_, i) => ({
      delay: i * 55,
      x:     5 + (i * 5.5),
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    })),
    [],
  );

  useEffect(() => {
    if (!fund || sharedVaReady) return;
    if (fundId && !va && !creating) create();
  }, [fundId, sharedVaReady, fund?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Trigger confetti when a NEW VA is revealed
  useEffect(() => {
    if (va?.is_new) {
      setShowCelebration(true);
      const t = setTimeout(() => setShowCelebration(false), 1600);
      return () => clearTimeout(t);
    }
  }, [va?.is_new]);

  if (fundsLoading) return <PageLoader message="Loading fund details…" />;

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Back nav */}
      <Link
        href="/portal"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M10 4L6 8l4 4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back
      </Link>

      {/* Fund header card */}
      <div className={cn('relative rounded-2xl bg-linear-to-br p-5 text-white overflow-hidden shadow-lg', gradient)}>
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top right, white, transparent 60%)' }}
          aria-hidden="true"
        />

        {/* Confetti burst */}
        {showCelebration && (
          <div className="absolute inset-x-0 top-0 h-full overflow-hidden pointer-events-none" aria-hidden="true">
            {confettiPieces.map((p, i) => (
              <ConfettiPiece key={i} {...p} />
            ))}
          </div>
        )}

        <div className="relative">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60 mb-1">
            {fund?.kind === 'CAMPAIGN' ? 'Campaign fund' : fund?.is_shared_va ? 'Shared account' : 'Recurring giving'}
          </p>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {fund?.name ?? 'Fund account'}
          </h1>
          {!fund?.is_shared_va && fund?.expected_amt_kobo && (
            <p className="text-sm text-white/70 mt-1">
              Monthly pledge · ₦{(Number(fund.expected_amt_kobo) / 100).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* VA display */}
      <VirtualAccountDisplay
        va={displayVa}
        fundName={fund?.name}
        isShared={fund?.is_shared_va}
        loading={!sharedVaReady && creating}
        error={!sharedVaReady ? (error ?? undefined) : undefined}
        onRetry={!sharedVaReady ? create : undefined}
      />

      {/* Campaign expiry warning */}
      {fund?.kind === 'CAMPAIGN' && fund.expires_at && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3.5 text-xs text-amber-700 dark:text-amber-300">
          ⏰ This campaign ends on{' '}
          <strong>
            {new Date(fund.expires_at).toLocaleDateString('en-NG', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </strong>.
          Transfer before the deadline to count this period's contribution.
        </div>
      )}
    </div>
  );
}
