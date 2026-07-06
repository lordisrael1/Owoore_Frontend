import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';

/**
 * Content-Security-Policy — blocks injected scripts even if XSS slips through.
 *
 * Notes on each directive:
 *   - script-src: 'unsafe-inline' is required by Next.js hydration inline
 *     scripts (tighten to nonces via middleware later if needed);
 *     'unsafe-eval' only in dev — react-refresh needs it, production doesn't.
 *   - connect-src: API calls go same-origin to /api/v1 (rewritten below), but
 *     the client falls back to owoore.onrender.com if NEXT_PUBLIC_API_URL is
 *     unset, so that host stays allowed.
 *   - font-src: Geist is self-hosted via next/font — no external font hosts.
 *   - worker-src: the service worker (/sw.js) is same-origin.
 *   - frame-ancestors 'none': nothing may iframe this app (clickjacking).
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://owoore.onrender.com",
  "font-src 'self' data:",
  "worker-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  // Legacy XSS auditor for old browsers — modern ones rely on CSP above
  { key: 'X-XSS-Protection',        value: '1; mode=block' },
  // Belt-and-braces duplicate of frame-ancestors for older browsers
  { key: 'X-Frame-Options',         value: 'DENY' },
  // Never MIME-sniff responses into executable types
  { key: 'X-Content-Type-Options',  value: 'nosniff' },
  // Don't leak full URLs (join links carry org slugs) to other origins
  { key: 'Referrer-Policy',         value: 'strict-origin-when-cross-origin' },
  // This app never needs these browser capabilities
  { key: 'Permissions-Policy',      value: 'camera=(), microphone=(), geolocation=()' },
  // Force HTTPS for 2 years once seen over HTTPS
  { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
];

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'https://owoore.onrender.com/api/v1/:path*',
      },
    ];
  },

  async headers() {
    return [
      {
        // Security headers on every route
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // Service worker must never be cached — the browser needs to check for
        // a new version on every load so stale-SW chunk-404 crashes can't recur.
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ];
  },
};

export default nextConfig;
