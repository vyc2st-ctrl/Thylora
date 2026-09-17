// THY-NAME-RAELYNK-LOCK-001 — no-regression naming test.
//
// Canon: RaeLynk is the locked canonical name. Only explicit Chairman
// authorization may supersede it.
//
// This test fails if a user-facing surface displays a superseded variant of the
// platform name. It also fails in the opposite direction: if a technical
// identifier (route, slug, schema prefix, workroom id) has been cosmetically
// renamed, live references would break, so those are asserted to still exist.
//
// Allowed exception, per the canon: historical/provenance quotation and explicit
// technical-identifier explanation. Mark such a line with RAELYNK-ALIAS-OK.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');

// Superseded display forms. All contain a space or are a spaced/cased variant,
// so the hyphenated slug `rae-link`, the schema prefix `rael_` and the workroom
// id `WR-RAELINK-001` cannot match and are never flagged by this pattern.
const FORBIDDEN_DISPLAY = /RAE LINK|RAE Link|Rae Link|Ray Link|ray link/;

const CANONICAL = 'RaeLynk';
const EXEMPT_MARKER = 'RAELYNK-ALIAS-OK';

// User-facing surfaces: UI, navigation, headings, product cards, reports,
// documentation display text, seed/demo data, generated prompts.
const SCAN_EXTS = new Set(['.html', '.md', '.js', '.mjs', '.json', '.css', '.webmanifest', '.sql', '.yml']);
const SKIP_DIRS = new Set(['.git', 'node_modules']);

// This test file necessarily contains the forbidden strings in order to detect them.
const SELF = 'tests/naming.test.mjs';

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (SCAN_EXTS.has(extname(entry))) out.push(full);
  }
  return out;
}

function offendingLines() {
  const hits = [];
  for (const file of walk(ROOT)) {
    const rel = file.slice(ROOT.length + 1);
    if (rel === SELF) continue;
    let text;
    try { text = readFileSync(file, 'utf8'); } catch { continue; }
    if (!FORBIDDEN_DISPLAY.test(text)) continue;
    text.split('\n').forEach((line, i) => {
      if (!FORBIDDEN_DISPLAY.test(line)) return;
      if (line.includes(EXEMPT_MARKER)) return;
      hits.push(`${rel}:${i + 1}: ${line.trim().slice(0, 140)}`);
    });
  }
  return hits;
}

test('no user-facing surface displays a superseded name variant', () => {
  const hits = offendingLines();
  assert.deepEqual(
    hits, [],
    `Superseded platform name found on a user-facing surface.\n` +
    `Canonical display name is "${CANONICAL}" (THY-NAME-RAELYNK-LOCK-001).\n` +
    `If a line is a historical quotation or an explicit technical-identifier\n` +
    `explanation, mark it with ${EXEMPT_MARKER}.\n\n` +
    hits.join('\n'),
  );
});

test('canonical name is present on the primary user-facing surfaces', () => {
  const surfaces = [
    ['rae-link/index.html', 'platform UI: title, heading and navigation'],
    ['public-site/index.html', 'public site navigation and product card'],
    ['app/index.html', 'member app navigation'],
    ['package.json', 'repository description'],
  ];
  for (const [rel, what] of surfaces) {
    const text = readFileSync(join(ROOT, rel), 'utf8');
    assert.ok(text.includes(CANONICAL), `${rel} (${what}) must display "${CANONICAL}"`);
  }
});

test('platform UI heading and document title are canonical', () => {
  const html = readFileSync(join(ROOT, 'rae-link/index.html'), 'utf8');
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
  const h1 = html.match(/<h1>([^<]*)<\/h1>/)?.[1] ?? '';
  assert.ok(title.includes(CANONICAL), `<title> must display "${CANONICAL}", got: ${title}`);
  assert.equal(h1.trim(), CANONICAL, `<h1> must be exactly "${CANONICAL}", got: ${h1}`);
});

// The naming correction must not have cosmetically renamed technical internals.
// Breaking a live route or schema prefix to chase a display name is the failure
// mode this half of the test exists to catch.
test('technical identifiers are preserved, not cosmetically renamed', () => {
  const vercel = readFileSync(join(ROOT, 'vercel.json'), 'utf8');
  assert.ok(vercel.includes('/rae-link'), 'vercel.json must still route /rae-link — renaming it would break the live route');

  const publicSite = readFileSync(join(ROOT, 'public-site/index.html'), 'utf8');
  assert.ok(publicSite.includes('href="/rae-link"'), 'public site must still link the /rae-link route');

  const schema = readFileSync(join(ROOT, 'db/rae-link/0001_identity_channels.sql'), 'utf8');
  assert.ok(schema.includes('rael_'), 'the rael_ schema prefix must remain until a deliberate migration');

  const workroom = readFileSync(join(ROOT, 'db/rae-link/0010_registry_link.sql'), 'utf8');
  assert.ok(workroom.includes('WR-RAELINK-001'), 'the WR-RAELINK-001 workroom identifier must remain');
});
