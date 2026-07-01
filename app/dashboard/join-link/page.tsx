'use client';
import React, { useState } from 'react';
import { useFunds }      from '@/hooks/useFunds';
import { useOrgStore }   from '@/store/orgStore';
import { giveApi }       from '@/lib/api/give.api';
import { AccountDisplay } from '@/components/ui/CopyButton';
import { CopyButton }    from '@/components/ui/CopyButton';
import { Badge }         from '@/components/ui/Badge';
import { PageLoader }    from '@/components/ui/Spinner';
import useSWR            from 'swr';

/**
 * app/dashboard/join-link/page.tsx
 *
 * Two things to display / copy:
 *   1. Member join URL            — share so members can register
 *   2. Anonymous giving account   — for projector / walk-in visitors (no login needed)
 *   3. Shared-VA fund accounts    — e.g. Offering (same number for all members)
 *
 * Items 2 & 3 are the "projector accounts" — toggle projector mode for large text.
 */

export default function JoinLinkPage() {
  const org   = useOrgStore();
  const slug  = org.slug ?? '';
  const [projector, setProjector] = useState(false);

  const { funds, isLoading: fundsLoading } = useFunds();

  const { data: giveData, isLoading: giveLoading } = useSWR(
    slug ? `give/${slug}` : null,
    () => giveApi.getAnonymousVAs(slug),
    { revalidateOnFocus: false },
  );

  const appBase     = process.env.NEXT_PUBLIC_APP_URL ?? 'https://owoore.com';
  const joinUrl     = `${appBase}/join/${slug}`;
  const giveUrl     = `${appBase}/give/${slug}`;
  // All active shared-VA funds — show even if VA not yet initialised (shared_va_number null)
  const sharedFunds = funds.filter((f) => f.is_active && f.is_shared_va);
  const isLoading   = fundsLoading || giveLoading;

  if (isLoading) return <PageLoader message="Loading church accounts…" />;

  return (
    <div className="max-w-2xl space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100">Join link & giving accounts</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Share the join link with members · project the giving accounts on Sunday
          </p>
        </div>
        <button
          onClick={() => setProjector((p) => !p)}
          className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 transition-colors"
        >
          {projector ? '⊖ Normal view' : '⊕ Projector mode'}
        </button>
      </div>

      {/* ── Join link ── */}
      <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 space-y-3">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Member join link</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Share this link so members can register and get their personal giving accounts.
        </p>
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3">
          <code className="text-sm font-mono text-gray-800 dark:text-gray-200 flex-1 truncate">
            {joinUrl}
          </code>
          <CopyButton text={joinUrl} label="Copy" successLabel="Copied!" size="sm" />
        </div>
      </section>

      {/* ── Projector / Sunday service URL ── */}
      <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sunday service screen</p>
          <Badge variant="new" size="xs">Projector URL</Badge>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Open this URL on the church screen during service — shows the giving account number. No login required.
        </p>
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3">
          <code className="text-sm font-mono text-gray-800 dark:text-gray-200 flex-1 truncate">
            {giveUrl}
          </code>
          <CopyButton text={giveUrl} label="Copy" successLabel="Copied!" size="sm" />
        </div>
        <a
          href={giveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-green-700 dark:text-green-400 hover:underline"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M3.5 1H1v10h10V8.5M7 1h4v4M11 1L5.5 6.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Open giving page
        </a>
      </section>

      {/* ── Projector accounts ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Giving accounts
          </p>
          <Badge variant="default" size="xs">Project on screen</Badge>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 -mt-2">
          Payments to these accounts are tracked at the church level. No registration required.
        </p>

        {/* Anonymous giving account */}
        {giveData?.account && (
          <div className={projector ? 'scale-110 origin-top-left' : ''}>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              Anonymous giving <span className="text-gray-300 dark:text-gray-600">· walk-ins & visitors</span>
            </p>
            <AccountDisplay
              accountNumber={giveData.account.va_number}
              bankName={giveData.account.bank_name}
              label="Anonymous Giving"
            />
          </div>
        )}

        {/* Shared-VA funds (e.g. Offering) */}
        {sharedFunds.map((fund) => (
          <div key={fund.id} className={projector ? 'scale-110 origin-top-left' : ''}>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              {fund.name}{' '}
              <span className="text-gray-300 dark:text-gray-600">· all members see this same number</span>
            </p>
            {fund.shared_va_number ? (
              <AccountDisplay
                accountNumber={fund.shared_va_number}
                bankName={fund.shared_va_bank ?? ''}
                label={fund.name}
              />
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-4 text-xs text-gray-400 dark:text-gray-500">
                Account number not yet assigned — a member must tap this fund once to activate it,
                or ask your backend to initialise it directly.
                <br />
                <span className="text-[10px] text-gray-300 dark:text-gray-600 mt-1 block">
                  Note: the admin fund list doesn't yet return shared VA numbers. Ask your backend
                  to add shared_va_number to GET /orgs/:orgId/funds so it appears here automatically.
                </span>
              </div>
            )}
          </div>
        ))}

        {!giveData?.account && sharedFunds.length === 0 && (
          <div className="text-center py-8 text-sm text-gray-400 dark:text-gray-500">
            No projector accounts yet.{' '}
            <a href="/dashboard/funds" className="text-green-700 dark:text-green-400 underline">
              Create a fund
            </a>{' '}
            and mark it as "Shared account" (e.g. Offering), then a member taps it once to activate.
          </div>
        )}
      </section>
    </div>
  );
}
