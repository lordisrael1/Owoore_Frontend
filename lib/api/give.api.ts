import { api } from './client';

export interface AnonymousAccount {
  va_number:    string;
  bank_name:    string;
  instructions: string;
}

export interface AnonymousGivingPage {
  org: {
    name:     string;
    slug:     string;
    logo_url: string | null;
  };
  account: AnonymousAccount; // single org-level giving VA (not attributed to any member)
  notice:  string;
}

export const giveApi = {
  /**
   * getAnonymousVAs — GET /give/:orgSlug
   *
   * Fully public — no login required.
   * Returns org-level shared NUBAN account numbers per fund type.
   *
   * This is displayed on:
   *   - The Sunday service projector (owoore.ng/give/grace-bible-church)
   *   - Walk-in visitors who don't want to register
   *   - Privacy-conscious members
   *
   * Payments to these accounts are reconciled to the org/fund
   * but NOT attributed to any individual member.
   *
   * accountReference starts with 'org_' so the webhook processor
   * routes it to the anonymous flow, not the member flow.
   */
  getAnonymousVAs: (orgSlug: string) =>
    api.get<AnonymousGivingPage>(`/give/${orgSlug}`, { isPublic: true }),
};