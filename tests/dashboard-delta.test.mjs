// THY-WORK-OMNIVIEW-ROUNDTRIP-587 — dashboard delta guard.
//
// The delta adds CONTEXT and SEQUENCE to the existing head. These tests exist to
// make "no new dashboard, nothing removed" a rule the repository enforces rather
// than a claim in a commit message.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const head = readFileSync('dashboard-current-head.html', 'utf8');
const baseline = JSON.parse(readFileSync('dashboard-baseline.json', 'utf8'));
const surface = readFileSync('app/omniview-surface.js', 'utf8');
const gap = JSON.parse(readFileSync('dashboard-baseline-gap.json', 'utf8'));

// The baseline floor is checked against a RECORDED shortfall, not against an
// assumption that the floor is met. A new removal fails here. Repairing one of
// the recorded gaps also fails here, which is the signal to shorten the list.
test('the baseline floor holds, and the known shortfall has not grown', () => {
  const missing = baseline.required_capabilities.filter((c) => !head.includes(c));
  assert.deepEqual(missing.slice().sort(), gap.missing_capabilities.slice().sort(),
    `the baseline shortfall changed. Update dashboard-baseline-gap.json if this was intended. `
    + `Now missing: ${missing.join(', ')}`);
});

test('the recorded shortfall names the baseline it is measured against', () => {
  assert.equal(gap.baseline_id, baseline.baseline_id);
  assert.ok(gap.unverified.length > 0, 'the gap record must say what could not be verified');
});

test('the current head still points at the backend of record', () => {
  assert.ok(head.includes(baseline.backend_project),
    'the dashboard no longer references the backend named in the baseline');
});

test('the delta adds CONTEXT and SEQUENCE without replacing the head', () => {
  assert.ok(head.includes('THYLORA Current Head'), 'the current head title was replaced');
  assert.ok(head.includes('thy-omniview-script'), 'the OMNIVIEW surface is not injected');
  assert.ok(head.includes('thyOmniOpenContext') && head.includes('thyOmniOpenSequence'),
    'CONTEXT and SEQUENCE entry points are missing');
  // The previously shipped deltas are untouched.
  assert.ok(head.includes('thy-spine-forward-script'), 'the SPINE FORWARD delta was dropped');
});

test('the injected copy is byte-identical to app/omniview-surface.js', () => {
  execFileSync(process.execPath, ['tools/inject-omniview.mjs', '--check'], { stdio: 'pipe' });
  const start = head.indexOf('<script id="thy-omniview-script">');
  const inlined = head.slice(start + '<script id="thy-omniview-script">\n'.length, head.indexOf('</script>', start));
  assert.equal(inlined, surface, 'the inlined surface has drifted from its source file');
});

test('the member app loads the same single source file', () => {
  const app = readFileSync('app/index.html', 'utf8');
  const tags = app.match(/id="thy-omniview-script"/g) || [];
  assert.equal(tags.length, 1, 'the app should load the OMNIVIEW surface exactly once');
  assert.ok(app.includes('src="./omniview-surface.js"'), 'the app does not load the surface source file');
});

test('the surface degrades instead of breaking when the pack is not applied', () => {
  assert.ok(surface.includes('NOT_APPLIED'), 'no not-applied state');
  assert.ok(surface.includes('db/omniview/'), 'the not-applied message does not name the apply path');
});

test('the delta does not claim deployment authority it does not hold', () => {
  const authority = readFileSync('DASHBOARD_AUTHORITY.md', 'utf8');
  assert.ok(authority.includes('vyc2st-ctrl/thylora-executive-dashboard'),
    'the authority record was changed by this delta');
});
