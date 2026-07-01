'use client';
import React from 'react';
import Link from 'next/link';
import { InviteTeamForm } from '@/components/onboarding/InviteTeamForm';
import { useOrgStore }    from '@/store/orgStore';

/**
 * app/dashboard/settings/team/page.tsx — Invite treasurer/admin.
 * POST /admin-users/invite
 */
export default function TeamSettingsPage() {
  const org = useOrgStore();

  return (
    <div className="max-w-md animate-fade-in space-y-5">
      <Link href="/dashboard/settings" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M10 4L6 8l4 4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Settings
      </Link>

      <div>
        <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100">Team members</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Invite a treasurer or additional admin to access the dashboard.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-xl p-3.5 text-xs text-blue-700 dark:text-blue-300 mb-5">
          <p className="font-medium mb-1">Role differences</p>
          <p><strong>Admin</strong> — full access: create funds, add signatories, view all reports, initiate + cancel payouts</p>
          <p className="mt-1"><strong>Treasurer</strong> — can initiate payouts and view reports, but cannot approve their own requests or change signatories</p>
        </div>
        <InviteTeamForm orgId={org.orgId ?? ''} />
      </div>
    </div>
  );
}