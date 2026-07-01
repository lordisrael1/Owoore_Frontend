/**
 * format.ts
 *
 * Display formatting utilities for the Owoore frontend.
 * All money values stored as kobo — always format before display.
 * All values come from the backend already in kobo.
 */

// ── Money ─────────────────────────────────────────────────────────────────────

/**
 * formatNaira — formats a kobo amount as ₦ string.
 *
 * Examples:
 *   formatNaira(5000000)  → "₦50,000.00"
 *   formatNaira(500)      → "₦5.00"
 *   formatNaira(0)        → "₦0.00"
 */
export function formatNaira(kobo: number): string {
  const naira = kobo / 100;
  return new Intl.NumberFormat('en-NG', {
    style:    'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(naira);
}

/**
 * formatNairaCompact — short form for dashboard metric cards.
 *
 * Examples:
 *   formatNairaCompact(2430000000) → "₦24.3M"
 *   formatNairaCompact(50000000)   → "₦500k"
 *   formatNairaCompact(5000000)    → "₦50k"
 *   formatNairaCompact(500000)     → "₦5,000"
 */
export function formatNairaCompact(kobo: number): string {
  const naira = kobo / 100;

  if (naira >= 1_000_000) {
    const val = naira / 1_000_000;
    const fmt = val % 1 === 0 ? val.toString() : val.toFixed(1);
    return `₦${fmt}M`;
  }
  if (naira >= 1_000) {
    const val = naira / 1_000;
    const fmt = val % 1 === 0 ? val.toString() : val.toFixed(1);
    return `₦${fmt}k`;
  }
  return `₦${naira.toLocaleString('en-NG')}`;
}

/**
 * formatNairaPlain — naira without currency symbol, for inputs.
 */
export function formatNairaPlain(kobo: number): string {
  return (kobo / 100).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ── Period ────────────────────────────────────────────────────────────────────

/**
 * formatPeriod — converts YYYY-MM to human-readable month.
 *
 * Examples:
 *   formatPeriod('2026-06') → "June 2026"
 *   formatPeriod('2025-12') → "December 2025"
 */
export function formatPeriod(yyyyMM: string): string {
  const [year, month] = yyyyMM.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-NG', { month: 'long', year: 'numeric' });
}

/**
 * currentPeriod — returns current period as YYYY-MM.
 */
export function currentPeriod(): string {
  return new Date().toISOString().slice(0, 7);
}

/**
 * formatDate — formats an ISO date string to Nigerian display format.
 *
 * Examples:
 *   formatDate('2026-06-27T10:42:00Z') → "27 Jun 2026"
 */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-NG', {
    day:   'numeric',
    month: 'short',
    year:  'numeric',
  });
}

/**
 * formatDateTime — date + time display.
 *
 * Examples:
 *   formatDateTime('2026-06-27T10:42:00Z') → "27 Jun 2026 · 10:42 AM"
 */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  const time = d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: true });
  return `${date} · ${time}`;
}

/**
 * formatTimeAgo — relative time string.
 *
 * Examples:
 *   "just now", "2 minutes ago", "3 hours ago", "Yesterday", "27 Jun 2026"
 */
export function formatTimeAgo(iso: string): string {
  const now   = Date.now();
  const then  = new Date(iso).getTime();
  const diffS = Math.floor((now - then) / 1000);

  if (diffS < 60)              return 'just now';
  if (diffS < 3_600)           return `${Math.floor(diffS / 60)} min ago`;
  if (diffS < 86_400)          return `${Math.floor(diffS / 3_600)} hr ago`;
  if (diffS < 86_400 * 2)      return 'Yesterday';
  return formatDate(iso);
}

// ── Phone ─────────────────────────────────────────────────────────────────────

/**
 * maskPhone — masks phone number for display.
 *
 * Example:
 *   maskPhone('+2348012345678') → "+234 801 ****678"
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return phone;
  const last3 = phone.slice(-3);
  const first4 = phone.slice(0, 4);
  return `${first4} ****${last3}`;
}

/**
 * formatPhone — Nigerian phone number display format.
 *
 * Examples:
 *   formatPhone('+2348012345678') → "0801 234 5678"
 *   formatPhone('08012345678')    → "0801 234 5678"
 */
export function formatPhone(phone: string): string {
  // Normalise to local format
  const local = phone.startsWith('+234')
    ? '0' + phone.slice(4)
    : phone;

  if (local.length !== 11) return local;
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
}

// ── Account ───────────────────────────────────────────────────────────────────

/**
 * maskAccount — masks NUBAN for display (shows last 4 only).
 *
 * Example:
 *   maskAccount('0123456789') → "****6789"
 */
export function maskAccount(account: string): string {
  if (!account || account.length < 4) return account;
  return `*${account.slice(-4)}`;
}

/**
 * formatAccount — groups NUBAN digits for readability.
 *
 * Example:
 *   formatAccount('0123456789') → "0123 456 789"
 */
export function formatAccount(account: string): string {
  const clean = account.replace(/\s/g, '');
  if (clean.length === 10) {
    return `${clean.slice(0, 4)} ${clean.slice(4, 7)} ${clean.slice(7)}`;
  }
  return account;
}

// ── Member code ───────────────────────────────────────────────────────────────

/**
 * formatMemberCode — displays member code with church prefix.
 *
 * Example: "CHR-00142"
 */
export function formatMemberCode(code: string): string {
  return code.toUpperCase();
}

// ── Payment status ────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  EXACT:        'Paid ✓',
  UNDERPAYMENT: 'Partial',
  OVERPAYMENT:  'Overpaid',
  PAID:         'Paid ✓',
  PARTIAL:      'Partial',
  UNPAID:       'Unpaid',
};

export function formatPaymentStatus(status: string): string {
  return STATUS_LABELS[status] ?? status;
}