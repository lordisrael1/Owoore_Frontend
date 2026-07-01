/**
 * tokens.ts
 *
 * Single source of truth for JWT storage in Owoore.
 *
 * Two completely separate token keys:
 *   owoore_member_token — member portal (email OTP auth)
 *   owoore_admin_token  — admin dashboard (email + password auth)
 *
 * A member and an admin can both be "logged in" simultaneously
 * on the same browser (e.g. a treasurer who is also a church member).
 * They use separate keys so the tokens never collide.
 *
 * All functions guard against SSR (typeof window check).
 */

const MEMBER_KEY = 'owoore_member_token';
const ADMIN_KEY  = 'owoore_admin_token';

// ── Member token ──────────────────────────────────────────────────────────────

export function getMemberToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(MEMBER_KEY);
}

export function setMemberToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MEMBER_KEY, token);
}

export function clearMemberToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(MEMBER_KEY);
}

export function hasMemberToken(): boolean {
  return getMemberToken() !== null;
}

// ── Admin token ───────────────────────────────────────────────────────────────

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ADMIN_KEY);
}

export function setAdminToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_KEY, token);
}

export function clearAdminToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_KEY);
}

export function hasAdminToken(): boolean {
  return getAdminToken() !== null;
}

// ── Generic helpers (used by client.ts) ───────────────────────────────────────

export function getToken(type: 'member' | 'admin'): string | null {
  return type === 'member' ? getMemberToken() : getAdminToken();
}

export function setToken(type: 'member' | 'admin', token: string): void {
  if (type === 'member') setMemberToken(token);
  else setAdminToken(token);
}

export function clearToken(type: 'member' | 'admin'): void {
  if (type === 'member') clearMemberToken();
  else clearAdminToken();
}

// ── Clear all (full logout) ───────────────────────────────────────────────────

export function clearAllTokens(): void {
  clearMemberToken();
  clearAdminToken();
}