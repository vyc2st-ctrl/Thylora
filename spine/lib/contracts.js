// Pre-render contracts (Transmission 001) and classroom lesson contracts
// (THE SIX), validated before anything is rendered or taught.

import { claimGuard } from './qyris2st.js';

// ------------------------------------------------------------ transmission

export const TX_SECTIONS = Object.freeze(['scene', 'world', 'people', 'product']);
// Existing thylora-dash gates a render must clear. The contract lists them; it
// does not pass them.
export const TX_PREFLIGHT_GATES = Object.freeze([
  'thylora_visual_preflight_gate', 'thylora_world_identity_gate', 'thylora_voice_provenance_gate',
  'thylora_output_visual_identity_gate', 'thylora_truth_integrity_gate',
]);

export function validateTransmissionContract(c) {
  const e = [];
  for (const s of TX_SECTIONS) if (!c[s]) e.push(`${s} section missing`);
  if (c.render_allowed !== false) e.push('render_allowed must be false at contract stage');
  if (!c.render_unlock || !c.render_unlock.requires_chairman_approval) e.push('render_unlock must require Chairman approval');
  const gates = (c.render_unlock && c.render_unlock.gates) || [];
  for (const g of TX_PREFLIGHT_GATES) if (!gates.includes(g)) e.push(`render_unlock missing gate ${g}`);
  const sc = c.scene || {};
  for (const k of ['logline', 'beats', 'duration_target_s', 'media_mode', 'camera_grammar']) if (!sc[k]) e.push(`scene.${k} missing`);
  (sc.beats || []).forEach((b, i) => { if (!b.beat || !b.purpose) e.push(`scene.beats[${i}] needs beat + purpose`); });
  const w = c.world || {};
  if (w.world_name !== 'EdereAirah') e.push('world.world_name must be the canonical spelling EdereAirah');
  for (const k of ['location_state', 'time_state', 'earth_mirror']) if (!w[k]) e.push(`world.${k} missing`);
  for (const p of c.people || []) {
    if (!p.slot || !p.function) e.push('person needs slot + function');
    if (!['CANON_REF', 'OPEN_CASTING', 'CHAIRMAN'].includes(p.identity_state)) e.push(`person ${p.slot}: identity_state must be CANON_REF|OPEN_CASTING|CHAIRMAN`);
    if (p.identity_state === 'CANON_REF' && !p.canon_ref) e.push(`person ${p.slot}: CANON_REF needs canon_ref`);
    if (p.identity_state === 'OPEN_CASTING' && p.appearance_locked) e.push(`person ${p.slot}: appearance cannot be locked before casting`);
  }
  if ((c.people || []).length === 0) e.push('people empty');
  const pr = c.product || {};
  for (const k of ['product_code', 'form', 'content_boundary', 'store_state']) if (!pr[k]) e.push(`product.${k} missing`);
  if (pr.store_state && pr.store_state !== 'NOT_LISTED') e.push('product.store_state must be NOT_LISTED at contract stage');
  const copy = JSON.stringify([sc.beats, pr.content_boundary, pr.promise]);
  for (const h of claimGuard(copy)) e.push(`contract copy makes unwitnessed ${h.claim} claim: "${h.phrase}"`);
  return e;
}

// ------------------------------------------------------------ lesson (ue_concepts shape)

export const UE_REQUIRED = Object.freeze([
  'concept_code', 'title', 'subject_code', 'band_min', 'band_max', 'what_it_is', 'why_it_matters',
  'how_we_know', 'what_remains_unknown', 'what_connects_to_it', 'common_misunderstanding',
  'test_question', 'real_world_application', 'teach_back_challenge', 'truth_state', 'safety_class',
]);
const TRUTH = ['SUPPORTED', 'CONTESTED', 'UNCERTAIN', 'UNKNOWN', 'SUPERSEDED'];
const SAFETY = ['GENERAL', 'GUARDIAN_CONTEXT', 'SENSITIVE_HISTORY', 'SAFETY_CRITICAL', 'REGULATED_ADVICE_BOUNDARY'];
const U_FACTORS = ['K', 'E', 'C', 'X', 'T'];

export function validateLesson(l) {
  const e = [];
  const c = l.concept || {};
  for (const k of UE_REQUIRED) if (c[k] == null || c[k] === '' || (Array.isArray(c[k]) && !c[k].length)) e.push(`concept.${k} missing`);
  if (c.truth_state && !TRUTH.includes(c.truth_state)) e.push('concept.truth_state not allowed by ue_concepts_truth_state_ck');
  if (c.safety_class && !SAFETY.includes(c.safety_class)) e.push('concept.safety_class not allowed by ue_concepts_safety_ck');
  // Every world parameter must say whether it is canon or candidate.
  for (const p of l.world_parameters || []) {
    if (!p.name || p.value == null) e.push('world parameter needs name + value');
    if (!['CANON_LOCKED', 'CANON_CANDIDATE'].includes(p.canon_state)) e.push(`world parameter ${p.name}: canon_state CANON_LOCKED|CANON_CANDIDATE`);
    if (p.canon_state === 'CANON_CANDIDATE' && c.truth_state === 'SUPPORTED' && !l.candidate_disclosed_to_students) e.push(`world parameter ${p.name} is a candidate; students must be told`);
  }
  // Earth facts must carry a source.
  for (const f of l.earth_facts || []) if (!f.fact || !f.source) e.push('earth fact needs fact + source');
  // Worked examples must be arithmetically true.
  for (const w of l.worked_examples || []) {
    const got = w.compute();
    if (Math.abs(got - w.expected) > (w.tolerance ?? 1e-9)) e.push(`worked example "${w.prompt}" expected ${w.expected} got ${got}`);
  }
  const stages = (l.classroom || []).map(s => s.stage);
  for (const s of ['WARM_UP', 'OBSERVE', 'MODEL', 'PRACTICE', 'TRANSFER', 'TEACH_BACK']) if (!stages.includes(s)) e.push(`classroom stage ${s} missing`);
  const rub = l.understanding_rubric || {};
  for (const f of U_FACTORS) if (!rub[f]) e.push(`rubric factor ${f} missing`);
  if (rub.zero_rule !== true) e.push('rubric must enforce the zero rule (any factor 0 → U = 0)');
  return e;
}

/** U = K × E × C × X × T, each 0..4; zero anywhere means no understanding yet. */
export function understandingScore(s) {
  for (const f of U_FACTORS) if (!Number.isInteger(s[f]) || s[f] < 0 || s[f] > 4) throw new Error(`${f} must be 0–4`);
  return U_FACTORS.reduce((acc, f) => acc * s[f], 1);
}
