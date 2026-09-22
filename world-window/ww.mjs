// WORLD WINDOW GATE · WW = C × P × I × T × B × X
//
// Work code: THY-WORK-WORLD-SERIES-584
// Backend of record: thylora-dash (jvsdxhrfhtlgaknhjxlz)
//
// PREPARE, NOT GENERATE. This module evaluates whether a World Window packet is
// ready to be produced. It does not produce imagery and contains no generation
// call of any kind. A window that scores WW = 1 is cleared to be produced by a
// release-authorised session; it is not itself a produced window.
//
// FACTOR GLOSS PROVENANCE — read this before trusting the letters.
// The Chairman supplied the formula WW = C × P × I × T × B × X. The canonical
// expansion of each letter lives in the backend at sequence 584, which was NOT
// reachable from the authoring session (403 on CONNECT to the backend host).
// The glosses below are therefore SESSION-BOUND, derived only from rules already
// attested in committed source, and each carries the file that attests it. They
// are marked PROPOSED and must be reconciled against backend canon before any
// window is called cleared under Chairman authority.
//
//   C  CONTINUITY  the window does not move a floor or an authority
//                  attests: DASHBOARD_AUTHORITY.md, dashboard-baseline.json
//   P  PROVENANCE  every element traces to an attested source, none invented
//                  attests: db/rae-link/0003_rights_provenance_consent.sql
//   I  INTEGRITY   world media is labelled world media, never an Earth person
//                  attests: db/rae-link/0001_identity_channels.sql (world truth)
//   T  TRUTH       nothing claimed without evidence; UNKNOWN stays UNKNOWN
//                  attests: docs/THYLORA_BACKEND_PREACTION_GATE.md (truth rule)
//   B  BOUNDARY    rights, consent and privacy gates cleared before production
//                  attests: rae-link/lib/rights.js, docs/RAE-LINK-RIGHTS-PRIVACY.md
//   X  EXECUTION   no prerequisite is missing that this session could supply
//                  attests: db/rae-link/0009_functions.sql (publish gate shape)
//
// SCORING. Every criterion is PASS (1), FAIL (0) or HELD (0). A factor is the
// product of its criteria, so one failing criterion zeroes its factor, and one
// zeroed factor zeroes the window. The gate cannot be talked up: it can only be
// cleared by clearing every criterion. HELD scores 0 exactly like FAIL, because
// a window waiting on an authority is not a window that is ready.

export const FACTORS = ['C', 'P', 'I', 'T', 'B', 'X'];

export const FACTOR_GLOSS = Object.freeze({
  C: { name: 'CONTINUITY', question: 'Does producing this window move any floor, lock or authority?', attests: 'DASHBOARD_AUTHORITY.md · dashboard-baseline.json' },
  P: { name: 'PROVENANCE', question: 'Does every element in the window trace to an attested source?', attests: 'db/rae-link/0003_rights_provenance_consent.sql' },
  I: { name: 'INTEGRITY', question: 'Is world media labelled world media, and no Earth person implied?', attests: 'db/rae-link/0001_identity_channels.sql' },
  T: { name: 'TRUTH', question: 'Is every claim in the packet carried by evidence, with UNKNOWN left UNKNOWN?', attests: 'docs/THYLORA_BACKEND_PREACTION_GATE.md' },
  B: { name: 'BOUNDARY', question: 'Are rights, consent and privacy cleared before any production begins?', attests: 'rae-link/lib/rights.js · docs/RAE-LINK-RIGHTS-PRIVACY.md' },
  X: { name: 'EXECUTION', question: 'Is any missing prerequisite one this session could have supplied?', attests: 'db/rae-link/0009_functions.sql' },
});

export const STATES = Object.freeze({ PASS: 'PASS', FAIL: 'FAIL', HELD: 'HELD' });

const SCORE = Object.freeze({ PASS: 1, FAIL: 0, HELD: 0 });

/**
 * Score one criterion. Anything that is not an explicit PASS scores zero.
 */
export function scoreCriterion(criterion) {
  if (!criterion || typeof criterion !== 'object') {
    throw new TypeError('scoreCriterion requires a criterion object');
  }
  if (!(criterion.state in SCORE)) {
    throw new RangeError(`Unknown criterion state: ${String(criterion.state)}`);
  }
  return SCORE[criterion.state];
}

/**
 * Score one factor: the product of its criteria. A factor with no criteria
 * scores 0, not 1 — an unexamined factor is never a cleared factor.
 */
export function scoreFactor(criteria) {
  const list = Array.isArray(criteria) ? criteria : [];
  if (list.length === 0) return 0;
  return list.reduce((acc, c) => acc * scoreCriterion(c), 1);
}

/**
 * Evaluate a whole window packet against WW = C × P × I × T × B × X.
 *
 * Returns the per-factor scores, the product, the named blockers (each carrying
 * its route), and whether the window is cleared to be produced. `cleared` is
 * true only when WW === 1 AND the packet carries a complete QYRIS check.
 */
export function evaluateWindow(packet) {
  if (!packet || typeof packet !== 'object') {
    throw new TypeError('evaluateWindow requires a window packet');
  }

  const factors = {};
  const blockers = [];

  for (const letter of FACTORS) {
    const criteria = packet.factors?.[letter] ?? [];
    factors[letter] = scoreFactor(criteria);

    if (!Array.isArray(criteria) || criteria.length === 0) {
      blockers.push({
        factor: letter,
        code: `${letter}_NOT_EXAMINED`,
        detail: `Factor ${letter} (${FACTOR_GLOSS[letter].name}) carries no criteria. An unexamined factor scores zero.`,
        route: 'Author the criteria for this factor in world-window/windows.mjs.',
      });
      continue;
    }

    for (const c of criteria) {
      if (c.state !== STATES.PASS) {
        blockers.push({
          factor: letter,
          code: c.code,
          detail: c.detail,
          route: c.route,
          state: c.state,
        });
      }
    }
  }

  const ww = FACTORS.reduce((acc, letter) => acc * factors[letter], 1);
  const qyris = qyrisComplete(packet.qyris);

  if (!qyris.complete) {
    blockers.push({
      factor: 'QYRIS',
      code: 'QYRIS_INCOMPLETE',
      detail: `QYRIS check missing field(s): ${qyris.missing.join(', ')}.`,
      route: 'Complete the five QYRIS fields on the packet before requesting clearance.',
    });
  }

  return {
    window_code: packet.window_code,
    title: packet.title,
    factors,
    formula: `WW = ${FACTORS.map((l) => factors[l]).join(' × ')} = ${ww}`,
    ww,
    qyris_complete: qyris.complete,
    qyris_state: ww === 1 && qyris.complete ? 'PASS' : 'QYRIS HOLD',
    cleared: ww === 1 && qyris.complete,
    blockers,
  };
}

/**
 * A QYRIS check is complete only when all five fields carry text. The five
 * fields match the backend shape in thylora_qyris_work_item_checks:
 * Question (source_text), Yield (plain_meaning), Reason (why_it_matters),
 * Inspect (known / unknown / next_step / state), Safeguard (safeguard_findings).
 */
export function qyrisComplete(qyris) {
  const missing = [];
  const q = qyris ?? {};
  for (const field of ['question', 'yield', 'reason', 'safeguard']) {
    if (!q[field] || String(q[field]).trim() === '') missing.push(field);
  }
  const inspect = q.inspect ?? {};
  for (const field of ['known', 'unknown', 'next_step', 'state']) {
    if (!inspect[field] || String(inspect[field]).trim() === '') missing.push(`inspect.${field}`);
  }
  return { complete: missing.length === 0, missing };
}

/**
 * Evaluate every window in the series and report whether the series as a whole
 * holds. The series never reports a summary that is kinder than its worst
 * window: one held window holds the series.
 */
export function evaluateSeries(packets) {
  const windows = packets.map(evaluateWindow);
  return {
    windows,
    total: windows.length,
    cleared: windows.filter((w) => w.cleared).length,
    held: windows.filter((w) => !w.cleared).length,
    series_state: windows.every((w) => w.cleared) ? 'CLEARED' : 'QYRIS HOLD',
    all_blockers: windows.flatMap((w) => w.blockers.map((b) => ({ window_code: w.window_code, ...b }))),
  };
}
