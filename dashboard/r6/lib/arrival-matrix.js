// THYLORA Dashboard R6 · Global Arrival Matrix
// Canonical backend record: THY-IDEA-DASHBOARD-SCREEN-ARCHITECTURE-001
//
// The matrix answers one question per cell: has THYLORA actually arrived in this
// territory, in this lane, and what proves it.
//
// "Arrived" is a high bar on purpose. A plan to serve a territory is not
// arrival. A page that renders in a territory is not arrival. SERVING means
// something was delivered to someone there and a record exists.
//
// Every state above ABSENT requires an evidence reference. A cell asserted LIVE
// with nothing behind it is reported as UNPROVEN rather than shown as LIVE — the
// matrix is a proof surface, not a map of intentions.

export const ARRIVAL_STATES = Object.freeze({
  ABSENT: 'ABSENT',           // nothing here, and nothing claimed
  REGISTERED: 'REGISTERED',   // a record exists naming this territory
  LIVE: 'LIVE',               // reachable and operating
  SERVING: 'SERVING',         // has delivered to a person there, evidenced
  BLOCKED: 'BLOCKED',         // cannot proceed; reason required
  UNPROVEN: 'UNPROVEN',       // claimed above ABSENT with no evidence
  UNKNOWN: 'UNKNOWN'          // backend did not answer for this cell
});

export const ARRIVAL_RANK = Object.freeze({
  [ARRIVAL_STATES.ABSENT]: 0,
  [ARRIVAL_STATES.UNKNOWN]: 0,
  [ARRIVAL_STATES.UNPROVEN]: 1,
  [ARRIVAL_STATES.BLOCKED]: 1,
  [ARRIVAL_STATES.REGISTERED]: 2,
  [ARRIVAL_STATES.LIVE]: 3,
  [ARRIVAL_STATES.SERVING]: 4
});

/** The lanes THYLORA can arrive through. */
export const ARRIVAL_LANES = Object.freeze([
  { code: 'STOREFRONT', label: 'Storefront' },
  { code: 'PRODUCT', label: 'Product delivery' },
  { code: 'MEDIA', label: 'RAE Link media' },
  { code: 'PAYMENT', label: 'Payment acceptance' },
  { code: 'SUPPORT', label: 'Chairman support' }
]);

const needsEvidence = new Set([
  ARRIVAL_STATES.REGISTERED, ARRIVAL_STATES.LIVE, ARRIVAL_STATES.SERVING
]);

/**
 * Grade one cell. A claim without evidence is downgraded to UNPROVEN here, once,
 * so no renderer downstream has to remember to do it.
 */
export function gradeCell(cell = {}) {
  const claimed = cell.state || ARRIVAL_STATES.UNKNOWN;
  const evidence = cell.evidence_id ?? null;
  if (claimed === ARRIVAL_STATES.BLOCKED) {
    return {
      state: ARRIVAL_STATES.BLOCKED,
      evidence_id: evidence,
      reason: cell.reason || 'Blocked without a stated reason — reason required.',
      proven: false
    };
  }
  if (needsEvidence.has(claimed) && !evidence) {
    return {
      state: ARRIVAL_STATES.UNPROVEN,
      evidence_id: null,
      reason: `Claimed ${claimed} with no evidence record.`,
      proven: false
    };
  }
  return {
    state: claimed,
    evidence_id: evidence,
    reason: cell.reason || null,
    proven: needsEvidence.has(claimed)
  };
}

/**
 * Build the matrix from territory rows.
 * Territories the backend did not answer for are kept and marked UNKNOWN rather
 * than dropped, so the matrix never shrinks quietly.
 */
export function buildMatrix(territories = [], lanes = ARRIVAL_LANES) {
  const rows = territories.map(territory => {
    const cells = lanes.map(lane => {
      const raw = (territory.lanes || {})[lane.code];
      const graded = gradeCell(raw || { state: ARRIVAL_STATES.UNKNOWN });
      return { lane: lane.code, lane_label: lane.label, ...graded };
    });
    const best = cells.reduce((acc, c) => Math.max(acc, ARRIVAL_RANK[c.state] ?? 0), 0);
    return {
      territory_code: territory.code || territory.territory_code || '??',
      territory: territory.name || territory.label || territory.code || 'Territory',
      region: territory.region || null,
      cells,
      arrival_rank: best,
      arrived: best >= ARRIVAL_RANK[ARRIVAL_STATES.LIVE],
      serving: cells.some(c => c.state === ARRIVAL_STATES.SERVING),
      unproven: cells.filter(c => c.state === ARRIVAL_STATES.UNPROVEN).length,
      blocked: cells.filter(c => c.state === ARRIVAL_STATES.BLOCKED).length
    };
  });
  return { lanes, rows, summary: summarise(rows) };
}

export function summarise(rows = []) {
  const serving = rows.filter(r => r.serving).length;
  const arrived = rows.filter(r => r.arrived).length;
  const unproven = rows.reduce((n, r) => n + r.unproven, 0);
  const blocked = rows.reduce((n, r) => n + r.blocked, 0);
  return {
    territories: rows.length,
    serving,
    arrived,
    unproven_cells: unproven,
    blocked_cells: blocked,
    statement: rows.length === 0
      ? 'No territory records returned. Arrival cannot be claimed from an empty matrix.'
      : `${serving} territory(ies) serving, ${arrived} arrived, ${unproven} unproven cell(s), ${blocked} blocked.`
  };
}

/** The honest headline: what is claimed versus what is evidenced. */
export function proofGap(matrix) {
  const rows = matrix?.rows || [];
  const cells = rows.flatMap(r => r.cells.map(c => ({ ...c, territory: r.territory })));
  const proven = cells.filter(c => c.proven).length;
  const claimedUnproven = cells.filter(c => c.state === ARRIVAL_STATES.UNPROVEN);
  return {
    total_cells: cells.length,
    proven,
    unproven: claimedUnproven.length,
    unproven_list: claimedUnproven.map(c => `${c.territory} · ${c.lane_label}`),
    statement: claimedUnproven.length === 0
      ? `Every non-empty cell carries evidence (${proven} proven).`
      : `${claimedUnproven.length} cell(s) claim arrival with no evidence record.`
  };
}
