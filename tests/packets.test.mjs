// THYLORA STORE · utility packet tests · WR-STORE-UTILITY-582
// These tests exist to stop one specific failure: a product that looks finished in
// the catalogue and prints as blank, unsigned or unfillable paper.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { PRODUCTS, D_GATE, CHAIRMAN_DECISIONS, dGateState, productById }
  from '../store/lib/catalog.js';

const previewReady = PRODUCTS.filter(p => p.lane_state === 'PREVIEW-READY');
const read = p => readFileSync(new URL(`../${p.file}`, import.meta.url), 'utf8');
const sheets = html => html.split('<article class="sheet').slice(1);
const textOf = s => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

/* ── catalogue integrity ─────────────────────────────────────────────────── */

test('every product carries a unique id, SKU and path', () => {
  const ids = PRODUCTS.map(p => p.id), skus = PRODUCTS.map(p => p.sku), paths = PRODUCTS.map(p => p.path);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(new Set(skus).size, skus.length);
  assert.equal(new Set(paths).size, paths.length);
  PRODUCTS.forEach(p => assert.equal(productById(p.id), p));
});

test('every product carries its full identity before it can be sold', () => {
  const required = ['title','shelf_line','edition','serial_grammar','author','editor','designer',
    'provenance','rights','delivery_path','reaccess_path','store_description','alt_text'];
  for (const p of PRODUCTS) {
    for (const key of required) {
      assert.ok(typeof p[key] === 'string' && p[key].trim().length > 8,
        `${p.id} is missing a usable ${key}`);
    }
    assert.match(p.serial_grammar, /\{YYYYMMDD\}/, `${p.id} serial grammar must be date-stamped`);
  }
});

test('no price is locked anywhere in the lane', () => {
  for (const p of PRODUCTS) {
    assert.match(p.price_proposal.note, /Proposal only/i, `${p.id} price is not marked as a proposal`);
    assert.equal(p.d_gate.D6, 'HELD', `${p.id} may not pass the price gate without the Chairman`);
    assert.equal(p.d_gate.D7, 'HELD', `${p.id} may not pass the release gate without the Chairman`);
  }
});

test('the D-gate covers every product and the Chairman gates are marked', () => {
  const chairman = D_GATE.filter(g => g.authority === 'CHAIRMAN').map(g => g.id);
  assert.deepEqual(chairman, ['D6','D7']);
  for (const p of PRODUCTS) {
    for (const g of D_GATE) assert.ok(p.d_gate[g.id], `${p.id} has no state for ${g.id}`);
  }
});

test('a product only reads PREVIEW-READY when everything but the Chairman is done', () => {
  for (const p of PRODUCTS) assert.equal(dGateState(p), p.lane_state, `${p.id} lane state disagrees with its gate`);
  assert.ok(CHAIRMAN_DECISIONS.length >= 4);
  CHAIRMAN_DECISIONS.forEach(d => assert.ok(d.gate === 'D6' || d.gate === 'D7'));
});

/* ── the packets themselves ──────────────────────────────────────────────── */

test('every preview-ready product has a packet file on disk', () => {
  assert.ok(previewReady.length >= 1, 'the lane must carry at least one preview-ready packet');
  for (const p of previewReady) {
    assert.ok(existsSync(new URL(`../${p.file}`, import.meta.url)), `${p.id} has no packet file`);
  }
});

test('every packet has the page count the catalogue claims', () => {
  for (const p of previewReady) assert.equal(sheets(read(p)).length, p.pages, `${p.id} page count`);
});

test('NO BLANK PAGE — every sheet carries real copy and prints ink', () => {
  for (const p of previewReady) {
    sheets(read(p)).forEach((sheet, i) => {
      const words = textOf(sheet).split(' ').filter(Boolean).length;
      assert.ok(words > 60, `${p.id} page ${i + 1} has only ${words} words — that is a blank page`);
    });
  }
});

test('every page after the cover carries a running head, a foot, the SKU and its page number', () => {
  for (const p of previewReady) {
    const pages = sheets(read(p));
    pages.slice(1).forEach((sheet, i) => {
      assert.match(sheet, /sheet-head/, `${p.id} page ${i + 2} has no running head`);
      assert.ok(sheet.includes(p.sku), `${p.id} page ${i + 2} does not carry the SKU`);
      assert.ok(sheet.includes(`Page ${i + 2} of ${p.pages}`), `${p.id} page ${i + 2} is misnumbered`);
      assert.match(sheet, /data-serial/, `${p.id} page ${i + 2} carries no serial`);
    });
  }
});

test('every packet carries a cover with SKU, item id and serial', () => {
  for (const p of previewReady) {
    const cover = sheets(read(p))[0];
    assert.match(cover, /^ cover"/, `${p.id} first page is not a cover`);
    assert.ok(cover.includes(p.sku) && cover.includes(p.id), `${p.id} cover is not identified`);
    assert.match(cover, /data-serial/, `${p.id} cover carries no serial`);
  }
});

test('every packet carries a worked example, marked as fictional', () => {
  for (const p of previewReady) {
    const html = read(p);
    assert.match(html, /WORKED EXAMPLE · FICTIONAL/, `${p.id} has no marked worked example`);
    assert.match(html, /class="worked"/, `${p.id} example has no filled entries`);
  }
});

test('every packet has a fillable page whose fields are labelled and kept', () => {
  for (const p of previewReady) {
    const html = read(p);
    const keeps = html.match(/data-keep="/g) || [];
    assert.ok(keeps.length >= 10, `${p.id} has only ${keeps.length} fillable fields`);
    const inputs = html.match(/<(input|textarea|select)[^>]*>/g) || [];
    for (const el of inputs) {
      assert.ok(/aria-label=|id="f-/.test(el), `${p.id} has an unlabelled field: ${el}`);
    }
    assert.match(html, /id="printBtn"/, `${p.id} cannot be printed from the packet`);
  }
});

test('every packet states credits, provenance, rights, delivery and re-access', () => {
  for (const p of previewReady) {
    const text = textOf(read(p));
    for (const word of ['Credits', 'Provenance', 'Rights', 'Getting back in']) {
      assert.ok(text.includes(word), `${p.id} never states ${word}`);
    }
    assert.match(text, /Permanent\./, `${p.id} does not promise permanent re-access`);
  }
});

test('no packet ships a placeholder', () => {
  const banned = /\b(TBD|TODO|FIXME|lorem ipsum|XXXX|coming soon|placeholder)\b/i;
  for (const p of previewReady) {
    const text = textOf(read(p));
    assert.ok(!banned.test(text), `${p.id} still contains a placeholder`);
  }
});

test('every packet is self-contained: no external script, font or tracker', () => {
  for (const p of previewReady) {
    const html = read(p);
    assert.ok(!/src="https?:|href="https?:/.test(html), `${p.id} reaches outside the store`);
  }
});

test('every packet declares a mobile viewport and a language', () => {
  for (const p of previewReady) {
    const html = read(p);
    assert.match(html, /<html lang="en">/, `${p.id} has no language`);
    assert.match(html, /name="viewport"[^>]*width=device-width/, `${p.id} has no mobile viewport`);
  }
});

test('the packet grammar defines a print sheet and a mobile reflow', () => {
  const css = readFileSync(new URL('../store/packet.css', import.meta.url), 'utf8');
  assert.match(css, /@page\s*\{\s*size:\s*A4/, 'no A4 print sheet defined');
  assert.match(css, /@media \(max-width:840px\)/, 'no mobile reflow defined');
  assert.match(css, /\.no-print\{display:none !important\}/, 'screen chrome would print');
});
