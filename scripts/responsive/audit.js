/**
 * audit.js — responsive sweep of the Owoore frontend.
 *
 * Usage: node audit.js [--stress] [--routes r1,r2] [--widths 320,768] [--shots]
 * Output: audit-report.json + screenshots in ./shots/<route>/<width>.png (when --shots)
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const http = require('http');

const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const val = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };

const BASE = 'http://localhost:3000';

const ALL_WIDTHS = [320, 360, 375, 390, 414, 480, 768, 820, 1024, 1280, 1440, 1920];
const WIDTHS = val('--widths') ? val('--widths').split(',').map(Number) : ALL_WIDTHS;
const heightFor = (w) => (w <= 480 ? 740 : w <= 820 ? 1080 : 800);

const ADMIN_ROUTES = [
  '/dashboard', '/dashboard/transactions', '/dashboard/members',
  '/dashboard/members/mem-0001', '/dashboard/funds', '/dashboard/funds/fund-building',
  '/dashboard/funds/new', '/dashboard/payouts', '/dashboard/payouts/payout-001',
  '/dashboard/payouts/new', '/dashboard/reports', '/dashboard/reports/arrears',
  '/dashboard/signatories', '/dashboard/settings', '/dashboard/settings/team',
  '/dashboard/join-link',
];
const MEMBER_ROUTES = ['/portal', '/portal/accounts', '/portal/funds/fund-tithe'];
const PUBLIC_ROUTES = [
  '/', '/login', '/register', '/forgot-password', '/verify-email',
  '/join/grace-chapel', '/give/grace-chapel', '/invite/mock-token-123',
  '/approve/mock-token-123', '/approve/mock-token-123/decline', '/setup',
];
const ROUTES = val('--routes') ? val('--routes').split(',') : [...PUBLIC_ROUTES, ...ADMIN_ROUTES, ...MEMBER_ROUTES];

function getJSON(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = http.request(url, { method }, (res) => {
      let b = ''; res.on('data', (c) => (b += c)); res.on('end', () => resolve(JSON.parse(b)));
    });
    req.on('error', reject); req.end();
  });
}

(async () => {
  // toggle stress mode on the mock
  await getJSON(`http://localhost:4000/api/v1/__mock/stress/${has('--stress') ? 'on' : 'off'}`);
  const adminLogin = await getJSON('http://localhost:4000/api/v1/auth/admin/login', 'POST');
  const memberLogin = await getJSON('http://localhost:4000/api/v1/auth/verify-otp', 'POST');
  const adminToken = adminLogin.data.token;
  const memberToken = memberLogin.data.token;

  const browser = await chromium.launch();
  const report = [];
  const shotsDir = path.join(__dirname, 'shots' + (has('--stress') ? '-stress' : ''));
  if (has('--shots')) fs.mkdirSync(shotsDir, { recursive: true });

  // Routes needing an auth session (cookie for proxy.ts + localStorage for the client)
  const needsAuth = (r) => r.startsWith('/dashboard') || r.startsWith('/portal') || r.startsWith('/setup');

  for (const width of WIDTHS) {
    for (const authed of [false, true]) {
      const routesForCtx = ROUTES.filter((r) => needsAuth(r) === authed);
      if (routesForCtx.length === 0) continue;

    const ctx = await browser.newContext({
      viewport: { width, height: heightFor(width) },
      deviceScaleFactor: 1,
      hasTouch: width <= 820,
    });
    if (authed) {
      await ctx.addInitScript(([a, m]) => {
        localStorage.setItem('owoore_admin_token', a);
        localStorage.setItem('owoore_member_token', m);
        localStorage.setItem('owoore_member_refresh_token', 'refresh-abc');
      }, [adminToken, memberToken]);
      // proxy.ts (Next middleware) gates /dashboard + /portal on cookies
      await ctx.addCookies([
        { name: 'owoore_admin_token', value: adminToken, domain: 'localhost', path: '/' },
        { name: 'owoore_member_token', value: memberToken, domain: 'localhost', path: '/' },
      ]);
    }

    const page = await ctx.newPage();
    const consoleErrors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    page.on('pageerror', (err) => consoleErrors.push('PAGEERROR: ' + err.message));

    for (const route of routesForCtx) {
      const entry = { route, width, problems: [] };
      try {
        await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(700); // let SWR + charts settle
      } catch (e) {
        entry.problems.push({ kind: 'nav-error', detail: e.message.slice(0, 200) });
        report.push(entry); continue;
      }

      const result = await page.evaluate(() => {
        const doc = document.documentElement;
        const vw = doc.clientWidth;
        const problems = [];

        const cssPath = (el) => {
          const parts = [];
          let n = el;
          while (n && n !== document.body && parts.length < 4) {
            let s = n.tagName.toLowerCase();
            if (n.id) s += '#' + n.id;
            else if (n.classList.length) s += '.' + [...n.classList].slice(0, 3).join('.');
            parts.unshift(s); n = n.parentElement;
          }
          return parts.join(' > ');
        };
        const visible = (el) => {
          const st = getComputedStyle(el);
          if (st.display === 'none' || st.visibility === 'hidden' || +st.opacity === 0) return false;
          const r = el.getBoundingClientRect();
          return r.width > 1 && r.height > 1;
        };

        // 1. document-level horizontal overflow
        const hasHScroll = doc.scrollWidth > vw + 1;
        if (hasHScroll) {
          // find offenders: visible elements poking past the viewport,
          // excluding those inside an overflow-x:auto/scroll ancestor
          const inScrollContainer = (el) => {
            let n = el.parentElement;
            while (n && n !== document.body) {
              const ox = getComputedStyle(n).overflowX;
              if (ox === 'auto' || ox === 'scroll' || ox === 'hidden') return true;
              n = n.parentElement;
            }
            return false;
          };
          const offenders = [];
          for (const el of document.body.querySelectorAll('*')) {
            if (!visible(el)) continue;
            const r = el.getBoundingClientRect();
            if ((r.right > vw + 2 || r.left < -2) && !inScrollContainer(el)) {
              offenders.push({ path: cssPath(el), left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width) });
              if (offenders.length >= 8) break;
            }
          }
          problems.push({ kind: 'h-overflow', detail: `scrollWidth ${doc.scrollWidth} > viewport ${vw}`, offenders });
        }

        // 2. fixed/sticky elements wider than viewport
        // 3. tiny tap targets (mobile only — checked by caller via width)
        const tiny = [];
        for (const el of document.querySelectorAll('a,button,[role="button"],input[type="checkbox"],input[type="radio"],select')) {
          if (!visible(el)) continue;
          const r = el.getBoundingClientRect();
          if ((r.width < 40 || r.height < 32) && el.closest('nav, header, [role="dialog"], main, aside, form, table')) {
            const label = (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 40);
            tiny.push({ path: cssPath(el), label, w: Math.round(r.width), h: Math.round(r.height) });
            if (tiny.length >= 10) break;
          }
        }

        // 4. text clipped by overflow hidden without title/expander — skip (manual)

        return { problems, tiny, title: document.title, url: location.pathname };
      });

      entry.problems.push(...result.problems);
      if (width <= 480 && result.tiny.length) entry.tinyTapTargets = result.tiny;
      if (result.url !== route && !route.includes('[')) entry.redirectedTo = result.url;
      if (consoleErrors.length) { entry.consoleErrors = consoleErrors.splice(0).slice(0, 5); }

      if (has('--shots')) {
        const safe = route.replace(/[\/\[\]]+/g, '_').replace(/^_|_$/g, '') || 'home';
        const dir = path.join(shotsDir, safe);
        fs.mkdirSync(dir, { recursive: true });
        try { await page.screenshot({ path: path.join(dir, `${width}.png`), fullPage: true }); } catch {}
      }
      report.push(entry);
    }
    await ctx.close();
    }
    console.log(`width ${width} done`);
  }

  await browser.close();
  const out = path.join(__dirname, `audit-report${has('--stress') ? '-stress' : ''}.json`);
  fs.writeFileSync(out, JSON.stringify(report, null, 1));

  // summary to stdout
  const bad = report.filter((r) => r.problems.length || r.tinyTapTargets);
  console.log(`\n=== ${bad.length} route×width combos with findings (of ${report.length}) ===`);
  for (const b of bad) {
    const kinds = [...new Set(b.problems.map((p) => p.kind))].join(',');
    console.log(`${b.route} @${b.width}: ${kinds}${b.tinyTapTargets ? ' tiny-targets' : ''}`);
  }
})();
