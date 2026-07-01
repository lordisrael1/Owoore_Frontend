import { api } from './client';

export interface PayoutApprovalDetails {
  payoutId:      string;
  amountKobo:    number;
  purpose:       string;
  fundName:      string;
  bankName:      string;
  accountNumber: string;
  accountName:   string;
  initiatorName: string;
  orgName:       string;
  expiresAt:     string;
  alreadyActed:  boolean;
}

export interface ApprovalActionResult {
  status:  'APPROVED' | 'DECLINED' | 'PARTIAL' | 'TRANSFER_INITIATED';
  message: string;
}

export const approvalsApi = {
  /**
   * getDetails — GET /approve/:token
   * Fetches the payout details for the approval page.
   * No JWT required — the URL token is the credential.
   * Shows: amount, fund, destination bank, initiator, expiry.
   */
  getDetails: (token: string) =>
    api.get<PayoutApprovalDetails>(`/approve/${token}`, { isPublic: true }),

  /**
   * approve — POST /approve/:token
   * Records the signatory's approval.
   * Requires phone_last4 for identity confirmation.
   * If quorum is reached, the Nomba transfer fires immediately.
   */
  approve: (token: string, phoneLast4: string) =>
    api.post<ApprovalActionResult>(
      `/approve/${token}`,
      { phone_last4: phoneLast4 },
      { isPublic: true },
    ),

  /**
   * decline — POST /approve/:token/decline
   * Records a decline. Any single decline kills the request immediately
   * and releases the soft-locked funds.
   * Requires phone_last4 for identity confirmation.
   */
  decline: (token: string, phoneLast4: string) =>
    api.post<ApprovalActionResult>(
      `/approve/${token}/decline`,
      { phone_last4: phoneLast4 },
      { isPublic: true },
    ),
};