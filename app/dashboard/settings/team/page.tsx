'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { InviteTeamForm } from '@/components/onboarding/InviteTeamForm';
import { useOrgStore }    from '@/store/orgStore';
import { useAuth }        from '@/hooks/useAuth';
import { teamApi }        from '@/lib/api/team.api';
import type { TeamMember } from '@/lib/api/team.api';
import { Avatar }         from '@/components/ui/Avatar';
import { Badge }          from '@/components/ui/Badge';
import { Button }         from '@/components/ui/Button';
import { ConfirmModal }   from '@/components/ui/Modal';
import { useToast }       from '@/components/ui/Toast';
import { CardSkeleton }   from '@/components/ui/Spinner';
import { formatDate }     from '@/lib/format';

/**
 * app/dashboard/settings/team/page.tsx — Team management.
 *
 *   GET   /admin-users     → roster with derived status
 *   PATCH /admin-users/:id → revoke / restore access (ADMIN only)
 *   POST  /admin-users/invite → invite treasurer/admin (ADMIN only)
 *
 * The backend blocks self-deactivation and deactivating the last
 * active admin — the UI mirrors those guards to avoid dead-end clicks.
 */

const STATUS_BADGE: Record<TeamMember['status'], { variant: any; label: string }> = {
  ACTIVE:         { variant: 'paid',      label: 'Active' },
  INVITED:        { variant: 'pending',   label: 'Invite sent' },
  INVITE_EXPIRED: { variant: 'expired',   label: 'Invite expired' },
  DEACTIVATED:    { variant: 'cancelled', label: 'Deactivated' },
};

export default function TeamSettingsPage() {
  const org = useOrgStore();
  const { isTreasurer, adminId } = useAuth();
  const { success, error } = useToast();

  const { data: team, isLoading, mutate } = useSWR(
    'admin-users',
    () => teamApi.list(),
    { revalidateOnFocus: true },
  );

  const [confirmTarget, setConfirmTarget] = useState<TeamMember | null>(null);
  const [saving, setSaving] = useState(false);

  const members = team ?? [];
  const activeAdminCount = members.filter((m) => m.role === 'ADMIN' && m.status === 'ACTIVE').length;

  const handleToggleAccess = async () => {
    if (!confirmTarget) return;
    const deactivating = confirmTarget.status === 'ACTIVE';
    setSaving(true);
    try {
      await teamApi.setActive(confirmTarget.id, !deactivating);
      success(
        deactivating ? 'Access revoked' : 'Access restored',
        `${confirmTarget.name} ${deactivating ? 'can no longer' : 'can once again'} sign in to the dashboard.`,
      );
      setConfirmTarget(null);
      await mutate();
    } catch (err: any) {
      error('Could not update access', err.message);
    } finally {
      setSaving(false);
    }
  };

  // Mirror the backend guards so we don't offer clicks that will 400
  const canToggle = (m: TeamMember): boolean => {
    if (isTreasurer) return false;
    if (m.id === adminId) return false;                                   // no self-deactivation
    if (m.status === 'ACTIVE' && m.role === 'ADMIN' && activeAdminCount <= 1) return false; // last admin
    if (m.status === 'INVITED' || m.status === 'INVITE_EXPIRED') return false; // resend invite instead
    return true;
  };

  return (
    <div className="max-w-2xl animate-fade-in space-y-5">
      <Link href="/dashboard/settings" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M10 4L6 8l4 4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Settings
      </Link>

      <div>
        <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100">Team members</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Who can access this dashboard, and what they're allowed to do.
        </p>
      </div>

      {/* Roster */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-2">{[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}</div>
        ) : members.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-8">
            No team members yet — invite your treasurer below.
          </p>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {members.map((m) => {
              const badge = STATUS_BADGE[m.status];
              return (
                <div key={m.id} className="flex items-center gap-3 px-4 py-3.5">
                  <Avatar name={m.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{m.name}</p>
                      {m.id === adminId && (
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 shrink-0">(you)</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{m.email}</p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                      <Badge variant={m.role === 'ADMIN' ? 'new' : 'default'} size="xs">
                        {m.role === 'ADMIN' ? 'Admin' : 'Treasurer'}
                      </Badge>
                      <Badge variant={badge.variant} size="xs">{badge.label}</Badge>
                      {m.invited_by_name && (
                        <span className="text-[10px] text-gray-400 dark:text-gray-500">
                          invited by {m.invited_by_name} · {formatDate(m.created_at)}
                        </span>
                      )}
                    </div>
                  </div>
                  {canToggle(m) && (
                    <Button
                      variant="ghost"
                      size="xs"
                      className={m.status === 'ACTIVE'
                        ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 shrink-0'
                        : 'text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20 shrink-0'}
                      onClick={() => setConfirmTarget(m)}
                    >
                      {m.status === 'ACTIVE' ? 'Revoke access' : 'Restore access'}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Invite */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-xl p-3.5 text-xs text-blue-700 dark:text-blue-300 mb-5">
          <p className="font-medium mb-1">Role differences</p>
          <p><strong>Admin</strong> — full access: create funds, add signatories, view all reports, initiate + cancel payouts</p>
          <p className="mt-1"><strong>Treasurer</strong> — can initiate payouts and view reports, but cannot approve their own requests or change signatories</p>
        </div>
        {isTreasurer ? (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Only an admin can invite new team members.
          </p>
        ) : (
          <InviteTeamForm orgId={org.orgId ?? ''} />
        )}
      </div>

      {/* Confirm revoke/restore */}
      <ConfirmModal
        open={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleToggleAccess}
        loading={saving}
        title={confirmTarget?.status === 'ACTIVE' ? 'Revoke access' : 'Restore access'}
        description={confirmTarget?.status === 'ACTIVE'
          ? `${confirmTarget?.name} will no longer be able to sign in. Their past actions stay in the audit log, and you can restore access at any time.`
          : `${confirmTarget?.name} will be able to sign in again with their existing password.`}
        confirmLabel={confirmTarget?.status === 'ACTIVE' ? 'Revoke' : 'Restore'}
        confirmVariant={confirmTarget?.status === 'ACTIVE' ? 'danger' : 'primary'}
      />
    </div>
  );
}
