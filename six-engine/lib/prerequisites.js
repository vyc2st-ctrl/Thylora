// SIX UNDERSTANDING ENGINE · PREREQUISITES
// Workroom: WR-SIXENGINE-001
//
// An explanation lands on what the learner already holds. If it lands on
// nothing, it is not an explanation — it is a recital the learner will nod at.
//
// This module finds the floor: the deepest thing in the chain the learner does
// NOT yet hold. Teaching starts there, not at the question. It also refuses to
// dig forever (FM-11) and refuses to invent a concept it does not have (FM-06).

export const MASTERY = Object.freeze(['UNKNOWN', 'NOT_HELD', 'SHAKY', 'HELD', 'TRANSFERRED']);
export const HELD_LEVELS = Object.freeze(['HELD', 'TRANSFERRED']);
export const DEFAULT_MAX_DEPTH = 6;

/** A concept graph is data, so a department can extend it without a code change. */
export function makeGraph(concepts = []) {
  const byId = new Map();
  for (const c of concepts) {
    if (byId.has(c.id)) throw new Error(`Duplicate concept id: ${c.id}`);
    byId.set(c.id, Object.freeze({ prerequisites: [], band: 2, ...c }));
  }
  for (const c of byId.values()) {
    for (const p of c.prerequisites) {
      if (!byId.has(p)) throw new Error(`Concept "${c.id}" names prerequisite "${p}" which is not in the graph`);
    }
  }
  return byId;
}

/**
 * Walk the prerequisite chain under a concept.
 *
 * Stops on: everything held, the depth cap, or a cycle. All three are reported;
 * none of them silently truncates.
 */
export function prerequisiteClosure(graph, conceptId, mastery = {}, { max_depth = DEFAULT_MAX_DEPTH } = {}) {
  if (!graph.has(conceptId)) {
    return {
      concept: conceptId, found: false, chain: [], unmet: [], floor: null, truncated: false, cycles: [],
      gap: {
        code: 'CONCEPT_NOT_IN_GRAPH',
        detail: `"${conceptId}" is not in the concept graph. The engine will not invent a prerequisite chain for a concept it does not hold.`,
        next_action: 'Add the concept and its prerequisites to the graph, or route the question to an evidence answer instead of a teaching ladder.'
      }
    };
  }

  const chain = [];
  const unmet = [];
  const cycles = [];
  const seen = new Set();
  const stack = new Set();
  let truncated = false;

  (function walk(id, depth) {
    if (stack.has(id)) { cycles.push([...stack, id]); return; }
    if (seen.has(id)) return;
    if (depth > max_depth) { truncated = true; return; }
    seen.add(id); stack.add(id);

    const node = graph.get(id);
    const level = mastery[id] ?? 'UNKNOWN';
    const held = HELD_LEVELS.includes(level);

    // A held concept ends the dig. There is no reason to unpack what the
    // learner already carries.
    if (!held) {
      for (const p of node.prerequisites) walk(p, depth + 1);
    }
    chain.push({ id, label: node.label, depth, mastery: level, held, band: node.band });
    if (!held) unmet.push({ id, label: node.label, depth, mastery: level });
    stack.delete(id);
  })(conceptId, 0);

  const floor = unmet.length
    ? unmet.reduce((deepest, x) => (x.depth > deepest.depth ? x : deepest), unmet[0])
    : null;

  return {
    concept: conceptId, found: true,
    chain,
    unmet,
    floor,
    teach_order: unmet.slice().sort((a, b) => b.depth - a.depth),
    truncated,
    truncation_note: truncated
      ? `Prerequisite walk hit the depth cap of ${max_depth}. Teaching starts at the deepest unmet concept found so far; the chain below it is unexamined, not assumed held.`
      : null,
    cycles,
    cycle_note: cycles.length ? 'The graph contains a prerequisite cycle. It was cut, not followed.' : null
  };
}

/** Is the learner standing on enough ground for this explanation to land? */
export function explanationReady(closure) {
  if (!closure.found) return { ready: false, reason: closure.gap.detail, start_at: null };
  if (closure.unmet.length === 0) return { ready: true, reason: 'every prerequisite is held', start_at: closure.concept };
  return {
    ready: false,
    reason: `${closure.unmet.length} prerequisite(s) are not held; an explanation of "${closure.concept}" would land on nothing`,
    start_at: closure.floor.id,
    start_at_label: closure.floor.label,
    teach_order: closure.teach_order.map(x => x.id)
  };
}

/** A small seed graph. Departments extend this; the engine does not hardcode a curriculum. */
export const SEED_CONCEPTS = Object.freeze([
  { id: 'counting', label: 'counting whole things', prerequisites: [], band: 1 },
  { id: 'addition', label: 'putting amounts together', prerequisites: ['counting'], band: 1 },
  { id: 'subtraction', label: 'taking an amount away', prerequisites: ['counting', 'addition'], band: 1 },
  { id: 'comparison', label: 'which amount is bigger, and by how much', prerequisites: ['subtraction'], band: 2 },
  { id: 'inverse_comparison', label: 'a comparison written in the opposite order to the calculation', prerequisites: ['comparison'], band: 2 },
  { id: 'equal_groups', label: 'the same amount in every group', prerequisites: ['addition'], band: 2 },
  { id: 'multiplication', label: 'equal groups counted quickly', prerequisites: ['equal_groups'], band: 2 },
  { id: 'division_sharing', label: 'splitting one amount into equal parts', prerequisites: ['equal_groups', 'subtraction'], band: 2 },
  { id: 'two_step_word_problem', label: 'a problem needing two operations in order', prerequisites: ['inverse_comparison', 'division_sharing'], band: 3 },
  { id: 'density', label: 'how much mass sits in a given space', prerequisites: ['division_sharing'], band: 3 },
  { id: 'floating', label: 'why some things float', prerequisites: ['density'], band: 3 },
  { id: 'source_type', label: 'who made a record, and when', prerequisites: [], band: 2 },
  { id: 'primary_source', label: 'a record made at the time by someone present', prerequisites: ['source_type'], band: 3 },
  { id: 'record_survival', label: 'why some records survive and others do not', prerequisites: ['source_type'], band: 3 },
  { id: 'who_was_recorded', label: 'who the record-keepers wrote about, and who they left out', prerequisites: ['record_survival'], band: 3 },
  { id: 'evidence_weighing', label: 'holding two accounts against each other', prerequisites: ['primary_source', 'who_was_recorded'], band: 4 },
  { id: 'contested_claim', label: 'a claim the field has not settled', prerequisites: ['evidence_weighing'], band: 4 }
]);

export const SEED_GRAPH = makeGraph([...SEED_CONCEPTS]);
