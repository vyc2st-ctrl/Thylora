// Readback verification for THY-WORK-STORE-UTILITY-WAVE1-580.
// Every assertion here corresponds to a rule the pass was given. A claim in the
// workroom that is not checked by one of these tests is marked as unverified there.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const catalog = JSON.parse(read('store/catalog/wave1.json'));

const PRODUCTS = [
  { sku: 'THY-QYRIS-QUICKCHECK-001', dir: 'store/qyris-quickcheck', plates: 8, price: 3 },
  { sku: 'THY-STUCK-LOOP-RESET-001', dir: 'store/stuck-loop-reset', plates: 6, price: 5 },
  { sku: 'THY-BEFORE-YOU-BUY-001',   dir: 'store/before-you-buy',   plates: 8, price: 5 },
];

const artifactOf = (p) => read(`${p.dir}/index.html`);

// ---------------------------------------------------------------- catalogue --

test('catalogue leads with the three utility products, in order', () => {
  assert.equal(catalog.work_item, 'THY-WORK-STORE-UTILITY-WAVE1-580');
  const shelf = catalog.lead_shelf;
  assert.equal(shelf.length, 3);
  assert.deepEqual(shelf.map((p) => p.sku), PRODUCTS.map((p) => p.sku));
  shelf.forEach((p, i) => assert.equal(p.position, i + 1));
});

test('no story or world title appears on the lead shelf', () => {
  const story = ['bramble', 'city power', 'last match', 'handoff'];
  const shelfText = JSON.stringify(catalog.lead_shelf).toLowerCase();
  for (const name of story) assert.ok(!shelfText.includes(name), `${name} is on the lead shelf`);
});

test('story and world titles are moved, not deleted or rebuilt', () => {
  const items = catalog.story_world_inventory.items;
  assert.equal(items.length, 4);
  for (const item of items) {
    assert.equal(item.disposition, 'story/world inventory');
    assert.equal(item.history_preserved, true);
    assert.equal(item.deleted, false);
    assert.equal(item.rebuilt_this_pass, false);
  }
});

test('every price is proposed and none is locked', () => {
  for (const p of PRODUCTS) {
    const entry = catalog.lead_shelf.find((e) => e.sku === p.sku);
    assert.equal(entry.price_proposal.amount, p.price);
    assert.equal(entry.price_proposal.locked, false, `${p.sku} price is locked`);
  }
  assert.match(catalog.price_state, /NOT LOCKED/);
});

test('final release is withheld and nothing is published', () => {
  const gate = catalog.release_gate.rows.find((r) => r.gate === 'final_release');
  assert.match(gate.state, /^OPEN/);
  assert.match(catalog.release_state, /not published/i);
});

test('quality gate: every prohibition false, every requirement true', () => {
  const q = catalog.quality_gate;
  for (const key of ['plain_white_paper', 'generic_worksheet', 'text_dumped_on_pages',
                     'ai_looking_filler', 'fake_testimonials', 'stock_motivational_language']) {
    assert.equal(q[key], false, `prohibition ${key} is not held`);
  }
  for (const key of ['authored_voice', 'designed_page_system', 'illustration_diagram_plan',
                     'real_examples', 'clear_use_case', 'serial', 'provenance', 'publisher',
                     'editor_designer_fields', 'rights', 'delivery', 'mobile_readability',
                     'customer_value']) {
    assert.equal(q[key], true, `requirement ${key} is missing`);
  }
});

test('every catalogue entry carries the full required record', () => {
  const required = ['sku', 'title', 'customer_job', 'artifact', 'cover', 'serial',
                    'provenance', 'publisher', 'editor', 'designer', 'rights',
                    'delivery', 'mobile', 'store_copy', 'customer_value',
                    'refund_fit', 'price_proposal'];
  for (const entry of catalog.lead_shelf) {
    for (const field of required) {
      assert.ok(entry[field] !== undefined && entry[field] !== '',
        `${entry.sku} is missing ${field}`);
    }
    assert.ok(entry.cover.alt_text.length > 40, `${entry.sku} alt text is too thin`);
  }
});

// ----------------------------------------------------------------- artifacts --

test('each artifact exists with the plate count the catalogue claims', () => {
  for (const p of PRODUCTS) {
    assert.ok(existsSync(join(ROOT, p.dir, 'index.html')), `${p.sku} artifact missing`);
    const html = artifactOf(p);
    const plates = html.match(/data-plate="PLATE \d+ \/ \d+"/g) || [];
    assert.equal(plates.length, p.plates, `${p.sku} has ${plates.length} plates`);
    const entry = catalog.lead_shelf.find((e) => e.sku === p.sku);
    assert.equal(entry.artifact.plates, p.plates);
    assert.equal(entry.artifact.plate_map.length, p.plates);
    // Plates are numbered 1..n against the same total.
    p.plates && plates.forEach((tag, i) => {
      assert.equal(tag, `data-plate="PLATE ${i + 1} / ${p.plates}"`);
    });
  }
});

test('each artifact is fillable and reusable', () => {
  for (const p of PRODUCTS) {
    const html = artifactOf(p);
    const fills = html.match(/data-fill="/g) || [];
    assert.ok(fills.length >= 12, `${p.sku} has only ${fills.length} fillable fields`);
    for (const action of ['save', 'clear', 'print']) {
      assert.ok(html.includes(`data-action="${action}"`), `${p.sku} has no ${action} control`);
    }
    assert.ok(html.includes('../lib/fillable.js'));
  }
});

test('each artifact carries a complete colophon', () => {
  for (const p of PRODUCTS) {
    const html = artifactOf(p);
    assert.ok(html.includes('class="colophon"'), `${p.sku} has no colophon`);
    for (const field of ['Serial', 'Publisher', 'Editor', 'Designer', 'Rights', 'Delivery']) {
      assert.ok(html.includes(`<dt>${field}</dt>`), `${p.sku} colophon is missing ${field}`);
    }
    assert.ok(html.includes(p.sku), `${p.sku} serial root is not printed in the artifact`);
  }
});

test('each artifact carries a worked example and a diagram, not a text dump', () => {
  for (const p of PRODUCTS) {
    const html = artifactOf(p);
    assert.ok(/WORKED EXAMPLE/.test(html), `${p.sku} has no worked example`);
    const svg = html.match(/<svg /g) || [];
    assert.ok(svg.length >= 1, `${p.sku} has no diagram`);
    assert.ok(/role="img"/.test(html) && /aria-label=/.test(html),
      `${p.sku} has a diagram with no described alternative`);
  }
});

test('registers are PLAIN, EVERYDAY, TECHNICAL — never CHILD, ADULT or SCHOLAR', () => {
  for (const p of PRODUCTS) {
    const html = artifactOf(p);
    for (const banned of ['CHILD', 'ADULT', 'SCHOLAR']) {
      assert.ok(!new RegExp(`class="tag">\\s*${banned}`, 'i').test(html),
        `${p.sku} uses the ${banned} register`);
    }
  }
  assert.deepEqual(catalog.design_system.registers, ['PLAIN', 'EVERYDAY', 'TECHNICAL']);
  assert.deepEqual(catalog.design_system.forbidden_registers, ['CHILD', 'ADULT', 'SCHOLAR']);
});

test('no testimonial is presented anywhere in the shelf', () => {
  const surfaces = [...PRODUCTS.map(artifactOf), read('store/index.html')];
  for (const html of surfaces) {
    for (const marker of [/testimonial/i, /\bverified buyer\b/i, /★|⭐/, /\bcustomers? (?:say|love)\b/i]) {
      assert.ok(!marker.test(html), `a testimonial marker (${marker}) appears on a surface`);
    }
  }
});

test('the fictional purchase example is declared fictional, and names no real product', () => {
  const html = artifactOf(PRODUCTS[2]);
  assert.ok(/This example is invented\./.test(html));
  assert.ok(/fictional/i.test(html));
  assert.ok(/No current commercial product is evaluated/i.test(html));
});

// ------------------------------------------------------------------- surface --

test('the preview surface renders no purchase path', () => {
  const html = read('store/index.html');
  for (const marker of [/\bbuy now\b/i, /add to cart/i, /\bcheckout\b/i, /<form/i]) {
    assert.ok(!marker.test(html), `the preview page exposes a purchase path (${marker})`);
  }
  assert.ok(/NOT PUBLISHED/.test(html));
});

test('covers exist, are valid single-root SVG, and carry their own described text', () => {
  for (const p of PRODUCTS) {
    const entry = catalog.lead_shelf.find((e) => e.sku === p.sku);
    const svg = read(entry.cover.path);
    assert.ok(svg.trimStart().startsWith('<svg'), `${p.sku} cover is not an svg`);
    assert.ok(/<title id=/.test(svg) && /<desc id=/.test(svg),
      `${p.sku} cover has no title and description`);
    assert.ok(svg.includes(p.sku), `${p.sku} cover does not print its serial root`);
  }
});

test('the preview surface reuses each cover with the catalogue alt text', () => {
  const html = read('store/index.html');
  for (const entry of catalog.lead_shelf) {
    assert.ok(html.includes(entry.cover.alt_text),
      `${entry.sku} alt text on the shelf does not match the catalogue`);
  }
});

// -------------------------------------------------------------------- mobile --

test('the page system is single column on a phone and never scrolls sideways', () => {
  const css = read('store/design/product-system.css');
  assert.ok(/@media \(max-width:760px\)/.test(css));
  assert.ok(/\.field-grid,\.colophon dl\{grid-template-columns:1fr\}/.test(css));
  assert.ok(/white-space:pre-wrap;word-break:break-word/.test(css),
    'the escalation script would scroll sideways on a phone');
  assert.ok(/figure\.diagram svg\{display:block;width:100%;height:auto\}/.test(css),
    'diagrams are not fluid');
  for (const p of PRODUCTS) {
    const entry = catalog.lead_shelf.find((e) => e.sku === p.sku);
    assert.equal(entry.mobile.horizontal_scroll, false);
    assert.equal(entry.mobile.single_column_below, '760px');
  }
});

test('the page system prints one plate per sheet', () => {
  const css = read('store/design/product-system.css');
  assert.ok(/@media print/.test(css));
  assert.ok(/break-after:page;page-break-after:always/.test(css));
  assert.ok(/\.tps-bar,\.no-print[^}]*\{display:none!important\}/.test(css),
    'screen chrome would print');
});

test('a product page makes no network call and survives blocked storage', () => {
  for (const p of PRODUCTS) {
    const html = artifactOf(p);
    assert.ok(!/https?:\/\//.test(html.replace(/xmlns="[^"]*"/g, '')),
      `${p.sku} references an external URL`);
    assert.ok(!/fetch\(|XMLHttpRequest|navigator\.sendBeacon/.test(html));
  }
  const js = read('store/lib/fillable.js');
  const reads = js.match(/localStorage\.(getItem|setItem|removeItem)/g) || [];
  assert.equal(reads.length, 3, 'unexpected storage surface');
  // Each storage access sits inside its own try/catch.
  for (const fn of ['safeRead', 'safeWrite', 'safeClear']) {
    const body = js.slice(js.indexOf(`function ${fn}`), js.indexOf(`function ${fn}`) + 400);
    assert.ok(/try \{/.test(body) && /catch \(e\)/.test(body), `${fn} is unguarded`);
  }
  assert.ok(!/fetch\(|XMLHttpRequest|sendBeacon/.test(js), 'the fill library talks to a server');
});

// -------------------------------------------------------------- delivery spine --

test('delivery reuses the existing spine and builds no commerce infrastructure', () => {
  for (const entry of catalog.lead_shelf) {
    assert.equal(entry.delivery.new_infrastructure_built, false);
    assert.match(entry.delivery.spine, /[Ee]xisting protected digital-delivery spine/);
    assert.ok(entry.delivery.re_access.length > 0, `${entry.sku} has no re-access statement`);
  }
  const sql = read('db/store-wave1/0011_store_wave1.sql');
  assert.ok(/thy_store_no_new_commerce_infrastructure/.test(sql),
    'the no-new-infrastructure rule is not enforced in the schema');
});

// ------------------------------------------------------------- non-destructive --

test('neither migration destroys existing state', () => {
  for (const file of ['db/store-wave1/0011_store_wave1.sql',
                      'db/store-wave1/0012_castle_time_traversal.sql']) {
    // Strip line comments first: the rules are stated in prose at the top of each
    // file, and naming a forbidden verb is not performing it.
    const sql = read(file).replace(/^\s*--.*$/gm, '');
    for (const destructive of [/\bDROP\s+TABLE\b/i, /\bDROP\s+SCHEMA\b/i,
                               /\bTRUNCATE\b/i, /\bDELETE\s+FROM\b/i,
                               /\bALTER\s+TABLE\b[^;]*\bDROP\b/i]) {
      assert.ok(!destructive.test(sql), `${file} contains ${destructive}`);
    }
  }
});

test('castle era layers are append-only and cannot be overwritten', () => {
  const sql = read('db/store-wave1/0012_castle_time_traversal.sql');
  assert.ok(/ERA_LAYER_IS_APPEND_ONLY/.test(sql));
  assert.ok(/BEFORE UPDATE OR DELETE ON thy_castle\.era_layer/.test(sql));
  assert.ok(/castle_id\s+text PRIMARY KEY/.test(sql), 'the castle id is not stable');
  for (const aspect of ['geometry', 'room_use', 'occupants', 'family_connection', 'objects',
                        'repairs', 'supplier_relationships', 'paintings', 'furniture', 'staff']) {
    assert.ok(sql.includes(`'${aspect}'`), `era traversal cannot load ${aspect}`);
  }
});

test('the castle naming gate refuses fabrication and refuses the forbidden name', () => {
  const sql = read('db/store-wave1/0012_castle_time_traversal.sql');
  // A candidate cannot exist without a language source row.
  assert.ok(/source_id\s+bigint NOT NULL REFERENCES thy_castle\.language_source/.test(sql));
  // Every required naming field must be non-empty.
  for (const field of ['root_word', 'meaning', 'pronunciation', 'historical_use',
                       'provenance', 'compound_construction', 'final_candidate']) {
    assert.ok(new RegExp(`${field}\\s+text NOT NULL`).test(sql), `${field} is optional`);
  }
  assert.ok(/thy_castle_forbidden_name/.test(sql));
  assert.ok(/<> 'PEETE CASTLE'/.test(sql));
  // The external reference corpus can never supply a name.
  assert.ok(/classification = 'ERC'/.test(sql));
  assert.ok(/thy_castle_erc_never_names CHECK \(usable_for_naming = false\)/.test(sql));
});

test('the forbidden castle name appears nowhere except as a refusal', () => {
  const surfaces = {
    'store/index.html': read('store/index.html'),
    'store/catalog/wave1.json': read('store/catalog/wave1.json'),
    ...Object.fromEntries(PRODUCTS.map((p) => [p.dir, artifactOf(p)])),
  };
  for (const [name, text] of Object.entries(surfaces)) {
    assert.ok(!/PEETE CASTLE/i.test(text), `the forbidden name appears in ${name}`);
  }
});

test('the naming blocker is recorded as data, and starts blocked', () => {
  const sql = read('db/store-wave1/0012_castle_time_traversal.sql');
  for (const dep of ['land_record', 'regional_history', 'language_record', 'people_record',
                     'old_place_forms', 'castle_chronology', 'mirror_registry',
                     'community_permission']) {
    assert.ok(sql.includes(`'${dep}'`), `dependency ${dep} is not tracked`);
  }
  assert.ok(/naming_unblocked/.test(sql));
  const seeded = sql.slice(sql.indexOf('INSERT INTO thy_castle.name_dependency'));
  const rows = seeded.slice(0, seeded.indexOf('ON CONFLICT'));
  assert.equal((rows.match(/'MISSING'/g) || []).length, 8,
    'a dependency is claimed present without a record behind it');
});
