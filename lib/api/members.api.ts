import { api } from './client';

export interface MemberProfile {
  id:         string;
  name:       string;
  email:      string;
  memberCode: string;
  joinedAt:   string;
}

export interface FundSummary {
  fund_type_id:        string;
  fund_name:           string;
  kind:                'RECURRING' | 'CAMPAIGN';
  total_paid_kobo:     number;
  total_paid_naira:    number;
  expected_amt_kobo:   number | null;
  expected_amt_naira:  number | null;
  deficit_kobo:        number;
  deficit_naira:       number;
  surplus_kobo:        number;
  pledge_progress_pct: number;
  transaction_count:   number;
  last_paid_at:        string | null;
  is_fulfilled:        boolean;
}

export interface MeFundType {
  id:                string;
  name:              string;
  kind:              'RECURRING' | 'CAMPAIGN';
  expected_amt_kobo: number | null;
  expires_at:        string | null;
  sort_order:        number;
  is_shared_va:      boolean;
}

export interface MeResponse {
  member:        MemberProfile;
  org:           { name: string; slug: string; logo_url: string | null; joinLink: string };
  fundTypes:     MeFundType[];   // fund definitions (same as GET /me/funds, no per-member data)
  fundSummaries: FundSummary[];  // per-member pledge/payment tracking per fund
}

export interface Transaction {
  id:             string;
  fund_name:      string;
  period_month:   string;
  amount_kobo:    number;
  payment_status: 'EXACT' | 'UNDERPAYMENT' | 'OVERPAYMENT';
  variance_kobo:  number;
  created_at:     string;
  sender_name:    string | null;
  narration:      string | null;
}

export interface GivingHistoryFilters {
  fund_type_id?: string;
  period?:       string; // YYYY-MM
  limit?:        number;
  offset?:       number;
}

export interface AdminMember {
  id:           string;
  org_id:       string;
  email:        string;
  display_name: string;
  member_code:  string;
  is_active:    boolean;
  joined_at:    string;
}

export interface AdminMembersResponse {
  members: AdminMember[];
  total:   number;
  limit:   number;
  offset:  number;
}

export interface StatementMember {
  name:        string;
  member_code: string;
  joined_at:   string;
}

export interface StatementFundSummary {
  fund_name:           string;
  total_paid_kobo:     number;
  total_paid_display:  string;
  expected_kobo:       number | null;
  expected_display:    string | null;
  deficit_kobo:        number;
  pledge_progress_pct: number;
}

export interface StatementTransaction {
  id:         string | null;
  fund_name:  string;
  amount_kobo: number;
  created_at: string;
  narration:  string | null;
}

export interface MemberStatementResponse {
  member:             StatementMember;
  fund_summary:       StatementFundSummary[];
  transactions:       StatementTransaction[];
  total_paid_display: string;
}

export const membersApi = {
  /**
   * getMe — GET /me
   * Returns authenticated member's profile + fund summaries.
   * Member JWT required.
   */
  getMe: () =>
    api.get<MeResponse>('/me', { tokenType: 'member' }),

  /**
   * givingHistory — GET /me/giving-history
   * Member's transaction history, filterable by fund and period.
   * Member JWT required.
   */
  givingHistory: (filters: GivingHistoryFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.fund_type_id) params.set('fund_type_id', filters.fund_type_id);
    if (filters.period)       params.set('period',       filters.period);
    if (filters.limit)        params.set('limit',        String(filters.limit));
    if (filters.offset)       params.set('offset',       String(filters.offset));
    const qs = params.toString();
    return api.get<Transaction[]>(`/me/giving-history${qs ? `?${qs}` : ''}`, { tokenType: 'member' });
  },

  /**
   * list — GET /members
   * Paginated list of all church members.
   * Admin JWT required.
   */
  list: (limit = 50, offset = 0) =>
    api.get<AdminMembersResponse>(
      `/members?limit=${limit}&offset=${offset}`,
      { tokenType: 'admin' },
    ),

  /**
   * getStatement — GET /members/:id/statement
   * Individual member giving statement.
   * Admin JWT required.
   */
  getStatement: (id: string, year?: number) =>
    api.get<MemberStatementResponse>(`/members/${id}/statement${year ? `?year=${year}` : ''}`, { tokenType: 'admin' }),

  /**
   * downloadStatement — same endpoint with ?format=csv
   * Returns a URL that triggers a CSV download when opened.
   */
  downloadStatementUrl: (id: string, year?: number): string => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? 'https://owoore.onrender.com/api/v1';
    const yr   = year ? `&year=${year}` : '';
    return `${base}/members/${id}/statement?format=csv${yr}`;
  },
};