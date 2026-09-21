// TIME RUN · encounter contract, causality and place tests
// Workroom: WR-TIMERUN-581
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  evaluateEncounterContract, testVisitsBecomeHistory, CAUSALITY_MODELS,
  CANON_CAUSALITY_MODEL, ENCOUNTER_FIELDS
} from '../time-run/lib/causality.js';
import { OPEN_MECHANICS, openMechanics, selectOption } from '../time-run/lib/mechanics.js';
import { validateNativeName, compareStrata, isProhibitedName, PROHIBITED_NAMES } from '../time-run/lib/place.js';

const encounter = JSON.parse(readFileSync(new URL('../data/time-run/THY-ENC-0001.json', import.meta.url)));
const castle = JSON.parse(readFileSync(new URL('../data/place/THY-PLACE-CASTLE-001.json', import.meta.url)));

// ---------------------------------------------------------------- CONTRACT
test('the encounter contract carries all thirteen required fields', () => {
  assert.equal(ENCOUNTER_FIELDS.length, 13);
});

test('an empty contract reports every missing field at once', () => {
  const result = evaluateEncounterContract({});
  assert.equal(result.contract_state, 'INCOMPLETE');
  for (const field of ENCOUNTER_FIELDS) {
    assert.ok(result.problems.some(p => p.field === field), `${field} not reported`);
  }
});

test('THY-ENC-0001 is complete', () => {
  const result = evaluateEncounterContract(encounter);
  assert.deepEqual([...result.problems], []);
  assert.equal(result.contract_state, 'COMPLETE');
  assert.equal(result.fields_present, result.fields_required);
});

test('the Vyctor and Inés packet is a continuity packet, not a scene', () => {
  assert.equal(encounter.scene_written, false);
  assert.equal(encounter.traveler.name, 'Vyctor Ebenezer');
  assert.equal(encounter.people_met[0].name, 'Inés Morales');
  assert.equal(encounter.origin_era, 'ERA_CURRENT');
  assert.equal(encounter.destination_era, 'ERA_1700S');
});

test('Inés Morales is recorded as living her own life', () => {
  const ines = encounter.people_met[0];
  assert.equal(ines.living, true);
  assert.equal(ines.native_era, 'ERA_1700S');
  assert.match(ines.agency, /Not a prop/);
});

test('a passive viewer contract is refused', () => {
  const result = evaluateEncounterContract({ ...encounter, viewer_mode: true });
  assert.ok(result.problems.some(p => p.code === 'PASSIVE_VIEWER_REGRESSION'));
});

test('a contract that lets a handset work in the 1700s is refused', () => {
  const leaking = structuredClone(encounter);
  leaking.objects_carried[0].envelope_rule = 'NATIVE';
  const result = evaluateEncounterContract(leaking);
  assert.ok(result.problems.some(p => p.code === 'ENVELOPE_RULE_INVALID'));
});

test('an unrecorded capability transformation is refused', () => {
  const unrecorded = structuredClone(encounter);
  unrecorded.capability_transformations = [];
  const result = evaluateEncounterContract(unrecorded);
  assert.ok(result.problems.some(p => p.code === 'TRANSFORMATION_UNRECORDED'));
});

test('a contract that strips memory is refused', () => {
  const stripped = structuredClone(encounter);
  stripped.memory_retained.retained = false;
  assert.ok(evaluateEncounterContract(stripped).problems.some(p => p.code === 'MEMORY_STRIPPED'));
});

test('a transformation that claims the device still worked is refused', () => {
  const misdeclared = structuredClone(encounter);
  misdeclared.capability_transformations[0].arrival_state = 'NATIVE';
  misdeclared.capability_transformations[0].functioning_tier = 80;
  const result = evaluateEncounterContract(misdeclared);
  assert.ok(result.problems.some(p => p.code === 'TRANSFORMATION_MISDECLARED'));
  assert.ok(result.problems.some(p => p.code === 'TIME_TECHNOLOGY_LEAK'));
});

test('a contract without provenance is refused', () => {
  const bare = structuredClone(encounter);
  bare.provenance = { serial: 'X' };
  const result = evaluateEncounterContract(bare);
  assert.ok(result.problems.filter(p => p.code === 'PROVENANCE_INCOMPLETE').length >= 3);
});

// --------------------------------------------------------------- CAUSALITY
test('no causality model is canon', () => {
  assert.equal(CANON_CAUSALITY_MODEL, null);
  assert.equal(Object.keys(CAUSALITY_MODELS).length, 3);
});

test('VISITS_BECOME_HISTORY is incoherent without its four guards', () => {
  const bare = testVisitsBecomeHistory({});
  assert.equal(bare.coherent, false);
  assert.deepEqual(bare.findings.map(f => f.code).sort(),
    ['CONSEQUENCE_FREE_HARM', 'FORESIGHT_TRAP', 'RETCON_ESCAPE', 'UNFULFILLED_TRACE']);
});

test('VISITS_BECOME_HISTORY becomes coherent only with all four guards', () => {
  const guarded = testVisitsBecomeHistory({
    foresight_seal: true, pending_fulfillment_state: true, no_retcon_rule: true, harm_is_permanent: true
  });
  assert.equal(guarded.coherent, true);
  assert.match(guarded.unresolved_question, /CONSISTENCY_PRESSURE/);
});

test('dropping any single guard breaks the model again', () => {
  const keys = ['foresight_seal', 'pending_fulfillment_state', 'no_retcon_rule', 'harm_is_permanent'];
  for (const dropped of keys) {
    const config = Object.fromEntries(keys.map(k => [k, k !== dropped]));
    assert.equal(testVisitsBecomeHistory(config).coherent, false, `${dropped} was not load-bearing`);
  }
});

test('the encounter is held PENDING_FULFILLMENT under every causality model', () => {
  const record = encounter.historical_record;
  assert.equal(record.model_state, 'OPEN');
  for (const key of Object.keys(record).filter(k => k.startsWith('under_'))) {
    assert.equal(record[key].record_state, 'PENDING_FULFILLMENT');
  }
});

// ---------------------------------------------------------- OPEN MECHANICS
test('all six mechanics are open and none is silently canonized', () => {
  assert.deepEqual(openMechanics(),
    ['ENTRY_EXIT', 'CLOTHING', 'VISIT_DURATION', 'INJURY_DEATH', 'CAUSALITY', 'INFORMATION_TRANSFER']);
});

test('every mechanic carries two or three alternatives, each with a consequence and a cost', () => {
  for (const mechanic of Object.values(OPEN_MECHANICS)) {
    assert.ok(mechanic.options.length >= 2 && mechanic.options.length <= 3, mechanic.mechanic_id);
    for (const option of mechanic.options) {
      assert.ok(option.rule && option.consequence && option.cost, `${option.code} is under-specified`);
    }
  }
});

test('VISITS_BECOME_HISTORY is present as a causality candidate', () => {
  assert.ok(OPEN_MECHANICS.CAUSALITY.options.some(o => o.code === 'CA_A_VISITS_BECOME_HISTORY'));
});

test('a selection must name who decided it and never mutates the registry', () => {
  assert.throws(() => selectOption('CAUSALITY', 'CA_A_VISITS_BECOME_HISTORY'), /who decided/);
  const selected = selectOption('CAUSALITY', 'CA_A_VISITS_BECOME_HISTORY', 'Chairman');
  assert.equal(selected.selected, 'CA_A_VISITS_BECOME_HISTORY');
  assert.equal(OPEN_MECHANICS.CAUSALITY.selected, null);
});

// ------------------------------------------------------------------ CASTLE
test('PEETE CASTLE is prohibited and the check is not case sensitive', () => {
  assert.ok(isProhibitedName('Peete Castle'));
  assert.ok(isProhibitedName('  peete   castle '));
  assert.ok(isProhibitedName('Walter Peete Castle'));
  assert.ok(PROHIBITED_NAMES.includes('PEETE CASTLE'));
});

test('no castle name candidate is prohibited', () => {
  for (const candidate of castle.native_name_candidates) {
    assert.equal(isProhibitedName(candidate.name), false, candidate.name);
  }
});

test('every candidate name derives from native land, language and history', () => {
  for (const candidate of castle.native_name_candidates) {
    const result = validateNativeName(candidate);
    assert.deepEqual([...result.problems], [], candidate.name);
    assert.equal(result.canon, false);
  }
  assert.equal(castle.native_name_candidates.length, 3);
});

test('a name without a derivation is refused', () => {
  const result = validateNativeName({ name: 'Somename' });
  assert.equal(result.valid, false);
  assert.ok(result.problems.some(p => p.code === 'DERIVATION_LAND_MISSING'));
  assert.ok(result.problems.some(p => p.code === 'MORPHEMES_INSUFFICIENT'));
});

test('the castle is one place across every era stratum', () => {
  const [first, ...rest] = castle.strata;
  for (const stratum of rest) {
    const comparison = compareStrata(first, stratum);
    assert.equal(comparison.same_place, true, stratum.stratum_id);
    assert.deepEqual([...comparison.broken_invariants], []);
  }
});

test('what changes by era actually changes', () => {
  const [seventeen, nineteenTwentyTwo] = castle.strata;
  const differences = compareStrata(seventeen, nineteenTwentyTwo).era_differences;
  for (const field of ['rooms', 'walls', 'repairs', 'objects', 'occupants', 'staff', 'businesses', 'furniture', 'art']) {
    assert.ok(differences.includes(field), `${field} did not change between eras`);
  }
});

test('the people in every castle stratum are living', () => {
  for (const stratum of castle.strata) assert.equal(stratum.people_state, 'LIVING');
});

test('the castle name is unsealed and awaits a Chairman decision', () => {
  assert.equal(castle.native_name_state, 'CANDIDATE_SET_OPEN');
  assert.equal(castle.canon, false);
  assert.ok(castle.chairman_decisions_required.length >= 4);
});
