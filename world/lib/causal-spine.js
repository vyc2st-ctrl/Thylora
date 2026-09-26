// THYLORA · Person Causal Spine compiler
// Idea lane: THY-IDEA-PERSON-CAUSAL-SPINE-001
//
// Input : a persisted person packet (thylora_person_life_registry row) and the
//         Chairman's seed questions (normally five).
// Output: the derived question set that a broad trait must expand into before
//         the trait may be used to drive behaviour, with each question marked
//         EVIDENCE_IN_PACKET (pointer to the packet path, still needs review)
//         or OPEN. The compiler never writes an answer. UNKNOWN remains UNKNOWN.
//
// Five seeds x eight causal dimensions = 40 derived questions,
// plus one interaction question per seed pair (10) = 50.

export const SPINE_DIMENSIONS = Object.freeze([
  'CONTEXT', 'RELATIONSHIP', 'TIME', 'CAUSE',
  'PRIOR_EVENTS', 'CONTRADICTIONS', 'CURRENT_STATE', 'CHANGE_OVER_TIME'
]);

// Broad traits the Chairman named. Each must expand; none may drive a scene bare.
export const TRAITS = Object.freeze({
  IRRITATION:       { match: /irritat|annoy|bother|frustrat|pet peeve/i, noun: 'irritation' },
  FEAR:             { match: /afraid|fear|anxi|worr|scared|dread/i,       noun: 'fear' },
  PREFERENCE:       { match: /\blikes?\b|prefer|enjoy|favou?rite|loves?\b/i, noun: 'preference' },
  SKILL:            { match: /skill|good at|capable|expert|competen|ability/i, noun: 'skill' },
  TRUST:            { match: /trust|rely|depend on|believe in/i,          noun: 'trust' },
  JOB_REASON:       { match: /\bjob\b|took the (role|position)|why .*work|career|hired/i, noun: 'reason for taking the job' },
  TRANSPORT_CHOICE: { match: /\bcar\b|vehicle|drive|commute|transport/i,  noun: 'transport choice' },
  MEMORY:           { match: /remember|memory|recall|forget/i,            noun: 'memory pattern' },
  FOOD:             { match: /food|meal|eat|cook|taste/i,                 noun: 'food choice' }
});

const TEMPLATES = Object.freeze({
  CONTEXT:          (n, noun, domains) => `In which contexts (${domains}) does ${n}'s ${noun} appear, and in which does it not?`,
  RELATIONSHIP:     (n, noun) => `With which specific people is ${n}'s ${noun} stronger, weaker or different, and what shared history explains each difference?`,
  TIME:             (n, noun) => `When does ${n}'s ${noun} rise or fall (time of day, point in shift, fatigue, hunger, season), and how long does it last?`,
  CAUSE:            (n, noun) => `What concrete cause produces ${n}'s ${noun}, and what would have to be absent for it not to occur?`,
  PRIOR_EVENTS:     (n, noun) => `Which earlier events formed ${n}'s ${noun} (when, where, who was present)?`,
  CONTRADICTIONS:   (n, noun) => `Where does ${n} act against this ${noun}, and what does the exception reveal?`,
  CURRENT_STATE:    (n, noun) => `What is the state of ${n}'s ${noun} today and yesterday, and what triggered it?`,
  CHANGE_OVER_TIME: (n, noun) => `How has ${n}'s ${noun} changed across their life so far, and what event would change it next?`
});

// Where evidence for trait x dimension may already live in the life packet.
// Evidence present is NOT an answer: it is a pointer that a reviewer must check.
const EVIDENCE_PATHS = Object.freeze({
  IRRITATION: {
    CONTEXT: ['mind_profile.irritation_map'],
    CURRENT_STATE: ['mind_profile.current_irritations'],
    RELATIONSHIP: ['primary_relationship_network'],
    CONTRADICTIONS: ['mind_profile.rationalization_pattern']
  },
  FEAR: {
    CONTEXT: ['mind_profile.anxieties'],
    PRIOR_EVENTS: ['memory_profile.personal_history_triggers']
  },
  SKILL: {
    CONTEXT: ['knowledge_profile.training'],
    CONTRADICTIONS: ['knowledge_profile.known_limits'],
    CHANGE_OVER_TIME: ['knowledge_profile.learning_style']
  },
  TRUST: {
    RELATIONSHIP: ['primary_relationship_network'],
    PRIOR_EVENTS: ['memory_profile.personal_history_triggers']
  },
  JOB_REASON: {
    CAUSE: ['work_profile.job_reasons'],
    PRIOR_EVENTS: ['work_profile.previous_work'],
    CURRENT_STATE: ['work_profile.shift_state', 'work_profile.current_role']
  },
  TRANSPORT_CHOICE: {
    CAUSE: ['work_profile.transport.why_chosen'],
    PRIOR_EVENTS: ['work_profile.transport.purchase_history'],
    RELATIONSHIP: ['work_profile.transport.why_chosen'],
    CONTEXT: ['mind_profile.irritation_map.driving']
  },
  MEMORY: {
    CONTEXT: ['memory_profile.memory_style'],
    CAUSE: ['memory_profile.anchor_method'],
    PRIOR_EVENTS: ['memory_profile.personal_history_triggers'],
    CONTRADICTIONS: ['mind_profile.rationalization_pattern']
  },
  FOOD: {
    CONTEXT: ['work_profile.meal_plan'],
    CAUSE: ['work_profile.meal_plan.reason'],
    TIME: ['work_profile.meal_plan.variation_rule'],
    CONTRADICTIONS: ['mind_profile.irritation_map.food']
  },
  PREFERENCE: {}
});

export function classifyTrait(question) {
  for (const [code, t] of Object.entries(TRAITS)) if (t.match.test(question)) return code;
  return 'UNCLASSIFIED';
}

export function readPath(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

function hasEvidence(v) {
  if (v == null) return false;
  if (typeof v === 'string') return v.trim().length > 0 && !/^(OPEN|UNKNOWN)\b/i.test(v.trim());
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'object') return Object.keys(v).length > 0;
  return true;
}

// compileSpine(packet, seeds) -> { person, seeds, derived, counts }
export function compileSpine(packet, seeds) {
  if (!packet || !packet.canonical_entity_id) throw new Error('packet must be a persisted person (canonical_entity_id required)');
  if (!Array.isArray(seeds) || seeds.length === 0) throw new Error('at least one seed question is required');
  const name = packet.public_name || packet.canonical_entity_id;
  const domains = (packet.continuity_policy?.context_domains || ['home', 'family', 'work']).join(', ');

  const seedRows = seeds.map((q, i) => {
    const trait = classifyTrait(q);
    return { seed_id: `S${i + 1}`, question: q, trait, noun: TRAITS[trait]?.noun || 'trait named in the seed' };
  });

  const derived = [];
  for (const s of seedRows) {
    for (const dim of SPINE_DIMENSIONS) {
      const paths = EVIDENCE_PATHS[s.trait]?.[dim] || [];
      const evidence = paths.filter(p => hasEvidence(readPath(packet, p)));
      derived.push({
        question_id: `${packet.canonical_entity_id}:${s.seed_id}:${dim}`,
        seed_id: s.seed_id,
        trait: s.trait,
        dimension: dim,
        question: TEMPLATES[dim](name, s.noun, domains),
        status: evidence.length ? 'EVIDENCE_IN_PACKET' : 'OPEN',
        evidence_paths: evidence,
        answer: null // the compiler never authors answers
      });
    }
  }
  for (let i = 0; i < seedRows.length; i++) {
    for (let j = i + 1; j < seedRows.length; j++) {
      const a = seedRows[i], b = seedRows[j];
      derived.push({
        question_id: `${packet.canonical_entity_id}:${a.seed_id}x${b.seed_id}:INTERACTION`,
        seed_id: `${a.seed_id}x${b.seed_id}`,
        trait: `${a.trait}x${b.trait}`,
        dimension: 'INTERACTION',
        question: `When ${name}'s ${a.noun} and ${b.noun} are active at the same time, which one governs the choice, and what past event decided that order?`,
        status: 'OPEN',
        evidence_paths: [],
        answer: null
      });
    }
  }

  const counts = derived.reduce((c, d) => (c[d.status] = (c[d.status] || 0) + 1, c), { total: derived.length });
  return { person: packet.canonical_entity_id, seeds: seedRows, derived, counts };
}

// A broad trait may drive behaviour only when every dimension has at least
// reviewed evidence. Until then the scene engine must treat it as OPEN.
export function traitReadiness(compiled, seedId) {
  const rows = compiled.derived.filter(d => d.seed_id === seedId);
  const missing = rows.filter(d => d.status === 'OPEN').map(d => d.dimension);
  return { seed_id: seedId, ready: missing.length === 0, missing_dimensions: missing };
}
