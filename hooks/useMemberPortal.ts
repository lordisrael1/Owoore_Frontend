import useSWR from 'swr';
import { membersApi } from '@/lib/api/members.api';

/**
 * useMemberPortal — GET /me — the member portal home hook.
 *
 * Returns:
 *   - member profile (name, email, memberCode, joinedAt)
 *   - org info (name, slug, logo, joinLink)
 *   - fundSummaries (per-fund pledge progress, deficit, total paid)
 *
 * This is the primary data source for the member portal.
 * Refreshes every 60 seconds — less critical than admin dashboard
 * since members typically check once, pay, then check again.
 *
 * Token type: member (email OTP auth)
 */
export function useMemberPortal() {
  const { data, error, isLoading, mutate } = useSWR(
    'member/me',
    () => membersApi.getMe(),
    {
      revalidateOnFocus:  true,
      refreshInterval:    60_000,
    },
  );

  const summaries = data?.fundSummaries ?? [];

  return {
    member:        data?.member,
    org:           data?.org,
    fundSummaries: summaries,

    isLoading,
    error,
    hasError:      !!error,
    refresh:       mutate,

    fundsWithDeficit: summaries.filter((s) => s.deficit_kobo > 0 && !s.is_fulfilled),
    totalPaid:        summaries.reduce((sum, s) => sum + s.total_paid_kobo, 0),
  };
}