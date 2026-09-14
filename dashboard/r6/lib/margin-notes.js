// THYLORA Dashboard R6 · margin note atoms
// Canonical backend record: THY-IDEA-READBACK-MARGIN-NOTES-001
//
// A margin note is what the Chairman says into the response while the response
// is being read back to him. The rules he set are absolute and are enforced
// here rather than left to the UI:
//
//   1. The original response is never destroyed, never edited, never annotated
//      in place. Notes live beside it and point at it. Every function in this
//      module is pure and returns new objects; nothing here can reach into a
//      response and change it.
//   2. A note is timestamped to the exact response location — the character
//      offset the readback had reached when the microphone went down, not the
//      paragraph, not the section.
//   3. Every note is preserved as an individual atom. Notes are never merged,
//      never collapsed into a summary, never silently replaced. Superseding a
//      note keeps both the old atom and the new one and records the link.
//
// These are the same custody rules the rest of THYLORA applies to records: the
// evidence is additive, and nothing disappears quietly.

export const NOTE_KINDS = Object.freeze({
  SPOKEN: 'SPOKEN',           // held the microphone and spoke
  TYPED: 'TYPED',             // typed into the note lane
  INK: 'INK',                 // sketched or handwritten on the canvas
  PIN: 'PIN'                  // a comment pin dropped on an image, video or the response
});

export const NOTE_CUSTODY = Object.freeze({
  LOCAL: 'LOCAL',                       // held on this device only
  PENDING_CUSTODY: 'PENDING_CUSTODY',   // queued for the backend, not yet accepted
  IN_CUSTODY: 'IN_CUSTODY'              // the backend has acknowledged the atom
});

/** How much of the response to quote around an anchor, for recognisable context. */
const ANCHOR_PREVIEW_RADIUS = 90;

let counter = 0;

/**
 * Note identifiers are unique per note and carry the moment of capture, so two
 * notes taken at the same response location are still distinguishable atoms.
 */
export function noteId(now = Date.now()) {
  counter += 1;
  return `THY-NOTE-${now}-${String(counter).padStart(4, '0')}`;
}

/**
 * Build the anchor that ties a note to the exact place in the response.
 *
 * `preview` is a quotation of the response around the anchor. It is a copy for
 * display; the response itself is untouched and remains the only original.
 */
export function anchorAt(responseText, char, { segmentIndex = null, percent = null } = {}) {
  const text = String(responseText ?? '');
  const at = Math.max(0, Math.min(Math.round(char || 0), text.length));
  const from = Math.max(0, at - ANCHOR_PREVIEW_RADIUS);
  const to = Math.min(text.length, at + ANCHOR_PREVIEW_RADIUS);
  return {
    char: at,
    percent: percent ?? (text.length ? Math.round((at / text.length) * 1000) / 10 : 0),
    segment_index: segmentIndex,
    preview_before: text.slice(from, at),
    preview_after: text.slice(at, to),
    total_chars: text.length
  };
}

/**
 * Create a note atom. Returns a frozen object: once a note exists, this module
 * offers no way to change what it said.
 */
export function createNote({
  responseId,
  responseText = '',
  char = 0,
  body = '',
  kind = NOTE_KINDS.SPOKEN,
  segmentIndex = null,
  percent = null,
  elapsedSeconds = null,
  target = null,          // { type: 'RESPONSE'|'IMAGE'|'VIDEO'|'DOCUMENT', ref, x, y, t }
  ink = null,             // stroke payload for INK notes
  supersedes = null,
  capturedAt = Date.now()
} = {}) {
  return Object.freeze({
    note_id: noteId(capturedAt),
    response_id: responseId ?? null,
    kind,
    body: String(body ?? '').trim(),
    anchor: Object.freeze(anchorAt(responseText, char, { segmentIndex, percent })),
    readback_elapsed_seconds: elapsedSeconds,
    target: target ? Object.freeze({ ...target }) : null,
    ink: ink ? Object.freeze(ink) : null,
    supersedes: supersedes ?? null,
    custody: NOTE_CUSTODY.LOCAL,
    captured_at: new Date(capturedAt).toISOString(),
    selected: false
  });
}

/** Append a note. The input array is not modified. */
export function attachNote(notes, note) {
  return Object.freeze([...(notes || []), note]);
}

/**
 * Supersede a note without destroying it. Both atoms remain in the ledger; the
 * replacement points back at what it replaces, so the trail stays readable.
 */
export function supersedeNote(notes, targetId, replacement) {
  const list = notes || [];
  if (!list.some(n => n.note_id === targetId)) {
    throw new Error(`Cannot supersede unknown note ${targetId}`);
  }
  return attachNote(list, Object.freeze({ ...replacement, supersedes: targetId }));
}

/** Toggle selection. Returns a new list; the note atoms themselves stay frozen. */
export function setSelected(notes, noteId, selected) {
  return Object.freeze((notes || []).map(n =>
    n.note_id === noteId ? Object.freeze({ ...n, selected: !!selected }) : n));
}

export function setCustody(notes, noteId, custody) {
  return Object.freeze((notes || []).map(n =>
    n.note_id === noteId ? Object.freeze({ ...n, custody }) : n));
}

/** Notes in the order they sit in the response, not the order they were spoken. */
export function inResponseOrder(notes) {
  return [...(notes || [])].sort((a, b) => (a.anchor?.char ?? 0) - (b.anchor?.char ?? 0));
}

export function selectedNotes(notes) {
  return (notes || []).filter(n => n.selected);
}

/** Notes that this ledger's later atoms have replaced. */
export function supersededIds(notes) {
  return new Set((notes || []).map(n => n.supersedes).filter(Boolean));
}

/**
 * The live reading of the note lane: superseded atoms are marked, never dropped.
 */
export function liveNotes(notes) {
  const replaced = supersededIds(notes);
  return (notes || []).map(n => ({ ...n, superseded: replaced.has(n.note_id) }));
}

/**
 * BUILD NEXT PROMPT FROM SELECTED NOTES.
 *
 * The next prompt is assembled, not summarised. Each selected note contributes
 * its own line carrying its own anchor, so the prompt that goes back to THYLORA
 * can be traced item by item to the moment in the readback that produced it.
 * Nothing is paraphrased away, which is what keeps the Prompt Coverage Ledger
 * able to hold the next answer to account.
 */
export function buildNextPrompt(notes, { responseTitle = 'the previous response', includeQuotes = true } = {}) {
  const chosen = inResponseOrder(selectedNotes(notes));
  if (!chosen.length) {
    return { text: '', noteIds: [], count: 0, error: 'No notes selected. Select the notes to carry forward.' };
  }
  const lines = chosen.map((note, i) => {
    const where = note.anchor?.percent != null ? `${note.anchor.percent}% into ${responseTitle}` : responseTitle;
    const quote = includeQuotes && note.anchor?.preview_after
      ? `\n   Response said: "${note.anchor.preview_after.trim().slice(0, 120)}"`
      : '';
    const pin = note.target && note.target.type !== 'RESPONSE'
      ? `\n   Pinned to: ${note.target.type} ${note.target.ref ?? ''}`.trimEnd()
      : '';
    return `${i + 1}. [${where}] ${note.body || '(ink note — see canvas)'}${quote}${pin}`;
  });
  const text = [
    `Carrying forward ${chosen.length} margin note${chosen.length === 1 ? '' : 's'} taken during readback of ${responseTitle}.`,
    '',
    ...lines,
    '',
    'Answer every numbered item above. Each one is a separate atom and must resolve to ANSWERED, EXECUTED, REGISTERED, or DEFERRED_WITH_REASON. Do not merge items and do not drop one silently.'
  ].join('\n');
  return { text, noteIds: chosen.map(n => n.note_id), count: chosen.length, error: null };
}

/**
 * Custody proof for the note lane: what exists, what the backend has, what is
 * still only on this device. Shown to the Chairman rather than assumed.
 */
export function custodyReport(notes) {
  const list = notes || [];
  const count = c => list.filter(n => n.custody === c).length;
  return {
    total: list.length,
    in_custody: count(NOTE_CUSTODY.IN_CUSTODY),
    pending: count(NOTE_CUSTODY.PENDING_CUSTODY),
    local_only: count(NOTE_CUSTODY.LOCAL),
    all_preserved: list.length === new Set(list.map(n => n.note_id)).size
  };
}
