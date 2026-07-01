import { api } from './client';

export interface VirtualAccount {
  va_number:         string;  // NUBAN — the account number the member copies
  bank_name:         string;
  account_reference: string;
  is_new:            boolean;
  instructions:      string;
}

export interface MemberVA {
  fund_type_id:      string;
  fund_name:         string;
  va_number:         string;
  bank_name:         string;
  account_reference: string;
}

export const vaApi = {
  /**
   * getOrCreate — POST /me/funds/:fundId/account
   *
   * Lazy VA creation — the core UX moment.
   * First call: creates a Nomba virtual account and returns the NUBAN.
   * Subsequent calls: returns the same NUBAN instantly from DB.
   *
   * This is what the member copies into their banking app.
   * Member JWT required.
   */
  getOrCreate: (fundId: string) =>
    api.post<VirtualAccount>(
      `/me/funds/${fundId}/account`,
      undefined,
      { tokenType: 'member' },
    ),

  /**
   * listAll — GET /me/accounts
   * Returns all virtual account numbers the member has across all funds.
   * Used on the "My Accounts" page.
   * Member JWT required.
   */
  listAll: () =>
    api.get<MemberVA[]>('/me/accounts', { tokenType: 'member' }),
};