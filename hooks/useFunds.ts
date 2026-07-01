import useSWR from 'swr';
import { useCallback } from 'react';
import { fundsApi } from '@/lib/api/funds.api';
import { useOrgStore } from '@/store/orgStore';
import { useAuth } from '@/hooks/useAuth';
import type { CreateFundInput, UpdateFundInput } from '@/lib/api/funds.api';

/**
 * useFunds — fund types for the current org.
 *
 * Fetched via GET /orgs/:orgId/funds.
 * The orgId comes from the Zustand org store (set on admin login).
 *
 * Used on:
 *   - Admin dashboard sidebar (fund names for navigation)
 *   - Fund types management page
 *   - Initiate payout form (fund selector)
 *   - Member portal (fund cards)
 */
export function useFunds(includeInactive = false) {
  const orgId = useOrgStore((s) => s.orgId);

  const { data, error, isLoading, mutate } = useSWR(
    orgId ? ['funds', orgId, includeInactive] : null,
    () => fundsApi.list(orgId!, includeInactive),
    { revalidateOnFocus: false },
  );

  /**
   * createFund — POST /orgs/:orgId/funds
   * Optimistically updates the local list, then revalidates.
   */
  const createFund = useCallback(async (input: CreateFundInput) => {
    if (!orgId) throw new Error('No org context');
    const created = await fundsApi.create(orgId, input);
    await mutate(); // revalidate — don't optimistic update to avoid stale sort_order
    return created;
  }, [orgId, mutate]);

  /**
   * updateFund — PATCH /funds/:id
   */
  const updateFund = useCallback(async (id: string, input: UpdateFundInput) => {
    const updated = await fundsApi.update(id, input);
    await mutate();
    return updated;
  }, [mutate]);

  /**
   * deactivateFund — DELETE /funds/:id
   * Soft-delete — the fund still exists in the DB, just hidden.
   */
  const deactivateFund = useCallback(async (id: string) => {
    const result = await fundsApi.deactivate(id);
    await mutate();
    return result;
  }, [mutate]);

  const activeFunds   = (data ?? []).filter((f) => f.is_active);
  const inactiveFunds = (data ?? []).filter((f) => !f.is_active);

  return {
    funds:          data ?? [],
    activeFunds,
    inactiveFunds,
    isLoading,
    error,
    hasError:       !!error,
    refresh:        mutate,

    // Mutation actions
    createFund,
    updateFund,
    deactivateFund,

    // Helpers
    getFundById:    (id: string) => (data ?? []).find((f) => f.id === id),
    fundOptions:    activeFunds.map((f) => ({ label: f.name, value: f.id })),
  };
}

/**
 * useFundDetail — single fund detail + edit page.
 */
export function useFundDetail(fundId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    fundId ? ['fund', fundId] : null,
    () => fundsApi.get(fundId!),
  );

  return { fund: data, isLoading, error, refresh: mutate };
}

/**
 * useMemberFunds — fund types for the member portal.
 *
 * Fetched via GET /orgs/:orgId/funds with the MEMBER token (fundsApi.listPublic),
 * using the orgId from the member's own JWT — not the admin org store.
 *
 * useFunds() above is admin-authenticated and reads orgId from the admin-only
 * org store; using it on /portal pages either fetches nothing (no admin orgId)
 * or, worse, fires a 401 that triggers client.ts's admin-session redirect to
 * /login from inside a member page. This hook exists so portal pages never
 * touch the admin auth path.
 */
export function useMemberFunds() {
  const { memberOrgId } = useAuth();

  const { data, error, isLoading, mutate } = useSWR(
    memberOrgId ? ['member-funds', memberOrgId] : null,
    () => fundsApi.listPublic(),
    { revalidateOnFocus: false },
  );

  // /me/funds already filters is_active = TRUE and is_anonymous_only = FALSE
  // on the backend — is_active isn't in the SELECT so filtering here would
  // empty the list. Return data directly.
  const activeFunds = data ?? [];

  return {
    funds:        activeFunds,
    activeFunds,
    isLoading,
    error,
    hasError:     !!error,
    refresh:      mutate,
    getFundById:  (id: string) => (data ?? []).find((f) => f.id === id),
  };
}