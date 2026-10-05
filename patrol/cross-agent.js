// CROSS-AGENT PATROL — implementation of MATH-CROSS-AGENT-PATROL-653
// Workroom: WR-RECONCILE-667
//
// BACKEND-FIRST. MATH-CROSS-AGENT-PATROL-653 is ACTIVE in the live backend
// (thylora_math_equation_registry, layer Earth), read 2026-10-05:
//
//   For every write w by agent a:  P(w) = H × N × L × X   (each 1 or 0)
//   P = 0 → ALERT CHAIRMAN
//   Drift index for each gap g:  D_g = (writes with that factor = 0) ÷ (writes)
//
//   H — the write sat on the true HEAD, with ledger/custody linkage
//   N — NO-LOSS: nothing lost, no backward state movement
//   L — LINEAGE to Chairman words/evidence AND the work is actually represented
//       in the backend
//   X — CROSS-CHECK by an agent other than the author
//
// An author does not self-certify canonical advancement. This module therefore
// cannot return X = 1 for its own author: X is set only by a named other agent.

export const FACTORS = Object.freeze(['H', 'N', 'L', 'X']);

export const FACTOR_MEANING = Object.freeze({
  H: 'Sat on the true head, with ledger/custody linkage.',
  N: 'No loss, and no backward state movement.',
  L: 'Traces to Chairman words or evidence, and the work is actually represented in the backend.',
  X: 'Cross-checked by an agent other than the author.'
});

function bit(value, factor) {
  if (value !== 0 && value !== 1) throw new RangeError(`${factor} must be exactly 0 or 1`);
  return value;
}

/**
 * Score one write. Returns P and, when P = 0, the alert and the specific
 * factors that are zero — each with what would raise it.
 */
export function scoreWrite(write) {
  const { author, checked_by } = write;
  const f = {};
  for (const factor of FACTORS) f[factor] = bit(write[factor], factor);

  // An author never certifies its own cross-check.
  if (f.X === 1 && (!checked_by || checked_by === author)) {
    throw new Error('X = 1 requires a named agent other than the author');
  }

  const P = FACTORS.reduce((product, factor) => product * f[factor], 1);
  const zeros = FACTORS.filter(factor => f[factor] === 0);

  return Object.freeze({
    write_id: write.write_id,
    author,
    checked_by: checked_by ?? null,
    factors: Object.freeze(f),
    P,
    alert: P === 0,
    alert_text: P === 0 ? 'ALERT CHAIRMAN' : null,
    zero_factors: Object.freeze(zeros),
    raises: Object.freeze(zeros.map(factor => Object.freeze({
      factor, meaning: FACTOR_MEANING[factor], raised_by: write.raises?.[factor] ?? null
    })))
  });
}

/** D_g = (writes with that factor = 0) ÷ (writes). */
export function driftIndex(writes) {
  const scored = writes.map(scoreWrite);
  const d = {};
  for (const factor of FACTORS) {
    d[factor] = scored.filter(s => s.factors[factor] === 0).length / scored.length;
  }
  return Object.freeze({
    writes: scored.length,
    alerts: scored.filter(s => s.alert).length,
    drift: Object.freeze(d),
    worst_gap: FACTORS.reduce((worst, factor) => (d[factor] > d[worst] ? factor : worst), 'H')
  });
}

/**
 * The two writes this lane has produced, scored honestly.
 * Every factor below is set from something checked, not from preference.
 */
export const LANE_WRITES = Object.freeze([
  Object.freeze({
    write_id: '97b534c',
    author: 'Claude',
    checked_by: null,
    H: 0, N: 1, L: 0, X: 0,
    evidence: Object.freeze({
      H: 'Written against sequence 581. The live custody head on 2026-09-21 was already 582 (max sequence_no before 2026-09-22). The commit carries no custody or ledger linkage.',
      N: 'Purely additive: 29 files added, 0 existing files modified. Nothing deleted.',
      L: 'Lineage to the Chairman directive text exists, but the work is NOT represented in the backend: 0 rows in thy_sequence_ledger, 0 in restart_records, 0 in thylora_store_product_readiness, 0 in thylora_store_release_gate, 0 in thylora_math_equation_registry.',
      X: 'No agent other than the author had checked it.'
    }),
    raises: Object.freeze({
      H: 'Rebase the lane onto the live head and record a custody/ledger linkage for it.',
      L: 'Register the work in the backend: a sequence-ledger row, a restart record, and store readiness/release-gate rows for THY-QYRIS-QUICKCHECK-001.',
      X: 'ChatGPT reviews the diff and the migration set.'
    })
  }),
  Object.freeze({
    write_id: 'WR-RECONCILE-667',
    author: 'Claude',
    checked_by: null,
    H: 1, N: 1, L: 0, X: 0,
    evidence: Object.freeze({
      H: 'Live custody head and ledger head both read as 667 from thylora-dash before writing. Sequence 666 confirmed verbatim_locked = false.',
      N: 'Additive only. Every superseded item retained with an explicit disposition; no option, test or finding deleted.',
      L: 'Traces to the Chairman packet and to live backend rows, but this work is still NOT represented in the backend: no custody row, no ledger row, no restart record, no store registry row.',
      X: 'ChatGPT has not reviewed this write. The author cannot set its own X.'
    }),
    raises: Object.freeze({
      L: 'Register this reconciliation in the backend (custody + ledger + restart), which is a backend write and is held.',
      X: 'ChatGPT verifies the identifiers and evidence listed in the workroom.'
    })
  })
]);
