// CONVEYOR · stage machine, gates, pull-forward and money distance
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  STAGES, AUTHORITY, MONEY_STAGE, nextStage, canTransition, stageGate,
  nextExecutableAction, actionsRemaining, moneyDistance, advance, pullForwardWork
} from '../conveyor/lib/stages.js';

const base = {
  canonical_id: 'CONV-TST-0001', title: 'Test item', source_parent: 'Test parent',
  lane: 'SHOWS_VIDEO', item_kind: 'EPISODIC_SERIES', world_class: 'WORLD_SIMULATED',
  owner_department: 'TEST', responsible_person: 'Named Person', stage: 'CAPTURE'
};

const complete = {
  ...base, stage: 'RELEASE', artifact_ref: 'a', evidence_ref: 'e', product_ref: 'p',
  rights_state: 'CLEARED', provenance_state: 'RECORDED', serial_state: 'ISSUED',
  qr_state: 'BOUND', cost_state: 'KNOWN', price_state: 'SET', storefront_state: 'LISTED',
  checkout_path_state: 'VERIFIED', release_evidence_ref: 'r', readback_state: 'CONFIRMED'
};

test('the conveyor has all eleven directed stages in order', () => {
  assert.deepEqual(STAGES, ['CAPTURE','CLASSIFY','ASSIGN','PRODUCE','VERIFY','PRODUCTIZE','PRICE','STORE','RELEASE','MEASURE','IMPROVE']);
});

test('IMPROVE returns to PRODUCE so a shipped item keeps advancing', () => {
  assert.equal(nextStage('IMPROVE'), 'PRODUCE');
  assert.ok(canTransition('IMPROVE', 'PRODUCE'));
});

test('stages cannot be skipped', () => {
  assert.equal(canTransition('CAPTURE', 'PRODUCE'), false);
  assert.equal(canTransition('ASSIGN', 'STORE'), false);
});

test('the gate reports every unmet requirement at once, each naming its route', () => {
  const gate = stageGate({ stage: 'PRODUCTIZE' });
  assert.equal(gate.ready, false);
  const codes = gate.blockers.map(b => b.code);
  assert.deepEqual(codes.sort(), ['PRODUCT_RECORD_MISSING','QR_NOT_BOUND','SERIAL_NOT_ISSUED']);
  assert.ok(gate.blockers.every(b => b.route), 'every blocker names a route');
  assert.ok(gate.blockers.every(b => b.authority), 'every blocker names an authority');
});

test('an item cannot be advanced by asserting that it advanced', () => {
  const result = advance({ ...base, stage: 'PRODUCE' });
  assert.equal(result.advanced, false);
  assert.equal(result.reason, 'GATE_UNMET');
  assert.equal(result.item.stage, 'PRODUCE', 'the item did not move');
});

test('a met gate advances and stamps the advancement time', () => {
  const result = advance({ ...complete, stage: 'MEASURE', measurement_ref: 'm' }, '2026-09-16T00:00:00Z');
  assert.equal(result.advanced, true);
  assert.equal(result.item.stage, 'IMPROVE');
  assert.equal(result.item.last_advanced_at, '2026-09-16T00:00:00Z');
});

test('completing the improvement loop increments the version rather than overwriting', () => {
  const result = advance({ ...complete, stage: 'IMPROVE', improvement_ref: 'i', version_no: 4 });
  assert.equal(result.advanced, true);
  assert.equal(result.item.stage, 'PRODUCE');
  assert.equal(result.item.version_no, 5);
});

test('money distance reaches zero only when a sellable unit actually exists', () => {
  assert.equal(moneyDistance(complete).distance, 0);
  assert.equal(moneyDistance(complete).reached, true);
  assert.ok(moneyDistance(base).distance > 0);
});

test('money distance names how many of the remaining actions are not ours to take', () => {
  const md = moneyDistance({ ...complete, stage: 'STORE', checkout_path_state: 'UNVERIFIED', release_evidence_ref: null, readback_state: null });
  assert.equal(md.chairman_gates, 1, 'the unverified checkout path is the Chairman gate');
  assert.equal(md.distance, 3, 'checkout path, release evidence and readback');
});

test('money distance is measured to RELEASE, not to a product record', () => {
  assert.equal(MONEY_STAGE, 'RELEASE');
  const productized = { ...complete, stage: 'PRODUCTIZE', storefront_state: 'ABSENT', checkout_path_state: 'UNVERIFIED', release_evidence_ref: null, readback_state: null };
  assert.ok(moneyDistance(productized).distance > 0, 'a product record with no purchase path has not reached money');
});

test('actions remaining counts this stage plus every stage between here and money', () => {
  assert.equal(actionsRemaining(complete), 0);
  assert.ok(actionsRemaining(base) >= STAGES.indexOf('RELEASE'));
});

test('naming an in-world person is a Chairman act, not a build step', () => {
  const gate = stageGate({ ...base, stage: 'ASSIGN', responsible_person: null });
  const blocker = gate.blockers.find(b => b.code === 'RESPONSIBLE_PERSON_MISSING');
  assert.equal(blocker.authority, AUTHORITY.CHAIRMAN, 'continuity forbids inventing assigned staff');
});

test('the build may fill the role when the item says so', () => {
  const gate = stageGate({ ...base, stage: 'ASSIGN', responsible_person: null, person_authority: 'BUILD' });
  assert.equal(gate.blockers.find(b => b.code === 'RESPONSIBLE_PERSON_MISSING').authority, AUTHORITY.BUILD);
});

test('a Chairman gate at the current stage does not idle the item', () => {
  const parked = { ...base, stage: 'ASSIGN', responsible_person: null };
  const next = nextExecutableAction(parked);
  assert.equal(next.blocked, false);
  assert.equal(next.authority, AUTHORITY.BUILD);
  assert.equal(next.pulled_forward, true);
  assert.equal(next.for_stage, 'PRODUCE');
});

test('pull-forward never starts a Chairman action early', () => {
  const parked = { ...base, stage: 'ASSIGN', responsible_person: null };
  assert.ok(pullForwardWork(parked).every(w => w.authority === AUTHORITY.BUILD));
});

test('an unconfirmed source record stops everything downstream', () => {
  const unverified = { ...base, stage: 'CAPTURE', continuity_state: 'UNVERIFIED_IN_REPO' };
  assert.deepEqual(pullForwardWork(unverified), [], 'producing for an unconfirmed record would be inventing it');
  const next = nextExecutableAction(unverified);
  assert.equal(next.blocked, true);
  assert.equal(next.code, 'CONTINUITY_UNVERIFIED');
  assert.equal(next.authority, AUTHORITY.CHAIRMAN);
});

test('rights held by the Chairman stop production from starting early', () => {
  const consent = { ...base, stage: 'ASSIGN', responsible_person: null, rights_state: 'FAMILY_CONSENT_REQUIRED', rights_authority: 'CHAIRMAN' };
  assert.deepEqual(pullForwardWork(consent), [], 'no adaptation work begins before consent');
  assert.equal(nextExecutableAction(consent).blocked, true);
});

test('a release cannot be claimed without evidence and a readback', () => {
  const noProof = { ...complete, release_evidence_ref: null, readback_state: null };
  const codes = stageGate(noProof).blockers.map(b => b.code);
  assert.ok(codes.includes('RELEASE_EVIDENCE_MISSING'));
  assert.ok(codes.includes('READBACK_MISSING'));
});

test('an unverified checkout path blocks the store stage and says no button may show', () => {
  const gate = stageGate({ ...complete, stage: 'STORE', checkout_path_state: 'UNVERIFIED' });
  const blocker = gate.blockers.find(b => b.code === 'CHECKOUT_PATH_UNVERIFIED');
  assert.equal(blocker.authority, AUTHORITY.CHAIRMAN);
  assert.match(blocker.detail, /no purchase button/);
});

test('an unknown stage is refused rather than guessed', () => {
  assert.throws(() => stageGate({ stage: 'SHIPPING' }), /Unknown conveyor stage/);
});
