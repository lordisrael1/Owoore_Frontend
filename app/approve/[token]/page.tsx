'use client';
import { useState, useEffect } from 'react';
import { useParams }        from 'next/navigation';
import { useApproval }      from '@/hooks/useApproval';
import { PageLoader }       from '@/components/ui/Spinner';
import { Button }           from '@/components/ui/Button';
import { formatNaira, formatDateTime } from '@/lib/format';
import { cn } from '@/lib/cn';

/**
 * app/approve/[token]/page.tsx — Payout approval page for signatories.
 *
 * GET /approve/:token  → payout details (token is the credential, no JWT needed)
 * POST /approve/:token → record approval with phone_last4 confirmation
 *
 * Designed for Pastors/Deacons/Elders receiving approval emails on mobile.
 * Security: phone last-4 prevents forwarded-email abuse.
 */

// ── Countdown timer ──────────────────────────────────────────────────────────

function useCountdown(expiresAt: string | undefined) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const diff = Math.max(0, new Date(expiresAt).getTime() - Date.now());
      setRemaining(diff);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (remaining === null) return { label: '', urgent: false, expired: false };

  const totalSecs = Math.floor(remaining / 1000);
  const hours     = Math.floor(totalSecs / 3600);
  const mins      = Math.floor((totalSecs % 3600) / 60);
  const secs      = totalSecs % 60;
  const urgent    = remaining < 3600_000; // < 1 hour
  const expired   = remaining === 0;

  const label = hours > 0
    ? `${hours}h ${mins}m remaining`
    : `${mins}:${String(secs).padStart(2, '0')} remaining`;

  return { label, urgent, expired };
}

// ── OTP digit input ──────────────────────────────────────────────────────────

function PhoneInput({
  value, onChange,
}: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 text-center" htmlFor="phone-last4">
        Confirm identity — last 4 digits of your registered phone
      </label>
      <input
        id="phone-last4"
        type="tel"
        inputMode="numeric"
        maxLength={4}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
        placeholder="• • • •"
        className={cn(
          'phone-input w-full px-4 py-4 rounded-2xl border-2',
          'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100',
          'focus:outline-none transition-all',
          value.length === 4
            ? 'border-green-500 dark:border-green-600 focus:ring-2 focus:ring-green-500/30'
            : 'border-gray-200 dark:border-gray-700 focus:border-green-400 focus:ring-2 focus:ring-green-400/20',
        )}
        autoComplete="off"
      />
      {/* Progress dots */}
      <div className="flex justify-center gap-2" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-200',
              i < value.length
                ? 'bg-green-500 scale-110'
                : 'bg-gray-200 dark:bg-gray-700',
            )}
          />
        ))}
      </div>
    </div>
  );
}

// ── Amount display ────────────────────────────────────────────────────────────

function AmountBadge({ amount, fundName }: { amount: number; fundName: string }) {
  return (
    <div className="text-center py-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-purple-300 mb-2">
        {fundName} payout request
      </p>
      <p className="text-5xl font-bold text-white tracking-tight">
        {formatNaira(amount)}
      </p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ApprovePage() {
  const params = useParams();
  const token  = params.token as string;

  const {
    details, detailsLoading, isTokenError, hasActed,
    phoneLast4, setPhoneLast4, acting, actionError, result,
    approve, decline, wasApproved, isComplete,
  } = useApproval(token);

  const [confirmDecline, setConfirmDecline] = useState(false);
  const { label: countdown, urgent, expired } = useCountdown(details?.expiresAt);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (detailsLoading) return <PageLoader message="Loading payout details…" />;

  // ── Token invalid ──────────────────────────────────────────────────────────
  if (isTokenError || !details) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 bg-white dark:bg-gray-950">
        <div className="text-center max-w-sm animate-scale-in">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {isTokenError ? 'Link expired or already used' : 'Invalid approval link'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This approval link is no longer valid. Contact your church treasurer if you need a new link.
          </p>
        </div>
      </div>
    );
  }

  // ── Already acted ──────────────────────────────────────────────────────────
  if (hasActed && !isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 bg-white dark:bg-gray-950">
        <div className="text-center max-w-sm animate-scale-in">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Already responded</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You have already responded to this approval request. Thank you.
          </p>
        </div>
      </div>
    );
  }

  // ── Success / declined ─────────────────────────────────────────────────────
  if (isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 bg-white dark:bg-gray-950">
        <div className="text-center max-w-sm animate-scale-in">
          <div className={cn(
            'w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 relative',
            wasApproved ? 'bg-green-700' : 'bg-red-600',
          )}>
            {wasApproved && (
              <div className="absolute inset-0 rounded-full animate-pulse-ring" />
            )}
            <svg className="w-9 h-9 text-white animate-tick" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              {wasApproved
                ? <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                : <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>}
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {wasApproved
              ? (result?.status === 'TRANSFER_INITIATED' ? 'Transfer initiated!' : 'Approval recorded')
              : 'Payout declined'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">{result?.message}</p>
          {result?.status === 'PARTIAL' && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4 text-sm text-amber-700 dark:text-amber-300">
              Waiting for more approvals before the transfer can proceed.
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Main approval UI ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Hero header */}
      <div className="relative overflow-hidden bg-purple-800 dark:bg-purple-900 pb-8">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top right, #c4b5fd, transparent 60%)' }}
          aria-hidden="true"
        />
        <div className="relative max-w-sm mx-auto px-5 pt-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-purple-300 text-center mb-1">
            {details.orgName}
          </p>
          <AmountBadge amount={details.amountKobo} fundName={details.fundName} />

          {/* Countdown timer */}
          {countdown && (
            <div className={cn(
              'flex items-center justify-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 mx-auto w-fit',
              expired
                ? 'bg-red-500/20 text-red-300'
                : urgent
                  ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                  : 'bg-white/10 text-purple-200',
            )}>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <circle cx="6" cy="6" r="5"/>
                <path d="M6 3v3.5l2 1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {expired ? 'Expired' : countdown}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-sm mx-auto px-5 -mt-4 pb-10 space-y-4">

        {/* Payout details card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden animate-fade-up delay-100">
          <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Payout details
            </p>
          </div>
          <div className="p-4 space-y-3">
            {[
              ['Purpose',      details.purpose],
              ['To',           `${details.bankName} · ${details.accountName} · *${details.accountNumber?.slice(-4)}`],
              ['Requested by', details.initiatorName],
              ['Expires',      formatDateTime(details.expiresAt)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 text-xs">
                <span className="text-gray-400 dark:text-gray-500 shrink-0">{k}</span>
                <span className="text-gray-700 dark:text-gray-300 text-right font-medium">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Warning */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3.5 text-xs text-amber-700 dark:text-amber-300 animate-fade-up delay-200">
          ⚠️ Approving will initiate a bank transfer when quorum is reached. This action is
          recorded and cannot be undone.
        </div>

        {/* Phone verification */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 animate-fade-up delay-300">
          <PhoneInput value={phoneLast4} onChange={setPhoneLast4} />
          {actionError && (
            <p className="text-xs text-red-500 mt-3 text-center" role="alert">{actionError}</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="animate-fade-up delay-400">
          {!confirmDecline ? (
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="danger"
                fullWidth
                size="md"
                onClick={() => setConfirmDecline(true)}
                disabled={phoneLast4.length < 4 || acting}
              >
                Decline
              </Button>
              <button
                disabled={phoneLast4.length < 4 || acting}
                onClick={approve}
                className={cn(
                  'w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-150',
                  'bg-green-700 hover:bg-green-800 active:bg-green-900',
                  'shadow-md shadow-green-900/25 hover:shadow-lg hover:shadow-green-900/30',
                  'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none',
                  phoneLast4.length === 4 && !acting ? 'animate-pulse-ring' : '',
                )}
              >
                {acting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <path d="M8 2v2M8 12v2M2 8h2M12 8h2" strokeLinecap="round"/>
                    </svg>
                    Approving…
                  </span>
                ) : 'Approve'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl p-3.5 text-center">
                <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                  Declining will cancel this payout request immediately.
                </p>
                <p className="text-xs text-red-500/70 mt-1">This action cannot be undone.</p>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <Button variant="outline" fullWidth onClick={() => setConfirmDecline(false)}>
                  Go back
                </Button>
                <Button variant="danger" fullWidth loading={acting} onClick={decline}>
                  Confirm decline
                </Button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
