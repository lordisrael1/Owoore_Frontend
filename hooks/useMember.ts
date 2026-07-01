import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { useState } from 'react';
import { membersApi } from '@/lib/api/members.api';
import { dashboardApi } from '@/lib/api/dashboard.api';
import { currentPeriod } from '@/lib/format';

const PAGE_SIZE = 50;

/**
 * useMembers — paginated member list for the admin dashboard.
 *
 * Uses useSWR with offset pagination rather than infinite scroll —
 * the admin dashboard shows a table with explicit page controls,
 * not an Instagram-style feed.
 */
export function useMembers() {
  const [offset, setOffset] = useState(0);

  const { data, error, isLoading, mutate } = useSWR(
    ['members', offset],
    () => membersApi.list(PAGE_SIZE, offset),
    { revalidateOnFocus: false },
  );

  const nextPage = () => {
    if (data && offset + PAGE_SIZE < data.total) {
      setOffset((o) => o + PAGE_SIZE);
    }
  };

  const prevPage = () => {
    setOffset((o) => Math.max(0, o - PAGE_SIZE));
  };

  const goToPage = (page: number) => {
    setOffset(Math.max(0, (page - 1) * PAGE_SIZE));
  };

  const currentPage  = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages   = data ? Math.ceil(data.total / PAGE_SIZE) : 1;

  return {
    members:      data?.members ?? [],
    total:        data?.total   ?? 0,
    isLoading,
    error,
    hasError:     !!error,

    // Pagination
    offset,
    limit:        PAGE_SIZE,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    goToPage,
    canNext:      data ? offset + PAGE_SIZE < data.total : false,
    canPrev:      offset > 0,

    refresh: mutate,
  };
}

/**
 * useMemberStatement — individual member statement for the detail page.
 */
export function useMemberStatement(memberId: string | null, year?: number) {
  const { data, error, isLoading } = useSWR(
    memberId ? ['member/statement', memberId, year] : null,
    () => membersApi.getStatement(memberId!, year),
  );

  return { statement: data, isLoading, error };
}

/**
 * useMemberStatusTable — the "who paid / who owes" table on the members page.
 * Filters: fund, status (PAID / PARTIAL / UNPAID).
 */
export function useMemberStatusTable(period?: string) {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [fundFilter,   setFundFilter]   = useState<string>('');

  const activePeriod = period ?? currentPeriod();

  const { data, error, isLoading, mutate } = useSWR(
    ['dashboard/member-status', activePeriod],
    () => dashboardApi.memberStatus(activePeriod),
    { revalidateOnFocus: false },
  );

  const filtered = (data ?? []).filter((row) => {
    if (statusFilter && row.payment_status !== statusFilter) return false;
    if (fundFilter   && row.fund_type_id   !== fundFilter)   return false;
    return true;
  });

  return {
    rows:      filtered,
    total:     data?.length ?? 0,
    isLoading,
    error,
    refresh:   mutate,

    // Filters
    statusFilter,
    fundFilter,
    setStatusFilter,
    setFundFilter,
  };
}