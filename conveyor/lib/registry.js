// CONVEYOR · registry load, field contract and readback
// Workroom: WR-CONVEYOR-001
//
// The directive names the fields every item must ALWAYS expose. That list is
// enforced here as a contract rather than trusted to discipline: an item missing
// any of them fails validation and the conveyor refuses to report on it.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { project, scheduleAllLanes, laneSummary, moneyNext, chairmanGates, LANE_KEYS } from './lanes.js';
import { STAGES } from './stages.js';
import { verifySerial, verifyProvenance } from './serial.js';

const here = dirname(fileURLToPath(import.meta.url));
export const REGISTRY_PATH = join(here, '..', 'registry', 'conveyor-registry.json');

/** Every field the directive requires an item to expose, at all times. */
export const REQUIRED_EXPOSED_FIELDS = Object.freeze([
  'canonical_id', 'source_parent', 'owner_department', 'responsible_person',
  'stage', 'blocker', 'next_action', 'actions_remaining', 'rights_state',
  'provenance_state', 'serial_state', 'qr_state', 'cost_state', 'price_state',
  'storefront_state', 'money_distance', 'last_advanced_at'
]);

export function loadRegistry(path = REGISTRY_PATH) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

/**
 * Validate the registry. Returns every problem found rather than throwing on the
 * first, so one malformed item does not hide the other twenty.
 */
export function validateRegistry(registry) {
  const problems = [];
  const seen = new Set();
  for (const item of registry.items) {
    const id = item.canonical_id ?? '(no canonical_id)';
    if (seen.has(id)) problems.push({ id, problem: 'DUPLICATE_CANONICAL_ID' });
    seen.add(id);
    if (!STAGES.includes(item.stage)) problems.push({ id, problem: 'UNKNOWN_STAGE', detail: item.stage });
    if (!LANE_KEYS.includes(item.lane)) problems.push({ id, problem: 'UNKNOWN_LANE', detail: item.lane });
    if (!item.continuity_evidence) problems.push({ id, problem: 'NO_CONTINUITY_EVIDENCE' });
    if (item.continuity_state === 'VERIFIED_IN_REPO' && /NONE REACHABLE/.test(item.continuity_evidence ?? '')) {
      problems.push({ id, problem: 'VERIFIED_CLAIM_WITHOUT_EVIDENCE' });
    }
    // A state claim must be backed by a concrete value on the item. "Serialized"
    // with no serial, or "recorded" with no chain, is an assertion, and an
    // assertion is what this conveyor exists to refuse.
    if (item.serial_state === 'ISSUED') {
      if (!item.serial) problems.push({ id, problem: 'SERIAL_CLAIMED_WITHOUT_VALUE' });
      else if (!verifySerial(item.serial).valid) problems.push({ id, problem: 'SERIAL_INVALID', detail: verifySerial(item.serial).reason });
    }
    if (item.qr_state === 'BOUND' && !item.qr_payload) problems.push({ id, problem: 'QR_CLAIMED_WITHOUT_PAYLOAD' });
    if (item.provenance_state === 'RECORDED') {
      const chain = item.provenance_chain;
      if (!Array.isArray(chain) || chain.length === 0) problems.push({ id, problem: 'PROVENANCE_CLAIMED_WITHOUT_CHAIN' });
      else if (!verifyProvenance(chain).valid) problems.push({ id, problem: 'PROVENANCE_CHAIN_INVALID', detail: verifyProvenance(chain).reason });
    }
    if (item.price_state === 'SET' && !item.price_evidence) problems.push({ id, problem: 'PRICE_CLAIMED_WITHOUT_EVIDENCE' });
    if (item.storefront_state === 'LISTED' && !item.storefront_evidence) problems.push({ id, problem: 'LISTING_CLAIMED_WITHOUT_EVIDENCE' });
    if (item.checkout_path_state === 'VERIFIED' && !item.checkout_evidence) problems.push({ id, problem: 'CHECKOUT_CLAIMED_WITHOUT_EVIDENCE' });
    if (item.readback_state === 'CONFIRMED' && !item.readback_evidence) problems.push({ id, problem: 'READBACK_CLAIMED_WITHOUT_EVIDENCE' });

    let projected;
    try { projected = project(item); } catch (e) { problems.push({ id, problem: 'PROJECTION_FAILED', detail: e.message }); continue; }
    for (const field of REQUIRED_EXPOSED_FIELDS) {
      if (!(field in projected)) problems.push({ id, problem: 'FIELD_NOT_EXPOSED', detail: field });
    }
  }
  return { valid: problems.length === 0, problems, item_count: registry.items.length };
}

/** The whole board, in one object, for readback and for the surface to render. */
export function board(registry) {
  const items = registry.items;
  const schedule = scheduleAllLanes(items);
  return {
    registry_id: registry.registry_id,
    generated_at: new Date().toISOString(),
    item_count: items.length,
    lanes: laneSummary(items),
    executable_now: schedule.work,
    idle_lanes: schedule.idle,
    money_next: moneyNext(items),
    chairman_gates: chairmanGates(items),
    items: items.map(project)
  };
}
