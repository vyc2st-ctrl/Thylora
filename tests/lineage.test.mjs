// FAMILY LINEAGE · kinship and corrections, on an invented example family
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { applyCorrections, kinship, siblingKind, validateAccount, toSeedSql }
  from '../family-lineage/lib/lineage.js';

const account = JSON.parse(readFileSync(
  new URL('../family-lineage/fixtures/example-account.json', import.meta.url), 'utf8'));
const scene = account.testimonies.find(t => t.code === 'FL-T-EXAMPLE-01');

test('the example account is structurally sound', () => {
  assert.deepEqual(validateAccount(account), []);
});

test("grandfather's son by another mother derives as a paternal HALF uncle", () => {
  assert.equal(siblingKind(account, 'father', 'half-uncle'), 'HALF_SIBLING');
  assert.deepEqual(kinship(account, 'teller', 'half-uncle'),
    { relation: 'HALF_UNCLE_OR_AUNT', through: 'father', side: 'PATERNAL', blood: true });
});

test("children sharing only a recorded mother are not called full siblings", () => {
  assert.equal(siblingKind(account, 'cousin-1', 'cousin-2'), 'SIBLING_OTHER_PARENT_UNRECORDED');
});

test('an aunt is not placed on a side until the teller says how she is kin', () => {
  assert.equal(kinship(account, 'teller', 'aunt').relation, 'NOT_DERIVABLE_YET');
});

test('"you\'re out here" is cut from the PDF line, which now ends at "come on"', () => {
  const pdfLine = 'He said, "Come on, you\'re out here!"';
  assert.equal(applyCorrections(pdfLine, scene.corrections, 'PDF'), 'He said, "Come on!"');
  assert.equal(applyCorrections('Come on, your out here.', scene.corrections, 'PDF'), 'Come on.');
  assert.equal(applyCorrections('COME ON YOUR OUT HERE', scene.corrections, 'PDF'), 'COME ON');
});

test('the correction does not touch the verbatim testimony record', () => {
  assert.equal(applyCorrections('Come on your out here', scene.corrections, 'TESTIMONY'), 'Come on your out here');
});

test('a correction without a reason or target is rejected', () => {
  const bad = structuredClone(account);
  bad.testimonies[0].corrections.push({ type: 'REMOVE_PHRASE', target: '', reason: '' });
  const codes = validateAccount(bad).map(p => p.code);
  assert.ok(codes.includes('CORRECTION_TARGET_MISSING'));
  assert.ok(codes.includes('CORRECTION_REASON_MISSING'));
});

test('a person cannot have two recorded fathers', () => {
  const bad = structuredClone(account);
  bad.parentage.push({ child: 'half-uncle', parent: 'father', role: 'FATHER' });
  assert.ok(validateAccount(bad).some(p => p.code === 'TWO_PARENTS_SAME_ROLE'));
});

test('seed SQL is owner-parameterised and quotes apostrophes', () => {
  const sql = toSeedSql(account);
  assert.match(sql, /:'owner'/);
  assert.ok(sql.includes("that''s how we all communicate"));
  assert.ok(!/[0-9a-f]{8}-[0-9a-f]{4}-/.test(sql), 'no hard-coded user id');
});
