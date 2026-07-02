import { api } from './client';

export interface DashboardSummary {
  total_collected_all_time_kobo: number;
  total_paid_out_all_time_kobo:  number;
  available_balance_kobo:        number;
  pending_payouts_kobo:          number;
  active_members:                number;
  total_transactions:            number;
  period_month:                  string;
  deficit_member_count:          number;
  total_collected_display:       string;
  available_display:             string;
  pending_payouts_display:       string;
  trend: Array<{
    period_month:         string;
    total_collected_kobo: number;
    total_paid_out_kobo:  number;
    transaction_count:    number;
    collected_display:    string;
  }>;
}

export interface FundBreakdownItem {
  fund_type_id:         string;
  fund_name:            string;
  kind:                 'RECURRING' | 'CAMPAIGN';
  total_collected_kobo: number;
  total_paid_out_kobo:  number;
  soft_lock_kobo:       number;
  available_kobo:       number;
  member_count_paid:    number;
  total_transactions:   number;
  collected_display:    string;
  available_display:    string;
}

export interface MemberStatusItem {
  member_id:          string;
  member_name:        string;
  member_code:        string;
  fund_type_id:       string;
  fund_name:          string;
  total_paid_kobo:    number;
  expected_kobo:      number | null;
  deficit_kobo:       number;
  payment_status:     'PAID' | 'PARTIAL' | 'UNPAID';
  transaction_count:  number;
  total_paid_display: string;
  expected_display:   string | null;
  deficit_display:    string | null;
}

export interface PayoutHistoryItem {
  id:             string;
  fund_name:      string;
  amount_kobo:    number;
  purpose:        string;
  status:         string;
  initiated_by:   string;
  executed_at:    string | null;
  created_at:     string;
  bank_name:      string;
  account_number: string;
  amount_display: string;
}

export const dashboardApi = {
  /**
   * summary — GET /dashboard/summary
   * Top-level metrics: total collected, members, pending payouts, 6-month trend.
   * Auto-refresh every 30s recommended — new payments arrive continuously.
   */
  summary: () =>
    api.get<DashboardSummary>('/dashboard/summary', { tokenType: 'admin' }),

  /**
   * fundBreakdown — GET /dashboard/fund-breakdown
   * Per-fund balance, paid out, available, and transaction count.
   * Optional period filter: ?period=2026-06
   */
  fundBreakdown: (period?: string) =>
    api.get<FundBreakdownItem[]>(
      `/dashboard/fund-breakdown${period ? `?period=${period}` : ''}`,
      { tokenType: 'admin' },
    ),

  /**
   * memberStatus — GET /dashboard/member-status
   * Who paid, who owes, deficit amounts — CROSS JOIN members × funds.
   * The "Sunday morning view" for the treasurer.
   */
  memberStatus: (period?: string) =>
    api.get<MemberStatusItem[]>(
      `/dashboard/member-status${period ? `?period=${period}` : ''}`,
      { tokenType: 'admin' },
    ),

  /**
   * payoutHistory — GET /dashboard/payout-history
   * Recent payout requests and their current status.
   */
  payoutHistory: (limit = 20) =>
    api.get<PayoutHistoryItem[]>(
      `/dashboard/payout-history?limit=${limit}`,
      { tokenType: 'admin' },
    ),
};