# Responsive regression harness

Drives the real app in headless Chromium across 12 viewport widths
(320 → 1920), on every route, with either realistic or worst-case content,
and fails on meaningful responsive regressions:

- horizontal document overflow (with the offending elements listed)
- small tap targets on mobile widths (informational)
- console/page errors and navigation failures
- behavioural checks: mobile sidebar toggle, modal on short viewports,
  dropdown containment, modal focus trap (`interact.js`)

## One-time setup

Playwright is deliberately **not** a project dependency. Install it locally
when you want to run the harness:

```bash
npm i -D playwright   # or run from any folder that has it
npx playwright install chromium
```

## Running

```bash
# 1. Mock backend on :4000 (what next dev proxies /api/v1 to).
#    Serves { success, data } shapes matching lib/api/*; no real DB touched.
node scripts/responsive/mock-api.js

# 2. Frontend
npm run dev

# 3. Static sweep — writes audit-report[-stress].json next to the script
node scripts/responsive/audit.js                 # realistic data, all widths
node scripts/responsive/audit.js --stress --shots --widths 320,375,768,1440
#   --stress  worst-case content (₦1.2bn amounts, 70-char names, long emails)
#   --shots   full-page PNGs into shots[-stress]/<route>/<width>.png
#   --routes /dashboard,/portal   limit to specific routes

# 4. Behavioural checks — exits 1 on any failure
node scripts/responsive/interact.js
```

A sweep passes when the summary reports no `h-overflow` and no `nav-error`
entries. Tap-target entries are advisory (threshold 40×32px) — review, don't
blindly chase zero.

## Auth

`audit.js` mints unsigned JWTs (the client only decodes, never verifies) and
sets both the localStorage keys and the cookies `proxy.ts` checks, so
`/dashboard`, `/portal` and `/setup` render fully. Public pages are visited in
a separate logged-out context so redirects are exercised too.
