'use client';
import { useState } from 'react';
import { useParams }    from 'next/navigation';
import { giveApi }      from '@/lib/api/give.api';
import { AccountDisplay } from '@/components/ui/CopyButton';
import { PageLoader }   from '@/components/ui/Spinner';
import useSWR           from 'swr';
import { cn }           from '@/lib/cn';

/**
 * app/give/[slug]/page.tsx — Anonymous public giving page.
 *
 * GET /give/:orgSlug → org-level shared NUBAN per fund.
 *
 * Designed to be projected on screen during Sunday service:
 *   - Bold, high-contrast layout readable from 5+ metres
 *   - Projector mode toggles larger text + dark background
 *   - Payments reconciled to org/fund but not to individual members
 */

export default function GivePage() {
  const params   = useParams();
  const slug     = params.slug as string;
  const [projector, setProjector] = useState(false);

  const { data, isLoading, error } = useSWR(
    slug ? `give/${slug}` : null,
    () => giveApi.getAnonymousVAs(slug),
    { revalidateOnFocus: false, refreshInterval: 300_000 },
  );

  if (isLoading) return <PageLoader message="Loading giving accounts…" />;

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 bg-white dark:bg-gray-950">
        <div className="text-center animate-scale-in">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Church not found</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Check the URL and try again.</p>
        </div>
      </div>
    );
  }

  const isProjector = projector;

  return (
    <div className={cn(
      'min-h-screen flex flex-col transition-colors duration-500',
      isProjector ? 'bg-gray-950 text-white' : 'bg-white dark:bg-gray-950',
    )}>

      {/* Hero header */}
      <div className={cn(
        'relative overflow-hidden py-10 px-5 text-center',
        isProjector
          ? 'bg-green-900'
          : 'bg-linear-to-br from-green-700 to-green-800',
      )}>
        {/* Background decoration */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top, #86efac, transparent 60%)' }}
          aria-hidden="true"
        />

        <div className="relative">
          {data.org.logo_url && (
            <img
              src={data.org.logo_url}
              alt={data.org.name}
              className={cn(
                'rounded-2xl object-cover mx-auto mb-4 border-2 border-white/20 shadow-lg shadow-black/20 animate-scale-in',
                isProjector ? 'w-20 h-20' : 'w-14 h-14',
              )}
            />
          )}
          <h1 className={cn(
            'font-bold text-white animate-fade-up',
            isProjector ? 'text-5xl' : 'text-2xl',
          )}>
            {data.org.name}
          </h1>
          <p className={cn(
            'text-green-100/80 mt-2 animate-fade-up delay-100',
            isProjector ? 'text-2xl' : 'text-sm',
          )}>
            Transfer from any Nigerian bank
          </p>

          {/* Live indicator */}
          <div className="inline-flex items-center gap-1.5 mt-3 bg-white/10 border border-white/15 rounded-full px-3 py-1 animate-fade-up delay-200">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" aria-hidden="true" />
            <span className={cn('text-white/70 font-medium', isProjector ? 'text-base' : 'text-xs')}>
              Giving is open
            </span>
          </div>
        </div>
      </div>

      {/* Account display */}
      <div className="flex-1 max-w-lg mx-auto w-full px-5 py-8 space-y-5">

        <div className={cn(
          'animate-fade-up delay-200',
          isProjector && 'scale-110 origin-top',
        )}>
          <AccountDisplay
            accountNumber={data.account.va_number}
            bankName={data.account.bank_name}
            label="Anonymous Giving"
          />
        </div>

        {/* Notice */}
        {data.notice && (
          <div className={cn(
            'text-center text-gray-400 dark:text-gray-500 animate-fade-up delay-300',
            isProjector ? 'text-lg' : 'text-xs',
          )}>
            {data.notice}
          </div>
        )}

        {/* How to pay (hide in projector mode — too much text for projection) */}
        {!isProjector && (
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 animate-fade-up delay-400">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">How to give</p>
            <div className="space-y-2">
              {[
                'Open your banking app (GTBank, OPay, Kuda, etc.)',
                'Select "Transfer" and enter the account number above',
                'Payment is confirmed automatically — no receipt needed',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Personal account CTA */}
        {!isProjector && (
          <div className="text-center pt-2 animate-fade-up delay-500">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-1.5">Want giving tracked under your name?</p>
            <a
              href={`/join/${data.org.slug}`}
              className="inline-flex items-center gap-1.5 text-sm text-green-700 dark:text-green-400 font-semibold hover:underline"
            >
              Register at owoore.ng/join/{data.org.slug}
              <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M2 6h8M6 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        )}
      </div>

      {/* Projector toggle — subtle, bottom-right */}
      <button
        onClick={() => setProjector((p) => !p)}
        className={cn(
          'fixed bottom-5 right-5 flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl transition-all',
          isProjector
            ? 'bg-white/10 text-white/60 hover:bg-white/20 border border-white/10'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 border border-gray-200 dark:border-gray-700',
        )}
        aria-label={isProjector ? 'Exit projector mode' : 'Enter projector mode (larger text for screen)'}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <rect x="1" y="3" width="12" height="8" rx="1"/>
          <path d="M5 11v2M9 11v2M3 13h8" strokeLinecap="round"/>
        </svg>
        {isProjector ? 'Exit projector' : 'Projector mode'}
      </button>
    </div>
  );
}
