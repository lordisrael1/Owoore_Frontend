/**
 * sw.js — Owoore Service Worker (member portal only)
 *
 * Cache strategy:
 *   - App shell (HTML, JS, CSS) → Cache First with network fallback
 *   - API: /me/accounts (NUBAN numbers) → Stale-While-Revalidate (show cached, update in bg)
 *   - API: /me/giving-history → Network First, fallback to cache
 *   - API: /me → Network First (always want fresh fund summaries)
 *   - Nomba webhooks → Network Only (never cache payment events)
 *
 * Offline fallback: if API fails and no cache, show /offline page.
 */

const CACHE_VERSION  = 'owoore-v1';
const SHELL_CACHE    = `${CACHE_VERSION}-shell`;
const API_CACHE      = `${CACHE_VERSION}-api`;
const OFFLINE_URL    = '/portal/offline';

// App shell assets to pre-cache on install
const SHELL_ASSETS = [
  '/portal',
  '/portal/accounts',
  '/portal/history',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// API routes to cache (relative to API base)
const CACHEABLE_API_PATTERNS = [
  /\/api\/v1\/me\/accounts/,
  /\/api\/v1\/me\/giving-history/,
  /\/api\/v1\/orgs\/[^/]+$/, // org details (name, logo)
];

// API routes to NEVER cache
const NO_CACHE_PATTERNS = [
  /\/api\/v1\/auth\//,        // OTP codes — never cache
  /\/api\/v1\/webhooks\//,    // payment events — never cache
  /\/api\/v1\/payouts\//,     // financial operations — always fresh
];

// ── Install ───────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => {
      // Pre-cache the app shell — don't fail install if some assets miss
      return Promise.allSettled(
        SHELL_ASSETS.map((url) =>
          cache.add(url).catch(() => console.warn('[SW] Failed to pre-cache:', url)),
        ),
      );
    }).then(() => self.skipWaiting()),
  );
});

// ── Activate — clean old caches ───────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== SHELL_CACHE && key !== API_CACHE)
          .map((key) => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          }),
      ),
    ).then(() => self.clients.claim()),
  );
});

// ── Fetch handler ─────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only intercept GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests (Nomba API, etc.)
  if (url.origin !== self.location.origin) return;

  // Skip never-cache API patterns
  if (NO_CACHE_PATTERNS.some((p) => p.test(url.pathname))) return;

  // API caching — Stale-While-Revalidate for account numbers
  if (url.pathname.startsWith('/api/v1/')) {
    const isCacheable = CACHEABLE_API_PATTERNS.some((p) => p.test(url.pathname));

    if (isCacheable) {
      event.respondWith(staleWhileRevalidate(request, API_CACHE));
    } else {
      // Network First for everything else — fresh financial data matters
      event.respondWith(networkFirst(request, API_CACHE));
    }
    return;
  }

  // App shell — Cache First (portal pages load instantly on revisit)
  if (url.pathname.startsWith('/portal')) {
    event.respondWith(cacheFirst(request, SHELL_CACHE));
    return;
  }

  // Default: Network First
  event.respondWith(networkFirst(request, SHELL_CACHE));
});

// ── Cache strategies ──────────────────────────────────────────────────────────

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return caches.match(OFFLINE_URL) || new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // For API failures, return a JSON error response
    if (request.url.includes('/api/')) {
      return new Response(
        JSON.stringify({ success: false, error: { message: 'You are offline', code: 'OFFLINE' } }),
        { status: 503, headers: { 'Content-Type': 'application/json' } },
      );
    }
    return caches.match(OFFLINE_URL) || new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);

  // Revalidate in background regardless
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);

  // Return cached immediately if available, otherwise wait for network
  return cached || fetchPromise || new Response(
    JSON.stringify({ success: false, error: { message: 'Offline', code: 'OFFLINE' } }),
    { status: 503, headers: { 'Content-Type': 'application/json' } },
  );
}

// ── Push notifications (for payment confirmations) ────────────────────────────

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try { data = event.data.json(); }
  catch { return; }

  const options = {
    body:    data.body    ?? 'You have a new notification from Owoore',
    icon:    '/icons/icon-192.png',
    badge:   '/icons/badge-72.png',
    vibrate: [200, 100, 200],
    data:    { url: data.url ?? '/portal' },
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title ?? 'Owoore', options),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url ?? '/portal';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If portal is already open, focus it
      for (const client of clientList) {
        if (client.url.includes('/portal') && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) return clients.openWindow(url);
    }),
  );
});