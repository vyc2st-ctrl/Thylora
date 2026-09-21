// TIME RUN · traversal law tests
// Workroom: WR-TIMERUN-581
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ERAS, traversalDirection, ceilingFor } from '../time-run/lib/eras.js';
import {
  applyCapabilityEnvelope, auditForLeak, retainedByTraveler,
  evaluateInstantiation, classifyDisclosure, CORE_LAWS, ARRIVAL_STATES
} from '../time-run/lib/traversal.js';

const BACK = { origin_era: 'ERA_CURRENT', destination_era: 'ERA_1700S' };
const FORWARD = { origin_era: 'ERA_1922', destination_era: 'ERA_CURRENT' };

test('every era in the registry is living', () => {
  for (const era of Object.values(ERAS)) assert.equal(era.living, true);
});

test('travel is bidirectional and neither direction is the default', () => {
  assert.equal(traversalDirection('ERA_CURRENT', 'ERA_1700S'), 'LATER_TO_EARLIER');
  assert.equal(traversalDirection('ERA_1922', 'ERA_CURRENT'), 'EARLIER_TO_LATER');
  assert.equal(traversalDirection('ERA_1700S', 'ERA_1700S'), 'SAME_ERA');
});

test('there is no functioning-above-ceiling arrival state', () => {
  assert.equal(Object.keys(ARRIVAL_STATES).length, 5);
  assert.ok(!Object.keys(ARRIVAL_STATES).some(s => /VIEW|PASSIVE|OBSERV/.test(s)));
});

test('the laws name the living era and forbid the viewer', () => {
  assert.match(CORE_LAWS['TR-L1'], /LIVING ERA/);
  assert.match(CORE_LAWS['TR-L1'], /viewer surface/);
});

test('a later-era device does not function in an earlier era', () => {
  const arrival = applyCapabilityEnvelope(
    { object_id: 'OBJ-001', label: 'handset', domain: 'COMPUTATION', capability_tier: 80 }, BACK);
  assert.equal(arrival.arrival_state, 'INERT');
  assert.equal(arrival.functioning_tier, 0);
  assert.ok(arrival.functioning_tier <= arrival.destination_ceiling);
});

test('the default for an over-ceiling object is INERT, never functioning', () => {
  for (const tier of [31, 55, 80, 99]) {
    const arrival = applyCapabilityEnvelope({ object_id: 'x', capability_tier: tier }, BACK);
    assert.equal(arrival.functioning_tier, 0);
  }
});

test('DEGRADED_TO_ERA functions at the destination ceiling and not one tier above', () => {
  const arrival = applyCapabilityEnvelope(
    { object_id: 'OBJ-CAR', domain: 'TRANSPORT', capability_tier: 78, envelope_rule: 'DEGRADED_TO_ERA' }, BACK);
  assert.equal(arrival.functioning_tier, ceilingFor('ERA_1700S', 'TRANSPORT'));
  assert.equal(arrival.functioning_tier, 28);
});

test('an era-available object arrives NATIVE and keeps its own tier', () => {
  const arrival = applyCapabilityEnvelope(
    { object_id: 'OBJ-003', domain: 'RECORDING', capability_tier: 18 }, BACK);
  assert.equal(arrival.arrival_state, 'NATIVE');
  assert.equal(arrival.functioning_tier, 18);
});

test('earlier to later: an earlier-era object is simply native in the later era', () => {
  const arrival = applyCapabilityEnvelope(
    { object_id: 'OBJ-1922', domain: 'TRANSPORT', capability_tier: 55 }, FORWARD);
  assert.equal(arrival.direction, 'EARLIER_TO_LATER');
  assert.equal(arrival.arrival_state, 'NATIVE');
});

test('a 1922 visitor cannot carry current technology home as technology', () => {
  const taken = applyCapabilityEnvelope(
    { object_id: 'OBJ-PHONE', domain: 'COMPUTATION', capability_tier: 80 },
    { origin_era: 'ERA_CURRENT', destination_era: 'ERA_1922' });
  assert.equal(taken.arrival_state, 'INERT');
  assert.equal(taken.functioning_tier, 0);
});

test('a conforming manifest produces no leak findings', () => {
  const objects = [
    { object_id: 'OBJ-001', domain: 'COMPUTATION', capability_tier: 80, envelope_rule: 'INERT' },
    { object_id: 'OBJ-002', domain: 'MATERIALS', capability_tier: 22 },
    { object_id: 'OBJ-003', domain: 'RECORDING', capability_tier: 18 }
  ];
  assert.deepEqual(auditForLeak(objects, BACK), []);
});

test('no envelope rule can be chosen that produces a leak', () => {
  for (const rule of ['NATIVE', 'FUNCTIONING', 'DEGRADED_TO_ERA', 'INERT', 'TRANSFORMED', 'REFUSED_ENTRY', undefined]) {
    const arrival = applyCapabilityEnvelope(
      { object_id: 'x', domain: 'COMPUTATION', capability_tier: 80, envelope_rule: rule }, BACK);
    assert.ok(arrival.functioning_tier <= arrival.destination_ceiling,
      `${rule} produced a functioning tier above the ceiling`);
  }
});

test('a traveler keeps identity, memory, knowledge and experience in both directions', () => {
  for (const crossing of [BACK, FORWARD]) {
    const kept = retainedByTraveler({ traveler_id: 'THY-PER-VYCTOR-EBENEZER' }, crossing);
    assert.deepEqual([...kept.retained], ['IDENTITY', 'MEMORY', 'KNOWLEDGE', 'EXPERIENCE']);
    assert.deepEqual([...kept.not_retained], ['TECHNOLOGICAL_CAPABILITY']);
  }
});

test('knowledge is retained but is not buildable above the era ceiling', () => {
  const result = evaluateInstantiation(
    { knowledge_id: 'K1', domain: 'COMPUTATION', required_tier: 80 }, 'ERA_1700S');
  assert.equal(result.retained_as_knowledge, true);
  assert.equal(result.instantiable, false);
  assert.equal(result.code, 'NOT_INSTANTIABLE_IN_ERA');
});

test('knowledge within the era can be built with era means', () => {
  const result = evaluateInstantiation(
    { knowledge_id: 'K2', domain: 'MATERIALS', required_tier: 25 }, 'ERA_1700S');
  assert.equal(result.instantiable, true);
});

test('speech-only refuses an artifact and lands a spoken word', () => {
  const spoken = classifyDisclosure(
    { disclosure_id: 'D1', form: 'SPOKEN', domain: 'RECORDING', required_tier: 0 }, 'ERA_1700S', 'IT_A_SPEECH_ONLY');
  assert.equal(spoken.landed, true);
  const artifact = classifyDisclosure(
    { disclosure_id: 'D2', form: 'ARTIFACT', domain: 'RECORDING', required_tier: 0 }, 'ERA_1700S', 'IT_A_SPEECH_ONLY');
  assert.equal(artifact.landed, false);
  assert.equal(artifact.code, 'REFUSED_NOT_SPEECH');
});

test('information can land and still be unbuildable in the era', () => {
  const told = classifyDisclosure(
    { disclosure_id: 'D3', form: 'SPOKEN', domain: 'COMPUTATION', required_tier: 80 }, 'ERA_1700S', 'IT_B_ERA_EXPRESSIBLE');
  assert.equal(told.landed, true);
  assert.equal(told.instantiable_in_era, false);
  assert.equal(told.era_impact, 'KNOWN_NOT_BUILDABLE');
});

test('under ledgered disclosure the person in the era may decline', () => {
  const declined = classifyDisclosure(
    { disclosure_id: 'D4', form: 'SPOKEN', domain: 'RECORDING', required_tier: 0, declined_by_recipient: true },
    'ERA_1700S', 'IT_C_LEDGERED_DISCLOSURE');
  assert.equal(declined.landed, false);
  assert.equal(declined.code, 'DECLINED_BY_RECIPIENT');
  assert.equal(declined.ledgered, true);
});
