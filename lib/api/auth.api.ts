import { api, setToken, clearToken, setRefreshToken, getRefreshToken } from './client';

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
  token:                 string;
  refreshToken:          string;
  refreshTokenExpiresAt: string; // ISO date string
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

export interface VerifyAdminEmailInput {
  email:    string;
  code:     string;
  org_slug: string;
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
   * Member submits OTP. Returns short-lived access token (1h) + long-lived
   * refresh token (30d). Stores both in localStorage.
   * If member.isNew = true, the account was just created.
   */
  verifyOtp: async (input: VerifyOtpInput): Promise<VerifyOtpResponse> => {
    const data = await api.post<VerifyOtpResponse>('/auth/verify-otp', input, { isPublic: true });
    setToken('member', data.token);
    setRefreshToken(data.refreshToken);
    return data;
  },

  /**
   * adminLogin — POST /auth/admin/login
   * Admin or treasurer login with email + password.
   * Admin sessions use only access tokens — no refresh flow.
   */
  adminLogin: async (input: AdminLoginInput): Promise<AdminLoginResponse> => {
    const data = await api.post<AdminLoginResponse>('/auth/admin/login', input, { isPublic: true });
    setToken('admin', data.token);
    return data;
  },

  /**
   * verifyAdminEmail — POST /auth/admin/verify-email
   * Confirms the OTP sent to a self-registered admin's email, marks the
   * account verified, and logs them in — same UX as the member OTP flow.
   * Used both right after registration and when a login attempt comes
   * back with EMAIL_NOT_VERIFIED.
   */
  verifyAdminEmail: async (input: VerifyAdminEmailInput): Promise<AdminLoginResponse> => {
    const data = await api.post<AdminLoginResponse>('/auth/admin/verify-email', input, { isPublic: true });
    setToken('admin', data.token);
    return data;
  },

  /**
   * refresh — POST /auth/refresh
   * Re-issues a member access token using the stored refresh token.
   * Sends { token: refreshToken } in the request body — no Authorization header.
   * Called automatically by client.ts on 401; rarely needed directly.
   * Backend rotates the refresh token on every call; client.ts persists the new one.
   */
  refresh: () =>
    api.post<{ token: string; refreshToken?: string }>(
      '/auth/refresh',
      { token: getRefreshToken() },
      { isPublic: true }, // no Authorization header — token is in the body
    ),

  /**
   * logoutMember / logoutAdmin — clears local tokens.
   * clearToken('member') automatically clears both access + refresh tokens.
   */
  logoutMember: () => clearToken('member'),
  logoutAdmin:  () => clearToken('admin'),
};
