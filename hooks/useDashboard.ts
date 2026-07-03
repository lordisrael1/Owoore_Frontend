import useSWR from 'swr';
import { dashboardApi } from '@/lib/api/dashboard.api';
import { currentPeriod } from '@/lib/format';

/**
 * useDashboard — SWR hook for the admin dashboard overview.
 *
 * Fetches:
 *   - summary:       total collected, members, pending payouts, 6-month trend
 *   - fundBreakdown: per-fund balance, collected, available, tx count
 *
 * Auto-refreshes every 30 seconds — payments arrive continuously on Sundays.
 * Uses SWR's revalidate-on-focus so the dashboard updates when the admin
 * switches back from WhatsApp after checking a member's payment.
 *
 * The period state allows filtering breakdowns by month (YYYY-MM).
 * On initial mount it defaults to currentPeriod() (e.g. "2026-06").
 */

const REFRESH_INTERVAL = 30_000; // 30 seconds

export function useDashboard(period?: string) {
  const activePeriod = period ?? currentPeriod();

  const {
    data:    summaryData,
    error:   summaryError,
    isLoading: summaryLoading,
    mutate:  mutateSummary,
  } = useSWR(
    'dashboard/summary',
    () => dashboardApi.summary(),
    {
      refreshInterval:    REFRESH_INTERVAL,
      revalidateOnFocus:  true,
      revalidateOnReconnect: true,
    },
  );

  const {
    data:    fundData,
    error:   fundError,
    isLoading: fundLoading,
    mutate:  mutateFunds,
  } = useSWR(
    ['dashboard/fund-breakdown', activePeriod],
    () => dashboardApi.fundBreakdown(activePeriod),
    {
      refreshInterval:   REFRESH_INTERVAL,
      revalidateOnFocus: true,
    },
  );

  const {
    data:    payoutHistory,
    isLoading: payoutLoading,
  } = useSWR(
    'dashboard/payout-history',
    () => dashboardApi.payoutHistory(10),
    { refreshInterval: REFRESH_INTERVAL },
  );

  const {
    data:    activity,
    isLoading: activityLoading,
  } = useSWR(
    'dashboard/activity',
    () => dashboardApi.activity(15),
    { refreshInterval: REFRESH_INTERVAL, revalidateOnFocus: true },
  );

  const refresh = async () => {
    await Promise.all([mutateSummary(), mutateFunds()]);
  };

  return {
    // Data
    summary:      summaryData,
    funds:        fundData ?? [],
    payoutHistory: payoutHistory ?? [],
    activity:     activity ?? [],

    // Loading states — granular so each panel can show its own skeleton
    summaryLoading,
    fundLoading,
    payoutLoading,
    activityLoading,
    isLoading: summaryLoading || fundLoading,

    // Errors
    summaryError,
    fundError,
    hasError: !!(summaryError || fundError),

    // Actions
    refresh,
    activePeriod,
  };
}

/**
 * useMemberStatus — separate hook for the member status panel.
 * Fetched on demand (not on dashboard mount) because it's expensive:
 * CROSS JOIN members × fund_types → can be 1000+ rows for large churches.
 */
export function useMemberStatus(period?: string, enabled = true) {
  const activePeriod = period ?? currentPeriod();

  const { data, error, isLoading, mutate } = useSWR(
    enabled ? ['dashboard/member-status', activePeriod] : null,
    () => dashboardApi.memberStatus(activePeriod),
    { refreshInterval: 60_000 }, // refresh every minute — less critical
  );

  return {
    members:   data ?? [],
    isLoading,
    error,
    refresh:   mutate,
  };
}