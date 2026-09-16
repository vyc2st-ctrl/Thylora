// CONVEYOR · stage machine and advancement gates
// Workroom: WR-CONVEYOR-001
//
// CAPTURE -> CLASSIFY -> ASSIGN -> PRODUCE -> VERIFY -> PRODUCTIZE -> PRICE
// -> STORE -> RELEASE -> MEASURE -> IMPROVE
//
// Every Chairman-originated idea enters at CAPTURE and never leaves the belt.
// IMPROVE is not an end state: it returns the item to PRODUCE as a new version,
// so an item that has shipped keeps advancing instead of going quiet.
//
// Two rules are enforced here rather than remembered:
//   1. A gate reports EVERY unmet requirement at once, each naming its route.
//   2. Every blocker declares its authority. BUILD blockers are ours to clear.
//      CHAIRMAN blockers are not, and an item parked on one may not stall any
//      other item. BLOCK(X) != BLOCK(Y) is implemented in lanes.js on top of it.

export const STAGES = Object.freeze([
  'CAPTURE', 'CLASSIFY', 'ASSIGN', 'PRODUCE', 'VERIFY',
  'PRODUCTIZE', 'PRICE', 'STORE', 'RELEASE', 'MEASURE', 'IMPROVE'
]);

export const AUTHORITY = Object.freeze({ BUILD: 'BUILD', CHAIRMAN: 'CHAIRMAN' });

// IMPROVE feeds back to PRODUCE. Nothing else skips forward.
const NEXT = Object.freeze({
  CAPTURE: 'CLASSIFY', CLASSIFY: 'ASSIGN', ASSIGN: 'PRODUCE', PRODUCE: 'VERIFY',
  VERIFY: 'PRODUCTIZE', PRODUCTIZE: 'PRICE', PRICE: 'STORE', STORE: 'RELEASE',
  RELEASE: 'MEASURE', MEASURE: 'IMPROVE', IMPROVE: 'PRODUCE'
});

export function nextStage(stage) {
  return NEXT[stage] ?? null;
}

export function canTransition(from, to) {
  return NEXT[from] === to;
}

export function stageIndex(stage) {
  return STAGES.indexOf(stage);
}

// The stage at which an item first has something a customer could buy. Money
// distance is measured to the far side of RELEASE, not to PRODUCTIZE: a product
// record with no cleared purchase path has not reached money.
export const MONEY_STAGE = 'RELEASE';

const req = (code, detail, route, authority) => ({ code, detail, route, authority });

// Preconditions hold at EVERY stage, not just the one they were first noticed at.
// An item named by a directive but not found in reachable continuity is captured,
// not invented -- and it must not become producible merely by being recorded at a
// later stage. It advances only once the Chairman confirms the record it descends
// from.
const PRECONDITIONS = item => {
  const out = [];
  if (item.continuity_state === 'UNVERIFIED_IN_REPO') {
    out.push(req('CONTINUITY_UNVERIFIED', 'Named in the directive but no matching record was reachable; confirm the source record before this advances.', 'capture', AUTHORITY.CHAIRMAN));
  }
  return out;
};

// Each stage's exit conditions. A stage is cleared only when every condition it
// owns is satisfied by a field on the item — never by a comment or an assertion.
const EXIT = Object.freeze({
  CAPTURE: item => {
    const out = [];
    if (!item.canonical_id) out.push(req('CANONICAL_ID_MISSING', 'Item has no canonical ID.', 'capture', AUTHORITY.BUILD));
    if (!item.title) out.push(req('TITLE_MISSING', 'Item has no title.', 'capture', AUTHORITY.BUILD));
    if (!item.source_parent) out.push(req('SOURCE_PARENT_MISSING', 'Item does not name the idea or record it came from.', 'capture', AUTHORITY.BUILD));
    return out;
  },
  CLASSIFY: item => {
    const out = [];
    if (!item.lane) out.push(req('LANE_MISSING', 'Item is not assigned to a production lane.', 'classify', AUTHORITY.BUILD));
    if (!item.item_kind) out.push(req('KIND_MISSING', 'Item kind is not declared.', 'classify', AUTHORITY.BUILD));
    if (!item.world_class) out.push(req('WORLD_CLASS_MISSING', 'Item is not declared EARTH_REAL or WORLD_SIMULATED.', 'classify', AUTHORITY.BUILD));
    return out;
  },
  ASSIGN: item => {
    const out = [];
    if (!item.owner_department) out.push(req('OWNER_DEPARTMENT_MISSING', 'No owning department.', 'assign', AUTHORITY.BUILD));
    if (!item.responsible_person) {
      // Naming an in-world person is a designation, not a build step. Continuity
      // forbids inventing assigned staff, so an undesignated role is a Chairman
      // gate unless the item says the build may fill it.
      out.push(req('RESPONSIBLE_PERSON_MISSING', 'No responsible in-world person named.', 'assign',
        item.person_authority === 'BUILD' ? AUTHORITY.BUILD : AUTHORITY.CHAIRMAN));
    }
    return out;
  },
  PRODUCE: item => {
    const out = [];
    if (!item.artifact_ref) out.push(req('ARTIFACT_MISSING', 'Nothing has been produced yet; no artifact reference.', 'produce', AUTHORITY.BUILD));
    if (item.rights_state !== 'CLEARED') {
      out.push(req('RIGHTS_NOT_CLEARED', `Rights state is ${item.rights_state || 'UNKNOWN'}.`, 'rights',
        item.rights_authority === 'CHAIRMAN' ? AUTHORITY.CHAIRMAN : AUTHORITY.BUILD));
    }
    return out;
  },
  VERIFY: item => {
    const out = [];
    if (!item.evidence_ref) out.push(req('EVIDENCE_MISSING', 'No verification evidence attached.', 'verify', AUTHORITY.BUILD));
    if (item.provenance_state !== 'RECORDED') out.push(req('PROVENANCE_NOT_RECORDED', `Provenance state is ${item.provenance_state || 'UNKNOWN'}.`, 'provenance', AUTHORITY.BUILD));
    return out;
  },
  PRODUCTIZE: item => {
    const out = [];
    if (!item.product_ref) {
      // The product registry is the existing one in the live backend. When that
      // backend cannot be written from the build session, creating the record is
      // not build work that is being neglected -- it is an operator action, and
      // saying so is more useful than showing it as a task nobody is doing.
      out.push(req('PRODUCT_RECORD_MISSING',
        item.product_registry === 'LIVE_BACKEND_UNREACHABLE'
          ? 'No record in the existing product registry; the live backend is unreachable from the build session (WR-RAELINK-001 B1).'
          : 'No record in the existing product registry.',
        'productize',
        item.product_registry === 'LIVE_BACKEND_UNREACHABLE' ? AUTHORITY.CHAIRMAN : AUTHORITY.BUILD));
    }
    if (item.serial_state !== 'ISSUED') out.push(req('SERIAL_NOT_ISSUED', `Serial state is ${item.serial_state || 'NONE'}.`, 'serial', AUTHORITY.BUILD));
    if (item.qr_state !== 'BOUND') out.push(req('QR_NOT_BOUND', `QR state is ${item.qr_state || 'NONE'}.`, 'serial', AUTHORITY.BUILD));
    return out;
  },
  PRICE: item => {
    const out = [];
    if (item.cost_state !== 'KNOWN') {
      out.push(req('COST_UNKNOWN', `Cost state is ${item.cost_state || 'UNKNOWN'}.`, 'cost',
        item.cost_state === 'QUOTE_REQUIRED' ? AUTHORITY.CHAIRMAN : AUTHORITY.BUILD));
    }
    if (item.price_state !== 'SET') out.push(req('PRICE_NOT_SET', `Price state is ${item.price_state || 'UNSET'}.`, 'price', AUTHORITY.CHAIRMAN));
    return out;
  },
  STORE: item => {
    const out = [];
    if (item.storefront_state !== 'LISTED') out.push(req('NOT_LISTED', `Storefront state is ${item.storefront_state || 'ABSENT'}.`, 'store', AUTHORITY.BUILD));
    if (item.checkout_path_state !== 'VERIFIED') {
      out.push(req('CHECKOUT_PATH_UNVERIFIED', `Checkout path is ${item.checkout_path_state || 'UNVERIFIED'}; no purchase button may be shown.`, 'store', AUTHORITY.CHAIRMAN));
    }
    return out;
  },
  RELEASE: item => {
    const out = [];
    if (!item.release_evidence_ref) out.push(req('RELEASE_EVIDENCE_MISSING', 'Release cannot be claimed without evidence.', 'release', AUTHORITY.BUILD));
    if (item.readback_state !== 'CONFIRMED') out.push(req('READBACK_MISSING', `Readback state is ${item.readback_state || 'NONE'}; a release is not real until it reads back.`, 'release', AUTHORITY.BUILD));
    return out;
  },
  MEASURE: item => {
    const out = [];
    if (!item.measurement_ref) out.push(req('MEASUREMENT_MISSING', 'No measurement record after release.', 'measure', AUTHORITY.BUILD));
    return out;
  },
  IMPROVE: item => {
    const out = [];
    if (!item.improvement_ref) out.push(req('IMPROVEMENT_MISSING', 'No improvement recorded from what was measured.', 'improve', AUTHORITY.BUILD));
    return out;
  }
});

/**
 * Every unmet requirement for the item's CURRENT stage, each naming its route
 * and its authority. An item is never told only "not ready".
 */
export function stageGate(item) {
  const stage = item.stage;
  if (!EXIT[stage]) throw new RangeError(`Unknown conveyor stage: ${stage}`);
  const preconditions = PRECONDITIONS(item);
  const blockers = [...preconditions, ...EXIT[stage](item)];
  return {
    stage,
    ready: blockers.length === 0,
    // An unmet precondition halts the item at every stage, including work at the
    // stage it is standing on. It is not merely the first blocker in a list.
    preconditions,
    halted: preconditions.length > 0,
    blockers,
    chairman_blockers: blockers.filter(b => b.authority === AUTHORITY.CHAIRMAN),
    build_blockers: blockers.filter(b => b.authority === AUTHORITY.BUILD)
  };
}

/**
 * Work that belongs to a LATER stage but is executable now.
 *
 * This is BLOCK(X) != BLOCK(Y) applied inside a single item. A show parked at
 * ASSIGN because no producer has been designated can still have its rights
 * researched and its provenance recorded -- that work is required at PRODUCE and
 * VERIFY regardless, it does not depend on the missing field, and waiting for the
 * designation before starting it buys nothing. Only BUILD-authority requirements
 * are pulled forward; a Chairman gate is never "started early".
 */
// Two gates are about PERMISSION TO MAKE THE THING AT ALL, not about who is
// assigned or what it costs. Neither may be worked around by starting later work
// early: producing an adaptation before consent, or producing anything for an
// item whose source record is unconfirmed, is the exact failure the permission
// gate exists to prevent. Everything downstream stops behind these two.
const SUPPRESSES_PULL_FORWARD = Object.freeze(['CONTINUITY_UNVERIFIED', 'RIGHTS_NOT_CLEARED']);

export function pullForwardWork(item) {
  const gate = stageGate(item);
  if (gate.halted) return [];
  const blockedHere = gate.chairman_blockers.some(b => SUPPRESSES_PULL_FORWARD.includes(b.code));
  // Rights are tested at PRODUCE, so an item still at CAPTURE/CLASSIFY/ASSIGN
  // with Chairman-held rights would otherwise pull PRODUCE work forward.
  const rightsHeld = item.rights_authority === 'CHAIRMAN' && item.rights_state !== 'CLEARED';
  if (blockedHere || rightsHeld) return [];
  const from = stageIndex(item.stage);
  const to = stageIndex(MONEY_STAGE);
  if (from < 0) throw new RangeError(`Unknown conveyor stage: ${item.stage}`);
  const work = [];
  for (let i = from + 1; i <= to; i += 1) {
    const stage = STAGES[i];
    for (const b of EXIT[stage]({ ...item, stage })) {
      if (b.authority === AUTHORITY.BUILD) work.push({ ...b, stage });
    }
  }
  return work;
}

/**
 * The single next executable action for this item, and who can execute it.
 * When the only thing standing in the way is a Chairman gate, that is said
 * plainly rather than dressed up as work in progress.
 */
export function nextExecutableAction(item) {
  const gate = stageGate(item);
  if (gate.halted) {
    const p = gate.preconditions[0];
    return { action: p.detail, route: p.route, authority: p.authority, code: p.code, blocked: true, pulled_forward: false };
  }
  if (gate.ready) {
    const to = nextStage(item.stage);
    return { action: `Advance ${item.canonical_id} to ${to}`, route: to.toLowerCase(), authority: AUTHORITY.BUILD, blocked: false };
  }
  const build = gate.build_blockers[0];
  if (build) return { action: build.detail, route: build.route, authority: AUTHORITY.BUILD, code: build.code, blocked: false, pulled_forward: false };
  // Current stage waits on the Chairman. Pull forward the nearest later work
  // that does not, rather than reporting this item as idle.
  const ahead = pullForwardWork(item)[0];
  if (ahead) {
    return { action: `${ahead.detail} (${ahead.stage} work, executable now)`, route: ahead.route, authority: AUTHORITY.BUILD, code: ahead.code, blocked: false, pulled_forward: true, for_stage: ahead.stage };
  }
  const chair = gate.chairman_blockers[0];
  return { action: chair.detail, route: chair.route, authority: AUTHORITY.CHAIRMAN, code: chair.code, blocked: true, pulled_forward: false };
}

/**
 * Actions remaining to the far side of RELEASE: unmet requirements at the
 * current stage plus every requirement of every stage between here and there.
 * Counted from the item's own fields, never estimated.
 */
export function actionsRemaining(item) {
  const from = stageIndex(item.stage);
  const to = stageIndex(MONEY_STAGE);
  if (from < 0) throw new RangeError(`Unknown conveyor stage: ${item.stage}`);
  // An item past RELEASE is in the improvement loop; its remaining work is its own stage.
  if (from > to) return stageGate(item).blockers.length;
  let total = stageGate(item).blockers.length;
  for (let i = from + 1; i <= to; i += 1) {
    total += EXIT[STAGES[i]]({ ...item, stage: STAGES[i] }).length;
  }
  return total;
}

/**
 * Money distance: executable actions between now and the first sellable unit,
 * plus the authority that has to clear them. `chairman_gates` is the honest
 * part — it names how many of those actions are not ours to take.
 */
export function moneyDistance(item) {
  const from = stageIndex(item.stage);
  const to = stageIndex(MONEY_STAGE);
  if (from > to) return { distance: 0, chairman_gates: 0, reached: true, note: 'Past RELEASE; in the improvement loop.' };
  let distance = 0;
  let chairman = 0;
  for (let i = from; i <= to; i += 1) {
    for (const b of EXIT[STAGES[i]]({ ...item, stage: STAGES[i] })) {
      distance += 1;
      if (b.authority === AUTHORITY.CHAIRMAN) chairman += 1;
    }
  }
  return { distance, chairman_gates: chairman, reached: distance === 0, note: null };
}

/**
 * Advance one stage. Refuses when the gate is unmet, so an item cannot be moved
 * forward by saying it moved forward.
 */
export function advance(item, now = new Date().toISOString()) {
  const gate = stageGate(item);
  if (!gate.ready) {
    return { advanced: false, item, gate, reason: 'GATE_UNMET' };
  }
  const to = nextStage(item.stage);
  const moved = { ...item, stage: to, last_advanced_at: now };
  if (item.stage === 'IMPROVE') moved.version_no = (item.version_no ?? 1) + 1;
  return { advanced: true, item: moved, gate, reason: null };
}
