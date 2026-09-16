/**
 * THYLORA product conveyor — canonical stage ladder.
 *
 * One ladder for every sellable thing in the system, regardless of which
 * registry it currently lives in (idea_registry, thylora_product_realization_registry,
 * products, thylora_commercial_product_registry, thylora_store_product_readiness).
 *
 * The ladder is ordinal. A candidate's stage is the highest rung whose entry
 * condition is satisfied by live evidence. A candidate never claims a rung on
 * intent alone.
 */

export const STAGES = [
  {
    ordinal: 0,
    code: 'IDEA',
    label: 'Chairman idea',
    entry: 'Recorded in a registry with a canonical ID and a parent source.',
  },
  {
    ordinal: 1,
    code: 'PRODUCT_CANDIDATE',
    label: 'Product candidate',
    entry: 'Marked sellable/productizable, with a product type and a department owner.',
  },
  {
    ordinal: 2,
    code: 'PRODUCT_SPEC',
    label: 'Product spec',
    entry: 'Customer, problem, deliverable and completion definition are all written down.',
  },
  {
    ordinal: 3,
    code: 'RIGHTS_SAFETY_GATE',
    label: 'Rights / safety gate',
    entry: 'Rights state resolved AND safety/age review recorded. Not "unverified".',
  },
  {
    ordinal: 4,
    code: 'ARTIFACT',
    label: 'Artifact',
    entry: 'The thing the buyer receives exists as a final file, with a hash or provider readback.',
  },
  {
    ordinal: 5,
    code: 'PRICE_COST',
    label: 'Price / cost',
    entry: 'Price is configured (not pending approval) and unit cost is recorded.',
  },
  {
    ordinal: 6,
    code: 'STORE_LISTING',
    label: 'Store listing',
    entry: 'A provider-side listing exists and carries product-specific media that passed preflight.',
  },
  {
    ordinal: 7,
    code: 'RELEASE_GATE',
    label: 'Release gate',
    entry: 'Delivery connected, re-access verified, checkout path verified, mobile preview passed.',
  },
  {
    ordinal: 8,
    code: 'PUBLISHED',
    label: 'Published',
    entry: 'Listing is ACTIVE and a real external purchase has been witnessed end to end.',
  },
];

export const STAGE_BY_CODE = Object.fromEntries(STAGES.map((s) => [s.code, s]));
export const TERMINAL_ORDINAL = 8;

/**
 * Gates that must each be individually satisfied before PUBLISHED. The count of
 * unmet gates is the candidate's `actions_remaining` — the honest answer to
 * "how many executable steps until this can take money", as opposed to the
 * coarser stage distance.
 */
export const RELEASE_GATES = [
  'spec_complete',
  'rights_passed',
  'safety_reviewed',
  'source_complete',
  'final_artifact_complete',
  'product_specific_visual_complete',
  'visual_preflight_passed',
  'price_configured',
  'cost_recorded',
  'store_listing_exists',
  'delivery_connected',
  'reaccess_verified',
  'checkout_path_verified',
  'mobile_preview_passed',
  'listing_active',
  'external_purchase_witnessed',
];

/**
 * Money-distance bands. Distance is `actions_remaining`; the band is what a
 * human reads on the dashboard. A product is never described as "purchasable"
 * on anything but a witnessed external purchase.
 */
export function moneyBand(actionsRemaining) {
  if (actionsRemaining === 0) return 'PURCHASABLE_WITNESSED';
  if (actionsRemaining === 1) return 'ONE_ACTION_FROM_MONEY';
  if (actionsRemaining <= 3) return 'NEAR_MONEY';
  if (actionsRemaining <= 7) return 'MID_DISTANCE';
  return 'FAR_FROM_MONEY';
}

/**
 * Resolve a candidate's stage from its gate evidence. We walk the ladder from
 * the bottom and stop at the first rung whose entry condition fails, so a
 * candidate cannot skip a rung by having a later gate incidentally set.
 */
export function resolveStage(gates) {
  const g = (k) => gates[k] === true;

  if (!g('registered')) return STAGE_BY_CODE.IDEA;
  if (!g('sellable_intent')) return STAGE_BY_CODE.IDEA;
  if (!g('spec_complete')) return STAGE_BY_CODE.PRODUCT_CANDIDATE;
  if (!(g('rights_passed') && g('safety_reviewed'))) return STAGE_BY_CODE.PRODUCT_SPEC;
  if (!(g('source_complete') && g('final_artifact_complete'))) return STAGE_BY_CODE.RIGHTS_SAFETY_GATE;
  if (!(g('price_configured') && g('cost_recorded'))) return STAGE_BY_CODE.ARTIFACT;
  if (!(g('store_listing_exists') && g('product_specific_visual_complete') && g('visual_preflight_passed'))) {
    return STAGE_BY_CODE.PRICE_COST;
  }
  if (!(g('delivery_connected') && g('reaccess_verified') && g('checkout_path_verified') && g('mobile_preview_passed'))) {
    return STAGE_BY_CODE.STORE_LISTING;
  }
  if (!(g('listing_active') && g('external_purchase_witnessed'))) return STAGE_BY_CODE.RELEASE_GATE;
  return STAGE_BY_CODE.PUBLISHED;
}

export function actionsRemaining(gates) {
  return RELEASE_GATES.filter((k) => gates[k] !== true).length;
}

/**
 * The first unmet gate, in ladder order, is the exact blocker. Anything else is
 * a description of the blocker rather than the blocker itself.
 */
export function exactBlocker(gates) {
  return RELEASE_GATES.find((k) => gates[k] !== true) ?? null;
}
