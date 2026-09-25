import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateTransmissionContract, validateLesson, understandingScore } from '../spine/lib/contracts.js';
import { lesson } from '../spine/lanes/the-six-lesson-001.mjs';

const tx = JSON.parse(readFileSync(new URL('../spine/lanes/transmission-001.contract.json', import.meta.url)));

test('Transmission 001 contract is complete and render-locked', () => {
  assert.deepEqual(validateTransmissionContract(tx), []);
  assert.equal(tx.render_allowed, false);
  assert.equal(tx.product.store_state, 'NOT_LISTED');
});

test('contract refuses render unlock, misspelled world, locked appearance before casting', () => {
  assert.match(validateTransmissionContract({ ...tx, render_allowed: true }).join(), /render_allowed/);
  assert.match(validateTransmissionContract({ ...tx, world: { ...tx.world, world_name: 'Edereariah' } }).join(), /canonical spelling/);
  const people = tx.people.map((p, i) => i === 1 ? { ...p, appearance_locked: true } : p);
  assert.match(validateTransmissionContract({ ...tx, people }).join(), /before casting/);
  const gates = { ...tx.render_unlock, gates: tx.render_unlock.gates.slice(1) };
  assert.match(validateTransmissionContract({ ...tx, render_unlock: gates }).join(), /missing gate/);
});

test('contract copy cannot make a medical-service claim', () => {
  const product = { ...tx.product, promise: 'We diagnose your child over the phone.' };
  assert.match(validateTransmissionContract({ ...tx, product }).join(), /medical_service/);
});

test('THE SIX lesson is complete, arithmetic is correct, candidate disclosed', () => {
  assert.deepEqual(validateLesson(lesson), []);
  assert.equal(lesson.concept.subject_code, 'MATHEMATICS');
  assert.equal(lesson.world_parameters[0].canon_state, 'CANON_CANDIDATE');
});

test('lesson validator catches wrong arithmetic and undisclosed candidate', () => {
  const bad = { ...lesson, worked_examples: [{ prompt: 'x', compute: () => 7.5, expected: 7.2, tolerance: 0.01 }] };
  assert.match(validateLesson(bad).join(), /expected 7.2/);
  assert.match(validateLesson({ ...lesson, candidate_disclosed_to_students: false }).join(), /students must be told/);
  assert.match(validateLesson({ ...lesson, concept: { ...lesson.concept, truth_state: 'TRUE' } }).join(), /truth_state/);
});

test('understanding score enforces the zero rule', () => {
  assert.equal(understandingScore({ K: 4, E: 3, C: 2, X: 2, T: 1 }), 48);
  assert.equal(understandingScore({ K: 4, E: 4, C: 4, X: 4, T: 0 }), 0);
  assert.throws(() => understandingScore({ K: 5, E: 1, C: 1, X: 1, T: 1 }));
});
