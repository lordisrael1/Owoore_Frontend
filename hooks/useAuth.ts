'use client';
import { useCallback, useEffect, useState } from 'react';
import { getMemberToken, getAdminToken, clearMemberToken, clearAdminToken } from '@/lib/auth/token';
import { decodeMemberToken, decodeAdminToken } from '@/lib/auth/decode';
import { useAuthStore } from '@/store/authStore';
import { useOrgStore } from '@/store/orgStore';

/**
 * useAuth — current user context: role, orgId, name, logout.
 *
 * Single hook that works for both member and admin contexts.
 * Components use this to:
 *   - Show the logged-in user's name in the nav
 *   - Conditionally render admin-only UI
 *   - Get the orgId for API calls
 *   - Trigger logout
 *
 * Reads from:
 *   1. Zustand authStore (in-memory, set on login)
 *   2. localStorage tokens (persisted, for page refresh)
 *
 * Note: this hook runs on the CLIENT only — guard all usages
 * with 'use client' or useEffect.
 */
export function useAuth() {
  const authStore = useAuthStore();
  const clearOrg  = useOrgStore((s) => s.clear);

  const [initialized, setInitialized] = useState(false);

  // On mount, hydrate from localStorage if Zustand is empty
  useEffect(() => {
    if (!authStore.adminToken && !authStore.memberToken) {
      const adminToken  = getAdminToken();
      const memberToken = getMemberToken();

      if (adminToken) {
        const payload = decodeAdminToken(adminToken);
        if (payload) {
          authStore.setAdmin(adminToken, {
            id:    payload.sub,
            email: payload.email,
            role:  payload.role,
            orgId: payload.orgId,
          });
        } else {
          // Token expired — clear it
          clearAdminToken();
        }
      }

      if (memberToken) {
        const payload = decodeMemberToken(memberToken);
        if (payload) {
          authStore.setMember(memberToken, {
            id:    payload.sub,
            email: payload.email,
            orgId: payload.orgId,
          });
        } else {
          clearMemberToken();
        }
      }
    }
    setInitialized(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const logoutAdmin = useCallback(() => {
    clearAdminToken();
    authStore.clearAdmin();
    clearOrg();
    window.location.href = '/login';
  }, [authStore, clearOrg]);

  const logoutMember = useCallback(() => {
    clearMemberToken();
    authStore.clearMember();
    window.location.href = '/';
  }, [authStore]);

  const logoutAll = useCallback(() => {
    clearAdminToken();
    clearMemberToken();
    authStore.clearAdmin();
    authStore.clearMember();
    clearOrg();
    window.location.href = '/';
  }, [authStore, clearOrg]);

  // Decoded payloads
  const adminPayload  = authStore.adminToken  ? decodeAdminToken(authStore.adminToken)   : null;
  const memberPayload = authStore.memberToken ? decodeMemberToken(authStore.memberToken) : null;

  return {
    initialized,

    // Admin context
    isAdmin:      !!adminPayload,
    isTreasurer:  adminPayload?.role === 'TREASURER',
    adminRole:    adminPayload?.role ?? null,
    adminEmail:   adminPayload?.email ?? authStore.adminUser?.email ?? null,
    adminId:      adminPayload?.sub   ?? authStore.adminUser?.id    ?? null,
    adminOrgId:   adminPayload?.orgId ?? authStore.adminUser?.orgId ?? null,

    // Member context
    isMember:     !!memberPayload,
    memberEmail:  memberPayload?.email ?? authStore.memberUser?.email ?? null,
    memberId:     memberPayload?.sub   ?? authStore.memberUser?.id    ?? null,
    memberOrgId:  memberPayload?.orgId ?? authStore.memberUser?.orgId ?? null,

    // Shared
    isLoggedIn:   !!(adminPayload || memberPayload),
    orgId:        adminPayload?.orgId ?? memberPayload?.orgId ?? null,

    // Actions
    logoutAdmin,
    logoutMember,
    logoutAll,
  };
}

/**
 * useRequireAdmin — throws to /login if no valid admin token.
 * Use at the top of admin-only page components.
 */
export function useRequireAdmin() {
  const { isAdmin, initialized } = useAuth();

  useEffect(() => {
    if (initialized && !isAdmin) {
      window.location.href = '/login';
    }
  }, [isAdmin, initialized]);

  return { isAdmin, initialized };
}

/**
 * useRequireMember — throws to / if no valid member token.
 * Use at the top of member portal page components.
 */
export function useRequireMember() {
  const { isMember, initialized } = useAuth();

  useEffect(() => {
    if (initialized && !isMember) {
      window.location.href = '/';
    }
  }, [isMember, initialized]);

  return { isMember, initialized };
}