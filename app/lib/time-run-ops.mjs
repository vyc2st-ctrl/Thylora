// THY-WORK-TIME-RUN-OPS-VERONICA-582
// Time Run operations logic. Pure functions, no DOM, no network.
// Mirrors the rules enforced in db/time-run/. Used by app/time-run-room.js
// and by tests/time-run-ops.test.mjs.

// ---------------------------------------------------------------------------
// Crew
// ---------------------------------------------------------------------------

export const CREW_ROLES = Object.freeze([
  { code: 'ROAD_CAPTAIN',      label: 'Road captain',           group: 'COMMAND',       min: 1, ready: true },
  { code: 'SECOND',            label: 'Second',                 group: 'COMMAND',       min: 1, ready: true },
  { code: 'DRIVER',            label: 'Driver',                 group: 'DRIVE',         min: 2, ready: true },
  { code: 'WHEELWRIGHT',       label: 'Wheelwright',            group: 'MECHANICAL',    min: 1, ready: true },
  { code: 'SMITH',             label: 'Smith',                  group: 'MECHANICAL',    min: 1, ready: true },
  { code: 'HARNESS_MAKER',     label: 'Harness and leather',    group: 'MECHANICAL',    min: 1, ready: false },
  { code: 'HOSTLER',           label: 'Hostler / animal lead',  group: 'ANIMAL',        min: 1, ready: true },
  { code: 'GROOM',             label: 'Groom',                  group: 'ANIMAL',        min: 2, ready: true },
  { code: 'FARRIER',           label: 'Farrier',                group: 'ANIMAL',        min: 1, ready: false },
  { code: 'QUARTERMASTER',     label: 'Quartermaster',          group: 'SUPPLY',        min: 1, ready: true },
  { code: 'COOK',              label: 'Cook',                   group: 'SUPPLY',        min: 1, ready: true },
  { code: 'SURGEON',           label: 'Surgeon / medical lead', group: 'MEDICAL',       min: 1, ready: true },
  { code: 'MEDICAL_ASSISTANT', label: 'Medical assistant',      group: 'MEDICAL',       min: 1, ready: false },
  { code: 'RUNNER',            label: 'Runner / courier',       group: 'COMMUNICATION', min: 2, ready: true },
  { code: 'SIGNALLER',         label: 'Signaller',              group: 'COMMUNICATION', min: 1, ready: false },
  { code: 'LOCAL_GUIDE',       label: 'Local guide',            group: 'LOCAL',         min: 1, ready: true },
  { code: 'INTERPRETER',       label: 'Interpreter',            group: 'LOCAL',         min: 0, ready: false },
  { code: 'ESCORT',            label: 'Escort / security',      group: 'SECURITY',      min: 2, ready: true },
  { code: 'WITNESS_KEEPER',    label: 'Witness keeper',         group: 'RECORD',        min: 1, ready: true },
]);

export const TEAM_SIZE_MIN = 8;
export const TEAM_SIZE_MAX = 26;

/** Minimum crew a team must carry to be READY. */
export function minimumReadyCrew() {
  return CREW_ROLES.filter((r) => r.ready).reduce((n, r) => n + r.min, 0);
}

/**
 * @param {{role_code:string, slot_state:string}[]} slots
 * @returns {{ready:boolean, shortfall:{code:string,label:string,short:number}[]}}
 */
export function teamReadiness(slots = []) {
  const filled = new Map();
  for (const s of slots) {
    if (s.slot_state !== 'FILLED') continue;
    filled.set(s.role_code, (filled.get(s.role_code) || 0) + 1);
  }
  const shortfall = [];
  for (const role of CREW_ROLES) {
    if (!role.ready) continue;
    const have = filled.get(role.code) || 0;
    if (have < role.min) {
      shortfall.push({ code: role.code, label: role.label, short: role.min - have });
    }
  }
  return { ready: shortfall.length === 0, shortfall };
}

/** A local hire is only valid with recorded consent and era pay. */
export function localHireValid(slot) {
  if (slot.engagement_kind !== 'LOCAL_HIRE') return true;
  return Boolean(slot.consent_recorded) &&
         Boolean(slot.paid_in_era_money) &&
         Number.isInteger(slot.pay_rate_minor) && slot.pay_rate_minor >= 0;
}

// ---------------------------------------------------------------------------
// Money. Integer minor units only.
// ---------------------------------------------------------------------------

export function convertMoney({ sourceMinor, rateNumerator, rateDenominator, feeMinor = 0,
                               convertedByRole, witnessedByRole }) {
  if (!Number.isInteger(sourceMinor) || sourceMinor <= 0) {
    throw new Error('THYTR-MONEY-001 source amount must be a positive integer in minor units');
  }
  if (!Number.isInteger(rateNumerator) || rateNumerator <= 0 ||
      !Number.isInteger(rateDenominator) || rateDenominator <= 0) {
    throw new Error('THYTR-MONEY-002 rate must be a positive integer ratio');
  }
  if (!Number.isInteger(feeMinor) || feeMinor < 0) {
    throw new Error('THYTR-MONEY-003 fee must be a non-negative integer in minor units');
  }
  if (!convertedByRole || !witnessedByRole || convertedByRole === witnessedByRole) {
    throw new Error('THYTR-MONEY-004 conversion needs two distinct roles: one converts, one witnesses');
  }
  const gross = Math.floor((sourceMinor * rateNumerator) / rateDenominator);
  const net = gross - feeMinor;
  if (net <= 0) throw new Error('THYTR-MONEY-005 fee consumed the conversion');
  return { grossMinor: gross, feeMinor, netMinor: net };
}

// ---------------------------------------------------------------------------
// Technology. Destination-era capability governs.
// ---------------------------------------------------------------------------

export const CAPABILITIES = Object.freeze({
  IDENTITY:   { carriesBackward: true,  note: 'The visitor remains themselves.' },
  MEMORY:     { carriesBackward: true,  note: 'Memory of a later era is retained in full.' },
  KNOWLEDGE:  { carriesBackward: true,  note: 'Knowledge is retained and may be spoken.' },
  EXPERIENCE: { carriesBackward: true,  note: 'Judgement, training and craft are retained.' },
  DEVICE:     { carriesBackward: false, note: 'Does not function.' },
  POWER:      { carriesBackward: false, note: 'Does not function.' },
  NETWORK:    { carriesBackward: false, note: 'Does not function. No signal exists to reach.' },
  MEDICINE:   { carriesBackward: false, note: 'Does not function. Era-available care only.' },
  MATERIAL:   { carriesBackward: false, note: 'Does not function as engineered.' },
  WEAPON:     { carriesBackward: false, note: 'Does not function. Carriage is a disqualifying breach.' },
});

export function capabilityFunctionsInEra(capabilityCode) {
  const cap = CAPABILITIES[capabilityCode];
  if (!cap) throw new Error(`THYTR-CAP-000 unknown capability ${capabilityCode}`);
  return cap.carriesBackward;
}

export function assertCapabilityClaim(capabilityCode, claimedFunctioning, eraCode) {
  if (claimedFunctioning && !capabilityFunctionsInEra(capabilityCode)) {
    throw new Error(
      `THYTR-CAP-001 destination-era capability governs: ${capabilityCode} cannot function in era ${eraCode}`);
  }
  return true;
}

// ---------------------------------------------------------------------------
// Help orders. Consent, payment, double verification.
// ---------------------------------------------------------------------------

export function validateHelpOrder(order) {
  const problems = [];
  if (order.payment_taken_from_local) problems.push('THYTR-HELP-001 help is never invoiced to the people helped');
  if (order.local_labour_unpaid)      problems.push('THYTR-HELP-002 local labour is never unpaid');
  if (order.filmed_without_consent)   problems.push('THYTR-HELP-003 no recording without consent');
  const live = !['PROPOSED', 'DECLINED', 'WITHDRAWN'].includes(order.order_state);
  if (live && !order.local_consent)   problems.push('THYTR-HELP-004 consent is required before work begins');
  if (order.materials_taken_locally && !(order.materials_paid_minor > 0)) {
    problems.push('THYTR-HELP-005 materials taken locally must be paid for');
  }
  if (order.order_state === 'VERIFIED' &&
      !(order.verified_by_community && order.verified_by_witness_keeper)) {
    problems.push('THYTR-HELP-006 verification needs both the community and the witness keeper');
  }
  return { valid: problems.length === 0, problems };
}

/** Only double-verified help counts toward the HELP award classes. */
export function countedHelp(orders = []) {
  return orders.filter((o) => o.order_state === 'VERIFIED' && validateHelpOrder(o).valid);
}

// ---------------------------------------------------------------------------
// Death and the body return / recovery protocol.
// ---------------------------------------------------------------------------

export const RECOVERY_STAGES = Object.freeze([
  { index: 0,  code: 'D0_STOP',        label: 'Stop the run',            owner: 'ROAD_CAPTAIN',   blocking: true },
  { index: 1,  code: 'D1_CONFIRM',     label: 'Confirm death',           owner: 'SURGEON',        blocking: true },
  { index: 2,  code: 'D2_RECORD',      label: 'Record the death',        owner: 'WITNESS_KEEPER', blocking: true },
  { index: 3,  code: 'D3_CUSTODY',     label: 'Take custody of the body',owner: 'ROAD_CAPTAIN',   blocking: true },
  { index: 4,  code: 'D4_LOCAL_LAW',   label: 'Satisfy local law',       owner: 'LOCAL_GUIDE',    blocking: true },
  { index: 5,  code: 'D5_COMMUNITY',   label: 'Answer the host community', owner: 'ROAD_CAPTAIN', blocking: true },
  { index: 6,  code: 'D6_NEXT_OF_KIN', label: 'Ask the next of kin',     owner: 'WITNESS_KEEPER', blocking: true },
  { index: 7,  code: 'D7_PREPARE',     label: 'Prepare the body',        owner: 'SURGEON',        blocking: true },
  { index: 8,  code: 'D8_ESCORT',      label: 'Assign the escort',       owner: 'SECOND',         blocking: true },
  { index: 9,  code: 'D9_TRANSIT',     label: 'Transit',                 owner: 'SECOND',         blocking: true },
  { index: 10, code: 'D10_RECEIPT',    label: 'Origin-era receipt',      owner: 'WITNESS_KEEPER', blocking: true },
  { index: 11, code: 'D11_FAMILY',     label: 'Release to family',       owner: 'WITNESS_KEEPER', blocking: true },
  { index: 12, code: 'D12_RITE',       label: 'Rite and mourning',       owner: null,             blocking: false },
  { index: 13, code: 'D13_CLOSE',      label: 'Close the recovery',      owner: 'WITNESS_KEEPER', blocking: true },
]);

export const DISPOSITIONS = Object.freeze([
  'UNDECIDED', 'RETURN_TO_ORIGIN_ERA', 'INTERRED_IN_ERA_OF_DEATH', 'HELD_BY_LOCAL_LAW',
]);

/** Death is final. Any patch that softens it is refused. */
export function applyDeathPatch(record, patch = {}) {
  if ('is_dead' in patch && patch.is_dead !== true) {
    throw new Error('THYTR-DEATH-002 death cannot be undone');
  }
  if ('reversible' in patch && patch.reversible !== false) {
    throw new Error('THYTR-DEATH-003 death is not reversible');
  }
  for (const fixed of ['person_ref', 'death_era_code', 'died_at']) {
    if (fixed in patch && patch[fixed] !== record[fixed]) {
      throw new Error('THYTR-DEATH-004 identity, era and time of death are fixed at record');
    }
  }
  return { ...record, ...patch, is_dead: true, reversible: false };
}

export function diedOutsideOrigin(death) {
  return death.origin_era_code !== death.death_era_code;
}

/** Advance a recovery by exactly one stage, through the blocking gates. */
export function advanceRecovery(recovery, patch = {}) {
  const next = { ...recovery, ...patch };
  if (next.restores_life) throw new Error('THYTR-REC-000 returning a body does not return a life');
  const from = recovery.current_stage_index;
  const to = next.current_stage_index;
  if (to < from) throw new Error('THYTR-REC-001 recovery stages do not run backward');
  if (to > from + 1) throw new Error(`THYTR-REC-002 recovery stages advance one at a time (${from} -> ${to})`);
  if (to >= 5 && !next.community_asked) {
    throw new Error('THYTR-REC-003 the host community is answered before any era is left (stage D5)');
  }
  if (to >= 8 && next.disposition === 'UNDECIDED') {
    throw new Error('THYTR-REC-004 disposition must be decided before an escort is assigned (stage D8)');
  }
  if (to >= 8 && next.disposition === 'RETURN_TO_ORIGIN_ERA' &&
      (!next.escort_slot_a || !next.escort_slot_b || next.escort_slot_a === next.escort_slot_b)) {
    throw new Error('THYTR-REC-005 a returning body travels with two named escorts, never one');
  }
  if (to >= 10 && next.disposition === 'RETURN_TO_ORIGIN_ERA' && !next.custody_unbroken) {
    throw new Error('THYTR-REC-006 custody was broken; origin-era receipt cannot be recorded');
  }
  if (next.closed_at && to < 13) throw new Error('THYTR-REC-007 recovery cannot close before stage D13');
  return next;
}

export function newRecovery(deathId) {
  return {
    death_id: deathId,
    disposition: 'UNDECIDED',
    next_of_kin_reached: false,
    community_asked: false,
    community_requested_stay: false,
    custody_unbroken: true,
    current_stage_index: 0,
    escort_slot_a: null,
    escort_slot_b: null,
    closed_at: null,
    restores_life: false,
  };
}

// ---------------------------------------------------------------------------
// Relations. No first-meeting regression.
// ---------------------------------------------------------------------------

export const RELATIONS = Object.freeze([
  { a: 'PER-VYCTOR-EBENEEZER', b: 'PER-INES-MORALES',
    code: 'PREEXISTING_ACQUAINTANCE_FROM_PRIOR_VISITS', firstMeetingPermitted: false, degreeKnown: true },
  { a: 'PER-VYCTOR-EBENEEZER', b: 'PER-VERONICA-HALL',
    code: 'NEW_ENCOUNTER', firstMeetingPermitted: true, degreeKnown: true },
  { a: 'PER-INES-MORALES', b: 'PER-VERONICA-HALL',
    code: 'KINSHIP_EXISTS_DEGREE_UNKNOWN', firstMeetingPermitted: true, degreeKnown: false },
  { a: 'PER-CLARA-BENNETT', b: 'PER-VERONICA-HALL',
    code: 'BROUGHT_BACK_BY', firstMeetingPermitted: true, degreeKnown: true },
]);

export function firstMeetingPermitted(personA, personB) {
  const rel = RELATIONS.find(
    (r) => (r.a === personA && r.b === personB) || (r.a === personB && r.b === personA));
  return rel ? rel.firstMeetingPermitted : true;
}

export function assertEncounter(encounter) {
  if (encounter.encounter_kind === 'FIRST_MEETING' &&
      !firstMeetingPermitted(encounter.party_a_ref, encounter.party_b_ref)) {
    throw new Error(
      `THYTR-REL-001 no first meeting may be written between ${encounter.party_a_ref} and ${encounter.party_b_ref}: relation is PREEXISTING`);
  }
  if (encounter.branch_universe_created) {
    throw new Error('THYTR-TIME-001 branch universes are not created automatically');
  }
  if (encounter.became_history === false) {
    throw new Error('THYTR-TIME-002 a meeting that happened entered history');
  }
  return true;
}

/** The kinship degree is sealed. Asking for it returns the seal, not a value. */
export function kinshipDegree(personA, personB) {
  const rel = RELATIONS.find(
    (r) => (r.a === personA && r.b === personB) || (r.a === personB && r.b === personA));
  if (rel && rel.degreeKnown === false) {
    return { known: false, sealed: true, tiedTo: 'OBJ-LOCKET-001' };
  }
  return { known: Boolean(rel), sealed: false, relation: rel ? rel.code : null };
}

/** The locket is closed. There is no contents accessor and there is no path to one. */
export function locketState() {
  return Object.freeze({ object_code: 'OBJ-LOCKET-001', state: 'CLOSED', contents: undefined, sealed: true });
}

// ---------------------------------------------------------------------------
// Awards
// ---------------------------------------------------------------------------

export const AWARD_CLASSES = Object.freeze([
  { code: 'AWD-MOST-HELP',      label: 'Most Help Given',    group: 'HELP',      decidedBy: 'VERIFIED_RECORD', speedWeighted: false },
  { code: 'AWD-BEST-BUILD',     label: 'Best Useful Build',  group: 'BUILD',     decidedBy: 'VERIFIED_RECORD', speedWeighted: false },
  { code: 'AWD-VEHICLE-VIEWER', label: 'Viewer Vehicle Pick',group: 'VEHICLE',   decidedBy: 'VIEWER_VOTE',     speedWeighted: false },
  { code: 'AWD-VEHICLE-PERIOD', label: 'Truest to the Era',  group: 'VEHICLE',   decidedBy: 'PANEL',           speedWeighted: false },
  { code: 'AWD-VEHICLE-ROAD',   label: 'Best Road Vehicle',  group: 'VEHICLE',   decidedBy: 'PANEL',           speedWeighted: false },
  { code: 'AWD-CARAVAN',        label: 'Best Repair Caravan',group: 'VEHICLE',   decidedBy: 'VERIFIED_RECORD', speedWeighted: false },
  { code: 'AWD-ANIMAL-CARE',    label: 'Best Animal Care',   group: 'ANIMAL',    decidedBy: 'PANEL',           speedWeighted: false },
  { code: 'AWD-COMMUNITY-PICK', label: 'Community Pick',     group: 'COMMUNITY', decidedBy: 'HOST_COMMUNITY',  speedWeighted: false },
  { code: 'AWD-PEOPLE-PICK',    label: "People's Pick",      group: 'COMMUNITY', decidedBy: 'PEOPLE_VOTE',     speedWeighted: false },
  { code: 'AWD-CREW-TRUST',     label: 'Most Trusted Crew',  group: 'CREW',      decidedBy: 'PEOPLE_VOTE',     speedWeighted: false },
  { code: 'AWD-SAFE-PASSAGE',   label: 'Safe Passage',       group: 'SAFETY',    decidedBy: 'VERIFIED_RECORD', speedWeighted: false },
  { code: 'AWD-STOPPED-FIRST',  label: 'Stopped First',      group: 'CONDUCT',   decidedBy: 'VERIFIED_RECORD', speedWeighted: false },
  { code: 'AWD-FRIENDSHIP',     label: 'Kept Company',       group: 'CONDUCT',   decidedBy: 'PEOPLE_VOTE',     speedWeighted: false },
  { code: 'AWD-FINISH',         label: 'Completed the Run',  group: 'CREW',      decidedBy: 'VERIFIED_RECORD', speedWeighted: false },
]);

/** Viewer votes and people votes are separate publics and are never summed. */
export function tallyVotes(votes = []) {
  const out = { viewer: 0, people: 0, host_community: 0, crew: 0 };
  for (const v of votes) {
    if (v.population === 'VIEWER') out.viewer += 1;
    else if (v.population === 'PEOPLE_OF_ERA') out.people += 1;
    else if (v.population === 'HOST_COMMUNITY') out.host_community += 1;
    else if (v.population === 'CREW') out.crew += 1;
  }
  return out;
}

export function voteRoundMayOpen(round) {
  return Boolean(round.eligibility_reviewed && round.safety_reviewed);
}

/** A vehicle that is not period-correct is ineligible for the period class. */
export function vehicleAwardEligible(vehicle, awardCode) {
  if (vehicle.condition_state === 'LOST') return false;
  if (awardCode === 'AWD-VEHICLE-PERIOD') return Boolean(vehicle.period_correct);
  return true;
}

/** Emergency response suspends standing. It never removes it. */
export function standingAfterEmergency(standing, emergency) {
  if (emergency && emergency.stood_down_at == null) {
    return { ...standing, suspended: true, lost: false };
  }
  return { ...standing, suspended: false, lost: false };
}
