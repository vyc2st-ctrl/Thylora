// THYLORA WORLD · PERIOD_TECH_PROFILE_CASTLE_001
// Workroom: WR-WORLD-CASTLE-001
//
// "This castle represents ONE historical period on the planet. Technology is
//  constrained to that time state. Other time periods may exist elsewhere on the
//  planet but do not bleed into this scene."
//
// The period itself is NOT resolved. The backend blocker on WR-CASTLE-001 reads
// "exact world sites/names unresolved", and the one scene reference is
// unreadable. So this profile is built as a gate with an empty allow-list rather
// than as a filled-in medieval European kit.
//
// That default matters and is taken deliberately. "Castle" in a general-audience
// reading collapses to Norman keep, and every downstream decision — bond
// pattern, cart gauge, roof timbering, lighting, recordkeeping — would inherit
// that assumption silently and then be defended as canon. The candidate frames
// below therefore carry African and other non-European stone and earthen
// traditions as first-class entries, not as alternatives appended after a
// European default. Nothing here selects among them; selection is the
// Chairman's, and until it is made the allow-list stays empty.

export const PROFILE_ID = 'PERIOD_TECH_PROFILE_CASTLE_001';

export const CATEGORIES = Object.freeze([
  'TRANSPORT', 'LIGHTING', 'TOOLS', 'MASONRY', 'WOODWORKING', 'METALWORK',
  'COMMUNICATIONS', 'HOUSEHOLD_SYSTEMS', 'EDUCATION_MATERIALS',
  'WEAPONS_SECURITY', 'AGRICULTURE', 'MEDICINE', 'RECORDKEEPING'
]);

export const PERIOD_STATE = Object.freeze({
  period_id: 'THYW-PERIOD-CASTLE-001',
  resolved: false,
  era_label: null,
  calendar_basis: null,
  earliest_bound: null,
  latest_bound: null,
  region_tradition: null,
  basis: 'No readable source establishes the period. WR-CASTLE-001 carries the open blocker "exact world sites/names unresolved".'
});

/**
 * Candidate architectural traditions, for Chairman selection.
 * PROPOSED ONLY — none of these is canon, and the order carries no preference.
 * Each is a real building tradition with a real defensive/royal stone or earthen
 * architecture, i.e. each could host the scene's castle, cart and workers.
 */
export const CANDIDATE_TRADITIONS = Object.freeze([
  { key: 'BENIN_CITY_WALLS_AND_PALACE', note: 'Edo earthwork walls and royal palace complex, Benin City. Directly connected to material already preserved in this project\'s own research pack (British Museum 1897 provenance records).' },
  { key: 'GONDARINE_FASIL_GHEBBI', note: 'Ethiopian Gondarine stone castle complex — battlemented towers, cut-stone walls, royal compound.' },
  { key: 'GREAT_ZIMBABWE_DRY_STONE', note: 'Coursed dry-stone enclosure walling; no mortar, so the mortar fields of a masonry spec resolve to zero rather than UNKNOWN.' },
  { key: 'HAUSA_CITY_WALLS_KANO_ZARIA', note: 'Massive earthen city walls and gates with royal compounds inside.' },
  { key: 'SWAHILI_COAST_CORAL_STONE', note: 'Coral-rag and lime-mortar coastal stone towns and forts.' },
  { key: 'NUBIAN_MEROITIC_FORTIFIED', note: 'Nile-corridor fired-brick and stone fortified royal architecture.' },
  { key: 'MAGHREBI_KSAR_KASBAH', note: 'Rammed-earth and mudbrick fortified compounds with corner towers.' },
  { key: 'WEST_EUROPEAN_STONE_CASTLE', note: 'Curtain wall, gatehouse, keep. Listed as one candidate among several, not as the default.' },
  { key: 'LEVANTINE_ANATOLIAN_FORTRESS', note: 'Ashlar curtain and tower fortress traditions.' },
  { key: 'SOUTH_ASIAN_FORT_PALACE', note: 'Fort-palace complexes with layered gates and ramped elephant/cart approaches.' },
  { key: 'EAST_ASIAN_CASTLE', note: 'Dry-stone battered plinth carrying a timber-framed superstructure.' }
]);

/**
 * Anachronism floor.
 *
 * These are prohibited for EVERY candidate tradition above, so they can be
 * asserted before the period is chosen. Each entry is INFERRED, with its basis
 * recorded — not VERIFIED, because the period itself is not verified.
 */
export const PROHIBITED_FLOOR = Object.freeze([
  { category: 'LIGHTING', item: 'ELECTRIC_LIGHTING', basis: 'Post-dates every candidate tradition.' },
  { category: 'LIGHTING', item: 'GAS_MANTLE_LIGHTING', basis: 'Industrial-era; post-dates every candidate tradition.' },
  { category: 'TRANSPORT', item: 'INTERNAL_COMBUSTION_VEHICLE', basis: 'Post-dates every candidate tradition.' },
  { category: 'TRANSPORT', item: 'RAILWAY', basis: 'Post-dates every candidate tradition.' },
  { category: 'TRANSPORT', item: 'PNEUMATIC_TYRE', basis: 'Post-dates every candidate tradition.' },
  { category: 'COMMUNICATIONS', item: 'ELECTRICAL_TELEGRAPH', basis: 'Post-dates every candidate tradition.' },
  { category: 'COMMUNICATIONS', item: 'RADIO', basis: 'Post-dates every candidate tradition.' },
  { category: 'COMMUNICATIONS', item: 'TELEPHONE', basis: 'Post-dates every candidate tradition.' },
  { category: 'TOOLS', item: 'POWER_TOOL', basis: 'Requires electrification or internal combustion.' },
  { category: 'MASONRY', item: 'PORTLAND_CEMENT', basis: 'Nineteenth-century industrial binder; post-dates every candidate tradition.' },
  { category: 'MASONRY', item: 'REINFORCED_CONCRETE', basis: 'Post-dates every candidate tradition.' },
  { category: 'MASONRY', item: 'STEEL_FRAME', basis: 'Post-dates every candidate tradition.' },
  { category: 'METALWORK', item: 'BESSEMER_BULK_STEEL', basis: 'Industrial process; post-dates every candidate tradition.' },
  { category: 'HOUSEHOLD_SYSTEMS', item: 'PRESSURISED_MAINS_PLUMBING', basis: 'Requires industrial pipe and pumping; post-dates every candidate tradition.' },
  { category: 'HOUSEHOLD_SYSTEMS', item: 'MECHANICAL_REFRIGERATION', basis: 'Post-dates every candidate tradition.' },
  { category: 'EDUCATION_MATERIALS', item: 'INDUSTRIAL_WOOD_PULP_PAPER', basis: 'Nineteenth-century process; post-dates every candidate tradition.' },
  { category: 'EDUCATION_MATERIALS', item: 'MASS_SCHOOL_DESK_FURNITURE', basis: 'Modern school architecture; the directive explicitly forbids importing it.' },
  { category: 'WEAPONS_SECURITY', item: 'BREECH_LOADING_RIFLE', basis: 'Industrial small arms; post-dates every candidate tradition.' },
  { category: 'WEAPONS_SECURITY', item: 'SMOKELESS_POWDER', basis: 'Post-dates every candidate tradition.' },
  { category: 'AGRICULTURE', item: 'MECHANISED_TRACTOR', basis: 'Post-dates every candidate tradition.' },
  { category: 'MEDICINE', item: 'GERM_THEORY_ANTISEPSIS', basis: 'Nineteenth-century; post-dates every candidate tradition.' },
  { category: 'MEDICINE', item: 'ANTIBIOTICS', basis: 'Twentieth-century; post-dates every candidate tradition.' },
  { category: 'RECORDKEEPING', item: 'PHOTOGRAPHY', basis: 'Post-dates every candidate tradition.' },
  { category: 'RECORDKEEPING', item: 'TYPEWRITER', basis: 'Post-dates every candidate tradition.' },
  { category: 'RECORDKEEPING', item: 'DIGITAL_RECORD', basis: 'Post-dates every candidate tradition.' }
]);

/** The profile as stored. Allow-lists stay empty until the period is chosen. */
export function buildProfile() {
  const allowed = {};
  const prohibited = {};
  for (const c of CATEGORIES) {
    allowed[c] = Object.freeze({ state: 'UNRESOLVED', items: Object.freeze([]),
      basis: 'The period is not resolved, so nothing can be admitted to this category.' });
    prohibited[c] = Object.freeze(PROHIBITED_FLOOR.filter(p => p.category === c)
      .map(p => Object.freeze({ ...p, evidence_state: 'INFERRED' })));
  }
  return Object.freeze({
    profile_id: PROFILE_ID,
    period: PERIOD_STATE,
    categories: Object.freeze(CATEGORIES),
    allowed: Object.freeze(allowed),
    prohibited: Object.freeze(prohibited),
    candidate_traditions: CANDIDATE_TRADITIONS,
    bleed_rule: 'Other time periods may exist elsewhere on the planet. No object may enter this scene from a frame outside THYW-FRAME-CASTLE-001\'s lineage, and no technology may enter this scene that is not on this profile\'s allow-list.',
    school_architecture_rule: 'Learning and tutorial spaces are recorded as rooms of this period\'s household, not as classrooms. Modern school architecture is prohibited.'
  });
}

/**
 * Admit or refuse a technology into the scene.
 * With the period unresolved, the only decidable answer is PROHIBITED (on the
 * anachronism floor) or HELD_PERIOD_UNRESOLVED. Nothing is ever admitted by
 * default.
 */
export function admits(profile, category, item) {
  if (!CATEGORIES.includes(category)) {
    return { verdict: 'REFUSED', reason: `Unknown category: ${category}.` };
  }
  const floorHit = (profile.prohibited[category] || []).find(p => p.item === item);
  if (floorHit) {
    return { verdict: 'PROHIBITED', reason: floorHit.basis, evidence_state: 'INFERRED' };
  }
  const allow = profile.allowed[category];
  if (allow.state === 'UNRESOLVED') {
    return {
      verdict: 'HELD_PERIOD_UNRESOLVED',
      reason: 'The period is not resolved, so this item can be neither admitted nor cleared. It is held, not allowed.'
    };
  }
  return allow.items.includes(item)
    ? { verdict: 'ALLOWED', reason: 'On the resolved allow-list for this period.' }
    : { verdict: 'PROHIBITED', reason: 'Not on the resolved allow-list for this period.' };
}
