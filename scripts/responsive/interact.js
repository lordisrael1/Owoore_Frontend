/**
 * interact.js — behavioural responsive checks that a static sweep can't catch.
 *  1. Mobile sidebar: hamburger opens nav, link navigates, sidebar closes
 *  2. Modal on a short viewport: panel fits, body scrolls, footer reachable
 *  3. Topbar period dropdown stays inside viewport on mobile
 *  4. Filter Select dropdown usable at 320px
 *  5. Modal focus trap + Escape close (keyboard)
 */
const { chromium } = require('playwright');
const http = require('http');

function getJSON(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = http.request(url, { method }, (res) => {
      let b = ''; res.on('data', (c) => (b += c)); res.on('end', () => resolve(JSON.parse(b)));
    });
    req.on('error', reject); req.end();
  });
}

const results = [];
const pass = (name, ok, detail = '') => { results.push({ name, ok, detail }); console.log((ok ? 'PASS' : 'FAIL') + ' — ' + name + (detail ? ' :: ' + detail : '')); };

(async () => {
  await getJSON('http://localhost:4000/api/v1/__mock/stress/off');
  const adminLogin = await getJSON('http://localhost:4000/api/v1/auth/admin/login', 'POST');
  const adminToken = adminLogin.data.token;

  const browser = await chromium.launch();

  const makeCtx = async (viewport) => {
    const ctx = await browser.newContext({ viewport, hasTouch: true });
    await ctx.addInitScript((a) => localStorage.setItem('owoore_admin_token', a), adminToken);
    await ctx.addCookies([{ name: 'owoore_admin_token', value: adminToken, domain: 'localhost', path: '/' }]);
    return ctx;
  };

  // ── 1. Mobile sidebar flow @375 ────────────────────────────────────────────
  {
    const ctx = await makeCtx({ width: 375, height: 667 });
    const page = await ctx.newPage();
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });

    const burger = page.getByRole('button', { name: 'Open navigation menu' });
    pass('hamburger visible at 375', await burger.isVisible());

    await burger.click();
    await page.waitForTimeout(350); // slide-in transition
    const membersLink = page.getByRole('link', { name: 'Members', exact: true });
    const box = await membersLink.boundingBox();
    pass('sidebar nav on-screen after toggle', !!box && box.x >= 0 && box.x < 375, JSON.stringify(box));

    await membersLink.click();
    await page.waitForURL('**/dashboard/members', { timeout: 15000 });
    await page.waitForTimeout(400);
    // Sidebar should be closed again: the aside's wrapper is translated off-canvas
    const sidebarVisibleX = await page.evaluate(() => {
      const aside = document.querySelector('aside');
      return aside ? aside.getBoundingClientRect().right : null;
    });
    pass('sidebar auto-closes after navigation', sidebarVisibleX !== null && sidebarVisibleX <= 0, 'aside right=' + sidebarVisibleX);

    // Backdrop closes it too
    await page.getByRole('button', { name: 'Open navigation menu' }).click();
    await page.waitForTimeout(350);
    await page.mouse.click(340, 400); // backdrop area right of the 224px sidebar
    await page.waitForTimeout(350);
    const closedAgain = await page.evaluate(() => document.querySelector('aside').getBoundingClientRect().right <= 0);
    pass('backdrop tap closes sidebar', closedAgain);
    await ctx.close();
  }

  // ── 2. Modal on short viewport @320×480 ────────────────────────────────────
  {
    const ctx = await makeCtx({ width: 320, height: 480 });
    const page = await ctx.newPage();
    await page.goto('http://localhost:3000/dashboard/signatories', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Add signatory' }).click();
    await page.waitForTimeout(300);
    const dialog = page.locator('[role="dialog"] > div').nth(1); // panel
    const dbox = await dialog.boundingBox();
    pass('modal panel fits short viewport', !!dbox && dbox.height <= 480 && dbox.y >= 0, JSON.stringify(dbox));

    // The submit button (in body or footer) must be reachable by scrolling INSIDE the panel
    const addBtn = page.getByRole('dialog').getByRole('button', { name: /Add signatory|Save|Add/ }).last();
    await addBtn.scrollIntoViewIfNeeded();
    const abox = await addBtn.boundingBox();
    pass('modal primary action reachable', !!abox && abox.y + abox.height <= 480 + 1, JSON.stringify(abox));

    // Escape closes
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    pass('Escape closes modal', (await page.locator('[role="dialog"]').count()) === 0);
    await ctx.close();
  }

  // ── 3. Period dropdown inside viewport @320 ────────────────────────────────
  {
    const ctx = await makeCtx({ width: 320, height: 667 });
    const page = await ctx.newPage();
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /July 2026|20\d\d/ }).first().click();
    await page.waitForTimeout(200);
    const listbox = page.getByRole('listbox', { name: 'Select period' });
    const lb = await listbox.boundingBox();
    pass('period dropdown inside viewport', !!lb && lb.x >= 0 && lb.x + lb.width <= 320 + 1, JSON.stringify(lb));
    await ctx.close();
  }

  // ── 4. Fund filter Select @320 on transactions ─────────────────────────────
  {
    const ctx = await makeCtx({ width: 320, height: 667 });
    const page = await ctx.newPage();
    await page.goto('http://localhost:3000/dashboard/transactions', { waitUntil: 'networkidle' });
    const triggers = page.locator('button[aria-haspopup="listbox"]');
    await triggers.nth(1).click();
    await page.waitForTimeout(200);
    const opt = page.getByRole('option').nth(2);
    const ob = await opt.boundingBox();
    pass('fund filter dropdown usable at 320', !!ob && ob.x >= 0 && ob.x + ob.width <= 321, JSON.stringify(ob));
    await opt.click();
    await page.waitForTimeout(400);
    const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    pass('no page overflow after selecting long fund name', !hasOverflow);
    await ctx.close();
  }

  // ── 5. Modal focus trap (keyboard) ─────────────────────────────────────────
  {
    const ctx = await makeCtx({ width: 1280, height: 800 });
    const page = await ctx.newPage();
    await page.goto('http://localhost:3000/dashboard/signatories', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Add signatory' }).click();
    await page.waitForTimeout(300);
    // Tab 30 times — focus must remain inside the dialog
    let inside = true;
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab');
      const ok = await page.evaluate(() => {
        const d = document.querySelector('[role="dialog"]');
        return d ? d.contains(document.activeElement) : false;
      });
      if (!ok) { inside = false; break; }
    }
    pass('focus stays trapped in modal over 30 Tabs', inside);
    await ctx.close();
  }

  await browser.close();
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})();
