// THYLORA merchandise lane · artwork locks, families, classes, cup side map
// Workroom: WR-MERCH-001
//
// This module is the client-side twin of db/merch/0007_seed_locked_records.sql.
// Every value here was read out of thylora-dash on 2026-09-17 and is copied,
// not restyled. Where the backend records UNKNOWN, this records null and an
// approval state that fails the gate.
//
// Editing a lock value in this file is a mark change. It is not a refactor.

export const APPROVED_STATES = Object.freeze([
  'CHAIRMAN_APPROVED',
  'CHAIRMAN_APPROVED_NAME',
  'CHAIRMAN_APPROVED_IN_MASTER',
  'LOCKED_APPROVED'
]);

export const MERCH_USE_STATES = Object.freeze([
  'NOT_CLEARED',
  'CLEARED_LOGO_ONLY',
  'CLEARED_ALL_FAMILIES'
]);

const SPORTS_001_MASTER = Object.freeze({
  file: 'ER_NEWS_MORNING_001_RAVENS_PUBLISH_MASTER.png',
  sha256: '4b473c86aa5ea4671ac302958d36cd94f818efc4e51b0a20283fe67aa4ce6162',
  state: 'POSTPUBLICATION_REJECTED_REPLACEMENT_REQUIRED'
});

export const ARTWORK_LOCKS = Object.freeze({
  'LOCK-ER-MASTHEAD': {
    group: 'MASTHEAD', short: 'ERMASTHEAD',
    label: 'ErsatzReality News masthead',
    value: 'ErsatzReality News',
    approval_state: 'CHAIRMAN_APPROVED',
    merch_use_state: 'CLEARED_LOGO_ONLY',
    master: SPORTS_001_MASTER,
    open_question: null
  },
  'LOCK-ER-MARK-GLASS-HAT': {
    group: 'MARK', short: 'ERGLASSHAT',
    label: 'Magnifying-glass + hat brand mark',
    value: 'Approved ErsatzReality magnifying-glass-and-hat mark',
    approval_state: 'CHAIRMAN_APPROVED',
    merch_use_state: 'CLEARED_LOGO_ONLY',
    master: SPORTS_001_MASTER,
    open_question: null
  },
  'LOCK-ER-CUP-MARK': {
    group: 'PROP', short: 'ERCUPMARK',
    label: 'ErsatzReality News cup/mug treatment',
    value: 'Approved ErsatzReality News cup/mug as shown in approved Sports Edition 001 master',
    approval_state: 'CHAIRMAN_APPROVED_IN_MASTER',
    merch_use_state: 'CLEARED_LOGO_ONLY',
    master: SPORTS_001_MASTER,
    open_question: 'The prop was approved inside a master whose publication was rejected and which requires replacement. Confirm the prop lock carries forward to the replacement master unchanged.'
  },
  'LOCK-ER-REAR-TABLET-MARK': {
    group: 'PROP', short: 'ERREARTABLET',
    label: 'Rear computer/tablet ErsatzReality mark',
    value: 'Approved ErsatzReality logo treatment on rear of presenter computer/tablet as shown in approved Sports Edition 001 master',
    approval_state: 'CHAIRMAN_APPROVED_IN_MASTER',
    merch_use_state: 'CLEARED_LOGO_ONLY',
    master: SPORTS_001_MASTER,
    open_question: 'Same master-replacement question as LOCK-ER-CUP-MARK.'
  },
  'LOCK-NEYRA-NECKLACE': {
    group: 'JEWELRY', short: 'NEYRANECK',
    label: 'Neyra necklace',
    value: 'Approved necklace as shown in approved Sports Edition 001 master',
    approval_state: 'LOCKED_APPROVED',
    merch_use_state: 'NOT_CLEARED',
    master: SPORTS_001_MASTER,
    open_question: 'Approved as a rendered prop. Not an approved manufacturable necklace design: no geometry, gauge, clasp or Earth-manufacturable material.'
  },
  'LOCK-ORAH-BAND': {
    group: 'JEWELRY', short: 'ORAHBAND',
    label: 'ORAH band / bracelet',
    value: 'Approved ORAH band/bracelet visual as shown in approved Sports Edition 001 master',
    approval_state: 'PENDING_CORRECTION',
    merch_use_state: 'NOT_CLEARED',
    master: SPORTS_001_MASTER,
    open_question: 'Two records disagree in degree: the episode marks the bracelet PENDING_CORRECTION while the jewellery registry marks ORAH-BRACELET-001 CHAIRMAN_VISUAL_REVIEW_PENDING.'
  },
  'LOCK-PRESENTER-NEYRA': {
    group: 'PRESENTER', short: 'NEYRASOL',
    label: 'Recurring presenter — Neyra Sol',
    value: 'Neyra Sol',
    approval_state: 'CHAIRMAN_APPROVED_NAME',
    merch_use_state: 'NOT_CLEARED',
    master: SPORTS_001_MASTER,
    open_question: 'Identity is locked for the newspaper. Selling goods that depict her is a separate likeness question with no recorded decision.'
  },
  'LOCK-MASTHEAD-FONT': {
    group: 'FONT', short: 'ERFONT',
    label: 'Masthead font / style family',
    value: null,
    approval_state: 'CHAIRMAN_VISUAL_REFERENCE_LOCKED',
    merch_use_state: 'NOT_CLEARED',
    master: null,
    open_question: 'Backend state is CHAIRMAN_VISUAL_REFERENCE_LOCKED_EXACT_FONT_NAME_UNKNOWN. The family must not be guessed or silently renamed.'
  },
  'LOCK-QR-DESTINATION': {
    group: 'QR', short: 'ERQR',
    label: 'Approved QR destinations',
    value: null,
    approval_state: 'NOT_APPROVED',
    merch_use_state: 'NOT_CLEARED',
    master: null,
    open_question: 'Two records disagree. The brand slot says no verified destination is registered; ER-NEWS-001 records a qr_target with qr_machine_decode PASS_FINAL_MASTER_2026-09-17.'
  },
  'LOCK-THYLORA-MARK': {
    group: 'MARK', short: 'THYMARK',
    label: 'THYLORA mark',
    value: null,
    approval_state: 'NOT_APPROVED',
    merch_use_state: 'NOT_CLEARED',
    master: null,
    open_question: 'No approved THYLORA mark file is registered in this backend.'
  },
  'LOCK-EDITORIAL-TONE': {
    group: 'MARK', short: 'ERTONE',
    label: 'Editorial tone lock',
    value: 'Technical, evidence-led, question-driven. Generic inspirational or cliche copy is prohibited.',
    approval_state: 'CHAIRMAN_APPROVED',
    merch_use_state: 'CLEARED_ALL_FAMILIES',
    master: null,
    open_question: null
  }
});

export const FAMILIES = Object.freeze({
  LOGO_ONLY:   { short: 'L',  requires_phrase: false, requires_scene: false, state: 'OPEN' },
  LOGO_PHRASE: { short: 'LP', requires_phrase: true,  requires_scene: false, state: 'HELD_NO_APPROVED_PHRASE' },
  LOGO_SCENE:  { short: 'LS', requires_phrase: false, requires_scene: true,  state: 'HELD_NO_APPROVED_SCENE' }
});

export const CLASSES = Object.freeze({
  MUG:    { kind: 'VESSEL',   tooling: false, redraw: false, surfaces: ['side_a', 'side_b', 'base'] },
  CUP:    { kind: 'VESSEL',   tooling: false, redraw: false, surfaces: ['side_a', 'side_b', 'base'] },
  STK:    { kind: 'ADHESIVE', tooling: false, redraw: false, surfaces: ['face'] },
  PCH:    { kind: 'APPLIQUE', tooling: true,  redraw: true,  surfaces: ['face'] },
  SHIRT:  { kind: 'APPAREL',  tooling: false, redraw: false, surfaces: ['left_chest', 'full_front', 'back', 'sleeve', 'inner_neck'] },
  SWEAT:  { kind: 'APPAREL',  tooling: false, redraw: false, surfaces: ['left_chest', 'full_front', 'back', 'sleeve', 'inner_neck'] },
  SOCK:   { kind: 'KNIT',     tooling: true,  redraw: true,  surfaces: ['cuff', 'ankle', 'foot'] },
  TABDEC: { kind: 'ADHESIVE', tooling: false, redraw: false, surfaces: ['face'] },
  LOCDEC: { kind: 'ADHESIVE', tooling: true,  redraw: false, surfaces: ['face'] },
  NECK:   { kind: 'JEWELRY',  tooling: true,  redraw: true,  surfaces: ['pendant_face', 'pendant_reverse', 'clasp'] },
  ORAH:   { kind: 'JEWELRY',  tooling: true,  redraw: true,  surfaces: ['band_face', 'band_reverse', 'clasp'] }
});

export const VESSEL_CLASSES = Object.freeze(['MUG', 'CUP']);

// MERCH-CUP-SYSTEM-001. Side A is the logo mark. Side B is a phrase or a scene.
// Never both. Never a second copy of the side A mark.
export const CUP_SIDE_MAP = Object.freeze({
  map_code: 'MERCH-CUP-SYSTEM-001',
  applies_to: VESSEL_CLASSES,
  side_a_allowed_groups: Object.freeze(['MARK', 'MASTHEAD']),
  side_b_allowed_kinds: Object.freeze(['MASTHEAD', 'PHRASE', 'SCENE']),
  handle_clear_band_mm: 12,
  base_carries: 'SERIAL_ONLY',
  interior_carries: 'NOTHING',
  swap_prohibited: true
});

/** A lock is usable for a family only when it is approved, cleared for that
 *  family, and carries no unresolved open question. */
export function lockUsable(lockCode, familyCode) {
  const lock = ARTWORK_LOCKS[lockCode];
  if (!lock) return { usable: false, reasons: [`unknown artwork lock ${lockCode}`] };

  const reasons = [];
  if (!APPROVED_STATES.includes(lock.approval_state)) {
    reasons.push(`${lockCode} approval_state is ${lock.approval_state}`);
  }
  if (lock.merch_use_state === 'NOT_CLEARED') {
    reasons.push(`${lockCode} is not cleared for merchandise use`);
  } else if (lock.merch_use_state === 'CLEARED_LOGO_ONLY' && familyCode !== 'LOGO_ONLY') {
    // A logo-only clearance still permits the mark to act as the mark component
    // of a phrase or scene SKU; it does not permit the lock to supply the phrase
    // or the scene itself. Callers pass the mark lock here, so this is allowed.
    if (lock.group !== 'MARK' && lock.group !== 'MASTHEAD') {
      reasons.push(`${lockCode} is cleared for LOGO_ONLY only`);
    }
  }
  if (lock.open_question) {
    reasons.push(`${lockCode} has an unresolved open question`);
  }
  return { usable: reasons.length === 0, reasons };
}

export function lockByShort(short) {
  const entry = Object.entries(ARTWORK_LOCKS).find(([, l]) => l.short === short);
  return entry ? { lock_code: entry[0], ...entry[1] } : null;
}
