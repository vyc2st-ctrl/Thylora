// TIME RUN · causality candidates and the encounter contract
// Workroom: WR-TIMERUN-581 · Directive: THY-WORK-TIME-RUN-LIVE-TRAVERSAL-581
//
// NOTHING HERE IS CANON. Three causality models are carried side by side and
// each must be selected explicitly. Selecting one is a Chairman decision, not a
// code default. `CANON_CAUSALITY_MODEL` is deliberately null.

import { getEra } from './eras.js';
import { auditForLeak, applyCapabilityEnvelope, ALLOWED_OVER_CEILING } from './traversal.js';

export const CANON_CAUSALITY_MODEL = null; // do not silently canonize

export const CAUSALITY_MODELS = Object.freeze({
  CA_A_VISITS_BECOME_HISTORY: Object.freeze({
    label: 'Visits become history',
    statement: 'Once a cross-era meeting occurs, that meeting is part of the historical record. It does not automatically open a branch timeline.',
    branches: false,
    requires: Object.freeze(['FORESIGHT_SEAL', 'PENDING_FULFILLMENT_STATE', 'NO_RETCON_RULE'])
  }),
  CA_B_BRANCH_ON_CHANGE: Object.freeze({
    label: 'Branch on change',
    statement: 'The record holds until a traversal changes a recorded outcome above a declared threshold. At that point a branch record opens and both lines are kept.',
    branches: true,
    requires: Object.freeze(['CHANGE_THRESHOLD', 'BRANCH_REGISTRY', 'BRANCH_RECONCILIATION'])
  }),
  CA_C_LEDGERED_CAUSALITY: Object.freeze({
    label: 'Ledgered causality',
    statement: 'One historical ledger, no metaphysics. Every traversal writes an entry. Conflicting entries are marked CONTESTED and resolved by declared precedence, never silently.',
    branches: false,
    requires: Object.freeze(['PRECEDENCE_RULE', 'CONTESTED_STATE', 'RESOLUTION_WITNESS'])
  })
});

export const HISTORICAL_RECORD_STATES = Object.freeze([
  'PENDING_FULFILLMENT', // a trace exists but the departure has not happened yet
  'FULFILLED',           // departure and encounter both exist
  'CONTESTED',           // two entries disagree
  'SEALED'               // closed to further edit
]);

/**
 * VISITS_BECOME_HISTORY consequence test.
 *
 * The model is coherent only if all four guards are present. This function is
 * the test, not a decoration: it returns the guards a given configuration is
 * missing, so the model cannot be adopted by accident.
 */
export function testVisitsBecomeHistory(config = {}) {
  const findings = [];

  if (!config.foresight_seal) {
    findings.push({
      code: 'FORESIGHT_TRAP',
      consequence: 'A traveler could read the record of a visit they have not yet made and act on it.',
      guard: 'FORESIGHT_SEAL: records of a traversal whose departure has not occurred are sealed from that traveler.'
    });
  }
  if (!config.pending_fulfillment_state) {
    findings.push({
      code: 'UNFULFILLED_TRACE',
      consequence: 'An earlier-era record naming a traveler who never departs would be evidence for an event that never happened.',
      guard: 'PENDING_FULFILLMENT: such a trace is held as PENDING_FULFILLMENT and is not evidence until the departure exists.'
    });
  }
  if (!config.no_retcon_rule) {
    findings.push({
      code: 'RETCON_ESCAPE',
      consequence: 'A traveler could return to prevent their own visit, erasing a recorded meeting and the people who witnessed it.',
      guard: 'NO_RETCON: a FULFILLED encounter cannot be removed, only annotated.'
    });
  }
  if (!config.harm_is_permanent) {
    findings.push({
      code: 'CONSEQUENCE_FREE_HARM',
      consequence: 'If visits are history and harm can be reset, the model quietly turns living people back into props.',
      guard: 'HARM IS PERMANENT: harm done in an era is permanent history and is reviewable under the protection architecture.'
    });
  }

  return Object.freeze({
    model: 'CA_A_VISITS_BECOME_HISTORY',
    coherent: findings.length === 0,
    findings: Object.freeze(findings),
    unresolved_question: 'What prevents an action that would stop the departure? Named CONSISTENCY_PRESSURE and left OPEN. Not canonized.'
  });
}

// ---------------------------------------------------------------------------
// ENCOUNTER CONTRACT
// ---------------------------------------------------------------------------

export const ENCOUNTER_FIELDS = Object.freeze([
  'traveler', 'origin_era', 'destination_era', 'arrival_place', 'arrival_time',
  'people_met', 'objects_carried', 'capability_transformations', 'information_shared',
  'departure', 'memory_retained', 'historical_record', 'provenance'
]);

/**
 * Validate an encounter contract. Returns every problem at once, each naming
 * the field that carries it — the same reporting posture as the RAE Link gate.
 */
export function evaluateEncounterContract(contract = {}) {
  const problems = [];
  const add = (code, field, message) => problems.push({ code, field, message });

  for (const field of ENCOUNTER_FIELDS) {
    if (contract[field] === undefined || contract[field] === null) {
      add('FIELD_MISSING', field, `${field} is required by the encounter contract.`);
    }
  }

  // TR-L1 / TR-L6: living era, living people
  const people = Array.isArray(contract.people_met) ? contract.people_met : [];
  if (contract.people_met !== undefined && people.length === 0) {
    add('NO_PEOPLE_RECORDED', 'people_met', 'A traversal into a living era records the people met, or records explicitly that none were met.');
  }
  for (const person of people) {
    if (person.living !== true) {
      add('PERSON_NOT_LIVING', 'people_met', `${person.person_id ?? 'person'} must be recorded as living their own life in their era.`);
    }
    if (!person.era_role_state) {
      add('PERSON_ROLE_STATE_MISSING', 'people_met', `${person.person_id ?? 'person'} needs an era_role_state (may be UNSEALED).`);
    }
  }
  if (contract.viewer_mode === true || contract.passive === true) {
    add('PASSIVE_VIEWER_REGRESSION', 'traveler', 'Time Run has no viewer mode. A traveler is physically present.');
  }

  // TR-L4 / TR-L5: envelope and leak
  const objects = Array.isArray(contract.objects_carried) ? contract.objects_carried : [];
  if (contract.origin_era && contract.destination_era) {
    try {
      getEra(contract.origin_era); getEra(contract.destination_era);
      const crossing = { origin_era: contract.origin_era, destination_era: contract.destination_era };
      const leaks = auditForLeak(objects, crossing);
      for (const leak of leaks) add(leak.code, 'objects_carried', `${leak.object_id} would function above the destination ceiling.`);

      const transformations = Array.isArray(contract.capability_transformations) ? contract.capability_transformations : [];
      for (const object of objects) {
        const arrival = applyCapabilityEnvelope(object, crossing);
        const overCeiling = arrival.declared_tier > arrival.destination_ceiling;

        // A manifest that declares a later-era object arrives working is refused
        // outright, not quietly corrected.
        if (overCeiling && object.envelope_rule && !ALLOWED_OVER_CEILING.includes(object.envelope_rule)) {
          add('ENVELOPE_RULE_INVALID', 'objects_carried',
            `${object.object_id} declares envelope_rule ${object.envelope_rule} above the destination ceiling. Permitted: ${ALLOWED_OVER_CEILING.join(', ')}.`);
        }

        const recorded = transformations.find(t => t.object_id === object.object_id);
        if (arrival.arrival_state !== 'NATIVE' && !recorded) {
          add('TRANSFORMATION_UNRECORDED', 'capability_transformations',
            `${object.object_id} arrives ${arrival.arrival_state} and that change must be recorded.`);
        }
        if (recorded && recorded.arrival_state && recorded.arrival_state !== arrival.arrival_state) {
          add('TRANSFORMATION_MISDECLARED', 'capability_transformations',
            `${object.object_id} is recorded as ${recorded.arrival_state} but the envelope produces ${arrival.arrival_state}.`);
        }
        if (recorded && Number(recorded.functioning_tier) > arrival.destination_ceiling) {
          add('TIME_TECHNOLOGY_LEAK', 'capability_transformations',
            `${object.object_id} is recorded functioning above the destination ceiling.`);
        }
      }
    } catch (error) {
      add('UNKNOWN_ERA', 'origin_era', error.message);
    }
  }

  // TR-L8: provenance
  const provenance = contract.provenance ?? {};
  for (const key of ['serial', 'recorded_by', 'workroom', 'record_state']) {
    if (!provenance[key]) add('PROVENANCE_INCOMPLETE', 'provenance', `provenance.${key} is required.`);
  }
  if (provenance.record_state && !HISTORICAL_RECORD_STATES.includes(provenance.record_state)) {
    add('RECORD_STATE_UNKNOWN', 'provenance', `${provenance.record_state} is not a historical record state.`);
  }

  // TR-L4: memory always survives
  if (contract.memory_retained && contract.memory_retained.retained === false) {
    add('MEMORY_STRIPPED', 'memory_retained', 'Memory is retained across every crossing in every direction.');
  }

  return Object.freeze({
    contract_state: problems.length === 0 ? 'COMPLETE' : 'INCOMPLETE',
    problems: Object.freeze(problems),
    fields_present: ENCOUNTER_FIELDS.filter(f => contract[f] !== undefined && contract[f] !== null).length,
    fields_required: ENCOUNTER_FIELDS.length
  });
}
