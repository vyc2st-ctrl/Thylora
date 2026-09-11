// RAE LINK · rights, channel truth and family safeguard tests
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateRightsGate, validateChannelTruth, validateConsent, validatePartnership }
  from '../rae-link/lib/rights.js';

test('an owned original passes the rights gate on its own', () => {
  assert.equal(evaluateRightsGate({ ownership_basis: 'OWNED_ORIGINAL' }).gate_state, 'PASSED');
});

test('an unresolved or missing basis never passes', () => {
  assert.equal(evaluateRightsGate({ ownership_basis: 'UNRESOLVED' }).gate_state, 'FAILED');
  assert.equal(evaluateRightsGate({}).gate_state, 'FAILED');
});

test('authorized use must name the rights holder', () => {
  const missing = evaluateRightsGate({ ownership_basis: 'AUTHORIZED_BY_RIGHTS_HOLDER' });
  assert.ok(missing.problems.some(p => p.code === 'HOLDER_MISSING'));
  assert.equal(evaluateRightsGate({
    ownership_basis: 'AUTHORIZED_BY_RIGHTS_HOLDER', rights_holder_name: 'W. T. Peete estate'
  }).gate_state, 'PASSED');
});

test('a licence needs both a holder and a reference', () => {
  const result = evaluateRightsGate({ ownership_basis: 'LICENSED', rights_holder_name: 'Archive Ltd' });
  assert.ok(result.problems.some(p => p.code === 'LICENCE_REF_MISSING'));
});

test('family consent basis requires the attached consent record', () => {
  const result = evaluateRightsGate(
    { ownership_basis: 'FAMILY_CONSENT', rights_holder_name: 'The family' }, {});
  assert.ok(result.problems.some(p => p.code === 'CONSENT_MISSING'));
});

test('an Earth channel cannot claim world production rights', () => {
  const result = evaluateRightsGate(
    { ownership_basis: 'WORLD_PRODUCTION' }, { channel: { world_status: 'EARTH_REAL' } });
  assert.ok(result.problems.some(p => p.code === 'WORLD_BASIS_ON_EARTH_CHANNEL'));
});

test('a world channel must be simulated and must disclose it', () => {
  const undisclosed = validateChannelTruth({
    channel_class: 'EDEREARIAH_INHABITANT', world_status: 'WORLD_SIMULATED', simulated_disclosure: ''
  });
  assert.equal(undisclosed.valid, false);
  assert.ok(undisclosed.problems.some(p => p.code === 'DISCLOSURE_MISSING'));

  const mislabelled = validateChannelTruth({
    channel_class: 'EDEREARIAH_INHABITANT', world_status: 'EARTH_REAL',
    simulated_disclosure: 'Simulated world media from EdereAriah.'
  });
  assert.ok(mislabelled.problems.some(p => p.code === 'WORLD_STATUS_MISMATCH'));

  const correct = validateChannelTruth({
    channel_class: 'WORLD_CHANNEL', world_status: 'WORLD_SIMULATED',
    simulated_disclosure: 'Simulated world media. Not an Earth person.'
  });
  assert.equal(correct.valid, true);
});

test('an Earth channel must not wear a simulated-media disclosure', () => {
  const result = validateChannelTruth({
    channel_class: 'EARTH_PERSON', world_status: 'EARTH_REAL',
    simulated_disclosure: 'Simulated world media.'
  });
  assert.ok(result.problems.some(p => p.code === 'DISCLOSURE_ON_EARTH_CHANNEL'));
});

test('a child participant requires guardian authority', () => {
  const withoutGuardian = validateConsent({
    subject_kind: 'MINOR', storytelling_mode: 'PRIVATE', medical_details_collected: false
  });
  assert.ok(withoutGuardian.problems.some(p => p.code === 'GUARDIAN_REQUIRED'));

  const withGuardian = validateConsent({
    subject_kind: 'MINOR', guardian_user_id: 'u-guardian',
    storytelling_mode: 'PRIVATE', medical_details_collected: false
  });
  assert.equal(withGuardian.valid, true);
});

test('medical detail and identity documents are refused, not merely discouraged', () => {
  const flagged = validateConsent({
    subject_kind: 'ADULT', storytelling_mode: 'PUBLIC', medical_details_collected: true
  });
  assert.ok(flagged.problems.some(p => p.code === 'MEDICAL_DETAIL_REFUSED'));

  for (const field of ['diagnosis', 'treatment', 'ssn', 'bank_account']) {
    const result = validateConsent({
      subject_kind: 'ADULT', storytelling_mode: 'PUBLIC',
      medical_details_collected: false, [field]: 'anything'
    });
    assert.ok(result.problems.some(p => p.code === 'FORBIDDEN_FIELD'), `${field} should be refused`);
  }
});

test('a family may choose any storytelling mode, and a withdrawn consent stops use', () => {
  for (const mode of ['PRIVATE', 'PSEUDONYMOUS', 'LIMITED', 'PUBLIC']) {
    const result = validateConsent({
      subject_kind: 'FAMILY', storytelling_mode: mode, medical_details_collected: false
    });
    assert.equal(result.valid, true, `${mode} must be allowed`);
  }
  const revoked = validateConsent({
    subject_kind: 'FAMILY', storytelling_mode: 'PUBLIC',
    medical_details_collected: false, revoked_at: '2026-08-01T00:00:00Z'
  });
  assert.ok(revoked.problems.some(p => p.code === 'CONSENT_REVOKED'));
});

test('a partnership needs a named beneficiary, a declared share and a stated purpose', () => {
  const consent = { subject_kind: 'FAMILY', storytelling_mode: 'LIMITED', medical_details_collected: false };
  const incomplete = validatePartnership({ beneficiary_share_bp: 0 }, consent);
  const codes = incomplete.problems.map(p => p.code);
  assert.ok(codes.includes('SHARE_UNDECLARED'));
  assert.ok(codes.includes('BENEFICIARY_UNNAMED'));
  assert.ok(codes.includes('PURPOSE_MISSING'));

  const complete = validatePartnership({
    beneficiary_share_bp: 5000, beneficiary_ref: 'Named family fund',
    purpose_statement: 'Help with the costs the family named.',
    declared_at: '2026-09-01T00:00:00Z'
  }, consent);
  assert.equal(complete.valid, true);
});

test('a share declared after publication is refused', () => {
  const result = validatePartnership({
    beneficiary_share_bp: 5000, beneficiary_ref: 'Fund',
    purpose_statement: 'Stated purpose.',
    declared_at: '2026-09-10T00:00:00Z', published_at: '2026-09-01T00:00:00Z'
  }, { subject_kind: 'FAMILY', storytelling_mode: 'PUBLIC', medical_details_collected: false });
  assert.ok(result.problems.some(p => p.code === 'SHARE_DECLARED_LATE'));
});
