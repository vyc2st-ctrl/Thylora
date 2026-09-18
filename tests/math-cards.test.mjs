// THYLORA · concept cards and Understanding Cards
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  conceptCard, conceptCards, exampleCard, exampleCards,
  buildUnderstandingCard, superseding, cardIntegrity, familyReading, CARD_RULES
} from '../math-surface/lib/cards.js';
import { observe } from '../math-surface/lib/understanding.js';
import { CLAIMS } from '../math-surface/lib/understanding.js';
import { exampleById, WORKED_EXAMPLES } from '../math-surface/lib/examples.js';
import { REQUIRED_WORDS } from '../math-surface/lib/language.js';

const example = exampleById('WE-07');

test('a concept card exists for every registry word and shows all three layers', () => {
  const cards = conceptCards();
  assert.equal(cards.length, REQUIRED_WORDS.length);
  for (const card of cards) {
    assert.equal(card.kind, 'CONCEPT_CARD');
    assert.ok(card.layers.L.content.length > 5, `${card.word}: no language content`);
    assert.ok(card.layers.M.content.length > 5, `${card.word}: no relationship content`);
    assert.ok(card.layers.S.content.length > 5, `${card.word}: no solve content`);
    assert.equal(card.equation, 'P_solve = L × M × S');
    assert.match(card.hard_rule, /lacks the mathematics/i);
  }
});

test('the mathematics is on the front of the concept card, not behind it', () => {
  const card = conceptCard('at least');
  assert.equal(card.layers.M.notation, 'x ≥ n');
  assert.match(card.layers.L.misread, /more than/i);
  assert.ok(card.worked_examples.includes('WE-05'));
});

test('an example card carries the four isolations and the sentence load', () => {
  const card = exampleCard(exampleById('WE-12'));
  assert.equal(card.isolations.length, 4);
  assert.equal(card.language_load.band, 'HEAVY');
  assert.equal(exampleCards().length, WORKED_EXAMPLES.length);
});

// --- Understanding Cards ---------------------------------------------------

function card(observations, explain = '') {
  return buildUnderstandingCard({
    learner_ref: 'LR-TEST-001',
    example,
    observations,
    explain_back: explain,
    recorded_by: 'test suite',
    at: '2026-09-18T09:00:00.000Z'
  });
}

test('a card records the equation with the measured factors filled in', () => {
  const c = card([
    observe({ layer: 'L', correct: 0, attempted: 2 }),
    observe({ layer: 'M', correct: 2, attempted: 2 }),
    observe({ layer: 'S', correct: 2, attempted: 2 })
  ]);
  assert.equal(c.expression, 'P_solve = L × M × S = 0 × 1 × 1');
  assert.equal(c.p_solve.value, 0);
  assert.equal(c.p_solve.determined, true);
  assert.equal(cardIntegrity(c).ok, true);
});

test('a card always prints what was not measured', () => {
  const c = card([observe({ layer: 'L', correct: 0, attempted: 2 })]);
  assert.deepEqual([...c.not_measured], ['M', 'S']);
  assert.match(c.not_measured_statement, /Not measured in isolation/);
  assert.match(c.not_measured_statement, /may be read as a statement/);
  assert.equal(cardIntegrity(c).ok, true);
});

test('a card with all three layers measured says so', () => {
  const c = card([
    observe({ layer: 'L', correct: 2, attempted: 2 }),
    observe({ layer: 'M', correct: 2, attempted: 2 }),
    observe({ layer: 'S', correct: 1, attempted: 2 })
  ]);
  assert.deepEqual([...c.not_measured], []);
  assert.equal(c.not_measured_statement, 'All three layers were measured in isolation.');
  assert.equal(c.p_solve.value, 0.5);
});

test('a card carries the refusal, it does not omit it', () => {
  const c = card([observe({ layer: 'L', correct: 0, attempted: 2 })]);
  const refused = c.refused_claims.map(r => r.claim);
  assert.ok(refused.includes(CLAIMS.MATH_DEFICIT));
  assert.ok(refused.includes(CLAIMS.PROCEDURE_DEFICIT));
  const permitted = c.permitted_claims.map(r => r.claim);
  assert.ok(permitted.includes(CLAIMS.CANNOT_SOLVE_AS_PRESENTED));
});

test('an undetermined P_solve is shown as bounds, never as a number', () => {
  const c = card([
    observe({ layer: 'L', correct: 1, attempted: 2 }),
    observe({ layer: 'S', correct: 2, attempted: 2 })
  ]);
  assert.equal(c.p_solve.value, null);
  assert.equal(c.p_solve.determined, false);
  assert.match(c.p_solve.shown_as, /between 0 and 0\.5/);
  assert.equal(cardIntegrity(c).ok, true);
});

test('the child\'s own words are preserved, not summarised', () => {
  const words = 'Odell has six because the nine was his one, not Ruth\'s.';
  const c = card([observe({ layer: 'L', correct: 2, attempted: 2 })], words);
  assert.equal(c.explain_back.child_words, words);
  assert.equal(c.explain_back.present, true);
  assert.match(c.explain_back.rule, /Preserved as said/);
});

test('a correction supersedes; it does not overwrite', () => {
  const first = card([observe({ layer: 'L', correct: 0, attempted: 2 })], 'I did not get it');
  const second = superseding(first, { explain_back: { child_words: 'later note', present: true, rule: first.explain_back.rule } });
  assert.equal(second.supersedes, first.id);
  assert.equal(second.version, 2);
  assert.equal(first.explain_back.child_words, 'I did not get it', 'the original was mutated');
});

test('card integrity refuses a card that claims mathematics it never measured', () => {
  const c = card([observe({ layer: 'L', correct: 0, attempted: 2 })]);
  const forged = { ...c, permitted_claims: [{ claim: CLAIMS.MATH_DEFICIT, because: 'a feeling' }] };
  const result = cardIntegrity(forged);
  assert.equal(result.ok, false);
  assert.ok(result.problems.some(p => /without an isolated measurement of the relationship/i.test(p)));
});

test('card integrity refuses a card missing its not-measured field', () => {
  const c = card([observe({ layer: 'L', correct: 1, attempted: 2 })]);
  const stripped = { ...c, not_measured: undefined, not_measured_statement: '' };
  assert.equal(cardIntegrity(stripped).ok, false);
});

test('a card needs a learner reference and the example it was taken on', () => {
  assert.throws(() => buildUnderstandingCard({ example, observations: [] }), /learner reference/);
  assert.throws(() => buildUnderstandingCard({ learner_ref: 'x', observations: [] }), /the example it was taken on/);
});

// --- the family reading ----------------------------------------------------

test('the family reading refuses to speak about the unmeasured layer', () => {
  const lines = familyReading(card([observe({ layer: 'L', correct: 0, attempted: 2 })]));
  const text = lines.join(' ');
  assert.match(text, /sentence was the thing in the way/i);
  assert.match(text, /not going to tell you anything about it/i);
});

test('the family reading reports the mathematics when it was actually measured', () => {
  const lines = familyReading(card([
    observe({ layer: 'L', correct: 0, attempted: 2 }),
    observe({ layer: 'M', correct: 2, attempted: 2 })
  ]));
  assert.match(lines.join(' '), /the mathematics was there/i);
});

test('the card rules name their own required fields', () => {
  for (const field of CARD_RULES.required_fields) {
    const c = card([observe({ layer: 'L', correct: 1, attempted: 2 })]);
    assert.ok(field in c, `a card is missing the required field ${field}`);
  }
});
