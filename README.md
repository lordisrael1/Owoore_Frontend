<div align="center">

# 🏛️ Owoore

**Church treasury, built different.**

Every member gets a dedicated bank account number. Every naira reconciles automatically.
Multi-signatory governance before money moves. Built for Nigerian churches.

[**owoore.com**](https://owoore.com) · [Backend repository](https://github.com/lordisrael1/Owoore) · Powered by [Nomba](https://nomba.com)

</div>

---

## What is Owoore?

Church giving in Nigeria is mostly cash in envelopes or one shared bank account with WhatsApp screenshots as receipts. Nobody knows who gave what, pledges quietly go unmet, and one person with the bank token can move everything.

Owoore replaces that with one simple primitive: **a permanent virtual bank account per member, per fund** — powered by Nomba. A member transfers ₦5,000 from any banking app to *their* Tithe account, and by the time the webhook lands we already know **who** paid, **which fund** it was for, and **whether it matches** what they pledged. No cards, no USSD, no payment pages, no manual reconciliation.

This repository is the **web frontend** — the marketing site, church admin dashboard, member portal, and signatory approval flow. The API, webhooks, ledger, and payout engine live in the [backend repository](https://github.com/lordisrael1/Owoore).

## ✨ What it does

**For the treasury (admins & treasurers)**
- 📊 **Live dashboard** — available-to-disburse balance, monthly collection trends, fund performance, recent transactions auto-reconciled via Nomba webhooks, and a real-time activity feed.
- 💸 **Governed payouts** — a guided payout wizard that shows each fund's real available balance, verifies the recipient's account name before sending, breaks down the transfer fee, and blocks insufficient requests *before* they're submitted. Transfers above a configurable threshold require **M-of-N signatory approval** via secure email links before a single kobo moves.
- 👥 **Member oversight** — who gave, who's behind on pledges, per-fund giver lists, arrears reports, and CSV exports.
- 🪣 **Funds** — recurring funds (Tithe, Offering) and time-boxed campaigns (Building Fund), with shared accounts for collective giving and a private Anonymous Giving channel where names are never recorded.
- 🔗 **Join links** — members self-onboard with a shareable link; no admin data entry.

**For members**
- 🏦 A personal portal showing their dedicated account numbers per fund, giving history, and pledge status.
- 🕊️ Anonymous and collective giving options that deliberately keep no per-member records.

**For signatories**
- ✅ One-click approve/decline pages opened straight from the approval email — token-secured, expiring, and audited.

## 🗺️ Route map

| Area | Routes |
|---|---|
| **Public** | `/` landing · `/register` (+ logo upload) · `/login` · `/forgot-password` · `/verify-email` |
| **Onboarding** | `/setup` · `/join/[slug]` member self-registration · `/give/[slug]` anonymous giving · `/invite/[token]` team invites |
| **Dashboard** | `/dashboard` overview · `members` · `funds` · `payouts` (+ wizard, detail) · `signatories` · `reports` (+ arrears) · `join-link` · `settings` (+ team) |
| **Member portal** | `/portal` · `/portal/accounts` · `/portal/funds/[fundId]` |
| **Approvals** | `/approve/[token]` · `/approve/[token]/decline` |

## 🧱 Tech stack

| Layer | Choice |
|---|---|
| Framework | **Next.js 16** (App Router) + **React 19** |
| Styling | **Tailwind CSS**, Geist Sans/Mono, dark mode throughout |
| Data fetching | **SWR** — polling dashboards, focus revalidation, optimistic mutations |
| State | **Zustand** (auth, org, UI stores) |
| Auth | JWT access tokens + rotating refresh tokens against the backend |
| Money | **All amounts are integer kobo end-to-end** — naira exists only at the display layer, so floating-point never touches money |

## 🔒 Security posture

- Strict **Content-Security-Policy** plus `X-Frame-Options`, `nosniff`, HSTS, `Referrer-Policy`, and `Permissions-Policy` on every response ([next.config.ts](next.config.ts)).
- API calls go **same-origin** through a Next.js rewrite — the browser never needs third-party connect permissions.
- Admin sessions are short-lived JWTs; member sessions use rotating refresh tokens where replay of a used token revokes the whole family.
- Password reset is OTP-based with generic responses that never reveal whether an account exists; passwords require length, case, and digit complexity.
- Approval links are single-purpose, expiring tokens — a signatory never needs an account or password.

## 🚀 Getting started

```bash
git clone https://github.com/lordisrael1/Owoore_Frontend.git
cd Owoore_Frontend
npm install
```

Create `.env`:

```bash
# Same-origin path proxied to the backend via next.config.ts rewrites.
# Point it at a full URL instead to hit a local backend directly.
NEXT_PUBLIC_API_URL=/api/v1
```

Run it:

```bash
npm run dev        # http://localhost:3000
npm run build      # production build
npx tsc --noEmit   # typecheck
```

To run the full stack locally, start the [backend](https://github.com/lordisrael1/Owoore) (Express 5 + PostgreSQL + Redis) and set `NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1`.

## 📁 Project structure

```
app/            Routes (App Router) — landing, dashboard, portal, approvals
components/     UI kit (Button, Input, Modal, Toast…) + feature components
  dashboard/      metric strip, charts, fund performance, activity feed
  payout/         payout wizard, bank lookup, approval timeline
  layout/         sidebars, top bars, navigation
hooks/          SWR hooks (useDashboard, usePayouts, useFunds, useAuth…)
lib/
  api/            typed API clients — one file per backend module
  kobo.ts         kobo ↔ naira conversion (mirrors the backend exactly)
  format.ts       ₦ formatting, periods, dates
store/          Zustand stores (auth, org, UI)
```

## 🤝 The money path, end to end

```
Member's banking app
      │  bank transfer to their dedicated NUBAN
      ▼
Nomba virtual account ──▶ webhook ──▶ backend reconciliation ──▶ fund ledger
                                                                    │
Dashboard (this repo) ◀── SWR polling ──────────────────────────────┘
      │
      │  admin initiates payout (balance-aware wizard)
      ▼
M-of-N signatory approval via email ──▶ Nomba transfer ──▶ settled ✓
```

---

<div align="center">

Built for the **DevCareer × Nomba Hackathon 2026** · Made with ❤️ for Nigerian churches

</div>
