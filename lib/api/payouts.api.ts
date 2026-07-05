import { api } from './client';

export type PayoutStatus =
  | 'PENDING'
  | 'PARTIAL'
  | 'APPROVED'
  | 'TRANSFERRING'
  | 'TRANSFERRED'
  | 'DECLINED'
  | 'EXPIRED'
  | 'FAILED'
  | 'CANCELLED';

export interface PayoutRequest {
  id:                  string;
  org_id:              string;
  fund_type_id:        string;
  bank_account_id:     string;
  initiated_by:        string;
  amount_kobo:         number;
  purpose:             string;
  status:              PayoutStatus;
  nomba_transfer_ref:  string | null;
  nomba_transfer_id:   string | null;
  transfer_error:      string | null;
  approvals_received:  number;
  declined_by:         string | null;
  executed_at:         string | null;
  expires_at:          string;
  created_at:          string;
  updated_at:          string;
  // Joined from org_bank_accounts (detail view only)
  account_number:      string | null;
  bank_name:           string | null;
  recipient_name:      string | null;
}

export interface InitiatePayoutInput {
  fund_type_id:   string;
  bank_code:      string;
  account_number: string;
  account_name:   string;
  amount:         number; // naira — backend converts to kobo
  purpose:        string;
}

export interface BankOption {
  label: string; // bank name
  value: string; // CBN code e.g. '058'
}

export interface BankLookupResult {
  accountNumber: string;
  accountName:   string;
  bankCode:      string;
  bankName:      string;
}

export interface PayoutFundBalance {
  fund_type_id:      string;
  fund_name:         string;
  kind:              'RECURRING' | 'CAMPAIGN';
  is_anonymous_only: boolean;
  available_kobo:    number;
  available_display: string;
}

export interface PayoutFundBalances {
  transfer_fee_kobo: number;
  funds:             PayoutFundBalance[];
}

export interface PayoutListFilters {
  status?: PayoutStatus;
  limit?:  number;
  offset?: number;
}

export const payoutsApi = {
  /**
   * initiate — POST /payouts
   * Creates a new payout request.
   * Below threshold → auto-transfers.
   * Above threshold → sends approval emails to signatories.
   * ADMIN or TREASURER role required.
   */
  initiate: (input: InitiatePayoutInput) =>
    api.post<{ payoutRequestId: string; nombaTransferRef?: string; nombaStatus?: string }>(
      '/payouts',
      input,
      { tokenType: 'admin' },
    ),

  /**
   * list — GET /payouts
   * List all payout requests for this org, filterable by status.
   */
  list: (filters: PayoutListFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.limit)  params.set('limit',  String(filters.limit));
    if (filters.offset) params.set('offset', String(filters.offset));
    const qs = params.toString();
    return api.get<PayoutRequest[]>(`/payouts${qs ? `?${qs}` : ''}`, { tokenType: 'admin' });
  },

  /**
   * get — GET /payouts/:id
   * Full payout detail including approval status.
   */
  get: (id: string) =>
    api.get<PayoutRequest>(`/payouts/${id}`, { tokenType: 'admin' }),

  /**
   * cancel — DELETE /payouts/:id
   * Cancels a PENDING payout (before any approvals).
   * Only the initiator can cancel.
   */
  cancel: (id: string) =>
    api.delete<{ success: boolean }>(`/payouts/${id}`, { tokenType: 'admin' }),

  /**
   * getFundBalances — GET /payouts/fund-balances
   * All-time available balance per active fund (including Anonymous Giving),
   * plus the Nomba transfer fee. This is the exact balance the backend checks
   * when a payout is initiated — the initiate form shows it per fund.
   */
  getFundBalances: () =>
    api.get<PayoutFundBalances>('/payouts/fund-balances', { tokenType: 'admin' }),

  /**
   * getBankList — GET /banks
   * Returns all supported Nigerian banks from the backend cache.
   * Used to populate the bank dropdown on the initiate payout form.
   * Backend returns { code, name } — mapped to { label, value } for the Select component.
   */
  getBankList: async () => {
    const banks = await api.get<{ code: string; name: string }[]>('/banks', { tokenType: 'admin' });
    return banks.map((b) => ({ label: b.name, value: b.code }));
  },

  /**
   * bankLookup — POST /banks/lookup
   * Verifies a bank account number and returns the account holder's name.
   * MUST be called before initiating a payout — confirms recipient identity.
   */
  bankLookup: (bankCode: string, accountNumber: string) =>
    api.post<BankLookupResult>(
      '/banks/lookup',
      { bankCode, accountNumber },
      { tokenType: 'admin' },
    ),
};