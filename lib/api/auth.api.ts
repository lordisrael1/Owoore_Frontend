import { api, setToken, clearToken } from './client';

export interface SendOtpInput {
  email:    string;
  org_slug: string;
}

export interface VerifyOtpInput {
  email:    string;
  code:     string;
  org_slug: string;
  name?:    string; // required on first visit
}

export interface VerifyOtpResponse {
  token:  string;
  member: {
    id:         string;
    name:       string;
    email:      string;
    memberCode: string;
    orgId:      string;
    orgSlug:    string;
    isNew:      boolean;
  };
}

export interface AdminLoginInput {
  email:    string;
  password: string;
}

export interface AdminLoginResponse {
  token: string;
  admin: {
    id:      string;
    name:    string;
    email:   string;
    role:    string;
    orgId:   string;
    orgSlug: string;
  };
}

export const authApi = {
  /**
   * sendOtp — POST /auth/send-otp
   * Member requests OTP via email + church slug.
   * Rate limited: 3 per 15 minutes.
   */
  sendOtp: (input: SendOtpInput) =>
    api.post<{ message: string }>('/auth/send-otp', input, { isPublic: true }),

  /**
   * verifyOtp — POST /auth/verify-otp
   * Member submits OTP. Returns JWT + member profile.
   * If isNew = true, the account was just created.
   * Automatically stores the member token in localStorage.
   */
  verifyOtp: async (input: VerifyOtpInput): Promise<VerifyOtpResponse> => {
    const data = await api.post<VerifyOtpResponse>('/auth/verify-otp', input, { isPublic: true });
    setToken('member', data.token);
    return data;
  },

  /**
   * adminLogin — POST /auth/admin/login
   * Admin or treasurer login with email + password.
   * Automatically stores the admin token in localStorage.
   */
  adminLogin: async (input: AdminLoginInput): Promise<AdminLoginResponse> => {
    const data = await api.post<AdminLoginResponse>('/auth/admin/login', input, { isPublic: true });
    setToken('admin', data.token);
    return data;
  },

  /**
   * refresh — POST /auth/refresh
   * Re-issues a member JWT from an existing valid token.
   * Called automatically by client.ts on 401 — rarely needed directly.
   */
  refresh: () =>
    api.post<{ token: string }>('/auth/refresh', undefined, { tokenType: 'member' }),

  /**
   * logoutMember / logoutAdmin — clears local tokens.
   * No server call needed — JWTs are stateless.
   */
  logoutMember: () => clearToken('member'),
  logoutAdmin:  () => clearToken('admin'),
};