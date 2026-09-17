// THYLORA merchandise lane · approval gates and make order
// Workroom: WR-MERCH-001
//
// Client-side twin of db/merch/0005 and 0009. The gates are ordered and a SKU
// may not skip one: evaluateSku stops at the first failure and reports it, so a
// SKU blocked at G1 is never described as "nearly ready" because G4 would pass.
//
// Two gates are hard stops for every SKU today, on recorded backend state:
//   G8 — every merchandise_program row reads earth_supplier_state UNSELECTED
//   G9 — every merchandise_program row reads chairman_price_state AUTHORITY_REQUIRED

import {
  ARTWORK_LOCKS, CLASSES, FAMILIES, VESSEL_CLASSES, CUP_SIDE_MAP, lockUsable
} from './locks.js';
import { parseSerial, validateSerialAgainstRun } from './serial.js';

export const GATE_ORDER = Object.freeze(['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10']);

export const GATES = Object.freeze({
  G1:  { name: 'Artwork lock verified',              authority: 'SYSTEM' },
  G2:  { name: 'Cup side map verified',              authority: 'SYSTEM',   applies_to: VESSEL_CLASSES },
  G3:  { name: 'Family composition verified',        authority: 'SYSTEM' },
  G4:  { name: 'Visual identity and exactness gate', authority: 'SYSTEM' },
  G5:  { name: 'Rights, likeness and materials pass', authority: 'CHAIRMAN' },
  G6:  { name: 'Serial assigned',                    authority: 'SYSTEM' },
  G7:  { name: 'Physical proof approved',            authority: 'CHAIRMAN' },
  G8:  { name: 'Supplier selected and contracted',   authority: 'CHAIRMAN' },
  G9:  { name: 'Chairman price set',                 authority: 'CHAIRMAN' },
  G10: { name: 'Store release and witness',          authority: 'CHAIRMAN' }
});

const CHECKS = {
  G1: (sku) => {
    const reasons = [];
    const locks = sku.artwork_lock_codes ?? [];
    if (locks.length === 0) reasons.push('no artwork lock referenced');
    for (const code of locks) {
      const { usable, reasons: why } = lockUsable(code, sku.family_code);
      if (!usable) reasons.push(...why);
    }
    return reasons;
  },

  G2: (sku) => {
    const reasons = [];
    if (!VESSEL_CLASSES.includes(sku.class_code)) return reasons;

    const sideA = ARTWORK_LOCKS[sku.side_a_lock];
    if (!sideA) {
      reasons.push('side A carries no resolvable artwork lock');
    } else if (!CUP_SIDE_MAP.side_a_allowed_groups.includes(sideA.group)) {
      reasons.push(`side A may not carry a ${sideA.group} lock`);
    }
    if (!CUP_SIDE_MAP.side_b_allowed_kinds.includes(sku.side_b_kind)) {
      reasons.push(`side B kind ${sku.side_b_kind} is not one of ${CUP_SIDE_MAP.side_b_allowed_kinds.join(', ')}`);
    }
    if (sku.side_b_ref && sku.side_b_ref === sku.side_a_lock) {
      reasons.push('side B repeats the side A mark');
    }
    // Sides are fixed. A phrase or scene on side A is a transposition.
    if (sideA && (sku.family_code === 'LOGO_PHRASE' || sku.family_code === 'LOGO_SCENE')
        && sideA.group !== 'MARK' && sideA.group !== 'MASTHEAD') {
      reasons.push('side A and side B appear transposed');
    }
    if (sku.base_carries && sku.base_carries !== CUP_SIDE_MAP.base_carries) {
      reasons.push(`the base carries ${sku.base_carries}; it may carry the serial only`);
    }
    if (sku.interior_carries && sku.interior_carries !== CUP_SIDE_MAP.interior_carries) {
      reasons.push('the interior carries artwork; it must be unmarked');
    }
    return reasons;
  },

  G3: (sku, ctx = {}) => {
    const reasons = [];
    const family = FAMILIES[sku.family_code];
    if (!family) return [`unknown family ${sku.family_code}`];

    if (family.requires_phrase) {
      const phrase = ctx.phrases?.[sku.phrase_code];
      if (!sku.phrase_code) reasons.push('LOGO_PHRASE requires a phrase');
      else if (!phrase) reasons.push(`phrase ${sku.phrase_code} is not registered`);
      else {
        if (phrase.approval_state !== 'CHAIRMAN_APPROVED') {
          reasons.push(`phrase ${sku.phrase_code} is ${phrase.approval_state}`);
        }
        if (phrase.tone_gate_state !== 'PASS') {
          reasons.push(`phrase ${sku.phrase_code} has not passed the editorial tone lock`);
        }
      }
    } else if (sku.phrase_code) {
      reasons.push(`${sku.family_code} may not carry a phrase`);
    }

    if (family.requires_scene) {
      const scene = ctx.scenes?.[sku.scene_code];
      if (!sku.scene_code) reasons.push('LOGO_SCENE requires a scene');
      else if (!scene) reasons.push(`scene ${sku.scene_code} is not registered`);
      else {
        if (!scene.crop_approved) reasons.push(`scene ${sku.scene_code} crop is not approved`);
        if (REJECTED_MASTER_STATES.some((s) => String(scene.master_state).includes(s))) {
          reasons.push(`scene ${sku.scene_code} comes from a master in ${scene.master_state}`);
        }
      }
    } else if (sku.scene_code) {
      reasons.push(`${sku.family_code} may not carry a scene`);
    }
    return reasons;
  },

  G4: (sku) => {
    const reasons = [];
    // The mark on the production file must be the approved artwork itself.
    if (sku.artwork_application === 'REGENERATED' || sku.artwork_application === 'RETYPED') {
      reasons.push('a regenerated or re-typed mark cannot pass: exact marks are applied deterministically');
    }
    if (sku.artwork_application !== 'DETERMINISTIC_FROM_APPROVED_ARTWORK') {
      reasons.push('artwork_application must be DETERMINISTIC_FROM_APPROVED_ARTWORK');
    }
    if (CLASSES[sku.class_code]?.redraw && !sku.redraw_approved) {
      reasons.push(`${sku.class_code} requires a mark redraw for its decoration method; that is a mark change and needs Chairman approval`);
    }
    if (sku.print_floor_checked !== true) {
      reasons.push('print-floor legibility has not been checked');
    }
    return reasons;
  },

  G5: (sku, ctx = {}) => {
    const rights = ctx.rights?.[sku.sku_code];
    if (!rights) return ['no rights record'];
    if (rights.rights_pass === true) return [];
    const unknown = Object.entries(rights)
      .filter(([k, v]) => k.endsWith('_state') && typeof v === 'string'
        && (v === 'UNKNOWN' || v.startsWith('NOT_CLEARED') || v.startsWith('CANDIDATE') || v.includes('UNVERIFIED')))
      .map(([k, v]) => `${k} is ${v}`);
    return unknown.length ? unknown : ['rights_pass is false'];
  },

  G6: (sku, ctx = {}) => {
    if (!sku.serial_code) return ['no serial assigned'];
    const run = ctx.runs?.[sku.run_code];
    const { valid, reasons } = validateSerialAgainstRun(sku.serial_code, run);
    if (!valid) return reasons;
    if (!parseSerial(sku.serial_code)) return ['serial does not conform to MERCH-SERIAL-001'];
    return [];
  },

  G7: (sku) => {
    if (sku.proof_state === 'PHYSICAL_PROOF_APPROVED') return [];
    if (sku.proof_state === 'RENDER_APPROVED') {
      return ['a render-only approval does not pass G7; the object must be judged'];
    }
    return [`proof_state is ${sku.proof_state ?? 'NOT_PROOFED'}`];
  },

  G8: (sku) => (sku.supplier_state === 'SELECTED_AND_CONTRACTED'
    ? []
    : [`supplier_state is ${sku.supplier_state ?? 'UNSELECTED'}`]),

  G9: (sku) => (sku.price_state === 'CHAIRMAN_SET' && sku.price_amount != null
    ? []
    : [`price_state is ${sku.price_state ?? 'AUTHORITY_REQUIRED'}`]),

  G10: (sku) => {
    const reasons = [];
    if (!sku.shelf_code) reasons.push('no shelf assigned');
    if (!sku.external_product_id) reasons.push('no provider listing read back');
    if (sku.checkout_path_verified !== true) reasons.push('checkout path not verified');
    if (sku.witness_state !== 'WITNESSED') reasons.push('no fulfilment witness recorded');
    return reasons;
  }
};

const REJECTED_MASTER_STATES = Object.freeze(['REJECTED', 'SUPERSEDED', 'REPLACEMENT_REQUIRED']);

/**
 * Evaluate the gates in order. Stops at the first failure: a SKU's state is the
 * first gate it cannot pass, not the best gate it happens to satisfy.
 */
export function evaluateSku(sku, ctx = {}) {
  const results = [];
  for (const gateCode of GATE_ORDER) {
    const gate = GATES[gateCode];
    if (gate.applies_to && !gate.applies_to.includes(sku.class_code)) {
      results.push({ gate: gateCode, result: 'NOT_APPLICABLE', reasons: [] });
      continue;
    }
    const reasons = CHECKS[gateCode](sku, ctx);
    if (reasons.length) {
      results.push({ gate: gateCode, result: 'FAIL', reasons });
      return {
        sku_code: sku.sku_code,
        passed: false,
        blocked_at: gateCode,
        blocked_at_name: gate.name,
        blocked_by_authority: gate.authority,
        reasons,
        results
      };
    }
    results.push({ gate: gateCode, result: 'PASS', reasons: [] });
  }
  return { sku_code: sku.sku_code, passed: true, blocked_at: null, reasons: [], results };
}

/**
 * Whether a SKU may be described as manufactured or on sale. Mirrors the CHECK
 * constraints in db/merch/0004: without a witness, neither claim is available.
 */
export function claimableState(sku) {
  const witnessed = sku.witness_state === 'WITNESSED';
  return {
    may_claim_manufactured: witnessed && sku.manufacturing_state === 'MANUFACTURED',
    may_claim_live_commerce: witnessed && sku.commerce_state === 'LIVE',
    witness_state: sku.witness_state ?? 'NOT_WITNESSED'
  };
}

/**
 * Order SKUs fastest first. Speed means fewest open approvals and least new
 * artwork work — not a delivery estimate, because no supplier is selected and
 * no lead time is known.
 *
 * Sort keys, in order:
 *   1. approved artwork already exists
 *   2. no tooling required
 *   3. no mark redraw required
 *   4. no likeness involved
 *   5. fewest unresolved artwork-lock open questions
 *   6. fewest decorated surfaces
 */
export function makeOrder(skus) {
  const scored = skus.map((sku) => {
    const locks = (sku.artwork_lock_codes ?? []).map((c) => ARTWORK_LOCKS[c]).filter(Boolean);
    const klass = CLASSES[sku.class_code] ?? { tooling: true, redraw: true, surfaces: [] };
    const family = FAMILIES[sku.family_code] ?? {};
    const openQuestions = locks.filter((l) => l.open_question).length;
    const artworkApproved = locks.length > 0
      && locks.every((l) => l.merch_use_state !== 'NOT_CLEARED')
      && family.state === 'OPEN';
    const likeness = locks.some((l) => l.group === 'PRESENTER');

    return {
      sku_code: sku.sku_code,
      artwork_already_approved: artworkApproved,
      tooling_required: klass.tooling,
      redraw_required: klass.redraw,
      likeness_involved: likeness,
      open_questions: openQuestions,
      surfaces_count: (sku.decorated_surfaces ?? klass.surfaces).length,
      speed_class: artworkApproved && !klass.tooling && !klass.redraw && !likeness
        ? (openQuestions === 0 ? 'FIRST_WAVE' : 'FIRST_WAVE_PENDING_QUESTION')
        : 'HELD'
    };
  });

  scored.sort((a, b) =>
    Number(b.artwork_already_approved) - Number(a.artwork_already_approved) ||
    Number(a.tooling_required) - Number(b.tooling_required) ||
    Number(a.redraw_required) - Number(b.redraw_required) ||
    Number(a.likeness_involved) - Number(b.likeness_involved) ||
    a.open_questions - b.open_questions ||
    a.surfaces_count - b.surfaces_count ||
    a.sku_code.localeCompare(b.sku_code));

  return scored.map((s, i) => ({ rank: i + 1, ...s }));
}
