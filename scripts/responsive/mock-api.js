/**
 * mock-api.js — stand-in for the DropTithe backend on localhost:4000.
 * Serves { success, data } envelopes matching lib/api/* interfaces exactly.
 * Includes deliberate worst-case content (long names, huge numbers, long
 * narrations) so responsive stress testing uses realistic extremes.
 *
 * Toggle stress mode per-request with header `x-mock-stress: 1` — but since
 * the app can't send custom headers, stress mode is instead toggled by
 * GET /__mock/stress/on|off (persists in memory).
 */
const http = require('http');

let STRESS = false;

// ── helpers ──────────────────────────────────────────────────────────────────
const b64url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64')
  .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const mkJwt = (payload) =>
  `${b64url({ alg: 'HS256', typ: 'JWT' })}.${b64url(payload)}.sig`;

const now = Math.floor(Date.now() / 1000);
const ORG_ID = 'org-0001';
const ADMIN_TOKEN_PAYLOAD = {
  sub: 'admin-0001', orgId: ORG_ID, email: 'admin@gracechapel.org',
  role: 'ADMIN', iat: now, exp: now + 60 * 60 * 24 * 30,
};
const MEMBER_TOKEN_PAYLOAD = {
  sub: 'mem-0001', orgId: ORG_ID, email: 'member@example.com',
  role: 'MEMBER', iat: now, exp: now + 60 * 60 * 24 * 30,
};

const naira = (kobo) => {
  const n = kobo / 100;
  return '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Names: mix of normal + worst-case
const LONG_NAME = 'Chukwuemeka Oluwaferanmi Abayomrunkoje Ogunbanjo-Adewalechristopher III';
const LONG_EMAIL = 'chukwuemeka.oluwaferanmi.abayomrunkoje@verylongchurchdomainname.org.ng';
const LONG_FUND = STRESS_FUND_NAME();
function STRESS_FUND_NAME() {
  return 'Cathedral Roofing, Multimedia Equipment & International Missions Expansion Building Fund 2026';
}
const LONG_NARRATION = 'TRF/FRM/CHUKWUEMEKA OLUWAFERANMI ABAYOMRUNKOJE/UBA/REF-0034859201123998877/JANUARY TITHE AND OFFERING PLUS BUILDING FUND CONTRIBUTION GOD BLESS';

const ORG = (stress) => ({
  id: ORG_ID,
  name: stress ? 'The Redeemed Evangelical Mission of Christ Apostolic Cathedral International, Lagos Mainland Diocese' : 'Grace Chapel Int’l',
  slug: 'grace-chapel',
  logo_url: null,
});

const org = () => ORG(STRESS);

const monthsBack = (n) => {
  const d = new Date(Date.UTC(2026, 6 - n, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
};

const FUND_DEFS = () => [
  { id: 'fund-tithe', name: 'Tithe', kind: 'RECURRING', shared: false, anon: false, expected: 5000000 },
  { id: 'fund-offering', name: 'Offering', kind: 'RECURRING', shared: true, anon: false, expected: null },
  { id: 'fund-building', name: STRESS ? STRESS_FUND_NAME() : 'Building Fund', kind: 'CAMPAIGN', shared: false, anon: false, expected: 250000000 },
  { id: 'fund-missions', name: 'Missions & Evangelism Outreach', kind: 'CAMPAIGN', shared: false, anon: false, expected: 10000000 },
  { id: 'fund-anon', name: 'Anonymous Giving', kind: 'RECURRING', shared: true, anon: true, expected: null },
];

const MEMBER_NAMES = () => [
  STRESS ? LONG_NAME : 'Adaeze Okonkwo',
  'Tunde Bakare', 'Ngozi Eze', 'Ibrahim Musa', 'Funke Akindele-Bello',
  'Emeka Obi', 'Yemi Alade', 'Chiamaka Nwosu', 'Segun Arinze', 'Bisi Adeleke',
  'Kelechi Iheanacho', 'Aisha Mohammed', 'Obinna Nwachukwu', 'Temitope Ogunleye',
  'Chinedu Okafor', 'Blessing Okagbare-Ighoteguonor', 'Musa Yar’Adua', 'Folake Solanke',
  'Peter Rufai', 'Amara Kanu', 'Dele Alli', 'Osas Ighodaro', 'Zainab Balogun',
  'Richard Mofe-Damijo', 'Genevieve Nnaji',
];

function membersList() {
  return MEMBER_NAMES().map((name, i) => ({
    id: `mem-${String(i + 1).padStart(4, '0')}`,
    org_id: ORG_ID,
    email: i === 0 && STRESS ? LONG_EMAIL : `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@gmail.com`,
    display_name: name,
    member_code: `GC-${1000 + i}`,
    is_active: i % 9 !== 8,
    joined_at: new Date(Date.UTC(2026, i % 6, (i % 27) + 1)).toISOString(),
  }));
}

function amountFor(i) {
  if (!STRESS) return [500000, 1200000, 2500000, 75000, 10000000][i % 5];
  return [50, 123456789012, 999999999, 2500000, 100][i % 5]; // ₦0.50 up to ₦1.23bn
}

// ── endpoint payloads ────────────────────────────────────────────────────────

function dashboardSummary() {
  const trend = [5, 4, 3, 2, 1, 0].map((n, i) => {
    const collected = STRESS ? [12000000, 4500000000, 890000, 123456789012, 7600000, 98700000][i] : 45000000 + i * 12000000;
    return {
      period_month: monthsBack(n),
      total_collected_kobo: collected,
      total_paid_out_kobo: Math.floor(collected * 0.6),
      transaction_count: 40 + i * 17,
      collected_display: naira(collected),
    };
  });
  const total = trend.reduce((s, t) => s + t.total_collected_kobo, 0);
  return {
    total_collected_all_time_kobo: total,
    total_paid_out_all_time_kobo: Math.floor(total * 0.55),
    total_fees_all_time_kobo: Math.floor(total * 0.011),
    available_balance_kobo: Math.floor(total * 0.44),
    pending_payouts_kobo: STRESS ? 123456789012 : 15000000,
    active_members: STRESS ? 12847 : 25,
    total_transactions: STRESS ? 194382 : 214,
    period_month: '2026-07',
    deficit_member_count: STRESS ? 1204 : 7,
    total_collected_display: naira(total),
    available_display: naira(Math.floor(total * 0.44)),
    pending_payouts_display: naira(STRESS ? 123456789012 : 15000000),
    total_fees_display: naira(Math.floor(total * 0.011)),
    trend,
  };
}

function fundBreakdown() {
  return FUND_DEFS().map((f, i) => {
    const collected = STRESS ? [123456789012, 50, 4500000000, 890000, 999999999][i] : [82000000, 34000000, 120000000, 8000000, 2500000][i];
    const paidOut = Math.floor(collected * 0.5);
    const fees = Math.floor(collected * 0.011);
    const soft = i === 2 ? Math.floor(collected * 0.1) : 0;
    const avail = collected - paidOut - fees - soft;
    return {
      fund_type_id: f.id, fund_name: f.name, kind: f.kind,
      is_shared_va: f.shared, is_anonymous_only: f.anon,
      total_collected_kobo: collected, total_paid_out_kobo: paidOut,
      total_fees_kobo: fees, soft_lock_kobo: soft, available_kobo: avail,
      member_count_paid: STRESS ? 11208 : 18 - i * 3,
      total_transactions: STRESS ? 88123 : 60 - i * 9,
      collected_display: naira(collected), fees_display: naira(fees),
      available_display: naira(avail),
    };
  });
}

function memberStatus() {
  const funds = FUND_DEFS().filter((f) => !f.anon && !f.shared);
  const rows = [];
  membersList().forEach((m, mi) => {
    funds.forEach((f, fi) => {
      const expected = f.expected;
      const paid = mi % 3 === 0 ? expected ?? 0 : mi % 3 === 1 ? Math.floor((expected ?? 0) / 2) : 0;
      const deficit = Math.max((expected ?? 0) - paid, 0);
      rows.push({
        member_id: m.id, member_name: m.display_name, member_code: m.member_code,
        fund_type_id: f.id, fund_name: f.name,
        total_paid_kobo: paid, expected_kobo: expected,
        deficit_kobo: deficit,
        payment_status: deficit === 0 ? 'PAID' : paid > 0 ? 'PARTIAL' : 'UNPAID',
        transaction_count: mi % 4,
        total_paid_display: naira(paid),
        expected_display: expected != null ? naira(expected) : null,
        deficit_display: deficit > 0 ? naira(deficit) : null,
      });
    });
  });
  return rows;
}

function payoutRow(i, detail) {
  const statuses = ['PENDING', 'PARTIAL', 'APPROVED', 'TRANSFERRING', 'TRANSFERRED', 'DECLINED', 'EXPIRED', 'FAILED', 'CANCELLED'];
  const f = FUND_DEFS()[i % 4];
  const amount = amountFor(i);
  return {
    id: `payout-${String(i + 1).padStart(3, '0')}`,
    org_id: ORG_ID, fund_type_id: f.id,
    bank_account_id: 'ba-001',
    initiated_by: STRESS && i % 2 === 0 ? LONG_NAME : 'Pastor Dele Adeyemi',
    amount_kobo: amount,
    purpose: STRESS && i % 3 === 0
      ? 'Payment for the complete renovation of the church auditorium including new air conditioning units, sound equipment, projector screens and the extension of the children’s wing as approved in the January board meeting'
      : ['Generator diesel', 'Guest minister honorarium', 'Building materials', 'Staff salaries July'][i % 4],
    status: statuses[i % statuses.length],
    nomba_transfer_ref: i % 3 === 0 ? `NMB-TRF-${900000 + i}` : null,
    nomba_transfer_id: null,
    transfer_error: statuses[i % statuses.length] === 'FAILED' ? 'Beneficiary bank unavailable. Circuit breaker open after 5 consecutive failures upstream — retry scheduled.' : null,
    approvals_received: i % 3,
    declined_by: statuses[i % statuses.length] === 'DECLINED' ? 'Elder Nkechi Okoro-Anyanwu' : null,
    executed_at: statuses[i % statuses.length] === 'TRANSFERRED' ? new Date(Date.UTC(2026, 6, 2 + i)).toISOString() : null,
    expires_at: new Date(Date.UTC(2026, 6, 20 + (i % 5))).toISOString(),
    created_at: new Date(Date.UTC(2026, 6, 1 + (i % 9))).toISOString(),
    updated_at: new Date(Date.UTC(2026, 6, 2 + (i % 9))).toISOString(),
    account_number: detail ? '0123456789' : null,
    bank_name: detail ? (STRESS ? 'United Bank for Africa (UBA) — Lagos Mainland Corporate Branch' : 'GTBank') : null,
    recipient_name: detail ? (STRESS ? LONG_NAME : 'Grace Chapel Building Committee') : null,
  };
}

function payoutHistory() {
  return Array.from({ length: 12 }, (_, i) => {
    const p = payoutRow(i, true);
    return {
      id: p.id, fund_name: FUND_DEFS()[i % 4].name, amount_kobo: p.amount_kobo,
      purpose: p.purpose, status: p.status, initiated_by: p.initiated_by,
      executed_at: p.executed_at, created_at: p.created_at,
      bank_name: p.bank_name, account_number: p.account_number,
      amount_display: naira(p.amount_kobo),
    };
  });
}

function ledger(limitQ, offsetQ) {
  const limit = Number(limitQ ?? 25);
  const offset = Number(offsetQ ?? 0);
  const totalRows = 137;
  const names = MEMBER_NAMES();
  const txs = Array.from({ length: Math.min(limit, totalRows - offset) }, (_, k) => {
    const i = offset + k;
    const anon = i % 4 === 3;
    const f = FUND_DEFS()[i % 4];
    const amount = amountFor(i);
    const variance = STRESS ? [-4999950, 0, 123456700, -50, 0][i % 5] : [0, -250000, 0, 500000, 0][i % 5];
    return {
      id: `tx-${String(i + 1).padStart(5, '0')}`,
      source: anon ? 'ANONYMOUS' : 'MEMBER',
      member_id: anon ? null : `mem-${String((i % 25) + 1).padStart(4, '0')}`,
      member_name: anon ? null : names[i % names.length],
      member_code: anon ? null : `GC-${1000 + (i % 25)}`,
      fund_type_id: f.id, fund_name: f.name,
      amount_kobo: amount,
      payment_status: variance === 0 ? 'EXACT' : variance < 0 ? 'UNDERPAYMENT' : 'OVERPAYMENT',
      variance_kobo: variance,
      sender_bank: anon ? null : ['GTBank', 'Access Bank', 'UBA', 'Zenith Bank', STRESS ? 'First City Monument Bank (FCMB) Wealth Management Division' : 'Kuda'][i % 5],
      narration: i % 3 === 0 ? (STRESS ? LONG_NARRATION : 'July tithe') : null,
      period_month: monthsBack(i % 6),
      created_at: new Date(Date.UTC(2026, 6, 12) - i * 8_640_000).toISOString(),
      amount_display: naira(amount),
    };
  });
  return { total: totalRows, limit, offset, transactions: txs };
}

function activity() {
  return Array.from({ length: 15 }, (_, i) => ({
    id: `act-${i}`,
    type: ['payment', 'payout', 'member', 'campaign', 'system'][i % 5],
    title: ['Payment received', 'Payout executed', 'New member joined', 'Campaign target reached', 'Weekly reconciliation complete'][i % 5],
    desc: STRESS && i % 2 === 0
      ? `${LONG_NAME} paid ${naira(123456789012)} into ${STRESS_FUND_NAME()} via bank transfer with narration "${LONG_NARRATION}"`
      : ['Adaeze Okonkwo paid ₦5,000.00 into Tithe', '₦150,000.00 sent to GTBank ••••6789', 'Tunde Bakare joined via join link', 'Building Fund hit 48% of target', 'All 214 transactions reconciled'][i % 5],
    time: new Date(Date.now() - (i * 3 + 2) * 60_000).toISOString(),
    action: ['/dashboard/transactions', '/dashboard/payouts', '/dashboard/members', '/dashboard/funds', '/dashboard'][i % 5],
  }));
}

function fundTypes(includeInactive) {
  return FUND_DEFS().map((f, i) => ({
    id: f.id, org_id: ORG_ID, name: f.name, kind: f.kind,
    description: i === 2 ? (STRESS ? 'Phase 2 of the cathedral project covering roofing sheets, aluminium windows, POP ceiling, electrical fittings, plumbing, painting inside and outside, landscaping of the premises and the perimeter fence with razor wire as approved by the building committee.' : 'Phase 2 cathedral project') : null,
    expected_amt_kobo: f.expected,
    expires_at: f.kind === 'CAMPAIGN' ? '2026-12-31T23:59:59.000Z' : null,
    is_active: true,
    is_shared_va: f.shared,
    shared_va_number: f.shared ? '9977001234' : null,
    shared_va_bank: f.shared ? 'Amucha MFB' : null,
    sort_order: i,
    created_at: '2026-01-05T09:00:00.000Z',
    updated_at: '2026-06-01T09:00:00.000Z',
  })).filter((f) => includeInactive || f.is_active);
}

function teamMembers() {
  const statuses = ['ACTIVE', 'INVITED', 'INVITE_EXPIRED', 'DEACTIVATED'];
  return Array.from({ length: 6 }, (_, i) => ({
    id: `admin-${String(i + 1).padStart(4, '0')}`,
    name: i === 1 && STRESS ? LONG_NAME : ['Pastor Dele Adeyemi', 'Nkechi Okoro', 'Samuel Danladi', 'Grace Effiong', 'Tobi Lawal', 'Mary Onyeka'][i],
    email: i === 1 && STRESS ? LONG_EMAIL : `staff${i}@gracechapel.org`,
    role: i === 0 ? 'ADMIN' : 'TREASURER',
    status: statuses[i % 4],
    is_verified: i % 4 === 0,
    invited_by_name: i === 0 ? null : 'Pastor Dele Adeyemi',
    created_at: new Date(Date.UTC(2026, i % 6, 3 + i)).toISOString(),
  }));
}

function signatories() {
  return Array.from({ length: 4 }, (_, i) => ({
    id: `sig-${i + 1}`, org_id: ORG_ID,
    name: i === 0 && STRESS ? LONG_NAME : ['Elder Nkechi Okoro-Anyanwu', 'Deacon Femi Kuti', 'Trustee Halima Abubakar', 'Pastor Dele Adeyemi'][i],
    email: i === 0 && STRESS ? LONG_EMAIL : `sig${i}@gracechapel.org`,
    phone: i % 2 === 0 ? '+2348012345678' : null,
    role: ['ELDER', 'DEACON', 'TRUSTEE', 'PASTOR'][i],
    can_initiate: i > 1, can_approve: true, is_active: i !== 3,
    created_at: '2026-01-10T08:00:00.000Z', updated_at: '2026-05-01T08:00:00.000Z',
  }));
}

function givingReport(year) {
  const rows = [];
  FUND_DEFS().slice(0, 4).forEach((f, fi) => {
    for (let m = 0; m < 7; m++) {
      const collected = STRESS ? amountFor(fi + m) : 8000000 + fi * 3000000 + m * 900000;
      rows.push({
        fund_type_id: f.id, fund_name: f.name,
        period_month: `${year}-${String(m + 1).padStart(2, '0')}`,
        total_collected: collected,
        total_paid_out: Math.floor(collected * 0.5),
        member_count: 12 + m, tx_count: 30 + m * 3,
        collected_display: naira(collected),
        period_display: new Date(Date.UTC(year, m, 1)).toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }),
      });
    }
  });
  return {
    year, fund_totals: rows,
    arrears_summary: { members_with_deficit: STRESS ? 1204 : 7, total_deficit_kobo: STRESS ? 999999999999 : 32500000 },
  };
}

function arrears() {
  return membersList().slice(0, 9).map((m, i) => ({
    member_id: m.id, member_name: m.display_name, member_code: m.member_code,
    email: m.email,
    total_deficit_kobo: STRESS ? amountFor(i) : 2500000 + i * 400000,
    funds: FUND_DEFS().slice(0, i % 3 + 1).map((f, fi) => ({
      fund_name: f.name, deficit_kobo: 1000000 + fi * 500000,
    })),
  }));
}

function memberStatement(id) {
  const m = membersList().find((x) => x.id === id) ?? membersList()[0];
  return {
    member: { id: m.id, name: m.display_name, member_code: m.member_code, joined_at: m.joined_at },
    year: 2026,
    total_paid_kobo: STRESS ? 123456789012 : 32500000,
    total_paid_display: naira(STRESS ? 123456789012 : 32500000),
    fund_summary: FUND_DEFS().slice(0, 3).map((f, i) => ({
      fund_name: f.name,
      total_paid_kobo: 5000000 + i * 2500000,
      total_paid_display: naira(5000000 + i * 2500000),
      expected_kobo: f.expected, expected_display: f.expected != null ? naira(f.expected) : null,
      pledge_progress_pct: [100, 48, 3][i],
      deficit_kobo: [0, 2600000, 245000000][i],
    })),
    transactions: Array.from({ length: 14 }, (_, i) => ({
      id: `tx-st-${i}`,
      fund_name: FUND_DEFS()[i % 3].name,
      period_month: monthsBack(i % 6),
      amount_kobo: amountFor(i),
      payment_status: ['EXACT', 'UNDERPAYMENT', 'OVERPAYMENT'][i % 3],
      variance_kobo: [0, -250000, 500000][i % 3],
      created_at: new Date(Date.UTC(2026, 6, 10) - i * 6_048_000_00).toISOString(),
      amount_display: naira(amountFor(i)),
      period_display: 'July 2026',
      narration: i % 4 === 0 ? (STRESS ? LONG_NARRATION : 'Tithe') : null,
    })),
  };
}

function meResponse() {
  return {
    member: {
      id: 'mem-0001',
      name: STRESS ? LONG_NAME : 'Adaeze Okonkwo',
      email: STRESS ? LONG_EMAIL : 'adaeze@gmail.com',
      memberCode: 'GC-1000', joinedAt: '2026-01-15T10:00:00.000Z',
    },
    org: { ...org(), joinLink: `https://owoore.com/join/grace-chapel` },
    fundTypes: fundTypes(false).filter((f) => !f.name.includes('Anonymous')).map((f, i) => ({
      id: f.id, name: f.name, kind: f.kind, expected_amt_kobo: f.expected_amt_kobo,
      expires_at: f.expires_at, sort_order: i, is_shared_va: f.is_shared_va,
    })),
    fundSummaries: FUND_DEFS().slice(0, 4).map((f, i) => {
      const paid = [5000000, 1200000, 12000000, 0][i];
      const expected = f.expected;
      const deficit = Math.max((expected ?? 0) - paid, 0);
      return {
        fund_type_id: f.id, fund_name: f.name, kind: f.kind,
        total_paid_kobo: paid, total_paid_naira: paid / 100,
        expected_amt_kobo: expected, expected_amt_naira: expected != null ? expected / 100 : null,
        deficit_kobo: deficit, deficit_naira: deficit / 100,
        surplus_kobo: 0,
        pledge_progress_pct: expected ? Math.min(Math.round((paid / expected) * 100), 100) : 0,
        transaction_count: [7, 3, 2, 0][i],
        last_paid_at: i < 3 ? '2026-07-06T09:30:00.000Z' : null,
        is_fulfilled: i === 0,
      };
    }),
  };
}

function givingHistory() {
  return Array.from({ length: 18 }, (_, i) => ({
    id: `tx-gh-${i}`,
    fund_name: FUND_DEFS()[i % 4].name,
    period_month: monthsBack(i % 6),
    amount_kobo: amountFor(i),
    payment_status: ['EXACT', 'UNDERPAYMENT', 'OVERPAYMENT'][i % 3],
    variance_kobo: [0, -250000, 500000][i % 3],
    created_at: new Date(Date.UTC(2026, 6, 11) - i * 5_000_000_00).toISOString(),
    sender_name: i % 3 === 0 ? (STRESS ? LONG_NAME : 'Adaeze Okonkwo') : null,
    narration: i % 4 === 0 ? (STRESS ? LONG_NARRATION : 'July tithe') : null,
  }));
}

const BANKS = [
  ['058', 'GTBank'], ['044', 'Access Bank'], ['033', 'United Bank for Africa'],
  ['057', 'Zenith Bank'], ['011', 'First Bank of Nigeria'], ['214', 'First City Monument Bank'],
  ['070', 'Fidelity Bank'], ['232', 'Sterling Bank'], ['035', 'Wema Bank'],
  ['50211', 'Kuda Microfinance Bank'], ['090267', 'Amucha Microfinance Bank Limited (formerly Amucha Cooperative Savings & Loans)'],
];

// ── router ───────────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://localhost:4000');
  const p = u.pathname.replace(/^\/api\/v1/, '');
  const q = u.searchParams;
  let body = '';
  req.on('data', (c) => { body += c; });
  req.on('end', () => {
    const send = (data, status = 200) => {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, data }));
    };
    const csv = (text, name) => {
      res.writeHead(200, { 'Content-Type': 'text/csv', 'Content-Disposition': `attachment; filename=${name}` });
      res.end(text);
    };

    // mock controls
    if (p === '/__mock/stress/on') { STRESS = true; return send({ stress: true }); }
    if (p === '/__mock/stress/off') { STRESS = false; return send({ stress: false }); }

    // auth
    if (p === '/auth/admin/login') {
      return send({ token: mkJwt(ADMIN_TOKEN_PAYLOAD), admin: { id: 'admin-0001', name: 'Pastor Dele Adeyemi', email: 'admin@gracechapel.org', role: 'ADMIN', orgId: ORG_ID, orgSlug: 'grace-chapel' } });
    }
    if (p === '/auth/send-otp') return send({ message: 'OTP sent' });
    if (p === '/auth/verify-otp') {
      return send({
        token: mkJwt(MEMBER_TOKEN_PAYLOAD), refreshToken: 'refresh-abc',
        refreshTokenExpiresAt: new Date(Date.now() + 30 * 864e5).toISOString(),
        member: { id: 'mem-0001', name: STRESS ? LONG_NAME : 'Adaeze Okonkwo', email: 'adaeze@gmail.com', memberCode: 'GC-1000', orgId: ORG_ID, orgSlug: 'grace-chapel', isNew: false },
      });
    }
    if (p === '/auth/refresh') return send({ token: mkJwt(MEMBER_TOKEN_PAYLOAD), refreshToken: 'refresh-abc2' });
    if (p === '/auth/admin/forgot-password') return send({ message: 'If that account exists, a reset code has been emailed.' });
    if (p === '/auth/admin/reset-password') return send({ message: 'Password reset successfully.' });
    if (p === '/auth/admin/verify-email') {
      return send({ token: mkJwt(ADMIN_TOKEN_PAYLOAD), admin: { id: 'admin-0001', name: 'Pastor Dele Adeyemi', email: 'admin@gracechapel.org', role: 'ADMIN', orgId: ORG_ID, orgSlug: 'grace-chapel' } });
    }

    // dashboard
    if (p === '/dashboard/summary') return send(dashboardSummary());
    if (p === '/dashboard/fund-breakdown') return send(fundBreakdown());
    if (p === '/dashboard/member-status') return send(memberStatus());
    if (p === '/dashboard/payout-history') return send(payoutHistory());
    if (p === '/dashboard/transactions') return send(ledger(q.get('limit'), q.get('offset')));
    if (p === '/dashboard/activity') return send(activity());

    // orgs & funds
    if (/^\/orgs\/[^/]+\/funds$/.test(p) && req.method === 'GET') return send(fundTypes(q.get('includeInactive') === 'true'));
    if (/^\/orgs\/[^/]+\/funds$/.test(p) && req.method === 'POST') return send(fundTypes(false)[0]);
    if (/^\/orgs\/[^/]+\/reports\/giving/.test(p)) {
      if (q.get('format') === 'csv') return csv('fund,period,collected\nTithe,2026-07,820000.00\n', 'giving.csv');
      return send(givingReport(Number(q.get('year') ?? 2026)));
    }
    if (/^\/orgs\/[^/]+$/.test(p) && req.method === 'GET') return send({ ...org(), joinLink: 'https://owoore.com/join/grace-chapel' });
    if (/^\/orgs\/[^/]+$/.test(p) && req.method === 'PATCH') return send(org());
    if (p === '/orgs' && req.method === 'POST') {
      return send({ org: org(), admin: { id: 'admin-0001', email: 'admin@gracechapel.org', role: 'ADMIN' }, joinLink: 'https://owoore.com/join/grace-chapel' });
    }
    if (/^\/funds\/[^/]+$/.test(p)) {
      const id = p.split('/')[2];
      const f = fundTypes(true).find((x) => x.id === id) ?? fundTypes(true)[2];
      if (req.method === 'DELETE') return send({ success: true, message: 'Fund deactivated' });
      return send(f);
    }

    // members
    if (p === '/members') {
      const list = membersList();
      const limit = Number(q.get('limit') ?? 50); const offset = Number(q.get('offset') ?? 0);
      return send({ members: list.slice(offset, offset + limit), total: list.length, limit, offset });
    }
    if (/^\/members\/[^/]+\/statement$/.test(p)) {
      if (q.get('format') === 'csv') return csv('date,fund,amount\n2026-07-01,Tithe,50000.00\n', 'statement.csv');
      return send(memberStatement(p.split('/')[2]));
    }

    // reports
    if (p === '/reports/arrears') return send(arrears());

    // payouts
    if (p === '/payouts' && req.method === 'GET') {
      const status = q.get('status');
      let rows = Array.from({ length: 14 }, (_, i) => payoutRow(i, false));
      if (status) rows = rows.filter((r) => r.status === status);
      return send(rows);
    }
    if (p === '/payouts' && req.method === 'POST') return send({ payoutRequestId: 'payout-new-001' });
    if (p === '/payouts/fund-balances') {
      return send({
        transfer_fee_kobo: 5375,
        funds: fundBreakdown().map((f) => ({
          fund_type_id: f.fund_type_id, fund_name: f.fund_name, kind: f.kind,
          is_anonymous_only: f.is_anonymous_only,
          available_kobo: f.available_kobo, available_display: f.available_display,
        })),
      });
    }
    if (/^\/payouts\/[^/]+$/.test(p) && req.method === 'GET') {
      const i = Number(p.split('/')[2].replace(/\D/g, '')) - 1;
      return send(payoutRow(Number.isFinite(i) && i >= 0 ? i : 0, true));
    }
    if (/^\/payouts\/[^/]+$/.test(p) && req.method === 'DELETE') return send({ success: true });

    // banks
    if (p === '/banks') return send(BANKS.map(([code, name]) => ({ code, name })));
    if (p === '/banks/lookup') {
      return send({ accountNumber: '0123456789', accountName: STRESS ? LONG_NAME.toUpperCase() : 'GRACE CHAPEL BUILDING COMMITTEE', bankCode: '058', bankName: 'GTBank' });
    }

    // signatories
    if (p === '/signatories' && req.method === 'GET') return send(signatories());
    if (p === '/signatories' && req.method === 'POST') return send(signatories()[0]);
    if (p === '/signatories/policy') {
      return send({ org_id: ORG_ID, min_approvers: 2, threshold_kobo: 10000000, token_expiry_hours: 48, auto_decline_hours: 72 });
    }
    if (/^\/signatories\/[^/]+$/.test(p)) {
      if (req.method === 'DELETE') return send({ success: true });
      return send(signatories()[0]);
    }

    // team / admin-users
    if (p === '/admin-users' && req.method === 'GET') return send(teamMembers());
    if (p === '/admin-users/invite' && req.method === 'POST') return send({ message: 'Invite sent' });
    if (/^\/admin-users\/invite\/[^/]+$/.test(p)) {
      return send({
        email: STRESS ? LONG_EMAIL : 'newtreasurer@gracechapel.org',
        org_name: org().name,
        invited_by: STRESS ? LONG_NAME : 'Pastor Dele Adeyemi',
        role: 'TREASURER', expires_at: new Date(Date.now() + 72 * 36e5).toISOString(),
      });
    }
    if (/^\/admin-users\/[^/]+$/.test(p) && req.method === 'PATCH') {
      return send({ id: p.split('/')[2], is_active: JSON.parse(body || '{}').is_active ?? true });
    }

    // member portal
    if (p === '/me') return send(meResponse());
    if (p === '/me/funds') return send(fundTypes(false).filter((f) => !f.name.includes('Anonymous')));
    if (p === '/me/giving-history') return send(givingHistory());
    if (p === '/me/accounts') {
      return send(FUND_DEFS().slice(0, 3).map((f, i) => ({
        fund_type_id: f.id, fund_name: f.name,
        va_number: `99770012${30 + i}`, bank_name: 'Amucha Microfinance Bank',
        account_reference: `mem_0001_${f.id}`,
      })));
    }
    if (/^\/me\/funds\/[^/]+\/account$/.test(p)) {
      return send({ va_number: '9977001234', bank_name: 'Amucha Microfinance Bank', account_reference: 'mem_0001_fund-tithe', is_new: false, instructions: 'Transfer any amount to this account from your bank app. Payments reflect within minutes.' });
    }

    // public give page
    if (/^\/give\/[^/]+$/.test(p)) {
      return send({
        org: org(),
        account: { va_number: '9977009999', bank_name: 'Amucha Microfinance Bank', instructions: 'Transfer to this account. Your gift stays anonymous — no name is recorded.' },
        notice: 'Gifts to this account are not attributed to any member and cannot appear on a giving statement.',
      });
    }

    // approvals
    if (/^\/approve\/[^/]+\/decline$/.test(p)) return send({ status: 'DECLINED', message: 'Payout declined. Funds released.' });
    if (/^\/approve\/[^/]+$/.test(p) && req.method === 'GET') {
      return send({
        payoutId: 'payout-001', amountKobo: STRESS ? 123456789012 : 25000000,
        purpose: STRESS ? 'Payment for the complete renovation of the church auditorium including new air conditioning units, sound equipment and projector screens' : 'Building materials',
        fundName: STRESS ? STRESS_FUND_NAME() : 'Building Fund',
        bankName: 'GTBank', accountNumber: '0123456789',
        accountName: STRESS ? LONG_NAME.toUpperCase() : 'GRACE CHAPEL BUILDING COMMITTEE',
        initiatorName: 'Pastor Dele Adeyemi', orgName: org().name,
        expiresAt: new Date(Date.now() + 47 * 36e5).toISOString(), alreadyActed: false,
      });
    }
    if (/^\/approve\/[^/]+$/.test(p) && req.method === 'POST') return send({ status: 'APPROVED', message: 'Approval recorded. 1 more approval needed.' });

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: { code: 'NOT_FOUND', message: `No mock for ${req.method} ${p}` } }));
  });
});

server.listen(4000, () => console.log('mock api on :4000'));
