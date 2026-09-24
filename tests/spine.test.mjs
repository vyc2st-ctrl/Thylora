import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { run, flatten, qyris, buildContext, detectGates, truthClass, personnelNote, storeProximity, LANES } from '../spine/lib/qyris.mjs';

const fixture = {
  captured_at: '2026-09-24T00:00:00Z',
  idea: [
    { id: 'I-1', title: 'EdereAirah harbour staff roster', state: 'DESIGN_ACTIVE', truth: 'EDEREAIRAH_CANON', blocker: '', next: 'Draft roster', updated: '2026-09-23T00:00:00Z' },
    { id: 'I-2', title: 'Retired idea', state: 'RETIRED', truth: 'EARTH_PROPOSED' },
  ],
  revenue: [
    { id: 'R-1', idea: 'I-1', product: 'NOPE', title: 'Path', state: 'NOT_LIVE', next: 'Chairman reviews rendered interior preview and returns RELEASE / REVISE / HOLD.', updated: '2026-08-01T00:00:00Z' },
  ],
  store: [
    { id: 'S-1', ext: 'gid://1', title: 'Live', state: 'ACTIVE', active: true, src: true, art: true, vis: true, rights: true, delivery: true, reaccess: true, checkout: true, mobile: true },
    { id: 'S-2', ext: 'gid://2', title: 'Draft', state: 'DRAFT', active: false, src: true, art: true, vis: true, rights: true, delivery: true, reaccess: false, checkout: false, mobile: false, blockers: '[]' },
  ],
};

test('terminal and live-selling items are excluded from open work', () => {
  const ids = flatten(fixture).map(i => i.id);
  assert.ok(!ids.includes('I-2'));
  assert.ok(!ids.includes('S-1'));
  assert.deepEqual(ids.sort(), ['I-1', 'R-1', 'S-2']);
});

test('every open item gets a complete advancement record', () => {
  const r = run(fixture);
  for (const rec of r.records) {
    for (const k of ['baseline', 'delta', 'affected_dependents', 'evidence', 'blocker', 'next_executable_action',
      'revenue_consequence', 'store_consequence', 'production_consequence', 'security_consequence']) {
      assert.ok(k in rec.record, `${rec.id} missing ${k}`);
    }
    for (const k of ['question', 'yield', 'reason', 'inspect', 'safeguard', 'act', 'transfer']) assert.ok(k in rec.qyris);
  }
});

test('gated items route to the Chairman and are never acted on', () => {
  const r = run(fixture);
  const rev = r.records.find(x => x.id === 'R-1');
  assert.ok(rev.gates.includes('CHAIRMAN_DECISION') || rev.gates.includes('PUBLIC_RELEASE'));
  assert.match(rev.record.next_executable_action, /^CHAIRMAN GATE/);
  for (const rec of r.records) assert.match(rec.qyris.act, /No backend, store, payment or outreach action/);
});

test('payment, legal, identity and outreach language trips gates', () => {
  assert.ok(detectGates({ blocker: 'needs Stripe checkout' }).includes('PAYMENT'));
  assert.ok(detectGates({ next: 'creator agreement legal review' }).includes('LEGAL'));
  assert.ok(detectGates({ blocker: 'recipient verification', next: 'identity verification' }).includes('IDENTITY'));
  assert.ok(detectGates({ next: 'external customer outreach' }).includes('OUTREACH'));
  assert.deepEqual(detectGates({ next: 'write unit tests' }), []);
});

test('simulated world personnel are never presented as Earth-licensed', () => {
  const it = fixture.idea[0];
  assert.equal(truthClass(it), 'SIMULATED_WORLD');
  assert.match(personnelNote(it), /not Earth-licensed/);
  assert.match(personnelNote({ title: 'Clinic physician network', truth: 'EARTH_PROPOSED' }), /verified real licence/);
});

test('findings flag orphan refs, staleness and undeclared blockers', () => {
  const r = run(fixture);
  const rev = r.records.find(x => x.id === 'R-1');
  assert.ok(rev.findings.includes('ORPHAN_PRODUCT_REF'));
  const uuidPath = { ...fixture, revenue: [{ id: 'R-2', product: 'baa45e29-c71f-4650-9b3c-388b202f3eec', state: 'NOT_LIVE' }, { id: 'R-3', state: 'NOT_LIVE' }] };
  const u = run(uuidPath);
  assert.ok(!u.records.find(x => x.id === 'R-2').findings.includes('ORPHAN_PRODUCT_REF'), 'uuid FK is not judged without uuids');
  assert.ok(u.records.find(x => x.id === 'R-3').findings.includes('REVENUE_PATH_NO_PRODUCT'));
  assert.ok(rev.findings.includes('STALE_OVER_14_DAYS'));
  assert.ok(r.records.find(x => x.id === 'I-1').findings.includes('BLOCKER_UNDECLARED'));
});

test('shared clusters group items so one action moves many', () => {
  const r = run(fixture);
  assert.ok(r.clusters.CHECKOUT_REACCESS_WITNESS.includes('S-2'));
  assert.ok(r.clusters.CHAIRMAN_RELEASE_REVIEW.includes('R-1'));
});

test('store proximity counts passed release gates', () => {
  assert.deepEqual(storeProximity(fixture.store[1]), { passed: 5, of: 8, missing: ['reaccess', 'checkout', 'mobile'] });
});

test('lanes cover the ten required advancement lanes', () => {
  assert.equal(LANES.length, 10);
  const r = run(fixture);
  assert.deepEqual(Object.keys(r.lanes), LANES);
});

const SNAP = new URL('../spine/private/snapshots/backend-open-items-20260924.json', import.meta.url);
test('local 2026-09-24 backend snapshot runs end to end', { skip: !existsSync(SNAP) && 'snapshot is local-only (public repo)' }, () => {
  const snap = JSON.parse(readFileSync(SNAP));
  const r = run(snap);
  assert.ok(r.total > 1000);
  assert.equal(r.records.length, new Set(r.records.map(x => `${x.registry}:${x.id}`)).size);
  assert.ok(r.moneyNearest[0].passed >= r.moneyNearest.at(-1).passed);
});
