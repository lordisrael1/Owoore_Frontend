/**
 * decode.ts
 *
 * Decodes the payload from a JWT without verifying the signature.
 * Verification happens on the server — the frontend just needs
 * to read non-sensitive claims like orgId, role, sub, and exp.
 *
 * NEVER use decoded claims for security decisions on the frontend.
 * They are used only for UI rendering (e.g. showing the user's name,
 * routing to the correct org, checking role for conditional UI).
 */

export type AdminRole = 'ADMIN' | 'TREASURER' | 'SIGNATORY';

export interface MemberTokenPayload {
  sub:   string;  // member ID
  orgId: string;
  email: string;
  role:  'MEMBER';
  iat:   number;
  exp:   number;
}

export interface AdminTokenPayload {
  sub:   string;  // admin_user ID
  orgId: string;
  email: string;
  role:  AdminRole;
  iat:   number;
  exp:   number;
}

export type TokenPayload = MemberTokenPayload | AdminTokenPayload;

/**
 * decodeToken — decodes the base64 JWT payload.
 * Returns null if the token is missing, malformed, or expired.
 */
export function decodeToken<T extends TokenPayload = TokenPayload>(
  token: string | null,
): T | null {
  if (!token) return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Base64url → base64 → JSON
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json   = atob(base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '='));
    const payload: T = JSON.parse(json);

    // Check expiry
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return null; // expired
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * decodeMemberToken — typed decode for the member JWT.
 */
export function decodeMemberToken(token: string | null): MemberTokenPayload | null {
  const payload = decodeToken<MemberTokenPayload>(token);
  if (!payload || payload.role !== 'MEMBER') return null;
  return payload;
}

/**
 * decodeAdminToken — typed decode for the admin JWT.
 */
export function decodeAdminToken(token: string | null): AdminTokenPayload | null {
  const payload = decodeToken(token);
  if (!payload || !(['ADMIN', 'TREASURER', 'SIGNATORY'] as AdminRole[]).includes(payload.role as AdminRole)) return null;
  return payload as AdminTokenPayload;
}

/**
 * isTokenExpired — checks expiry without throwing.
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  const payload = decodeToken(token);
  return payload === null;
}

/**
 * getOrgIdFromToken — extracts orgId from whichever token is present.
 * Used by API calls that need the orgId without a full React context.
 */
export function getOrgIdFromToken(token: string | null): string | null {
  const payload = decodeToken(token);
  return payload?.orgId ?? null;
}