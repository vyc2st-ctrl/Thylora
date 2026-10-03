// MAH' · the one-word continuity head
// Workroom: WR-MAH-001
//
// The apostrophe is a math prime: f' means "f, changed". MAH' means "MAH, changed".
// The code is never allowed to stay the same, because the work never stays the same.
// Each approved layer adds ONE letter before the prime. The letters together spell a
// name, and every letter carries the rules it brought in. Earlier letters are never
// removed: that is how the code itself enforces "do not regress".

export const ROOT = Object.freeze({
  letter: 'MAH',
  meaning: 'Map · Apply · Hold',
  expands_to:
    "THYLORA HEAD — SPINE FORWARD | FULL SPINE | VYC2ST 0→∞ | QYRIS | LOAD LATEST BACKEND → " +
    "FIND EXACT LAST VERIFIED/APPROVED STATE → RECOVER EVERY UNFINISHED BRANCH AND EVERY-WORD INTENT → " +
    "APPLY ALL RELEVANT THYLORA LAWS, MATH, PEOPLE, WORLD, PRODUCTS, RIGHTS, STORE, MONEY, HELP, " +
    "EARTH/EDEREAIRAH AND MULTIPLE REASONING LENSES → COMPARE AGAINST THE APPROVED FLOOR → " +
    "DO NOT REGRESS, REPEAT, INVENT, DROP, OR SILENTLY CHANGE ANYTHING → TURN EVERY REPEATED FAILURE " +
    "INTO A PERMANENT PRECHECK → EXECUTE ALL SAFE UNBLOCKED WORK IN PARALLEL → SHOW WHAT CHANGED, " +
    "EVIDENCE, UNKNOWNS, BLOCKERS, MONEY/HELP PATHS, AND THE EXACT RESTART POINT.",
  rules: [
    'M · MAP — load the latest backend and find the last verified/approved state',
    'A · APPLY — every THYLORA law, math, people, world, product, rights, store, money, help and Earth/EdereAriah lens',
    'H · HOLD — compare to the approved floor; never regress, repeat, invent, drop or silently change',
    "' · PRIME — every repeated failure becomes a permanent precheck; the code must change when the work changes"
  ]
});

// Layers are appended, never edited. A layer's letter is chosen so the growing word
// still reads as a name. Status: PROPOSED until the Chairman approves the letter.
export const LAYERS = Object.freeze([
  {
    version: 1,
    letter: 'I',
    meaning: 'Invoke',
    status: 'PROPOSED',
    opened: '2026-10-03',
    source: 'Chairman prompt 2026-10-03 (store / MAH / Baltimore / Penny Candy / logic gaps)',
    rules: [
      'I1 · Every equation carries the question it is asking, printed directly under it (e.g. G = E_required − E_present → "What is still missing before this can be called done?")',
      'I2 · Every report invokes at least one question the reader has not asked yet, then shows the math that makes the question necessary, and lets the reader answer it first',
      'I3 · No PDF is produced until each section, line and box has been previewed and approved, one at a time',
      'I4 · Every artifact carries a unique serial AND a named preparer with THYLORA credentials (role, qualification, world/simulated status); no serial, no preparer, no release',
      'I5 · Judges and officials are always identified: title, court/type, what qualifies them for this report, and whether they are simulated (EdereAriah) or Earth persons',
      'I6 · "ACTIVE" or "LIVE" is never claimed without witnessed evidence; the status matrix is DECLARED → BUILT → WITNESSED → LIVE',
      'I7 · The Chairman\'s current ideas, math and logic stay in front: each session opens with the ideas ledger and gives one new thing from the world (idea, post, or question)',
      'I8 · Anchor time is Maryland (Baltimore, America/New_York); New York is shown beside it; world time is shown once the world epoch is set',
      'I9 · Store first: every session reports live/draft product count and the next batch to release',
      'I10 · Gaps are measured before the jump: evidence source → independent second source → mechanism (what actually produced the result) → then conclusion',
      'I11 · Layout is decolonized by default: designed for a first-time reader to understand in one read, centered, titled, credentialed',
      'I12 · Each prompt is broken into every-word intents and each one is answered, routed, or named as held; nothing silently falls off',
      'I13 · A re-sent prompt is never redone from scratch: verify the floor still holds, then diff the prompt against the intent ledger and close only what was missed'
    ]
  }
]);

/** The current one-word code, e.g. "MAHI'". */
export function currentCode(layers = LAYERS) {
  return ROOT.letter + layers.map(l => l.letter).join('') + "'";
}

/** Expand a code back into its full instruction set. Unknown letters are refused, not guessed. */
export function expand(code, layers = LAYERS) {
  const clean = String(code || '').trim().replace(/[’‘`]/g, "'").toUpperCase();
  if (!clean.startsWith(ROOT.letter)) throw new Error(`MAH_CODE_INVALID: ${code}`);
  const body = clean.replace(/'+$/, '').slice(ROOT.letter.length);
  if (body.length > layers.length) throw new Error(`MAH_CODE_AHEAD_OF_LEDGER: ${code} has ${body.length} layers, ledger has ${layers.length}`);
  const used = [];
  for (let i = 0; i < body.length; i++) {
    if (body[i] !== layers[i].letter) throw new Error(`MAH_CODE_MISMATCH at layer ${i + 1}: expected ${layers[i].letter}, got ${body[i]}`);
    used.push(layers[i]);
  }
  const stale = layers.length - used.length;
  return {
    code: clean.endsWith("'") ? clean : clean + "'",
    current: currentCode(layers),
    stale_layers: stale,
    warning: stale ? `This code is ${stale} layer(s) behind ${currentCode(layers)}; newer rules also apply.` : null,
    instruction: ROOT.expands_to,
    rules: [...ROOT.rules, ...layers.flatMap(l => l.rules)]
  };
}

/** Append a new layer. Never mutates or reorders existing layers. */
export function addLayer(layers, layer) {
  if (!/^[A-Z]$/.test(layer.letter || '')) throw new Error('MAH_LAYER_LETTER: one capital letter');
  if (!layer.rules?.length) throw new Error('MAH_LAYER_EMPTY: a layer must add at least one rule');
  return Object.freeze([...layers, Object.freeze({ ...layer, version: layers.length + 1, status: layer.status || 'PROPOSED' })]);
}
