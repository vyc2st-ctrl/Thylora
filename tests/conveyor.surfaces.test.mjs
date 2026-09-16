// CONVEYOR · verification evidence for the surfaces the conveyor carries
// Workroom: WR-CONVEYOR-001
//
// These surfaces are plain scripts, not modules, so they are verified by reading
// the shipped source: the element contract (every id the script writes to exists
// in the page it ships with) and the escaping boundary (backend text reaches
// innerHTML through an escaper). Both are the failure modes that actually break
// these pages: a renamed id blanks a panel silently, and an unescaped backend
// string is an injection into the member app.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

/**
 * Pull a named function out of a non-module script so it can be exercised.
 * Brace-matched rather than regex-terminated: these files put whole functions on
 * one line, and a lazy regex stops at the first closing brace it finds, which is
 * usually inside the function rather than at its end.
 */
function extractFunction(source, name) {
  const start = source.search(new RegExp(`function\\s+${name}\\s*\\(`));
  assert.ok(start >= 0, `${name} not found in the shipped source`);
  const open = source.indexOf('{', source.indexOf(')', start));
  let depth = 0;
  let end = -1;
  for (let i = open; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1;
    else if (source[i] === '}') { depth -= 1; if (depth === 0) { end = i + 1; break; } }
  }
  assert.ok(end > 0, `${name} is not brace-balanced in the shipped source`);
  return new Function(`${source.slice(start, end)}; return ${name};`)();
}

const SURFACES = [
  { id: 'CONV-GAM-0001', html: 'app/sports-betting.html', js: 'app/sports-betting.js', escaper: 'esc' },
  { id: 'CONV-GAM-0002', html: 'app/time-run.html', js: 'app/time-run.js', escaper: 'escapeHtml' }
];

for (const surface of SURFACES) {
  test(`${surface.id}: every element the script writes to exists in the page it ships with`, () => {
    const js = read(surface.js);
    const html = read(surface.html);
    const ids = [...js.matchAll(/getElementById\(['"]([^'"]+)['"]\)/g)].map(m => m[1]);
    assert.ok(ids.length > 0, 'the script writes to at least one element');
    // Ids the script creates itself, whether by assignment or inside an
    // innerHTML string it builds.
    const created = [
      ...[...js.matchAll(/\.id\s*=\s*['"]([^'"]+)['"]/g)].map(m => m[1]),
      ...[...js.matchAll(/id="([^"]+)"/g)].map(m => m[1])
    ];
    const inHtml = [...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]);
    for (const id of ids) {
      assert.ok(inHtml.includes(id) || created.includes(id),
        `${surface.js} writes to #${id}, which ${surface.html} does not contain and the script does not create`);
    }
  });

  test(`${surface.id}: backend text reaching innerHTML is escaped`, () => {
    const escape = extractFunction(read(surface.js), surface.escaper);
    const hostile = `<img src=x onerror="alert(1)">`;
    const escaped = escape(hostile);
    assert.ok(!escaped.includes('<img'), 'angle brackets survive escaping');
    assert.ok(!escaped.includes('"'), 'double quotes survive escaping');
    assert.equal(escape(`<>&'"`), '&lt;&gt;&amp;&#39;&quot;');
    assert.equal(escape(''), '');
    assert.equal(escape(undefined), '');
  });

  test(`${surface.id}: no third-party origin is contacted`, () => {
    const js = read(surface.js);
    const origins = [...js.matchAll(/https?:\/\/([^/'"`\s)]+)/g)].map(m => m[1]);
    for (const origin of new Set(origins)) {
      assert.match(origin, /jvsdxhrfhtlgaknhjxlz\.supabase\.co/,
        `${surface.js} contacts ${origin}, which is not the THYLORA backend`);
    }
  });
}

test('CONV-GAM-0001: the Earth-money prohibition is stated on the surface, not only in the workroom', () => {
  const html = read('app/sports-betting.html');
  assert.match(html, /Earth real-money wagering is not authorized/i);
  assert.match(html, /EdereAriah R-currency/i);
});

test('CONV-MEM-0001: the storefront makes no live-subscription claim', () => {
  const html = read('public-site/store.html');
  assert.match(html, /No false live-commerce claim|No unproven live-subscription claim/i);
  // A control, not the word. The page discusses checkout at length in its gate
  // notice; what must not exist is something a visitor can press to pay.
  const controls = [...html.matchAll(/<(?:button|a)\b[^>]*>([\s\S]*?)<\/(?:button|a)>/gi)].map(m => m[1]);
  for (const label of controls) {
    assert.doesNotMatch(label, /buy|subscribe|purchase|pay now|checkout/i,
      `the storefront offers a purchase control ("${label.trim()}") while the checkout path is unverified`);
  }
});

test('CONV-MEM-0001: every priced tier in the registry appears on the storefront', () => {
  const html = read('public-site/store.html');
  for (const price of ['3.99', '5.99', '7.99', '14.99']) {
    assert.ok(html.includes(price), `tier price ${price} recorded in the conveyor is not on the storefront`);
  }
});
