import useSWR from 'swr';
import { useCallback, useState } from 'react';
import { vaApi } from '@/lib/api/va.api';
import type { VirtualAccount } from '@/lib/api/va.api';

/**
 * useVirtualAccount — GET or create a VA for a fund.
 *
 * The lazy creation pattern:
 *   1. On mount, check if a VA already exists for this member + fund (GET /me/accounts)
 *   2. If yes → return immediately (no Nomba API call)
 *   3. If no → call POST /me/funds/:fundId/account to create one via Nomba
 *
 * The `trigger` function is called explicitly when the member taps
 * "Get my account number" — not on page load — to avoid creating
 * VAs for funds the member never uses.
 *
 * Token type: member (email OTP auth)
 */
export function useVirtualAccount(fundId: string | null) {
  const [va,       setVa]       = useState<VirtualAccount | null>(null);
  const [creating, setCreating] = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  /**
   * create — POST /me/funds/:fundId/account
   * Called when the member taps a fund card.
   * If the VA already exists, the backend returns it instantly (DB hit, no Nomba).
   */
  const create = useCallback(async () => {
    if (!fundId) return;
    setCreating(true);
    setError(null);
    try {
      const result = await vaApi.getOrCreate(fundId);
      setVa(result);
      return result;
    } catch (err: any) {
      setError(err.message ?? 'Could not generate account number. Please try again.');
    } finally {
      setCreating(false);
    }
  }, [fundId]);

  const clear = useCallback(() => {
    setVa(null);
    setError(null);
  }, []);

  return {
    va,
    creating,
    error,
    create,
    clear,
    hasVa: va !== null,
  };
}

/**
 * useAllVAs — GET /me/accounts
 * All virtual accounts the member has across all funds.
 * Used on the "My Accounts" page.
 */
export function useAllVAs() {
  const { data, error, isLoading, mutate } = useSWR(
    'member/accounts',
    () => vaApi.listAll(),
    { revalidateOnFocus: true },
  );

  return {
    accounts:  data ?? [],
    isLoading,
    error,
    refresh:   mutate,
  };
}