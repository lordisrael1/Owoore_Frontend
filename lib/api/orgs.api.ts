import { api } from './client';

export interface RegisterOrgInput {
  name:           string;
  admin_name:     string;
  admin_email:    string;
  admin_password: string;
}

export interface OrgResponse {
  id:       string;
  name:     string;
  slug:     string;
  logo_url: string | null;
}

export interface RegisterOrgResponse {
  org:      OrgResponse & { id: string; name: string; slug: string };
  admin:    { id: string; email: string; role: string };
  joinLink: string;
}

export interface PublicOrgResponse {
  id:       string;
  name:     string;
  slug:     string;
  logo_url: string | null;
  joinLink: string;
}

export const orgsApi = {
  /**
   * getById — GET /orgs/:id
   * Returns org info using admin auth.
   */
  getById: (id: string) =>
    api.get<OrgResponse>(`/orgs/${id}`),


  /**
   * register — POST /orgs
   * Creates a new church on Owoore.
   * Also creates the admin user, default fund types, payout policy,
   * and provisions a Nomba sub-account.
   * Public — no auth required.
   */
  register: async (input: RegisterOrgInput): Promise<RegisterOrgResponse> => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

    const form = new FormData();
    form.append('name', input.name);
    form.append('admin_name', input.admin_name);
    form.append('admin_email', input.admin_email);
    form.append('admin_password', input.admin_password);

    const res = await fetch(`${API_BASE}/orgs`, {
      method: 'POST',
      body: form,
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error?.message ?? json.message ?? 'Registration failed');
    }

    const json = await res.json();
    return json.data as RegisterOrgResponse;
  },

  /**
   * getBySlug — GET /orgs/:slug
   * Returns public org info (name, logo, joinLink).
   * Called by the join page before the member enters their phone.
   */
  getBySlug: (slug: string) =>
    api.get<PublicOrgResponse>(`/orgs/${slug}`, { isPublic: true }),

  /**
   * update — PATCH /orgs/:id
   * Updates church name.
   * Admin auth required. Org-scoped.
   */
  update: async (id: string, fields: { name?: string }): Promise<OrgResponse> => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('owoore_admin_token')
        : null;

    const form = new FormData();
    if (fields.name) form.append('name', fields.name);

    const res = await fetch(`${API_BASE}/orgs/${id}`, {
      method: 'PATCH',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error?.message ?? json.message ?? 'Update failed');
    }

    const json = await res.json();
    return json.data as OrgResponse;
  },

  /**
   * uploadLogo — PATCH /orgs/:id  (multipart/form-data)
   * Uploads a logo file via multer → Cloudinary.
   * Returns the updated org with logo_url populated.
   */
  uploadLogo: async (id: string, file: File): Promise<OrgResponse> => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('owoore_admin_token')
        : null;

    const form = new FormData();
    form.append('logo', file);

    const res = await fetch(`${API_BASE}/orgs/${id}`, {
      method: 'PATCH',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error?.message ?? json.message ?? 'Logo upload failed');
    }

    const json = await res.json();
    return json.data as OrgResponse;
  },
};