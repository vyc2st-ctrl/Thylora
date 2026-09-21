import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CREW_ROLES, TEAM_SIZE_MIN, TEAM_SIZE_MAX, minimumReadyCrew, teamReadiness, localHireValid,
  convertMoney, capabilityFunctionsInEra, assertCapabilityClaim,
  validateHelpOrder, countedHelp,
  RECOVERY_STAGES, newRecovery, advanceRecovery, applyDeathPatch, diedOutsideOrigin,
  firstMeetingPermitted, assertEncounter, kinshipDegree, locketState,
  AWARD_CLASSES, tallyVotes, voteRoundMayOpen, vehicleAwardEligible, standingAfterEmergency,
} from '../app/lib/time-run-ops.mjs';

// --- crew -------------------------------------------------------------------

test('minimum ready crew fits inside the team size band', () => {
  const min = minimumReadyCrew();
  assert.ok(min >= TEAM_SIZE_MIN, `${min} >= ${TEAM_SIZE_MIN}`);
  assert.ok(min <= TEAM_SIZE_MAX, `${min} <= ${TEAM_SIZE_MAX}`);
});

test('command is never a single point of failure', () => {
  const command = CREW_ROLES.filter((r) => r.group === 'COMMAND' && r.ready);
  assert.equal(command.length, 2);
});

test('the witness keeper is a required role and does not hold command', () => {
  const keeper = CREW_ROLES.find((r) => r.code === 'WITNESS_KEEPER');
  assert.equal(keeper.ready, true);
  assert.equal(keeper.group, 'RECORD');
});

test('an empty team is not ready and names every shortfall', () => {
  const { ready, shortfall } = teamReadiness([]);
  assert.equal(ready, false);
  assert.equal(shortfall.length, CREW_ROLES.filter((r) => r.ready).length);
});

test('a fully covered team is ready', () => {
  const slots = [];
  for (const role of CREW_ROLES.filter((r) => r.ready)) {
    for (let i = 0; i < role.min; i += 1) {
      slots.push({ role_code: role.code, slot_state: 'FILLED' });
    }
  }
  assert.equal(teamReadiness(slots).ready, true);
});

test('an unfilled slot does not count toward readiness', () => {
  const slots = CREW_ROLES.filter((r) => r.ready)
    .flatMap((r) => Array.from({ length: r.min }, () => ({ role_code: r.code, slot_state: 'OPEN' })));
  assert.equal(teamReadiness(slots).ready, false);
});

test('a local hire without consent and era pay is not a valid engagement', () => {
  assert.equal(localHireValid({ engagement_kind: 'LOCAL_HIRE', consent_recorded: false, paid_in_era_money: true, pay_rate_minor: 12 }), false);
  assert.equal(localHireValid({ engagement_kind: 'LOCAL_HIRE', consent_recorded: true, paid_in_era_money: false, pay_rate_minor: 12 }), false);
  assert.equal(localHireValid({ engagement_kind: 'LOCAL_HIRE', consent_recorded: true, paid_in_era_money: true, pay_rate_minor: null }), false);
  assert.equal(localHireValid({ engagement_kind: 'LOCAL_HIRE', consent_recorded: true, paid_in_era_money: true, pay_rate_minor: 12 }), true);
});

// --- money ------------------------------------------------------------------

test('money conversion stays in integer minor units', () => {
  const r = convertMoney({ sourceMinor: 1000, rateNumerator: 3, rateDenominator: 7, feeMinor: 5,
                           convertedByRole: 'QUARTERMASTER', witnessedByRole: 'WITNESS_KEEPER' });
  assert.equal(r.grossMinor, Math.floor((1000 * 3) / 7));
  assert.equal(r.netMinor, r.grossMinor - 5);
  assert.ok(Number.isInteger(r.netMinor));
});

test('conversion needs two distinct roles', () => {
  assert.throws(() => convertMoney({ sourceMinor: 100, rateNumerator: 1, rateDenominator: 1,
    convertedByRole: 'QUARTERMASTER', witnessedByRole: 'QUARTERMASTER' }), /THYTR-MONEY-004/);
});

test('fractional money is refused outright', () => {
  assert.throws(() => convertMoney({ sourceMinor: 10.5, rateNumerator: 1, rateDenominator: 1,
    convertedByRole: 'QUARTERMASTER', witnessedByRole: 'WITNESS_KEEPER' }), /THYTR-MONEY-001/);
});

// --- technology -------------------------------------------------------------

test('identity, memory, knowledge and experience carry backward', () => {
  for (const c of ['IDENTITY', 'MEMORY', 'KNOWLEDGE', 'EXPERIENCE']) {
    assert.equal(capabilityFunctionsInEra(c), true, c);
  }
});

test('later-era capability does not function in the destination era', () => {
  for (const c of ['DEVICE', 'POWER', 'NETWORK', 'MEDICINE', 'MATERIAL', 'WEAPON']) {
    assert.equal(capabilityFunctionsInEra(c), false, c);
    assert.throws(() => assertCapabilityClaim(c, true, '1700S'), /THYTR-CAP-001/);
  }
});

test('carrying knowledge backward is permitted', () => {
  assert.equal(assertCapabilityClaim('KNOWLEDGE', true, '1700S'), true);
});

// --- helping communities ----------------------------------------------------

const goodOrder = {
  order_state: 'VERIFIED', local_consent: true, materials_taken_locally: true,
  materials_paid_minor: 400, payment_taken_from_local: false, local_labour_unpaid: false,
  filmed_without_consent: false, verified_by_community: true, verified_by_witness_keeper: true,
};

test('a clean help order validates', () => {
  assert.equal(validateHelpOrder(goodOrder).valid, true);
});

test('help is never invoiced to the people helped', () => {
  const r = validateHelpOrder({ ...goodOrder, payment_taken_from_local: true });
  assert.match(r.problems.join(' '), /THYTR-HELP-001/);
});

test('local labour is never unpaid', () => {
  const r = validateHelpOrder({ ...goodOrder, local_labour_unpaid: true });
  assert.match(r.problems.join(' '), /THYTR-HELP-002/);
});

test('work cannot begin without consent', () => {
  const r = validateHelpOrder({ ...goodOrder, order_state: 'IN_PROGRESS', local_consent: false });
  assert.match(r.problems.join(' '), /THYTR-HELP-004/);
});

test('materials taken locally must be paid for', () => {
  const r = validateHelpOrder({ ...goodOrder, materials_paid_minor: 0 });
  assert.match(r.problems.join(' '), /THYTR-HELP-005/);
});

test('verification needs both the community and the witness keeper', () => {
  const r = validateHelpOrder({ ...goodOrder, verified_by_community: false });
  assert.match(r.problems.join(' '), /THYTR-HELP-006/);
});

test('only double-verified help counts toward the help awards', () => {
  const orders = [goodOrder, { ...goodOrder, order_state: 'COMPLETE' },
                  { ...goodOrder, payment_taken_from_local: true }];
  assert.equal(countedHelp(orders).length, 1);
});

// --- death ------------------------------------------------------------------

const death = {
  person_ref: 'PER-EXAMPLE', origin_era_code: 'MOTOR', death_era_code: '1700S',
  died_at: '1700-01-01T00:00:00Z', is_dead: true, reversible: false,
};

test('death outside the origin era is detected', () => {
  assert.equal(diedOutsideOrigin(death), true);
  assert.equal(diedOutsideOrigin({ ...death, origin_era_code: '1700S' }), false);
});

test('death cannot be undone', () => {
  assert.throws(() => applyDeathPatch(death, { is_dead: false }), /THYTR-DEATH-002/);
});

test('death cannot be made reversible', () => {
  assert.throws(() => applyDeathPatch(death, { reversible: true }), /THYTR-DEATH-003/);
});

test('identity, era and time of death are fixed at record', () => {
  assert.throws(() => applyDeathPatch(death, { death_era_code: 'MOTOR' }), /THYTR-DEATH-004/);
  assert.throws(() => applyDeathPatch(death, { person_ref: 'PER-OTHER' }), /THYTR-DEATH-004/);
});

test('a permitted patch leaves the death locks intact', () => {
  const next = applyDeathPatch(death, { cause_note: 'recorded' });
  assert.equal(next.is_dead, true);
  assert.equal(next.reversible, false);
  assert.equal(next.cause_note, 'recorded');
});

// --- body return / recovery protocol ---------------------------------------

test('the recovery protocol has 14 ordered stages', () => {
  assert.equal(RECOVERY_STAGES.length, 14);
  RECOVERY_STAGES.forEach((s, i) => assert.equal(s.index, i));
});

test('recovery stages do not run backward', () => {
  const rec = { ...newRecovery('d1'), current_stage_index: 3 };
  assert.throws(() => advanceRecovery(rec, { current_stage_index: 2 }), /THYTR-REC-001/);
});

test('recovery stages advance one at a time', () => {
  const rec = newRecovery('d1');
  assert.throws(() => advanceRecovery(rec, { current_stage_index: 4 }), /THYTR-REC-002/);
});

test('the host community is answered before any era is left', () => {
  let rec = newRecovery('d1');
  for (let i = 1; i <= 4; i += 1) rec = advanceRecovery(rec, { current_stage_index: i });
  assert.throws(() => advanceRecovery(rec, { current_stage_index: 5 }), /THYTR-REC-003/);
  rec = advanceRecovery(rec, { current_stage_index: 5, community_asked: true });
  assert.equal(rec.current_stage_index, 5);
});

test('a returning body travels with two escorts, never one', () => {
  let rec = newRecovery('d1');
  for (let i = 1; i <= 7; i += 1) {
    rec = advanceRecovery(rec, { current_stage_index: i, community_asked: i >= 5 });
  }
  assert.throws(() => advanceRecovery(rec, {
    current_stage_index: 8, disposition: 'RETURN_TO_ORIGIN_ERA', escort_slot_a: 'a', escort_slot_b: null,
  }), /THYTR-REC-005/);
  assert.throws(() => advanceRecovery(rec, {
    current_stage_index: 8, disposition: 'RETURN_TO_ORIGIN_ERA', escort_slot_a: 'a', escort_slot_b: 'a',
  }), /THYTR-REC-005/);
});

test('disposition must be decided before an escort is assigned', () => {
  let rec = newRecovery('d1');
  for (let i = 1; i <= 7; i += 1) {
    rec = advanceRecovery(rec, { current_stage_index: i, community_asked: i >= 5 });
  }
  assert.throws(() => advanceRecovery(rec, { current_stage_index: 8 }), /THYTR-REC-004/);
});

test('a broken custody chain blocks the origin-era receipt', () => {
  let rec = newRecovery('d1');
  for (let i = 1; i <= 7; i += 1) {
    rec = advanceRecovery(rec, { current_stage_index: i, community_asked: i >= 5 });
  }
  rec = advanceRecovery(rec, {
    current_stage_index: 8, disposition: 'RETURN_TO_ORIGIN_ERA', escort_slot_a: 'a', escort_slot_b: 'b' });
  rec = advanceRecovery(rec, { current_stage_index: 9 });
  assert.throws(() => advanceRecovery(rec, { current_stage_index: 10, custody_unbroken: false }), /THYTR-REC-006/);
});

test('a full origin-era return walks all fourteen stages and closes', () => {
  let rec = newRecovery('d1');
  for (let i = 1; i <= 13; i += 1) {
    rec = advanceRecovery(rec, {
      current_stage_index: i,
      community_asked: i >= 5 ? true : rec.community_asked,
      disposition: i >= 6 ? 'RETURN_TO_ORIGIN_ERA' : rec.disposition,
      escort_slot_a: i >= 8 ? 'slot-a' : rec.escort_slot_a,
      escort_slot_b: i >= 8 ? 'slot-b' : rec.escort_slot_b,
      closed_at: i === 13 ? '1700-02-01T00:00:00Z' : null,
    });
  }
  assert.equal(rec.current_stage_index, 13);
  assert.ok(rec.closed_at);
  assert.equal(rec.restores_life, false);
});

test('local interment is a complete disposition, not a failure', () => {
  let rec = newRecovery('d1');
  for (let i = 1; i <= 13; i += 1) {
    rec = advanceRecovery(rec, {
      current_stage_index: i,
      community_asked: i >= 5 ? true : rec.community_asked,
      community_requested_stay: true,
      disposition: i >= 6 ? 'INTERRED_IN_ERA_OF_DEATH' : rec.disposition,
      closed_at: i === 13 ? '1700-02-01T00:00:00Z' : null,
    });
  }
  assert.equal(rec.disposition, 'INTERRED_IN_ERA_OF_DEATH');
  assert.ok(rec.closed_at);
});

test('a recovery cannot close early', () => {
  const rec = { ...newRecovery('d1'), current_stage_index: 11, community_asked: true,
                disposition: 'RETURN_TO_ORIGIN_ERA', escort_slot_a: 'a', escort_slot_b: 'b' };
  assert.throws(() => advanceRecovery(rec, { current_stage_index: 12, closed_at: 'x' }), /THYTR-REC-007/);
});

test('recovery never restores life', () => {
  const rec = newRecovery('d1');
  assert.throws(() => advanceRecovery(rec, { restores_life: true }), /THYTR-REC-000/);
});

// --- relations --------------------------------------------------------------

test('Vyctor and Ines have no first meeting available', () => {
  assert.equal(firstMeetingPermitted('PER-VYCTOR-EBENEEZER', 'PER-INES-MORALES'), false);
  assert.equal(firstMeetingPermitted('PER-INES-MORALES', 'PER-VYCTOR-EBENEEZER'), false);
  assert.throws(() => assertEncounter({
    encounter_kind: 'FIRST_MEETING',
    party_a_ref: 'PER-VYCTOR-EBENEEZER', party_b_ref: 'PER-INES-MORALES',
  }), /THYTR-REL-001/);
});

test('a continued acquaintance between Vyctor and Ines is permitted', () => {
  assert.equal(assertEncounter({
    encounter_kind: 'CONTINUED_ACQUAINTANCE',
    party_a_ref: 'PER-VYCTOR-EBENEEZER', party_b_ref: 'PER-INES-MORALES',
  }), true);
});

test('Vyctor and Veronica is the one open first meeting', () => {
  assert.equal(firstMeetingPermitted('PER-VYCTOR-EBENEEZER', 'PER-VERONICA-HALL'), true);
  assert.equal(assertEncounter({
    encounter_kind: 'FIRST_MEETING',
    party_a_ref: 'PER-VYCTOR-EBENEEZER', party_b_ref: 'PER-VERONICA-HALL',
  }), true);
});

test('the kinship degree between Ines and Veronica is sealed, not absent', () => {
  const k = kinshipDegree('PER-INES-MORALES', 'PER-VERONICA-HALL');
  assert.equal(k.known, false);
  assert.equal(k.sealed, true);
  assert.equal(k.tiedTo, 'OBJ-LOCKET-001');
});

test('the locket is closed and exposes no contents', () => {
  const l = locketState();
  assert.equal(l.state, 'CLOSED');
  assert.equal(l.sealed, true);
  assert.equal('contents' in l ? l.contents : undefined, undefined);
});

test('an encounter never creates a branch universe on its own', () => {
  assert.throws(() => assertEncounter({
    encounter_kind: 'WORK_TOGETHER', party_a_ref: 'A', party_b_ref: 'B', branch_universe_created: true,
  }), /THYTR-TIME-001/);
});

test('a meeting that happened entered history', () => {
  assert.throws(() => assertEncounter({
    encounter_kind: 'WORK_TOGETHER', party_a_ref: 'A', party_b_ref: 'B', became_history: false,
  }), /THYTR-TIME-002/);
});

// --- awards and voting ------------------------------------------------------

test('no seeded award class is speed weighted', () => {
  assert.equal(AWARD_CLASSES.some((a) => a.speedWeighted), false);
});

test('award classes span help, build, vehicle, animal, crew, community, safety and conduct', () => {
  const groups = new Set(AWARD_CLASSES.map((a) => a.group));
  for (const g of ['HELP', 'BUILD', 'VEHICLE', 'ANIMAL', 'CREW', 'COMMUNITY', 'SAFETY', 'CONDUCT']) {
    assert.ok(groups.has(g), g);
  }
});

test('viewer votes and people votes are never summed together', () => {
  const t = tallyVotes([
    { population: 'VIEWER' }, { population: 'VIEWER' },
    { population: 'PEOPLE_OF_ERA' }, { population: 'HOST_COMMUNITY' },
  ]);
  assert.equal(t.viewer, 2);
  assert.equal(t.people, 1);
  assert.equal(t.host_community, 1);
  assert.notEqual(t.viewer + t.people, t.viewer);
});

test('a vote round cannot open before eligibility and safety review', () => {
  assert.equal(voteRoundMayOpen({ eligibility_reviewed: true, safety_reviewed: false }), false);
  assert.equal(voteRoundMayOpen({ eligibility_reviewed: true, safety_reviewed: true }), true);
});

test('a non-period vehicle is ineligible for the period class but not for the others', () => {
  const v = { period_correct: false, condition_state: 'SERVICEABLE' };
  assert.equal(vehicleAwardEligible(v, 'AWD-VEHICLE-PERIOD'), false);
  assert.equal(vehicleAwardEligible(v, 'AWD-VEHICLE-ROAD'), true);
});

test('standing is suspended by an emergency and never lost', () => {
  const during = standingAfterEmergency({ team: 'A' }, { stood_down_at: null });
  assert.equal(during.suspended, true);
  assert.equal(during.lost, false);
  const after = standingAfterEmergency({ team: 'A' }, { stood_down_at: 'x' });
  assert.equal(after.suspended, false);
  assert.equal(after.lost, false);
});
