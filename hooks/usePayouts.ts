import useSWR from 'swr';
import { useState, useCallback } from 'react';
import { payoutsApi } from '@/lib/api/payouts.api';
import type { PayoutStatus } from '@/lib/api/payouts.api';

/**
 * usePayouts — payout request list for the admin dashboard.
 *
 * Supports status filter:
 *   undefined → all payouts
 *   'PENDING' | 'PARTIAL' → awaiting approval (dashboard badge count)
 *   'TRANSFERRED'         → completed payouts (history view)
 *   'FAILED'              → failed transfers (action required)
 */
export function usePayouts(initialStatus?: PayoutStatus) {
  const [statusFilter, setStatusFilter] = useState<PayoutStatus | undefined>(initialStatus);
  const [offset,       setOffset]       = useState(0);
  const limit = 20;

  const { data, error, isLoading, mutate } = useSWR(
    ['payouts', statusFilter, offset],
    () => payoutsApi.list({ status: statusFilter, limit, offset }),
    {
      revalidateOnFocus:  true,
      refreshInterval:    30_000, // refresh every 30s — approval status can change
    },
  );

  const cancelPayout = useCallback(async (id: string) => {
    await payoutsApi.cancel(id);
    await mutate();
  }, [mutate]);

  // Count pending payouts — used for the sidebar badge
  const { data: pendingData } = useSWR(
    'payouts/pending-count',
    () => payoutsApi.list({ status: 'PENDING', limit: 1, offset: 0 }),
    { refreshInterval: 30_000 },
  );

  return {
    payouts:        data ?? [],
    isLoading,
    error,
    hasError:       !!error,
    refresh:        mutate,

    // Filters
    statusFilter,
    setStatusFilter,

    // Pagination
    offset,
    limit,
    setOffset,
    canNext:        (data?.length ?? 0) >= limit,
    canPrev:        offset > 0,

    // Actions
    cancelPayout,

    // Badge data
    pendingCount: pendingData?.length ?? 0,
  };
}

/**
 * usePayoutDetail — single payout with full approval history.
 * Used on the payout detail page.
 */
export function usePayoutDetail(payoutId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    payoutId ? ['payout', payoutId] : null,
    () => payoutsApi.get(payoutId!),
    { refreshInterval: 15_000 }, // refresh more frequently — approval can happen any moment
  );

  const cancel = useCallback(async () => {
    if (!payoutId) return;
    await payoutsApi.cancel(payoutId);
    await mutate();
  }, [payoutId, mutate]);

  return {
    payout:    data,
    isLoading,
    error,
    refresh:   mutate,
    cancel,
  };
}

/**
 * useBankList — cached bank list from Nomba via backend.
 * Used in the initiate payout form bank selector.
 * SWR cache = no repeat fetches across the session.
 */
export function useBankList() {
  const { data, error, isLoading } = useSWR(
    'payouts/banks',
    () => payoutsApi.getBankList(),
    {
      revalidateOnFocus:     false,
      revalidateOnReconnect: false,
      dedupingInterval:      3_600_000, // 1 hour — bank list rarely changes
    },
  );

  return {
    banks:     data ?? [],
    isLoading,
    error,
  };
}