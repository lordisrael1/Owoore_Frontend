/**
 * payout.types.ts — PayoutStatus enum, PayoutRequest, Signatory types.
 * Used across the dashboard, payout forms, and approval pages.
 */

export type PayoutStatus =
  | 'PENDING'       // created, waiting for first approval
  | 'PARTIAL'       // some approvals received, not yet quorum
  | 'APPROVED'      // quorum reached, transfer about to fire
  | 'TRANSFERRING'  // Nomba transfer API called, awaiting webhook
  | 'TRANSFERRED'   // money settled — transfer.success webhook received
  | 'DECLINED'      // any signatory declined — request killed
  | 'EXPIRED'       // auto_decline_hours elapsed with no quorum
  | 'FAILED'        // Nomba transfer failed — refunded, admin must retry
  | 'CANCELLED';    // initiator cancelled before any approvals

// Terminal states — once reached, no further transitions
export const TERMINAL_STATUSES: PayoutStatus[] = [
  'TRANSFERRED',
  'DECLINED',
  'EXPIRED',
  'CANCELLED',
];

export function isTerminal(status: PayoutStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

export function canCancel(status: PayoutStatus): boolean {
  return status === 'PENDING';
}

// Human-readable labels for the dashboard
export const PAYOUT_STATUS_LABELS: Record<PayoutStatus, string> = {
  PENDING:      'Awaiting approval',
  PARTIAL:      'Partially approved',
  APPROVED:     'Approved',
  TRANSFERRING: 'Transfer in progress',
  TRANSFERRED:  'Transferred',
  DECLINED:     'Declined',
  EXPIRED:      'Expired',
  FAILED:       'Transfer failed',
  CANCELLED:    'Cancelled',
};

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
}

export interface ApprovalRecord {
  id:                string;
  payout_request_id: string;
  signatory_id:      string;
  signatory_name:    string;
  signatory_email:   string;
  signatory_role:    string;
  action:            'APPROVED' | 'DECLINED' | null;
  acted_at:          string | null;
  ip_address:        string | null;
  email_sent_at:     string | null;
  token_expires_at:  string;
  token_used_at:     string | null;
}

export interface Signatory {
  id:           string;
  org_id:       string;
  name:         string;
  email:        string;
  phone:        string | null;
  role:         string;
  can_initiate: boolean;
  can_approve:  boolean;
  is_active:    boolean;
  created_at:   string;
  updated_at:   string;
}

export interface PayoutPolicy {
  org_id:             string;
  min_approvers:      number;
  threshold_kobo:     number;
  token_expiry_hours: number;
  auto_decline_hours: number;
}

// Form input types
export interface InitiatePayoutInput {
  fund_type_id:    string;
  bank_account_id: string;
  amount:          number; // naira
  purpose:         string;
}

export interface BankLookupResult {
  accountNumber: string;
  accountName:   string;
  bankCode:      string;
  bankName:      string;
}