'use client';
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useApproval } from '@/hooks/useApproval';
import { Button }      from '@/components/ui/Button';
import { PageLoader }  from '@/components/ui/Spinner';
import { formatNaira } from '@/lib/format';

/**
 * app/approve/[token]/decline/page.tsx — Decline confirmation.
 *
 * POST /approve/:token/decline
 *
 * Reached when a signatory taps "Decline" on the approval page
 * and confirms. A single decline immediately cancels the payout
 * and notifies the initiator.
 *
 * Separate page (not a modal) so the URL is shareable and the
 * backend can validate the token independently.
 */
export default function DeclinePage() {
  const params = useParams();
  const token  = params.token as string;

  const {
    details, detailsLoading, isTokenError,
    phoneLast4, setPhoneLast4,
    acting, actionError, result, decline,
    wasDeclined,
  } = useApproval(token);

  if (detailsLoading) return <PageLoader message="Loading payout details…" />;

  // Token invalid
  if (isTokenError || !details) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 bg-white dark:bg-gray-950">
        <div className="text-center max-w-sm">
          <p className="text-4xl mb-4">🔗</p>
          <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Invalid or expired link</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This decline link is no longer valid. The payout may have already been decided.
          </p>
        </div>
      </div>
    );
  }

  // Already acted
  if (details.alreadyActed && !wasDeclined) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 bg-white dark:bg-gray-950">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Already responded</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">You have already responded to this approval request.</p>
        </div>
      </div>
    );
  }

  // Success — declined
  if (wasDeclined || result?.status === 'DECLINED') {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 bg-white dark:bg-gray-950">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">Payout declined</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{result?.message}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            The initiator has been notified and the funds have been unlocked.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      {/* Red header — signals a destructive action */}
      <div className="bg-red-600 text-white px-5 py-8 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-red-200 mb-2">Decline payout</p>
        <h1 className="text-2xl font-medium">{formatNaira(details.amountKobo)}</h1>
        <p className="text-red-200 text-sm mt-1">{details.orgName}</p>
      </div>

      <div className="flex-1 max-w-sm mx-auto w-full px-5 py-6 space-y-5">
        {/* Payout summary */}
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 space-y-2.5">
          {[
            ['Fund',    details.fundName],
            ['Purpose', details.purpose],
            ['To',      `${details.bankName} · ${details.accountName}`],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3 text-xs">
              <span className="text-gray-400 shrink-0">{k}</span>
              <span className="text-gray-700 dark:text-gray-300 text-right">{v}</span>
            </div>
          ))}
        </div>

        {/* Warning */}
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl p-4 text-sm text-red-700 dark:text-red-300">
          <p className="font-medium mb-1">⚠️ This action is permanent</p>
          <p className="text-xs leading-relaxed">
            Declining immediately cancels the entire payout request. The initiator will be notified.
            The funds will be unlocked and available for a new request.
          </p>
        </div>

        {/* Phone identity confirm */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5" htmlFor="phone-confirm">
            Confirm your identity — last 4 digits of your phone
          </label>
          <input
            id="phone-confirm"
            type="tel"
            inputMode="numeric"
            maxLength={4}
            value={phoneLast4}
            onChange={(e) => setPhoneLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="e.g. 5678"
            className="w-full px-3 py-3 text-center text-lg font-medium tracking-widest rounded-xl border border-red-200 dark:border-red-800/50 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-describedby={actionError ? 'decline-error' : undefined}
          />
          {actionError && (
            <p id="decline-error" className="text-xs text-red-500 mt-1.5" role="alert">
              {actionError}
            </p>
          )}
        </div>

        {/* Decline button */}
        <Button
          variant="danger"
          fullWidth
          size="lg"
          loading={acting}
          disabled={phoneLast4.length < 4}
          onClick={decline}
        >
          Confirm decline
        </Button>

        <a
          href={`/approve/${token}`}
          className="block text-center text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          ← Go back and approve instead
        </a>
      </div>
    </div>
  );
}