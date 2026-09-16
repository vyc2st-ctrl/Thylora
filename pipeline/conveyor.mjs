/**
 * THYLORA product conveyor — the operating rule.
 *
 * The failure this exists to fix: ideas enter faster than products leave, and
 * when one product blocks, the whole line is treated as blocked. The conveyor
 * enforces the opposite:
 *
 *     BLOCK(P1) != STOP(P2, P3, ... Pn)
 *
 * It keeps at least MIN_PARALLEL_LANES products moving whenever that many
 * executable candidates exist, and it never advances a product past a gate it
 * has not actually cleared.
 */

import { RELEASE_GATES, actionsRemaining, exactBlocker, moneyBand, resolveStage } from './stages.mjs';

export const MIN_PARALLEL_LANES = 3;

/**
 * A blocker is either something THYLORA can execute unattended, or something
 * that genuinely requires a person or an external party. Only the second kind
 * is allowed to stop a lane. Misclassifying the first kind as the second is how
 * the line stalled in the first place.
 */
export const GATE_CLASS = {
  // THYLORA can do these now, without anyone being asked for anything.
  spec_complete: 'EXECUTABLE',
  safety_reviewed: 'EXECUTABLE',
  source_complete: 'EXECUTABLE',
  final_artifact_complete: 'EXECUTABLE',
  product_specific_visual_complete: 'EXECUTABLE',
  visual_preflight_passed: 'EXECUTABLE',
  cost_recorded: 'EXECUTABLE',
  store_listing_exists: 'EXECUTABLE',

  // These need a named human decision, a credential, a counterparty or money.
  rights_passed: 'CHAIRMAN_OR_LEGAL',
  price_configured: 'CHAIRMAN_GATE',
  delivery_connected: 'CREDENTIALED',
  reaccess_verified: 'CREDENTIALED',
  checkout_path_verified: 'CREDENTIALED',
  mobile_preview_passed: 'PHYSICAL_DEVICE',
  listing_active: 'CHAIRMAN_GATE',
  external_purchase_witnessed: 'EXTERNAL_CUSTOMER',
};

export const EXECUTABLE = 'EXECUTABLE';

export function isExecutable(gateKey) {
  return GATE_CLASS[gateKey] === EXECUTABLE;
}

/**
 * Score a single candidate into the row shape the Chairman asked for.
 * Everything here is derived from evidence the caller supplies; this function
 * invents nothing.
 */
export function scoreCandidate(candidate) {
  const gates = candidate.gates ?? {};
  const stage = resolveStage(gates);
  const remaining = actionsRemaining(gates);
  const blocker = exactBlocker(gates);

  return {
    canonical_id: candidate.canonical_id,
    parent_source: candidate.parent_source ?? null,
    title: candidate.title,
    product_type: candidate.product_type ?? null,
    department_owner: candidate.department_owner ?? null,
    production_lead: candidate.production_lead ?? null,

    stage: stage.code,
    stage_ordinal: stage.ordinal,

    exact_blocker: blocker,
    blocker_class: blocker ? GATE_CLASS[blocker] ?? 'UNCLASSIFIED' : null,
    next_executable_action: candidate.next_action ?? null,

    assets_required: candidate.assets_required ?? [],
    rights_state: gates.rights_passed === true ? 'PASSED' : candidate.rights_state ?? 'UNVERIFIED',
    price_state: gates.price_configured === true ? 'CONFIGURED' : candidate.price_state ?? 'PENDING',
    store_state: candidate.store_state ?? (gates.listing_active === true ? 'ACTIVE' : 'NOT_LISTED'),
    serial_provenance_state: candidate.serial_provenance_state ?? 'UNRECORDED',

    actions_remaining_to_store: remaining,
    money_distance: remaining,
    money_band: moneyBand(remaining),

    lane_movable: blocker !== null && isExecutable(blocker),
  };
}

/**
 * Where the leverage is. When several candidates are stopped by the same exact
 * gate, clearing that gate once advances all of them. Ranking work by this
 * instead of by product order is the difference between moving one product and
 * moving seven.
 */
export function sharedBlockers(rows) {
  const byBlocker = new Map();
  for (const row of rows) {
    if (!row.exact_blocker) continue;
    if (!byBlocker.has(row.exact_blocker)) byBlocker.set(row.exact_blocker, []);
    byBlocker.get(row.exact_blocker).push(row.canonical_id);
  }
  return [...byBlocker.entries()]
    .map(([gate, ids]) => ({
      gate,
      gate_class: GATE_CLASS[gate] ?? 'UNCLASSIFIED',
      unblocks_count: ids.length,
      unblocks: ids,
    }))
    .filter((e) => e.unblocks_count > 1)
    .sort((a, b) => b.unblocks_count - a.unblocks_count);
}

/**
 * Select the lanes to run. Candidates closest to money go first, but a blocked
 * candidate never consumes a lane — the next executable one takes its place.
 * This is the enforcement point for BLOCK(P1) != STOP(P2..Pn).
 */
export function selectLanes(rows, minLanes = MIN_PARALLEL_LANES) {
  const movable = rows
    .filter((r) => r.lane_movable)
    .sort((a, b) => a.money_distance - b.money_distance || a.canonical_id.localeCompare(b.canonical_id));

  const held = rows
    .filter((r) => !r.lane_movable)
    .sort((a, b) => a.money_distance - b.money_distance || a.canonical_id.localeCompare(b.canonical_id));

  const unfinished = rows.filter((r) => r.stage !== 'PUBLISHED').length;

  return {
    running: movable.slice(0, Math.max(minLanes, 0)),
    queued: movable.slice(Math.max(minLanes, 0)),
    held,
    // Met only when the line is genuinely running at target, or when there is
    // no unfinished work left. An empty executable supply while products remain
    // unshipped is the alarm condition, not a pass.
    lane_target_met: unfinished === 0 || movable.length >= minLanes,
    executable_supply: movable.length,
    unfinished_count: unfinished,
    all_lanes_held: unfinished > 0 && movable.length === 0,
  };
}

/**
 * Full conveyor pass. Returns exactly the seven things the directive asks the
 * run to report, minus `advanced` which only a real run can fill in.
 */
export function runConveyor(candidates, { minLanes = MIN_PARALLEL_LANES } = {}) {
  const rows = candidates.map(scoreCandidate);
  const lanes = selectLanes(rows, minLanes);

  return {
    generated_at: new Date().toISOString(),
    candidate_count: rows.length,
    candidates: rows.sort((a, b) => a.money_distance - b.money_distance),
    lanes,
    leverage: sharedBlockers(rows),
    published_count: rows.filter((r) => r.stage === 'PUBLISHED').length,
    gate_keys: RELEASE_GATES,
  };
}
