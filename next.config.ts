import type { NextConfig } from "next";

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
