// RECONCILIATION TO LIVE HEAD 667
// Workroom: WR-RECONCILE-667
//
// Every assertion here is checked against a value READ FROM THE LIVE BACKEND
// (thylora-dash, jvsdxhrfhtlgaknhjxlz) on 2026-10-05, not from this repository.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { earthToEdereAirah, formatEdereAirah, eaYearLength, eaGravityRatio,
         ZONES, SECONDS_PER_EA_DAY, EA_GRAVITY } from '../time-run/lib/eatime.js';
import { WORKING_SELECTIONS, DISPOSITIONS, dispositionOf, sealedMechanics,
         CAUSALITY_RECONCILIATION } from '../time-run/lib/selections.js';
import { authorizeTraversal } from '../time-run/lib/authorization.js';
import { OPEN_MECHANICS } from '../time-run/lib/mechanics.js';
import { testVisitsBecomeHistory } from '../time-run/lib/causality.js';

const encounter = JSON.parse(readFileSync(new URL('../data/time-run/THY-ENC-0001.json', import.meta.url)));
const castle = JSON.parse(readFileSync(new URL('../data/place/THY-PLACE-CASTLE-001.json', import.meta.url)));

// ------------------------------------------------- MATH-EA-TIME-660 (ACTIVE)

test('the EdereAirah day is 26 hours, as the live equation states', () => {
  assert.equal(SECONDS_PER_EA_DAY, 93600);
  assert.equal(93600 / 3600, 26);
});

test('a year is 336 days, or 337 on a Renewal year', () => {
  assert.equal(eaYearLength(2026), 336);
  assert.equal(eaYearLength(2027), 336);
  assert.equal(eaYearLength(2028), 337);
  assert.equal(eaYearLength(2032), 337);
});

test('the Mirror Epoch is EA 2026 Month 1 Day 1 00:00 at PMT', () => {
  const stamp = earthToEdereAirah('2026-01-01T00:00:00Z', ZONES.PMT);
  assert.equal(stamp.ea_year, 2026);
  assert.equal(stamp.ea_month, 1);
  assert.equal(stamp.ea_day, 1);
  assert.equal(stamp.ea_hour, 0);
  assert.equal(stamp.ea_minute, 0);
});

test('this implementation reproduces the value the backend states for Bell Crossing', () => {
  // WR-MAH-660 / MATH-EA-TIME-660 state: Earth 2026-10-05 ~05:36 UTC
  // → EA 2026 · Month 10 Day 4 · 17:36 at Bell Crossing (PMT−6).
  const stamp = earthToEdereAirah('2026-10-05T05:36:00Z', ZONES.BELL_CROSSING);
  assert.equal(stamp.ea_year, 2026);
  assert.equal(stamp.ea_month, 10);
  assert.equal(stamp.ea_day, 4);
  assert.equal(stamp.ea_hour, 17);
  assert.equal(stamp.ea_minute, 36);
  assert.equal(formatEdereAirah(stamp), 'EA 2026 · Month 10 Day 4 · 17:36 PMT-6');
});

test('Renewal Day falls after Month 12 and outside the months', () => {
  const lastDayOf2028 = 336; // day-of-year index 336 is the 337th day
  const stamp = earthToEdereAirah(
    new Date(Date.parse('2026-01-01T00:00:00Z')
      + (eaYearLength(2026) + eaYearLength(2027) + lastDayOf2028) * SECONDS_PER_EA_DAY * 1000),
    ZONES.PMT);
  assert.equal(stamp.ea_year, 2028);
  assert.equal(stamp.renewal_day, true);
  assert.equal(stamp.ea_month, null);
  assert.match(formatEdereAirah(stamp), /Renewal Day/);
});

test('the clock is computed in both directions and never drifts', () => {
  for (const days of [0, 1, 27, 28, 335, 336, 337, 1000, -1, -336]) {
    const instant = new Date(Date.parse('2026-01-01T00:00:00Z') + days * SECONDS_PER_EA_DAY * 1000);
    const stamp = earthToEdereAirah(instant, ZONES.PMT);
    assert.equal(stamp.ea_hour, 0, `day ${days} did not land on a day boundary`);
    assert.equal(stamp.ea_minute, 0);
  }
});

// ---------------------------------------------- MATH-EA-GRAVITY-660 (ACTIVE)

test('EdereAirah gravity is 1.00 g, so ID-A needs no gravity exception', () => {
  assert.equal(eaGravityRatio(), 1);
  assert.equal(eaGravityRatio(0.80, 1.25), 1);
  assert.equal(EA_GRAVITY.g_ratio, 1.00);
});

// --------------------------------------------------- WORKING SELECTIONS

test('the six working selections match the Chairman packet', () => {
  assert.equal(WORKING_SELECTIONS.ENTRY_EXIT.selected, 'EE_A_THRESHOLD_SITES');
  assert.equal(WORKING_SELECTIONS.CLOTHING.selected, 'CL_C_PARTIAL');
  assert.equal(WORKING_SELECTIONS.VISIT_DURATION.selected, 'VD_C_OPEN_RESIDENCE');
  assert.equal(WORKING_SELECTIONS.INJURY_DEATH.selected, 'ID_A_FULLY_EMBODIED');
  assert.equal(WORKING_SELECTIONS.CAUSALITY.selected, 'CA_C_LEDGERED_CAUSALITY');
  assert.equal(WORKING_SELECTIONS.INFORMATION_TRANSFER.selected, 'IT_C_LEDGERED_DISCLOSURE');
});

test('a working selection is never canon', () => {
  assert.deepEqual(sealedMechanics(), []);
  for (const selection of Object.values(WORKING_SELECTIONS)) {
    assert.equal(selection.canon, false);
    assert.equal(selection.state, 'SELECTED_WORKING');
    assert.ok(selection.decided_by.length > 0);
  }
});

test('NO-LOSS: every unselected option carries an explicit disposition', () => {
  for (const [mechanicId, mechanic] of Object.entries(OPEN_MECHANICS)) {
    for (const option of mechanic.options) {
      const disposition = dispositionOf(mechanicId, option.code);
      assert.ok(DISPOSITIONS[disposition], `${option.code} has no known disposition`);
    }
  }
});

test('CA-A is superseded as current candidate, not deleted', () => {
  assert.equal(dispositionOf('CAUSALITY', 'CA_A_VISITS_BECOME_HISTORY'), 'SUPERSEDED_AS_CURRENT_CANDIDATE');
  // The research itself must still be present and still runnable.
  assert.ok(OPEN_MECHANICS.CAUSALITY.options.some(o => o.code === 'CA_A_VISITS_BECOME_HISTORY'));
  const guarded = testVisitsBecomeHistory({
    foresight_seal: true, pending_fulfillment_state: true, no_retcon_rule: true, harm_is_permanent: true
  });
  assert.equal(guarded.coherent, true);
  assert.match(guarded.unresolved_question, /CONSISTENCY_PRESSURE/);
});

test('the reason CA-A is not canonized is the unresolved consistency problem', () => {
  assert.match(WORKING_SELECTIONS.CAUSALITY.notes, /CONSISTENCY_PRESSURE/);
  assert.match(WORKING_SELECTIONS.CAUSALITY.notes, /NOT canonized/);
});

test('CA-C does not move backward from the live visitor_history_rule', () => {
  assert.equal(CAUSALITY_RECONCILIATION.satisfied_by_CA_A, true);
  assert.equal(CAUSALITY_RECONCILIATION.satisfied_by_CA_C, true);
  assert.ok(CAUSALITY_RECONCILIATION.chairman_decision_open.length > 0);
});

// ------------------------------------------------- ID-A AUTHORIZATION LAYER

test('an unprepared traversal is refused before departure, not survived after', () => {
  const result = authorizeTraversal({});
  assert.equal(result.state, 'REFUSED');
  assert.ok(result.blockers.some(b => b.code === 'DEATH_RULE_NOT_ACKNOWLEDGED'));
});

test('every refusal names what would clear it', () => {
  const result = authorizeTraversal({});
  for (const b of [...result.blockers, ...result.conditions]) {
    assert.ok(b.clears_when && b.clears_when.length > 0, `${b.code} is a dead end`);
  }
});

test('a threshold that does not exist in both eras closes the route', () => {
  const result = authorizeTraversal({
    traveler: { death_rule_acknowledged: true }, destination_era: 'ERA_1700S',
    entry_exit_mechanic: 'EE_A_THRESHOLD_SITES',
    threshold: { place_id: 'ER-CASTLE-ROYAL-001', exists_in_origin_era: true, exists_in_destination_era: false, admits: true },
    duration_mechanic: 'VD_C_OPEN_RESIDENCE', residence: { intent: 'VISIT' }, purpose: 'x'
  });
  assert.equal(result.state, 'REFUSED');
  assert.ok(result.blockers.some(b => b.code === 'THRESHOLD_NOT_IN_BOTH_ERAS'));
});

test('invitation is a privilege: a threshold that does not admit refuses the traversal', () => {
  const result = authorizeTraversal({
    traveler: { death_rule_acknowledged: true }, destination_era: 'ERA_1700S',
    entry_exit_mechanic: 'EE_A_THRESHOLD_SITES',
    threshold: { place_id: 'ER-CASTLE-ROYAL-001', exists_in_origin_era: true, exists_in_destination_era: true, admits: false },
    duration_mechanic: 'VD_C_OPEN_RESIDENCE', residence: { intent: 'VISIT' }, purpose: 'x'
  });
  assert.ok(result.blockers.some(b => b.code === 'THRESHOLD_DOES_NOT_ADMIT'));
});

test('a medical need the destination era cannot meet refuses the traversal', () => {
  const result = authorizeTraversal({
    traveler: { death_rule_acknowledged: true, known_medical_needs: [{ label: 'continuous care', required_tier: 70 }] },
    destination_era: 'ERA_1700S',
    entry_exit_mechanic: 'EE_A_THRESHOLD_SITES',
    threshold: { place_id: 'ER-CASTLE-ROYAL-001', exists_in_origin_era: true, exists_in_destination_era: true, admits: true },
    duration_mechanic: 'VD_C_OPEN_RESIDENCE', residence: { intent: 'VISIT' }, purpose: 'x'
  });
  assert.equal(result.state, 'REFUSED');
  assert.ok(result.blockers.some(b => b.code === 'MEDICAL_FLOOR_NOT_MET'));
});

test('remaining in another era requires an origin-era continuity arrangement', () => {
  const base = {
    traveler: { death_rule_acknowledged: true }, destination_era: 'ERA_1700S',
    entry_exit_mechanic: 'EE_A_THRESHOLD_SITES',
    threshold: { place_id: 'ER-CASTLE-ROYAL-001', exists_in_origin_era: true, exists_in_destination_era: true, admits: true },
    duration_mechanic: 'VD_C_OPEN_RESIDENCE', purpose: 'x'
  };
  assert.equal(authorizeTraversal({ ...base, residence: { intent: 'REMAIN' } }).state, 'REFUSED');
  assert.equal(authorizeTraversal({
    ...base, residence: { intent: 'REMAIN', origin_era_continuity_arrangement: 'recorded' }
  }).state, 'AUTHORIZED');
});

test('a minor cannot authorize an embodied traversal alone', () => {
  const result = authorizeTraversal({
    traveler: { death_rule_acknowledged: true, is_minor: true }, destination_era: 'ERA_1700S',
    entry_exit_mechanic: 'EE_A_THRESHOLD_SITES',
    threshold: { place_id: 'ER-CASTLE-ROYAL-001', exists_in_origin_era: true, exists_in_destination_era: true, admits: true },
    duration_mechanic: 'VD_C_OPEN_RESIDENCE', residence: { intent: 'VISIT' }, purpose: 'x'
  });
  assert.ok(result.blockers.some(b => b.code === 'GUARDIAN_REQUIRED'));
});

test('the traveler is not made less real to buy safety', () => {
  const result = authorizeTraversal({});
  assert.match(result.death_rule, /death is real/);
  assert.match(result.safety_posture, /not made less real/);
});

// ------------------------------------------------- CANON BINDINGS

test('Ines Morales carries her CHAIRMAN_LOCKED role, not an invented one', () => {
  const ines = encounter.people_met[0];
  assert.equal(ines.person_id, 'ER-ROYAL-COOK-001');
  assert.equal(ines.era_role, 'Royal Cook of the Royal Castle');
  assert.equal(ines.era_role_state, 'CHAIRMAN_LOCKED');
  assert.equal(ines.person_lock, 'LOCK-ER-ROYAL-COOK-001');
  assert.equal(ines.living, true);
});

test('NO-LOSS: the withdrawn role candidates are kept with their reason', () => {
  const ines = encounter.people_met[0];
  assert.equal(ines.withdrawn_role_candidates.length, 3);
  assert.match(ines.withdrawn_reason, /already CHAIRMAN_LOCKED/);
  assert.match(ines.withdrawn_reason, /No occupation was invented/);
});

test('the encounter arrives at the canon castle node', () => {
  assert.equal(encounter.arrival_place.place_id, 'ER-CASTLE-ROYAL-001');
  assert.equal(encounter.arrival_place.truth_state, 'OPEN_PENDING_CHAIRMAN_NAME_RECOVERY');
  assert.equal(encounter.arrival_place.name_candidates_withdrawn, true);
});

test('arrival time is bound to the EdereAirah clock, not an Earth clock', () => {
  assert.equal(encounter.arrival_time.ea_calendar_binding, 'MATH-EA-TIME-660 (ACTIVE in live backend)');
  assert.equal(encounter.arrival_time.ea_day_hours, 26);
  assert.match(encounter.arrival_time.correction, /24-hour day into a 26-hour world/);
});

test('the encounter carries the live death rule', () => {
  assert.equal(encounter.embodiment.death_is_real, true);
  assert.equal(encounter.embodiment.body_may_return_to_origin_era, true);
  assert.equal(encounter.embodiment.mechanic, 'ID_A_FULLY_EMBODIED');
});

test('CL-C: the garment is an ordinary carried object with a materials tier', () => {
  const coat = encounter.objects_carried.find(o => o.object_id === 'OBJ-002');
  assert.equal(coat.garment, true);
  assert.equal(coat.materials_tier, 22);
  assert.match(coat.clothing_rule, /no clothing exception/);
});

test('IT-C: disclosures are ledgered and the recipient may decline', () => {
  assert.equal(encounter.information_shared.model, 'IT_C_LEDGERED_DISCLOSURE');
  assert.equal(encounter.information_shared.ledgered, true);
  assert.equal(encounter.information_shared.recipient_may_decline, true);
  for (const d of encounter.information_shared.disclosures) assert.equal(d.ledgered, true);
});

test('VD-C: there is no automatic return', () => {
  assert.equal(encounter.departure.mechanic, 'VD_C_OPEN_RESIDENCE');
  assert.equal(encounter.departure.automatic_return, false);
});

test('the spelling EdereAirah is used and EdereAriah does not appear in Time Run work', () => {
  for (const url of ['../data/time-run/THY-ENC-0001.json', '../data/place/THY-PLACE-CASTLE-001.json',
                     '../docs/CASTLE-ERA-BINDING.md', '../db/time-run/0001_eras_places.sql']) {
    const text = readFileSync(new URL(url, import.meta.url), 'utf8');
    assert.ok(!/EdereAriah|Edereariah/.test(text), `${url} still carries the wrong spelling`);
  }
  assert.ok(/EdereAirah/.test(JSON.stringify(castle)));
});

test('nothing in this reconciliation claims canon', () => {
  assert.equal(encounter.provenance.canon, false);
  assert.equal(castle.provenance.canon, false);
  assert.equal(encounter.reconciled_at_head, 667);
  assert.equal(castle.reconciled_at_head, 667);
});
