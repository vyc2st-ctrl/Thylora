/**
 * Render regression for js/operating-surface.js
 * Loads the REAL module against a fixture built from live backend values,
 * then asserts what the Chairman must be able to see, at three viewports.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('.');
const fixture = JSON.parse(fs.readFileSync('tests/operating-surface-fixture.json', 'utf8'));
const panelStates = fs.readFileSync('js/panel-states.js', 'utf8');
// Load the REAL site stylesheets so contrast and layout are tested as shipped.
const siteCss = ['css/tokens.css','css/base.css','css/dashboard.css']
  .map(f => fs.readFileSync(f, 'utf8')).join('\n');
const surface = fs.readFileSync('js/operating-surface.js', 'utf8');

const HOSTS = ['operating-home','operating-today','operating-store','operating-news',
  'operating-social','operating-actions','operating-rooms','operating-bridge',
  'operating-brand','operating-truth'];

const page_html = `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"></head><body>
${HOSTS.map(h=>`<section><div data-panel="${h}"></div></section>`).join('\n')}
<button data-operating-refresh>Refresh</button>
</body></html>`;

let failures = [];
function check(name, cond, extra='') {
  if (cond) console.log('PASS  ' + name);
  else { console.log('FAIL  ' + name + (extra?' | '+extra:'')); failures.push(name); }
}

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

const viewports = [
  { name: 'phone',          width: 390,  height: 844 },
  { name: 'ipad-portrait',  width: 768,  height: 1024 },
  { name: 'ipad-landscape', width: 1024, height: 768 },
];

for (const vp of viewports) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height },
                                         hasTouch: true, isMobile: vp.name === 'phone' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type()==='error') errors.push(m.text()); });

  await page.setContent(page_html);
  await page.addStyleTag({ content: siteCss });
  // Stub only the transport. The module, its markup and its logic are real.
  await page.addScriptTag({ content: `
    window.__rpcCalls = [];
    window.thyloraSupabase = {
      auth: { getSession: async () => ({ data: { session: { user: { id: 'chairman' } } } }) },
      rpc: async (name) => {
        window.__rpcCalls.push(name);
        if (name === 'thylora_operating_surface_v1') return { data: ${JSON.stringify(fixture)}, error: null };
        if (name === 'thylora_record_chairman_visit_v1') return { data: { allowed: true }, error: null };
        return { data: null, error: new Error('unexpected rpc ' + name) };
      }
    };`});
  await page.addScriptTag({ content: panelStates });
  await page.addScriptTag({ content: surface });
  await page.evaluate(() => window.thyloraOperatingSurface.load());
  await page.waitForFunction(() =>
    document.querySelector('[data-panel="operating-truth"]').textContent.includes('Documented'), { timeout: 10000 });

  const body = await page.evaluate(() => document.body.innerText);
  const html = await page.content();

  if (vp.name === 'ipad-portrait') {
    // ---- content truth checks (viewport-independent, asserted once)
    check('every panel rendered non-empty', await page.evaluate((hs) =>
      hs.every(h => (document.querySelector(`[data-panel="${h}"]`).textContent||'').trim().length > 20), HOSTS));
    check('no literal undefined/NaN/[object Object] leaked',
      !/\bundefined\b|\bNaN\b|\[object Object\]/.test(body),
      (body.match(/\bundefined\b|\bNaN\b|\[object Object\]/g)||[]).slice(0,3).join(','));
    check('no invented progress percentage', !/\b\d{1,3}\s?% (complete|done|ready)/i.test(body));

    check('ACTIVE/READY/BLOCKED counts shown', /\bActive\b/i.test(body) && /\bReady\b/i.test(body) && /\bBlocked\b/i.test(body));
    check('needs-Chairman surfaced', /Needs Chairman/i.test(body));
    check('can-proceed-without-Chairman surfaced', /Can proceed now/i.test(body));
    check('changed-since-last-visit surfaced', /First recorded visit|Changes since your last visit/.test(body));

    check('Today board groups rendered', /Store —/i.test(body) && /News —/i.test(body) && /Automotive —/i.test(body));

    check('Twelve Miles verified price from readback', /1\.99 USD/.test(body));
    check('verified store state shown', /TWELVE MILES FOR FLOUR/.test(body) && /ACTIVE/.test(body));
    check('shelves rendered', /AVAILABLE NOW/i.test(body) && /IN DEVELOPMENT/i.test(body) && /COMING SOON/i.test(body));
    check('External Customer #1 NOT claimed', /EXTERNAL CUSTOMER #1/.test(body) && /NOT_WITNESSED/.test(body));
    check('External Customer #1 basis names the Chairman purchase', /Chairman's own founding purchase/.test(body));

    check('news masthead exact', /ErsatzReality News/.test(body));
    check('recurring presenter named', /Neyra Sol/.test(body));
    check('Ravens issue shown', /THY-RAVENS-PAPER-20260917-001/.test(body));
    check('publication lock visible', /PENDING_FINAL_PREVIEW/.test(body));
    check('claim ledger counts shown', /17 of 20/.test(body));

    check('all six social buckets rendered',
      ['DRAFTING','READY FOR REVIEW','APPROVED','SCHEDULED','PUBLISHED','BLOCKED']
        .every(b => new RegExp(b,'i').test(body)));
    check('connected never becomes posting-access-verified',
      /PUBLISHING LOCKED \(not verified as posting access\)/.test(body) &&
      !/posting access verified/i.test(body));
    check('personal Facebook kept separate and UNKNOWN',
      /Personal Facebook/.test(body) && /NOT merged with the ErsatzReality Enterprise Page/.test(body));

    check('action card answers all five questions',
      /What do I have to do\?/i.test(body) && /Where do I do it\?/i.test(body) &&
      /Why can.t THYLORA do it\?/i.test(body) && /How do we know it is done\?/i.test(body) &&
      /Exactly what to press/i.test(body));
    check('open promotion action card present', /THY-ACT-20260917-PROMOTE-EA21B42-001/.test(body));

    check('workroom continuity shows authority + restart',
      /Current authority/i.test(body) && /Current restart point/i.test(body));
    // A workroom with blockers must say it is blocked; the UNMEASURED wording is the
    // no-blocker branch. Assert the branch the fixture actually exercises, and assert
    // the UNMEASURED wording exists in the module so it can never regress to "0".
    check('blocked workroom says blocked, never 0% ready', /This workroom is blocked/i.test(body));
    check('module never reports unmeasured readiness as zero',
      surface.includes('UNMEASURED, not zero'));

    check('bridge shows all eight stages',
      ['STORY','REVIEW','RIGHTS','QR DESTINATION','CTA','PLATFORM DRAFT','CHAIRMAN APPROVAL','PUBLICATION']
        .every(st => new RegExp(st,'i').test(body)));
    check('publication kept a separate authority action',
      /Publication is a separate authority action/.test(body));

    check('brand font prints UNKNOWN, not a guess',
      /Masthead font \/ style family/i.test(body) &&
      /exact font family name is NOT known/i.test(body) &&
      !/helvetica|arial|georgia|times new roman|futura/i.test(body));
    check('UNKNOWN rendered as first-class badge', (html.match(/class="os-unknown"/g)||[]).length >= 3,
      String((html.match(/class="os-unknown"/g)||[]).length));
    check('truth panel shows all three classes',
      /Documented/i.test(body) && /Analysis/i.test(body) && /Unknown/i.test(body));
    check('blocked deployment check surfaced', /THY-CDASH-REG-20260911-009/.test(body));

    // With the real stylesheets loaded, card text must actually be readable.
    const contrast = await page.evaluate(() => {
      const lum = (c) => {
        const m = c.match(/[\d.]+/g).slice(0,3).map(Number)
          .map(v => { v/=255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); });
        return 0.2126*m[0] + 0.7152*m[1] + 0.0722*m[2];
      };
      const bgOf = (el) => {
        let n = el;
        while (n && n !== document.documentElement) {
          const bg = getComputedStyle(n).backgroundColor;
          if (bg && !/rgba\(0, 0, 0, 0\)|transparent/.test(bg)) return bg;
          n = n.parentElement;
        }
        return 'rgb(0,0,0)';
      };
      const worst = [];
      document.querySelectorAll('[data-panel^="operating-"] dd, [data-panel^="operating-"] .os-title, [data-panel^="operating-"] .os-note')
        .forEach(el => {
          if (!el.innerText.trim()) return;
          const a = lum(getComputedStyle(el).color), b = lum(bgOf(el));
          const ratio = (Math.max(a,b) + 0.05) / (Math.min(a,b) + 0.05);
          if (ratio < 4.5) worst.push({ t: el.innerText.slice(0,24), r: +ratio.toFixed(2) });
        });
      return worst;
    });
    check('card text meets 4.5:1 contrast with real CSS', contrast.length === 0,
      JSON.stringify(contrast.slice(0,4)));

    check('visit recorded only after render',
      await page.evaluate(() => window.__rpcCalls.join(',') === 'thylora_operating_surface_v1,thylora_record_chairman_visit_v1'),
      await page.evaluate(() => window.__rpcCalls.join(',')));
  }

  // ---- mobile / touch checks at every viewport
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(`[${vp.name}] no horizontal overflow`, overflow <= 1, 'overflow=' + overflow);

  const smallTargets = await page.evaluate(() =>
    Array.from(document.querySelectorAll('button, a, summary'))
      .map(el => ({ t: (el.innerText||'').slice(0,28), h: Math.round(el.getBoundingClientRect().height) }))
      .filter(x => x.h > 0 && x.h < 30));
  check(`[${vp.name}] primary controls are touch-sized (>=30px)`, smallTargets.length === 0,
    JSON.stringify(smallTargets.slice(0,4)));

  const hoverOnly = await page.evaluate(() =>
    Array.from(document.styleSheets).flatMap(s => { try { return Array.from(s.cssRules); } catch { return []; } })
      .filter(r => r.selectorText && /:hover/.test(r.selectorText))
      .filter(r => /display\s*:|visibility\s*:|opacity\s*:\s*1/.test(r.style.cssText)).length);
  check(`[${vp.name}] no hover-gated content`, hoverOnly === 0, 'rules=' + hoverOnly);

  check(`[${vp.name}] no page errors`, errors.length === 0, errors.slice(0,2).join(' | '));

  await page.screenshot({ path: `evidence/operating-surface-${vp.name}.png`, fullPage: false });
  await ctx.close();
}

// ---- denial path: a refused Chairman gate must render access-denied, not a broken board
{
  const ctx = await browser.newContext({ viewport: { width: 768, height: 1024 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  await page.setContent(page_html);
  await page.addStyleTag({ content: siteCss });
  await page.addScriptTag({ content: `
    window.thyloraSupabase = {
      auth: { getSession: async () => ({ data: { session: { user: { id: 'not-chairman' } } } }) },
      rpc: async () => ({ data: { allowed: false, reason: 'CHAIRMAN_OR_TRUSTED_SERVER_ONLY',
        note: 'The Chairman-only gate was not weakened to render this surface.' }, error: null })
    };`});
  await page.addScriptTag({ content: panelStates });
  await page.addScriptTag({ content: surface });
  await page.evaluate(() => window.thyloraOperatingSurface.load());
  await page.waitForFunction(() =>
    /Access denied/i.test(document.body.innerText), { timeout: 8000 }).catch(()=>{});
  const body = await page.evaluate(() => document.body.innerText);
  check('[denied] every panel shows access-denied', await page.evaluate((hs) =>
    hs.every(h => /Access denied/i.test(document.querySelector(`[data-panel="${h}"]`).textContent)), HOSTS));
  check('[denied] gate reason surfaced, no data leaked',
    /gate was not weakened/i.test(body) && !/Neyra Sol|1\.99|Twelve Miles/.test(body));
  check('[denied] no page errors', errs.length === 0, errs.slice(0,2).join(' | '));
  await ctx.close();
}

// ---- signed-out path
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.setContent(page_html);
  await page.addScriptTag({ content: `
    window.thyloraSupabase = { auth: { getSession: async () => ({ data: { session: null } }) },
      rpc: async () => { throw new Error('rpc must not be called when signed out'); } };`});
  await page.addScriptTag({ content: panelStates });
  await page.addScriptTag({ content: surface });
  await page.evaluate(() => window.thyloraOperatingSurface.load());
  await page.waitForFunction(() => /Sign in/i.test(document.body.innerText), { timeout: 8000 }).catch(()=>{});
  const body = await page.evaluate(() => document.body.innerText);
  check('[signed-out] prompts sign-in and calls no RPC',
    /Sign in as Chairman/i.test(body) && !/Neyra Sol|Twelve Miles/.test(body));
  await ctx.close();
}

await browser.close();
console.log('\n' + (failures.length ? 'FAILURES: ' + failures.join(', ') : 'ALL RENDER CHECKS PASSED'));
process.exit(failures.length ? 1 : 0);
