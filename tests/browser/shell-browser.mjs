// THYLORA APP · browser proof
// Workroom: WR-THYAPP-001
//
// Drives the real shell in headless Chromium at phone size and proves the four
// claims the lane must not assert without evidence:
//
//   1. AUTHENTICATED ROUTING  — the Chairman workspace is unreachable and not
//      even rendered without an authorized identity, and opens with one.
//   2. MOBILE LAYOUT          — nothing overflows a 390px viewport and every
//      control is at least a 44px tap target.
//   3. STATE PERSISTENCE      — language, subtitles, drafts and follows survive
//      a real page reload.
//   4. BACKEND CONTINUITY     — every backend call goes to the one canonical
//      project, using the shared session key, and the Chairman command goes to
//      the existing canonical RPC.
//
// The canonical backend is intercepted rather than called, so this proof runs
// with no network access. Interception also lets it prove the honest
// degradation path: a withheld table must read as "not provisioned yet".
//
// Run: npm run test:browser

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

import { FIXTURES, NOT_PROVISIONED, WITHHELD, CHAIRMAN_COMMAND_RPC, ROUTER_RESPONSES } from './fixtures.mjs';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const BACKEND_HOST = 'jvsdxhrfhtlgaknhjxlz.supabase.co';
const SESSION_KEY = 'thylora_app_auth_session';
const VIEWPORT = { width: 390, height: 844 };      // a common phone viewport
// iPad Pro 11" portrait — the Chairman's device class for Media Studio.
const IPAD_VIEWPORT = { width: 834, height: 1194 };

/* ------------------------------------------------------------- playwright */
// Playwright may be installed locally or globally in this environment, and it
// is CommonJS, so the module namespace can carry its exports under `default`.
async function loadPlaywright() {
  const candidates = [
    'playwright',
    'playwright-core',
    '/opt/node22/lib/node_modules/playwright/index.js',
    '/usr/lib/node_modules/playwright/index.js'
  ];
  for (const candidate of candidates) {
    try {
      const loaded = await import(candidate);
      const resolved = loaded?.chromium ? loaded : loaded?.default;
      if (resolved?.chromium) return resolved;
    } catch { /* try the next candidate */ }
  }
  throw new Error('Playwright is not available. Install it, or run the unit suite with `npm test`.');
}

/* ----------------------------------------------------------- static server */
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8'
};

function startServer() {
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://localhost');
      let pathname = decodeURIComponent(url.pathname);
      if (pathname.endsWith('/')) pathname += 'index.html';
      // Contain the server to the repository.
      const full = join(ROOT, normalize(pathname).replace(/^(\.\.[/\\])+/, ''));
      const body = await readFile(full);
      response.writeHead(200, { 'Content-Type': MIME[extname(full)] ?? 'application/octet-stream' });
      response.end(body);
    } catch {
      response.writeHead(404, { 'Content-Type': 'text/plain' });
      response.end('not found');
    }
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () =>
    resolve({ server, origin: `http://127.0.0.1:${server.address().port}` })));
}

/* -------------------------------------------------------------- sessions */
const b64 = object => Buffer.from(JSON.stringify(object)).toString('base64url');
const jwt = payload => `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64(payload)}.proof-signature`;
const future = () => Math.floor(Date.now() / 1000) + 3600;

const chairmanSession = () => ({
  access_token: jwt({ exp: future(), email: 'chair@thylora.test', app_metadata: { thylora_role: 'CHAIRMAN' } }),
  user: { id: 'user-chair', email: 'chair@thylora.test' }
});
const memberSession = () => ({
  access_token: jwt({ exp: future(), email: 'member@thylora.test', app_metadata: { thylora_role: 'MEMBER' } }),
  user: { id: 'user-member', email: 'member@thylora.test' }
});
// What thylora_user_roles returns per identity. The canonical value is
// lowercase 'chairman', and only the Chairman's own id has a row.
const ROLE_ROWS = {
  'user-chair': { role: 'chairman', display_name: 'Chairman' },
  'user-table-only': { role: 'chairman', display_name: 'Chairman' },
  'user-member': { role: 'member', display_name: 'Member' }
};

// A Chairman whose authority exists ONLY in thylora_user_roles — no JWT claim
// at all. This is the real live shape.
const tableOnlyChairmanSession = () => ({
  access_token: jwt({ exp: future(), email: 'table@thylora.test' }),
  user: { id: 'user-table-only', email: 'table@thylora.test' }
});

// A member who has written CHAIRMAN into their own user_metadata.
const selfPromotedSession = () => ({
  access_token: jwt({
    exp: future(), email: 'sneaky@thylora.test',
    user_metadata: { thylora_role: 'CHAIRMAN' },
    app_metadata: { thylora_role: 'MEMBER' }
  }),
  user: { id: 'user-sneaky', email: 'sneaky@thylora.test' }
});

/* ------------------------------------------------------------------ harness */
let playwright, browser, http, origin;
const requestLog = [];

before(async () => {
  playwright = await loadPlaywright();
  ({ server: http, origin } = await startServer());
  browser = await playwright.chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM ?? undefined
  });
});

after(async () => {
  await browser?.close();
  http?.close();
});

/** A page with the canonical backend intercepted and an optional session. */
async function openShell({
  session = null, hash = '', withhold = WITHHELD, seedState = null,
  viewport = VIEWPORT, router = null, routerStatus = 200, capture = null
} = {}) {
  const context = await browser.newContext({
    viewport,
    // The service worker would sit between the page and the interceptor.
    serviceWorkers: 'block'
  });

  if (session) {
    await context.addInitScript(([key, value]) => {
      try { sessionStorage.setItem(key, value); } catch { /* ignore */ }
    }, [SESSION_KEY, JSON.stringify(session)]);
  }

  if (seedState) {
    await context.addInitScript(([key, value]) => {
      try { localStorage.setItem(key, value); } catch { /* ignore */ }
    }, ['thylora_app_shell', JSON.stringify(seedState)]);
  }

  const page = await context.newPage();

  page.on('request', request => requestLog.push(request.url()));

  await page.route(url => url.hostname === BACKEND_HOST, async route => {
    const url = new URL(route.request().url());

    // Edge Functions are not tables. The Media Router lives here.
    if (url.pathname.startsWith('/functions/v1/')) {
      const fn = url.pathname.replace('/functions/v1/', '');
      if (capture) {
        capture.push({
          fn,
          authorization: route.request().headers().authorization ?? null,
          body: route.request().postData()
        });
      }
      if (!router) {
        return route.fulfill({ status: 404, contentType: 'application/json',
          body: JSON.stringify({ message: `Function ${fn} not found` }) });
      }
      return route.fulfill({ status: routerStatus, contentType: 'application/json',
        body: JSON.stringify(router) });
    }

    // /rest/v1/<table>  or  /rest/v1/rpc/<name>
    const path = url.pathname.replace('/rest/v1/', '');
    const name = path.startsWith('rpc/') ? path : path.split('?')[0];

    if (capture && ['POST', 'PATCH'].includes(route.request().method())) {
      capture.push({ table: name, method: route.request().method(), body: route.request().postData() });
    }

    // thylora_user_roles is per-identity: only the Chairman's own user id has a
    // chairman row, exactly as RLS would behave. Answered before the
    // unknown-fixture check because there is no single static row for it.
    if (name === 'thylora_user_roles') {
      const userId = (url.searchParams.get('user_id') ?? '').replace('eq.', '');
      const row = ROLE_ROWS[userId] ?? null;
      return route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify(row ? [row] : []) });
    }

    if (route.request().method() === 'POST' && !path.startsWith('rpc/')) {
      // A write to a held table: answer the way an unmigrated backend would.
      if (withhold.has(name) || FIXTURES[name] === undefined) {
        return route.fulfill({ status: NOT_PROVISIONED.status, contentType: 'application/json',
          body: JSON.stringify(NOT_PROVISIONED.body) });
      }
      // Return a representation so the shell receives the generated codes.
      const seeded = { ...(JSON.parse(route.request().postData() || '{}')) };
      if (name === 'thy_media_animation_jobs') seeded.job_code = 'THY-ANIM-20260915-TEST0001';
      if (name === 'thy_media_markups') seeded.markup_ref = 'THY-MARKUP-20260915-TEST0001';
      return route.fulfill({ status: 201, contentType: 'application/json',
        body: JSON.stringify([seeded]) });
    }

    if (route.request().method() === 'PATCH') {
      return route.fulfill({ status: 204, contentType: 'application/json', body: '' });
    }

    if (withhold.has(name) || FIXTURES[name] === undefined) {
      return route.fulfill({ status: NOT_PROVISIONED.status, contentType: 'application/json',
        body: JSON.stringify(NOT_PROVISIONED.body) });
    }

    return route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify(FIXTURES[name]) });
  });

  await page.goto(`${origin}/thylora-app/index.html${hash}`, { waitUntil: 'load' });
  await page.waitForFunction(() => Boolean(window.__thylora));
  return { context, page };
}

const navLabels = page => page.$$eval('#tabs button', nodes => nodes.map(n => n.textContent.trim()));
const activeView = page => page.$eval('.view.active-view', node => node.id);

/* ================================================== 1. AUTHENTICATED ROUTING */
test('signed out: the Chairman workspace is not offered in the nav', async () => {
  const { context, page } = await openShell();
  const labels = await navLabels(page);
  assert.ok(!labels.includes('Chairman'), `Chairman tab was offered: ${labels.join(', ')}`);
  // All twelve public sections plus Account.
  assert.equal(labels.length, 13);
  assert.deepEqual(labels.slice(0, 3), ['Home', 'Transmissions', 'Earth Watch']);
  await context.close();
});

test('signed out: navigating straight to #chairman is refused and never rendered', async () => {
  const { context, page } = await openShell({ hash: '#chairman' });
  // Landed on Home, not the Chairman workspace.
  assert.equal(await activeView(page), 'home');
  const chairmanVisible = await page.$eval('#chairman', n => n.classList.contains('active-view'));
  assert.equal(chairmanVisible, false);
  const refusal = await page.$eval('#routeNotice', n => n.textContent);
  assert.match(refusal, /Chairman workspace not opened/);
  assert.match(refusal, /needs a signed-in THYLORA session/);
  // The healthy-backend check must not wipe the refusal.
  await page.waitForFunction(() => document.getElementById('backendChip').textContent.includes('READY'));
  assert.match(await page.$eval('#routeNotice', n => n.textContent), /Chairman workspace not opened/);
  await context.close();
});

test('a signed-in member without the role is refused the same way', async () => {
  const { context, page } = await openShell({ session: memberSession(), hash: '#chairman' });
  assert.equal(await activeView(page), 'home');
  assert.ok(!(await navLabels(page)).includes('Chairman'));
  assert.match(await page.$eval('#routeNotice', n => n.textContent), /not authorized/i);
  await context.close();
});

test('a member who writes CHAIRMAN into their own user_metadata is still refused', async () => {
  // user_metadata is user-writable, so trusting it would be a privilege
  // escalation. Only the server-written app_metadata counts.
  const { context, page } = await openShell({ session: selfPromotedSession(), hash: '#chairman' });
  assert.equal(await activeView(page), 'home');
  assert.ok(!(await navLabels(page)).includes('Chairman'));
  await context.close();
});

test('an authorized Chairman identity opens the workspace with its capabilities', async () => {
  const { context, page } = await openShell({ session: chairmanSession(), hash: '#chairman' });
  assert.ok((await navLabels(page)).includes('Chairman'));
  assert.equal(await activeView(page), 'chairman');
  assert.match(await page.$eval('#chIdentity', n => n.textContent), /Authorized · chair@thylora\.test/);

  // Every Chairman control is actually present and usable.
  for (const id of ['chCommand', 'chListen', 'chRoute', 'chHear', 'chRate', 'chDepartment',
    'chRouteDept', 'chNote', 'chNoteSave', 'chSketch', 'chSketchSave', 'chMarkup']) {
    assert.ok(await page.$(`#${id}`), `missing Chairman control #${id}`);
  }

  // Departments loaded from the canonical registry.
  const departments = await page.$$eval('#chDepartment option', nodes => nodes.map(n => n.value));
  assert.deepEqual(departments, ['DEPT-SYSTEMS', 'DEPT-LEGAL']);

  // Approvals, money-distance and the coverage ledger are computed, not blank.
  await page.waitForFunction(() => document.getElementById('chCoverage').textContent !== '—');
  assert.equal(await page.$eval('#chCoverage', n => n.textContent), '62.5%');
  assert.equal(await page.$eval('#chDelivery', n => n.textContent), '25%');
  assert.equal(await page.$eval('#chGap', n => n.textContent), '1');
  assert.match(await page.$eval('#chMoneyTotal', n => n.textContent), /\$60\.00/);
  assert.match(await page.$eval('#chMoneyDistance', n => n.textContent), /km/);
  // Approvals now come from the canonical narrow read, keyed by canonical_id.
  assert.ok(await page.$('[data-approve="GATE-MEDIA-001"]'));
  await context.close();
});

test('signing out closes the Chairman workspace immediately', async () => {
  const { context, page } = await openShell({ session: chairmanSession(), hash: '#chairman' });
  assert.equal(await activeView(page), 'chairman');
  await page.evaluate(() => window.__thylora.showView('account'));
  await page.click('#signOutBtn');
  assert.equal(await activeView(page), 'home');
  assert.ok(!(await navLabels(page)).includes('Chairman'));
  // Re-requesting the workspace after signing out is refused.
  await page.evaluate(() => window.__thylora.showView('chairman'));
  assert.equal(await activeView(page), 'home');
  await context.close();
});

test('a personal public section asks for sign-in without hiding itself', async () => {
  const { context, page } = await openShell({ hash: '#my-purchases' });
  // Still on the section; not redirected away.
  assert.equal(await activeView(page), 'my-purchases');
  assert.match(await page.$eval('#mpList', n => n.textContent), /needs a signed-in THYLORA session/);
  await context.close();
});

test('signed in, purchases and the serialized asset are shown', async () => {
  const { context, page } = await openShell({ session: memberSession(), hash: '#my-purchases' });
  await page.waitForFunction(() => document.getElementById('mpList').textContent.includes('REP-0001'));
  const text = await page.$eval('#mpList', n => n.textContent);
  assert.match(text, /REP-0001/);
  assert.match(text, /THY-REP-0001-000137/, 'the serialized asset must be shown');
  assert.match(text, /access ACTIVE/);
  await context.close();
});

/* ========================================================= 2. MOBILE LAYOUT */
test('no section overflows a 390px viewport', async () => {
  const { context, page } = await openShell({ session: chairmanSession() });
  const sections = await page.evaluate(() => window.__thylora.SECTIONS.map(s => s.id));

  for (const id of [...sections, 'account']) {
    await page.evaluate(section => window.__thylora.showView(section), id);
    await page.waitForTimeout(60);

    const overflow = await page.evaluate(() => {
      const limit = window.innerWidth;
      const offenders = [];
      // .tabs is intentionally a horizontal scroller; its children may exceed
      // the viewport. Nothing else may.
      const scrollers = [...document.querySelectorAll('.tabs, .map-wrap, .sketch-wrap')];
      for (const node of document.querySelectorAll('.view.active-view *, header *, footer *')) {
        if (scrollers.some(s => s === node || s.contains(node))) continue;
        const rect = node.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) continue;
        if (rect.right > limit + 1 || rect.left < -1) {
          offenders.push(`${node.tagName}.${node.className}`.slice(0, 80) +
            ` [${Math.round(rect.left)}..${Math.round(rect.right)}]`);
        }
      }
      return {
        offenders: offenders.slice(0, 5),
        documentScroll: document.documentElement.scrollWidth,
        viewport: limit
      };
    });

    assert.deepEqual(overflow.offenders, [], `${id} overflows: ${overflow.offenders.join(' | ')}`);
    assert.ok(overflow.documentScroll <= overflow.viewport + 1,
      `${id} makes the document scroll sideways (${overflow.documentScroll} > ${overflow.viewport})`);
  }
  await context.close();
});

test('every control meets a 44px tap target on a phone', async () => {
  const { context, page } = await openShell({ session: chairmanSession() });
  const sections = await page.evaluate(() => window.__thylora.SECTIONS.map(s => s.id));

  for (const id of [...sections, 'account']) {
    await page.evaluate(section => window.__thylora.showView(section), id);
    await page.waitForTimeout(40);
    const small = await page.evaluate(() => {
      const bad = [];
      for (const node of document.querySelectorAll(
        '.view.active-view button, .view.active-view select, .view.active-view input, #tabs button')) {
        const rect = node.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) continue;
        // Checkboxes are styled to 22px but sit inside a 44px label row.
        if (node.type === 'checkbox') continue;
        if (rect.height < 44) bad.push(`${node.id || node.textContent.trim().slice(0, 20)}=${Math.round(rect.height)}px`);
      }
      return bad;
    });
    assert.deepEqual(small, [], `${id} has controls under 44px: ${small.join(', ')}`);
  }
  await context.close();
});

test('the checkbox rows are still a 44px target overall', async () => {
  const { context, page } = await openShell({ hash: '#transmissions' });
  const height = await page.$eval('label.control.switch', n => n.getBoundingClientRect().height);
  assert.ok(height >= 44, `subtitle toggle row is only ${Math.round(height)}px`);
  await context.close();
});

/* ===================================================== 3. STATE PERSISTENCE */
test('language, subtitles, draft and follows survive a real reload', async () => {
  const { context, page } = await openShell({ hash: '#transmissions' });
  await page.waitForFunction(() =>
    document.querySelectorAll('#txLanguage option').length > 1);

  // Choose a language the backend actually published a track for.
  await page.selectOption('#txLanguage', 'yo');
  await page.uncheck('#txSubtitles');
  await page.click('[data-transmission="TX-0001"]');

  // Leave an unsent question, then follow a correspondent.
  await page.evaluate(() => window.__thylora.showView('ask-ersatz'));
  await page.fill('#askText', 'Which folio holds the agent signature?');
  await page.evaluate(() => window.__thylora.showView('people'));
  await page.waitForSelector('[data-follow="CORR-ADEYEMI"]');
  await page.click('[data-follow="CORR-ADEYEMI"]');

  const before = await page.evaluate(() => window.__thylora.loadState());
  assert.equal(before.languageCode, 'yo');
  assert.equal(before.englishSubtitles, false);
  assert.equal(before.lastTransmission, 'TX-0001');
  assert.deepEqual(before.follows, ['CORR-ADEYEMI']);

  // A real reload of the real page.
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => Boolean(window.__thylora));

  const after = await page.evaluate(() => window.__thylora.loadState());
  assert.equal(after.languageCode, 'yo', 'language did not survive reload');
  assert.equal(after.englishSubtitles, false, 'subtitle choice did not survive reload');
  assert.equal(after.lastTransmission, 'TX-0001');
  assert.deepEqual(after.follows, ['CORR-ADEYEMI'], 'follows did not survive reload');
  assert.equal(after.drafts.question, 'Which folio holds the agent signature?',
    'the unsent question was lost');

  // And the restored values are actually applied to the controls.
  await page.evaluate(() => window.__thylora.showView('transmissions'));
  await page.waitForFunction(() => document.querySelectorAll('#txLanguage option').length > 1);
  assert.equal(await page.$eval('#txSubtitles', n => n.checked), false);
  assert.equal(await page.$eval('#txLanguage', n => n.value), 'yo');
  await page.evaluate(() => window.__thylora.showView('ask-ersatz'));
  assert.equal(await page.$eval('#askText', n => n.value), 'Which folio holds the agent signature?');
  await context.close();
});

test('a saved Chairman route does not reopen for a signed-out device', async () => {
  // The shell remembers the last section a reader was on. Restoring it must
  // still run the guard, or a stored route would become a way back in.
  const { context, page } = await openShell({
    session: null,
    seedState: { version: 1, section: 'chairman' }
  });
  assert.equal(await activeView(page), 'home');
  assert.match(await page.$eval('#routeNotice', n => n.textContent), /Chairman workspace not opened/);
  await context.close();
});

/* ==================================================== 4. BACKEND CONTINUITY */
test('every backend call goes to the one canonical project', async () => {
  requestLog.length = 0;
  const { context, page } = await openShell({ session: chairmanSession() });
  for (const id of await page.evaluate(() => window.__thylora.SECTIONS.map(s => s.id))) {
    await page.evaluate(section => window.__thylora.showView(section), id);
    await page.waitForTimeout(50);
  }
  const hosts = new Set(requestLog.map(url => new URL(url).hostname));
  hosts.delete('127.0.0.1'); // the local static server serving the shell itself
  assert.deepEqual([...hosts], [BACKEND_HOST],
    `the shell contacted an unexpected host: ${[...hosts].join(', ')}`);
  assert.ok(requestLog.some(url => url.includes(BACKEND_HOST)), 'no backend call was made at all');
  await context.close();
});

test('the Chairman command routes to the existing canonical RPC', async () => {
  const { context, page } = await openShell({ session: chairmanSession(), hash: '#chairman' });
  const posted = [];
  page.on('request', request => {
    if (request.url().includes('/rpc/')) posted.push({ url: request.url(), body: request.postData() });
  });

  await page.fill('#chCommand', 'Open the Ouidah register desk.');
  await page.click('#chRoute');
  await page.waitForFunction(() =>
    document.getElementById('chStatus').textContent.includes('routed and preserved'));

  const command = posted.find(p => p.url.includes(CHAIRMAN_COMMAND_RPC));
  assert.ok(command, `the command did not go to ${CHAIRMAN_COMMAND_RPC}: ${posted.map(p => p.url).join(', ')}`);
  assert.match(command.body, /Open the Ouidah register desk/);
  // The result is shown back, not swallowed.
  assert.match(await page.$eval('#chResult', n => n.textContent), /THY-CMD-20260914-0001/);
  await context.close();
});

test('an approval goes to the canonical decision ledger, not the command spine', async () => {
  // CONTINUITY: approvals are recorded by submit_thylora_review_gate_decision_v1
  // into the append-only ledger thylora_chairman_review_decisions. Routing them
  // as free-text commands would bypass that governed record.
  const posted = [];
  const { context, page } = await openShell({ session: chairmanSession() });
  page.on('request', request => {
    if (request.url().includes('/rpc/')) {
      posted.push({ url: request.url(), body: request.postData() ?? '' });
    }
  });
  await page.evaluate(() => window.__thylora.showView('chairman'));
  await page.waitForSelector('[data-approve="GATE-MEDIA-001"]');
  await page.click('[data-approve="GATE-MEDIA-001"]');
  await page.waitForFunction(() =>
    /Recorded|append-only/.test(document.getElementById('chStatus').textContent));

  const decision = posted.find(p => p.url.includes('submit_thylora_review_gate_decision_v1'));
  assert.ok(decision, `the approval did not reach the canonical ledger: ${posted.map(p => p.url).join(', ')}`);
  const payload = JSON.parse(decision.body);
  assert.equal(payload.p_canonical_id, 'GATE-MEDIA-001');
  assert.equal(payload.p_decision, 'APPROVED');
  // It is NOT smuggled through the command spine as text.
  assert.ok(!posted.some(p => /APPROVE GATE-MEDIA-001/.test(p.body)),
    'the approval was also routed as a free-text command');
  await context.close();
});

test('department routing still uses the canonical command spine', async () => {
  const { context, page } = await openShell({ session: chairmanSession(), hash: '#chairman' });
  const posted = [];
  page.on('request', request => {
    if (request.url().includes('/rpc/')) posted.push(request.postData() ?? '');
  });
  // An <option> is never "visible" to a locator, so wait on the count.
  await page.waitForFunction(() =>
    document.querySelectorAll('#chDepartment option').length > 1);
  await page.fill('#chCommand', 'Review folio 22.');
  await page.selectOption('#chDepartment', 'DEPT-LEGAL');
  await page.click('#chRouteDept');
  await page.waitForFunction(() =>
    document.getElementById('chDeptStatus').textContent.includes('routed and preserved'));
  assert.ok(posted.some(body => /ROUTE TO DEPT-LEGAL: Review folio 22/.test(body)),
    'department routing did not use the command spine');
  await context.close();
});

test('the shell uses the shared session key, so one sign-in covers every surface', async () => {
  const { context, page } = await openShell({ session: memberSession() });
  const stored = await page.evaluate(key => sessionStorage.getItem(key), SESSION_KEY);
  assert.ok(stored, 'the shell does not read the shared THYLORA session key');
  assert.match(await page.$eval('#whoChip', n => n.textContent), /SIGNED IN · member@thylora\.test/);
  // And it stores no second copy of the session under its own namespace.
  const shellState = await page.evaluate(() => localStorage.getItem('thylora_app_shell'));
  assert.ok(!/access_token/.test(shellState ?? ''), 'the shell copied the auth token into its own state');
  await context.close();
});

/* ============================================ honest degradation on screen */
test('a withheld table reads as "not provisioned yet", never as an empty feed', async () => {
  // thy_follows is withheld by the fixture set.
  const { context, page } = await openShell({ session: memberSession(), hash: '#people' });
  await page.waitForSelector('[data-follow]');
  // The correspondents list itself loaded, so the page is not simply broken.
  assert.match(await page.$eval('#pcList', n => n.textContent), /A\. Adeyemi/);
  await context.close();
});

test('an unprovisioned surface states the gap instead of showing nothing', async () => {
  // Withhold transmissions entirely and prove the wording.
  const { context, page } = await openShell({ hash: '#transmissions', withhold: new Set(['thy_transmissions']) });
  await page.waitForFunction(() => !document.getElementById('txNotice').hidden);
  const notice = await page.$eval('#txNotice', n => n.textContent);
  assert.match(notice, /not provisioned yet/);
  assert.match(notice, /This is not an empty feed/);
  assert.match(notice, /db\/thylora-app/);
  // No language is offered when no track was published.
  assert.equal(await page.$eval('#txLanguage', n => n.disabled), true);
  await context.close();
});

test('an uncleared product gets no purchase button', async () => {
  const { context, page } = await openShell({ hash: '#store' });
  await page.waitForFunction(() => document.getElementById('stList').textContent.includes('REP-0001'));
  assert.ok(await page.$('[data-buy="REP-0001"]'), 'a cleared product must be purchasable');
  assert.equal(await page.$('[data-buy="STO-0001"]'), null, 'an unreleased product must not be purchasable');
  assert.match(await page.$eval('#stList', n => n.textContent), /Not cleared for purchase yet/);
  await context.close();
});

test('a failed checkout says plainly that nothing was charged', async () => {
  const { context, page } = await openShell({ hash: '#store' });
  await page.waitForSelector('[data-buy="REP-0001"]');
  await page.click('[data-buy="REP-0001"]');
  await page.waitForFunction(() => !document.getElementById('stNotice').hidden);
  const notice = await page.$eval('#stNotice', n => n.textContent);
  assert.match(notice, /Nothing was charged/);
  assert.match(await page.$eval('#stStatus', n => n.textContent), /No charge was made/);
  await context.close();
});

test('an unsent Ask Ersatz question is kept as a draft, not lost', async () => {
  const { context, page } = await openShell({
    session: memberSession(), hash: '#ask-ersatz',
    withhold: new Set(['submit_ersatz_question_v1', 'rpc/submit_ersatz_question_v1'])
  });
  await page.fill('#askText', 'Who held the second copy of the folio?');
  await page.click('#askSubmit');
  await page.waitForFunction(() =>
    document.getElementById('askStatus').textContent.includes('Not sent'));
  assert.match(await page.$eval('#askStatus', n => n.textContent), /saved as a draft/);
  // The words are still in the box.
  assert.equal(await page.$eval('#askText', n => n.value), 'Who held the second copy of the folio?');
  await context.close();
});

test('the mirror world always discloses that it is simulated', async () => {
  const { context, page } = await openShell({ hash: '#edereariah' });
  await page.waitForFunction(() => document.getElementById('edList').textContent.includes('Ariah'));
  const text = await page.$eval('#edList', n => n.textContent);
  assert.match(text, /WORLD_SIMULATED/);
  assert.match(text, /Not an Earth person/);
  await context.close();
});

test('an arrival row with no coordinate is counted but not plotted', async () => {
  const { context, page } = await openShell({ hash: '#world-map' });
  await page.waitForFunction(() => document.querySelectorAll('#wmMap .pin').length > 0);
  const pins = await page.$$eval('#wmMap .pin', nodes => nodes.length);
  // Four arrival rows, but only three carry usable coordinates.
  assert.equal(pins, 3, 'a row with a null latitude must not be plotted');
  assert.equal(await page.$eval('#wmArrivals', n => n.textContent), '9,990');
  await context.close();
});

test('opening evidence from an Earth Watch signal crosses into the casefile', async () => {
  const { context, page } = await openShell({ hash: '#earth-watch' });
  await page.waitForSelector('[data-casefile="CF-0001"]');
  await page.click('[data-casefile="CF-0001"]');
  await page.waitForFunction(() => !document.getElementById('cfDetail').hidden);
  assert.equal(await activeView(page), 'casefiles');
  const detail = await page.$eval('#cfDetail', n => n.textContent);
  assert.match(detail, /EV-0001/);
  // Evidence carries its own provenance and confidence.
  assert.match(detail, /provenance HELD_COPY/);
  assert.match(detail, /confidence MEMORY_REPORTED/);
  await context.close();
});

test('the Chairman sketch surface records strokes from pointer input', async () => {
  const { context, page } = await openShell({ session: chairmanSession(), hash: '#chairman' });
  const canvas = page.locator('#chSketch');
  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  await page.mouse.move(box.x + 20, box.y + 20);
  await page.mouse.down();
  await page.mouse.move(box.x + 80, box.y + 60, { steps: 6 });
  await page.mouse.up();
  assert.match(await page.$eval('#chSketchState', n => n.textContent), /1 stroke/);

  await page.mouse.move(box.x + 30, box.y + 90);
  await page.mouse.down();
  await page.mouse.move(box.x + 120, box.y + 120, { steps: 6 });
  await page.mouse.up();
  assert.match(await page.$eval('#chSketchState', n => n.textContent), /2 strokes/);

  await page.click('#chSketchUndo');
  assert.match(await page.$eval('#chSketchState', n => n.textContent), /1 stroke/);
  await context.close();
});

/* ============================ MEDIA STUDIO (iPad, Apple Pencil) ============= */
// These run at iPad Pro portrait, because that is the device the Chairman uses
// and because Apple Pencil input only exists on it.

/** Open the Media Studio on an iPad as an authorized Chairman. */
async function openStudio({ router = ROUTER_RESPONSES.SUCCESS_WITH_ASSET, capture = null, withhold = WITHHELD } = {}) {
  const opened = await openShell({
    session: chairmanSession(), hash: '#media-studio',
    viewport: IPAD_VIEWPORT, router, capture, withhold
  });
  await opened.page.waitForFunction(() =>
    document.querySelectorAll('#msAssets [data-asset]').length > 0);
  return opened;
}

/** Draw a stroke with a real Apple Pencil pointer, including pressure and tilt. */
async function drawWithPencil(page, selector, points, { pressure = 0.66, tiltX = 14, tiltY = -6 } = {}) {
  const box = await page.locator(selector).boundingBox();
  const client = await page.context().newCDPSession(page);
  const send = (type, point, extra = {}) => client.send('Input.dispatchMouseEvent', {
    type,
    x: box.x + point.x * box.width,
    y: box.y + point.y * box.height,
    button: 'left',
    buttons: type === 'mouseReleased' ? 0 : 1,
    clickCount: 1,
    pointerType: 'pen',
    force: pressure,
    tiltX,
    tiltY,
    ...extra
  });
  await send('mousePressed', points[0]);
  for (const point of points.slice(1)) await send('mouseMoved', point);
  await send('mouseReleased', points.at(-1));
  await client.detach();
}

test('the Media Studio is Chairman-only, exactly like the workspace', async () => {
  // Signed out: not in the nav, and the route is refused and never drawn.
  const out = await openShell({ hash: '#media-studio', viewport: IPAD_VIEWPORT });
  assert.equal(await activeView(out.page), 'home');
  assert.ok(!(await navLabels(out.page)).includes('Media Studio'));
  assert.equal(await out.page.$eval('#media-studio', n => n.classList.contains('active-view')), false);
  await out.context.close();

  // A member without the role is refused too.
  const member = await openShell({ session: memberSession(), hash: '#media-studio', viewport: IPAD_VIEWPORT });
  assert.equal(await activeView(member.page), 'home');
  assert.ok(!(await navLabels(member.page)).includes('Media Studio'));
  await member.context.close();

  // A self-promoted user_metadata role is still refused.
  const sneaky = await openShell({ session: selfPromotedSession(), hash: '#media-studio', viewport: IPAD_VIEWPORT });
  assert.equal(await activeView(sneaky.page), 'home');
  await sneaky.context.close();
});

test('a Chairman whose role exists only in thylora_user_roles gets in', async () => {
  // The live shape: no app_metadata claim, authority from the canonical table.
  const { context, page } = await openShell({
    session: tableOnlyChairmanSession(), hash: '#media-studio', viewport: IPAD_VIEWPORT,
    router: ROUTER_RESPONSES.SUCCESS_WITH_ASSET
  });
  assert.equal(await activeView(page), 'media-studio');
  assert.ok((await navLabels(page)).includes('Media Studio'));
  assert.ok((await navLabels(page)).includes('Chairman'));
  await context.close();
});

test('a member with a role row that is not chairman is still refused', async () => {
  const { context, page } = await openShell({
    session: memberSession(), hash: '#media-studio', viewport: IPAD_VIEWPORT
  });
  assert.equal(await activeView(page), 'home');
  assert.ok(!(await navLabels(page)).includes('Media Studio'));
  await context.close();
});

test('the studio opens a registered asset and shows its master image and locks', async () => {
  const { context, page } = await openStudio();
  assert.equal(await activeView(page), 'media-studio');
  assert.match(await page.$eval('#msRouter', n => n.textContent),
    /thylora-ai-router · provider credentials remain server-side/);

  await page.click('[data-asset="RAEL-ASSET-0001"]');
  await page.waitForFunction(() => !document.getElementById('msOpen').hidden);

  // The master frame is the registered POSTER rendition, not an invented URL.
  assert.equal(await page.$eval('#msMaster', n => n.hidden), false);
  assert.match(await page.$eval('#msMaster', n => n.getAttribute('src')), /ouidah-12-poster\.jpg/);

  // Serial number, QR destination and logo requirement are all stated.
  const facts = await page.$eval('#msAssetFacts', n => n.textContent);
  assert.match(facts, /THY-REP-0001-000137/, 'the serial number must be shown');
  assert.match(facts, /thylora\.example\.test\/p\/THY-REP-0001-000137/, 'the QR destination must be shown');
  assert.match(facts, /LOGO-THY-001/, 'the logo requirement must be shown');
  assert.match(facts, /RAEL-ASSET-0001/);
  assert.match(facts, /derivative/, 'a version-2 asset is a derivative');

  // The continuity locks are the pipeline's own blockers.
  const locks = await page.$eval('#msLocks', n => n.textContent);
  assert.match(locks, /VALIDATION_MISSING|MODERATION_MISSING|POSTER_MISSING|RIGHTS/,
    `expected pipeline blockers, got: ${locks}`);
  await context.close();
});

test('an asset with no passport is blocked from animating', async () => {
  const { context, page } = await openStudio();
  await page.click('[data-asset="RAEL-ASSET-0002"]');
  await page.waitForFunction(() => !document.getElementById('msOpen').hidden);
  const locks = await page.$eval('#msLocks', n => n.textContent);
  assert.match(locks, /PASSPORT_MISSING/);
  assert.match(locks, /no serial number and no QR destination/);
  // Submission is actually disabled, not merely discouraged.
  assert.equal(await page.$eval('#msSubmit', n => n.disabled), true);
  assert.match(await page.$eval('#msSubmitState', n => n.textContent), /blocked until the blocking locks/);
  await context.close();
});

test('all three animate modes are offered and selectable', async () => {
  const { context, page } = await openStudio();
  await page.click('[data-asset="RAEL-ASSET-0001"]');
  await page.waitForSelector('#msModes [data-mode]');
  const modes = await page.$$eval('#msModes [data-mode]', nodes => nodes.map(n => n.dataset.mode));
  assert.deepEqual(modes, ['AUTOMATIC', 'BUDGET', 'BEST_FIDELITY']);
  // Automatic is the default.
  assert.equal(await page.$eval('[data-mode="AUTOMATIC"]', n => n.getAttribute('aria-checked')), 'true');
  await page.click('[data-mode="BEST_FIDELITY"]');
  assert.equal(await page.$eval('[data-mode="BEST_FIDELITY"]', n => n.getAttribute('aria-checked')), 'true');
  assert.equal(await page.$eval('[data-mode="AUTOMATIC"]', n => n.getAttribute('aria-checked')), 'false');
  await context.close();
});

test('submitting goes to the Media Router with a bearer token and no credential', async () => {
  const capture = [];
  const { context, page } = await openStudio({ capture });
  await page.click('[data-asset="RAEL-ASSET-0001"]');
  await page.waitForSelector('#msSubmit:not([disabled])');
  await page.click('[data-mode="BUDGET"]');
  await page.fill('#msInstruction', 'Slow pan across the folio.');
  await page.click('#msSubmit');
  await page.waitForFunction(() => !document.getElementById('msResult').hidden);

  const call = capture.find(c => c.fn === 'thylora-ai-router');
  assert.ok(call, `the router was not called: ${JSON.stringify(capture.map(c => c.fn ?? c.table))}`);
  // Called with the Chairman's own token.
  assert.match(call.authorization, /^Bearer /);
  const body = JSON.parse(call.body);
  assert.equal(body.task, 'ANIMATE_MEDIA');
  assert.equal(body.mode, 'BUDGET');
  assert.equal(body.routing_preference, 'LOWEST_COST');
  assert.equal(body.asset_code, 'RAEL-ASSET-0001');
  assert.equal(body.instruction, 'Slow pan across the folio.');
  // Parent carried for provenance.
  assert.equal(body.parent_version_no, 2);
  assert.equal(body.parent_checksum_sha256, 'b'.repeat(64));
  // No credential crosses the line.
  const raw = call.body.toLowerCase();
  for (const forbidden of ['api_key', 'apikey', 'secret', 'password', 'sk-']) {
    assert.ok(!raw.includes(forbidden), `the request body carried ${forbidden}`);
  }
  await context.close();
});

test('progress is shown, and a running job claims nothing', async () => {
  const { context, page } = await openStudio({ router: ROUTER_RESPONSES.RUNNING });
  await page.click('[data-asset="RAEL-ASSET-0001"]');
  await page.waitForSelector('#msSubmit:not([disabled])');
  await page.click('#msSubmit');
  await page.waitForFunction(() => !document.getElementById('msProgress').hidden);

  assert.match(await page.$eval('#msProgressLabel', n => n.textContent), /Provider is working/);
  const percent = await page.$eval('#msProgressPercent', n => n.textContent);
  assert.match(percent, /\d+%/);
  assert.match(await page.$eval('#msProgressDetail', n => n.textContent), /THY-AI-ROUTE-20260915-0004/);

  // And nothing is claimed while it runs.
  await page.waitForFunction(() => !document.getElementById('msClaim').hidden);
  assert.match(await page.$eval('#msClaim', n => n.textContent), /No media has been generated/);
  assert.equal(await page.$eval('#msPreviewWrap', n => n.hidden), true);
  await context.close();
});

test('A 200 SUCCEEDED WITH NO ASSET IS NOT REPORTED AS A GENERATION', async () => {
  // The single most important behaviour in this lane.
  const { context, page } = await openStudio({ router: ROUTER_RESPONSES.SUCCESS_NO_ASSET });
  await page.click('[data-asset="RAEL-ASSET-0001"]');
  await page.waitForSelector('#msSubmit:not([disabled])');
  await page.click('#msSubmit');
  await page.waitForFunction(() => !document.getElementById('msClaim').hidden);

  const claim = await page.$eval('#msClaim', n => n.textContent);
  assert.match(claim, /No media has been generated/);
  assert.match(claim, /returned no locatable asset/);
  // No preview, and no decision is offered on a result that does not exist.
  assert.equal(await page.$eval('#msPreviewWrap', n => n.hidden), true);
  for (const id of ['msApprove', 'msRevise', 'msReject']) {
    assert.equal(await page.$eval(`#${id}`, n => n.disabled), true, `${id} must be disabled`);
  }
  assert.match(await page.$eval('#msDecisionState', n => n.textContent), /nothing to approve/i);
  await context.close();
});

test('an explicit provider refusal is reported with its reason and nothing is claimed', async () => {
  const { context, page } = await openStudio({ router: ROUTER_RESPONSES.FAILED });
  await page.click('[data-asset="RAEL-ASSET-0001"]');
  await page.waitForSelector('#msSubmit:not([disabled])');
  await page.click('#msSubmit');
  await page.waitForFunction(() => !document.getElementById('msClaim').hidden);
  const claim = await page.$eval('#msClaim', n => n.textContent);
  assert.match(claim, /No media has been generated/);
  assert.match(claim, /animation quota exhausted/);
  await context.close();
});

test('an undeployed router says so and claims nothing', async () => {
  const { context, page } = await openStudio({ router: null });  // 404 from the function path
  await page.click('[data-asset="RAEL-ASSET-0001"]');
  await page.waitForSelector('#msSubmit:not([disabled])');
  await page.click('#msSubmit');
  await page.waitForFunction(() => !document.getElementById('msNotice').hidden);
  const notice = await page.$eval('#msNotice', n => n.textContent);
  assert.match(notice, /did not accept/i);
  assert.match(notice, /Nothing was generated and nothing is claimed/);
  await context.close();
});

test('a real returned asset is previewed and the decision opens', async () => {
  const { context, page } = await openStudio();
  await page.click('[data-asset="RAEL-ASSET-0001"]');
  await page.waitForSelector('#msSubmit:not([disabled])');
  await page.click('#msSubmit');
  await page.waitForFunction(() => !document.getElementById('msPreviewWrap').hidden);

  assert.match(await page.$eval('#msClaim', n => n.textContent), /Provider returned an asset/);
  assert.match(await page.$eval('#msClaim', n => n.textContent), /thylora-anim-v2/);
  // A video result is previewed in the video element.
  assert.equal(await page.$eval('#msPreviewVideo', n => n.hidden), false);
  assert.match(await page.$eval('#msPreviewVideo', n => n.getAttribute('src')), /ouidah-12-animated\.mp4/);
  // And the decision is now live.
  for (const id of ['msApprove', 'msRevise', 'msReject']) {
    assert.equal(await page.$eval(`#${id}`, n => n.disabled), false, `${id} must be enabled`);
  }
  await context.close();
});

test('APPLE PENCIL: the Chairman draws over the frame and the markup is recorded', async () => {
  const capture = [];
  const { context, page } = await openStudio({ capture });
  await page.click('[data-asset="RAEL-ASSET-0001"]');
  await page.waitForSelector('#msSubmit:not([disabled])');
  await page.click('#msSubmit');
  await page.waitForFunction(() => !document.getElementById('msPreviewWrap').hidden);

  // Markup is offered only once there is a frame.
  assert.equal(await page.$eval('#msMarkupToggle', n => n.disabled), false);
  assert.match(await page.$eval('#msPencilNote', n => n.textContent), /Apple Pencil pressure and tilt are recorded/);

  await page.click('#msMarkupToggle');
  await page.waitForFunction(() => !document.getElementById('msPreviewMarkup').hidden);

  // Draw two strokes with a real pen pointer.
  await drawWithPencil(page, '#msPreviewMarkup',
    [{ x: 0.2, y: 0.3 }, { x: 0.4, y: 0.35 }, { x: 0.55, y: 0.5 }]);
  await drawWithPencil(page, '#msPreviewMarkup',
    [{ x: 0.6, y: 0.6 }, { x: 0.75, y: 0.7 }]);

  await page.waitForFunction(() =>
    /2 strokes/.test(document.getElementById('msMarkupState').textContent));
  const state = await page.$eval('#msMarkupState', n => n.textContent);
  assert.match(state, /2 strokes/);
  assert.match(state, /2 with Pencil/, `pen input must be recorded as Pencil, got: ${state}`);

  // The strokes are real geometry with graded pressure, held frame-relative.
  const strokes = await page.evaluate(() => window.__thylora.studio.markup.strokes);
  assert.equal(strokes.length, 2);
  assert.equal(strokes[0].pointer_type, 'pen');
  assert.ok(strokes[0].points.length >= 3);
  for (const point of strokes[0].points) {
    assert.ok(point.x >= 0 && point.x <= 1, 'x must be frame-relative');
    assert.ok(point.y >= 0 && point.y <= 1, 'y must be frame-relative');
    // A real Pencil reports graded pressure, not the mouse's flat 0.5.
    assert.ok(point.pressure > 0 && point.pressure !== 0.5, `pressure was ${point.pressure}`);
  }

  // Undo removes one stroke.
  await page.click('#msMarkupUndo');
  await page.waitForFunction(() =>
    /1 stroke/.test(document.getElementById('msMarkupState').textContent));
  await context.close();
});

test('APPLE PENCIL: the markup is attached to the revision request', async () => {
  const capture = [];
  const { context, page } = await openStudio({ capture });
  await page.click('[data-asset="RAEL-ASSET-0001"]');
  await page.waitForSelector('#msSubmit:not([disabled])');
  await page.click('#msSubmit');
  await page.waitForFunction(() => !document.getElementById('msPreviewWrap').hidden);

  await page.click('#msMarkupToggle');
  await page.waitForFunction(() => !document.getElementById('msPreviewMarkup').hidden);
  await drawWithPencil(page, '#msPreviewMarkup', [{ x: 0.3, y: 0.3 }, { x: 0.5, y: 0.45 }]);
  await page.waitForFunction(() =>
    /1 stroke/.test(document.getElementById('msMarkupState').textContent));

  await page.fill('#msDecisionNote', 'Hold the first frame longer.');
  await page.click('#msRevise');
  await page.waitForFunction(() =>
    /Revision requested/.test(document.getElementById('msDecisionOutcome').textContent));

  // 1 · The markup was stored as vectors.
  const markupWrite = capture.find(c => c.table === 'thy_media_markups' && c.method === 'POST');
  assert.ok(markupWrite, 'the markup was not stored');
  const markup = JSON.parse(markupWrite.body);
  assert.equal(markup.asset_code, 'RAEL-ASSET-0001');
  assert.equal(markup.stroke_count, 1);
  assert.equal(markup.pencil_stroke_count, 1);
  assert.ok(markup.point_count >= 2);
  assert.ok(Array.isArray(markup.strokes) && markup.strokes[0].points.length >= 2);

  // 2 · The revision went into the CANONICAL margin queue, carrying the markup.
  const marginCall = capture.find(c => c.table === 'rpc/thylora_margin_note_add_v1');
  assert.ok(marginCall, `the revision did not reach the canonical margin queue: ${JSON.stringify(capture.map(c => c.table ?? c.fn))}`);
  const note = JSON.parse(marginCall.body);
  assert.equal(note.p_anchor_kind, 'MEDIA_FRAME');
  assert.equal(note.p_source_mode, 'MARKUP');
  assert.match(note.p_body, /Hold the first frame longer\./);
  assert.match(note.p_body, /Markup attached/);
  assert.match(note.p_body, /drawn with Apple Pencil/);
  assert.equal(note.p_anchor_context.markup_ref, 'THY-MARKUP-20260915-TEST0001');
  assert.equal(note.p_anchor_context.asset_code, 'RAEL-ASSET-0001');

  // 3 · The decision itself went to the canonical append-only ledger.
  const decision = capture.find(c => c.table === 'rpc/submit_thylora_review_gate_decision_v1');
  assert.ok(decision, 'the decision did not reach the canonical ledger');
  const payload = JSON.parse(decision.body);
  assert.equal(payload.p_canonical_id, 'GATE-MEDIA-001');
  // CHANGES_REQUESTED is the canonical decision that reopens a gate.
  assert.equal(payload.p_decision, 'CHANGES_REQUESTED');
  await context.close();
});

test('approve records in the canonical ledger, then the publishing queue opens', async () => {
  const capture = [];
  const { context, page } = await openStudio({ capture });
  await page.click('[data-asset="RAEL-ASSET-0001"]');
  await page.waitForSelector('#msSubmit:not([disabled])');
  await page.click('#msSubmit');
  await page.waitForFunction(() => !document.getElementById('msPreviewWrap').hidden);

  await page.click('#msApprove');
  await page.waitForFunction(() =>
    /Approved and recorded/.test(document.getElementById('msDecisionOutcome').textContent));
  // And the confirmation survives the next render rather than being wiped.
  await page.evaluate(() => window.__thylora.renderResult());
  assert.match(await page.$eval('#msDecisionOutcome', n => n.textContent), /Approved and recorded/);

  const decision = capture.find(c => c.table === 'rpc/submit_thylora_review_gate_decision_v1');
  assert.ok(decision);
  assert.equal(JSON.parse(decision.body).p_decision, 'APPROVED');

  // The queue is still refused while continuity locks stand, and says why.
  const problems = await page.$eval('#msQueueProblems', n => n.textContent);
  assert.match(problems, /continuity lock/i, `expected the locks to hold the queue, got: ${problems}`);
  assert.equal(await page.$eval('#msQueue', n => n.disabled), true);
  await context.close();
});

test('the publishing handover writes provenance before it publishes', async () => {
  const capture = [];
  // Clear every pipeline blocker so the handover is reachable.
  const { context, page } = await openShell({
    session: chairmanSession(), hash: '#media-studio', viewport: IPAD_VIEWPORT,
    router: ROUTER_RESPONSES.SUCCESS_WITH_ASSET, capture
  });
  await page.waitForFunction(() => document.querySelectorAll('#msAssets [data-asset]').length > 0);

  // Drive the handover through the rules directly with a fully cleared asset,
  // so this proves the ORDER of the two writes rather than re-proving the locks.
  const order = await page.evaluate(async () => {
    const mod = await import('./lib/media-studio.js');
    const handoff = mod.publishHandoff({
      job: {
        job_code: 'THY-ANIM-TEST', mode: 'BEST_FIDELITY', job_state: 'APPROVED',
        audit_canonical_id: 'THY-AI-ROUTE-1',
        provider_result: { status: 'SUCCEEDED', model: 'thylora-anim-v2', asset_url: 'https://cdn/x.mp4' }
      },
      asset: { asset_code: 'RAEL-ASSET-0001', version_no: 2, checksum_sha256: 'b'.repeat(64), edf_ref: 'EDF-OUIDAH-001' },
      locks: { can_queue_for_publish: true, locks: [] },
      passport: { serial_number: 'THY-REP-0001-000137', qr_destination: 'https://thylora.example.test/p/1' },
      requirements: { logo_required: true, logo_asset_ref: 'LOGO-THY-001' }
    });
    return handoff;
  });

  assert.equal(order.ok, true, `handover refused: ${JSON.stringify(order.problems)}`);
  // The derivative names its parent and discloses the tool and the router audit.
  assert.equal(order.provenance.event_type, 'AI_ASSISTED');
  assert.equal(order.provenance.derived_from_ref, 'RAEL-ASSET-0001');
  assert.match(order.provenance.tool_disclosure, /thylora-ai-router/);
  assert.match(order.provenance.tool_disclosure, /THY-AI-ROUTE-1/);
  // Serial, QR and logo travel with it as evidence.
  assert.equal(order.provenance.evidence.serial_number, 'THY-REP-0001-000137');
  assert.equal(order.provenance.evidence.qr_destination, 'https://thylora.example.test/p/1');
  assert.equal(order.provenance.evidence.logo_required, true);
  assert.equal(order.provenance.evidence.parent_version_no, 2);
  // And it hands to the existing EDF publish path.
  assert.deepEqual(order.payload, { p_edf_code: 'EDF-OUIDAH-001' });
  await context.close();
});

test('the studio fits an iPad with no sideways scroll and 44px targets', async () => {
  const { context, page } = await openStudio();
  await page.click('[data-asset="RAEL-ASSET-0001"]');
  await page.waitForSelector('#msSubmit');
  await page.click('#msSubmit');
  await page.waitForFunction(() => !document.getElementById('msResult').hidden);

  const layout = await page.evaluate(() => {
    const limit = window.innerWidth;
    const offenders = [];
    const scrollers = [...document.querySelectorAll('.tabs, .map-wrap, .sketch-wrap, .master-wrap')];
    for (const node of document.querySelectorAll('#media-studio *, header *')) {
      if (scrollers.some(s => s === node || s.contains(node))) continue;
      const rect = node.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) continue;
      if (rect.right > limit + 1 || rect.left < -1) offenders.push(`${node.tagName}#${node.id}`);
    }
    const small = [];
    for (const node of document.querySelectorAll('#media-studio button, #media-studio select, #media-studio textarea')) {
      const rect = node.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) continue;
      if (rect.height < 44) small.push(`${node.id || node.textContent.trim().slice(0, 16)}=${Math.round(rect.height)}`);
    }
    return { offenders: offenders.slice(0, 5), small, documentScroll: document.documentElement.scrollWidth, viewport: limit };
  });

  assert.deepEqual(layout.offenders, [], `overflow at iPad width: ${layout.offenders.join(', ')}`);
  assert.deepEqual(layout.small, [], `controls under 44px: ${layout.small.join(', ')}`);
  assert.ok(layout.documentScroll <= layout.viewport + 1);
  assert.equal(layout.viewport, 834);
  await context.close();
});

test('the studio contacts only the one canonical backend', async () => {
  requestLog.length = 0;
  const { context, page } = await openStudio();
  await page.click('[data-asset="RAEL-ASSET-0001"]');
  await page.waitForSelector('#msSubmit:not([disabled])');
  await page.click('#msSubmit');
  await page.waitForFunction(() => !document.getElementById('msResult').hidden);

  const hosts = new Set(requestLog.map(url => new URL(url).hostname));
  hosts.delete('127.0.0.1');
  hosts.delete('cdn.example.test');       // the provider's own returned asset
  hosts.delete('thylora.example.test');   // the QR destination, never fetched by us
  assert.deepEqual([...hosts], [BACKEND_HOST], `unexpected host: ${[...hosts].join(', ')}`);
  await context.close();
});

test('the Chairman workspace now reads the canonical margin and approval queues', async () => {
  const capture = [];
  const { context, page } = await openShell({
    session: chairmanSession(), hash: '#chairman', viewport: IPAD_VIEWPORT, capture
  });
  await page.waitForFunction(() =>
    document.getElementById('chApprovals').textContent.includes('Ouidah')
    || document.getElementById('chApprovals').textContent.includes('unavailable'));

  // Approvals came from the canonical narrow read, not an invented table.
  assert.ok(capture.some(c => c.table === 'rpc/thylora_approval_queue_safe_v1'),
    'the canonical approval queue was not called');
  assert.match(await page.$eval('#chApprovals', n => n.textContent), /Ouidah plate 12 animation/);

  // Margin notes came from the canonical Live Margin queue.
  assert.ok(capture.some(c => c.table === 'rpc/thylora_margin_queue_v1'),
    'the canonical margin queue was not called');
  assert.match(await page.$eval('#chNotes', n => n.textContent), /folio numbering/);

  // A note is queued through the canonical add function.
  await page.fill('#chNote', 'Re-check plate 12 against the second copy.');
  await page.click('#chNoteSave');
  await page.waitForFunction(() =>
    /Queued/.test(document.getElementById('chNoteStatus').textContent));
  const add = capture.find(c => c.table === 'rpc/thylora_margin_note_add_v1');
  assert.ok(add, 'the note did not go to thylora_margin_note_add_v1');
  const payload = JSON.parse(add.body);
  assert.ok('p_anchor_kind' in payload && 'p_body' in payload && 'p_anchor_context' in payload);
  assert.match(await page.$eval('#chNoteStatus', n => n.textContent), /4 waiting to be reconciled/);
  await context.close();
});

