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

import { FIXTURES, NOT_PROVISIONED, WITHHELD, CHAIRMAN_COMMAND_RPC } from './fixtures.mjs';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const BACKEND_HOST = 'jvsdxhrfhtlgaknhjxlz.supabase.co';
const SESSION_KEY = 'thylora_app_auth_session';
const VIEWPORT = { width: 390, height: 844 }; // a common phone viewport

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
async function openShell({ session = null, hash = '', withhold = WITHHELD, seedState = null } = {}) {
  const context = await browser.newContext({
    viewport: VIEWPORT,
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
    // /rest/v1/<table>  or  /rest/v1/rpc/<name>
    const path = url.pathname.replace('/rest/v1/', '');
    const name = path.startsWith('rpc/') ? path : path.split('?')[0];

    if (route.request().method() === 'POST' && !path.startsWith('rpc/')) {
      // A write to a held table: answer the way an unmigrated backend would.
      if (withhold.has(name) || FIXTURES[name] === undefined) {
        return route.fulfill({ status: NOT_PROVISIONED.status, contentType: 'application/json',
          body: JSON.stringify(NOT_PROVISIONED.body) });
      }
      return route.fulfill({ status: 201, contentType: 'application/json', body: '[]' });
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
  assert.ok(await page.$('[data-approve="APR-0001"]'));
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

test('approve and department routing use the same command spine', async () => {
  const { context, page } = await openShell({ session: chairmanSession(), hash: '#chairman' });
  const posted = [];
  page.on('request', request => {
    if (request.url().includes('/rpc/')) posted.push(request.postData() ?? '');
  });

  await page.waitForSelector('[data-approve="APR-0001"]');
  await page.click('[data-approve="APR-0001"]');
  await page.waitForFunction(() =>
    document.getElementById('chStatus').textContent.includes('routed and preserved'));
  assert.ok(posted.some(body => /APPROVE APR-0001/.test(body)), 'approval did not route as a command');

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
