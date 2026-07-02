'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { giveApi }   from '@/lib/api/give.api';
import { OtpForm }   from '@/components/member/OtpForm';
import { PageLoader } from '@/components/ui/Spinner';
import useSWR        from 'swr';

/**
 * app/join/[slug]/page.tsx — Member join page.
 *
 * Flow: GET /give/:slug → show OtpForm → on success → /portal
 * Also sets the member JWT cookie for middleware.ts.
 */

const ChurchIcon = () => (
  <svg className="w-8 h-8 text-white/80" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2.25a.75.75 0 01.75.75v3h2.25a.75.75 0 010 1.5H12.75V12h3.75a.75.75 0 01.75.75V21a.75.75 0 01-.75.75h-10.5a.75.75 0 01-.75-.75v-8.25a.75.75 0 01.75-.75h3.75V7.5H7.5a.75.75 0 010-1.5h2.25V3a.75.75 0 01.75-.75H12z"/>
  </svg>
);

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const slug   = params.slug as string;

  const [joined, setJoined] = useState(false);
  const [memberName, setMemberName] = useState('');

  const { data: giveData, isLoading, error } = useSWR(
    slug ? `give/${slug}` : null,
    () => giveApi.getAnonymousVAs(slug),
    { revalidateOnFocus: false },
  );
  const org = giveData?.org ?? null;

  const handleSuccess = (name: string) => {
    const token = localStorage.getItem('owoore_member_token');
    if (token) {
      document.cookie = `owoore_member_token=${token}; path=/; SameSite=Lax; max-age=${7 * 24 * 3600}`;
    }
    setMemberName(name);
    setJoined(true);
    setTimeout(() => router.push('/portal'), 1600);
  };

  if (isLoading) return <PageLoader message="Loading church details…" />;

  if (error || !org) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 bg-white dark:bg-gray-950">
        <div className="text-center max-w-sm animate-scale-in">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Church not found</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            The join link{' '}
            <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-mono">/{slug}</code>{' '}
            doesn't match any church on Owoore. Check the link and try again.
          </p>
        </div>
      </div>
    );
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (joined) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 bg-white dark:bg-gray-950">
        <div className="text-center animate-scale-in">
          {/* Animated checkmark */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-green-100 dark:bg-green-950/60 animate-pulse-ring" />
            <div className="relative w-20 h-20 rounded-full bg-green-700 flex items-center justify-center shadow-lg shadow-green-900/30">
              <svg className="w-9 h-9 text-white animate-tick" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Welcome, {memberName.split(' ')[0]}! 🎉
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            You're now registered with {org.name}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Taking you to your giving portal…
          </p>
        </div>
      </div>
    );
  }

  // ── Main join UI ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">

      {/* Church header — full-bleed gradient */}
      <div className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-green-700" aria-hidden="true" />
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: 'radial-gradient(ellipse at top right, #86efac, transparent 60%), radial-gradient(ellipse at bottom left, #065f46, transparent 60%)' }}
          aria-hidden="true"
        />

        <div className="relative pt-12 pb-10 px-5 text-center">
          {/* Logo */}
          {org.logo_url ? (
            <img
              src={org.logo_url}
              alt={org.name}
              className="w-16 h-16 rounded-2xl object-cover mx-auto mb-4 border-2 border-white/25 shadow-lg shadow-black/20 animate-scale-in"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-black/20 animate-scale-in">
              <ChurchIcon />
            </div>
          )}

          <h1 className="text-xl font-bold text-white animate-fade-up delay-100">{org.name}</h1>
          <p className="text-sm text-green-100/80 mt-1.5 animate-fade-up delay-200">
            Digital giving · No cash, no app download
          </p>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-3 mt-4 animate-fade-up delay-300">
            {['🔒 Secured', '⚡ Instant', '₦0 Free'].map((badge) => (
              <span
                key={badge}
                className="text-[10px] font-semibold bg-white/10 border border-white/15 text-white/80 px-2.5 py-1 rounded-full backdrop-blur-sm"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Form card */}
      <div className="flex-1 flex flex-col -mt-4">
        <div className="flex-1 bg-white dark:bg-gray-900 rounded-t-3xl border-t border-gray-100 dark:border-gray-800 shadow-2xl shadow-black/10 px-5 pt-8 pb-10 max-w-sm w-full mx-auto animate-fade-up delay-300">

          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-center">
            Verify your email
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center mb-6 leading-relaxed">
            Get your personal giving account numbers — one per fund, permanent and instant.
          </p>

          <OtpForm orgSlug={slug} onSuccess={handleSuccess} />
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-[10px] text-gray-300 dark:text-gray-700 pb-5 bg-white dark:bg-gray-900">
        Powered by Owoore · Secured by Nomba
      </p>
    </div>
  );
}
