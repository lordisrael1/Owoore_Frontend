import useSWR from 'swr';
import { useCallback } from 'react';
import { signatoriesApi } from '@/lib/api/signatories.api';
import type { CreateSignatoryInput, UpdateSignatoryInput, UpdatePolicyInput } from '@/lib/api/signatories.api';

/**
 * useSignatories — signatories + payout policy for the settings page.
 *
 * Fetches both lists together — they're always shown on the same page
 * and neither changes frequently (admin-only mutations).
 */
export function useSignatories() {
  const {
    data:      signatories,
    error:     sigError,
    isLoading: sigLoading,
    mutate:    mutateSig,
  } = useSWR(
    'signatories',
    () => signatoriesApi.list(),
    { revalidateOnFocus: false },
  );

  const {
    data:      policy,
    error:     policyError,
    isLoading: policyLoading,
    mutate:    mutatePolicy,
  } = useSWR(
    'signatories/policy',
    () => signatoriesApi.getPolicy(),
    { revalidateOnFocus: false },
  );

  const createSignatory = useCallback(async (input: CreateSignatoryInput) => {
    const result = await signatoriesApi.create(input);
    await mutateSig();
    return result;
  }, [mutateSig]);

  const updateSignatory = useCallback(async (id: string, input: UpdateSignatoryInput) => {
    const result = await signatoriesApi.update(id, input);
    await mutateSig();
    return result;
  }, [mutateSig]);

  const removeSignatory = useCallback(async (id: string) => {
    await signatoriesApi.remove(id);
    await mutateSig();
  }, [mutateSig]);

  const updatePolicy = useCallback(async (input: UpdatePolicyInput) => {
    const result = await signatoriesApi.updatePolicy(input);
    await mutatePolicy();
    return result;
  }, [mutatePolicy]);

  const activeApprovers = (signatories ?? []).filter((s) => s.can_approve && s.is_active);

  return {
    signatories:      signatories ?? [],
    policy,
    activeApprovers,
    approverCount:    activeApprovers.length,

    isLoading:        sigLoading || policyLoading,
    sigLoading,
    policyLoading,

    error:            sigError ?? policyError,
    sigError,
    policyError,

    refresh:          async () => { await mutateSig(); await mutatePolicy(); },

    // Actions
    createSignatory,
    updateSignatory,
    removeSignatory,
    updatePolicy,
  };
}