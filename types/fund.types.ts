/**
 * fund.types.ts — FundType, FundKind, MemberFundAccount.
 */

export type FundKind = 'RECURRING' | 'CAMPAIGN';

export interface FundType {
  id:                string;
  org_id:            string;
  name:              string;
  kind:              FundKind;
  description:       string | null;
  expected_amt_kobo: number | null;
  expires_at:        string | null;
  is_active:         boolean;
  is_shared_va:      boolean;
  shared_va_number:  string | null;
  shared_va_bank:    string | null;
  sort_order:        number;
  created_at:        string;
  updated_at:        string;
}

export interface CreateFundInput {
  name:          string;
  kind:          FundKind;
  description?:  string;
  expected_amt?: number; // naira — backend converts to kobo
  expires_at?:   string; // ISO date — required for CAMPAIGN
  sort_order?:   number;
  is_shared_va?: boolean;
}

export interface UpdateFundInput {
  name?:          string;
  description?:   string;
  expected_amt?:  number;
  expires_at?:    string;
  sort_order?:    number;
  is_active?:     boolean;
  is_shared_va?:  boolean;
}

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
  // Joined
  fund_name?:        string;
  fund_kind?:        FundKind;
}

// Helpers
export function isCampaign(fund: FundType): boolean {
  return fund.kind === 'CAMPAIGN';
}

export function isExpired(fund: FundType): boolean {
  if (!fund.expires_at) return false;
  return new Date() > new Date(fund.expires_at);
}

export function daysUntilExpiry(fund: FundType): number | null {
  if (!fund.expires_at) return null;
  const diff = new Date(fund.expires_at).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}