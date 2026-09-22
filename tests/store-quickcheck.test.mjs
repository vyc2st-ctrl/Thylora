import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

import {
  PRODUCT,
  PRICE_PACKET,
  READINESS,
  DELIVERY,
  RE_ACCESS,
  MOBILE,
  PARALLEL_LANES,
  readinessReport,
} from '../store-quickcheck/manifest.mjs';

const artifact = readFileSync(new URL('../store-quickcheck/artifact/qyris-quickcheck-v1.html', import.meta.url), 'utf8');
const preview = readFileSync(new URL('../store-quickcheck/preview/index.html', import.meta.url), 'utf8');

// --- the artifact is what the manifest says it is --------------------------

test('the recorded artifact hash is the hash of the artifact on disk', () => {
  const actual = createHash('sha256').update(readFileSync(new URL('../store-quickcheck/artifact/qyris-quickcheck-v1.html', import.meta.url))).digest('hex');
  assert.equal(actual, PRODUCT.artifact_sha256,
    'the manifest hash has drifted from the artifact — the binding is broken');
});

test('the recorded byte count is the artifact byte count', () => {
  assert.equal(Buffer.byteLength(artifact), PRODUCT.artifact_bytes);
});

test('the artifact is self-contained: no external resource of any kind', () => {
  assert.equal(/<script/i.test(artifact), false, 'artifact contains a script');
  assert.equal(/\bsrc\s*=/i.test(artifact), false, 'artifact references an external source');
  assert.equal(/<link[^>]+stylesheet/i.test(artifact), false, 'artifact links an external stylesheet');
  assert.equal(/@import/i.test(artifact), false, 'artifact imports a stylesheet');
  assert.equal(/https?:\/\//i.test(artifact), false, 'artifact reaches the network');
});

test('the artifact delivers all five QYRIS fields in full', () => {
  for (const field of ['Q · Question', 'Y · Yield', 'R · Reason', 'I · Inspect', 'S · Safeguard']) {
    assert.ok(artifact.includes(field), `artifact is missing ${field}`);
  }
  // Each field carries its own completion test, not just prose.
  const doneWhen = artifact.match(/Done when:/g) ?? [];
  assert.equal(doneWhen.length, 5, 'each of the five fields must carry a "Done when" test');
});

test('the artifact delivers the worksheet, the failure modes and the worked example', () => {
  assert.ok(artifact.includes('The worksheet'));
  assert.ok(artifact.includes('Four failures this catches'));
  assert.ok(artifact.includes('A worked example'));
});

test('the artifact carries the rule that unchecked active work is a hold', () => {
  assert.ok(/no check on record at all/i.test(artifact));
  assert.ok(/Absence of a check is a hold, not a pass/i.test(artifact));
});

// --- the preview is bound, bounded and honest -----------------------------

test('the preview is bound to the artifact by hash', () => {
  assert.ok(preview.includes(PRODUCT.artifact_sha256),
    'the preview does not carry the artifact hash, so it can drift from the product');
});

test('the preview shows one field in full and does not reproduce the other four', () => {
  assert.ok(preview.includes('I · Inspect'), 'preview should show the Inspect field');
  // The bodies of the other four must not appear.
  assert.equal(preview.includes('Write the request in the words it arrived in'), false, 'preview leaks Question');
  assert.equal(preview.includes('If this goes exactly as planned'), false, 'preview leaks Yield');
  assert.equal(preview.includes('What gets worse if this waits a month'), false, 'preview leaks Reason');
  assert.equal(preview.includes('Not risk to the project'), false, 'preview leaks Safeguard');
});

test('the preview does not reproduce the worksheet or the worked example', () => {
  assert.equal(/<div class="sheet">/.test(preview), false, 'preview leaks the worksheet');
  assert.equal(preview.includes('Turn on recurring subscription billing'), false, 'preview leaks the worked example');
});

test('neither surface offers a purchase control or claims a live commerce path', () => {
  for (const [name, html] of [['artifact', artifact], ['preview', preview]]) {
    assert.equal(/<button/i.test(html), false, `${name} carries a control`);
    assert.equal(/<form/i.test(html), false, `${name} carries a form`);
    // Purchase calls to action, not the word "checkout" used in prose.
    assert.equal(/add to cart|buy now|proceed to checkout|purchase now/i.test(html), false, `${name} offers a purchase`);
    assert.equal(/<a[^>]+href/i.test(html), false, `${name} links out of itself`);
  }
  assert.ok(/Not on sale yet/i.test(preview), 'the preview must say plainly that release has not been given');
  assert.ok(/Chairman release is required and has not been given/i.test(preview));
});

test('the preview does not present the proposed price as a price to a buyer', () => {
  assert.equal(preview.includes(PRICE_PACKET.proposed_price_display), false,
    'an unapproved price is shown on the preview');
});

// --- mobile, light and dark -----------------------------------------------

test('both surfaces are built for a phone', () => {
  for (const [name, html] of [['artifact', artifact], ['preview', preview]]) {
    assert.ok(/<meta name="viewport" content="width=device-width/.test(html), `${name} has no viewport meta`);
    assert.ok(/-webkit-text-size-adjust:\s*100%/.test(html), `${name} lets iOS inflate its body text`);
    assert.ok(/padding:0 16px/.test(html), `${name} has no side gutter`);
    assert.ok(/clamp\(/.test(html), `${name} does not clamp headings to viewport width`);
    assert.equal(/width:\s*\d{3,}px/.test(html), false, `${name} sets a fixed pixel width`);
  }
});

test('both surfaces define light and dark, with an explicit theme able to win', () => {
  for (const [name, html] of [['artifact', artifact], ['preview', preview]]) {
    assert.ok(/prefers-color-scheme:\s*dark/.test(html), `${name} has no dark mode`);
    assert.ok(/:root:not\(\[data-theme="light"\]\)/.test(html), `${name} dark mode is not guarded`);
    assert.ok(/:root\[data-theme="dark"\]/.test(html), `${name} has no explicit dark theme`);
    assert.ok(/body\{[^}]*background:var\(--paper\)/.test(html.replace(/\s*\n\s*/g, '')), `${name} body has no explicit background`);
  }
});

test('the artifact prints cleanly and keeps a check on one page', () => {
  assert.ok(/@media print/.test(artifact));
  assert.ok(/break-inside:avoid/.test(artifact));
});

// --- money is integer minor units, and no price is approved ---------------

test('the price packet is proposed, not approved, and is integer minor units', () => {
  assert.equal(PRICE_PACKET.state, 'PROPOSED_NOT_APPROVED');
  assert.equal(Number.isInteger(PRICE_PACKET.proposed_price_minor), true);
  assert.equal(PRICE_PACKET.minor_units, true);
  assert.equal(PRICE_PACKET.chairman_decision_required, true);
});

test('the price packet names what the buyer does not receive, and the tax posture is not faked', () => {
  assert.ok(PRICE_PACKET.what_buyer_does_not_receive.length > 0);
  assert.ok(PRICE_PACKET.tax_posture.startsWith('UNRESOLVED'));
});

test('the product does not touch the unproven recurring-billing gate', () => {
  assert.equal(PRICE_PACKET.recurring, false);
});

// --- delivery and re-access -----------------------------------------------

test('delivery reuses the existing mechanism and invents no second system', () => {
  assert.equal(DELIVERY.mechanism, 'EXISTING_THYLORA_TOKEN_MINT_REDEEM');
  assert.ok(DELIVERY.invents.startsWith('NOTHING'));
  assert.equal(DELIVERY.anonymous_url_exists, false);
});

test('the delivery round trip is recorded as unverified rather than assumed', () => {
  assert.equal(DELIVERY.round_trip_verified, false);
  assert.ok(DELIVERY.round_trip_blocker.includes('403'));
});

test('re-access is perpetual by constraint and cancellation cannot revoke it', () => {
  assert.equal(RE_ACCESS.perpetual, true);
  assert.ok(RE_ACCESS.perpetual_basis.includes('CONSTRAINT'));
  assert.equal(RE_ACCESS.revocable_by_cancellation, false);
});

test('device rendering is not claimed', () => {
  assert.equal(MOBILE.device_verified, false);
  assert.ok(MOBILE.device_verified_note.includes('UNKNOWN'));
});

// --- the readiness ladder --------------------------------------------------

test('every readiness rung carries evidence, and every non-DONE rung carries a route', () => {
  for (const rung of READINESS) {
    assert.ok(rung.evidence && rung.evidence.trim() !== '', `rung ${rung.rung} has no evidence`);
    if (rung.state !== 'DONE') {
      assert.ok(rung.route && rung.route.trim() !== '', `rung ${rung.rung} is ${rung.state} with no route`);
    }
  }
});

test('everything not requiring release authority is done', () => {
  const report = readinessReport();
  assert.equal(report.all_non_authority_steps_done, true);
  assert.equal(report.rungs_done, 10);
});

test('the product is not released, not purchasable and not claimed live', () => {
  const report = readinessReport();
  assert.equal(report.purchasable, false);
  assert.equal(report.release_state, 'RELEASE_HELD');
  assert.equal(PRODUCT.purchasable, false);
  assert.deepEqual(report.distance_to_live.map((d) => d.step), ['CHAIRMAN_RELEASE']);
});

// --- the two parallel lanes did not stall ---------------------------------

test('both parallel lanes advanced this run and neither is parked', () => {
  assert.equal(PARALLEL_LANES.length, 2);
  for (const lane of PARALLEL_LANES) {
    assert.equal(lane.lane_state, 'SPEC_ADVANCED_THIS_RUN');
    assert.ok(lane.shape && lane.shape.length > 40, `${lane.title} has no defined shape`);
    assert.ok(lane.next_step && lane.next_step.trim() !== '', `${lane.title} has no next step`);
    assert.ok(lane.relationship_to_quickcheck.length > 0, `${lane.title} does not fix its boundary against Quickcheck`);
  }
});

test('the three store products stay distinct products', () => {
  const codes = new Set([PRODUCT.product_code, ...PARALLEL_LANES.map((l) => l.product_code)]);
  assert.equal(codes.size, 3, 'two store products collapsed into one code');
});
