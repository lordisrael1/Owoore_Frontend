import useSWR from 'swr';
import { payoutsApi } from '@/lib/api/payouts.api';

/**
 * useBankList — cached bank list from Nomba via backend.
 *
 * GET /payouts/banks → proxied from Nomba GET /v1/transfers/banks
 *
 * Caching strategy (Nomba docs: "bank codes rarely change"):
 *   - SWR deduplication window: 1 hour
 *   - No revalidate on focus/reconnect
 *   - The backend also caches this for 24 hours
 *
 * Result used in:
 *   - Initiate payout form (bank selector)
 *   - BankLookupStep (validateBankCode before lookup)
 *
 * Returns:
 *   banks: Array<{ label: string; value: string }>
 *   where value = CBN bank code (e.g. "058" for GTBank)
 */
export function useBankList() {
  const { data, error, isLoading } = useSWR(
    'banks',
    () => payoutsApi.getBankList(),
    {
      revalidateOnFocus:     false,
      revalidateOnReconnect: false,
      dedupingInterval:      3_600_000, // 1 hour — bank codes change maybe once a year
    },
  );

  const getBankName = (code: string): string => {
    return data?.find((b) => b.value === code)?.label ?? code;
  };

  const getBankCode = (name: string): string | undefined => {
    const lower = name.toLowerCase();
    return data?.find(
      (b) => b.label.toLowerCase().includes(lower) || lower.includes(b.label.toLowerCase()),
    )?.value;
  };

  return {
    banks:       data ?? [],
    isLoading,
    error,
    hasError:    !!error,
    getBankName,
    getBankCode,
  };
}