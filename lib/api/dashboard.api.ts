import { api } from './client';

export interface DashboardSummary {
  total_collected_all_time_kobo: number;
  total_paid_out_all_time_kobo:  number;
  total_fees_all_time_kobo:      number;
  available_balance_kobo:        number;
  pending_payouts_kobo:          number;
  active_members:                number;
  total_transactions:            number;
  period_month:                  string;
  deficit_member_count:          number;
  total_collected_display:       string;
  available_display:             string;
  pending_payouts_display:       string;
  total_fees_display:            string;
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
  is_shared_va:         boolean;   // one org-wide VA (e.g. Offering) — no per-member tracking
  is_anonymous_only:    boolean;   // Anonymous Giving — names never recorded
  total_collected_kobo: number;
  total_paid_out_kobo:  number;
  total_fees_kobo:      number;
  soft_lock_kobo:       number;
  available_kobo:       number;
  member_count_paid:    number;
  total_transactions:   number;
  collected_display:    string;
  fees_display:         string;
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

export interface LedgerTransaction {
  id:             string;
  source:         'MEMBER' | 'ANONYMOUS';
  member_id:      string | null;
  member_name:    string | null;   // null on anonymous rows — by design
  member_code:    string | null;
  fund_type_id:   string;
  fund_name:      string;
  amount_kobo:    number;
  payment_status: string;          // EXACT | UNDERPAYMENT | OVERPAYMENT
  variance_kobo:  number;
  sender_bank:    string | null;
  narration:      string | null;
  period_month:   string;
  created_at:     string;
  amount_display: string;
}

export interface LedgerResponse {
  total:        number;
  limit:        number;
  offset:       number;
  transactions: LedgerTransaction[];
}

export interface ActivityFeedItem {
  id:     string;
  type:   'payment' | 'payout' | 'member' | 'campaign' | 'system';
  title:  string;
  desc:   string;
  time:   string;
  action: string;
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

  /**
   * transactions — GET /dashboard/transactions
   * Org-wide giving ledger: member payments + anonymous inflows, newest
   * first, paginated. Anonymous rows never carry sender identity.
   */
  transactions: (opts: {
    fundTypeId?: string;
    period?:     string;
    limit?:      number;
    offset?:     number;
  } = {}) => {
    const params = new URLSearchParams();
    if (opts.fundTypeId) params.set('fund_type_id', opts.fundTypeId);
    if (opts.period)     params.set('period',       opts.period);
    if (opts.limit)      params.set('limit',        String(opts.limit));
    if (opts.offset)     params.set('offset',       String(opts.offset));
    const qs = params.toString();
    return api.get<LedgerResponse>(
      `/dashboard/transactions${qs ? `?${qs}` : ''}`,
      { tokenType: 'admin' },
    );
  },

  /**
   * activity — GET /dashboard/activity
   * Recent audit_log events pre-shaped for <ActivityFeed>:
   * payments in, members joining, payouts moving, invites sent.
   */
  activity: (limit = 15) =>
    api.get<ActivityFeedItem[]>(
      `/dashboard/activity?limit=${limit}`,
      { tokenType: 'admin' },
    ),
};