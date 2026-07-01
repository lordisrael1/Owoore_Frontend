/**
 * client.ts — base API fetch client
 *
 * Every API call in Owoore goes through this single function.
 * Responsibilities:
 *   1. Attach Authorization: Bearer <token> header automatically
 *   2. Detect member vs admin token from context
 *   3. On 401 → attempt JWT refresh → retry original request once
 *   4. Parse Nomba-style { success, data, error } responses
 *   5. Throw ApiError with code + message on failures
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://owoore.onrender.com/api/v1';

// ── Error class ──────────────────────────────────────────────────────────────

export class ApiError extends Error {
  public readonly code: string;
  public readonly status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.code   = code;
    this.status = status;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// ── Token helpers (browser only) ─────────────────────────────────────────────

function getToken(type: 'member' | 'admin'): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(
    type === 'member' ? 'owoore_member_token' : 'owoore_admin_token',
  );
}

function setToken(type: 'member' | 'admin', token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    type === 'member' ? 'owoore_member_token' : 'owoore_admin_token',
    token,
  );
}

function clearToken(type: 'member' | 'admin'): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(
    type === 'member' ? 'owoore_member_token' : 'owoore_admin_token',
  );
}

// ── Refresh logic ─────────────────────────────────────────────────────────────

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

async function attemptRefresh(type: 'member' | 'admin'): Promise<string | null> {
  // Member tokens can be refreshed; admin tokens require re-login
  if (type === 'admin') {
    clearToken('admin');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return null;
  }

  if (isRefreshing) {
    return new Promise((resolve) => {
      refreshQueue.push(resolve);
    });
  }

  isRefreshing = true;

  const drainQueue = (token: string | null) => {
    refreshQueue.forEach((cb) => cb(token));
    refreshQueue = [];
  };

  const failRefresh = () => {
    clearToken('member');
    drainQueue(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  try {
    const currentToken = getToken('member');
    if (!currentToken) { drainQueue(null); return null; }

    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        Authorization:   `Bearer ${currentToken}`,
      },
    });

    if (!res.ok) { failRefresh(); return null; }

    const json = await res.json();
    const newToken: string | undefined = json.data?.token;

    if (newToken) {
      setToken('member', newToken);
      drainQueue(newToken);
      return newToken;
    }

    // 200 OK but no token in body — treat as failure
    failRefresh();
    return null;
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
  method?:   'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  body?:     unknown;
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
    );
  }

  return json.data as T;
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
export { getToken, setToken, clearToken };