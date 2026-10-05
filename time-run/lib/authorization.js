// TIME RUN · traversal authorization and prevention layer
// Workroom: WR-RECONCILE-667
//
// WHY THIS LAYER EXISTS
// The Chairman selected ID-A FULLY EMBODIED, matching the live backend rule in
// thylora_time_run_registry THY-TIME-RUN-001 v4:
//   death_is_real = true
//   death_time    = when death occurs, regardless of visited era
//   body_may_return_to_origin_era = true
//
// Death being real is what makes this file load-bearing. Safety is NOT bought by
// making the traveler less real than the people of the destination era — that was
// the cost of ID-B and ID-C and it was refused. Safety is bought BEFORE departure,
// by refusing or conditioning the traversal. A traversal that should not happen is
// stopped here, not survived there.
//
// This matches the released Time Run posture already in the app room: speed never
// outranks a person in danger, and invitation is a privilege rather than a right.

import { getEra, ceilingFor } from './eras.js';

export const AUTHORIZATION_STATES = Object.freeze({
  AUTHORIZED: 'Cleared to depart.',
  AUTHORIZED_WITH_CONDITIONS: 'Cleared only once every named condition is met.',
  REFUSED: 'Not cleared. The traversal does not happen.'
});

/** Every blocker names what must change, so a refusal is never a dead end. */
function blocker(code, finding, clears_when, severity) {
  return Object.freeze({ code, finding, clears_when, severity });
}

/**
 * @param {object} request
 *   traveler               { traveler_id, death_rule_acknowledged, known_medical_needs[], is_minor, guardian_authority }
 *   origin_era, destination_era
 *   entry_exit_mechanic    working selection, EE_A_THRESHOLD_SITES
 *   threshold              { place_id, exists_in_origin_era, exists_in_destination_era, admits }
 *   duration_mechanic      working selection, VD_C_OPEN_RESIDENCE
 *   residence              { intent, origin_era_continuity_arrangement }
 *   purpose                declared purpose of the traversal
 */
export function authorizeTraversal(request = {}) {
  const blockers = [];
  const conditions = [];

  const traveler = request.traveler ?? {};
  const threshold = request.threshold ?? {};
  const residence = request.residence ?? {};

  // --- ID-A: death is real, and the traveler must know it before departing ---
  if (traveler.death_rule_acknowledged !== true) {
    blockers.push(blocker('DEATH_RULE_NOT_ACKNOWLEDGED',
      'Under ID-A death in a destination era is real and permanent.',
      'The traveler records acknowledgement of the death rule before departure.',
      'REFUSE'));
  }

  // --- Destination-era medicine against the traveler's known needs ---
  let medicineCeiling = null;
  if (request.destination_era) {
    try {
      getEra(request.destination_era);
      medicineCeiling = ceilingFor(request.destination_era, 'MEDICINE');
    } catch (error) {
      blockers.push(blocker('UNKNOWN_DESTINATION_ERA', error.message, 'A known era is named.', 'REFUSE'));
    }
  } else {
    blockers.push(blocker('NO_DESTINATION_ERA', 'No destination era declared.', 'A destination era is named.', 'REFUSE'));
  }

  for (const need of traveler.known_medical_needs ?? []) {
    const required = Number(need.required_tier ?? 0);
    if (medicineCeiling !== null && required > medicineCeiling) {
      blockers.push(blocker('MEDICAL_FLOOR_NOT_MET',
        `${need.label ?? 'a known medical need'} requires MEDICINE tier ${required}; the destination era supplies ${medicineCeiling}.`,
        'The need is carried in an era-instantiable form, or the traversal is refused. The envelope will not let later-era treatment function there.',
        'REFUSE'));
    }
  }

  // --- EE-A: a threshold must exist on BOTH sides and must admit ---
  if (request.entry_exit_mechanic === 'EE_A_THRESHOLD_SITES') {
    if (!threshold.place_id) {
      blockers.push(blocker('NO_THRESHOLD_SITE', 'EE-A permits crossing only at a surveyed threshold site.',
        'A threshold place is named.', 'REFUSE'));
    }
    if (threshold.exists_in_origin_era === false || threshold.exists_in_destination_era === false) {
      blockers.push(blocker('THRESHOLD_NOT_IN_BOTH_ERAS',
        'The threshold must exist in the origin era and in the destination era.',
        'A threshold existing in both eras is named, or the route is closed.', 'REFUSE'));
    }
    if (threshold.admits === false) {
      blockers.push(blocker('THRESHOLD_DOES_NOT_ADMIT',
        'The threshold site does not admit this traversal. Invitation is a privilege, not a right.',
        'Admission is granted by whoever holds the site in the destination era.', 'REFUSE'));
    }
  }

  // --- VD-C: open residence has no automatic return, so intent is declared ---
  if (request.duration_mechanic === 'VD_C_OPEN_RESIDENCE') {
    if (!residence.intent) {
      conditions.push(blocker('RESIDENCE_INTENT_UNDECLARED',
        'Under VD-C nothing returns the traveler automatically.',
        'The traveler declares VISIT or REMAIN before departure.', 'CONDITION'));
    }
    if (residence.intent === 'REMAIN' && !residence.origin_era_continuity_arrangement) {
      blockers.push(blocker('ORIGIN_ERA_CONTINUITY_UNRESOLVED',
        'A traveler who remains leaves obligations, dependants and records behind in the origin era.',
        'An origin-era continuity arrangement is recorded.', 'REFUSE'));
    }
  }

  // --- Guardian authority, matching the safeguard posture already in RAE Link ---
  if (traveler.is_minor === true && !traveler.guardian_authority) {
    blockers.push(blocker('GUARDIAN_REQUIRED',
      'A minor cannot authorize an embodied traversal where death is real.',
      'Guardian authority is recorded.', 'REFUSE'));
  }

  if (!request.purpose) {
    conditions.push(blocker('PURPOSE_UNDECLARED', 'No declared purpose for the traversal.',
      'A purpose is recorded.', 'CONDITION'));
  }

  const refusals = blockers.filter(b => b.severity === 'REFUSE');
  const state = refusals.length ? 'REFUSED'
    : conditions.length ? 'AUTHORIZED_WITH_CONDITIONS'
    : 'AUTHORIZED';

  return Object.freeze({
    state,
    meaning: AUTHORIZATION_STATES[state],
    blockers: Object.freeze(refusals),
    conditions: Object.freeze(conditions),
    death_rule: 'ID_A_FULLY_EMBODIED — death is real; it occurs when it occurs regardless of visited era; the body may return to the origin era.',
    safety_posture: 'Prevention sits before departure. The traveler is not made less real than the people of the destination era.',
    live_source: 'thylora_time_run_registry THY-TIME-RUN-001 v4, read live 2026-10-05'
  });
}
