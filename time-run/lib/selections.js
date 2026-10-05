// TIME RUN · working selections, recorded additively
// Workroom: WR-RECONCILE-667 · reconciles WR-TIMERUN-581 forward to live head 667
//
// NO-LOSS. This file does not delete, replace or rewrite the six-option research
// in mechanics.js. That research stays exactly as written. This file records
// which option is the Chairman's present WORKING selection and gives every other
// option an explicit disposition, so nothing is erased by being unchosen.
//
// A WORKING selection is not canon. It is the direction work proceeds in until
// the Chairman seals or changes it.

export const DISPOSITIONS = Object.freeze({
  SELECTED_WORKING: 'The Chairman\'s present working direction. Work proceeds here. Not sealed as canon.',
  RETAINED_ALTERNATIVE: 'Not selected. Kept in full, with its consequence and cost, and available without re-derivation.',
  SUPERSEDED_AS_CURRENT_CANDIDATE: 'Was the leading candidate and is no longer the working direction. All of its work, tests and findings are preserved.'
});

const DECIDED_BY = 'Chairman — cross-agent reconciliation packet applied at live head 667';
const DECIDED_AT = '2026-10-05';

function selection(mechanic, selected, dispositions, notes) {
  return Object.freeze({
    mechanic, selected, state: 'SELECTED_WORKING', canon: false,
    decided_by: DECIDED_BY, decided_at: DECIDED_AT,
    dispositions: Object.freeze(dispositions), notes
  });
}

export const WORKING_SELECTIONS = Object.freeze({
  ENTRY_EXIT: selection('ENTRY_EXIT', 'EE_A_THRESHOLD_SITES', {
    EE_A_THRESHOLD_SITES: 'SELECTED_WORKING',
    EE_B_CARRIED_ANCHOR: 'RETAINED_ALTERNATIVE',
    EE_C_HOST_ADMISSION: 'RETAINED_ALTERNATIVE'
  }, 'The Royal Castle (ER-CASTLE-ROYAL-001) is a working threshold site, subject to continuity inspection against castle canon before canonization.'),

  CLOTHING: selection('CLOTHING', 'CL_C_PARTIAL', {
    CL_A_ARRIVAL_VESTING: 'RETAINED_ALTERNATIVE',
    CL_B_NO_ADAPTATION: 'RETAINED_ALTERNATIVE',
    CL_C_PARTIAL: 'SELECTED_WORKING'
  }, 'Clothing obeys the destination capability envelope exactly as any other carried object. No clothing exception exists anywhere in the law.'),

  VISIT_DURATION: selection('VISIT_DURATION', 'VD_C_OPEN_RESIDENCE', {
    VD_A_FIXED_WINDOW: 'RETAINED_ALTERNATIVE',
    VD_B_ANCHOR_DECAY: 'RETAINED_ALTERNATIVE',
    VD_C_OPEN_RESIDENCE: 'SELECTED_WORKING'
  }, 'A living era must permit someone to genuinely remain and live there. VD_B is additionally unavailable under EE_A, because it requires the carried anchor of EE_B.'),

  INJURY_DEATH: selection('INJURY_DEATH', 'ID_A_FULLY_EMBODIED', {
    ID_A_FULLY_EMBODIED: 'SELECTED_WORKING',
    ID_B_RETURN_ON_CRITICAL: 'RETAINED_ALTERNATIVE',
    ID_C_ERA_BOUND_MORTALITY: 'RETAINED_ALTERNATIVE'
  }, 'Matches the live backend death_rule in thylora_time_run_registry THY-TIME-RUN-001 v4: death_is_real true, death_time is when death occurs regardless of visited era, body_may_return_to_origin_era true. Safety belongs in the authorization layer, not in making the traveler less real than the people of the destination era.'),

  CAUSALITY: selection('CAUSALITY', 'CA_C_LEDGERED_CAUSALITY', {
    CA_A_VISITS_BECOME_HISTORY: 'SUPERSEDED_AS_CURRENT_CANDIDATE',
    CA_B_BRANCH_ON_CHANGE: 'RETAINED_ALTERNATIVE',
    CA_C_LEDGERED_CAUSALITY: 'SELECTED_WORKING'
  }, 'CA_A is NOT canonized. Its unresolved CONSISTENCY_PRESSURE problem — what prevents an action that eliminates the departure itself — is the stated reason. Every CA_A guard, test and finding is preserved and still runs.'),

  INFORMATION_TRANSFER: selection('INFORMATION_TRANSFER', 'IT_C_LEDGERED_DISCLOSURE', {
    IT_A_SPEECH_ONLY: 'RETAINED_ALTERNATIVE',
    IT_B_ERA_EXPRESSIBLE: 'RETAINED_ALTERNATIVE',
    IT_C_LEDGERED_DISCLOSURE: 'SELECTED_WORKING'
  }, 'Destination-era people retain agency and may decline information. Knowledge may cross; technological capability may not; knowledge that cannot be instantiated under destination-era capability stays KNOWN_NOT_BUILDABLE.')
});

/**
 * CA_C and the live backend rule are compatible, and that compatibility is the
 * reason selecting CA_C does not contradict canon.
 *
 * thylora_time_run_registry.THY-TIME-RUN-001 v4 (IMPLEMENTATION_ACTIVE,
 * CHAIRMAN_DIRECTIVE) carries: visitor_history_rule — "Visits and encounters
 * become part of that eras lived history."
 *
 * CA_A and CA_C BOTH satisfy that rule. CA_A adds the stronger claims (no
 * branch ever, plus four guards). CA_C is the narrower reading: one ledger,
 * declared precedence, contested entries marked. So the live rule is the shared
 * floor of the two, not a selection of CA_A.
 */
export const CAUSALITY_RECONCILIATION = Object.freeze({
  live_rule: 'visitor_history_rule: Visits and encounters become part of that eras lived history.',
  live_source: 'thylora_time_run_registry THY-TIME-RUN-001 v4, read live 2026-10-05',
  satisfied_by_CA_A: true,
  satisfied_by_CA_C: true,
  reading: 'The live rule is the shared floor of CA_A and CA_C. Selecting CA_C does not move backward from it.',
  chairman_decision_open: 'Whether the live visitor_history_rule should be read as the shared floor (this reading) or as an existing selection of CA_A.'
});

export function dispositionOf(mechanicId, optionCode) {
  const record = WORKING_SELECTIONS[mechanicId];
  if (!record) throw new RangeError(`unknown mechanic ${mechanicId}`);
  const disposition = record.dispositions[optionCode];
  if (!disposition) throw new RangeError(`${optionCode} is not an option of ${mechanicId}`);
  return disposition;
}

/** Nothing here is canon. Every selection is working-state until sealed. */
export function sealedMechanics() {
  return Object.values(WORKING_SELECTIONS).filter(s => s.canon === true).map(s => s.mechanic);
}
