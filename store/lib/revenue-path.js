// STORE · revenue-path priority — implementation of MATH-REVENUE-PATH-PRIORITY-662
// Workroom: WR-RECONCILE-667
//
// BACKEND-FIRST. MATH-REVENUE-PATH-PRIORITY-662 is ACTIVE in the live backend
// (thylora_math_equation_registry, layer Earth), read 2026-10-05 from thylora-dash:
//
//   R_p = (N × F × W × E) / (C × T)
//   "Do first what people need often, will pay for, and we can finish fast and cheap."
//
// THE HONESTY CONSTRAINT THAT MAKES THIS FILE WORTH HAVING
// N, F, W and E are claims about people. C and T are claims about our own work.
// We have evidence for the second pair and none for the first. A single number
// that mixes them reads as market evidence when it is mostly a guess about
// strangers. So every factor carries an evidence class, and a ranking computed
// with an unevidenced factor is refused the label MARKET_EVIDENCED. It is
// returned as COMPLETION_RANKED instead, which is what it actually is.

export const EVIDENCE_CLASSES = Object.freeze(['OBSERVED', 'REPORTED', 'ASSUMED', 'UNKNOWN']);

/** Factors about people. We hold no sales, no survey, no waitlist for any product. */
export const DEMAND_FACTORS = Object.freeze(['N', 'F', 'W', 'E']);
/** Factors about our own work. These we can measure. */
export const SUPPLY_FACTORS = Object.freeze(['C', 'T']);

function factor(value, evidence, note) {
  if (!EVIDENCE_CLASSES.includes(evidence)) throw new RangeError(`unknown evidence class ${evidence}`);
  if (evidence !== 'UNKNOWN' && !(Number(value) > 0)) {
    throw new RangeError('an evidenced factor must carry a positive value');
  }
  return Object.freeze({ value: evidence === 'UNKNOWN' ? null : Number(value), evidence, note });
}
export { factor };

/**
 * Rank candidates under 662, and say plainly which kind of ranking it is.
 *
 * MARKET_EVIDENCED   — every demand factor is OBSERVED or REPORTED.
 * COMPLETION_RANKED  — at least one demand factor is ASSUMED or UNKNOWN. The
 *                      order reflects what we can finish fast and cheap, and
 *                      must not be presented as what people will pay for.
 */
export function rankRevenuePaths(candidates) {
  const scored = candidates.map(candidate => {
    const f = candidate.factors;
    const unevidenced = [...DEMAND_FACTORS, ...SUPPLY_FACTORS]
      .filter(k => f[k].evidence === 'ASSUMED' || f[k].evidence === 'UNKNOWN');
    const demandUnevidenced = DEMAND_FACTORS
      .filter(k => f[k].evidence === 'ASSUMED' || f[k].evidence === 'UNKNOWN');

    const computable = [...DEMAND_FACTORS, ...SUPPLY_FACTORS].every(k => f[k].value !== null);
    const rp = computable
      ? (f.N.value * f.F.value * f.W.value * f.E.value) / (f.C.value * f.T.value)
      : null;

    // Supply-only score: what we can finish fast and cheap. Always computable.
    const completion = f.C.value !== null && f.T.value !== null ? 1 / (f.C.value * f.T.value) : null;

    return Object.freeze({
      product_code: candidate.product_code,
      title: candidate.title,
      R_p: rp,
      completion_score: completion,
      unevidenced_factors: Object.freeze(unevidenced),
      demand_unevidenced: Object.freeze(demandUnevidenced),
      willingness_to_pay_evidence: f.W.evidence,
      note: candidate.note ?? null
    });
  });

  const anyDemandUnevidenced = scored.some(s => s.demand_unevidenced.length > 0);
  const basis = anyDemandUnevidenced ? 'COMPLETION_RANKED' : 'MARKET_EVIDENCED';
  const key = anyDemandUnevidenced ? 'completion_score' : 'R_p';

  const order = [...scored].sort((a, b) => (b[key] ?? -Infinity) - (a[key] ?? -Infinity));

  return Object.freeze({
    equation: 'MATH-REVENUE-PATH-PRIORITY-662',
    basis,
    basis_meaning: anyDemandUnevidenced
      ? 'Ordered by what we can finish fast and cheap. This is NOT evidence of what anyone will pay.'
      : 'Every demand factor is evidenced. This order reflects measured demand.',
    market_validated: false_if(anyDemandUnevidenced),
    ranked: Object.freeze(order.map((s, i) => Object.freeze({ rank: i + 1, ...s })))
  });
}

// A ranking is only ever market-validated when nothing about people was assumed.
function false_if(anyUnevidenced) { return anyUnevidenced ? false : null; }

/**
 * The three store instruments, with every factor's evidence class stated.
 * W is UNKNOWN for all three: no sale, survey, waitlist or price test exists.
 */
export const STORE_CANDIDATES = Object.freeze([
  Object.freeze({
    product_code: 'THY-QYRIS-QUICKCHECK-001',
    title: 'QYRIS QuickCheck',
    note: 'Complete. 14 pages, verdict engine, 19 tests. Only remaining work is Chairman preview.',
    factors: Object.freeze({
      N: factor(null, 'UNKNOWN', 'How many people need a decision check. No audience measurement exists.'),
      F: factor(null, 'UNKNOWN', 'How often. No usage data exists.'),
      W: factor(null, 'UNKNOWN', 'Willingness to pay. No sale, survey, waitlist or price test has been run.'),
      E: factor(null, 'UNKNOWN', 'Ease of reaching buyers. No channel is connected.'),
      C: factor(1, 'OBSERVED', 'Cost to complete: the work is done. Lowest of the three.'),
      T: factor(1, 'OBSERVED', 'Time to complete: Chairman preview only.')
    })
  }),
  Object.freeze({
    product_code: 'THY-BEFORE-YOU-BUY-001',
    title: 'Before You Buy',
    note: 'Mechanism locked, 12-page map drafted, wait table specified. Design and implementation remain.',
    factors: Object.freeze({
      N: factor(null, 'UNKNOWN', 'No audience measurement exists.'),
      F: factor(null, 'UNKNOWN', 'No usage data exists.'),
      W: factor(null, 'UNKNOWN', 'No sale, survey, waitlist or price test has been run.'),
      E: factor(null, 'UNKNOWN', 'No channel is connected.'),
      C: factor(3, 'OBSERVED', 'Design, implementation and tests remain; the wait table is already specified.'),
      T: factor(3, 'OBSERVED', 'Longest page map of the three (12 pages), but the readout is fully specified.')
    })
  }),
  Object.freeze({
    product_code: 'THY-STUCK-LOOP-RESET-001',
    title: 'Stuck Loop Reset',
    note: 'Mechanism locked, 10-page map drafted. Design and implementation remain.',
    factors: Object.freeze({
      N: factor(null, 'UNKNOWN', 'No audience measurement exists.'),
      F: factor(null, 'UNKNOWN', 'No usage data exists.'),
      W: factor(null, 'UNKNOWN', 'No sale, survey, waitlist or price test has been run.'),
      E: factor(null, 'UNKNOWN', 'No channel is connected.'),
      C: factor(4, 'OBSERVED', 'Design and implementation remain, and the fourth readout state needs care.'),
      T: factor(4, 'OBSERVED', 'Shorter page map than Before You Buy, but the hand-off to QuickCheck is unbuilt.')
    })
  })
]);

/**
 * The price proposal, carried with its evidence class so it cannot be quoted as
 * a validated price. $14 / $34 is a PROPOSAL and nothing more.
 */
export const PRICE_PROPOSAL = Object.freeze({
  product_code: 'THY-QYRIS-QUICKCHECK-001',
  single: 14,
  working_set: 34,
  currency: 'USD',
  state: 'PROPOSAL',
  market_validated: false,
  willingness_to_pay_evidence: 'UNKNOWN',
  evidence_held: Object.freeze([]),
  what_would_validate_it: Object.freeze([
    'One real sale at the asked price.',
    'A price test across at least two prices with the same offer.',
    'A waitlist that converts, or a refund rate once sales exist.'
  ]),
  note: 'No sale, survey, waitlist or price test has been run. The number is reasoned, not evidenced.'
});
