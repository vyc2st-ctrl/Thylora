import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { checkReasoning, LADDER, EDUCATIONAL_LABEL } from '../spine/lib/civic.js';

const cur = JSON.parse(readFileSync(new URL('../spine/lanes/civic-curriculum-001.json', import.meta.url)));
const src = { canonical_id: 'SRC-1', world_layer: 'EARTH', jurisdiction: 'US-MD', title: 'T', issuing_authority: 'A', official_source_uri: 'https://example.gov/x', effective_from: '2020-01-01', evidence_status: 'VERIFIED_OFFICIAL_TEXT' };

test('ladder separates non-legal and legal rungs', () => {
  assert.deepEqual(LADDER.filter(l => l.legal).map(l => l.code), ['REASONABLE_SUSPICION', 'PROBABLE_CAUSE', 'LEGAL_AUTHORITY']);
});

test('curriculum exercises grade as expected', () => {
  const [e1, e2, e3] = cur.exercises;
  assert.equal(checkReasoning(e1.record).ok, true);
  assert.match(checkReasoning(e2.record).errors.join(), /interpretation/);
  const r3 = checkReasoning(e3.record).errors.join();
  assert.match(r3, /without jurisdiction/);
  assert.match(r3, /without as_of_date/);
  assert.match(r3, /sourced Earth law/);
});

test('legal standard passes only with matching jurisdiction and in-date source', () => {
  const rec = { ...cur.exercises[2].record, jurisdiction: 'US-MD', as_of_date: '2026-09-24', legal_sources: [src] };
  const ok = checkReasoning(rec);
  assert.equal(ok.ok, true);
  assert.notEqual(ok.label, EDUCATIONAL_LABEL);
  assert.match(checkReasoning({ ...rec, jurisdiction: 'US-VA' }).errors.join(), /is US-MD/);
  assert.match(checkReasoning({ ...rec, as_of_date: '2019-01-01' }).errors.join(), /not in effect/);
  assert.match(checkReasoning({ ...rec, legal_sources: [{ ...src, world_layer: 'EDEREAIRAH' }] }).errors.join(), /EARTH/);
});

test('unverified sources keep the educational-unverified label', () => {
  const rec = { ...cur.exercises[2].record, jurisdiction: 'US-MD', as_of_date: '2026-09-24', legal_sources: [{ ...src, evidence_status: 'RESEARCH_REQUIRED' }] };
  const r = checkReasoning(rec);
  assert.equal(r.label, EDUCATIONAL_LABEL);
  assert.equal(r.warnings.length, 1);
});

test('inference must cite real observations; escalation starts with safety', () => {
  const base = cur.exercises[0].record;
  assert.match(checkReasoning({ ...base, inferences: [{ claim: 'x', rests_on: [9] }] }).errors.join(), /missing observation/);
  assert.match(checkReasoning({ ...base, escalation_plan: ['DOCUMENT'] }).errors.join(), /STAY_SAFE_AND_CALM/);
});
