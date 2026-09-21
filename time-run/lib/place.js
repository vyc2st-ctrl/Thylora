// TIME RUN · stable place identity across living eras
// Workroom: WR-TIMERUN-581
//
// A place is ONE identity with MANY era strata. Rooms, walls, repairs, objects,
// occupants, staff, businesses, furniture, art and family relationships change
// by era. The place identity does not.
//
// The castle's native name is DERIVED, never assigned: NATIVE LAND + LANGUAGE +
// HISTORY. `PROHIBITED_NAMES` is enforced, and no candidate is canon.

export const PROHIBITED_NAMES = Object.freeze(['PEETE CASTLE', 'PEETE-CASTLE', 'CASTLE PEETE']);

/** Everything that may differ between two era strata of the same place. */
export const ERA_VARIABLE = Object.freeze([
  'rooms', 'walls', 'repairs', 'objects', 'occupants', 'staff',
  'businesses', 'furniture', 'art', 'family_relationships', 'name_rendering'
]);

/** Everything that must not differ. Change any of these and it is another place. */
export const PLACE_INVARIANT = Object.freeze([
  'place_id', 'native_name', 'site_ground', 'orientation', 'approach', 'water_relation', 'footprint_origin'
]);

export function normaliseName(value) {
  return String(value ?? '').trim().toUpperCase().replace(/\s+/g, ' ');
}

export function isProhibitedName(value) {
  const n = normaliseName(value);
  return PROHIBITED_NAMES.some(p => normaliseName(p) === n) || n.split(' ').includes('PEETE');
}

/**
 * A native name is valid only when all three derivation sources are supplied
 * and the name is not prohibited. A name with no derivation is an assignment,
 * and assignments are refused.
 */
export function validateNativeName(candidate = {}) {
  const problems = [];
  const add = (code, message) => problems.push({ code, message });

  if (!candidate.name) add('NAME_MISSING', 'A native name is required.');
  else if (isProhibitedName(candidate.name)) add('NAME_PROHIBITED', `${candidate.name} is prohibited for this place.`);

  const derivation = candidate.derivation ?? {};
  if (!derivation.native_land) add('DERIVATION_LAND_MISSING', 'derivation.native_land is required.');
  if (!derivation.language) add('DERIVATION_LANGUAGE_MISSING', 'derivation.language is required.');
  if (!derivation.history) add('DERIVATION_HISTORY_MISSING', 'derivation.history is required.');

  const morphemes = Array.isArray(derivation.morphemes) ? derivation.morphemes : [];
  if (morphemes.length < 2) add('MORPHEMES_INSUFFICIENT', 'A derived name shows at least two morphemes with glosses.');
  for (const m of morphemes) {
    if (!m.form || !m.gloss) add('MORPHEME_UNGLOSSED', 'Each morpheme needs a form and a gloss.');
  }

  return Object.freeze({
    valid: problems.length === 0,
    canon: false, // candidates are never canon on validation alone
    problems: Object.freeze(problems)
  });
}

/**
 * Check that two era strata describe the same place.
 * Invariants must match exactly; era-variable fields may differ freely.
 */
export function compareStrata(a = {}, b = {}) {
  const broken = PLACE_INVARIANT.filter(field => String(a[field] ?? '') !== String(b[field] ?? ''));
  const changed = ERA_VARIABLE.filter(field => JSON.stringify(a[field]) !== JSON.stringify(b[field]));
  return Object.freeze({
    same_place: broken.length === 0,
    broken_invariants: Object.freeze(broken),
    era_differences: Object.freeze(changed)
  });
}

/**
 * The name is invariant. Its RENDERING in an era is not: spelling drift,
 * translation and local usage are era-variable and are recorded per stratum.
 */
export function renderingFor(stratum) {
  return Object.freeze({
    era: stratum.era_id,
    native_name: stratum.native_name,
    era_rendering: stratum.name_rendering ?? stratum.native_name,
    same_name: true
  });
}
