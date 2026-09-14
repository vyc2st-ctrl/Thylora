// THYLORA Dashboard R6 · margin note custody tests
// Canonical backend record: THY-IDEA-READBACK-MARGIN-NOTES-001
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createNote, attachNote, supersedeNote, setSelected, setCustody, anchorAt,
  inResponseOrder, selectedNotes, liveNotes, buildNextPrompt, custodyReport,
  NOTE_KINDS, NOTE_CUSTODY
} from '../dashboard/r6/lib/margin-notes.js';

const RESPONSE = 'The storefront is live in three territories. Payment acceptance is not connected. We plan to ship on Friday regardless of the payment rail.';

const noteAt = (char, body) => createNote({
  responseId: 'RESP-1', responseText: RESPONSE, char, body, kind: NOTE_KINDS.SPOKEN
});

test('a note is anchored to the exact character, not the paragraph', () => {
  const note = noteAt(48, 'This is the blocker.');
  assert.equal(note.anchor.char, 48);
  assert.equal(note.anchor.total_chars, RESPONSE.length);
  // the anchor quotes the response on both sides of the exact point
  assert.ok(RESPONSE.startsWith(note.anchor.preview_before, 48 - note.anchor.preview_before.length));
  assert.ok(RESPONSE.slice(48).startsWith(note.anchor.preview_after));
});

test('the anchor percentage reflects position through the response', () => {
  assert.equal(anchorAt(RESPONSE, 0).percent, 0);
  assert.equal(anchorAt(RESPONSE, RESPONSE.length).percent, 100);
  assert.ok(anchorAt(RESPONSE, Math.floor(RESPONSE.length / 2)).percent > 45);
});

test('an anchor past either end of the response is clamped, not rejected', () => {
  assert.equal(anchorAt(RESPONSE, -50).char, 0);
  assert.equal(anchorAt(RESPONSE, 99999).char, RESPONSE.length);
});

test('the original response cannot be reached or changed through a note', () => {
  const before = RESPONSE;
  const note = noteAt(20, 'mark this');
  assert.throws(() => { note.body = 'rewritten'; }, TypeError);
  assert.throws(() => { note.anchor.char = 0; }, TypeError);
  assert.equal(RESPONSE, before);
});

test('attaching a note never mutates the existing list', () => {
  const first = attachNote([], noteAt(10, 'one'));
  const second = attachNote(first, noteAt(20, 'two'));
  assert.equal(first.length, 1, 'the earlier list is untouched');
  assert.equal(second.length, 2);
});

test('every note is its own atom even at the same response location', () => {
  const notes = attachNote(attachNote([], noteAt(30, 'first thought')), noteAt(30, 'second thought'));
  assert.equal(notes.length, 2);
  assert.notEqual(notes[0].note_id, notes[1].note_id);
  assert.equal(custodyReport(notes).all_preserved, true);
});

test('superseding a note keeps both atoms and records the link', () => {
  const original = noteAt(30, 'ship Friday');
  const notes = attachNote([], original);
  const replaced = supersedeNote(notes, original.note_id, noteAt(30, 'ship Monday'));
  assert.equal(replaced.length, 2, 'the replaced note still exists');
  assert.equal(replaced[1].supersedes, original.note_id);
  const live = liveNotes(replaced);
  assert.equal(live[0].superseded, true);
  assert.equal(live[1].superseded, false);
});

test('superseding an unknown note is refused rather than silently appended', () => {
  assert.throws(() => supersedeNote([], 'NOPE', noteAt(1, 'x')), /unknown note/i);
});

test('notes read back in response order, not the order they were spoken', () => {
  let notes = attachNote([], noteAt(120, 'said last, sits late'));
  notes = attachNote(notes, noteAt(5, 'said second, sits first'));
  const ordered = inResponseOrder(notes);
  assert.equal(ordered[0].anchor.char, 5);
  assert.equal(ordered[1].anchor.char, 120);
});

test('selection is per note and does not disturb the others', () => {
  let notes = attachNote(attachNote([], noteAt(10, 'a')), noteAt(20, 'b'));
  notes = setSelected(notes, notes[1].note_id, true);
  assert.equal(selectedNotes(notes).length, 1);
  assert.equal(selectedNotes(notes)[0].body, 'b');
  assert.equal(notes[0].selected, false);
});

test('BUILD NEXT PROMPT refuses to invent a prompt from nothing', () => {
  const built = buildNextPrompt([]);
  assert.equal(built.text, '');
  assert.match(built.error, /No notes selected/);
});

test('the next prompt carries one numbered line per selected note, in response order', () => {
  let notes = attachNote([], noteAt(100, 'payment rail is the real blocker'));
  notes = attachNote(notes, noteAt(10, 'confirm the three territories'));
  notes = setSelected(notes, notes[0].note_id, true);
  notes = setSelected(notes, notes[1].note_id, true);
  const built = buildNextPrompt(notes, { responseTitle: 'the storefront response' });

  assert.equal(built.count, 2);
  assert.match(built.text, /1\. .*confirm the three territories/);
  assert.match(built.text, /2\. .*payment rail is the real blocker/);
  assert.match(built.text, /the storefront response/);
  // and it instructs the next answer to resolve each item, so nothing can be dropped
  assert.match(built.text, /ANSWERED, EXECUTED, REGISTERED, or DEFERRED_WITH_REASON/);
  assert.match(built.text, /do not drop one silently/i);
});

test('an unselected note is never carried into the next prompt', () => {
  let notes = attachNote(attachNote([], noteAt(10, 'carry me')), noteAt(20, 'leave me'));
  notes = setSelected(notes, notes[0].note_id, true);
  const built = buildNextPrompt(notes);
  assert.match(built.text, /carry me/);
  assert.doesNotMatch(built.text, /leave me/);
  assert.equal(built.noteIds.length, 1);
});

test('custody is reported honestly and never assumed', () => {
  let notes = attachNote(attachNote([], noteAt(10, 'a')), noteAt(20, 'b'));
  assert.equal(custodyReport(notes).local_only, 2);
  assert.equal(custodyReport(notes).in_custody, 0);
  notes = setCustody(notes, notes[0].note_id, NOTE_CUSTODY.IN_CUSTODY);
  const report = custodyReport(notes);
  assert.equal(report.in_custody, 1);
  assert.equal(report.local_only, 1);
  assert.equal(report.total, 2);
});

test('an ink note keeps its drawing payload as part of the atom', () => {
  const ink = { format: 'THY-INK-1', strokes: [{ id: 'S1', tool: 'PEN', points: [{ x: 0.1, y: 0.2, p: 0.5 }] }], pins: [] };
  const note = createNote({ responseId: 'RESP-1', responseText: RESPONSE, char: 12, kind: NOTE_KINDS.INK, ink, body: '1 sketch stroke' });
  assert.equal(note.kind, NOTE_KINDS.INK);
  assert.equal(note.ink.strokes.length, 1);
  assert.throws(() => { note.ink.strokes = []; }, TypeError);
});
