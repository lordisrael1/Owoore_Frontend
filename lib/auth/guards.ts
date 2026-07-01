/**
 * guards.ts
 *
 * Route protection for client-side navigation.
 * Called at the top of protected pages to redirect unauthenticated users.
 *
 * For server-side protection, use proxy.ts (faster — runs at edge).
 * These guards are the client-side fallback for pages that need
 * the token value before rendering.
 *
 * Usage in a page component:
 *   'use client';
 *   import { useEffect } from 'react';
 *   import { requireAdmin } from '@/lib/auth/guards';
 *
 *   export default function DashboardPage() {
 *     useEffect(() => { requireAdmin(); }, []);
 *     // ...
 *   }
 */

import { getMemberToken, getAdminToken } from './token';
import { decodeMemberToken, decodeAdminToken } from './decode';
import type { AdminRole } from './decode';

/**
 * requireMember — redirects to /join if no valid member token.
 * Used on all /portal/* pages.
 */
export function requireMember(redirectTo = '/'): void {
  if (typeof window === 'undefined') return;

  const token   = getMemberToken();
  const payload = decodeMemberToken(token);

  if (!payload) {
    clearMemberSession();
    window.location.href = redirectTo;
  }
}

/**
 * requireAdmin — redirects to /login if no valid admin token.
 * Used on all /dashboard/* pages.
 * Optionally pass allowedRoles to restrict to ADMIN only (not TREASURER).
 */
export function requireAdmin(
  allowedRoles: AdminRole[] = ['ADMIN', 'TREASURER'],
  redirectTo = '/login',
): void {
  if (typeof window === 'undefined') return;

  const token   = getAdminToken();
  const payload = decodeAdminToken(token);

  if (!payload) {
    clearAdminSession();
    window.location.href = redirectTo;
    return;
  }

  if (!allowedRoles.includes(payload.role)) {
    // Authenticated but wrong role — redirect to dashboard home, not login
    window.location.href = '/dashboard';
  }
}

/**
 * getCurrentMember — returns the decoded member payload or null.
 * Non-redirecting — use in UI to conditionally show content.
 */
export function getCurrentMember() {
  const token = getMemberToken();
  return decodeMemberToken(token);
}

/**
 * getCurrentAdmin — returns the decoded admin payload or null.
 */
export function getCurrentAdmin() {
  const token = getAdminToken();
  return decodeAdminToken(token);
}

/**
 * isAdmin — returns true if the current user has an admin/treasurer role.
 * Does NOT redirect — use for conditional UI only.
 */
export function isAdmin(): boolean {
  return getCurrentAdmin() !== null;
}

/**
 * isMember — returns true if the current user has a member token.
 */
export function isMember(): boolean {
  return getCurrentMember() !== null;
}

/**
 * hasRole — checks if the admin has a specific role.
 */
export function hasRole(role: AdminRole): boolean {
  const admin = getCurrentAdmin();
  return admin?.role === role;
}

// ── Session cleanup ───────────────────────────────────────────────────────────

function clearMemberSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('owoore_member_token');
  }
}

function clearAdminSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('owoore_admin_token');
  }
}