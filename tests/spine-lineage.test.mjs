import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRun, appendUnit, verifyRun, ancestry, wakeFor, validateContribution, canonical } from '../spine/lib/lineage.js';

const pv = { source: 'Chairman directive', method: 'CLAUDE_CODE', rights_basis: 'THYLORA original', recorded_at: '2026-09-24T12:00:00Z' };
const wake = (ref, extra = {}) => [{
  artifact_ref: ref, maker: { id: 'Vyctor Peete', kind: 'PERSON' }, role: 'Chairman', question: 'What should exist?',
  rejected_ideas: [{ idea: 'Separate ledger', reason: 'duplicates primitive' }],
  open_questions: [{ question: 'Mirror table?', owner: 'Chairman' }], ...extra,
}];
const unit = (id, it, parents = []) => ({ unit_id: id, iteration: it, batch: `B${it}`, kind: 'SCHEMA', artifact_ref: `art/${id}`, parent_units: parents, provenance: pv, contributions: wake(`art/${id}`) });

test('canonical JSON is key-order independent', () => {
  assert.equal(canonical({ b: 1, a: { d: 2, c: 3 } }), canonical({ a: { c: 3, d: 2 }, b: 1 }));
});

test('run appends from iteration 0 and verifies', () => {
  const r = createRun({ run_id: 'VYC2ST-0-INF', owner: 'Vyctor Peete' });
  assert.ok(appendUnit(r, unit('U0', 0)).ok);
  assert.ok(appendUnit(r, unit('U1', 1, ['U0'])).ok);
  assert.ok(appendUnit(r, unit('U2', 1000000, ['U1'])).ok, 'no iteration ceiling');
  assert.equal(verifyRun(r).ok, true);
  assert.deepEqual(ancestry(r, 'U2'), ['U1', 'U0']);
  assert.equal(wakeFor(r, 'U1').rejected_ideas.length, 1);
});

test('iteration cannot go backwards; parents must exist; ids unique', () => {
  const r = createRun({ run_id: 'R', owner: 'o' });
  appendUnit(r, unit('U0', 2));
  assert.match(appendUnit(r, unit('U1', 1)).errors.join(), /backwards/);
  assert.match(appendUnit(r, unit('U2', 3, ['NOPE'])).errors.join(), /parent NOPE/);
  assert.match(appendUnit(r, unit('U0', 3)).errors.join(), /already used/);
});

test('artifact without Contribution Wake is refused', () => {
  const r = createRun({ run_id: 'R', owner: 'o' });
  const u = unit('U0', 0); u.contributions = [];
  assert.match(appendUnit(r, u).errors.join(), /Contribution Wake missing/);
});

test('tampering, dropping and reordering are detected', () => {
  const r = createRun({ run_id: 'R', owner: 'o' });
  for (let i = 0; i < 4; i++) appendUnit(r, unit(`U${i}`, i));
  const edited = { ...r, units: r.units.map((u, i) => i === 2 ? { ...u, artifact_ref: 'forged' } : u) };
  assert.equal(verifyRun(edited).reason, 'content altered');
  const dropped = { ...r, units: r.units.filter((_, i) => i !== 1) };
  assert.equal(verifyRun(dropped).ok, false);
  const swapped = { ...r, units: [r.units[1], r.units[0], ...r.units.slice(2)] };
  assert.equal(verifyRun(swapped).ok, false);
});

test('contribution rules: AI disclosure, in-world layer, consent, reasons, owners', () => {
  const base = wake('a')[0];
  assert.deepEqual(validateContribution(base), []);
  assert.match(validateContribution({ ...base, maker: { id: 'Claude', kind: 'AI_ASSISTANT' } }).join(), /disclosed/);
  assert.match(validateContribution({ ...base, maker: { id: 'Nia Carter', kind: 'IN_WORLD_CHARACTER' } }).join(), /world_layer/);
  assert.match(validateContribution({ ...base, public_credit: true }).join(), /consent/);
  assert.match(validateContribution({ ...base, rejected_ideas: [{ idea: 'x' }] }).join(), /reason/);
  assert.match(validateContribution({ ...base, open_questions: [{ question: 'q' }] }).join(), /owner/);
  assert.match(validateContribution({ ...base, question: '' }).join(), /question missing/);
});
