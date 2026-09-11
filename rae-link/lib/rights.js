// RAE LINK · rights, authority, channel truth and family safeguards
// Workroom: WR-RAELINK-001
//
// ACCESS != AUTHORITY. Being able to upload a file is not authority to publish
// it. This module holds the rules that decide whether the rights gate passes,
// whether a channel is honestly labelled, and what a family may never be asked for.

export const OWNERSHIP_BASES = Object.freeze([
  'OWNED_ORIGINAL',
  'AUTHORIZED_BY_RIGHTS_HOLDER',
  'LICENSED',
  'PUBLIC_DOMAIN',
  'FAMILY_CONSENT',
  'WORLD_PRODUCTION',
  'UNRESOLVED'
]);

export const CHANNEL_CLASSES = Object.freeze({
  EARTH_PERSON:          { world_status: 'EARTH_REAL',      label: 'Earth creator' },
  EARTH_BUSINESS:        { world_status: 'EARTH_REAL',      label: 'Earth business' },
  EARTH_ORGANIZATION:    { world_status: 'EARTH_REAL',      label: 'Earth organization' },
  EDEREARIAH_INHABITANT: { world_status: 'WORLD_SIMULATED', label: 'EdereAriah inhabitant' },
  WORLD_CHANNEL:         { world_status: 'WORLD_SIMULATED', label: 'World channel' },
  FAMILY_STORY:          { world_status: 'EARTH_REAL',      label: 'Family story archive' },
  THYLORA_HOUSE:         { world_status: 'EARTH_REAL',      label: 'THYLORA house channel' }
});

export const STORYTELLING_MODES = Object.freeze(['PRIVATE', 'PSEUDONYMOUS', 'LIMITED', 'PUBLIC']);

// Fields RAE Link will not accept on a family or consent record. Minimum
// necessary information only.
const FORBIDDEN_CONSENT_FIELDS = [
  'diagnosis', 'condition', 'prognosis', 'treatment', 'medication', 'medical_record',
  'hospital', 'physician', 'symptom', 'illness_detail', 'ssn', 'social_security',
  'tax_id', 'bank_account'
];

/**
 * Decide whether the rights/authority gate passes, and say exactly what is
 * missing when it does not.
 */
export function evaluateRightsGate(record, options = {}) {
  const problems = [];
  const basis = record?.ownership_basis;

  if (!basis || !OWNERSHIP_BASES.includes(basis)) {
    problems.push({ code: 'BASIS_MISSING', detail: 'Select how this media is owned or authorized.' });
  } else if (basis === 'UNRESOLVED') {
    problems.push({ code: 'BASIS_UNRESOLVED', detail: 'Ownership basis is still unresolved.' });
  }

  const needsHolder = ['AUTHORIZED_BY_RIGHTS_HOLDER', 'LICENSED', 'FAMILY_CONSENT'];
  if (needsHolder.includes(basis) && !record?.rights_holder_name) {
    problems.push({ code: 'HOLDER_MISSING', detail: 'Name the rights holder who authorized this use.' });
  }
  if (basis === 'LICENSED' && !record?.license_ref) {
    problems.push({ code: 'LICENCE_REF_MISSING', detail: 'Record the licence reference.' });
  }
  if (basis === 'FAMILY_CONSENT' && !options.consent) {
    problems.push({ code: 'CONSENT_MISSING', detail: 'Attach the family consent record.' });
  }
  if (record?.term_end && new Date(record.term_end) < new Date()) {
    problems.push({ code: 'TERM_EXPIRED', detail: `Licence term ended ${record.term_end}.` });
  }
  if (basis === 'WORLD_PRODUCTION' && options.channel &&
      options.channel.world_status !== 'WORLD_SIMULATED') {
    problems.push({
      code: 'WORLD_BASIS_ON_EARTH_CHANNEL',
      detail: 'World production rights cannot be claimed by an Earth channel.'
    });
  }

  return {
    gate_state: problems.length === 0 ? 'PASSED' : 'FAILED',
    problems,
    evaluated_at: new Date().toISOString()
  };
}

/**
 * A world channel must never be presentable as an Earth person, and an Earth
 * channel must never carry a simulated disclosure it does not need.
 */
export function validateChannelTruth(channel) {
  const problems = [];
  const spec = CHANNEL_CLASSES[channel?.channel_class];
  if (!spec) {
    return { valid: false, problems: [{ code: 'CLASS_UNKNOWN', detail: 'Unknown channel class.' }] };
  }
  if (channel.world_status !== spec.world_status) {
    problems.push({
      code: 'WORLD_STATUS_MISMATCH',
      detail: `${channel.channel_class} must be ${spec.world_status}.`
    });
  }
  if (spec.world_status === 'WORLD_SIMULATED') {
    const disclosure = String(channel.simulated_disclosure ?? '').trim();
    if (disclosure.length < 12) {
      problems.push({
        code: 'DISCLOSURE_MISSING',
        detail: 'A world channel needs a visible disclosure that its media is simulated world media.'
      });
    }
  } else if (String(channel.simulated_disclosure ?? '').trim()) {
    problems.push({
      code: 'DISCLOSURE_ON_EARTH_CHANNEL',
      detail: 'An Earth channel must not carry a simulated-media disclosure.'
    });
  }
  return { valid: problems.length === 0, problems, label: spec.label };
}

/**
 * Consent validation for family participation, including the guardian rule and
 * the minimum-necessary-information rule.
 */
export function validateConsent(consent) {
  const problems = [];
  if (!consent?.subject_kind) problems.push({ code: 'SUBJECT_KIND_MISSING', detail: 'Record who is consenting.' });
  if (consent?.subject_kind === 'MINOR' && !consent?.guardian_user_id) {
    problems.push({ code: 'GUARDIAN_REQUIRED', detail: 'A child participant requires recorded guardian authority.' });
  }
  if (!STORYTELLING_MODES.includes(consent?.storytelling_mode)) {
    problems.push({ code: 'MODE_MISSING', detail: 'The family chooses private, pseudonymous, limited or public.' });
  }
  if (consent?.medical_details_collected === true) {
    problems.push({ code: 'MEDICAL_DETAIL_REFUSED', detail: 'RAE Link does not collect medical detail.' });
  }
  for (const field of FORBIDDEN_CONSENT_FIELDS) {
    if (consent && Object.prototype.hasOwnProperty.call(consent, field)) {
      problems.push({ code: 'FORBIDDEN_FIELD', detail: `The field "${field}" is not collected by RAE Link.` });
    }
  }
  if (consent?.revoked_at) {
    problems.push({ code: 'CONSENT_REVOKED', detail: 'This consent has been withdrawn.' });
  }
  return { valid: problems.length === 0, problems };
}

/**
 * What a family partnership must satisfy before anything publishes under it.
 */
export function validatePartnership(partnership, consent) {
  const problems = [];
  const consentCheck = validateConsent(consent);
  problems.push(...consentCheck.problems);

  const bp = Number(partnership?.beneficiary_share_bp ?? 0);
  if (!Number.isInteger(bp) || bp < 1) {
    problems.push({ code: 'SHARE_UNDECLARED', detail: 'Declare the beneficiary percentage before publication.' });
  }
  if (!partnership?.beneficiary_ref) {
    problems.push({ code: 'BENEFICIARY_UNNAMED', detail: 'Name who receives the beneficiary share.' });
  }
  if (!partnership?.purpose_statement) {
    problems.push({ code: 'PURPOSE_MISSING', detail: 'State what the partnership is for, in the family’s own terms.' });
  }
  if (partnership?.published_at && partnership?.declared_at &&
      new Date(partnership.declared_at) > new Date(partnership.published_at)) {
    problems.push({ code: 'SHARE_DECLARED_LATE', detail: 'The share must be declared before publication, not after.' });
  }
  return { valid: problems.length === 0, problems, beneficiary_share_bp: bp };
}

export const PARTNERSHIP_PROHIBITIONS = Object.freeze([
  ['NO_MEDICAL_DISCLOSURE', 'A family is never required to disclose a diagnosis, condition, prognosis, treatment or medical record to participate.'],
  ['NO_ILLNESS_EXPLOITATION', 'Illness, grief or hardship is never used as a promotional hook, thumbnail device or engagement tactic.'],
  ['NO_SENSATIONALISM', 'Story presentation must not dramatize suffering beyond what the family agreed to tell.'],
  ['NO_FORCED_PUBLICITY', 'A family may participate privately, pseudonymously, in limited form, or publicly, and may change mode going forward.'],
  ['NO_DIAGNOSIS', 'RAE Link does not diagnose, assess, predict or advise on any medical matter.'],
  ['NO_PERSUASION', 'No political, religious or ideological persuasion may be attached as a condition of help.'],
  ['NO_HIDDEN_PERCENTAGE', 'The beneficiary percentage is declared before publication and shown with the story and in every statement.'],
  ['NO_GUARDIAN_BYPASS', 'A child participant requires recorded guardian authority. There is no exception path.']
]);
