import useSWR from 'swr';
import { useState } from 'react';
import { membersApi } from '@/lib/api/members.api';
import { currentPeriod } from '@/lib/format';
import type { GivingHistoryFilters } from '@/lib/api/members.api';

/**
 * useGivingHistory — member's transaction history with filters.
 *
 * GET /me/giving-history?fund_type_id=...&period=...&limit=...&offset=...
 *
 * Filters:
 *   fundTypeId  — show only one fund (default: all funds)
 *   period      — YYYY-MM (default: show all time)
 *   limit       — rows per page (default: 20)
 *
 * Token type: member
 */
export function useGivingHistory() {
  const [fundTypeId, setFundTypeId] = useState<string | undefined>();
  const [period,     setPeriod]     = useState<string | undefined>();
  const [offset,     setOffset]     = useState(0);
  const limit = 20;

  const filters: GivingHistoryFilters = {
    fund_type_id: fundTypeId,
    period,
    limit,
    offset,
  };

  // Build stable SWR key from filters
  const key = ['member/giving-history', fundTypeId ?? 'all', period ?? 'all', offset];

  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => membersApi.givingHistory(filters),
    { revalidateOnFocus: true },
  );

  const clearFilters = () => {
    setFundTypeId(undefined);
    setPeriod(undefined);
    setOffset(0);
  };

  const hasFilters = !!(fundTypeId || period);

  return {
    transactions: data ?? [],
    isLoading,
    error,
    refresh:      mutate,

    // Filters
    fundTypeId,
    period,
    setFundTypeId: (id: string | undefined) => { setFundTypeId(id); setOffset(0); },
    setPeriod:     (p:  string | undefined) => { setPeriod(p);     setOffset(0); },
    clearFilters,
    hasFilters,

    // Pagination
    offset,
    limit,
    setOffset,
    canNext: (data?.length ?? 0) >= limit,
    canPrev: offset > 0,
  };
}