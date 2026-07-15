import { api } from './client';

/**
 * team.api.ts — staff roster + access management.
 *
 *   GET   /admin-users     → every human staff account (SYSTEM excluded)
 *   PATCH /admin-users/:id → revoke / restore dashboard access (ADMIN only)
 *
 * Status is derived by the backend:
 *   ACTIVE         — can log in
 *   INVITED        — invite sent, link still valid
 *   INVITE_EXPIRED — 72 h invite window passed
 *   DEACTIVATED    — access revoked
 */

export type TeamMemberStatus = 'ACTIVE' | 'INVITED' | 'INVITE_EXPIRED' | 'DEACTIVATED';

export interface TeamMember {
  id:              string;
  name:            string;
  email:           string;
  role:            'ADMIN' | 'TREASURER';
  status:          TeamMemberStatus;
  is_verified:     boolean;
  invited_by_name: string | null;
  created_at:      string;
}

export const teamApi = {
  list: () =>
    api.get<TeamMember[]>('/admin-users', { tokenType: 'admin' }),

  setActive: (id: string, isActive: boolean) =>
    api.patch<{ id: string; is_active: boolean }>(
      `/admin-users/${id}`,
      { is_active: isActive },
      { tokenType: 'admin' },
    ),
};
