// SIX UNDERSTANDING ENGINE · sample runs
// Workroom: WR-SIXENGINE-001
//
//   node six-engine/samples/run-samples.mjs
//
// Six questions through the real pipeline — nothing here is a mock-up. Each one
// exercises a different way the engine must refuse to bluff. The output in
// docs/SIX-ENGINE-SAMPLE-RUNS.md is this script's actual output.

import { resolveQuestion } from '../lib/pipeline.js';
import { recordGap } from '../lib/evidence.js';

const learner = {
  id: 'L-001', language_band: 2, known_lemmas: [],
  mastery: { counting: 'HELD', addition: 'HELD', subtraction: 'HELD', equal_groups: 'HELD', source_type: 'HELD' }
};

const line = (n = 78) => '─'.repeat(n);

function show(title, run) {
  console.log(`\n${line()}\n${title}\n${line()}`);
  console.log(`QUESTION      ${run.question}`);
  console.log(`ROUTE         ${run.route.class} — ${run.route.label}`);
  console.log(`CONTRACT      ${run.route.answer_contract}`);
  console.log(`STATE         ${run.state}${run.halt_reason ? ` (${run.halt_reason})` : ''}`);
  console.log('\nTRAIL');
  for (const e of run.trail) console.log(`  ${String(e.seq).padStart(2)} ${e.stage.padEnd(16)} ${e.stage_state ?? e.state}  ${e.summary}`);

  if (run.language?.cards?.length) {
    console.log('\nLANGUAGE BLOCKERS RESOLVED');
    for (const c of run.language.cards) {
      console.log(`  WORD                ${c.word}`);
      console.log(`  CONTEXT             ${c.context}`);
      console.log(`  MEANING HERE        ${c.meaning_here}`);
      console.log(`  SIMPLER SUBSTITUTE  ${c.simpler_substitute}`);
      console.log(`  EXAMPLE             ${c.example}`);
      console.log(`  NON-EXAMPLE         ${c.non_example}`);
      console.log(`  LEARNER RESTATEMENT ${c.learner_restatement_prompt}`);
      console.log(`  STATE               ${c.state} (${c.why_material})\n`);
    }
  }
  if (run.ask_the_learner) {
    console.log('\nASK THE LEARNER (the engine does not guess)');
    for (const q of run.ask_the_learner) console.log(`  · ${q}`);
  }
  if (run.load) {
    const d = run.load.diagnosis;
    console.log('\nLOAD SEPARATION');
    console.log(`  L (sentence understood)      ${d.L ?? 'UNMEASURED'}`);
    console.log(`  M (relationship understood)  ${d.M ?? 'UNMEASURED'}`);
    console.log(`  S (procedure carried out)    ${d.S ?? 'UNMEASURED'}`);
    console.log(`  P_solve = L × M × S          ${d.P_solve ?? 'NOT COMPUTABLE'}`);
    console.log(`  VERDICT                      ${d.verdict}`);
    console.log(`  MATHEMATICS DEFICIT CLAIM    ${d.mathematics_deficit_claim}`);
    if (d.discarded_measurements.length) console.log(`  DISCARDED                    ${d.discarded_measurements.join(', ')}`);
    for (const n of d.evidence_notes) console.log(`  NOTE                         ${n}`);
    console.log(`  TEACHING TARGET              ${d.teaching_target}`);
    console.log(`  NEXT ACTION                  ${d.next_action}`);
    if (run.controlled_form) {
      console.log('\n  LANGUAGE-CONTROLLED FORM');
      for (const l of run.controlled_form.presentation.split('\n')) console.log(`    ${l}`);
      console.log(`    (${run.controlled_form.note})`);
    }
  }
  if (run.prerequisites?.found) {
    console.log('\nPREREQUISITES');
    console.log(`  floor        ${run.prerequisites.floor ? `${run.prerequisites.floor.id} — ${run.prerequisites.floor.label}` : 'none, all held'}`);
    console.log(`  teach order  ${run.prerequisites.teach_order.map(t => t.id).join(' → ') || '—'}`);
  }
  if (run.answer) {
    console.log('\nANSWER');
    if ('KNOWN' in run.answer) {
      for (const section of ['KNOWN', 'EVIDENCE', 'CONTESTED', 'UNKNOWN', 'WHAT_WOULD_ANSWER_IT']) {
        console.log(`  ${section}`);
        for (const item of run.answer[section]) console.log(`    · ${item}`);
      }
      console.log(`  state ${run.answer.state} · confidence ${run.answer.confidence}`);
    } else {
      // A word problem answers with its separated loads, not with an evidence report.
      for (const [k, v] of Object.entries(run.answer)) {
        if (Array.isArray(v)) { for (const item of v) console.log(`  ${k.padEnd(26)} ${item}`); }
        else console.log(`  ${k.padEnd(26)} ${v}`);
      }
    }
  }
  if (run.child_facing) console.log(`\nCHILD-FACING (parity ${run.explanation.parity.parity}, friction ${run.explanation.parity.friction_before} → ${run.explanation.parity.friction_after})\n  ${run.child_facing}`);
  if (run.parity && !run.parity.pass) {
    console.log('\nPARITY REFUSAL');
    for (const v of run.parity.violations) console.log(`  · ${v.code}: ${v.detail}`);
  }
  if (run.transfer) console.log(`\nTRANSFER\n  ${run.transfer.prompt}\n  verifies: ${run.transfer.verifies}`);
  if (run.next_questions?.length) {
    console.log('\nNEXT QUESTION');
    for (const n of run.next_questions) console.log(`  · ${n.question}  [${n.from}${n.feasibility ? ` · ${n.feasibility}` : ''}]`);
  }
  if (run.failures.hits.length) {
    console.log('\nFAILURE MODES DETECTED');
    for (const f of run.failures.hits) console.log(`  · ${f.code} ${f.name} [${f.severity}] — ${f.detail}`);
  }
}

// 1 · A word problem whose failure is a sentence, not a mathematics gap ---------
show('SAMPLE 1 · The failure that is not a mathematics failure', resolveQuestion({
  text: 'Ada has 3 less than Sam. Sam has 8 sweets. If Ada shares hers equally between 5 children, how many does each child get?',
  domain: 'math',
  learner,
  structure: { quantities: { Sam: 8 }, relation: 'Ada = Sam - 3', question: 'Ada ÷ 5', steps: 2 },
  attempt: { learner_restatement: 'ada has 3 sweets', relation_stated: '3 - 8', steps_attempted: 2, steps_correct: 0, answer_correct: false },
  knowledge: { positions: [], unknowns: [] }
}));

// 2 · The same learner, same problem, after the sentence is cleared -------------
show('SAMPLE 2 · Sentence cleared, the real blocker appears', resolveQuestion({
  text: 'Ada has 3 less than Sam. Sam has 8 sweets. If Ada shares hers equally between 5 children, how many does each child get?',
  domain: 'math',
  learner: { ...learner, known_lemmas: ['less than', 'each', 'share', 'if'] },
  structure: { quantities: { Sam: 8 }, relation: 'Ada = Sam - 3', question: 'Ada ÷ 5', steps: 2 },
  attempt: {
    learner_restatement: 'if sam has 8 and ada has 3 less than him, then all 5 children get an equal share each',
    controlled: true, relation_stated: 'Ada = Sam + 3', steps_attempted: 2, steps_correct: 2, bare_computation: true, answer_correct: false
  },
  knowledge: { positions: [], unknowns: [] }
}));

// 3 · A word the context does not separate --------------------------------------
show('SAMPLE 3 · The engine refuses to guess a word sense', resolveQuestion({
  text: 'Look at the table and write down what it shows.',
  learner,
  knowledge: { positions: [], unknowns: [] }
}));

// 4 · A contested history question ----------------------------------------------
show('SAMPLE 4 · A contested record, answered as contested', resolveQuestion({
  text: 'Was the founder really born in that town?',
  learner,
  concept: 'contested_claim',
  knowledge: {
    positions: [
      { id: 'town', statement: 'She was born in the town', standing: 'CONSENSUS',
        evidence: [{ tier: 'TERTIARY_SUMMARY', origin_id: 'county-history' }, { tier: 'TERTIARY_SUMMARY', origin_id: 'county-history' }, { tier: 'SECONDARY_ACCOUNT', origin_id: 'biography-1908' }],
        discriminator: 'a baptism entry naming the parish' },
      { id: 'elsewhere', statement: 'She was born elsewhere and was brought to the town as a child', standing: 'MINORITY',
        evidence: [{ tier: 'DIRECT_TESTIMONY', origin_id: 'letter-1871' }] }
    ],
    unknowns: [recordGap({
      what_is_missing: 'the parish register for 1748–1761',
      why_missing: 'destroyed in a fire',
      who_kept_records: 'the established church',
      who_was_outside_the_records: 'families who were not baptised in that church, and people recorded only by first name'
    })]
  }
}));

// 5 · A wording that would have shrunk the concept -------------------------------
show('SAMPLE 5 · A simplification the engine refuses', resolveQuestion({
  text: 'Why does ice float?',
  learner: { ...learner, mastery: { ...learner.mastery, division_sharing: 'HELD', density: 'HELD' } },
  concept: 'floating',
  knowledge: {
    positions: [{ id: 'density', statement: 'Ice floats because it is less dense than the water around it', standing: 'CONSENSUS',
      evidence: [{ tier: 'PHYSICAL_EVIDENCE', origin_id: 'measurement' }, { tier: 'REPLICATED_EXPERIMENT', origin_id: 'teaching-labs' }] }],
    unknowns: []
  },
  simplification: {
    source: 'Most physicists hold that ice floats because, if the same space holds less mass, the object is less dense than the water around it.',
    candidate: 'Ice floats because it is light.'
  }
}));

// 6 · The same question with a wording that keeps the concept --------------------
show('SAMPLE 6 · A simplification the engine accepts', resolveQuestion({
  text: 'Why does ice float?',
  learner: { ...learner, mastery: { ...learner.mastery, division_sharing: 'HELD', density: 'HELD' } },
  concept: 'floating',
  knowledge: {
    positions: [{ id: 'density', statement: 'Ice floats because it is less dense than the water around it', standing: 'CONSENSUS',
      evidence: [{ tier: 'PHYSICAL_EVIDENCE', origin_id: 'measurement' }, { tier: 'REPLICATED_EXPERIMENT', origin_id: 'teaching-labs' }] }],
    unknowns: []
  },
  simplification: {
    source: 'Most physicists hold that ice floats because, if the same space holds less mass, the object is less dense than the water around it.',
    candidate: 'Most scientists say this. If the same amount of space holds less stuff, then the thing floats because of that. Ice holds less stuff in that space than water does.'
  }
}));

// 7 · A question with a consequence for a child ----------------------------------
show('SAMPLE 7 · A question that goes to an adult first', resolveQuestion({
  text: 'Is it safe to take two of these pills?',
  learner,
  knowledge: { positions: [], unknowns: [] }
}));
