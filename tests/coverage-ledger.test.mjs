// THYLORA Dashboard R6 · Prompt Coverage Ledger tests
// Canonical backend record: THY-IDEA-PROMPT-COVERAGE-LEDGER-001
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  atomizePrompt, resolveAtom, coverage, verifyContinuity, completionGate,
  isSubstantive, checksum, ATOM_STATES, FAILURES
} from '../dashboard/r6/lib/coverage-ledger.js';

const PROMPT = `BUILD:
1. Two-lane Chairman workspace.
2. Response controls:
   Speak / Pause / Resume / Stop.
3. During readback, Chairman can hold a microphone button.
   - Do not destroy the original response.
   - Duck readback audio while Chairman speaks.
ok`;

test('a structured prompt atomizes item by item, keeping sub-points separate', () => {
  const ledger = atomizePrompt(PROMPT, { promptId: 'P1' });
  const texts = ledger.atoms.map(a => a.text);
  assert.ok(texts.some(t => /Two-lane Chairman workspace/.test(t)));
  assert.ok(texts.some(t => /Do not destroy the original response/.test(t)));
  assert.ok(texts.some(t => /Duck readback audio/.test(t)));
  // the two sub-points are separate atoms, so neither can hide inside the other
  const destroy = ledger.atoms.find(a => /Do not destroy/.test(a.text));
  const duck = ledger.atoms.find(a => /Duck readback/.test(a.text));
  assert.notEqual(destroy.atom_id, duck.atom_id);
});

test('a heading is carried onto the atoms beneath it', () => {
  const ledger = atomizePrompt(PROMPT, { promptId: 'P1' });
  assert.equal(ledger.atoms.find(a => /Two-lane/.test(a.text)).section, 'BUILD');
});

test('acknowledgements are not atomized as if they were instructions', () => {
  assert.equal(isSubstantive('ok'), false);
  assert.equal(isSubstantive('Thanks'), false);
  assert.equal(isSubstantive('---'), false);
  assert.equal(isSubstantive('Ship the storefront'), true);
  const ledger = atomizePrompt(PROMPT, { promptId: 'P1' });
  assert.equal(ledger.atoms.some(a => a.text.toLowerCase() === 'ok'), false);
});

test('unstructured prose becomes one atom per instruction', () => {
  const ledger = atomizePrompt('Ship the store. Connect the payment rail. Tell me when it is done.', { promptId: 'P2' });
  assert.equal(ledger.atoms.length, 3);
});

test('every atom starts at UNKNOWN', () => {
  const ledger = atomizePrompt(PROMPT, { promptId: 'P1' });
  assert.ok(ledger.atoms.every(a => a.state === ATOM_STATES.UNKNOWN));
  assert.equal(coverage(ledger).unknown, ledger.atoms.length);
});

test('completion is refused while any atom is still UNKNOWN', () => {
  const ledger = atomizePrompt(PROMPT, { promptId: 'P1' });
  const gate = completionGate(ledger);
  assert.equal(gate.complete, false);
  assert.equal(gate.blockers[0].failure, FAILURES.ATOM_UNRESOLVED);
});

test('completion passes only when every atom has resolved', () => {
  let ledger = atomizePrompt('Ship the store. Connect the rail.', { promptId: 'P3' });
  ledger = resolveAtom(ledger, ledger.atoms[0].atom_id, ATOM_STATES.EXECUTED, { evidence: 'ORDER-1' });
  assert.equal(completionGate(ledger).complete, false, 'one atom still unknown');
  ledger = resolveAtom(ledger, ledger.atoms[1].atom_id, ATOM_STATES.DEFERRED_WITH_REASON, { reason: 'Provider account not open yet.' });
  const gate = completionGate(ledger);
  assert.equal(gate.complete, true);
  assert.match(gate.statement, /2\/2 atoms resolved/);
});

test('a deferral without a stated reason is refused', () => {
  const ledger = atomizePrompt('Connect the payment rail.', { promptId: 'P4' });
  assert.throws(
    () => resolveAtom(ledger, ledger.atoms[0].atom_id, ATOM_STATES.DEFERRED_WITH_REASON, {}),
    err => err.code === FAILURES.DEFERRAL_WITHOUT_REASON
  );
  assert.throws(
    () => resolveAtom(ledger, ledger.atoms[0].atom_id, ATOM_STATES.DEFERRED_WITH_REASON, { reason: '   ' }),
    /requires a stated reason/
  );
});

test('resolving returns a new ledger and leaves the previous reading intact', () => {
  const ledger = atomizePrompt('Ship the store.', { promptId: 'P5' });
  const resolved = resolveAtom(ledger, ledger.atoms[0].atom_id, ATOM_STATES.EXECUTED);
  assert.equal(ledger.atoms[0].state, ATOM_STATES.UNKNOWN);
  assert.equal(resolved.atoms[0].state, ATOM_STATES.EXECUTED);
});

test('resolving an atom that is not in the ledger is refused', () => {
  const ledger = atomizePrompt('Ship the store.', { promptId: 'P6' });
  assert.throws(() => resolveAtom(ledger, 'GHOST', ATOM_STATES.ANSWERED), /unknown atom/i);
});

test('an atom that silently disappears is caught and named', () => {
  const before = atomizePrompt(PROMPT, { promptId: 'P1' });
  const dropped = before.atoms[2];
  const after = { ...before, atoms: before.atoms.filter(a => a.atom_id !== dropped.atom_id) };

  const continuity = verifyContinuity(before, after);
  assert.equal(continuity.ok, false);
  assert.equal(continuity.missing.length, 1);
  assert.equal(continuity.missing[0].atom_id, dropped.atom_id);
  assert.equal(continuity.missing[0].text, dropped.text, 'the lost atom can still be read back');
});

test('completion fails hard when an atom disappears, even if the rest resolved', () => {
  let before = atomizePrompt('Ship the store. Connect the rail.', { promptId: 'P7' });
  const dropped = before.atoms[1];
  let after = { ...before, atoms: before.atoms.filter(a => a.atom_id !== dropped.atom_id) };
  after = resolveAtom(after, after.atoms[0].atom_id, ATOM_STATES.EXECUTED);

  // every remaining atom is resolved, so a naive check would call this complete
  assert.equal(coverage(after).unknown, 0);

  const gate = completionGate(after, { previous: before });
  assert.equal(gate.complete, false);
  assert.equal(gate.blockers[0].failure, FAILURES.ATOM_DISAPPEARED);
  assert.match(gate.statement, /ATOM_DISAPPEARED/);
});

test('an atom whose text is rewritten after the fact is caught as a mutation', () => {
  const before = atomizePrompt('Ship the store on Friday.', { promptId: 'P8' });
  const after = { ...before, atoms: before.atoms.map(a => ({ ...a, text: 'Ship the store eventually.' })) };
  const continuity = verifyContinuity(before, after);
  assert.equal(continuity.ok, false);
  assert.equal(continuity.mutated.length, 1);
  assert.equal(completionGate(after, { previous: before }).blockers[0].failure, FAILURES.ATOM_MUTATED);
});

test('adding atoms is allowed; only losing or rewriting them is a failure', () => {
  const before = atomizePrompt('Ship the store.', { promptId: 'P9' });
  const extra = atomizePrompt('Ship the store. Also connect the rail.', { promptId: 'P9' });
  const after = { ...before, atoms: [...before.atoms, { ...extra.atoms[1] }] };
  const continuity = verifyContinuity(before, after);
  assert.equal(continuity.ok, true);
  assert.equal(continuity.added, 1);
});

test('the checksum notices a changed prompt body', () => {
  assert.equal(checksum('Ship the store.'), checksum('Ship the store.'));
  assert.notEqual(checksum('Ship the store.'), checksum('Ship the store'));
});

test('coverage counts each resolution kind separately', () => {
  let ledger = atomizePrompt('One. Two. Three. Four.', { promptId: 'P10' });
  ledger = resolveAtom(ledger, ledger.atoms[0].atom_id, ATOM_STATES.ANSWERED);
  ledger = resolveAtom(ledger, ledger.atoms[1].atom_id, ATOM_STATES.EXECUTED);
  ledger = resolveAtom(ledger, ledger.atoms[2].atom_id, ATOM_STATES.REGISTERED);
  const cov = coverage(ledger);
  assert.deepEqual(
    [cov.answered, cov.executed, cov.registered, cov.deferred, cov.unknown],
    [1, 1, 1, 0, 1]
  );
  assert.equal(cov.percent, 75);
  assert.equal(cov.unresolved_atoms.length, 1);
});
