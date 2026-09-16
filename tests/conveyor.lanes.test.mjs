// CONVEYOR · parallel lanes, the non-blocking property, and the registry contract
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LANE_KEYS, project, nextInLane, scheduleAllLanes, unaffectedBy, moneyNext, chairmanGates, laneSummary } from '../conveyor/lib/lanes.js';
import { loadRegistry, validateRegistry, board, REQUIRED_EXPOSED_FIELDS } from '../conveyor/lib/registry.js';
import { stageGate } from '../conveyor/lib/stages.js';

const registry = loadRegistry();
const items = registry.items;

test('every lane the directive names is maintained', () => {
  for (const lane of ['SHOWS_VIDEO','BOOKS_COMICS','EDUCATIONAL_SHEETS','GAMES','CLOTHING','SERIALIZED_COLLECTIBLES','HISTORY_HERBAL','ASK_ERSATZ','NEWSPAPERS_REPORTS','MEDIA_NETWORK']) {
    assert.ok(LANE_KEYS.includes(lane), `${lane} lane missing`);
    assert.ok(items.some(i => i.lane === lane), `${lane} lane has no captured item`);
  }
});

test('the committed registry is valid and every item exposes every required field', () => {
  const check = validateRegistry(registry);
  assert.equal(check.valid, true, JSON.stringify(check.problems, null, 2));
  for (const item of items) {
    const projected = project(item);
    for (const field of REQUIRED_EXPOSED_FIELDS) {
      assert.ok(field in projected, `${item.canonical_id} does not expose ${field}`);
    }
  }
});

test('canonical IDs are unique', () => {
  assert.equal(new Set(items.map(i => i.canonical_id)).size, items.length);
});

test('every captured item names the continuity record it came from', () => {
  for (const item of items) {
    assert.ok(item.source_parent, `${item.canonical_id} has no source_parent`);
    assert.ok(item.continuity_evidence, `${item.canonical_id} has no continuity evidence`);
  }
});

test('nothing claims to be verified in continuity without evidence', () => {
  for (const item of items) {
    if (item.continuity_state === 'VERIFIED_IN_REPO') {
      assert.doesNotMatch(item.continuity_evidence, /NONE REACHABLE/, `${item.canonical_id} claims verification it does not have`);
    }
  }
});

test('BLOCK(X) does not equal BLOCK(Y): a blocked item leaves other lanes working', () => {
  const blocked = 'CONV-HRB-0002';
  assert.equal(project(items.find(i => i.canonical_id === blocked)).executable_now, false, 'the test subject really is blocked');
  const rest = unaffectedBy(items, blocked);
  assert.ok(rest.length >= 8, `a single blocked item collapsed the belt to ${rest.length} lanes`);
  assert.ok(rest.every(w => w.canonical_id !== blocked));
});

test('blocking every item in one lane leaves every other lane moving', () => {
  const crippled = items.map(i => i.lane === 'GAMES' ? { ...i, continuity_state: 'UNVERIFIED_IN_REPO' } : i);
  const schedule = scheduleAllLanes(crippled);
  assert.ok(schedule.has_executable_work);
  assert.ok(schedule.idle.some(l => l.lane === 'GAMES' && l.reason === 'ALL_ITEMS_CHAIRMAN_GATED'));
  assert.ok(schedule.work.every(w => w.lane !== 'GAMES'));
  assert.ok(schedule.work.length >= 8, 'other lanes kept moving');
});

test('the scheduler returns at most one item per lane, and never a blocked one', () => {
  const schedule = scheduleAllLanes(items);
  assert.equal(new Set(schedule.work.map(w => w.lane)).size, schedule.work.length);
  assert.ok(schedule.work.every(w => w.executable_now));
});

test('the belt is not idle: most lanes have executable work right now', () => {
  const schedule = scheduleAllLanes(items);
  assert.ok(schedule.has_executable_work);
  assert.ok(schedule.work.length >= 8, `only ${schedule.work.length} lanes moving`);
});

test('an idle lane says why it is idle and names the items', () => {
  const schedule = scheduleAllLanes(items);
  for (const idle of schedule.idle) {
    assert.ok(['NO_ITEMS', 'ALL_ITEMS_CHAIRMAN_GATED'].includes(idle.reason));
    if (idle.reason === 'ALL_ITEMS_CHAIRMAN_GATED') assert.ok(idle.items.length > 0);
  }
});

test('work nearest to money is scheduled first within a lane', () => {
  const lane = 'GAMES';
  const next = nextInLane(items, lane);
  const others = items.filter(i => i.lane === lane).map(project).filter(p => p.executable_now);
  assert.ok(others.every(o => o.money_distance >= next.money_distance));
});

test('memberships are the shortest money distance in the whole conveyor', () => {
  const ranked = moneyNext(items, 50);
  assert.equal(ranked[0].canonical_id, 'CONV-MEM-0001');
  assert.equal(ranked[0].money_distance, 3);
});

test('no item claims a listed storefront with a verified checkout path', () => {
  for (const item of items) {
    if (item.checkout_path_state === 'VERIFIED') {
      assert.fail(`${item.canonical_id} claims a verified checkout path; none has been proven`);
    }
  }
});

test('every Chairman gate names the item, the code and the route', () => {
  for (const gate of chairmanGates(items)) {
    assert.ok(gate.canonical_id && gate.code && gate.route && gate.detail);
  }
});

test('the lane summary covers every lane, including empty ones', () => {
  const summary = laneSummary(items);
  assert.equal(summary.length, LANE_KEYS.length);
  assert.ok(summary.every(l => typeof l.items === 'number'));
});

test('the board reads back the whole conveyor in one object', () => {
  const view = board(registry);
  assert.equal(view.item_count, items.length);
  assert.equal(view.items.length, items.length);
  assert.ok(view.lanes.length === LANE_KEYS.length);
  assert.ok(Array.isArray(view.executable_now));
  assert.ok(Array.isArray(view.chairman_gates));
});

test('an unknown lane in the registry is reported, not ignored', () => {
  const bad = { ...registry, items: [{ ...items[0], lane: 'CRYPTO' }] };
  const check = validateRegistry(bad);
  assert.equal(check.valid, false);
  assert.ok(check.problems.some(p => p.problem === 'UNKNOWN_LANE'));
});

test('a duplicate canonical ID is reported', () => {
  const bad = { ...registry, items: [items[0], { ...items[0] }] };
  assert.ok(validateRegistry(bad).problems.some(p => p.problem === 'DUPLICATE_CANONICAL_ID'));
});

test('the client gate agrees with the database gate on the shared parity fixture', () => {
  // The same fixture is asserted in db/conveyor/validation/behaviour.sql check 21.
  // If these two ever disagree, the client is wrong, not entitled to a second opinion.
  const fixture = {
    canonical_id: 'CONV-TST-0001', title: 'Validation item', source_parent: 'Validation parent',
    lane: 'GAMES', item_kind: 'GAME_SURFACE', world_class: 'WORLD_SIMULATED',
    owner_department: 'TEST DEPT', responsible_person: 'Named Person', person_authority: 'BUILD',
    stage: 'PRODUCTIZE', product_registry: 'LIVE_BACKEND_UNREACHABLE',
    product_ref: null, serial_state: 'NONE', qr_state: 'NONE'
  };
  const got = stageGate(fixture).blockers
    .map(b => `${b.code}:${b.authority}`).sort().join(',');
  assert.equal(got, 'PRODUCT_RECORD_MISSING:CHAIRMAN,QR_NOT_BOUND:BUILD,SERIAL_NOT_ISSUED:BUILD');
});

test('validation reports every problem at once rather than the first', () => {
  const bad = { ...registry, items: [{ ...items[0], lane: 'CRYPTO', stage: 'SHIPPING', continuity_evidence: null }] };
  const check = validateRegistry(bad);
  assert.ok(check.problems.length >= 3, JSON.stringify(check.problems));
});
