import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * orgStore.ts — current church org context.
 *
 * Persisted to localStorage so the admin doesn't need to re-fetch
 * the org details on every page refresh.
 *
 * Set on:
 *   - Admin login  (from JWT payload + org registration response)
 *   - Org settings update (name/logo changes reflect immediately)
 *
 * Read by:
 *   - AdminSidebar (org name, logo display)
 *   - useFunds (orgId for GET /orgs/:orgId/funds)
 *   - Dashboard API calls (scoped to this org)
 *   - Report downloads (orgId in URL)
 */

interface OrgState {
  orgId:   string | null;
  name:    string | null;
  slug:    string | null;
  logoUrl: string | null;

  // Actions
  setOrg:  (org: { orgId: string; name: string; slug: string; logoUrl?: string | null }) => void;
  clear:   () => void;
  updateName:    (name: string)    => void;
  updateLogoUrl: (url: string | null) => void;
}

export const useOrgStore = create<OrgState>()(
  persist(
    (set) => ({
      orgId:   null,
      name:    null,
      slug:    null,
      logoUrl: null,

      setOrg: ({ orgId, name, slug, logoUrl }) =>
        set({ orgId, name, slug, logoUrl: logoUrl ?? null }),

      clear: () =>
        set({ orgId: null, name: null, slug: null, logoUrl: null }),

      updateName: (name) =>
        set({ name }),

      updateLogoUrl: (logoUrl) =>
        set({ logoUrl }),
    }),
    {
      name:    'owoore-org',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);