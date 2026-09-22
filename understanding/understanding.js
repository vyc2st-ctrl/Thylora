// THYLORA · UNDERSTANDING TRANSFER GATE  (THY-WORK-UNDERSTANDING-TRANSFER-GATE-587)
//
//   U = K x E x C x X x T
//
//   K  KNOWLEDGE    what is actually known, stated plainly
//   E  EVIDENCE     what backs it, cited, with an evidence class
//   C  CONNECTIONS  what it joins to that the audience already holds
//   X  EXPLANATION  how it is shown - more than one representation
//   T  TRANSFER     proof the audience can now do something new
//
// The product is deliberate. An average would let a strong factor hide a
// missing one. A product cannot: if any factor is zero, U is zero, and the
// asset is not ready to go outward no matter how good the rest looks.
//
// Rule carried forward: CHILD / ADULT / SCHOLAR are NOT math display labels.
// FORBIDDEN_BAND_LABELS below is enforced by assertLabelsLegal() and by test.

export const FACTORS = ['K', 'E', 'C', 'X', 'T'];

export const FACTOR_NAMES = Object.freeze({
  K: 'KNOWLEDGE',
  E: 'EVIDENCE',
  C: 'CONNECTIONS',
  X: 'EXPLANATION',
  T: 'TRANSFER'
});

// Scores are integers 0..100 per factor. All gate arithmetic is integer.
export const SCORE_MAX = 100;

// Every factor must clear this floor on its own. A floor failure is named by
// factor, never rolled into one vague "not ready".
export const FACTOR_FLOOR = 20;

// U, expressed on the same 0..100 scale, must clear this to go outward.
export const RELEASE_THRESHOLD = 25;

// Band labels for the U scale. These describe the STATE OF TRANSFER, never a
// person and never an age. The three words below are refused by name.
export const FORBIDDEN_BAND_LABELS = Object.freeze(['CHILD', 'ADULT', 'SCHOLAR']);

export const BANDS = Object.freeze([
  { code: 'TRANSFERRED', min: 55, detail: 'The audience can do the new thing without the asset in front of them.' },
  { code: 'WORKING', min: 30, detail: 'Transfer happens with the asset present. It is not yet portable.' },
  { code: 'FRAGILE', min: 10, detail: 'Something lands, but one weak factor is carrying the rest.' },
  { code: 'NO_TRANSFER', min: 0, detail: 'Nothing reliably moves to the audience.' }
]);

export function assertLabelsLegal() {
  for (const band of BANDS) {
    if (FORBIDDEN_BAND_LABELS.includes(band.code)) {
      throw new Error(`FORBIDDEN_MATH_DISPLAY_LABEL: ${band.code}`);
    }
  }
  return true;
}

function clampScore(value) {
  if (!Number.isFinite(value)) return 0;
  const n = Math.round(value);
  if (n < 0) return 0;
  if (n > SCORE_MAX) return SCORE_MAX;
  return n;
}

/**
 * U on the 0..100 scale, computed by exact integer multiplication and rounded
 * once at the end. k*e*c*x*t has a maximum of 100^5 = 1e10, well inside the
 * safe integer range, so no intermediate float drift is possible.
 */
export function computeU({ K = 0, E = 0, C = 0, X = 0, T = 0 } = {}) {
  const k = clampScore(K), e = clampScore(E), c = clampScore(C);
  const x = clampScore(X), t = clampScore(T);
  const raw = k * e * c * x * t;              // 0 .. 100^5, exact
  const divisor = SCORE_MAX ** (FACTORS.length - 1); // 100^4
  return { factors: { K: k, E: e, C: c, X: x, T: t }, raw, u: Math.round(raw / divisor) };
}

export function bandFor(u) {
  for (const band of BANDS) if (u >= band.min) return band;
  return BANDS[BANDS.length - 1];
}

// ---------------------------------------------------------------------------
// Scoring an asset from its own contents, so the score is derived, not asserted
// ---------------------------------------------------------------------------

const EVIDENCE_CLASSES = Object.freeze({
  PRIMARY_RECORD: 100,
  MEASUREMENT: 95,
  OFFICIAL_PUBLICATION: 85,
  PEER_REVIEWED: 85,
  VENDOR_QUOTE: 70,
  SECONDARY_REPORT: 55,
  ORAL_HISTORY: 45,
  MODELLED_ESTIMATE: 35,
  UNSOURCED: 0
});

export function evidenceWeight(evidenceClass) {
  return EVIDENCE_CLASSES[evidenceClass] ?? 0;
}

export function scoreAsset(asset = {}) {
  const claims = asset.claims ?? [];
  const evidence = asset.evidence ?? [];
  const connections = asset.connections ?? [];
  const representations = asset.representations ?? [];
  const transfer = asset.transfer ?? null;

  // K - is the thing known, and is it stated as a claim someone can check?
  const K = claims.length === 0 ? 0 : Math.min(SCORE_MAX, 40 + claims.length * 20);

  // E - the weakest cited claim sets the evidence score. One uncited claim
  //     drags the whole asset, which is the intended behaviour.
  let E = 0;
  if (claims.length > 0) {
    const perClaim = claims.map((claim) => {
      const backing = evidence.filter((src) => (claim.evidence_ids ?? []).includes(src.id));
      if (backing.length === 0) return 0;
      return Math.max(...backing.map((src) => evidenceWeight(src.evidence_class)));
    });
    E = Math.min(...perClaim);
  }

  // C - connections to what the audience already holds
  const C = connections.length === 0 ? 0 : Math.min(SCORE_MAX, 35 + connections.length * 25);

  // X - representations. One representation is a telling, not an explaining.
  const distinct = new Set(representations.map((r) => r.mode));
  const X = distinct.size === 0 ? 0 : distinct.size === 1 ? 15 : Math.min(SCORE_MAX, 45 + distinct.size * 18);

  // T - a transfer test the audience performs, with a stated pass condition
  let T = 0;
  if (transfer && transfer.task && transfer.pass_condition) {
    T = transfer.observed_pass_rate === undefined
      ? 60                                   // designed, not yet measured
      : clampScore(transfer.observed_pass_rate * SCORE_MAX);
  }

  return computeU({ K, E, C, X, T });
}

// ---------------------------------------------------------------------------
// The gate. Returns EVERY blocker in one call, each with a route.
// ---------------------------------------------------------------------------

function blocker(code, factor, detail, route) {
  return { code, factor, detail, route };
}

export function understandingGate(asset = {}) {
  assertLabelsLegal();
  const blockers = [];

  if (!asset.audience) {
    blockers.push(blocker('AUDIENCE_MISSING', null,
      'No audience is named, so "what the audience learns" cannot be checked.',
      'Set asset.audience.'));
  }
  if (!asset.learning_statement) {
    blockers.push(blocker('LEARNING_STATEMENT_MISSING', null,
      'Every outward asset must show what the audience learns.',
      'Set asset.learning_statement, in the audience\'s own words.'));
  }

  const claims = asset.claims ?? [];
  const evidence = asset.evidence ?? [];
  if (claims.length === 0) {
    blockers.push(blocker('KNOWLEDGE_NOT_STATED', 'K',
      'No checkable claim is stated.', 'Add asset.claims[].'));
  }
  for (const claim of claims) {
    const ids = claim.evidence_ids ?? [];
    if (ids.length === 0) {
      blockers.push(blocker('CLAIM_UNCITED', 'E',
        `Claim "${claim.id ?? claim.text}" carries no evidence.`,
        'Add evidence and reference it from claim.evidence_ids.'));
      continue;
    }
    for (const id of ids) {
      const src = evidence.find((s) => s.id === id);
      if (!src) {
        blockers.push(blocker('EVIDENCE_REFERENCE_BROKEN', 'E',
          `Claim "${claim.id ?? claim.text}" cites missing evidence "${id}".`,
          'Add the evidence record or correct the reference.'));
      } else if (!src.evidence_class || evidenceWeight(src.evidence_class) === 0) {
        blockers.push(blocker('EVIDENCE_CLASS_UNSOUND', 'E',
          `Evidence "${id}" has no usable evidence class.`,
          `Set evidence_class to one of: ${Object.keys(EVIDENCE_CLASSES).join(', ')}.`));
      }
    }
  }

  if ((asset.connections ?? []).length === 0) {
    blockers.push(blocker('CONNECTIONS_MISSING', 'C',
      'Nothing joins this to what the audience already holds.',
      'Add asset.connections[] naming the prior knowledge each one hooks to.'));
  }

  const modes = new Set((asset.representations ?? []).map((r) => r.mode));
  if (modes.size === 0) {
    blockers.push(blocker('EXPLANATION_MISSING', 'X',
      'No representation is given.', 'Add asset.representations[].'));
  } else if (modes.size === 1) {
    blockers.push(blocker('SINGLE_REPRESENTATION', 'X',
      'One representation is a telling, not an explaining. A reader who does not think in that mode is left out.',
      'Add a second representation in a different mode.'));
  }

  const transfer = asset.transfer;
  if (!transfer || !transfer.task) {
    blockers.push(blocker('TRANSFER_TEST_MISSING', 'T',
      'Nothing proves the audience can now do something they could not do before.',
      'Add asset.transfer.task.'));
  } else if (!transfer.pass_condition) {
    blockers.push(blocker('TRANSFER_PASS_CONDITION_MISSING', 'T',
      'The transfer task has no stated pass condition, so it cannot be failed - and a test that cannot be failed is not evidence.',
      'Add asset.transfer.pass_condition.'));
  }

  const scored = scoreAsset(asset);
  for (const key of FACTORS) {
    if (scored.factors[key] < FACTOR_FLOOR) {
      blockers.push(blocker(`FACTOR_BELOW_FLOOR_${key}`, key,
        `${FACTOR_NAMES[key]} scored ${scored.factors[key]} of ${SCORE_MAX}, below the floor of ${FACTOR_FLOOR}.`,
        `Raise ${FACTOR_NAMES[key]} before release.`));
    }
  }
  if (scored.u < RELEASE_THRESHOLD) {
    blockers.push(blocker('UNDERSTANDING_BELOW_THRESHOLD', null,
      `U = ${scored.u} of ${SCORE_MAX}, below the release threshold of ${RELEASE_THRESHOLD}.`,
      'Raise the weakest factor first - the product punishes the weakest factor hardest.'));
  }

  return {
    ready: blockers.length === 0,
    factors: scored.factors,
    u: scored.u,
    band: bandFor(scored.u),
    learning_statement: asset.learning_statement ?? null,
    blockers
  };
}

/** The single weakest factor - where one unit of work buys the most U. */
export function weakestFactor(factors) {
  return FACTORS.reduce((worst, key) => (factors[key] < factors[worst] ? key : worst), FACTORS[0]);
}
