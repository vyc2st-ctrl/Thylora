// THYLORA · QYRIS grammar engine
//
// One grammar. Every question in this system — pre-marriage, music, comedy,
// business, religion, education, family, or support-role vetting — is the same
// five-part object, recursively nested.
//
//   QUESTION   what is asked
//   YIELD      what a real answer produces that did not exist before
//   REASON     why this is asked here rather than somewhere else
//   INSPECT    what the answer is checked against (how you would know it is wrong)
//   SAFEGUARD  what protects the person if the answer is wrong, coerced or misused
//
// Then child questions, which are the same object again.
//
// The recursive stopping rule is the only thing that ends a pass, and it never
// ends inquiry:
//
//   The frontier remains OPEN. A current pass PAUSES when another question
//   would not change ACTION, EVIDENCE, RISK, AUTHORITY or TRANSFER.
//
// There is no CLOSED, no COMPLETE, no FINISHED. `assertNeverFinished` exists so
// that any future code claiming inquiry is globally finished throws instead.

export const FIELDS = Object.freeze(['question', 'yield', 'reason', 'inspect', 'safeguard']);

/** The five deltas. A question is only live if it can still move one of them. */
export const DELTAS = Object.freeze(['ACTION', 'EVIDENCE', 'RISK', 'AUTHORITY', 'TRANSFER']);

export const DELTA_MEANING = Object.freeze({
  ACTION: 'Something someone would actually do differently.',
  EVIDENCE: 'Something that becomes checkable that was previously assertion.',
  RISK: 'A named exposure that changes size, owner or reversibility.',
  AUTHORITY: 'Who may decide, and whose consent is required.',
  TRANSFER: 'Something of value, obligation or access moving between parties.',
});

/** Frontier states. There is deliberately no terminal state in this list. */
export const FRONTIER_STATES = Object.freeze(['OPEN_ACTIVE', 'OPEN_PAUSED']);

const FORBIDDEN_TERMINALS = Object.freeze([
  'CLOSED', 'COMPLETE', 'COMPLETED', 'FINISHED', 'DONE', 'EXHAUSTED', 'FINAL', 'SETTLED_FOREVER',
]);

export class QyrisError extends Error {}

/**
 * Guard against any caller claiming inquiry is globally finished.
 * @param {string} state
 */
export function assertNeverFinished(state) {
  const upper = String(state || '').toUpperCase();
  if (FORBIDDEN_TERMINALS.includes(upper)) {
    throw new QyrisError(
      `INQUIRY_NOT_GLOBALLY_FINISHED: "${state}" claims a terminal frontier. ` +
      'A pass pauses; the frontier stays OPEN.',
    );
  }
  if (!FRONTIER_STATES.includes(upper)) {
    throw new QyrisError(`UNKNOWN_FRONTIER_STATE: ${state}`);
  }
  return upper;
}

/**
 * Validate one node and, recursively, its children.
 * Returns the node frozen. Throws on any structural failure — a question with a
 * missing SAFEGUARD is not a question in this grammar, it is a trap.
 */
export function validateNode(node, path = []) {
  const where = [...path, node?.id ?? '<no id>'].join(' > ');
  if (!node || typeof node !== 'object') throw new QyrisError(`NODE_NOT_OBJECT at ${where}`);
  if (!node.id || !/^[A-Z0-9][A-Z0-9_.-]*$/.test(node.id)) {
    throw new QyrisError(`NODE_ID_INVALID at ${where}: ids are upper-case stable keys`);
  }
  for (const field of FIELDS) {
    const value = node[field];
    if (typeof value !== 'string' || value.trim().length < 8) {
      throw new QyrisError(`FIELD_MISSING_OR_THIN at ${where}: ${field.toUpperCase()}`);
    }
  }
  if (!Array.isArray(node.moves) || node.moves.length === 0) {
    throw new QyrisError(`NO_DELTA_DECLARED at ${where}: a question that moves nothing is not asked`);
  }
  for (const delta of node.moves) {
    if (!DELTAS.includes(delta)) throw new QyrisError(`UNKNOWN_DELTA at ${where}: ${delta}`);
  }
  if (new Set(node.moves).size !== node.moves.length) {
    throw new QyrisError(`DUPLICATE_DELTA at ${where}`);
  }
  const children = node.children ?? [];
  if (!Array.isArray(children)) throw new QyrisError(`CHILDREN_NOT_ARRAY at ${where}`);
  for (const child of children) validateNode(child, [...path, node.id]);
  return node;
}

/** Validate a whole pack (array of root clusters) and check id uniqueness. */
export function validatePack(pack) {
  if (!Array.isArray(pack) || pack.length === 0) throw new QyrisError('PACK_EMPTY');
  const seen = new Set();
  for (const root of pack) {
    validateNode(root);
    for (const { node } of walk([root])) {
      if (seen.has(node.id)) throw new QyrisError(`DUPLICATE_NODE_ID: ${node.id}`);
      seen.add(node.id);
    }
  }
  return pack;
}

/**
 * Depth-first walk yielding { node, depth, parentId, clusterId, path }.
 */
export function* walk(nodes, depth = 0, parentId = null, clusterId = null, path = []) {
  for (const node of nodes) {
    const cluster = clusterId ?? node.id;
    const here = [...path, node.id];
    yield { node, depth, parentId, clusterId: cluster, path: here };
    yield* walk(node.children ?? [], depth + 1, node.id, cluster, here);
  }
}

/** Flat list of every node in a pack, in stable depth-first order. */
export function flatten(pack) {
  return [...walk(pack)];
}

export function countNodes(pack) {
  return flatten(pack).length;
}

/** Every delta a pack is capable of moving, per cluster. */
export function deltaCoverage(pack) {
  const coverage = {};
  for (const { node, clusterId } of walk(pack)) {
    coverage[clusterId] ??= new Set();
    for (const delta of node.moves) coverage[clusterId].add(delta);
  }
  return Object.fromEntries(Object.entries(coverage).map(([k, v]) => [k, [...v].sort()]));
}

// ---------------------------------------------------------------------------
// The recursive stopping rule
// ---------------------------------------------------------------------------

/**
 * A pass over a pack, holding what has been answered and which deltas are
 * currently settled. Nothing here can ever report that inquiry is over.
 */
export class Pass {
  /**
   * @param {Array} pack        validated pack
   * @param {object} [options]
   * @param {string[]} [options.scope]  cluster ids this pass covers (default: all)
   */
  constructor(pack, options = {}) {
    validatePack(pack);
    this.pack = pack;
    this.scope = options.scope ?? pack.map((n) => n.id);
    /** @type {Map<string, {answeredAt:string, note:string}>} */
    this.answers = new Map();
    /** @type {Set<string>} deltas currently settled *for this pass only* */
    this.settled = new Set();
    /** @type {Array<object>} append-only record of what happened in this pass */
    this.trail = [];
  }

  nodesInScope() {
    return flatten(this.pack).filter((entry) => this.scope.includes(entry.clusterId));
  }

  /**
   * A question is LIVE when it can still move at least one delta that this pass
   * has not settled, and when its parent has been answered (or it is a root).
   */
  isLive(entry) {
    if (this.answers.has(entry.node.id)) return false;
    if (entry.parentId && !this.answers.has(entry.parentId)) return false;
    return entry.node.moves.some((delta) => !this.settled.has(delta));
  }

  /** Questions that would still change something, right now. */
  frontier() {
    return this.nodesInScope().filter((entry) => this.isLive(entry));
  }

  /**
   * Record an answer. Deltas the question declared become settled for this pass.
   * @param {string} nodeId
   * @param {string} note   what the answer actually established
   */
  answer(nodeId, note = '') {
    const entry = this.nodesInScope().find((candidate) => candidate.node.id === nodeId);
    if (!entry) throw new QyrisError(`NODE_NOT_IN_SCOPE: ${nodeId}`);
    if (entry.parentId && !this.answers.has(entry.parentId)) {
      throw new QyrisError(`PARENT_UNANSWERED: ${nodeId} sits under ${entry.parentId}`);
    }
    this.answers.set(nodeId, { answeredAt: new Date().toISOString(), note });
    for (const delta of entry.node.moves) this.settled.add(delta);
    this.trail.push({ event: 'ANSWERED', nodeId, moves: [...entry.node.moves], note });
    return this;
  }

  /**
   * New facts arrive. A settled delta becomes unsettled and the pass resumes.
   * This is why the frontier is never closed: a life keeps supplying these.
   */
  disturb(delta, cause = '') {
    if (!DELTAS.includes(delta)) throw new QyrisError(`UNKNOWN_DELTA: ${delta}`);
    this.settled.delete(delta);
    this.trail.push({ event: 'DISTURBED', delta, cause });
    return this;
  }

  /**
   * The stopping rule itself.
   * OPEN_PAUSED when no remaining question would change ACTION, EVIDENCE, RISK,
   * AUTHORITY or TRANSFER. OPEN_ACTIVE otherwise. Never anything else.
   */
  state() {
    const frontier = this.frontier();
    const state = frontier.length === 0 ? 'OPEN_PAUSED' : 'OPEN_ACTIVE';
    return assertNeverFinished(state);
  }

  /** Human-readable account of why the pass is where it is. */
  report() {
    const frontier = this.frontier();
    const state = this.state();
    const unsettled = DELTAS.filter((delta) => !this.settled.has(delta));
    return {
      state,
      frontierOpen: true,
      globallyFinished: false,
      answered: this.answers.size,
      inScope: this.nodesInScope().length,
      settledDeltas: DELTAS.filter((delta) => this.settled.has(delta)),
      unsettledDeltas: unsettled,
      liveQuestions: frontier.map((entry) => ({
        id: entry.node.id,
        question: entry.node.question,
        moves: entry.node.moves,
        clusterId: entry.clusterId,
      })),
      pauseReason: state === 'OPEN_PAUSED'
        ? 'Pass paused: no remaining question in scope would change ACTION, EVIDENCE, RISK, AUTHORITY or TRANSFER. The frontier stays OPEN — new facts reopen it.'
        : null,
    };
  }
}

/** Convenience: build a Pass without `new`. */
export function openPass(pack, options) {
  return new Pass(pack, options);
}

/**
 * Render one node as the five lines, for any surface that wants plain text.
 */
export function renderNode(node, indent = '') {
  validateNode(node);
  return [
    `${indent}QUESTION   ${node.question}`,
    `${indent}YIELD      ${node.yield}`,
    `${indent}REASON     ${node.reason}`,
    `${indent}INSPECT    ${node.inspect}`,
    `${indent}SAFEGUARD  ${node.safeguard}`,
    `${indent}MOVES      ${node.moves.join(' · ')}`,
  ].join('\n');
}

export const STOPPING_RULE = Object.freeze({
  text:
    'The frontier remains OPEN. A current pass pauses when another question would not change '
    + 'ACTION / EVIDENCE / RISK / AUTHORITY / TRANSFER.',
  neverClaim: 'Inquiry is never globally finished.',
  deltas: DELTAS,
});
