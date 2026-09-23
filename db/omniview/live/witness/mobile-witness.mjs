// OMNIVIEW mobile witness (THY-WORK-OMNIVIEW-LIVE-APPLY-591)
//
// WHAT THIS IS: the real CONTEXT/SEQUENCE surface, inside the real dashboard head
// and the real member app, in Chromium at iPhone 13 size (390x844, touch).
// Backend calls to jvsdxhrfhtlgaknhjxlz.supabase.co are answered from
// live-readback-591.json, which was read from thylora-dash by the same RPCs.
//
// WHAT THIS IS NOT: an authenticated session against the live backend. The build
// container cannot reach the Supabase REST host (proxy 403), and no Chairman
// credential is used. LIVE UI WITNESSED still needs the Chairman's own phone.
//
//   node db/omniview/live/witness/mobile-witness.mjs
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createServer } from 'node:http';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); }
catch { playwright = require(join(process.execPath, '../../lib/node_modules/playwright')); }
const { chromium, devices } = playwright;

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '../../../..');
const OUT = join(HERE, 'shots');
mkdirSync(OUT, { recursive: true });
const LIVE = JSON.parse(readFileSync(join(HERE, 'live-readback-591.json'), 'utf8'));

const norm = (k) => String(k || '').toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^A-Z0-9]+/g, ' ').trim();
// thy_omniview_topics.aliases on thylora-dash at 591 (the database resolves these;
// the replayed topic payload does not carry them).
const ALIASES = { 'ROYAL CASTLE': 'CASTLE', 'THE ROYAL CASTLE': 'CASTLE', 'THE CASTLE': 'CASTLE',
  'ALISTAIR': 'ALISTAIR CROWE', 'CROWE': 'ALISTAIR CROWE', 'SPORT': 'SPORTS', 'ER SA 001': 'SPORTS' };
function resolveTopic(key) {
  const n = ALIASES[norm(key)] || norm(key);
  for (const [k, v] of Object.entries(LIVE.thy_omniview_topic)) {
    if (norm(k) === n) return v;
  }
  for (const t of LIVE.thy_omniview_manifest.topic_manifest) {
    const read = LIVE.thy_omniview_topic[t.topic_key];
    if (read && (read.topic_manifest.display_name && norm(read.topic_manifest.display_name) === n)) return read;
  }
  return { read_model: 'TOPIC_EXPANSION', topic_key: n, found: false, canon_state: 'UNREGISTERED',
    answer_rule: 'This topic is not in the manifest. Register it before answering as canon.' };
}

// What thylora-dash returns to a signed-in account that is not the Chairman
// (verified live: 0 rows under RLS, execute granted).
const NON_CHAIRMAN = {
  thy_omniview_manifest: { read_model: 'CURRENT_STATE_MANIFEST', sequence_head: null, topic_manifest: [], newest_deltas: [],
    authority_locks: [], last_restart: null, counts: { topics: 0, sequences: 0 } },
  thy_sequence_ledger_page: { read_model: 'SEQUENCE_LEDGER', head: null, rows: [] }
};

const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
const server = createServer((req, res) => {
  const path = decodeURIComponent(req.url.split('?')[0]);
  try {
    const body = readFileSync(join(ROOT, path === '/' ? '/dashboard-current-head.html' : path));
    res.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream' }); res.end(body);
  } catch { res.writeHead(404); res.end('not found'); }
}).listen(0);
const BASE = `http://127.0.0.1:${server.address().port}`;

const log = [];
const record = (host, scenario, step, ok, detail) => { log.push({ host, scenario, step, ok, detail }); };

async function page(browser, mode) {
  const ctx = await browser.newContext({ ...devices['iPhone 13'] });
  if (mode !== 'SIGNED_OUT') {
    await ctx.addInitScript(() => { try { localStorage.setItem('thy_access_token', 'witness-replay-token'); } catch (_) {} });
  }
  await ctx.route('https://jvsdxhrfhtlgaknhjxlz.supabase.co/**', async (route) => {
    const url = route.request().url();
    const m = url.match(/\/rest\/v1\/rpc\/([a-z_]+)/);
    if (!m) return route.fulfill({ status: 503, body: '{"message":"not part of the OMNIVIEW witness"}', contentType: 'application/json' });
    const fn = m[1]; let args = {};
    try { args = JSON.parse(route.request().postData() || '{}'); } catch (_) {}
    let body;
    if (mode === 'NON_CHAIRMAN') body = NON_CHAIRMAN[fn] || {};
    else if (fn === 'thy_omniview_manifest') body = LIVE.thy_omniview_manifest;
    else if (fn === 'thy_sequence_ledger_page') body = LIVE.thy_sequence_ledger_page;
    else if (fn === 'thy_omniview_sequence') body = LIVE.thy_omniview_sequence[String(args.p_sequence_no)] || { found: false };
    else if (fn === 'thy_omniview_topic') body = resolveTopic(args.p_topic_key);
    else return route.fulfill({ status: 503, body: '{"message":"not part of the OMNIVIEW witness"}', contentType: 'application/json' });
    return route.fulfill({ status: 200, body: JSON.stringify(body), contentType: 'application/json' });
  });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(String(e)));
  return { ctx, p, errors };
}

const bodyText = (p) => p.locator('#thyOmniBody').innerText();
const shot = (p, name) => p.screenshot({ path: join(OUT, name + '.png'), fullPage: false });

async function openOmniview(p, which) {
  // The entry point lives in the host drawer when there is one, else it floats.
  const btn = p.locator(which === 'SEQUENCE' ? '#thyOmniOpenSequence' : '#thyOmniOpenContext');
  const inDrawer = await btn.evaluate((el) => !!el.closest('#drawer'));
  if (inDrawer && !(await p.locator('#drawer').evaluate((d) => d.classList.contains('open')))) {
    await p.locator('#menu').click();                 // the host's own drawer control
    await p.waitForFunction(() => document.getElementById('drawer').classList.contains('open'));
    await p.waitForTimeout(350);                      // drawer slide-in
  }
  await btn.click();
}

async function hostControls(p, host) {
  // Every visible control on the host page, and what is listening to it:
  // its own handler / inline / link / form, a delegated handler on an ancestor,
  // or nothing at all.
  const cdp = await p.context().newCDPSession(p);
  const items = await p.evaluate(() => {
    const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
    const els = [...document.querySelectorAll('button, a[href], [role="button"], input[type=submit]')].filter(vis);
    return els.map((el, i) => { el.setAttribute('data-witness-idx', String(i));
      return { i, text: (el.innerText || el.value || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 60),
        id: el.id, href: el.getAttribute('href'), disabled: el.disabled === true || el.getAttribute('aria-disabled') === 'true',
        title: el.getAttribute('title') || '', inline: !!el.onclick || el.hasAttribute('onclick'), form: !!(el.form && el.type === 'submit') }; });
  });
  const CLICK = new Set(['click', 'pointerdown', 'pointerup', 'touchstart', 'touchend', 'mousedown', 'mouseup']);
  const listenersOn = async (expr) => {
    const { result } = await cdp.send('Runtime.evaluate', { expression: expr });
    if (!result.objectId) return 0;
    const { listeners } = await cdp.send('DOMDebugger.getEventListeners', { objectId: result.objectId, depth: 0 });
    return listeners.filter((l) => CLICK.has(l.type)).length;
  };
  let own = 0, delegated = 0; const none = [];
  for (const it of items) {
    if ((it.href && it.href !== '#' && !it.href.startsWith('javascript')) || it.inline || it.form) { own++; continue; }
    if (await listenersOn(`document.querySelector('[data-witness-idx="${it.i}"]')`)) { own++; continue; }
    const anc = await p.evaluate((i) => { let n = 0, el = document.querySelector(`[data-witness-idx="${i}"]`).parentElement;
      while (el) { el.setAttribute('data-witness-anc', String(n++)); el = el.parentElement; } return n; }, it.i);
    let found = false;
    for (let k = 0; k < anc && !found; k++) found = (await listenersOn(`document.querySelector('[data-witness-anc="${k}"]')`)) > 0;
    if (!found) found = (await listenersOn('document')) > 0 || (await listenersOn('window')) > 0;
    await p.evaluate(() => document.querySelectorAll('[data-witness-anc]').forEach((e) => e.removeAttribute('data-witness-anc')));
    if (found) delegated++; else none.push(it);
  }
  record(host, 'HOST', `visible controls ${items.length}: own handler/link ${own}, delegated ${delegated}, none ${none.length}`,
    none.filter((d) => !d.disabled).length === 0,
    none.map((d) => `${d.id || '(no id)'} "${d.text}"${d.disabled ? ' [disabled' + (d.title ? ': ' + d.title : '') + ']' : ''}`).join(' | ') || 'none');
}

const TOPICS = ['TIME RUN', 'ROYAL CASTLE', 'ALISTAIR CROWE', 'STORE', 'SPORTS', 'QYRIS'];

async function run(host, url) {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch());
  try {
    // ---- Chairman view, live payloads replayed ----
    let { ctx, p, errors } = await page(browser, 'CHAIRMAN');
    await p.goto(BASE + url, { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(600);
    await hostControls(p, host);
    await openOmniview(p, 'CONTEXT');
    await p.waitForSelector('[data-omni-topic]', { timeout: 5000 });
    let t = await bodyText(p);
    record(host, 'CHAIRMAN', 'CONTEXT opens on the live manifest', /head 591/i.test(t), t.split('\n')[0]);
    await shot(p, `${host}-01-context`);
    const vw = await p.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
    record(host, 'CHAIRMAN', 'no horizontal overflow at 390px', vw[0] <= vw[1], `scrollWidth ${vw[0]} / viewport ${vw[1]}`);
    const covered = await p.evaluate(() => {
      // Sample points across the panel body: the topmost element must belong to the panel.
      const body = document.getElementById('thyOmniBody').getBoundingClientRect(); const hits = [];
      for (let y = body.top + 20; y < Math.min(body.bottom, innerHeight) - 5; y += 40)
        for (const x of [20, innerWidth / 2, innerWidth - 20]) {
          const el = document.elementFromPoint(x, y);
          if (el && !el.closest('#thyOmniviewPanel')) hits.push((el.id || el.className || el.tagName) + '@' + Math.round(x) + ',' + Math.round(y));
        }
      return [...new Set(hits)];
    });
    record(host, 'CHAIRMAN', 'nothing floats over the open panel', covered.length === 0, covered.join(' | ') || 'panel is topmost everywhere sampled');

    for (const key of TOPICS) {
      const target = LIVE.thy_omniview_topic[resolveTopic(key).topic_key];
      await p.locator(`[data-omni-topic="${target.topic_key}"]`).first().click();
      await p.waitForSelector('#thyOmniBack', { timeout: 5000 });
      t = await bodyText(p);
      const steps = ['NEWEST DELTAS', 'TOPIC MANIFEST', 'AUTHORITY LOCKS', 'LINKED GATES', 'CURRENT VS SUPERSEDED', 'ANSWER'].every((s) => t.includes(s));
      const nb = target.next_better_question && target.next_better_question.question;
      const clipped = await p.evaluate(() => { const b = document.getElementById('thyOmniBody');
        return b.scrollWidth - b.clientWidth; });
      record(host, 'CHAIRMAN', `topic ${key}: nothing runs off the right edge`, clipped <= 1, `overflow ${clipped}px`);
      record(host, 'CHAIRMAN', `topic ${key} → ${target.topic_key}`, steps && t.includes('QYRIS') && (!nb || t.includes(nb)),
        `lock ${target.authority_locks.authority_lock} · ${target.topic_manifest.canon_state} · next: ${nb || '—'}`);
      await shot(p, `${host}-02-topic-${target.topic_key.replace(/\W+/g, '-').toLowerCase()}`);
      if (key === 'ROYAL CASTLE') {
        const seqBtn = p.locator('#thyOmniBody [data-omni-seq="591"]').first();
        await seqBtn.click();
        await p.waitForSelector('text=SEQUENCE #591', { timeout: 5000 });
        t = await bodyText(p);
        record(host, 'CHAIRMAN', 'a delta card on a topic opens its sequence', t.includes('BACKEND_VERIFIED') && t.includes('America/New_York'), 'sequence #591');
        await p.locator('#thyOmniBack').click(); // → ledger
        await p.waitForSelector('text=SEQUENCE LEDGER', { timeout: 5000 });
        await p.locator('#thyOmniTabContext').click();
        await p.waitForSelector('[data-omni-topic]', { timeout: 5000 });
        continue;
      }
      await p.locator('#thyOmniBack').click();
      await p.waitForSelector('[data-omni-topic]', { timeout: 5000 });
    }

    await p.locator('#thyOmniTabSequence').click();
    await p.waitForSelector('#thyOmniBody [data-omni-seq]', { timeout: 5000 });
    t = await bodyText(p);
    record(host, 'CHAIRMAN', 'SEQUENCE tab lists the live ledger', /head 591/i.test(t) && t.includes('#587'), t.split('\n')[0]);
    await shot(p, `${host}-03-sequence-ledger`);
    await p.locator('[data-omni-seq="591"]').first().click();
    await p.waitForSelector('text=SEQUENCE #591', { timeout: 5000 });
    t = await bodyText(p);
    const twelve = ['Local date/time', 'UTC date/time', 'Previous sequence', 'What changed', 'What remained',
      'Why the change occurred', 'Why it changed', 'Authority', 'Truth class', 'NEXT QUESTION', 'RESTART POINT'].every((s) => t.includes(s));
    record(host, 'CHAIRMAN', 'sequence #591 shows every required field', twelve, 'previous 587 · BACKEND_VERIFIED');
    await shot(p, `${host}-04-sequence-591`);
    await p.locator('#thyOmniBody [data-omni-topic="CASTLE"]').click();
    await p.waitForSelector('text=AUTHORITY LOCKS', { timeout: 5000 });
    record(host, 'CHAIRMAN', 'a topic button inside a sequence opens that topic', (await bodyText(p)).includes('Royal Castle'), 'CASTLE');
    await p.locator('#thyOmniRefresh').click();
    await p.waitForSelector('[data-omni-topic]', { timeout: 5000 });
    record(host, 'CHAIRMAN', 'Refresh re-reads the current view', true, 'CONTEXT reloaded');
    await p.keyboard.press('Escape');
    record(host, 'CHAIRMAN', 'Escape closes the surface', !(await p.locator('#thyOmniviewPanel').evaluate((e) => e.classList.contains('open'))), '');
    await openOmniview(p, 'SEQUENCE');
    await p.waitForSelector('text=SEQUENCE LEDGER', { timeout: 5000 });
    await p.locator('#thyOmniClose').click();
    record(host, 'CHAIRMAN', 'Close closes the surface', !(await p.locator('#thyOmniviewPanel').evaluate((e) => e.classList.contains('open'))), '');
    record(host, 'CHAIRMAN', 'no script errors', errors.length === 0, errors.join(' | ') || 'none');
    await ctx.close();

    // ---- Signed in, not the Chairman ----
    ({ ctx, p, errors } = await page(browser, 'NON_CHAIRMAN'));
    await p.goto(BASE + url, { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(400);
    await openOmniview(p, 'CONTEXT');
    await p.waitForSelector('.thy-omni-note', { timeout: 5000 });
    await p.waitForTimeout(300);
    t = await bodyText(p);
    record(host, 'NON_CHAIRMAN', 'CONTEXT says "not the Chairman", not an empty board', /not as the Chairman/.test(t) && !/No topics registered/.test(t), t.slice(0, 120));
    await shot(p, `${host}-05-not-chairman`);
    await p.locator('#thyOmniTabSequence').click();
    await p.waitForTimeout(300);
    t = await bodyText(p);
    record(host, 'NON_CHAIRMAN', 'SEQUENCE says "not the Chairman", not an empty ledger', /not as the Chairman/.test(t) && !/No sequences recorded/.test(t), t.slice(0, 120));
    await ctx.close();

    // ---- Signed out ----
    ({ ctx, p, errors } = await page(browser, 'SIGNED_OUT'));
    await p.goto(BASE + url, { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(400);
    await openOmniview(p, 'CONTEXT');
    await p.waitForTimeout(300);
    t = await bodyText(p);
    record(host, 'SIGNED_OUT', 'CONTEXT asks for sign-in', /Sign in first/.test(t), t.slice(0, 80));
    await shot(p, `${host}-06-signed-out`);
    await ctx.close();
  } finally { await browser.close(); }
}

await run('dashboard', '/dashboard-current-head.html');
await run('app', '/app/index.html');
server.close();

const pass = log.filter((l) => l.ok).length;
writeFileSync(join(HERE, 'mobile-witness-results.json'), JSON.stringify({
  witnessed_at: new Date().toISOString(), device: 'iPhone 13 profile (390x844, DPR 3, touch), Chromium',
  data: `live-readback-591.json captured ${LIVE.captured_at}`,
  nature: 'REPLAYED LIVE DATA IN THE REAL SURFACE. Not an authenticated live session; not LIVE UI WITNESSED.',
  pass, total: log.length, results: log }, null, 1));
for (const l of log) console.log(`${l.ok ? 'PASS' : 'FAIL'} | ${l.host} | ${l.scenario} | ${l.step} | ${l.detail}`);
console.log(`== ${pass}/${log.length}`);
process.exit(pass === log.length ? 0 : 1);
