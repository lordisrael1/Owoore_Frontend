'use client';
import React, { useState } from 'react';
import { useRouter }      from 'next/navigation';
import { SetupChecklist } from '@/components/onboarding/SetupChecklist';
import { InviteTeamForm } from '@/components/onboarding/InviteTeamForm';
import { JoinLinkShare }  from '@/components/onboarding/JoinLinkShare';
import { useOrgStore }    from '@/store/orgStore';
import { useRequireAdmin } from '@/hooks/useAuth';
import { PageLoader }     from '@/components/ui/Spinner';
import type { ChecklistItem } from '@/components/onboarding/SetupChecklist';

/**
 * app/setup/page.tsx — Onboarding checklist (post-registration).
 *
 * Shown immediately after church registration.
 * Guides the admin through 5 setup steps before members can join.
 *
 * The checklist is stateful — steps are marked complete based on
 * what the admin has done. In production, persist state to the backend
 * (e.g. org.setup_completed_steps: string[]).
 *
 * For hackathon: local state sufficient for the demo flow.
 */

export default function SetupPage() {
  const router    = useRouter();
  const org       = useOrgStore();
  const { initialized, isAdmin } = useRequireAdmin();

  const [step, setStep] = useState<'checklist' | 'invite' | 'share'>('checklist');
  const [completedSteps, setCompletedSteps] = useState<string[]>(['register', 'funds']);

  if (!initialized) return <PageLoader message="Loading setup…" />;

  const markDone = (id: string) =>
    setCompletedSteps((prev) => [...new Set([...prev, id])]);

  const joinLink = org.slug
    ? `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://owoore.ng'}/join/${org.slug}`
    : '';

  const checklistItems: ChecklistItem[] = [
    {
      id:          'register',
      label:       'Church registered',
      done:        completedSteps.includes('register'),
    },
    {
      id:          'funds',
      label:       'Fund types created (Tithe + Offering set up automatically)',
      done:        completedSteps.includes('funds'),
    },
    {
      id:          'invite',
      label:       'Invite your treasurer',
      done:        completedSteps.includes('invite'),
      href:        '#invite',
      actionLabel: 'Invite →',
    },
    {
      id:          'signatories',
      label:       'Add payout signatories (Pastor, Deacon, Elder)',
      done:        completedSteps.includes('signatories'),
      href:        '/dashboard/signatories',
      actionLabel: 'Add signatories →',
    },
    {
      id:          'share',
      label:       'Share your join link with members',
      done:        completedSteps.includes('share'),
      href:        '#share',
      actionLabel: 'Share link →',
    },
  ];

  const allDone = checklistItems.every((i) => i.done);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-5">
      <div className="max-w-md mx-auto space-y-6">

        {/* Checklist */}
        <SetupChecklist
          items={checklistItems}
          orgName={org.name ?? undefined}
          joinLink={allDone ? joinLink : undefined}
        />

        {/* Invite team section */}
        {!completedSteps.includes('invite') && (
          <div id="invite" className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Invite your treasurer</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              They'll get an email to set their password and access the dashboard.
            </p>
            <InviteTeamForm
              orgId={org.orgId ?? ''}
              onInvited={() => markDone('invite')}
            />
          </div>
        )}

        {/* Share link section */}
        {completedSteps.includes('invite') && !completedSteps.includes('share') && joinLink && (
          <div id="share" className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Share your join link</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Send this to members on WhatsApp or project on screen Sunday.
            </p>
            <JoinLinkShare
              joinLink={joinLink}
              orgName={org.name ?? undefined}
            />
            <button
              onClick={() => markDone('share')}
              className="mt-4 w-full py-2.5 text-sm text-green-700 dark:text-green-400 font-medium border border-green-200 dark:border-green-800/50 rounded-xl"
            >
              Done — link shared ✓
            </button>
          </div>
        )}

        {/* Go to dashboard when complete */}
        {allDone && (
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 bg-green-700 hover:bg-green-800 text-white font-medium rounded-xl transition-colors"
          >
            Open dashboard →
          </button>
        )}
      </div>
    </div>
  );
}