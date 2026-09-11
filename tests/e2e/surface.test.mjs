// RAE LINK · browser tests at phone size
// Workroom: WR-RAELINK-001
//
// These run against the real page in Chromium with the backend unreachable —
// which is the state a viewer would meet today. That makes them a test of the
// degradation posture as much as of the layout: nothing may be blank, and
// nothing may claim content exists when the backend cannot be read.

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { startServer } from './serve.mjs';

const PHONE = { width: 390, height: 844 };      // iPhone 12/13/14 logical size
const SMALL = { width: 320, height: 640 };      // the narrowest phone still in use

let browser, context, page, server, baseUrl;
const consoleErrors = [];

before(async () => {
  const started = await startServer(new URL('../../', import.meta.url).pathname);
  server = started.server;
  baseUrl = `http://127.0.0.1:${started.port}/rae-link/index.html`;
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium' });
  context = await browser.newContext({ viewport: PHONE, isMobile: true, hasTouch: true });
  page = await context.newPage();
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', error => consoleErrors.push(`pageerror: ${error.message}`));
  await page.goto(baseUrl, { waitUntil: 'load' });
  await page.waitForTimeout(600);
});

after(async () => {
  await browser?.close();
  server?.close();
});

test('the page loads and names itself', async () => {
  assert.equal(await page.title(), 'RAE Link — THYLORA owned media network');
  assert.equal(await page.locator('h1').first().innerText(), 'RAE Link');
});

test('no uncaught script error on load', () => {
  const real = consoleErrors.filter(text => !/Failed to load resource|net::ERR|favicon/i.test(text));
  assert.deepEqual(real, [], `console errors: ${real.join(' | ')}`);
});

test('the page does not scroll sideways at 390px or at 320px', async () => {
  for (const viewport of [PHONE, SMALL]) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(120);
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.ok(overflow <= 1, `horizontal overflow of ${overflow}px at ${viewport.width}px wide`);
  }
  await page.setViewportSize(PHONE);
});

test('tap targets on the primary navigation meet the 44px touch minimum', async () => {
  const heights = await page.$$eval('.tabs button', nodes => nodes.map(n => n.getBoundingClientRect().height));
  assert.ok(heights.length >= 8);
  assert.ok(Math.min(...heights) >= 44, `smallest tab is ${Math.min(...heights)}px; 44px is the touch minimum`);
});

test('an unreachable backend is reported honestly, not as an empty feed', async () => {
  const chip = await page.locator('#backendChip').innerText();
  assert.match(chip, /BACKEND · (UNREACHABLE|NOT PROVISIONED|PARTIAL)/);
  const feed = await page.locator('#feedGrid').innerText();
  assert.ok(/cannot load|unavailable|not published/i.test(feed), `feed said: ${feed}`);
});

test('routing to a channel address renders the channel view, not a blank panel', async () => {
  await page.goto(`${baseUrl}#channel/green-milk`, { waitUntil: 'load' });
  await page.waitForTimeout(500);
  assert.equal(await page.locator('#channel').isVisible(), true);
  const text = await page.locator('#channel').innerText();
  assert.ok(text.trim().length > 20, 'channel view rendered nothing');
  assert.ok(/not provisioned|unreachable|not found|cannot/i.test(text), `channel view said: ${text}`);
});

test('routing to a watch address renders the player view', async () => {
  await page.goto(`${baseUrl}#player/00000000-0000-0000-0000-000000000000`, { waitUntil: 'load' });
  await page.waitForTimeout(500);
  assert.equal(await page.locator('#player').isVisible(), true);
  const text = await page.locator('#player').innerText();
  assert.ok(text.trim().length > 20, 'player view rendered nothing');
});

test('the creator studio offers channel creation and states the upload gap plainly', async () => {
  await page.goto(`${baseUrl}#studio`, { waitUntil: 'load' });
  await page.waitForTimeout(500);
  assert.equal(await page.locator('#channelForm').isVisible(), true);
  const upload = await page.locator('#uploadCard').innerText();
  assert.match(upload, /UPLOAD TRANSPORT UNCONFIGURED/i);
  assert.match(upload, /not uploaded|not going anywhere|no resumable-upload provider/i);
});

test('choosing a world channel class demands a simulated-media disclosure', async () => {
  await page.selectOption('#channelClass', 'EARTH_PERSON');
  assert.equal(await page.locator('#disclosureField').isVisible(), false);
  await page.selectOption('#channelClass', 'EDEREARIAH_INHABITANT');
  assert.equal(await page.locator('#disclosureField').isVisible(), true);
  assert.equal(await page.locator('#disclosureField textarea').getAttribute('required'), '');
});

test('a world channel without a disclosure is refused before any request is made', async () => {
  await page.selectOption('#channelClass', 'WORLD_CHANNEL');
  await page.fill('#channelForm input[name=name]', 'Test World Channel');
  await page.fill('#channelForm input[name=slug]', 'test-world-channel');
  await page.fill('#disclosureField textarea', 'too short');
  await page.click('#channelForm button[type=submit]');
  await page.waitForTimeout(250);
  const status = await page.locator('#channelStatus').innerText();
  assert.match(status, /disclosure/i, `status said: ${status}`);
});

test('the earnings worked example computes in the browser with no backend', async () => {
  await page.goto(`${baseUrl}#earnings`, { waitUntil: 'load' });
  await page.waitForTimeout(400);
  const table = await page.locator('#calcOut').innerText();
  assert.match(table, /Distributable base/);
  assert.match(table, /\$96\.80/, 'expected the 10000 − 320 base');
  assert.match(table, /\$77\.44/, 'expected the 80% creator share');
  assert.match(table, /Net payable to creator/);
});

test('an unresolved tax state holds the payout in the live example', async () => {
  await page.selectOption('#calcForm select[name=tax_state]', 'UNRESOLVED');
  await page.waitForTimeout(250);
  const table = await page.locator('#calcOut').innerText();
  assert.match(table, /HELD_TAX_UNRESOLVED/);
});

test('the family partnership preview refuses an undeclared beneficiary share', async () => {
  await page.goto(`${baseUrl}#partnership`, { waitUntil: 'load' });
  await page.waitForTimeout(400);
  await page.fill('#partnershipForm input[name=beneficiary_share_bp]', '0');
  await page.waitForTimeout(200);
  const preview = await page.locator('#partnershipPreview').innerText();
  assert.match(preview, /SHARE_UNDECLARED|declare the beneficiary percentage/i);
});

test('a child participant is told guardian authority is required', async () => {
  await page.fill('#partnershipForm input[name=beneficiary_share_bp]', '5000');
  await page.fill('#partnershipForm input[name=beneficiary_ref]', 'Named family fund');
  await page.fill('#partnershipForm textarea[name=purpose_statement]', 'Help with the costs the family named.');
  await page.selectOption('#partnershipForm select[name=subject_kind]', 'MINOR');
  await page.waitForTimeout(200);
  const preview = await page.locator('#partnershipPreview').innerText();
  assert.match(preview, /guardian/i);
});

test('accessibility hooks are present: skip link, labels, and a live region once announced', async () => {
  await page.goto(`${baseUrl}#watch`, { waitUntil: 'load' });
  await page.waitForTimeout(400);
  assert.equal(await page.locator('a.skip').count(), 1);

  const unnamed = await page.$$eval('.tabs button, .reaction-row button',
    nodes => nodes.filter(n => !n.innerText.trim() && !n.getAttribute('aria-label')).length);
  assert.equal(unnamed, 0, 'every navigation and reaction control has an accessible name');

  const unlabelled = await page.$$eval('input, select, textarea', nodes => nodes.filter(node => {
    if (node.type === 'hidden') return false;
    const id = node.getAttribute('id');
    return !node.closest('label')
      && !(id && document.querySelector(`label[for="${id}"]`))
      && !node.getAttribute('aria-label');
  }).length);
  assert.equal(unlabelled, 0, 'every form control is labelled');

  await page.evaluate(async () => {
    const { announce } = await import('./lib/a11y.js');
    announce('test announcement');
  });
  await page.waitForTimeout(120);
  assert.equal(await page.locator('[role=status][aria-live]').count() >= 1, true);
});

test('keyboard focus is visible on the first interactive control', async () => {
  await page.keyboard.press('Tab');
  const outline = await page.evaluate(() => {
    const style = getComputedStyle(document.activeElement);
    return { tag: document.activeElement.tagName, outlineWidth: style.outlineWidth, outlineStyle: style.outlineStyle };
  });
  assert.notEqual(outline.outlineStyle, 'none', `focus ring missing on ${outline.tag}`);
});

test('focusing a view does not hide its heading under the sticky tab bar', async () => {
  await page.goto(`${baseUrl}#studio`, { waitUntil: 'load' });
  await page.waitForTimeout(500);
  const clear = await page.evaluate(() => {
    const heading = document.querySelector('#studio h2');
    const tabs = document.querySelector('.tabs');
    return heading.getBoundingClientRect().top >= tabs.getBoundingClientRect().bottom - 1;
  });
  assert.equal(clear, true, 'the studio heading is covered by the sticky navigation');
});

test('a phone-width screenshot is captured as layout evidence', async () => {
  await page.goto(`${baseUrl}#studio`, { waitUntil: 'load' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'tests/e2e/evidence-studio-390.png', fullPage: false });
  await page.goto(`${baseUrl}#earnings`, { waitUntil: 'load' });
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'tests/e2e/evidence-earnings-390.png', fullPage: false });
  assert.ok(true);
});
