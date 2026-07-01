import { api } from './client';

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
  is_shared_va:      boolean;    // true = one org-wide VA (e.g. Offering), no per-member tracking
  shared_va_number:  string | null; // populated when is_shared_va & VA already exists
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
  expires_at?:   string; // ISO date string — required for CAMPAIGN
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

export const fundsApi = {
  /**
   * list — GET /orgs/:orgId/funds
   * Returns all active fund types for a church.
   * Admin auth required.
   */
  list: (orgId: string, includeInactive = false) =>
    api.get<FundType[]>(
      `/orgs/${orgId}/funds${includeInactive ? '?includeInactive=true' : ''}`,
      { tokenType: 'admin' },
    ),

  /**
   * listPublic — GET /me/funds
   * Active, non-anonymous funds for the member's org.
   * Backend reads orgId from the member JWT — no orgId in the URL.
   */
  listPublic: () =>
    api.get<FundType[]>('/me/funds', { tokenType: 'member' }),

  /**
   * create — POST /orgs/:orgId/funds
   * Creates a new fund type. ADMIN role required.
   */
  create: (orgId: string, input: CreateFundInput) =>
    api.post<FundType>(`/orgs/${orgId}/funds`, input, { tokenType: 'admin' }),

  /**
   * get — GET /funds/:id
   * Returns a single fund type.
   */
  get: (id: string) =>
    api.get<FundType>(`/funds/${id}`, { tokenType: 'admin' }),

  /**
   * update — PATCH /funds/:id
   * Updates a fund type. ADMIN role required.
   */
  update: (id: string, input: UpdateFundInput) =>
    api.patch<FundType>(`/funds/${id}`, input, { tokenType: 'admin' }),

  /**
   * deactivate — DELETE /funds/:id
   * Soft-deactivates a fund type. ADMIN role required.
   * Does not delete — existing transactions are preserved.
   */
  deactivate: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/funds/${id}`, { tokenType: 'admin' }),
};