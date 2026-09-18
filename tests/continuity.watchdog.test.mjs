// THY-CONTINUITY-WATCHDOG-001 · pre-task and post-task comparison.
//
//   D = max_i | F_i(current) - F_i(controlling) |
//   unauthorized D > 0  =>  HOLD + ALERT
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { postTask, preTask } from '../spine/continuity/watchdog.mjs';
import { extendField } from '../spine/continuity/fields.mjs';

const NOW = '2026-09-18T12:00:00.000Z';
const LONG_AGO = '2025-06-01T12:00:00.000Z';   // 474 days before NOW
const RECENT = '2026-09-08T12:00:00.000Z';     // 10 days before NOW

const fact = (subject_ref, field_key, value, over = {}) => ({
  subject_kind: over.subject_kind ?? 'PERSON',
  subject_ref,
  field_key,
  value,
  sequence_no: over.sequence_no ?? 469,
  recorded_at: 'recorded_at' in over ? over.recorded_at : RECENT,
  authority_ref: over.authority_ref ?? null,
  superseded_by: over.superseded_by ?? null
});

const AUTH = ['CHAIR-2026-09-18'];

const PERSON = [
  fact('P-001', 'names', 'Ada Vyc2st'),
  fact('P-001', 'ages', 34, { recorded_at: LONG_AGO }),
  fact('P-001', 'identity', 'THY-ID-0001'),
  fact('P-001', 'family_relationships', ['mother: Rae', 'sister: Nia']),
  fact('P-001', 'vyc2st_mark', 'VYC2ST//469'),
  fact('P-001', 'barrier', 'SEALED'),
  fact('P-001', 'person_state', 'ACTIVE')
];

/** Run a task end to end and hand back the POST check. */
function run(facts, produced, { task = {}, supersessions = [], authorities = AUTH } = {}) {
  const brief = preTask(
    { task_ref: 'T-1', sequence_no: 470, now: NOW, ...task },
    { facts, supersessions, authorities }
  );
  return { brief, check: postTask(brief, produced, { now: NOW }) };
}

const classOf = (check, field, subject = 'P-001') =>
  check.findings.find(f => f.field_key === field && f.subject_ref === subject)?.classification;

// --- PRE -------------------------------------------------------------------

test('PRE compiles only the controlling facts relevant to the task', () => {
  const facts = [...PERSON, fact('P-002', 'names', 'Other Person')];
  const brief = preTask(
    { task_ref: 'T-SCOPE', subjects: ['P-001'], fields: ['names', 'identity'], now: NOW },
    { facts, authorities: AUTH }
  );
  assert.deepEqual(brief.entries.map(e => e.field_key).sort(), ['identity', 'names']);
  assert.equal(brief.entries.every(e => e.subject_ref === 'P-001'), true);
  assert.equal(brief.proceed_allowed, true);
});

test('PRE reads superseded history but never treats it as controlling', () => {
  const facts = [
    fact('P-001', 'names', 'Ada Vycst', { sequence_no: 400, superseded_by: 2 }),
    fact('P-001', 'names', 'Ada Vyc2st', { sequence_no: 469 })
  ];
  const brief = preTask({ task_ref: 'T-HIST', now: NOW }, { facts });
  assert.equal(brief.entries.length, 1);
  assert.equal(brief.entries[0].value, 'Ada Vyc2st');
  assert.equal(brief.proceed_allowed, true);
});

test('PRE holds when the controlling set contradicts itself, before any work runs', () => {
  const facts = [
    fact('P-001', 'barrier', 'SEALED', { sequence_no: 469 }),
    fact('P-001', 'barrier', 'OPEN', { sequence_no: 470 })
  ];
  const brief = preTask({ task_ref: 'T-CONFLICT', sequence_no: 470, now: NOW }, { facts });
  assert.equal(brief.proceed_allowed, false);
  assert.equal(brief.D, 1);
  assert.equal(brief.conflicts.length, 1);
  assert.equal(brief.alert.severity, 'HOLD');
  assert.equal(brief.alert.phase, 'PRE');
});

test('a compiled brief is sealed: the same facts always digest the same, different facts do not', () => {
  const a = preTask({ task_ref: 'T-D', now: NOW }, { facts: PERSON });
  const b = preTask({ task_ref: 'T-D', now: '2026-09-19T00:00:00.000Z' }, { facts: [...PERSON].reverse() });
  assert.equal(a.brief_digest, b.brief_digest);
  const c = preTask({ task_ref: 'T-D', now: NOW }, {
    facts: PERSON.map(f => f.field_key === 'names' ? { ...f, value: 'Ada Vycst' } : f)
  });
  assert.notEqual(a.brief_digest, c.brief_digest);
});

// --- POST · the six classifications ----------------------------------------

test('UNCHANGED · formatting is not drift', () => {
  const { check } = run(PERSON, {
    'P-001': {
      names: '  ADA   Vyc2st ', ages: '34', identity: 'thy-id-0001',
      family_relationships: ['sister: Nia', 'mother: Rae'],
      vyc2st_mark: 'VYC2ST//469', barrier: 'Sealed', person_state: 'ACTIVE'
    }
  });
  assert.equal(check.D, 0);
  assert.equal(check.proceed_allowed, true);
  assert.equal(check.alert, null);
  assert.equal(check.findings.every(f => f.classification === 'UNCHANGED'), true);
});

test('DRIFTED · one letter in a name holds the whole task', () => {
  const { check } = run(PERSON, { 'P-001': { names: 'Ada Vycst' } });
  assert.equal(classOf(check, 'names'), 'DRIFTED');
  assert.equal(check.D, 1);
  assert.equal(check.proceed_allowed, false);
  assert.equal(check.alert.severity, 'HOLD');
});

test('MISSING · a produced subject that drops a watched field', () => {
  const { check } = run(PERSON, { 'P-001': { names: 'Ada Vyc2st' } });
  assert.equal(classOf(check, 'names'), 'UNCHANGED');
  assert.equal(classOf(check, 'identity'), 'MISSING');
  assert.equal(check.proceed_allowed, false);
});

test('MISSING · a subject the task never touched is not treated as loss', () => {
  const { check } = run(PERSON, { 'P-999': { names: 'Someone Else' } });
  assert.equal(check.findings.every(f => f.classification === 'UNCHANGED'), true);
  assert.equal(check.proceed_allowed, true);
});

test('ADVANCED · an age moves forward no further than elapsed time allows', () => {
  const ok = run(PERSON, { 'P-001': { ages: 35 } }).check;
  assert.equal(classOf(ok, 'ages'), 'ADVANCED');
  assert.equal(ok.findings.find(f => f.field_key === 'ages').d, 0);

  const far = run(PERSON, { 'P-001': { ages: 41 } }).check;
  assert.equal(classOf(far, 'ages'), 'DRIFTED');
  assert.equal(far.findings.find(f => f.field_key === 'ages').magnitude, 7);

  const back = run(PERSON, { 'P-001': { ages: 33 } }).check;
  assert.equal(classOf(back, 'ages'), 'DRIFTED');
});

test('ADVANCED · an age with no recorded time basis cannot advance', () => {
  const facts = [fact('P-001', 'ages', 34, { recorded_at: null })];
  const { check } = run(facts, { 'P-001': { ages: 35 } });
  assert.equal(classOf(check, 'ages'), 'DRIFTED');
  assert.match(check.findings[0].detail, /no recorded time basis/);
});

test('EXPLICITLY_SUPERSEDED · an authorized change is never called drift', () => {
  const supersessions = [{
    subject_ref: 'P-001', field_key: 'names',
    from_value: 'Ada Vyc2st', to_value: 'Ada Vyc2st-Rae',
    authority_ref: 'CHAIR-2026-09-18', approved_at: '2026-09-17T00:00:00.000Z',
    reason: 'Recorded name change'
  }];
  const { check } = run(PERSON, { 'P-001': { names: 'Ada Vyc2st-Rae' } }, { supersessions });
  assert.equal(classOf(check, 'names'), 'EXPLICITLY_SUPERSEDED');
  assert.equal(check.findings.find(f => f.field_key === 'names').d, 0);
});

test('CONFLICTING · a supersession pointing somewhere other than the produced value', () => {
  const supersessions = [{
    subject_ref: 'P-001', field_key: 'names',
    from_value: 'Ada Vyc2st', to_value: 'Ada Vyc2st-Rae',
    authority_ref: 'CHAIR-2026-09-18', approved_at: '2026-09-17T00:00:00.000Z',
    reason: 'Recorded name change'
  }];
  const { check } = run(PERSON, { 'P-001': { names: 'Ada Somebody' } }, { supersessions });
  assert.equal(classOf(check, 'names'), 'CONFLICTING');
  assert.equal(check.proceed_allowed, false);
});

test('CONFLICTING · a supersession recording a prior value that never stood', () => {
  const supersessions = [{
    subject_ref: 'P-001', field_key: 'names',
    from_value: 'Someone Entirely Other', to_value: 'Ada Vyc2st-Rae',
    authority_ref: 'CHAIR-2026-09-18', approved_at: '2026-09-17T00:00:00.000Z', reason: 'x'
  }];
  const { check } = run(PERSON, { 'P-001': { names: 'Ada Vyc2st-Rae' } }, { supersessions });
  assert.equal(classOf(check, 'names'), 'CONFLICTING');
});

test('an unapproved supersession authorizes nothing', () => {
  const supersessions = [{
    subject_ref: 'P-001', field_key: 'names',
    from_value: 'Ada Vyc2st', to_value: 'Ada Vyc2st-Rae',
    authority_ref: 'CHAIR-2026-09-18', approved_at: null, reason: 'not approved yet'
  }];
  const { check } = run(PERSON, { 'P-001': { names: 'Ada Vyc2st-Rae' } }, { supersessions });
  assert.equal(classOf(check, 'names'), 'DRIFTED');
});

// --- Authority -------------------------------------------------------------

test('a ladder advances only on an authority the controlling side knows', () => {
  const facts = [fact('PR-001', 'publication_state', 'REVIEW', { subject_kind: 'PRODUCT' })];

  const bare = run(facts, { 'PR-001': { publication_state: 'PUBLISHED' } }).check;
  assert.equal(classOf(bare, 'publication_state', 'PR-001'), 'DRIFTED');

  const unknown = run(facts, {
    'PR-001': { publication_state: { value: 'PUBLISHED', authority_ref: 'SELF-DECLARED' } }
  }).check;
  assert.equal(classOf(unknown, 'publication_state', 'PR-001'), 'DRIFTED');

  const good = run(facts, {
    'PR-001': { publication_state: { value: 'PUBLISHED', authority_ref: 'CHAIR-2026-09-18' } }
  }).check;
  assert.equal(classOf(good, 'publication_state', 'PR-001'), 'ADVANCED');
  assert.equal(good.proceed_allowed, true);
});

test('an authority reference cannot be verified when no registry was compiled', () => {
  const facts = [fact('PR-001', 'price', 4900, { subject_kind: 'PRODUCT' })];
  const brief = preTask({ task_ref: 'T-NOREG', now: NOW }, { facts });   // no authorities
  const check = postTask(brief, {
    'PR-001': { price: { value: 3900, authority_ref: 'CHAIR-2026-09-18' } }
  }, { now: NOW });
  assert.equal(classOf(check, 'price', 'PR-001'), 'DRIFTED');
  assert.match(check.findings[0].detail, /no authority registry was compiled/);
});

test('a ladder never runs backward, authority or not', () => {
  const facts = [fact('PR-001', 'publication_state', 'PUBLISHED', { subject_kind: 'PRODUCT' })];
  const { check } = run(facts, {
    'PR-001': { publication_state: { value: 'DRAFT', authority_ref: 'CHAIR-2026-09-18' } }
  });
  assert.equal(classOf(check, 'publication_state', 'PR-001'), 'DRIFTED');
  assert.match(check.findings[0].detail, /Ladder reversed/);
});

test('a value that is not on the ladder at all is drift, not an advance', () => {
  const facts = [fact('PR-001', 'store_state', 'DRAFT', { subject_kind: 'PRODUCT' })];
  const { check } = run(facts, {
    'PR-001': { store_state: { value: 'SOLD_OUT', authority_ref: 'CHAIR-2026-09-18' } }
  });
  assert.equal(classOf(check, 'store_state', 'PR-001'), 'DRIFTED');
  assert.match(check.findings[0].detail, /not on the declared ladder/);
});

// --- Sets, numbers and the distance itself ---------------------------------

test('a member dropped from an immutable set is MISSING, a member added is DRIFTED', () => {
  const dropped = run(PERSON, {
    'P-001': { family_relationships: ['mother: Rae'] }
  }).check;
  assert.equal(classOf(dropped, 'family_relationships'), 'MISSING');

  const added = run(PERSON, {
    'P-001': { family_relationships: ['mother: Rae', 'sister: Nia', 'brother: Nobody'] }
  }).check;
  assert.equal(classOf(added, 'family_relationships'), 'DRIFTED');
});

test('geometry is exact: a fractional difference is drift', () => {
  const facts = [fact('W-001', 'geometry', 12.5, { subject_kind: 'WORLD' })];
  const { check } = run(facts, { 'W-001': { geometry: 12.51 } });
  assert.equal(classOf(check, 'geometry', 'W-001'), 'DRIFTED');
  assert.ok(Math.abs(check.findings[0].magnitude - 0.01) < 1e-9);
});

test('a coordinate is compared as a tuple, not subtracted', () => {
  const facts = [fact('W-001', 'world_coordinates', '48.8566,2.3522', { subject_kind: 'WORLD' })];
  const same = run(facts, { 'W-001': { world_coordinates: '  48.8566,2.3522  ' } }).check;
  assert.equal(classOf(same, 'world_coordinates', 'W-001'), 'UNCHANGED');
  const moved = run(facts, { 'W-001': { world_coordinates: '48.8566,2.3523' } }).check;
  assert.equal(classOf(moved, 'world_coordinates', 'W-001'), 'DRIFTED');
});

test('a numeric field carrying an unparseable value is compared by text, not called drift', () => {
  const facts = [fact('W-001', 'dimensions', '1080x1920', { subject_kind: 'WORLD' })];
  const same = run(facts, { 'W-001': { dimensions: '1080X1920' } }).check;
  assert.equal(classOf(same, 'dimensions', 'W-001'), 'UNCHANGED');
  const moved = run(facts, { 'W-001': { dimensions: '1080x1080' } }).check;
  assert.equal(classOf(moved, 'dimensions', 'W-001'), 'DRIFTED');
});

test('magnitude is reported but never softens the verdict', () => {
  const facts = [fact('PR-001', 'price', 4900, { subject_kind: 'PRODUCT' })];
  const cent = run(facts, { 'PR-001': { price: 4901 } }).check;
  const lot = run(facts, { 'PR-001': { price: 100 } }).check;
  assert.equal(cent.findings[0].magnitude, 1);
  assert.equal(lot.findings[0].magnitude, 4800);
  assert.equal(cent.D, lot.D);
  assert.equal(cent.proceed_allowed, false);
  assert.equal(lot.proceed_allowed, false);
});

test('D is the maximum over fields, so one breach among many is still a hold', () => {
  const { check } = run(PERSON, {
    'P-001': {
      names: 'Ada Vyc2st', ages: 34, identity: 'THY-ID-0001',
      family_relationships: ['mother: Rae', 'sister: Nia'],
      vyc2st_mark: 'VYC2ST//470', barrier: 'SEALED', person_state: 'ACTIVE'
    }
  });
  assert.equal(check.field_count, 7);
  assert.equal(check.findings.filter(f => f.d === 0).length, 6);
  assert.equal(check.D, 1);
  assert.equal(check.proceed_allowed, false);
  assert.equal(check.hard_breach_count, 1);
});

test('a soft-watch extension alerts without holding', () => {
  const spec = extendField({ key: 'render_seed', label: 'Render seed', kind: 'SCALAR', rule: 'IMMUTABLE' });
  const facts = [fact('W-001', 'render_seed', 'seed-a', { subject_kind: 'WORLD' })];
  const brief = preTask({ task_ref: 'T-SOFT', now: NOW },
    { facts, authorities: AUTH, extraFields: { render_seed: spec } });
  const check = postTask(brief, { 'W-001': { render_seed: 'seed-b' } }, { now: NOW });
  assert.equal(check.findings[0].classification, 'DRIFTED');
  assert.equal(check.D, 1);
  assert.equal(check.hard_breach_count, 0);
  assert.equal(check.soft_breach_count, 1);
  assert.equal(check.proceed_allowed, true);
  assert.equal(check.alert.severity, 'WARN');
});

test('the produced state may be given flat, nested or as rows', () => {
  const facts = [fact('P-001', 'names', 'Ada Vyc2st')];
  const nested = postTask(preTask({ task_ref: 'T', now: NOW }, { facts }),
    { 'P-001': { names: 'Ada Vyc2st' } }, { now: NOW });
  const flat = postTask(preTask({ task_ref: 'T', now: NOW }, { facts }),
    { names: 'Ada Vyc2st' }, { now: NOW });
  const rows = postTask(preTask({ task_ref: 'T', now: NOW }, { facts }),
    [{ subject_ref: 'P-001', field_key: 'names', value: 'Ada Vyc2st' }], { now: NOW });
  const explicit = postTask(preTask({ task_ref: 'T', now: NOW }, { facts }),
    { subjects: { 'P-001': { names: 'Ada Vyc2st' } } }, { now: NOW });
  for (const check of [nested, flat, rows, explicit]) {
    assert.equal(check.findings[0].classification, 'UNCHANGED', JSON.stringify(check.findings[0]));
  }
});

test('POST refuses to run without a compiled brief', () => {
  assert.throws(() => postTask({}, {}), /BRIEF_REQUIRED/);
  assert.throws(() => preTask({}, { facts: PERSON }), /TASK_REF_REQUIRED/);
});
