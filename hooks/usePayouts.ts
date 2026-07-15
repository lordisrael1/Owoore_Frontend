import useSWR, { mutate as globalMutate } from 'swr';
import { useState, useCallback } from 'react';
import { payoutsApi } from '@/lib/api/payouts.api';
import type { PayoutStatus } from '@/lib/api/payouts.api';

/**
 * revalidatePayoutData — refresh every money-bearing view immediately
 * after a payout mutation (initiate/cancel), instead of waiting up to 30s
 * for the poll. Two admins acting on stale balances compounds the risk of
 * over-committing a fund; fresh data narrows that window to ~0.
 */
export async function revalidatePayoutData(): Promise<void> {
  await Promise.all([
    globalMutate('payouts/fund-balances'),
    globalMutate('payouts/pending-count'),
    globalMutate('dashboard/summary'),
    globalMutate('dashboard/payout-history'),
    globalMutate((key) =>
      Array.isArray(key) &&
      ['payouts', 'payout', 'dashboard/fund-breakdown'].includes(key[0] as string)),
  ]);
}

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
    await Promise.all([mutate(), revalidatePayoutData()]);
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
    await Promise.all([mutate(), revalidatePayoutData()]);
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
 * usePayoutFundBalances — per-fund available balance for the initiate form.
 * Refreshes on focus so the admin sees a fresh balance after a transfer settles.
 */
export function usePayoutFundBalances() {
  const { data, error, isLoading, mutate } = useSWR(
    'payouts/fund-balances',
    () => payoutsApi.getFundBalances(),
    { revalidateOnFocus: true },
  );

  return {
    fundBalances:    data?.funds ?? [],
    transferFeeKobo: data?.transfer_fee_kobo ?? 2_000, // ₦20 fallback — matches backend default
    isLoading,
    error,
    hasError:        !!error,
    refresh:         mutate,
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