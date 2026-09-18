// THYLORA WORLD · the Wq execution gate
// Workroom: WR-WORLD-CASTLE-001
//
//   Wq = G x A x O x P x T x C x H x I x B x R x V
//   Any factor = 0 => HOLD.
//
// IMPORTANT — the eleven factor letters are named in the Chairman directive but
// their bindings are NOT present in any backend row or repository file readable
// by the authoring session. This module therefore does two separate things and
// keeps them separate:
//
//   1. It evaluates the product honestly over whatever bindings it is given.
//   2. It ships a PROPOSED binding table, clearly marked non-canon, for
//      Chairman selection. `evaluate` refuses to treat the proposed bindings as
//      canon unless the caller passes `{ accept_proposed_bindings: true }`, and
//      it says so in its own output either way.
//
// The gate is multiplicative on purpose: a single zero is not outvoted by ten
// strong factors. That is the same shape as the backend's own priority formula,
// where Readiness is a multiplicand and a zero cannot be argued away.

export const BINDING_STATE = 'PROPOSED_NOT_CANON';

/** PROPOSED ONLY. Not canon. Offered for Chairman confirmation or replacement. */
export const PROPOSED_FACTOR_BINDINGS = Object.freeze([
  { letter: 'G', proposed_name: 'Geometry',      proposed_test: 'A readable survey source yields at least one measured dimension.' },
  { letter: 'A', proposed_name: 'Architecture',  proposed_test: 'Every visible element resolves to a registry row with a parent.' },
  { letter: 'O', proposed_name: 'Origin',        proposed_test: 'The origin rule resolves to a located point in the castle frame.' },
  { letter: 'P', proposed_name: 'Period',        proposed_test: 'The single historical period of this scene is identified.' },
  { letter: 'T', proposed_name: 'Topology',      proposed_test: 'Room and space connectivity closes: every opening has a space.' },
  { letter: 'C', proposed_name: 'Circulation',   proposed_test: 'Each traveller class has at least one PASS route to its destination.' },
  { letter: 'H', proposed_name: 'Heights',       proposed_test: 'Storey and elevation datum offsets are established.' },
  { letter: 'I', proposed_name: 'Identity',      proposed_test: 'The castle has a verified canonical name.' },
  { letter: 'B', proposed_name: 'Barrier',       proposed_test: 'No element resolves into a frame outside this world lineage.' },
  { letter: 'R', proposed_name: 'Rooms',         proposed_test: 'Every visible window and door has a registered room behind it.' },
  { letter: 'V', proposed_name: 'Verification',  proposed_test: 'The written state has been read back and matches what was written.' }
]);

export const FACTOR_LETTERS = Object.freeze(PROPOSED_FACTOR_BINDINGS.map(b => b.letter));

export class GateError extends Error {
  constructor(message, { code = 'GATE_ERROR' } = {}) { super(message); this.name = 'GateError'; this.code = code; }
}

/**
 * @param factors {Object} letter -> { value: 0|1, basis: string }
 * @param opts {{ accept_proposed_bindings?: boolean }}
 */
export function evaluate(factors, opts = {}) {
  const missing = FACTOR_LETTERS.filter(l => !(l in factors));
  if (missing.length) {
    throw new GateError(`Wq is missing factor(s): ${missing.join(', ')}`, { code: 'FACTOR_MISSING' });
  }
  const rows = FACTOR_LETTERS.map(letter => {
    const f = factors[letter];
    if (!f || typeof f.value !== 'number' || ![0, 1].includes(f.value)) {
      throw new GateError(`factor ${letter} must carry a value of 0 or 1`, { code: 'FACTOR_VALUE_INVALID' });
    }
    if (!f.basis) throw new GateError(`factor ${letter} carries no basis`, { code: 'FACTOR_BASIS_REQUIRED' });
    return { letter, value: f.value, basis: f.basis };
  });

  const zeros = rows.filter(r => r.value === 0);
  const wq = rows.reduce((acc, r) => acc * r.value, 1);
  const decision = wq === 0 ? 'HOLD' : 'PROCEED';

  return Object.freeze({
    wq, decision,
    zero_factors: zeros.map(z => ({ letter: z.letter, basis: z.basis })),
    factors: rows,
    binding_state: opts.accept_proposed_bindings ? 'PROPOSED_ACCEPTED_BY_CALLER' : BINDING_STATE,
    binding_caution: opts.accept_proposed_bindings
      ? 'The caller accepted the PROPOSED factor bindings for this evaluation. They remain non-canon until the Chairman confirms them.'
      : 'The factor letters are evaluated as supplied. Their meanings are NOT established in backend canon; see PROPOSED_FACTOR_BINDINGS.',
    statement: decision === 'HOLD'
      ? `HOLD. ${zeros.length} factor(s) evaluate to zero: ${zeros.map(z => z.letter).join(', ')}.`
      : 'PROCEED. Every supplied factor evaluates to one.'
  });
}
