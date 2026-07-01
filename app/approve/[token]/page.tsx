'use client';
import React, { useState } from 'react';
import { useParams }        from 'next/navigation';
import { useApproval }      from '@/hooks/useApproval';
import { ApprovalTimeline } from '@/components/payout/ApprovalTimeline';
import { PageLoader }       from '@/components/ui/Spinner';
import { Button }           from '@/components/ui/Button';
import { formatNaira, formatDateTime } from '@/lib/format';
import Link from 'next/link';

/**
 * app/approve/[token]/page.tsx — Payout approval page.
 *
 * GET /approve/:token → payout details (no JWT, token is the credential)
 * POST /approve/:token → record approval with phone_last4 confirm
 *
 * Designed for Pastors, Deacons, Elders receiving approval emails.
 * They click the link in their email, land here, verify identity,
 * tap Approve or Decline. No login required.
 *
 * Security: phone last-4 confirmation prevents someone who forwards
 * the email from approving on behalf of the signatory.
 */

export default function ApprovePage() {
  const params = useParams();
  const token  = params.token as string;

  const {
    details, detailsLoading, isTokenError, hasActed,
    phoneLast4, setPhoneLast4, acting, actionError, result,
    approve, decline, wasApproved, wasDeclined, isComplete,
  } = useApproval(token);

  const [confirmDecline, setConfirmDecline] = useState(false);

  if (detailsLoading) return <PageLoader message="Loading payout details…" />;

  // ── Token invalid / already used ─────────────────────────────────────────
  if (isTokenError || !details) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {isTokenError ? 'Link expired or already used' : 'Invalid approval link'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This approval link is no longer valid. Contact your church treasurer if you need a new link.
          </p>
        </div>
      </div>
    );
  }

  // ── Already acted ─────────────────────────────────────────────────────────
  if (hasActed && !isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Already responded</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You have already responded to this approval request. Thank you.
          </p>
        </div>
      </div>
    );
  }

  // ── Success / declined result ─────────────────────────────────────────────
  if (isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="text-center max-w-sm">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 ${wasApproved ? 'bg-green-700' : 'bg-red-600'}`}>
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {wasApproved
                ? <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                : <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>}
            </svg>
          </div>
          <h1 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
            {wasApproved ? (result?.status === 'TRANSFER_INITIATED' ? 'Transfer initiated!' : 'Approval recorded') : 'Payout declined'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{result?.message}</p>
          {result?.status === 'PARTIAL' && (
            <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-xl p-3">
              Waiting for more approvals before the transfer can proceed.
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── Main approval UI ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="bg-purple-700 text-white px-5 py-8 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-purple-200 mb-2">Payout approval</p>
        <h1 className="text-2xl font-medium">{formatNaira(details.amountKobo)}</h1>
        <p className="text-purple-200 text-sm mt-1">{details.orgName}</p>
      </div>

      <div className="max-w-sm mx-auto px-5 py-6 space-y-5">
        {/* Payout details */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 space-y-3">
          {[
            ['Fund',      details.fundName],
            ['Purpose',   details.purpose],
            ['To',        `${details.bankName} · ${details.accountName} · *${details.accountNumber.slice(-4)}`],
            ['Requested by', details.initiatorName],
            ['Expires',   formatDateTime(details.expiresAt)],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3 text-xs">
              <span className="text-gray-400 shrink-0">{k}</span>
              <span className="text-gray-700 dark:text-gray-300 text-right">{v}</span>
            </div>
          ))}
        </div>

        {/* Warning */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3.5 text-xs text-amber-700 dark:text-amber-300">
          ⚠️ Approving will initiate a bank transfer when quorum is reached. This action is recorded.
        </div>

        {/* Phone verification */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5" htmlFor="phone-last4">
            Confirm your identity — last 4 digits of your registered phone
          </label>
          <input
            id="phone-last4"
            type="tel"
            inputMode="numeric"
            maxLength={4}
            value={phoneLast4}
            onChange={(e) => setPhoneLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="e.g. 5678"
            className="w-full px-3 py-3 text-center text-lg font-medium tracking-widest rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-green-700"
          />
          {actionError && (
            <p className="text-xs text-red-500 mt-1.5" role="alert">{actionError}</p>
          )}
        </div>

        {/* Action buttons */}
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
            <Button
              variant="success"
              fullWidth
              size="md"
              loading={acting}
              disabled={phoneLast4.length < 4}
              onClick={approve}
            >
              Approve
            </Button>
          </div>
        ) : (
          <div className="space-y-2.5">
            <p className="text-sm font-medium text-red-600 dark:text-red-400 text-center">
              Declining will cancel this payout request immediately.
            </p>
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
  );
}