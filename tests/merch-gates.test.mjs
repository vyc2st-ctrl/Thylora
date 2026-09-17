// THYLORA merchandise lane · gate and cup-system tests
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateSku, claimableState, makeOrder, GATE_ORDER } from '../merch/lib/gates.js';
import { ARTWORK_LOCKS, CUP_SIDE_MAP, lockUsable } from '../merch/lib/locks.js';

// A SKU that has passed everything a system can check, used as the base for
// isolating one failure at a time.
const clean = {
  sku_code: 'ERM-STK-L-ERGLASSHAT-R001',
  class_code: 'STK',
  family_code: 'LOGO_ONLY',
  run_code: 'ERM-STK-L-ERGLASSHAT-R001',
  artwork_lock_codes: ['LOCK-ER-MARK-GLASS-HAT'],
  artwork_application: 'DETERMINISTIC_FROM_APPROVED_ARTWORK',
  print_floor_checked: true,
  serial_code: 'ERM-STK-L-ERGLASSHAT-R001-00001',
  proof_state: 'PHYSICAL_PROOF_APPROVED',
  supplier_state: 'SELECTED_AND_CONTRACTED',
  price_state: 'CHAIRMAN_SET',
  price_amount: 6,
  shelf_code: 'PRODUCTS_DESIGN',
  external_product_id: 'gid://shopify/Product/0',
  checkout_path_verified: true,
  witness_state: 'WITNESSED',
  commerce_state: 'LIVE',
  manufacturing_state: 'MANUFACTURED'
};

const ctx = {
  runs: { 'ERM-STK-L-ERGLASSHAT-R001': { run_code: 'ERM-STK-L-ERGLASSHAT-R001', edition_class: 'OPEN_RUN', edition_size: null, copies_issued: 0, original_exists: false } },
  rights: { 'ERM-STK-L-ERGLASSHAT-R001': { rights_pass: true } },
  phrases: {},
  scenes: {}
};

test('the gates are ordered and evaluation stops at the first failure', () => {
  assert.deepEqual(GATE_ORDER, ['G1','G2','G3','G4','G5','G6','G7','G8','G9','G10']);
  const sku = { ...clean, artwork_lock_codes: ['LOCK-THYLORA-MARK'], supplier_state: 'UNSELECTED' };
  const result = evaluateSku(sku, ctx);
  // Blocked at G1, not reported as a supplier problem.
  assert.equal(result.blocked_at, 'G1');
  assert.equal(result.results.length, 1);
});

test('an unapproved mark fails G1', () => {
  const result = evaluateSku({ ...clean, artwork_lock_codes: ['LOCK-THYLORA-MARK'] }, ctx);
  assert.equal(result.passed, false);
  assert.equal(result.blocked_at, 'G1');
  assert.match(result.reasons.join(' '), /NOT_APPROVED/);
});

test('a mark with an unresolved open question fails G1', () => {
  const result = evaluateSku({ ...clean, artwork_lock_codes: ['LOCK-ER-REAR-TABLET-MARK'] }, ctx);
  assert.equal(result.blocked_at, 'G1');
  assert.match(result.reasons.join(' '), /unresolved open question/);
});

test('the presenter lock is not cleared for merchandise', () => {
  assert.equal(lockUsable('LOCK-PRESENTER-NEYRA', 'LOGO_SCENE').usable, false);
  assert.equal(lockUsable('LOCK-ORAH-BAND', 'LOGO_ONLY').usable, false);
  assert.equal(lockUsable('LOCK-NEYRA-NECKLACE', 'LOGO_ONLY').usable, false);
  assert.equal(lockUsable('LOCK-ER-MARK-GLASS-HAT', 'LOGO_ONLY').usable, true);
});

// ---------------------------------------------------------------------------
// The cup system: side A is the mark, side B is a phrase or a scene.
// ---------------------------------------------------------------------------
const cupBase = {
  ...clean,
  sku_code: 'ERM-MUG-L-ERGLASSHAT-R001',
  class_code: 'MUG',
  run_code: 'ERM-MUG-L-ERGLASSHAT-R001',
  serial_code: 'ERM-MUG-L-ERGLASSHAT-R001-00001',
  artwork_lock_codes: ['LOCK-ER-MARK-GLASS-HAT', 'LOCK-ER-MASTHEAD'],
  side_a_lock: 'LOCK-ER-MARK-GLASS-HAT',
  side_b_kind: 'MASTHEAD',
  side_b_ref: 'LOCK-ER-MASTHEAD'
};
const cupCtx = {
  ...ctx,
  runs: { ...ctx.runs, 'ERM-MUG-L-ERGLASSHAT-R001': { run_code: 'ERM-MUG-L-ERGLASSHAT-R001', edition_class: 'OPEN_RUN', edition_size: null, copies_issued: 0, original_exists: false } },
  rights: { ...ctx.rights, 'ERM-MUG-L-ERGLASSHAT-R001': { rights_pass: true } }
};

test('a logo-only mug passes the side map with mark on A and masthead on B', () => {
  assert.equal(evaluateSku(cupBase, cupCtx).passed, true);
});

test('side B may not repeat the side A mark', () => {
  const result = evaluateSku({ ...cupBase, side_b_ref: 'LOCK-ER-MARK-GLASS-HAT' }, cupCtx);
  assert.equal(result.blocked_at, 'G2');
  assert.match(result.reasons.join(' '), /repeats the side A mark/);
});

test('side B may not carry something outside the three permitted kinds', () => {
  const result = evaluateSku({ ...cupBase, side_b_kind: 'QR' }, cupCtx);
  assert.equal(result.blocked_at, 'G2');
  assert.deepEqual(CUP_SIDE_MAP.side_b_allowed_kinds, ['MASTHEAD', 'PHRASE', 'SCENE']);
});

test('side A may not carry a jewellery or presenter lock', () => {
  const result = evaluateSku({
    ...cupBase,
    artwork_lock_codes: ['LOCK-ER-MARK-GLASS-HAT'],
    side_a_lock: 'LOCK-NEYRA-NECKLACE'
  }, cupCtx);
  assert.equal(result.blocked_at, 'G2');
  assert.match(result.reasons.join(' '), /may not carry a JEWELRY lock/);
});

test('the base carries the serial only and the interior carries nothing', () => {
  assert.equal(evaluateSku({ ...cupBase, base_carries: 'PHRASE' }, cupCtx).blocked_at, 'G2');
  assert.equal(evaluateSku({ ...cupBase, interior_carries: 'MARK' }, cupCtx).blocked_at, 'G2');
  assert.equal(CUP_SIDE_MAP.swap_prohibited, true);
  assert.equal(CUP_SIDE_MAP.handle_clear_band_mm, 12);
});

// ---------------------------------------------------------------------------
// Families
// ---------------------------------------------------------------------------
test('a phrase family SKU fails G3 on a candidate phrase', () => {
  const sku = { ...cupBase, family_code: 'LOGO_PHRASE', side_b_kind: 'PHRASE', side_b_ref: 'PHR-001', phrase_code: 'PHR-001' };
  const withCandidate = { ...cupCtx, phrases: { 'PHR-001': { approval_state: 'CANDIDATE_CHAIRMAN_APPROVAL_REQUIRED', tone_gate_state: 'PENDING' } } };
  const result = evaluateSku(sku, withCandidate);
  assert.equal(result.blocked_at, 'G3');
  assert.match(result.reasons.join(' '), /CANDIDATE/);
  assert.match(result.reasons.join(' '), /editorial tone lock/);
});

test('a phrase family SKU passes G3 once the phrase is approved and tone-checked', () => {
  const sku = { ...cupBase, family_code: 'LOGO_PHRASE', side_b_kind: 'PHRASE', side_b_ref: 'PHR-001', phrase_code: 'PHR-001' };
  const approved = { ...cupCtx, phrases: { 'PHR-001': { approval_state: 'CHAIRMAN_APPROVED', tone_gate_state: 'PASS' } } };
  assert.equal(evaluateSku(sku, approved).passed, true);
});

test('a logo-only SKU may not smuggle in a phrase or a scene', () => {
  assert.equal(evaluateSku({ ...clean, phrase_code: 'PHR-001' }, ctx).blocked_at, 'G3');
  assert.equal(evaluateSku({ ...clean, scene_code: 'SCN-SPORTS001' }, ctx).blocked_at, 'G3');
});

test('a scene from a rejected master fails G3 even when the crop is approved', () => {
  const sku = { ...cupBase, class_code: 'CUP', family_code: 'LOGO_SCENE', side_b_kind: 'SCENE', side_b_ref: 'SCN-SPORTS001', scene_code: 'SCN-SPORTS001' };
  const sceneCtx = {
    ...cupCtx,
    scenes: { 'SCN-SPORTS001': { crop_approved: true, master_state: 'POSTPUBLICATION_REJECTED_REPLACEMENT_REQUIRED' } }
  };
  const result = evaluateSku(sku, sceneCtx);
  assert.equal(result.blocked_at, 'G3');
  assert.match(result.reasons.join(' '), /REJECTED/);
});

// ---------------------------------------------------------------------------
// Exactness, rights, proof, supplier, price, release
// ---------------------------------------------------------------------------
test('a regenerated or re-typed mark fails G4', () => {
  assert.equal(evaluateSku({ ...clean, artwork_application: 'REGENERATED' }, ctx).blocked_at, 'G4');
  assert.equal(evaluateSku({ ...clean, artwork_application: 'RETYPED' }, ctx).blocked_at, 'G4');
});

test('a class needing a mark redraw fails G4 until the redraw is approved', () => {
  const patch = {
    ...clean, sku_code: 'ERM-PCH-L-ERGLASSHAT-R001', class_code: 'PCH',
    run_code: 'ERM-PCH-L-ERGLASSHAT-R001', serial_code: 'ERM-PCH-L-ERGLASSHAT-R001-00001'
  };
  const patchCtx = {
    ...ctx,
    runs: { ...ctx.runs, 'ERM-PCH-L-ERGLASSHAT-R001': { run_code: 'ERM-PCH-L-ERGLASSHAT-R001', edition_class: 'OPEN_RUN', edition_size: null, copies_issued: 0, original_exists: false } },
    rights: { ...ctx.rights, 'ERM-PCH-L-ERGLASSHAT-R001': { rights_pass: true } }
  };
  const result = evaluateSku(patch, patchCtx);
  assert.equal(result.blocked_at, 'G4');
  assert.match(result.reasons.join(' '), /mark change/);
  assert.equal(evaluateSku({ ...patch, redraw_approved: true }, patchCtx).passed, true);
});

test('unknown rights columns fail G5 and are named individually', () => {
  const rightsCtx = {
    ...ctx,
    rights: { 'ERM-STK-L-ERGLASSHAT-R001': {
      rights_pass: false,
      trademark_clearance: 'UNKNOWN',
      supplier_rights_state: 'UNKNOWN',
      likeness_rights_state: 'NOT_CLEARED_FOR_MERCHANDISE',
      material_claim_state: 'UNVERIFIED_WORLD_MATERIAL_CLAIMS_PROHIBITED'
    } }
  };
  const result = evaluateSku(clean, rightsCtx);
  assert.equal(result.blocked_at, 'G5');
  assert.match(result.reasons.join(' '), /supplier_rights_state is UNKNOWN/);
  assert.match(result.reasons.join(' '), /likeness_rights_state/);
});

test('a render-only approval does not satisfy the physical proof gate', () => {
  const result = evaluateSku({ ...clean, proof_state: 'RENDER_APPROVED' }, ctx);
  assert.equal(result.blocked_at, 'G7');
  assert.match(result.reasons.join(' '), /render-only approval/);
});

test('supplier and price are the two hard stops that hold for every SKU today', () => {
  assert.equal(evaluateSku({ ...clean, supplier_state: 'UNSELECTED' }, ctx).blocked_at, 'G8');
  assert.equal(evaluateSku({ ...clean, price_state: 'AUTHORITY_REQUIRED' }, ctx).blocked_at, 'G9');
});

test('release needs a shelf, a provider readback, a checkout path and a witness', () => {
  assert.equal(evaluateSku({ ...clean, shelf_code: null }, ctx).blocked_at, 'G10');
  assert.equal(evaluateSku({ ...clean, external_product_id: null }, ctx).blocked_at, 'G10');
  assert.equal(evaluateSku({ ...clean, checkout_path_verified: false }, ctx).blocked_at, 'G10');
  assert.equal(evaluateSku({ ...clean, witness_state: 'NOT_WITNESSED' }, ctx).blocked_at, 'G10');
});

test('manufacturing and live commerce cannot be claimed without a witness', () => {
  const unwitnessed = claimableState({ ...clean, witness_state: 'NOT_WITNESSED' });
  assert.equal(unwitnessed.may_claim_manufactured, false);
  assert.equal(unwitnessed.may_claim_live_commerce, false);

  const designOnly = claimableState({ commerce_state: 'NOT_LIVE', manufacturing_state: 'NOT_MANUFACTURED' });
  assert.equal(designOnly.may_claim_manufactured, false);
  assert.equal(designOnly.witness_state, 'NOT_WITNESSED');

  const witnessed = claimableState(clean);
  assert.equal(witnessed.may_claim_manufactured, true);
  assert.equal(witnessed.may_claim_live_commerce, true);
});

// ---------------------------------------------------------------------------
// Make order
// ---------------------------------------------------------------------------
test('the fastest first ordering puts untooled approved-artwork SKUs ahead of jewellery', () => {
  const ordered = makeOrder([
    { sku_code: 'ERM-ORAH-L-ORAHBAND-R001', class_code: 'ORAH', family_code: 'LOGO_ONLY', artwork_lock_codes: ['LOCK-ORAH-BAND'] },
    { sku_code: 'ERM-SOCK-L-ERGLASSHAT-R001', class_code: 'SOCK', family_code: 'LOGO_ONLY', artwork_lock_codes: ['LOCK-ER-MARK-GLASS-HAT'] },
    { sku_code: 'ERM-STK-L-ERGLASSHAT-R001', class_code: 'STK', family_code: 'LOGO_ONLY', artwork_lock_codes: ['LOCK-ER-MARK-GLASS-HAT'] },
    { sku_code: 'ERM-CUP-LS-SPORTS001-R001', class_code: 'CUP', family_code: 'LOGO_SCENE', artwork_lock_codes: ['LOCK-ER-MARK-GLASS-HAT', 'LOCK-PRESENTER-NEYRA'] }
  ]);
  assert.equal(ordered[0].sku_code, 'ERM-STK-L-ERGLASSHAT-R001');
  assert.equal(ordered[0].speed_class, 'FIRST_WAVE');
  assert.equal(ordered.at(-1).sku_code, 'ERM-ORAH-L-ORAHBAND-R001');
  assert.equal(ordered.find((o) => o.sku_code === 'ERM-CUP-LS-SPORTS001-R001').likeness_involved, true);
  assert.equal(ordered.find((o) => o.sku_code === 'ERM-SOCK-L-ERGLASSHAT-R001').redraw_required, true);
});

test('an approved mark with an open question ranks behind one without', () => {
  const ordered = makeOrder([
    { sku_code: 'ERM-TABDEC-L-ERREARTABLET-R001', class_code: 'TABDEC', family_code: 'LOGO_ONLY', artwork_lock_codes: ['LOCK-ER-REAR-TABLET-MARK'] },
    { sku_code: 'ERM-STK-L-ERGLASSHAT-R001', class_code: 'STK', family_code: 'LOGO_ONLY', artwork_lock_codes: ['LOCK-ER-MARK-GLASS-HAT'] }
  ]);
  assert.equal(ordered[0].sku_code, 'ERM-STK-L-ERGLASSHAT-R001');
  assert.equal(ordered[0].open_questions, 0);
  assert.equal(ordered[1].open_questions, 1);
  assert.equal(ordered[1].speed_class, 'FIRST_WAVE_PENDING_QUESTION');
});

test('every artwork lock declares a merch use state and the unapproved ones are not cleared', () => {
  for (const [code, lock] of Object.entries(ARTWORK_LOCKS)) {
    assert.ok(lock.merch_use_state, `${code} has no merch_use_state`);
    if (lock.approval_state === 'NOT_APPROVED' || lock.approval_state === 'PENDING_CORRECTION') {
      assert.equal(lock.merch_use_state, 'NOT_CLEARED', `${code} is unapproved but cleared`);
    }
  }
});
