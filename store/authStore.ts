import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * authStore.ts — Zustand auth state.
 *
 * Stores JWT tokens and minimal user objects in memory + localStorage.
 * Persisted so the auth state survives page refreshes.
 *
 * Two separate auth contexts coexist:
 *   admin  → email + password → full dashboard access
 *   member → email OTP        → member portal access
 *
 * The store does NOT decode/verify tokens — that's lib/auth/decode.ts.
 * The store only holds the raw tokens and their decoded payloads.
 */

interface AdminUser {
  id:    string;
  email: string;
  role:  string;
  orgId: string;
}

interface MemberUser {
  id:    string;
  email: string;
  orgId: string;
}

interface AuthState {
  adminToken:  string | null;
  memberToken: string | null;
  adminUser:   AdminUser | null;
  memberUser:  MemberUser | null;

  // Actions
  setAdmin:    (token: string, user: AdminUser)  => void;
  setMember:   (token: string, user: MemberUser) => void;
  clearAdmin:  () => void;
  clearMember: () => void;
  clearAll:    () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      adminToken:  null,
      memberToken: null,
      adminUser:   null,
      memberUser:  null,

      setAdmin: (token, user) =>
        set({ adminToken: token, adminUser: user }),

      setMember: (token, user) =>
        set({ memberToken: token, memberUser: user }),

      clearAdmin: () =>
        set({ adminToken: null, adminUser: null }),

      clearMember: () =>
        set({ memberToken: null, memberUser: null }),

      clearAll: () =>
        set({ adminToken: null, adminUser: null, memberToken: null, memberUser: null }),
    }),
    {
      name:    'owoore-auth',
      storage: createJSONStorage(() => localStorage),
      // Only persist user objects — tokens are also in localStorage separately
      // (client.ts reads them directly). The store is for the decoded user data.
      partialize: (state) => ({
        adminUser:  state.adminUser,
        memberUser: state.memberUser,
        // Don't persist raw tokens in Zustand — they're already in localStorage
        // under dedicated keys (owoore_admin_token, owoore_member_token)
      }),
    },
  ),
);