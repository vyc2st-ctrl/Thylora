// THYLORA · world engine tests (dual time, causal spine, population,
// event engine, BACKTRACE, sports timing, recipe capture, construct audit)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { nativeAgeFromElapsedMs, elapsedMsFromNativeAge, earthYearsFromNativeAge, anchorRelative, dualStamp, NATIVE_DAY_EARTH_HOURS } from '../world/lib/dual-time.js';
import { compileSpine, classifyTrait, traitReadiness, SPINE_DIMENSIONS } from '../world/lib/causal-spine.js';
import { makePerson, setResolution, backgroundStep } from '../world/lib/population.js';
import { tick, injectAuthorEvent, validateEvent } from '../world/lib/event-engine.js';
import { createSession, addRaw, addMarker, correct, whereIs, backtrace, verifyChain, closeWithReceipt, routeToExpert, extractImprovements, SOURCE, ACTIONS } from '../world/lib/backtrace.js';
import { synthPlayer, runPlay, applyOutcome, distanceAt } from '../world/lib/sports-timing.js';
import { newRecipe, recordAttempt, formulaEligibility } from '../world/lib/recipe-capture.js';
import { auditItem } from '../world/lib/construct-audit.js';

const fixture = JSON.parse(readFileSync(new URL('../world/fixtures/synthetic-person.packet.json', import.meta.url)));

// ---------- dual time ----------
test('native day is 33 Earth hours', () => assert.equal(NATIVE_DAY_EARTH_HOURS, 33));

test('22 full-orbit cycles + 114 native days translates to ~30.97 Earth years (Nahla Mercer canon)', () => {
  const age = { completed_full_orbit_cycles: 22, native_days: 114 };
  assert.equal(earthYearsFromNativeAge(age), 30.97);
  const back = nativeAgeFromElapsedMs(elapsedMsFromNativeAge(age));
  assert.equal(back.completed_full_orbit_cycles, 22);
  assert.equal(back.native_days, 114);
  assert.equal(back.translation_role, 'SECONDARY_ONLY');
});

test('anchor-relative time never prints an invented native name', () => {
  const r = anchorRelative('2026-09-18T19:05:00-04:00'); // +33h
  assert.equal(r.direction, 'AFTER_ANCHOR');
  assert.equal(r.native_days, 1);
  assert.equal(r.earth_hours_into_native_day, 0);
  assert.match(r.label_state, /OPEN/);
  const s = dualStamp('2026-09-26T09:00:00-04:00');
  assert.equal(s.earth_timezone, 'America/New_York');
  assert.ok(s.native.anchor.startsWith('Day 83'));
});

// ---------- causal spine ----------
const SEEDS = [
  'What irritates her?',
  'What is she afraid of?',
  'Why did she take the job?',
  'Who does she trust?',
  'Why did she choose that car?'
];

test('five Chairman seeds expand to 50 derived questions (40 dimensional + 10 interaction)', () => {
  const c = compileSpine(fixture, SEEDS);
  assert.equal(c.derived.length, 50);
  assert.ok(c.derived.length >= 45);
  assert.deepEqual(c.seeds.map(s => s.trait), ['IRRITATION', 'FEAR', 'JOB_REASON', 'TRUST', 'TRANSPORT_CHOICE']);
  for (const s of c.seeds) {
    const dims = c.derived.filter(d => d.seed_id === s.seed_id).map(d => d.dimension);
    assert.deepEqual(dims, [...SPINE_DIMENSIONS]);
  }
});

test('the compiler points at evidence but never writes an answer', () => {
  const c = compileSpine(fixture, SEEDS);
  assert.ok(c.derived.every(d => d.answer === null));
  const ctx = c.derived.find(d => d.seed_id === 'S1' && d.dimension === 'CONTEXT');
  assert.equal(ctx.status, 'EVIDENCE_IN_PACKET');
  assert.deepEqual(ctx.evidence_paths, ['mind_profile.irritation_map']);
  const shift = c.derived.find(d => d.seed_id === 'S3' && d.dimension === 'CURRENT_STATE');
  assert.deepEqual(shift.evidence_paths, ['work_profile.current_role'], 'OPEN strings are not evidence');
  assert.ok(c.counts.OPEN > 0, 'unbuilt facts remain OPEN');
});

test('a broad trait is not ready to drive behaviour until every dimension has evidence', () => {
  const c = compileSpine(fixture, SEEDS);
  const r = traitReadiness(c, 'S1');
  assert.equal(r.ready, false);
  assert.ok(r.missing_dimensions.includes('PRIOR_EVENTS'));
});

test('unclassified seeds still expand; missing person is refused', () => {
  assert.equal(classifyTrait('What colour is the sky?'), 'UNCLASSIFIED');
  assert.throws(() => compileSpine({}, SEEDS), /persisted person/);
});

// ---------- population ----------
test('demotion reduces compute resolution but never loses history', () => {
  let p = makePerson('p1', { tier: 'FOCUS', history: [{ type: 'BORN' }, { type: 'HIRED' }], state: { fatigue: 0.4 } });
  p = setResolution(p, 'BACKGROUND', { reason: 'left camera focus', at: 't1' });
  assert.equal(p.compute_tier, 'BACKGROUND');
  assert.equal(p.tier, 'PERSISTENT', 'storage floor holds once individual');
  assert.equal(p.history.length, 3);
  assert.equal(p.summaries[0].state_snapshot.fatigue, 0.4);
  p = setResolution(p, 'FOCUS', { reason: 'scene resumes', at: 't2' });
  assert.equal(p.reloaded_history_len, 3);
  assert.throws(() => setResolution(p, 'HOUSEHOLD', {}), /reason/);
});

test('background cells exclude persistent individuals', () => {
  const c = backgroundStep({ population: 1000, rates: { commute: 0.4, home: 0.5 } }, { excludedIndividuals: 10 });
  assert.equal(c.statistical_population, 990);
  assert.equal(c.commuters, 396);
});

// ---------- event engine ----------
const world = () => ({
  now: '2026-09-26T13:00:00-04:00',
  people: [{ id: 'op-1', state: { fatigue: 0.5, hunger: 0.75 }, irritation_map: { family: ['volunteered for an errand before anyone asks'] }, meal_plan: { main_break: 'grain bowl' } }],
  schedule: [
    { id: 'shift-1', person_id: 'op-1', starts_at: '2026-09-26T09:00:00-04:00', ends_at: '2026-09-26T17:30:00-04:00' },
    { id: 'pickup-1', person_id: 'op-1', starts_at: '2026-09-26T16:30:00-04:00', ends_at: '2026-09-26T17:00:00-04:00', assumed_by: 'relative-1', confirmed_by_person: false, requires_travel: true }
  ],
  prior_events: [{ id: 'msg-1', affects: 'op-1', context: 'family', tags: ['volunteered for an errand before anyone asks'], at: '2026-09-26T11:00:00-04:00' }],
  weather: { id: 'wx-1', precip_mm_h: 4 },
  vehicles: [{ id: 'veh-1', owner_id: 'op-1', condition: 'ok' }],
  institutions: [], resources: []
});

test('events emerge from state and carry causes; replay is deterministic', () => {
  const a = tick(world(), { seed: 619 });
  const b = tick(world(), { seed: 619 });
  assert.deepEqual(a, b);
  const all = [...a.events, ...a.not_occurred];
  const conflict = all.find(e => e.type === 'SCHEDULE_CONFLICT');
  assert.ok(conflict.causes.includes('assumption:relative-1'));
  assert.ok(all.some(e => e.type === 'IRRITATION' && e.causes.includes('event:msg-1')));
  assert.ok(all.some(e => e.type === 'TRAVEL_DELAY' && e.causes.includes('weather:wx-1')));
  assert.ok(all.every(e => e.p >= 0.02 && e.p <= 0.98));
  assert.equal(a.rejected.length, 0);
});

test('state changes persist after events; no reset to generic personality', () => {
  const r = tick(world(), { seed: 7 });
  const meal = r.events.find(e => e.type === 'MEAL');
  if (meal) assert.ok(r.state['op-1'].hunger < 0.75);
  assert.ok(Object.keys(r.state['op-1']).length >= 2);
});

test('author-convenience events without state are refused', () => {
  assert.equal(injectAuthorEvent({ type: 'SURPRISE', person_id: 'op-1', causes: [] }).accepted, false);
  assert.equal(injectAuthorEvent({ type: 'X', person_id: 'op-1', causes: ['schedule:shift-1'], forced_by_author: true }).accepted, false);
  assert.equal(validateEvent({ type: 'X', person_id: 'op-1', causes: ['vague'] }).valid, false);
});

// ---------- Talk While Working / BACKTRACE ----------
function nahlaStyleSession() {
  const s = createSession({ session_id: 'TWIW-TEST-001', operator_id: 'operator-1', user_id: 'user-1', started_at: '2026-09-26T09:00:00-04:00' });
  addRaw(s, { t: '09:02', speaker: 'user-1', source: SOURCE.OPERATOR_SPEECH, text: 'Putting the torque wrench in the second drawer so it is with the filter kit.', confidence: 0.95 });
  addRaw(s, { t: '09:05', speaker: 'unknown', source: SOURCE.BACKGROUND, text: '...wrench is on the bench...', confidence: 0.4 });
  addRaw(s, { t: '09:07', speaker: 'user-1', source: SOURCE.OPERATOR_SPEECH, text: 'Drain plug washer on the tray, I think.', confidence: 0.7 });
  addRaw(s, { t: '09:09', speaker: 'user-1', source: SOURCE.OPERATOR_SPEECH, text: 'Correction: washer is in the parts cup, not the tray.', confidence: 0.96 });
  addMarker(s, { t: '09:02', object: 'torque-wrench', action: ACTIONS.PLACE, location: 'bay2/drawer2', reason: 'kept with filter kit', raw_ref: 'R1' });
  addMarker(s, { t: '09:07', object: 'drain-washer', action: ACTIONS.PLACE, location: 'bay2/tray', raw_ref: 'R3' });
  return s;
}

test('background audio cannot establish a placement', () => {
  const s = nahlaStyleSession();
  assert.throws(() => addMarker(s, { t: '09:05', object: 'torque-wrench', action: ACTIONS.PLACE, location: 'bench', raw_ref: 'R2' }), /background/);
  addMarker(s, { t: '09:05', object: 'torque-wrench', action: ACTIONS.MENTION, raw_ref: 'R2', uncertain: true });
  assert.equal(whereIs(s, 'torque-wrench').state, 'LAST_KNOWN_UNCERTAIN');
});

test('corrections supersede without deleting; reverse reading recovers the place', () => {
  const s = nahlaStyleSession();
  const low = s.markers[1];
  assert.equal(low.uncertain, true, 'low-confidence speech is flagged');
  correct(s, low.marker_id, { t: '09:09', location: 'bay2/parts-cup', raw_ref: 'R4', reason: 'speaker correction' });
  const w = whereIs(s, 'drain-washer');
  assert.equal(w.location, 'bay2/parts-cup');
  assert.equal(w.state, 'LAST_KNOWN');
  assert.equal(s.markers.length, 3, 'original marker still exists');
  assert.equal(backtrace(s, 'drain-washer').length, 1, 'superseded marker skipped on reverse read');
  assert.equal(verifyChain(s).valid, true);
});

test('tampering breaks the hash chain', () => {
  const s = nahlaStyleSession();
  s.markers[0].location = 'somewhere-else';
  assert.equal(verifyChain(s).valid, false);
});

test('handoff receipt refuses "all set" when a location is unresolved; expert routing never impersonates', () => {
  const s = nahlaStyleSession();
  assert.equal(routeToExpert(s, { question: 'torque spec?', domain: 'mechanic', role_holder_id: null }).routed, false);
  routeToExpert(s, { question: 'torque spec?', domain: 'mechanic', role_holder_id: 'mech-1' });
  const r = closeWithReceipt(s, { closed_at: '09:30', next_person_id: 'op-2' });
  assert.equal(r.closable_as_clean, false);
  assert.ok(r.unresolved.some(u => u.object === 'drain-washer'));
  assert.equal(r.open_routes.length, 1);
  const imp = extractImprovements(s);
  assert.ok(imp.some(i => i.kind === 'MISSING_REASON'));
  assert.ok(imp.some(i => i.kind === 'BACKGROUND_AUDIO'));
});

test('no operator, no session', () => {
  assert.throws(() => createSession({ session_id: 'x' }), /operator/);
});

// ---------- sports ----------
test('synthetic play replays deterministically and history changes the QB', () => {
  const qb = synthPlayer('QB-SYN-1', 'QB', { skill: 0.7 });
  const rb = synthPlayer('RB-SYN-1', 'RB', { adjacent_knowledge: 0.5 });
  const receivers = [synthPlayer('WR-SYN-1', 'WR'), synthPlayer('WR-SYN-2', 'WR', { skill: 0.8 })];
  const defenders = [synthPlayer('DB-SYN-1', 'DB'), synthPlayer('DB-SYN-2', 'DB')];
  const blockers = [synthPlayer('OL-SYN-1', 'BLOCKER'), synthPlayer('OL-SYN-2', 'BLOCKER')];
  const rushers = [synthPlayer('DL-SYN-1', 'BLOCKER'), synthPlayer('DL-SYN-2', 'BLOCKER')];
  const args = { qb, rb, receivers, defenders, blockers, rushers, field: { wet: false }, seed: 42 };
  const a = runPlay(args), b = runPlay(args);
  assert.deepEqual(a, b);
  assert.ok(['COMPLETE', 'INCOMPLETE', 'CHECKDOWN', 'SACK'].includes(a.outcome));
  assert.equal(applyOutcome(qb, a).history.length, 1);
  assert.ok(distanceAt(receivers[0], 2, { wet: true }) < distanceAt(receivers[0], 2, { wet: false }));
  assert.ok([qb, rb, ...receivers].every(p => p.synthetic));
});

// ---------- KynWrks recipe capture ----------
test('recipe attempts record intended vs actual; no formula until measured and tasted', () => {
  const r = newRecipe({ recipe_id: 'CTL-EGG-001', title: 'Egg experiment', origin: 'Chairman current experiment' });
  assert.equal(r.formula_state, 'NO_CANONICAL_MEASURED_FORMULA');
  const bad = recordAttempt(r, { made_at: 't', made_by: 'chairman', lines: [{ ingredient: 'salt', unit: 'g', intended_amount: 2 }] });
  assert.equal(bad.recorded, false);
  const ok = recordAttempt(r, {
    made_at: 't', made_by: 'chairman',
    lines: [
      { ingredient: 'egg', form: 'whole, large', unit: 'each', intended_amount: 2, actual_amount: 2 },
      { ingredient: 'salt', form: 'fine', unit: 'pinch_UNMEASURED', intended_amount: null, actual_amount: 1, spill_or_deviation: 'extra shake' }
    ],
    tastings: [{ taster: 'Cali', response: 'too salty', score_1_5: 3 }],
    next_change: 'weigh salt'
  });
  assert.equal(ok.version.version, '0.1');
  const e = formulaEligibility(r, '0.1');
  assert.equal(e.eligible, false);
  assert.ok(e.reasons.some(x => /unmeasured: salt/.test(x)));
  assert.throws(() => newRecipe({ recipe_id: 'x', title: 'x', lane: 'MATEO' }), /OPEN/);
});

// ---------- construct audit ----------
test('construct audit states what a score can and cannot prove', () => {
  const a = auditItem({ item_id: 'I1', intended_skill: 'fraction comparison', prerequisite_knowledge: ['reading a word problem'], language_burden: 3, ambiguity: 1, trick_burden: 2, time_pressure: 1, transfer_value: 2 });
  assert.equal(a.verdict, 'REBUILD');
  assert.ok(a.cannot_prove.some(x => /reading load/.test(x)));
  assert.equal(auditItem({ intended_skill: 'x', language_burden: 9 }).valid, false);
});
