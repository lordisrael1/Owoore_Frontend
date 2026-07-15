import { api, downloadFile } from './client';

export interface FundTotalRow {
  fund_type_id:     string;
  fund_name:        string;
  period_month:     string;
  total_collected:  number;
  total_paid_out:   number;
  member_count:     number;
  tx_count:         number;
  collected_display: string;
  period_display:   string;
}

export interface OrgGivingReport {
  year:          number;
  period?:       string;
  fund_totals:   FundTotalRow[];
  arrears_summary: {
    members_with_deficit: number;
    total_deficit_kobo:   number;
  };
}

export interface MemberFundSummaryRow {
  fund_name:           string;
  total_paid_kobo:     number;
  total_paid_display:  string;
  expected_kobo:       number | null;
  expected_display:    string | null;
  pledge_progress_pct: number;
  deficit_kobo:        number;
}

export interface MemberStatementResponse {
  member: {
    id:          string;
    name:        string;
    member_code: string;
    joined_at:   string;
  };
  year:               number;
  total_paid_kobo:    number;
  total_paid_display: string;
  fund_summary:       MemberFundSummaryRow[];
  transactions: Array<{
    fund_name:      string;
    period_month:   string;
    amount_kobo:    number;
    payment_status: string;
    variance_kobo:  number;
    created_at:     string;
    amount_display: string;
    period_display: string;
  }>;
}

export interface ArrearsMember {
  member_id:          string;
  member_name:        string;
  member_code:        string;
  email:              string;
  total_deficit_kobo: number;
  funds: Array<{
    fund_name:    string;
    deficit_kobo: number;
  }>;
}

export const reportsApi = {
  /**
   * givingReport — GET /orgs/:orgId/reports/giving
   * Aggregate fund totals for a year, optional period and fund filter.
   * Returns JSON. Append ?format=csv via downloadGivingUrl() for CSV.
   */
  givingReport: (orgId: string, options: { period?: string; fund_type_id?: string; year?: number } = {}) => {
    const params = new URLSearchParams();
    if (options.period)       params.set('period',       options.period);
    if (options.fund_type_id) params.set('fund_type_id', options.fund_type_id);
    if (options.year)         params.set('year',         String(options.year));
    const qs = params.toString();
    return api.get<OrgGivingReport>(
      `/orgs/${orgId}/reports/giving${qs ? `?${qs}` : ''}`,
      { tokenType: 'admin' },
    );
  },

  /**
   * downloadGiving — fetches the CSV with the Authorization header and
   * saves it via Blob. Replaces the old token-in-URL window.open flow,
   * which leaked the admin JWT into logs, history, and Referers.
   */
  downloadGiving: async (orgId: string, period?: string, fundTypeId?: string): Promise<void> => {
    const params = new URLSearchParams({ format: 'csv' });
    if (period)     params.set('period',       period);
    if (fundTypeId) params.set('fund_type_id', fundTypeId);
    await downloadFile(
      `/orgs/${orgId}/reports/giving?${params.toString()}`,
      `giving-report${period ? `-${period}` : ''}.csv`,
    );
  },

  /**
   * downloadFundSummary — the board-report CSV: one row per fund per month
   * (collected, paid out, net, givers, transactions) with a TOTAL row.
   *
   *   period 'YYYY-MM' → that single month
   *   year (default current) → every month in the year
   */
  downloadFundSummary: async (orgId: string, opts: { period?: string; year?: number } = {}): Promise<void> => {
    const params = new URLSearchParams({ format: 'csv', view: 'summary' });
    if (opts.period)    params.set('period', opts.period);
    else if (opts.year) params.set('year',   String(opts.year));
    const scope = opts.period ?? opts.year ?? new Date().getFullYear();
    await downloadFile(
      `/orgs/${orgId}/reports/giving?${params.toString()}`,
      `fund-summary-${scope}.csv`,
    );
  },

  /**
   * memberStatement — GET /members/:id/statement
   * Full giving history for one member — JSON.
   */
  memberStatement: (id: string, year?: number) =>
    api.get<MemberStatementResponse>(
      `/members/${id}/statement${year ? `?year=${year}` : ''}`,
      { tokenType: 'admin' },
    ),

  /**
   * arrears — GET /reports/arrears
   * All members with outstanding balances — used for the arrears page
   * and feeds the Monday reminder job on the backend.
   */
  arrears: () =>
    api.get<ArrearsMember[]>('/reports/arrears', { tokenType: 'admin' }),
};