import { api } from './client';

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

export interface CreateSignatoryInput {
  name:          string;
  email:         string;
  phone?:        string;
  role:          string; // 'PASTOR' | 'DEACON' | 'ELDER' | 'TRUSTEE'
  can_initiate?: boolean;
  can_approve?:  boolean;
}

export interface UpdateSignatoryInput {
  name?:          string;
  phone?:         string;
  role?:          string;
  can_initiate?:  boolean;
  can_approve?:   boolean;
}

export interface PayoutPolicy {
  org_id:             string;
  min_approvers:      number;
  threshold_kobo:     number;
  token_expiry_hours: number;
  auto_decline_hours: number;
}

export interface UpdatePolicyInput {
  min_approvers?:      number;
  threshold_kobo?:     number;
  token_expiry_hours?: number;
  auto_decline_hours?: number;
}

export const signatoriesApi = {
  /**
   * list — GET /signatories
   * Returns all active signatories for this org.
   */
  list: () =>
    api.get<Signatory[]>('/signatories', { tokenType: 'admin' }),

  /**
   * create — POST /signatories
   * Adds a new payout signatory. ADMIN role required.
   * Signatories receive approval emails — they do NOT have a dashboard login.
   */
  create: (input: CreateSignatoryInput) =>
    api.post<Signatory>('/signatories', input, { tokenType: 'admin' }),

  /**
   * update — PATCH /signatories/:id
   * Updates name, phone, role, or permissions. ADMIN role required.
   */
  update: (id: string, input: UpdateSignatoryInput) =>
    api.patch<Signatory>(`/signatories/${id}`, input, { tokenType: 'admin' }),

  /**
   * remove — DELETE /signatories/:id
   * Deactivates a signatory. ADMIN role required.
   * Validates that enough active approvers will remain to meet min_approvers.
   */
  remove: (id: string) =>
    api.delete<{ success: boolean }>(`/signatories/${id}`, { tokenType: 'admin' }),

  /**
   * getPolicy — GET /signatories/policy
   * Returns the org's payout approval policy.
   * threshold_kobo: transfers above this need multi-signatory approval.
   * min_approvers: how many signatories must approve.
   */
  getPolicy: () =>
    api.get<PayoutPolicy>('/signatories/policy', { tokenType: 'admin' }),

  /**
   * updatePolicy — PATCH /signatories/policy
   * Updates the payout approval rules. ADMIN role required.
   */
  updatePolicy: (input: UpdatePolicyInput) =>
    api.patch<PayoutPolicy>('/signatories/policy', input, { tokenType: 'admin' }),
};