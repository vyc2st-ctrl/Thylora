// THYLORA product conveyor · pipeline tests
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RELEASE_GATES, actionsRemaining, exactBlocker, moneyBand, resolveStage } from '../pipeline/stages.mjs';
import { runConveyor, selectLanes, scoreCandidate, sharedBlockers } from '../pipeline/conveyor.mjs';

const allGates = (overrides = {}) => ({
  ...Object.fromEntries(RELEASE_GATES.map((k) => [k, true])),
  registered: true,
  sellable_intent: true,
  ...overrides,
});

const candidate = (id, gates, extra = {}) => ({
  canonical_id: id,
  title: id,
  parent_source: 'THY-IDEA-TEST',
  gates,
  ...extra,
});

test('a bare idea sits at IDEA and claims nothing further', () => {
  const stage = resolveStage({ registered: true });
  assert.equal(stage.code, 'IDEA');
});

test('a candidate cannot skip a rung by having a later gate incidentally set', () => {
  // Everything true except the rights/safety gate. Without rights it must fall
  // back to PRODUCT_SPEC, not sit at RELEASE_GATE on the strength of later flags.
  const stage = resolveStage(allGates({ rights_passed: false }));
  assert.equal(stage.code, 'PRODUCT_SPEC');
});

test('a fully evidenced candidate reaches PUBLISHED and nothing less does', () => {
  assert.equal(resolveStage(allGates()).code, 'PUBLISHED');
  assert.equal(resolveStage(allGates({ external_purchase_witnessed: false })).code, 'RELEASE_GATE');
});

test('money-distance counts unmet gates, not optimism', () => {
  assert.equal(actionsRemaining(allGates()), 0);
  assert.equal(actionsRemaining(allGates({ reaccess_verified: false })), 1);
  assert.equal(actionsRemaining({ registered: true }), RELEASE_GATES.length);
});

test('only a witnessed purchase earns the purchasable band', () => {
  assert.equal(moneyBand(0), 'PURCHASABLE_WITNESSED');
  assert.equal(moneyBand(1), 'ONE_ACTION_FROM_MONEY');
  assert.equal(moneyBand(12), 'FAR_FROM_MONEY');
});

test('the exact blocker is the first unmet gate in ladder order', () => {
  const gates = allGates({ rights_passed: false, mobile_preview_passed: false });
  assert.equal(exactBlocker(gates), 'rights_passed');
});

test('a blocked product does not stop the products behind it', () => {
  const rows = [
    // P1 is closest to money but held by an external customer — not executable.
    candidate('P1', allGates({ external_purchase_witnessed: false })),
    candidate('P2', allGates({ visual_preflight_passed: false, external_purchase_witnessed: false })),
    candidate('P3', allGates({ source_complete: false, external_purchase_witnessed: false })),
    candidate('P4', allGates({ spec_complete: false, external_purchase_witnessed: false })),
  ].map(scoreCandidate);

  const lanes = selectLanes(rows, 3);
  assert.equal(lanes.running.length, 3, 'three lanes must run while three executable candidates exist');
  assert.ok(lanes.held.some((r) => r.canonical_id === 'P1'), 'P1 is held, not running');
  assert.ok(!lanes.running.some((r) => r.canonical_id === 'P1'), 'a held product never consumes a lane');
  assert.equal(lanes.executable_supply, 3);
});

test('lane target is honest when the executable supply is genuinely short', () => {
  const rows = [candidate('P1', allGates({ external_purchase_witnessed: false }))].map(scoreCandidate);
  const lanes = selectLanes(rows, 3);
  assert.equal(lanes.running.length, 0);
  assert.equal(lanes.lane_target_met, false, 'a short supply of executable work is reported, not papered over');
  assert.equal(lanes.all_lanes_held, true, 'every lane held with work outstanding is the alarm condition');
});

test('a finished line reports its target met rather than raising a false alarm', () => {
  const rows = [candidate('DONE', allGates())].map(scoreCandidate);
  const lanes = selectLanes(rows, 3);
  assert.equal(lanes.unfinished_count, 0);
  assert.equal(lanes.lane_target_met, true);
  assert.equal(lanes.all_lanes_held, false);
});

test('a shared blocker is ranked by how many products it releases', () => {
  const rows = [
    candidate('A', allGates({ reaccess_verified: false, checkout_path_verified: false, external_purchase_witnessed: false })),
    candidate('B', allGates({ reaccess_verified: false, checkout_path_verified: false, external_purchase_witnessed: false })),
    candidate('C', allGates({ reaccess_verified: false, checkout_path_verified: false, external_purchase_witnessed: false })),
    candidate('D', allGates({ spec_complete: false, external_purchase_witnessed: false })),
  ].map(scoreCandidate);

  const leverage = sharedBlockers(rows);
  assert.equal(leverage[0].gate, 'reaccess_verified');
  assert.equal(leverage[0].unblocks_count, 3);
  assert.ok(!leverage.some((e) => e.gate === 'spec_complete'), 'a blocker holding one product is not leverage');
});

test('a conveyor pass reports every candidate, sorted by distance to money', () => {
  const result = runConveyor([
    candidate('FAR', { registered: true, sellable_intent: true }),
    candidate('NEAR', allGates({ external_purchase_witnessed: false })),
  ]);

  assert.equal(result.candidate_count, 2);
  assert.equal(result.candidates[0].canonical_id, 'NEAR');
  assert.equal(result.candidates[0].money_distance, 1);
  assert.equal(result.published_count, 0, 'nothing is called published without a witnessed purchase');
});

test('every gate is classified, so no blocker silently becomes an excuse', () => {
  const rows = RELEASE_GATES.map((gate) => scoreCandidate(candidate(gate, allGates({ [gate]: false }))));
  for (const row of rows) {
    assert.notEqual(row.blocker_class, 'UNCLASSIFIED', `${row.exact_blocker} has no gate class`);
  }
});
