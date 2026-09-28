import { test } from 'node:test';
import assert from 'node:assert/strict';
import { settleSale, settleCampaign, campaignGate, applyRefund, releaseReserve, receipt } from '../store/lib/backtobuy.js';
import { modulesPerSide, smallestVersion, contrastRatio, shortCode, verifyShortCode, issueSeal, validateSeal, scanWitness } from '../store/lib/qrseal.js';
import { evaluate, reportIncident, revoke } from '../store/lib/supplier.js';

// ---------- BACK TO BUY ----------

test('worked example: $35.00 shirt, 25% support, reconciles to the cent', () => {
  // G 3500, T 210 (6%), F 132 (2.9% + 30¢ = 101.5 → 102 + 30), P 1450, reserve 5% = 175
  const r = settleSale({ G: 3500, T: 210, F: 132, P: 1450, reserve_bp: 500 }, 2500);
  assert.equal(r.R, 175);
  assert.equal(r.N, 3500 - 210 - 132 - 1450 - 175); // 1533
  assert.equal(r.N, 1533);
  assert.equal(r.B, 383); // floor(1533 × 0.25) = 383.25 → 383
  assert.equal(r.house, 1150);
  assert.equal(r.B + r.house, r.N);
  assert.equal(r.sub_cent_remainder, 2500); // 0.25 cent, reported not hidden
});

test('costs above gross give zero net and say so, never a negative benefit', () => {
  const r = settleSale({ G: 1000, T: 60, F: 59, P: 1200, R: 0 }, 5000);
  assert.equal(r.N, 0);
  assert.equal(r.B, 0);
  assert.equal(r.state, 'NO_DISTRIBUTABLE_NET');
  assert.equal(r.shortfall, 319);
});

test('floats and negatives are refused', () => {
  assert.throws(() => settleSale({ G: 35.0 + 0.1, T: 0, F: 0, P: 0, R: 0 }, 2500), /NOT_INTEGER/);
  assert.throws(() => settleSale({ G: 100, T: -1, F: 0, P: 0, R: 0 }, 2500), /NEGATIVE/);
  assert.throws(() => settleSale({ G: 100, T: 0, F: 0, P: 0, R: 0 }, 10001), /SUPPORT_BP_INVALID/);
});

test('campaign rounds once on summed net, so the recipient never loses to per-sale floors', () => {
  const sales = Array.from({ length: 1000 }, () => ({ G: 1999, T: 0, F: 88, P: 900, R: 0 })); // N = 1011 each
  const c = settleCampaign(sales, 3333);
  assert.equal(c.N, 1011000);
  assert.equal(c.B, Math.floor((1011000 * 3333) / 10000));
  assert.ok(c.recipient_gain_vs_per_sale >= 0);
  assert.equal(c.B + c.house, c.N);
});

test('money is conserved across 5,000 random sales', () => {
  let seed = 7;
  const rnd = (n) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
  for (let i = 0; i < 5000; i += 1) {
    const G = rnd(100000);
    const r = settleSale({ G, T: rnd(G / 10 | 0 + 1), F: rnd(500), P: rnd(G + 1), reserve_bp: rnd(2001) }, rnd(10001));
    assert.equal(r.B + r.house, r.N);
    assert.ok(r.B >= 0 && r.N >= 0);
  }
});

test('gate reports every missing condition at once, including named-family consent', () => {
  const g = campaignGate({ cause: 'RENT', support_bp: 2500, recipient_is_named_family: true, consent: {}, reserve_bp: 500 });
  const codes = g.blockers.map((b) => b.code);
  assert.equal(g.open, false);
  for (const c of ['SUPPORT_SHARE_NOT_DISCLOSED', 'PAYOUT_MATH_NOT_PUBLISHED', 'RECIPIENT_NOT_VERIFIED', 'NAMED_FAMILY_CONSENT_MISSING']) assert.ok(codes.includes(c), c);
});

test('consent must cover the public name; withdrawal closes the campaign', () => {
  const base = { cause: 'FUNERAL', support_bp: 5000, disclosure_text: '50% of net', payout_math_published: true, recipient_verified: true, recipient_is_named_family: true, reserve_bp: 0 };
  assert.ok(campaignGate({ ...base, consent: { documented: true } }).blockers.some((b) => b.code === 'CONSENT_DOES_NOT_COVER_PUBLIC_NAME'));
  assert.equal(campaignGate({ ...base, consent: { documented: true, covers_public_name: true } }).open, true);
  assert.ok(campaignGate({ ...base, consent: { documented: true, covers_public_name: true, withdrawn: true } }).blockers.some((b) => b.code === 'CONSENT_WITHDRAWN'));
});

test('medical/dental needs legal review and may never collect medical detail', () => {
  const g = campaignGate({ cause: 'MEDICAL_DENTAL', support_bp: 2000, disclosure_text: '20%', payout_math_published: true, recipient_verified: true, collects_medical_detail: true });
  const codes = g.blockers.map((b) => b.code);
  assert.ok(codes.includes('LEGAL_REVIEW_REQUIRED'));
  assert.ok(codes.includes('MEDICAL_DETAIL_PROHIBITED'));
});

test('refunds draw on the reserve first and never claw back from the recipient', () => {
  const s = applyRefund({ reserve_balance: 500, carried_deduction: 0 }, 800);
  assert.deepEqual(s, { reserve_balance: 0, carried_deduction: 300, recipient_clawback: 0 });
  const rel = releaseReserve(175, 2500);
  assert.equal(rel.B + rel.house, 175);
});

test('receipt prints every term and the percentage', () => {
  const r = settleSale({ G: 3500, T: 210, F: 132, P: 1450, reserve_bp: 500 }, 2500);
  const text = receipt(r, { cause: 'RENT', recipient_display: 'Family Seal K7Q' });
  for (const s of ['Gross $35.00', 'tax $2.10', 'fees $1.32', 'making & shipping $14.50', 'refund reserve $1.75', 'net $15.33', '25%', '$3.83', 'THYLORA keeps $11.50']) assert.ok(text.includes(s), s);
});

// ---------- FAMILY SEAL QR ----------

test('QR geometry: n = 17 + 4v', () => {
  assert.equal(modulesPerSide(1), 21);
  assert.equal(modulesPerSide(3), 29);
  assert.equal(modulesPerSide(40), 177);
  assert.throws(() => modulesPerSide(41));
});

test('short code round-trips and catches a one-character typo', () => {
  for (const n of [0, 1, 31, 32, 12345, 999999, 1073741823]) {
    const c = shortCode(n);
    assert.equal(c.length, 7);
    assert.deepEqual(verifyShortCode(c), { ok: true, serial: n });
  }
  const c = shortCode(12345);
  const typo = (c[2] === 'A' ? 'B' : 'A') + c.slice(1);
  assert.equal(verifyShortCode(c.slice(0, 2) + typo.slice(0, 1) + c.slice(3)).ok, false);
  assert.deepEqual(verifyShortCode(c.toLowerCase()), { ok: true, serial: 12345 });
});

test('issued seal URL carries only opaque codes and fits a small QR', () => {
  const s = issueSeal({ family_code: 'FAM7Q', campaign_code: 'RENT26', serial: 4821, base_url: 'https://thylora.example' });
  assert.ok(!/FAM7Q|RENT26/.test(s.url));
  assert.equal(smallestVersion(new TextEncoder().encode(s.url).length, 'M'), 3);
  assert.equal(s.printed_fallback, `thylora.example/s/${s.short_code}`);
});

test('a correct seal layout passes; art through modules and a thin quiet zone fail', () => {
  const ok = validateSeal({ payload_url: 'https://thylora.example/s/0004PH1', ec: 'M', quiet_zone_modules: 4, dark: '#1A1410', light: '#F7F1E3', printed_code_width_mm: 25, scan_distance_mm: 250, printed_fallback: 'thylora.example/s/0004PH1', destination_identity: true });
  assert.equal(ok.ok, true, JSON.stringify(ok.issues));
  assert.equal(ok.version, 3);
  const bad = validateSeal({ payload_url: 'https://thylora.example/s/0004PH1', quiet_zone_modules: 2, art_overlaps_modules: true, frame_inside_quiet_zone: true, dark: '#8a7a50', light: '#c9b98a', printed_code_width_mm: 10, scan_distance_mm: 300, names_family_publicly: true });
  const codes = bad.issues.map((i) => i.code);
  for (const c of ['QUIET_ZONE_TOO_SMALL', 'ART_THROUGH_MODULES', 'FRAME_IN_QUIET_ZONE', 'LOW_CONTRAST', 'MODULES_TOO_SMALL', 'TOO_SMALL_FOR_DISTANCE', 'NO_PRINTED_FALLBACK', 'NO_DESTINATION_IDENTITY', 'FAMILY_CONSENT_MISSING']) assert.ok(codes.includes(c), c);
});

test('contrast: black on white is 21:1; gold on cream fails the 7:1 floor', () => {
  assert.equal(Math.round(contrastRatio('#000000', '#FFFFFF')), 21);
  assert.ok(contrastRatio('#C9A13A', '#F7F1E3') < 7);
});

test('scan witness fails on wrong destination', () => {
  const sc = shortCode(4821);
  assert.equal(scanWitness({ short_code: sc, resolved_url: 'https://x/s/' + sc, expected_url: 'https://x/s/' + sc }).result, 'PASS');
  assert.equal(scanWitness({ short_code: sc, resolved_url: 'https://evil/', expected_url: 'https://x/s/' + sc }).reason, 'WRONG_DESTINATION');
});

// ---------- SUPPLIER BRIDGE ----------

const G8 = ['DESK_REVIEW', 'IDENTITY', 'FACILITY', 'PROCESS', 'PROVENANCE', 'QUALITY_TEST', 'LABOR_SAFETY', 'INSPECTION'];

test('paperwork alone never approves a supplier', () => {
  const s = { class: 'HERBS', evidence: G8.map((gate) => ({ gate, kind: 'PAPER', result: 'PASS', at: '2026-09-01' })) };
  const e = evaluate(s, '2026-09-28');
  assert.equal(e.paper_only, true);
  assert.equal(e.designation, 'NOT_APPROVED');
  assert.equal(e.may_receive_orders, false);
  assert.ok(e.open_gates.length >= 7);
});

function fullHerb(at = '2026-09-01') {
  const kinds = { DESK_REVIEW: 'PAPER', IDENTITY: 'REGISTRY_CHECK', FACILITY: 'OBSERVED_REMOTE', PROCESS: 'OBSERVED_REMOTE', PROVENANCE: 'LAB_REPORT', QUALITY_TEST: 'LAB_REPORT', LABOR_SAFETY: 'OBSERVED_REMOTE', INSPECTION: 'OBSERVED_ONSITE' };
  return { class: 'HERBS', evidence: G8.map((gate) => ({ gate, kind: kinds[gate], result: 'PASS', at, ref: `EV-${gate}` })) };
}

test('observed and lab evidence on every gate approves, and the approval expires on schedule', () => {
  const s = fullHerb('2026-09-01');
  assert.equal(evaluate(s, '2026-09-28').designation, 'THYLORA_APPROVED');
  assert.equal(evaluate(s, '2026-09-28').next_recheck, '2027-02-28');
  const later = evaluate(s, '2027-03-15');
  assert.equal(later.designation, 'NOT_APPROVED');
  assert.ok(Object.values(later.gates).every((g) => g.state === 'EXPIRED'));
});

test('a severe incident suspends at once; revocation is terminal and keeps history', () => {
  let s = fullHerb();
  s = reportIncident(s, { id: 'INC-1', at: '2026-09-20', severity: 'SEVERE', summary: 'lab found contaminant above limit', reported_by: 'QA' });
  assert.equal(evaluate(s, '2026-09-28').designation, 'SUSPENDED');
  assert.equal(evaluate(s, '2026-09-28').may_display_badge, false);
  s = revoke(s, { at: '2026-09-28', reason: 'confirmed contamination', decided_by: 'Store Operations' });
  assert.equal(evaluate(s, '2026-09-28').designation, 'REVOKED');
  assert.equal(s.incidents.length, 1);
  assert.throws(() => revoke(s, { at: 'x' }), /REASON/);
});

test('wrong evidence kind is named, not silently accepted', () => {
  const s = fullHerb();
  s.evidence = s.evidence.map((e) => (e.gate === 'QUALITY_TEST' ? { ...e, kind: 'TEST_ORDER' } : e));
  const q = evaluate(s, '2026-09-28').gates.QUALITY_TEST;
  assert.equal(q.state, 'INSUFFICIENT');
  assert.match(q.reason, /LAB_REPORT/);
});
