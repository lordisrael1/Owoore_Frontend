/**
 * api.types.ts — all API response shapes.
 * Mirrors backend models exactly — use these everywhere in the frontend.
 */

// ── Base API response ─────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data:    T;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    code:    string;
    status:  number;
  };
}

// ── Organisation ──────────────────────────────────────────────────────────────
export interface Organisation {
  id:       string;
  name:     string;
  slug:     string;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RegisterOrgResponse {
  org:      Pick<Organisation, 'id' | 'name' | 'slug'>;
  admin:    { id: string; email: string; role: string };
  joinLink: string;
}

// ── Members ───────────────────────────────────────────────────────────────────
export interface Member {
  id:           string;
  org_id:       string;
  email:        string;
  display_name: string;
  member_code:  string;
  is_active:    boolean;
  joined_at:    string;
  updated_at:   string;
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

export interface MeResponse {
  member:        Pick<Member, 'id' | 'display_name' | 'email' | 'member_code' | 'joined_at'> & { name: string };
  org:           { name: string; slug: string; logo_url: string | null; joinLink: string };
  fundSummaries: FundSummary[];
}

// ── Fund Types ────────────────────────────────────────────────────────────────
export type FundKind = 'RECURRING' | 'CAMPAIGN';

export interface FundType {
  id:                 string;
  org_id:             string;
  name:               string;
  kind:               FundKind;
  description:        string | null;
  expected_amt_kobo:  number | null;
  expires_at:         string | null;
  is_active:          boolean;
  sort_order:         number;
  created_at:         string;
  updated_at:         string;
}

// ── Virtual Accounts ──────────────────────────────────────────────────────────
export interface MemberFundAccount {
  id:                string;
  member_id:         string;
  fund_type_id:      string;
  org_id:            string;
  nomba_va_number:   string;
  nomba_va_id:       string | null;
  account_reference: string;
  bank_name:         string;
  is_active:         boolean;
  created_at:        string;
  updated_at:        string;
}

export interface VirtualAccountResponse {
  va_number:         string;
  bank_name:         string;
  account_reference: string;
  is_new:            boolean;
  instructions:      string;
}

// ── Transactions ──────────────────────────────────────────────────────────────
export type PaymentStatus = 'EXACT' | 'UNDERPAYMENT' | 'OVERPAYMENT';

export interface Transaction {
  id:             string;
  member_id:      string;
  fund_type_id:   string;
  amount_kobo:    number;
  payment_status: PaymentStatus;
  variance_kobo:  number;
  period_month:   string;
  sender_name:    string | null;
  narration:      string | null;
  created_at:     string;
  // Joined from fund_types
  fund_name:      string;
}

// ── Payouts ───────────────────────────────────────────────────────────────────
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
}

// ── Signatories ───────────────────────────────────────────────────────────────
export type SignatoryRole = 'PASTOR' | 'DEACON' | 'ELDER' | 'TRUSTEE' | 'OTHER';

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

// ── Approval ──────────────────────────────────────────────────────────────────
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

export type ApprovalResult = 'APPROVED' | 'DECLINED' | 'PARTIAL' | 'TRANSFER_INITIATED';

export interface ApprovalActionResult {
  status:  ApprovalResult;
  message: string;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export interface DashboardSummary {
  total_collected_all_time_kobo: number;
  total_paid_out_all_time_kobo:  number;
  available_balance_kobo:        number;
  pending_payouts_kobo:          number;
  active_members:                number;
  total_transactions:            number;
  period_month:                  string;
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
  kind:                 FundKind;
  total_collected_kobo: number;
  total_paid_out_kobo:  number;
  soft_lock_kobo:       number;
  available_kobo:       number;
  member_count_paid:    number;
  total_transactions:   number;
  collected_display:    string;
  available_display:    string;
}

export interface MemberStatusRow {
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

// ── Anonymous giving ──────────────────────────────────────────────────────────
export interface AnonymousVA {
  fund_type_id:      string;
  fund_name:         string;
  va_number:         string;
  bank_name:         string;
  account_reference: string;
  instructions:      string;
}

export interface AnonymousGivingPage {
  org:    Pick<Organisation, 'name' | 'slug' | 'logo_url'>;
  funds:  AnonymousVA[];
  notice: string;
}