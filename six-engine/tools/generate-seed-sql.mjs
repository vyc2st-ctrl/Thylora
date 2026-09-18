// SIX UNDERSTANDING ENGINE · seed generator
// Workroom: WR-SIXENGINE-001
//
// The lexicon and the concept graph exist twice: as data the runtime reads
// (six-engine/lib/) and as rows the backend holds (db/six-engine/). Two copies
// drift. This generator makes the SQL FROM the runtime data, so they cannot.
//
//   node six-engine/tools/generate-seed-sql.mjs > db/six-engine/0009_seed_lexicon_and_concepts.sql
//
// tests/six-seed.test.mjs fails if the committed SQL no longer matches.

import { LEXICON } from '../lib/lexicon.js';
import { SEED_CONCEPTS } from '../lib/prerequisites.js';

const q = (v) => v === null || v === undefined ? 'null' : `'${String(v).replace(/'/g, "''")}'`;
const arr = (xs) => `array[${xs.map(q).join(',')}]`;

export function generate() {
  const out = [];
  out.push(`-- SIX UNDERSTANDING ENGINE · 0009 · Seed lexicon and concept graph`);
  out.push(`-- Workroom: WR-SIXENGINE-001`);
  out.push(`--`);
  out.push(`-- GENERATED FILE. Do not edit by hand.`);
  out.push(`--   node six-engine/tools/generate-seed-sql.mjs > db/six-engine/0009_seed_lexicon_and_concepts.sql`);
  out.push(`--`);
  out.push(`-- The runtime lexicon in six-engine/lib/lexicon.js is the source. Generating`);
  out.push(`-- the rows from it is what stops the backend and the runtime from teaching`);
  out.push(`-- two different meanings of the same word.`);
  out.push(`--`);
  out.push(`-- Seeds are additive and re-runnable: every insert is ON CONFLICT DO NOTHING,`);
  out.push(`-- so a sense edited in the backend by a department is never overwritten by a`);
  out.push(`-- re-run of this migration.`);
  out.push('');
  out.push('begin;');
  out.push('');

  out.push('-- Lexemes ---------------------------------------------------------------------');
  out.push('insert into sixu_lexemes (lemma, is_multiword, band) values');
  const lexRows = Object.entries(LEXICON).map(([lemma, senses]) =>
    `  (${q(lemma)}, ${lemma.includes(' ')}, ${Math.min(...senses.map(s => s.band))})`);
  out.push(lexRows.join(',\n') + '\non conflict (lemma) do nothing;');
  out.push('');

  out.push('-- Word senses -----------------------------------------------------------------');
  out.push('insert into sixu_word_senses (id, lemma, job, domains, band, meaning_here, substitute, example, non_example, invariant) values');
  const senseRows = Object.values(LEXICON).flat().map(s =>
    `  (${q(s.id)}, ${q(s.lemma)}, ${q(s.job)}::sixu_sense_job, ${arr(s.domains)}, ${s.band},\n` +
    `   ${q(s.meaning)},\n   ${q(s.substitute)},\n   ${q(s.example)},\n   ${q(s.non_example)}, ${s.invariant})`);
  out.push(senseRows.join(',\n') + '\non conflict (id) do nothing;');
  out.push('');

  out.push('-- Sense cues ------------------------------------------------------------------');
  out.push('-- Cues are stored as data so a department can teach the engine a new context');
  out.push('-- without a code change. Patterns are PostgreSQL-flavoured regular expressions.');
  const cueRows = [];
  for (const sense of Object.values(LEXICON).flat()) {
    for (const cue of sense.cues) {
      const source = cue.source.replace(/\\b/g, '\\y');   // JS word boundary → POSIX
      const row = `  (${q(sense.id)}, ${q(source)}, 'REGEX', 3)`;
      if (!cueRows.includes(row)) cueRows.push(row);   // a lemma may list the same cue twice
    }
  }
  if (cueRows.length) {
    out.push('insert into sixu_sense_cues (sense_id, cue_pattern, cue_kind, weight) values');
    out.push(cueRows.join(',\n') + '\non conflict (sense_id, cue_pattern) do nothing;');
  }
  out.push('');

  out.push('-- Concept graph ---------------------------------------------------------------');
  out.push('insert into sixu_concepts (id, label, band) values');
  out.push(SEED_CONCEPTS.map(c => `  (${q(c.id)}, ${q(c.label)}, ${c.band})`).join(',\n') + '\non conflict (id) do nothing;');
  out.push('');
  const edges = SEED_CONCEPTS.flatMap(c => c.prerequisites.map(p => `  (${q(c.id)}, ${q(p)})`));
  out.push('insert into sixu_concept_prerequisites (concept_id, prerequisite_id) values');
  out.push(edges.join(',\n') + '\non conflict (concept_id, prerequisite_id) do nothing;');
  out.push('');
  out.push('commit;');
  out.push('');
  return out.join('\n');
}

if (import.meta.url === `file://${process.argv[1]}`) process.stdout.write(generate());
