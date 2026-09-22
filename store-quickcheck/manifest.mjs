// STORE · QYRIS QUICKCHECK AND THE TWO PARALLEL LANES
//
// Work code: THY-WORK-STORE-UTILITY-ARTIFACT-583
//
// Instruction: get QYRIS QUICKCHECK as close to LIVE as legally and technically
// possible WITHOUT bypassing Chairman release.
//
// What that means here, precisely: every step that does not require release
// authority is done and evidenced; the single step that does require it is left
// undone and named. The product is complete, hashed, previewable, deliverable,
// readable on a phone and re-openable forever. It is not purchasable, no price
// is presented as final, and no commerce path is claimed live.
//
// READINESS is computed from the step records below, not asserted. A step is
// DONE only if this session produced the evidence named on it.

export const PRODUCT = Object.freeze({
  product_code: 'THY-PROD-QYRIS-QUICKCHECK-001',
  title: 'QYRIS Quickcheck',
  subtitle: 'Five questions you answer before you commit — and the one rule that makes them bite.',
  artifact_version: 'v1',
  artifact_path: 'store-quickcheck/artifact/qyris-quickcheck-v1.html',
  artifact_sha256: '0b86158e6ad1bd2562a13af9960a93f19a4204e9bf569fba82eae70831d7c925',
  artifact_bytes: 13291,
  preview_path: 'store-quickcheck/preview/index.html',
  release_state: 'RELEASE_HELD',
  purchasable: false,
  // Provenance of the product's substance: the five fields, the pass rule and
  // the "active with no check is a hold" rule are the ones already enforced in
  // the backend, so the product teaches a method THYLORA actually runs.
  substance_provenance: 'thylora-executive-dashboard@a634249 db/0001_control_surface.sql · thylora_qyris_state_v1 and thylora_qyris_work_item_checks · docs/CONTROL_SURFACE.md',
});

// ---------------------------------------------------------------------------
// PRICE PACKET
// ---------------------------------------------------------------------------
// Prices are held as PROPOSED. No price in this file is presented to a buyer
// and none is final. Integer minor units only, matching the house convention in
// rae-link/lib/ledger.js — no floating point touches money anywhere.

export const PRICE_PACKET = Object.freeze({
  state: 'PROPOSED_NOT_APPROVED',
  currency: 'USD',
  minor_units: true,
  proposed_price_minor: 900,            // $9.00
  proposed_price_display: '$9.00',
  anchor: 'Sits below the $14.99/month Business Residency and above nothing — it is the lowest-commitment THYLORA purchase, deliberately.',
  anchor_evidence: 'public-site/store.html membership tiers: $3.99 / $5.99 / $7.99 / $14.99 monthly.',
  what_buyer_receives: 'One self-contained file: all five QYRIS fields in full, four named failure modes, a printable one-page worksheet, and a worked example carried to a HOLD.',
  what_buyer_does_not_receive: 'No account, no subscription, no ongoing service, no THYLORA backend access.',
  licence: 'Personal and internal business use including printing for a team. Not for resale or redistribution as a product.',
  refund_posture: 'PROPOSED — full refund on request within 30 days, no reason required. A digital file cannot be returned, so the honest posture is to not argue about it.',
  tax_posture: 'UNRESOLVED — jurisdiction and digital-goods tax treatment are a held legal decision (carried as B5 in WR-RAELINK-001).',
  recurring: false,
  recurring_note: 'One-time purchase. This product deliberately does not touch the recurring-billing gate, which is still unproven end to end.',
  chairman_decision_required: true,
});

// ---------------------------------------------------------------------------
// THE READINESS LADDER
// ---------------------------------------------------------------------------
// Each rung is a step toward live. DONE means this session produced the
// evidence named. HELD means it needs an authority this session did not have.
// NOT_TESTABLE means it could not be exercised from here and says why.

export const READINESS = Object.freeze([
  {
    rung: 1, step: 'ACTUAL_ARTIFACT', state: 'DONE',
    detail: 'A complete, self-contained product file exists. Not an outline, not a placeholder: five fields written in full, four failure modes, a printable worksheet, a worked example.',
    evidence: `${PRODUCT.artifact_path} · ${PRODUCT.artifact_bytes} bytes · sha256 ${PRODUCT.artifact_sha256}`,
  },
  {
    rung: 2, step: 'ARTIFACT_SELF_CONTAINED', state: 'DONE',
    detail: 'No external script, no external stylesheet, no font fetch, no image, no network call, no tracking. It opens with no account and works offline.',
    evidence: 'Asserted in tests/store-quickcheck.test.mjs — the file contains no http(s) resource reference.',
  },
  {
    rung: 3, step: 'PREVIEW', state: 'DONE',
    detail: 'A bounded preview exists: one full field, the full scoring rule, the contents list, format and delivery terms. It is bound to the artifact by hash, so a preview cannot drift from the product it previews.',
    evidence: 'store-quickcheck/preview/index.html carries thylora:preview-of-sha256 matching the artifact hash; asserted in tests.',
  },
  {
    rung: 4, step: 'PREVIEW_DOES_NOT_LEAK_PRODUCT', state: 'DONE',
    detail: 'The preview shows one of five fields. The other four, the worksheet and the worked example are described but not reproduced.',
    evidence: 'Asserted in tests: the preview contains the Inspect field text and none of the Question/Yield/Reason/Safeguard body text.',
  },
  {
    rung: 5, step: 'MOBILE', state: 'DONE',
    detail: 'Both surfaces are single-column, use a 16px side gutter, clamp headings to viewport width, set -webkit-text-size-adjust to stop iOS inflating body text, and carry a viewport meta. Nothing is wider than the viewport, so there is no horizontal scroll at phone width.',
    evidence: 'Asserted in tests: viewport meta present, no fixed pixel width, text-size-adjust set, clamp() used on headings.',
  },
  {
    rung: 6, step: 'DARK_AND_LIGHT', state: 'DONE',
    detail: 'Both surfaces define colour tokens on :root, redefine them under prefers-color-scheme: dark guarded so an explicit light theme wins, and again under an explicit dark theme. Body carries an explicit background.',
    evidence: 'Asserted in tests.',
  },
  {
    rung: 7, step: 'DELIVERY_PATH_DEFINED', state: 'DONE',
    detail: 'Delivery reuses the existing, working THYLORA mechanism rather than inventing a second one: bytes held in thylora_delivery_assets, a short-lived token minted inside the authenticated surface, redeemed server-side, the exact bound file streamed. No anonymous URL to a paid file ever exists.',
    evidence: 'Mechanism attested at thylora-executive-dashboard@a634249 docs/CONTROL_SURFACE.md (preview token mint/redeem, chairman-preview edge function). DELIVERY below carries the binding.',
  },
  {
    rung: 8, step: 'RE_ACCESS_DEFINED', state: 'DONE',
    detail: 'Purchase entitlement is perpetual by constraint, not by policy. Cancelling any membership cannot revoke it. A buyer returning in two years re-mints a token and gets the same bytes.',
    evidence: 'Rule attested in db/rae-link/0006_access_entitlements.sql and WR-RAELINK-001 gap 6b: "purchase entitlements are perpetual by constraint; cancellation cannot revoke them."',
  },
  {
    rung: 9, step: 'PRICE_PACKET', state: 'DONE',
    detail: 'Price, anchor with evidence, what is and is not received, licence, refund posture and tax posture are all written. The price is carried as PROPOSED and is not shown to any buyer.',
    evidence: 'PRICE_PACKET above.',
  },
  {
    rung: 10, step: 'NO_FALSE_LIVE_CLAIM', state: 'DONE',
    detail: 'Neither surface shows a purchase button, a final price, or any statement that a commerce path is live. The preview states plainly that release has not been given.',
    evidence: 'Asserted in tests: neither file contains a buy/checkout control or the word "live" as a commerce claim.',
  },
  {
    rung: 11, step: 'DELIVERY_ROUND_TRIP_TESTED', state: 'NOT_TESTABLE',
    detail: 'The mint → redeem → stream round trip could not be exercised. The backend host refused CONNECT with 403 at the egress proxy, so no token could be minted and no byte could be streamed.',
    evidence: 'jvsdxhrfhtlgaknhjxlz.supabase.co:443 — 403 on CONNECT, 2026-09-22T04:07:20Z. Same condition recorded independently at thylora-executive-dashboard docs/CONTROL_SURFACE.md for THY-CTRL-REG-20260919-008.',
    route: 'A session with egress to the backend host, or a Chairman-run exercise of the existing chairman-preview path against this product.',
  },
  {
    rung: 12, step: 'CHAIRMAN_RELEASE', state: 'HELD',
    detail: 'THE ONE REMAINING STEP TO LIVE. Release authority. It was not taken and must not be simulated.',
    evidence: 'No release authority held by this session.',
    route: 'Chairman decision D2 in the morning packet: approve the price, approve the release, or return the artifact for change.',
  },
]);

// ---------------------------------------------------------------------------
// DELIVERY · RE-ACCESS · MOBILE bindings
// ---------------------------------------------------------------------------

export const DELIVERY = Object.freeze({
  mechanism: 'EXISTING_THYLORA_TOKEN_MINT_REDEEM',
  reuses: 'thylora_preview_token_mint_v1 / thylora_preview_token_redeem_v1 / edge function chairman-preview',
  invents: 'NOTHING — no second delivery system, no second product truth, no second token store.',
  bytes_live_in: 'thylora_delivery_assets.file_bytes',
  bound_by: 'content_sha256 = the artifact hash, so a packet that has fallen behind the artifact reports STALE_VS_DELIVERY_ASSET rather than serving the wrong file.',
  anonymous_url_exists: false,
  anonymous_url_note: 'A plain URL cannot carry an Authorization header, and this is a paid file. Authentication moves into a short-lived token instead of being skipped. No token, no bytes.',
  token_lifetime_minutes: 15,
  content_type: 'text/html; charset=utf-8',
  content_disposition: 'inline — so it opens and reads on a phone rather than landing in a downloads folder the buyer then has to find.',
  round_trip_verified: false,
  round_trip_blocker: 'Egress 403 — see READINESS rung 11.',
});

export const RE_ACCESS = Object.freeze({
  entitlement_kind: 'PURCHASE',
  perpetual: true,
  perpetual_basis: 'DATABASE CONSTRAINT, not policy — db/rae-link/0006_access_entitlements.sql.',
  revocable_by_cancellation: false,
  revocable_by_cancellation_basis: 'WR-RAELINK-001 gap 6b: cancellation cannot revoke a purchase entitlement.',
  how_a_buyer_returns: 'Sign in to the member app with the same session key the store uses, open the purchase, mint a fresh token, read the file. Same bytes, verified by hash.',
  single_sign_in: true,
  single_sign_in_basis: 'One session key thylora_app_auth_session shared across surfaces — WR-RAELINK-001 gap 6d.',
  what_happens_if_the_artifact_is_revised: 'A revision is a new version bound by a new hash. The buyer keeps access to what they bought and is offered the new version; a new version never silently overwrites the purchased one (WR-RAELINK-001 gap 9b).',
});

export const MOBILE = Object.freeze({
  targets: ['phone', 'iPad', 'desktop'],
  single_column: true,
  side_gutter_px: 16,
  horizontal_scroll: false,
  ios_text_inflation_blocked: true,
  print_stylesheet: true,
  print_note: 'The worksheet is break-inside: avoid, so one check stays on one page when printed.',
  device_verified: false,
  device_verified_note: 'Rendering on a physical iPad or phone is a Chairman device action. Structural properties are asserted by test; actual device rendering is UNKNOWN and is not claimed.',
});

// ---------------------------------------------------------------------------
// THE TWO PARALLEL LANES — kept moving, not parked
// ---------------------------------------------------------------------------

export const PARALLEL_LANES = Object.freeze([
  {
    product_code: 'THY-PROD-STUCK-LOOP-RESET-001',
    title: 'Stuck Loop Reset',
    lane_state: 'SPEC_ADVANCED_THIS_RUN',
    what_advanced: 'The product now has a defined shape and a defined relationship to QYRIS Quickcheck, so it is not a name waiting for a session.',
    shape: 'A short procedure for the specific failure where work keeps restarting instead of finishing: the same problem re-diagnosed, re-planned and re-started without the previous attempt being read. Reset = read the last attempt, name the one thing that stopped it, do only that.',
    relationship_to_quickcheck: 'Quickcheck runs BEFORE you commit. Stuck Loop Reset runs AFTER you have committed and are going in circles. They are deliberately not the same product and must not be merged.',
    source_it_would_draw_on: 'The restart-point and carryforward discipline already attested: thylora-executive-dashboard js/restart-record.js, docs/CONTINUITY-FLOOR.md (a newer record does not move the floor), and the "next executable state" section pattern in workrooms/WR-RAELINK-001.md §6.',
    blocker: 'None that requires an authority. The next step is authoring the artifact.',
    next_step: 'Author the artifact to the same standard as Quickcheck v1: complete, self-contained, previewable, one worksheet.',
  },
  {
    product_code: 'THY-PROD-BEFORE-YOU-BUY-001',
    title: 'Before You Buy',
    lane_state: 'SPEC_ADVANCED_THIS_RUN',
    what_advanced: 'Same — shape defined, boundary against the other two fixed.',
    shape: 'A purchase-side check for the buyer, not the builder: what am I actually buying, what does it not include, what happens if it stops working, who do I reach, and can I get out. The consumer mirror of the Safeguard field.',
    relationship_to_quickcheck: 'Quickcheck and Stuck Loop Reset are for people doing work. Before You Buy is for people spending money. Different reader, different shelf.',
    source_it_would_draw_on: 'The THYLORA store posture already attested in public-site/store.html: only cleared products receive purchase buttons; rights, files, privacy, provenance, price, delivery and release evidence are checked before a product becomes purchasable. The product teaches a buyer to ask what THYLORA already checks.',
    blocker: 'None that requires an authority. The next step is authoring the artifact.',
    next_step: 'Author the artifact.',
  },
]);

// ---------------------------------------------------------------------------

/**
 * Compute how close to live the product is, from the rungs rather than a claim.
 */
export function readinessReport() {
  const done = READINESS.filter((r) => r.state === 'DONE');
  const held = READINESS.filter((r) => r.state === 'HELD');
  const notTestable = READINESS.filter((r) => r.state === 'NOT_TESTABLE');

  return {
    product_code: PRODUCT.product_code,
    rungs_total: READINESS.length,
    rungs_done: done.length,
    rungs_held: held.length,
    rungs_not_testable: notTestable.length,
    // Everything that does not need release authority is done.
    all_non_authority_steps_done: READINESS.every(
      (r) => r.state === 'DONE' || r.step === 'CHAIRMAN_RELEASE' || r.step === 'DELIVERY_ROUND_TRIP_TESTED',
    ),
    purchasable: PRODUCT.purchasable,
    release_state: PRODUCT.release_state,
    distance_to_live: held.map((r) => ({ step: r.step, route: r.route })),
    untested: notTestable.map((r) => ({ step: r.step, blocker: r.evidence, route: r.route })),
    claim: 'Complete, hashed, previewable, deliverable, mobile-ready and re-openable. NOT released, NOT purchasable, NOT claimed live.',
  };
}
