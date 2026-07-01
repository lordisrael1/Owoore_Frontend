'use client';
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { orgsApi }   from '@/lib/api/orgs.api';
import { OtpForm }   from '@/components/member/OtpForm';
import { PageLoader } from '@/components/ui/Spinner';
import useSWR        from 'swr';
import type { Metadata } from 'next';

/**
 * app/join/[slug]/page.tsx — Member join page.
 *
 * The entry point for all church members. Accessed via the church's join link:
 *   owoore.ng/join/grace-bible-church
 *
 * Flow:
 *   1. GET /orgs/:slug → church name + logo (public, no auth)
 *   2. Show OtpForm (email → OTP → name on first visit)
 *   3. On success → redirect to /portal
 *
 * Also sets the member JWT cookie for middleware.ts to read.
 * This runs on mobile (small screens) — layout is single-column, generous tap targets.
 */

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const slug   = params.slug as string;

  const [joined, setJoined] = useState(false);
  const [memberName, setMemberName] = useState('');

  // Fetch org details (church name, logo)
  const { data: org, isLoading, error } = useSWR(
    slug ? `orgs/${slug}` : null,
    () => orgsApi.getBySlug(slug),
    { revalidateOnFocus: false },
  );

  const handleSuccess = (name: string, isNew: boolean) => {
    // Set cookie for middleware (alongside localStorage set by authApi)
    const token = localStorage.getItem('owoore_member_token');
    if (token) {
      document.cookie = `owoore_member_token=${token}; path=/; SameSite=Lax; max-age=${7 * 24 * 3600}`;
    }

    setMemberName(name);
    setJoined(true);

    // Small delay to show the welcome message before redirecting
    setTimeout(() => router.push('/portal'), 1500);
  };

  if (isLoading) return <PageLoader message="Loading church details…" />;

  if (error || !org) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="text-center max-w-sm">
          <p className="text-4xl mb-4">🔍</p>
          <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Church not found</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            The join link <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">/{slug}</code> doesn't match any church on Owoore.
            Check the link and try again.
          </p>
        </div>
      </div>
    );
  }

  // Success state
  if (joined) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-700 flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
            Welcome, {memberName.split(' ')[0]}!
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Taking you to your giving portal…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      {/* Church header */}
      <div className="bg-green-700 pt-12 pb-8 px-5 text-center">
        {org.logo_url ? (
          <img
            src={org.logo_url}
            alt={org.name}
            className="w-14 h-14 rounded-xl object-cover mx-auto mb-3 border-2 border-white/20"
          />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2.25a.75.75 0 01.75.75v3h2.25a.75.75 0 010 1.5H12.75V12h3.75a.75.75 0 01.75.75V21a.75.75 0 01-.75.75h-10.5a.75.75 0 01-.75-.75v-8.25a.75.75 0 01.75-.75h3.75V7.5H7.5a.75.75 0 010-1.5h2.25V3a.75.75 0 01.75-.75H12z"/>
            </svg>
          </div>
        )}
        <h1 className="text-lg font-medium text-white">{org.name}</h1>
        <p className="text-sm text-green-100 mt-1">Digital giving — no cash, no app download</p>
      </div>

      {/* OTP form */}
      <div className="flex-1 px-5 py-8 max-w-sm mx-auto w-full">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center">
          Verify your email to get your personal giving account numbers
        </p>
        <OtpForm orgSlug={slug} onSuccess={handleSuccess} />
      </div>

      {/* Powered by */}
      <p className="text-center text-xs text-gray-300 dark:text-gray-600 pb-6">
        Powered by Owoore · Secured by Nomba
      </p>
    </div>
  );
}