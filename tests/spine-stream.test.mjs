import { test } from 'node:test';
import assert from 'node:assert/strict';
import { capture, extractAtoms, verifyCoverage, relate, createQueue, enqueue, move, snapshot, restore, restartPoint, noLoss } from '../spine/lib/stream.js';

const TX = `Build the doctor packet first. Also, the lineage run needs a hash chain.
Another thing the contractors must never share a password; give them scoped access. Number two: the Six lesson should use the orbit.`;

test('capture keeps verbatim text and does not self-verify the speaker', () => {
  const c = capture({ capture_id: 'CAP-1', transcript: TX, speaker_declared: 'Vyctor Peete' });
  assert.equal(c.transcript, TX);
  assert.equal(c.speaker_state, 'DECLARED_UNVERIFIED');
  assert.equal(capture({ capture_id: 'CAP-2', transcript: TX, speaker_declared: 'V', speaker_verification_ref: 'gate-row-1' }).speaker_state, 'VERIFIED_BY_GATE');
});

test('atoms tile every non-whitespace character exactly once', () => {
  const c = capture({ capture_id: 'CAP-1', transcript: TX });
  const atoms = extractAtoms(c);
  assert.ok(atoms.length >= 4, `got ${atoms.length}`);
  assert.deepEqual(verifyCoverage(c, atoms), { ok: true, atoms: atoms.length });
  const lossy = atoms.slice(1);
  assert.equal(verifyCoverage(c, lossy).ok, false);
  const forged = atoms.map((a, i) => i === 0 ? { ...a, text: 'Build nothing.' } : a);
  assert.equal(verifyCoverage(c, forged).ok, false);
});

test('relation map links atoms and registry names', () => {
  const c = capture({ capture_id: 'C', transcript: 'The lineage run needs hashing. The lineage record feeds the store. Weather is nice.' });
  const edges = relate(extractAtoms(c), [{ code: 'L02-LINEAGE-RUN', name: 'lineage run' }]);
  assert.ok(edges.some(e => e.kind === 'SHARED_TERMS' && e.shared.includes('lineage')));
  assert.ok(edges.some(e => e.to === 'L02-LINEAGE-RUN'));
});

test('queue never discards; parking needs a reason; routing needs a route', () => {
  const c = capture({ capture_id: 'C', transcript: TX });
  const atoms = extractAtoms(c);
  const q = createQueue('Q'); enqueue(q, atoms);
  assert.match(move(q, atoms[0].atom_id, 'DISCARDED').error, /never discarded/);
  assert.match(move(q, atoms[0].atom_id, 'PARKED').error, /reason/);
  assert.match(move(q, atoms[0].atom_id, 'ROUTED').error, /route/);
  assert.ok(move(q, atoms[0].atom_id, 'ROUTED', { route: 'L01-TX001-DOCTOR' }).ok);
  assert.match(move(q, atoms[0].atom_id, 'DONE').error, /not allowed/);
});

test('snapshot → restart restores exactly and finds the restart point', () => {
  const c = capture({ capture_id: 'C', transcript: TX });
  const atoms = extractAtoms(c);
  const q = createQueue('Q'); enqueue(q, atoms);
  move(q, atoms[0].atom_id, 'ROUTED', { route: 'L01' });
  move(q, atoms[0].atom_id, 'IN_WORK');
  move(q, atoms[0].atom_id, 'DONE');
  move(q, atoms[1].atom_id, 'PARKED', { reason: 'waiting on Chairman' });
  const snap = JSON.parse(JSON.stringify(snapshot(q)));
  const r = restore(snap);
  assert.ok(r.ok);
  assert.equal(r.restart_point, atoms[1].atom_id);
  assert.equal(restartPoint(r.queue), atoms[1].atom_id);
  assert.deepEqual(noLoss(c, atoms, r.queue).ok, true);
});

test('altered or truncated snapshot is refused', () => {
  const c = capture({ capture_id: 'C', transcript: TX });
  const q = createQueue('Q'); enqueue(q, extractAtoms(c));
  const snap = JSON.parse(JSON.stringify(snapshot(q)));
  const cut = { ...snap, items: snap.items.slice(1) };
  assert.equal(restore(cut).ok, false);
});

test('noLoss fails when an atom never reached the queue', () => {
  const c = capture({ capture_id: 'C', transcript: TX });
  const atoms = extractAtoms(c);
  const q = createQueue('Q'); enqueue(q, atoms.slice(1));
  assert.match(noLoss(c, atoms, q).reason, /not queued/);
});
