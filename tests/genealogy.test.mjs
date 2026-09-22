// GENEALOGY EVIDENCE JOURNEY · tests
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateIdentityMatch, evaluateAncestryOrCitizenshipClaim, livingStatus, researchPriority,
  validateCitation, acceptRelationship, validateSearchLogEntry, searchLogSummary,
  PRIVACY_HORIZON_YEARS, FORBIDDEN_INFERENCE_BASES
} from '../genealogy/evidence.js';
import { readFileSync } from 'node:fs';

const goodCitation = {
  repository: 'Tipton County Archives, Covington, Tennessee',
  collection: 'Death records 1925-1940',
  locator: 'vol 3, p 214, entry 77',
  evidence_class: 'ORIGINAL_RECORD',
  information_class: 'PRIMARY',
  directness: 'DIRECT',
  retrieved_at: '2026-09-22'
};

test('a surname alone is never an identification', () => {
  const r = evaluateIdentityMatch({ surname_match: true, anchors: [] });
  assert.equal(r.accepted, false);
  assert.ok(r.blockers.map((b) => b.code).includes('SURNAME_ONLY_MATCH'));
});

test('a surname plus one anchor is still a coincidence', () => {
  const r = evaluateIdentityMatch({ surname_match: true, anchors: ['COUNTY_OR_STATE'] });
  assert.equal(r.accepted, false);
});

test('a surname plus two anchors is an identification', () => {
  const r = evaluateIdentityMatch({ surname_match: true, anchors: ['COUNTY_OR_STATE', 'DATE_WINDOW'] });
  assert.equal(r.accepted, true);
});

test('an invented anchor is rejected rather than counted', () => {
  const r = evaluateIdentityMatch({ surname_match: true, anchors: ['FEELS_RIGHT', 'DATE_WINDOW'] });
  assert.equal(r.accepted, false);
  assert.ok(r.blockers.map((b) => b.code).includes('UNKNOWN_IDENTITY_ANCHOR'));
});

test('race or tribal citizenship cannot be inferred from surname or geography', () => {
  for (const basis of FORBIDDEN_INFERENCE_BASES) {
    const r = evaluateAncestryOrCitizenshipClaim({ claim_type: 'ANCESTRY', bases: [basis] });
    assert.equal(r.accepted, false, `${basis} must not be sufficient`);
    assert.ok(r.blockers.map((b) => b.code).includes('INFERENCE_FROM_SURNAME_OR_GEOGRAPHY'));
  }
  const both = evaluateAncestryOrCitizenshipClaim({ claim_type: 'ANCESTRY', bases: ['SURNAME', 'GEOGRAPHY'] });
  assert.equal(both.accepted, false, 'two forbidden bases do not add up to one good one');
});

test('tribal citizenship is the nation\'s determination, not this record\'s', () => {
  const r = evaluateAncestryOrCitizenshipClaim({
    claim_type: 'TRIBAL_CITIZENSHIP', bases: ['ENROLMENT_RECORD'], nation_determined: false
  });
  assert.equal(r.accepted, false);
  assert.ok(r.blockers.map((b) => b.code).includes('CITIZENSHIP_NOT_DETERMINED_BY_NATION'));
});

test('an ancestry claim resting on records is allowed through', () => {
  const r = evaluateAncestryOrCitizenshipClaim({ claim_type: 'ANCESTRY', bases: ['ENROLMENT_RECORD', 'CENSUS_HOUSEHOLD'] });
  assert.equal(r.accepted, true);
});

test('a documented death makes a person publishable; silence does not', () => {
  assert.equal(livingStatus({ death_year: 1968 }).publishable, true);
  assert.equal(livingStatus({ birth_year: 1890 }, 2026).state, 'PRESUMED_DECEASED');
  assert.equal(livingStatus({ birth_year: 1960 }, 2026).state, 'POSSIBLY_LIVING');
  assert.equal(livingStatus({ birth_year: 1960 }, 2026).publishable, false);
  assert.equal(livingStatus({}, 2026).state, 'POSSIBLY_LIVING');
});

test('the privacy horizon is the published one, and deceased people come first', () => {
  assert.equal(PRIVACY_HORIZON_YEARS, 100);
  assert.equal(researchPriority({ death_year: 1968 }, 2026), 'ACTIVE');
  assert.equal(researchPriority({ birth_year: 1975 }, 2026), 'DEFERRED');
});

test('a citation must carry repository, collection, locator, classes and a date', () => {
  assert.equal(validateCitation(goodCitation).valid, true);
  for (const field of ['repository', 'collection', 'locator', 'evidence_class', 'information_class', 'directness', 'retrieved_at']) {
    const broken = { ...goodCitation };
    delete broken[field];
    assert.equal(validateCitation(broken).valid, false, `missing ${field} must fail`);
  }
});

test('no relationship is accepted without a citation', () => {
  const r = acceptRelationship({ person_id: 'p1', related_person_id: 'p2', relationship_type: 'PARENT_OF', citations: [] });
  assert.equal(r.accepted, false);
  assert.equal(r.confidence, 'NOT_ACCEPTED');
  assert.ok(r.blockers.map((b) => b.code).includes('NO_CITATION'));
});

test('a user-submitted tree is not evidence on its own', () => {
  const r = acceptRelationship({
    person_id: 'p1', related_person_id: 'p2', relationship_type: 'PARENT_OF',
    citations: [{ ...goodCitation, evidence_class: 'USER_SUBMITTED_TREE' }]
  });
  assert.equal(r.accepted, false);
  assert.ok(r.blockers.map((b) => b.code).includes('TREE_ONLY_EVIDENCE'));
});

test('one direct original record accepts the relationship as SUPPORTED', () => {
  const r = acceptRelationship({
    person_id: 'p1', related_person_id: 'p2', relationship_type: 'PARENT_OF', citations: [goodCitation]
  });
  assert.equal(r.accepted, true);
  assert.equal(r.confidence, 'SUPPORTED');
});

test('two direct records accept it as ESTABLISHED', () => {
  const r = acceptRelationship({
    person_id: 'p1', related_person_id: 'p2', relationship_type: 'PARENT_OF',
    citations: [goodCitation, { ...goodCitation, collection: 'Marriage records 1920-1935', locator: 'vol 1, p 88' }]
  });
  assert.equal(r.confidence, 'ESTABLISHED');
});

test('indirect evidence needs two independent sources and written reasoning', () => {
  const indirect = { ...goodCitation, directness: 'INDIRECT' };
  const one = acceptRelationship({
    person_id: 'p1', related_person_id: 'p2', relationship_type: 'PARENT_OF', citations: [indirect]
  });
  assert.ok(one.blockers.map((b) => b.code).includes('INDIRECT_EVIDENCE_INSUFFICIENT'));

  const twoNoReasoning = acceptRelationship({
    person_id: 'p1', related_person_id: 'p2', relationship_type: 'PARENT_OF',
    citations: [indirect, { ...indirect, collection: 'Census 1930', locator: 'ED 79-12, sheet 4B' }]
  });
  assert.ok(twoNoReasoning.blockers.map((b) => b.code).includes('REASONING_NOT_WRITTEN'));

  const twoWithReasoning = acceptRelationship({
    person_id: 'p1', related_person_id: 'p2', relationship_type: 'PARENT_OF',
    citations: [indirect, { ...indirect, collection: 'Census 1930', locator: 'ED 79-12, sheet 4B' }],
    reasoning: 'The 1930 household places them together; the death record names the same informant at the same address.'
  });
  assert.equal(twoWithReasoning.accepted, true);
  assert.equal(twoWithReasoning.confidence, 'REASONED');
});

test('a recorded conflict blocks acceptance until it is resolved in writing', () => {
  const base = {
    person_id: 'p1', related_person_id: 'p2', relationship_type: 'PARENT_OF',
    citations: [goodCitation], conflicts: [{ note: 'Two different birth years.' }]
  };
  assert.equal(acceptRelationship(base).accepted, false);
  assert.equal(acceptRelationship({ ...base, conflict_resolution: 'The death certificate informant was the son; the census age was reported by a neighbour.' }).accepted, true);
});

test('a negative search must say what it covered', () => {
  const bare = { search_id: 'S1', searched_at: '2026-09-22', repository: 'X', query: 'Peete', result: 'NEGATIVE' };
  assert.equal(validateSearchLogEntry(bare).valid, false);
  assert.ok(validateSearchLogEntry(bare).blockers.map((b) => b.code).includes('NEGATIVE_WITHOUT_COVERAGE'));
  assert.equal(validateSearchLogEntry({ ...bare, coverage: 'Tipton County death index 1925-1940, all spelling variants.' }).valid, true);
});

test('an unreachable repository must name the obstacle', () => {
  const bare = { search_id: 'S2', searched_at: '2026-09-22', repository: 'FamilySearch', query: 'Peete', result: 'UNREACHABLE' };
  assert.equal(validateSearchLogEntry(bare).valid, false);
  assert.equal(validateSearchLogEntry({ ...bare, obstacle: 'Egress proxy returned 403 on CONNECT.' }).valid, true);
});

test('the committed search log validates against these rules, entry by entry', () => {
  const log = JSON.parse(readFileSync(new URL('../genealogy/search-log.json', import.meta.url), 'utf8'));
  assert.ok(log.entries.length > 0, 'the log must not be empty');
  for (const entry of log.entries) {
    const r = validateSearchLogEntry(entry);
    assert.equal(r.valid, true, `${entry.search_id}: ${r.blockers.map((b) => b.code).join(', ')}`);
  }
  const summary = searchLogSummary(log.entries);
  assert.equal(summary.total, log.entries.length);
  assert.equal(summary.HIT, 0, 'no verified hit was obtained this session - if that changes, update this test deliberately');
});

test('no relationship in the committed register is accepted without citations', () => {
  const register = JSON.parse(readFileSync(new URL('../genealogy/seeds.json', import.meta.url), 'utf8'));
  for (const person of register.seeds) {
    assert.ok(person.seed_id && person.name_as_given, 'every seed carries an id and the name as given');
    for (const rel of person.asserted_relationships ?? []) {
      const r = acceptRelationship(rel);
      assert.equal(r.accepted, false,
        `${person.seed_id} has an accepted relationship - nothing was verifiable this session`);
    }
  }
});
