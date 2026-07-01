'use client';
import React, { useState } from 'react';
import { useParams }    from 'next/navigation';
import { giveApi }      from '@/lib/api/give.api';
import { AccountDisplay } from '@/components/ui/CopyButton';
import { PageLoader }   from '@/components/ui/Spinner';
import useSWR           from 'swr';

/**
 * app/give/[slug]/page.tsx — Anonymous public giving page.
 *
 * GET /give/:orgSlug → org-level shared NUBAN numbers per fund
 *
 * Designed to be projected on a screen during Sunday service.
 * Large text, high contrast, easy to read from 5+ metres away.
 * No login, no registration — just transfer and done.
 *
 * Payments via this page are reconciled to the org/fund
 * but NOT attributed to any individual member.
 */

export default function GivePage() {
  const params  = useParams();
  const slug    = params.slug as string;
  const [projector, setProjector] = useState(false);

  const { data, isLoading, error } = useSWR(
    slug ? `give/${slug}` : null,
    () => giveApi.getAnonymousVAs(slug),
    { revalidateOnFocus: false, refreshInterval: 300_000 }, // refresh every 5min
  );

  if (isLoading) return <PageLoader message="Loading giving accounts…" />;

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="text-center">
          <p className="text-4xl mb-3">🔍</p>
          <h1 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-2">Church not found</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Check the URL and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-white dark:bg-gray-950 ${projector ? 'projector-mode' : ''}`}>
      {/* Header */}
      <div className="bg-green-700 text-white text-center py-8 px-5">
        {data.org.logo_url && (
          <img
            src={data.org.logo_url}
            alt={data.org.name}
            className="w-12 h-12 rounded-xl object-cover mx-auto mb-3 border-2 border-white/20"
          />
        )}
        <h1 className={`font-medium ${projector ? 'text-3xl' : 'text-xl'}`}>
          {data.org.name}
        </h1>
        <p className={`text-green-100 mt-1 ${projector ? 'text-xl' : 'text-sm'}`}>
          Transfer from any Nigerian bank
        </p>
      </div>

      {/* Anonymous giving account */}
      <div className="max-w-lg mx-auto px-5 py-8 space-y-4">
        <div className="animate-fade-in">
          <AccountDisplay
            accountNumber={data.account.va_number}
            bankName={data.account.bank_name}
            label="Anonymous Giving"
          />
        </div>

        {/* Notice */}
        <div className="text-center pt-4">
          <p className={`text-gray-400 dark:text-gray-500 ${projector ? 'text-base' : 'text-xs'}`}>
            {data.notice}
          </p>
        </div>

        {/* Register link */}
        <div className="text-center pt-2">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Want a personal account?</p>
          <a
            href={`/join/${data.org.slug}`}
            className="text-sm text-green-700 dark:text-green-400 font-medium underline"
          >
            Register at owoore.ng/join/{data.org.slug}
          </a>
        </div>
      </div>

      {/* Projector toggle — bottom-right, subtle */}
      <button
        onClick={() => setProjector((p) => !p)}
        className="fixed bottom-4 right-4 text-xs text-gray-300 dark:text-gray-700 hover:text-gray-500 transition-colors px-2 py-1"
        aria-label={projector ? 'Exit projector mode' : 'Enter projector mode (larger text)'}
      >
        {projector ? '⊖ Normal view' : '⊕ Projector mode'}
      </button>
    </div>
  );
}