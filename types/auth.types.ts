/**
 * auth.types.ts — JWT payload shapes for member and admin tokens.
 * These are decoded from the JWT in lib/auth/decode.ts.
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

// Type guards
export function isMemberPayload(p: TokenPayload): p is MemberTokenPayload {
  return p.role === 'MEMBER';
}

export function isAdminPayload(p: TokenPayload): p is AdminTokenPayload {
  return p.role !== 'MEMBER';
}

export function isAdmin(p: TokenPayload): boolean {
  return p.role === 'ADMIN';
}

export function isTreasurer(p: TokenPayload): boolean {
  return p.role === 'TREASURER';
}

// Auth state shapes used in Zustand authStore
export interface AdminUser {
  id:    string;
  email: string;
  role:  AdminRole;
  orgId: string;
}

export interface MemberUser {
  id:    string;
  email: string;
  orgId: string;
}

export interface AuthState {
  adminToken:  string | null;
  memberToken: string | null;
  adminUser:   AdminUser  | null;
  memberUser:  MemberUser | null;
}