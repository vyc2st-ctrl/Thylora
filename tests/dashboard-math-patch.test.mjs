// THY-WORK-MATH-FAMOUS-THOUGHT-559 · dashboard patch guards
//
// The patch is additive by construction. These tests hold it to that, and to
// the no-go list in section 11 of the work order.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const patchJs  = readFileSync(new URL('../math-thought/patch/dashboard-math-thought.js', import.meta.url), 'utf8');
const patchCss = readFileSync(new URL('../math-thought/patch/dashboard-math-thought.css', import.meta.url), 'utf8');
const dashboard = readFileSync(new URL('../dashboard-current-head.html', import.meta.url), 'utf8');
const baseline = JSON.parse(readFileSync(new URL('../dashboard-baseline.json', import.meta.url), 'utf8'));

test('the patch is present in the current head exactly once', () => {
  assert.equal(dashboard.split('id="thy-math-thought-style"').length - 1, 1);
  assert.equal(dashboard.split('id="thy-math-thought-script"').length - 1, 1);
  assert.ok(dashboard.trimEnd().endsWith('</body></html>'));
});

test('the patch removes no baseline capability', () => {
  // Note: this repository's copy of the head already lacks seven baseline
  // capabilities, because DASHBOARD_AUTHORITY.md places the live head in
  // vyc2st-ctrl/thylora-executive-dashboard. That is a pre-existing gap, not
  // something this patch may widen — so the test compares the file with and
  // without the injected block rather than against the baseline alone.
  const withoutPatch = dashboard.replace(
    /\n<!-- THY-WORK-MATH-FAMOUS-THOUGHT-559[\s\S]*?<\/script>\n/, '\n');
  assert.ok(withoutPatch.length < dashboard.length, 'the injected block was located');
  for (const capability of baseline.required_capabilities) {
    assert.equal(dashboard.includes(capability), withoutPatch.includes(capability),
      `patch changed the presence of baseline capability: ${capability}`);
  }
  assert.equal(withoutPatch.includes('thy-math-thought'), false);
});

test('the patch adds no top-level app and no navigation entry', () => {
  // It may read these ids, but it must never write into the drawer or nav.
  for (const nav of ['quickNav', 'moduleNav', 'drawerDepartments', 'section-title']) {
    assert.equal(new RegExp(`${nav}[^\\n]*innerHTML\\s*=`).test(patchJs), false,
      `patch writes into ${nav}`);
  }
  assert.equal(/document\.body\.innerHTML/.test(patchJs), false);
  assert.ok(patchJs.includes('host.appendChild(panel)'), 'the patch appends into an existing surface');
});

test('the prohibited reading levels are absent; the three required ones are present', () => {
  assert.equal(/\b(child|adult|scholar)\b/i.test(patchJs + patchCss), false);
  for (const level of ['PLAIN', 'EVERYDAY', 'TECHNICAL']) assert.ok(patchJs.includes(level));
});

test('the patch renders no images and generates none', () => {
  assert.equal(/<img|createElement\(['"]img|background-image|url\(http/i.test(patchJs + patchCss), false);
});

test('the patch ships no quotation text of its own', () => {
  // It renders row.verified_quote from the registry and nothing else. No quote
  // literal may be embedded here, and none may be shown on a failed gate.
  assert.ok(patchJs.includes("verdict === 'PASS' && row.verified_quote"),
    'a quotation is shown only on a passing gate');
  const named = /(douglass|carver|washington|ford)[^\n]*['"][^'"\n]{25,}['"]/i;
  assert.equal(named.test(patchJs), false, 'no quotation literal may be embedded in the patch');
});

test('every unsupplied field renders as UNKNOWN_DEFINITION', () => {
  assert.ok(patchJs.includes("const UNKNOWN = 'UNKNOWN_DEFINITION'"));
  assert.ok(patchJs.includes('orUnknown'));
  assert.equal(/\|\|\s*['"]n\/a['"]/i.test(patchJs), false, 'no soft default may stand in for an unknown');
});

test('the four display parts the work order names are all rendered', () => {
  for (const part of ['ACTIVE EQUATIONS', "TODAY'S EQUATION", 'REAL-LIFE EXAMPLE', 'Variable']) {
    assert.ok(patchJs.includes(part), `missing display part: ${part}`);
  }
  for (const field of ['Person', 'Verified quote', 'Source', 'Date / context',
                       'Next question', 'Math connection', 'Transfer question', 'Pass / fail']) {
    assert.ok(patchJs.includes(field), `missing famous-thought field: ${field}`);
  }
});
