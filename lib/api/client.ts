/**
 * client.ts — base API fetch client
 *
 * Every API call in Owoore goes through this single function.
 * Responsibilities:
 *   1. Attach Authorization: Bearer <token> header automatically
 *   2. Detect member vs admin token from context
 *   3. On 401 → attempt JWT refresh via refresh token → retry original request once
 *   4. Parse Nomba-style { success, data, error } responses
 *   5. Throw ApiError with code + message on failures
 *
 * Refresh token contract (member only):
 *   - Access token stored at localStorage key owoore_member_token (1h TTL)
 *   - Refresh token stored at localStorage key owoore_member_refresh_token (30d TTL)
 *   - POST /auth/refresh takes { token: refreshToken } in body — NO auth header
 *   - Backend rotates the refresh token on every use; we persist the new one
 *   - Replaying an already-used refresh token is a theft signal → backend revokes all,
 *     so we redirect to join page immediately on 401 from the refresh endpoint itself
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://owoore.onrender.com/api/v1';

// ── Error class ──────────────────────────────────────────────────────────────

export class ApiError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: Record<string, unknown>;

  constructor(message: string, code: string, status: number, details?: Record<string, unknown>) {
    super(message);
    this.code    = code;
    this.status  = status;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// ── Token helpers (browser only) ─────────────────────────────────────────────

const KEYS = {
  member:        'owoore_member_token',
  admin:         'owoore_admin_token',
  memberRefresh: 'owoore_member_refresh_token',
} as const;

function getToken(type: 'member' | 'admin'): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(type === 'member' ? KEYS.member : KEYS.admin);
}

function setToken(type: 'member' | 'admin', token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(type === 'member' ? KEYS.member : KEYS.admin, token);
}

function clearToken(type: 'member' | 'admin'): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(type === 'member' ? KEYS.member : KEYS.admin);
  if (type === 'member') {
    // Always clear refresh token alongside the access token
    localStorage.removeItem(KEYS.memberRefresh);
  }
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(KEYS.memberRefresh);
}

function setRefreshToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.memberRefresh, token);
}

// ── Refresh logic ─────────────────────────────────────────────────────────────

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

async function attemptRefresh(type: 'member' | 'admin'): Promise<string | null> {
  // Admin tokens require re-login — no refresh endpoint
  if (type === 'admin') {
    clearToken('admin');
    if (typeof window !== 'undefined') window.location.href = '/login';
    return null;
  }

  if (isRefreshing) {
    return new Promise((resolve) => { refreshQueue.push(resolve); });
  }

  isRefreshing = true;

  const drainQueue = (token: string | null) => {
    refreshQueue.forEach((cb) => cb(token));
    refreshQueue = [];
  };

  const failRefresh = () => {
    clearToken('member'); // clears both access + refresh tokens
    drainQueue(null);
    if (typeof window !== 'undefined') window.location.href = '/';
  };

  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) { failRefresh(); return null; }

    // POST /auth/refresh takes { token } in body — no Authorization header.
    // It is NOT behind the authenticate middleware (that was the original bug).
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ token: refreshToken }),
    });

    if (!res.ok) { failRefresh(); return null; }

    const json = await res.json();
    const newAccessToken: string | undefined   = json.data?.token;
    const newRefreshToken: string | undefined  = json.data?.refreshToken;

    if (!newAccessToken) { failRefresh(); return null; }

    setToken('member', newAccessToken);
    // Persist rotated refresh token if backend returned one
    if (newRefreshToken) setRefreshToken(newRefreshToken);

    drainQueue(newAccessToken);
    return newAccessToken;
  } catch {
    // Network error during refresh — drain queue so no request hangs forever
    failRefresh();
    return null;
  } finally {
    isRefreshing = false;
  }
}

// ── Request options ───────────────────────────────────────────────────────────

export interface RequestOptions {
  method?:    'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  body?:      unknown;
  tokenType?: 'member' | 'admin' | 'none';
  rawToken?:  string;  // override — used for approval token routes
  isPublic?:  boolean; // skip auth header entirely
}

// ── Core fetch function ───────────────────────────────────────────────────────

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method    = 'GET',
    body,
    tokenType = 'admin',
    rawToken,
    isPublic  = false,
  } = options;

  const buildRequest = (token: string | null): RequestInit => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (!isPublic) {
      const t = rawToken ?? token;
      if (t) headers['Authorization'] = `Bearer ${t}`;
    }

    return {
      method,
      headers,
      ...(body !== undefined && { body: JSON.stringify(body) }),
    };
  };

  const token = isPublic ? null : (rawToken ?? getToken(tokenType as 'member' | 'admin'));

  let response = await fetch(`${API_BASE}${path}`, buildRequest(token));

  // 401 → attempt refresh → retry once
  if (response.status === 401 && !isPublic && !rawToken) {
    const newToken = await attemptRefresh(tokenType as 'member' | 'admin');
    if (newToken) {
      response = await fetch(`${API_BASE}${path}`, buildRequest(newToken));
    }
  }

  // Parse response
  let json: any;
  try {
    json = await response.json();
  } catch {
    throw new ApiError('Server returned invalid JSON', 'PARSE_ERROR', response.status);
  }

  if (!response.ok || json.success === false) {
    const err = json.error ?? {};
    throw new ApiError(
      err.message ?? json.message ?? `Request failed (${response.status})`,
      err.code    ?? 'API_ERROR',
      response.status,
      err.details,
    );
  }

  return json.data as T;
}

// ── Authenticated file download ───────────────────────────────────────────────

/**
 * downloadFile — fetches a file with the Authorization HEADER and saves it
 * via a Blob object-URL.
 *
 * Never build download links with the JWT in the query string: the token
 * lands in server logs, browser history, and Referer headers — replayable
 * by anyone who can read them until it expires. window.open() can't set
 * headers, so we fetch → Blob → synthetic <a download> instead.
 */
export async function downloadFile(path: string, filename: string): Promise<void> {
  const token = getToken('admin');

  const res = await fetch(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    throw new ApiError(`Download failed (${res.status})`, 'DOWNLOAD_ERROR', res.status);
  }

  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ── Convenience wrappers ──────────────────────────────────────────────────────

export const api = {
  get:    <T>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...opts, method: 'GET' }),

  post:   <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method'>) =>
    apiRequest<T>(path, { ...opts, method: 'POST', body }),

  patch:  <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method'>) =>
    apiRequest<T>(path, { ...opts, method: 'PATCH', body }),

  delete: <T>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...opts, method: 'DELETE' }),
};

// Re-export token helpers for use across the app
export { getToken, setToken, clearToken, getRefreshToken, setRefreshToken };
