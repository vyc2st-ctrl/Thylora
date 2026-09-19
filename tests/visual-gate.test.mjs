// THYLORA · visual quality gate tests
// Work code: THY-WORK-VISUAL-STANDARD-RECOVERY-545
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateProductVisualGate, evaluatePage, evaluateAuthorship, classifyByline,
  previewPipelineStep, FAIL_CONDITIONS, GATE_STATES
} from '../visual-gate/lib/visual-gate.js';
import {
  RECOVERED_EXEMPLARS, VISUAL_RULES, PAGE_QUESTIONS, AUTHORSHIP_ROLES,
  NAMEGUARD_CONFLICT, WORLD_NAME_VARIANTS
} from '../visual-gate/lib/visual-standard.js';
import {
  checkBrambleAgainstStandard, brambleToPreview, BRAMBLE_ERA_LOCK, BRAMBLE_AUTHORSHIP_OPEN
} from '../visual-gate/lib/bramble-binding.js';

// ---------------------------------------------------------------- recovery ---

test('every recovered exemplar carries an id, a date, a source and a disposition', () => {
  assert.ok(RECOVERED_EXEMPLARS.length >= 6);
  for (const e of RECOVERED_EXEMPLARS) {
    assert.match(e.asset_id, /^THY-VIS-/);
    assert.match(e.record_date, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(e.source.includes('vyc2st-ctrl/'), `${e.asset_id} names no repository`);
    assert.ok(e.why_it_passed.length > 40);
    assert.ok(e.rules_demonstrated.length > 0);
    assert.ok(['CURRENT', 'SUPERSEDED', 'CURRENT_BUT_UNENFORCED'].includes(e.state));
  }
});

test('the superseded Build 6 gradient blocks stay listed so they cannot return as new', () => {
  const s = RECOVERED_EXEMPLARS.find(e => e.state === 'SUPERSEDED');
  assert.equal(s.asset_id, 'THY-VIS-SUPERSEDED-001');
  assert.ok(s.source.includes('styles.css'));
});

test('every visual rule cites the record it was recovered from', () => {
  assert.equal(VISUAL_RULES.length, 17);
  for (const r of VISUAL_RULES) {
    assert.ok(r.origin.startsWith('THY-VIS-') || r.origin === 'GAP', `${r.code} has no origin`);
  }
});

test('no rule was invented — there is no GAP-origin rule in this recovery', () => {
  assert.equal(VISUAL_RULES.filter(r => r.origin === 'GAP').length, 0);
});

test('the EdereAriah name conflict is reported open, not silently normalised', () => {
  assert.equal(NAMEGUARD_CONFLICT.state, 'OPEN');
  assert.equal(WORLD_NAME_VARIANTS.length, 2);
});

// --------------------------------------------------------------- fail-closed -

test('an empty product fails rather than passing by absence of evidence', () => {
  const r = evaluateProductVisualGate({});
  assert.equal(r.gate_state, GATE_STATES.FAIL);
  assert.equal(r.ready_for_chairman_preview, false);
  assert.ok(r.problems.length > 0);
});

test('the gate reports every failing condition in one call', () => {
  const r = evaluateProductVisualGate({});
  const codes = new Set(r.problems.map(p => p.code));
  for (const expected of ['NO_PAGE_ARCHITECTURE', 'NO_AUTHOR_IDENTITY', 'NO_ART_IDENTITY',
                          'NO_WORLD_SPECIFIC_DETAIL', 'VISUAL_STORY_MISMATCH']) {
    assert.ok(codes.has(expected), `missing ${expected}`);
  }
});

test('every problem names a route to repair it', () => {
  const r = evaluateProductVisualGate({});
  for (const p of r.problems) assert.ok(p.route && p.route.length > 0, `${p.code} has no route`);
});

test('all fifteen Chairman FAIL conditions exist as codes', () => {
  assert.equal(FAIL_CONDITIONS.length, 15);
});

// -------------------------------------------------------------- page standard

test('a page must resolve all eleven questions', () => {
  const r = evaluatePage({ page_label: 'p1' });
  assert.equal(r.gate_state, GATE_STATES.FAIL);
  assert.equal(r.problems.filter(p => p.code.startsWith('PAGE_UNRESOLVED_')).length,
               PAGE_QUESTIONS.length);
});

test('a fully resolved page passes', () => {
  const page = { page_label: 'p1' };
  PAGE_QUESTIONS.forEach(q => { page[q.key] = 'recorded'; });
  assert.equal(evaluatePage(page).gate_state, GATE_STATES.PASS);
});

test('a dominantly white page fails without a documented justified exception', () => {
  const page = { page_label: 'p1', white_page_dominant: true };
  PAGE_QUESTIONS.forEach(q => { page[q.key] = 'recorded'; });
  assert.ok(evaluatePage(page).problems.some(p => p.code === 'WHITE_PAGE_DOMINATES'));

  page.artistic_exception = 'Silent breath page between acts';
  assert.ok(evaluatePage(page).problems.some(p => p.code === 'WHITE_PAGE_DOMINATES'),
    'an exception with no justification is not a justification');

  page.artistic_exception_justification = 'The turn from the attic to the street needs one empty beat.';
  assert.equal(evaluatePage(page).gate_state, GATE_STATES.PASS);
});

test('text as the main visual fails the page', () => {
  const page = { page_label: 'p1', illustration_area_ratio: 0.2 };
  PAGE_QUESTIONS.forEach(q => { page[q.key] = 'recorded'; });
  assert.ok(evaluatePage(page).problems.some(p => p.code === 'TEXT_IS_THE_MAIN_VISUAL'));
});

// ----------------------------------------------------------------- authorship

test('a generic system byline is not an authored identity', () => {
  for (const g of ['THYLORA', 'system-generated', 'AI', 'Claude', 'TBD', 'Unknown']) {
    assert.equal(classifyByline(g).generic, true, `${g} was accepted as an author`);
  }
  assert.equal(classifyByline('Kylee Jane Peete').resolved, true);
});

test('all six authored roles are required to be resolved or explicitly OPEN', () => {
  assert.equal(AUTHORSHIP_ROLES.length, 6);
  const r = evaluateAuthorship({});
  assert.equal(r.problems.length, 6);
});

test('an explicitly OPEN role is accepted as a declared gap, not a defect', () => {
  const all = {};
  AUTHORSHIP_ROLES.forEach(role => { all[role] = 'OPEN'; });
  const r = evaluateAuthorship(all);
  assert.equal(r.gate_state, GATE_STATES.PASS);
  assert.equal(r.open.length, 6);
  assert.equal(r.resolved.length, 0);
});

test('OPEN author and illustrator still block preview, reported as Chairman blockers', () => {
  const all = {};
  AUTHORSHIP_ROLES.forEach(role => { all[role] = 'OPEN'; });
  const r = evaluateProductVisualGate({ product_kind: 'ILLUSTRATED_STORY', authorship: all });
  const blockers = r.chairman_blockers.map(b => b.code);
  assert.deepEqual(blockers.sort(), ['NO_ART_IDENTITY', 'NO_AUTHOR_IDENTITY']);
  assert.equal(r.ready_for_chairman_preview, false);
});

test('the gate never fills an open role with an invented name', () => {
  const all = {};
  AUTHORSHIP_ROLES.forEach(role => { all[role] = 'OPEN'; });
  const r = evaluateProductVisualGate({ product_kind: 'ILLUSTRATED_STORY', authorship: all });
  assert.equal(r.authorship.resolved.length, 0);
});

// ---------------------------------------------------------- product failures -

function goodPage(overrides = {}) {
  const page = {
    illustration_area_ratio: 0.8, illustration_ref: 'REF-1',
    reference_binding: 'THY-VIS-EXEMPLAR-001', illustration_carries_information: true,
    world_continues_beyond_subject: true, composition_signature: 'wide-exterior-dusk'
  };
  PAGE_QUESTIONS.forEach(q => { page[q.key] = 'recorded'; });
  page.world_signature = 'The EdereAriah shorewall cart road';
  page.objects_present = 'A hand cart, a lantern';
  page.object_makers = 'Cart by the shorewall wheelwright; lantern from the foundry row';
  page.background_action = 'Two workers load the second cart behind him';
  page.text_region = 'lower left, over the stone';
  return { ...page, ...overrides };
}

function goodProduct(overrides = {}) {
  return {
    product_code: 'THY-TEST-001', product_kind: 'ILLUSTRATED_STORY',
    story_summary: 'A boy follows a cart to the shorewall.',
    visual_matches_story: true,
    authorship: { AUTHOR: 'W. T. Peete', EDITOR: 'OPEN', ILLUSTRATOR: 'R. Halvard',
                  DESIGNER: 'OPEN', PUBLISHER_IMPRINT: 'OPEN', PRODUCTION_HOUSE: 'OPEN' },
    pages: [goodPage(), goodPage({ composition_signature: 'close-interior-night' })],
    ...overrides
  };
}

test('a complete, evidenced product passes the gate', () => {
  const r = evaluateProductVisualGate(goodProduct());
  assert.equal(r.gate_state, GATE_STATES.PASS, JSON.stringify(r.problems, null, 1));
  assert.equal(r.ready_for_chairman_preview, true);
});

test('a repeated composition across every page fails', () => {
  const r = evaluateProductVisualGate(goodProduct({ pages: [goodPage(), goodPage()] }));
  assert.ok(r.problems.some(p => p.code === 'REPEATED_COMPOSITION'));
});

test('an illustration that carries no information the text does not is decoration', () => {
  const r = evaluateProductVisualGate(goodProduct({
    pages: [goodPage({ illustration_carries_information: false }),
            goodPage({ composition_signature: 'close-interior-night' })]
  }));
  assert.ok(r.problems.some(p => p.code === 'NO_MEANINGFUL_ILLUSTRATION'));
});

test('imagery generated with no reference binding fails as generic', () => {
  const r = evaluateProductVisualGate(goodProduct({ generated_without_reference: true }));
  assert.ok(r.problems.some(p => p.code === 'GENERIC_AI_ILLUSTRATION'));
});

test('a page with an illustration but no reference binding fails as generic', () => {
  const r = evaluateProductVisualGate(goodProduct({
    pages: [goodPage({ reference_binding: '' }),
            goodPage({ composition_signature: 'close-interior-night' })]
  }));
  assert.ok(r.problems.some(p => p.code === 'GENERIC_AI_ILLUSTRATION'));
});

test('objects present with no maker or supplier recorded fails', () => {
  const r = evaluateProductVisualGate(goodProduct({
    pages: [goodPage({ object_makers: '' }), goodPage({ object_makers: '', composition_signature: 'x' })]
  }));
  assert.ok(r.problems.some(p => p.code === 'NO_MAKER_SOURCE_DETAIL'));
});

test('no background life fails', () => {
  const r = evaluateProductVisualGate(goodProduct({
    pages: [goodPage({ background_action: '' }), goodPage({ background_action: '', composition_signature: 'x' })]
  }));
  assert.ok(r.problems.some(p => p.code === 'NO_BACKGROUND_LIFE'));
});

test('a world that stops at the subject fails', () => {
  const r = evaluateProductVisualGate(goodProduct({
    pages: [goodPage({ world_continues_beyond_subject: false }),
            goodPage({ world_continues_beyond_subject: false, composition_signature: 'x' })]
  }));
  assert.ok(r.problems.some(p => p.code === 'WORLD_STOPS_AT_SUBJECT'));
});

test('a price with no recorded value basis fails', () => {
  const r = evaluateProductVisualGate(goodProduct({ price_minor_units: 1900 }));
  assert.ok(r.problems.some(p => p.code === 'PRICE_VALUE_UNEXPLAINED'));
  const ok = evaluateProductVisualGate(goodProduct({
    price_minor_units: 1900, price_value_basis: '32 bound pages, original art, archival stock.' }));
  assert.equal(ok.gate_state, GATE_STATES.PASS);
});

test('a product that reads as a lesson handout fails', () => {
  const r = evaluateProductVisualGate(goodProduct({ reads_as_lesson_handout: true }));
  assert.ok(r.problems.some(p => p.code === 'READS_AS_LESSON_HANDOUT'));
});

test('mostly white near-textless pages are caught as a handout without being told', () => {
  const blank = goodPage({ white_page_dominant: true, illustration_area_ratio: 0.05 });
  const r = evaluateProductVisualGate(goodProduct({
    pages: [blank, goodPage({ ...blank, composition_signature: 'x' })] }));
  assert.ok(r.problems.some(p => p.code === 'READS_AS_LESSON_HANDOUT'));
});

test('a visual recorded as not matching the story fails', () => {
  const r = evaluateProductVisualGate(goodProduct({ visual_matches_story: false }));
  assert.ok(r.problems.some(p => p.code === 'VISUAL_STORY_MISMATCH'));
});

test('no world-specific detail fails', () => {
  const r = evaluateProductVisualGate(goodProduct({
    pages: [goodPage({ world_signature: 'a room' }), goodPage({ world_signature: 'a road', composition_signature: 'x' })]
  }));
  assert.ok(r.problems.some(p => p.code === 'NO_WORLD_SPECIFIC_DETAIL'));
});

// ------------------------------------------------------------------ pipeline -

test('a FAIL is returned for internal repair and never shown to the Chairman', () => {
  const step = previewPipelineStep({ state: 'DRAFT' }, {});
  assert.equal(step.to_state, 'FAIL');
  assert.equal(step.shown_to_chairman, false);
  assert.equal(step.returned_for_repair, true);
  assert.equal(step.repair_route, 'INTERNAL_REPAIR');
});

test('only a PASS advances to CHAIRMAN_PREVIEW', () => {
  const step = previewPipelineStep({ state: 'QUALITY_GATE' }, goodProduct());
  assert.equal(step.to_state, 'CHAIRMAN_PREVIEW');
  assert.equal(step.shown_to_chairman, true);
});

// ------------------------------------------------------------------- Bramble -

test('Bramble binds to the recovered gate rather than a standard of its own', () => {
  const r = checkBrambleAgainstStandard([]);
  assert.equal(r.bound_gate, 'THY-VISUAL-QUALITY-GATE-001');
  assert.equal(r.work_code, 'THY-WORK-BRAMBLE-PROOF-PRODUCT-544');
});

test('Bramble authorship is OPEN and no name is invented for it', () => {
  assert.equal(Object.values(BRAMBLE_AUTHORSHIP_OPEN).every(v => v === 'OPEN'), true);
  const r = checkBrambleAgainstStandard([]);
  assert.equal(r.authorship.resolved.length, 0);
});

test('an empty Bramble page plan cannot reach the Chairman', () => {
  const step = brambleToPreview([]);
  assert.equal(step.shown_to_chairman, false);
  assert.equal(step.returned_for_repair, true);
});

test('the Bramble era lock is the one already approved, not a new one', () => {
  assert.equal(BRAMBLE_ERA_LOCK.era, '1930s-1940s');
  assert.ok(BRAMBLE_ERA_LOCK.source.includes('af780f5'));
  assert.equal(BRAMBLE_ERA_LOCK.covered.length, 7);
});

test('a Bramble page that does not declare its era fails the era lock', () => {
  const r = checkBrambleAgainstStandard([goodPage()]);
  assert.ok(r.problems.some(p => p.code === 'ERA_NOT_DECLARED'));
});

test('a Bramble page outside the era with no approved exception breaches the lock', () => {
  const r = checkBrambleAgainstStandard([goodPage({ era_declared: '1980s' })]);
  assert.ok(r.problems.some(p => p.code === 'ERA_LOCK_BREACH'));
});

test('an approved exception is honoured rather than refused outright', () => {
  const r = checkBrambleAgainstStandard(
    [goodPage({ era_declared: '1980s', era_exception_approved: 'CHAIRMAN-EXC-001' })]);
  assert.ok(!r.problems.some(p => p.code === 'ERA_LOCK_BREACH'));
});
