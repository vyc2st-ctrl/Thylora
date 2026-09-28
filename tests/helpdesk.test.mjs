// THYLORA LIBRARY · EARTH HELP DESK · case-intake engine tests
// Workroom: WR-PROD-FLOOR-001 · Lane G
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateIntake, computeUsageAnomaly, estimateContinuousLeak, compareLeakToAnomaly,
  routeResponsibility, buildEscalationPath, lookupResource, buildCasePacket,
  findLegalConclusions, redactAccount, scrubText, periodDays, toGallons,
  SAMPLE_WATER_BILL_CASE, EXAMPLE_RESOURCE_MAP, PACKET_SECTIONS, HELP_CATEGORIES
} from '../helpdesk/lib/intake.js';

const FIXED = { caseId: 'HELP-CASE-TEST-0001', generatedAt: '2026-09-28T00:00:00Z' };
const clone = o => JSON.parse(JSON.stringify(o));

test('validator reports every gap at once, not one at a time', () => {
  const result = validateIntake({ tenancy: { role: 'TENANT' } });
  const codes = result.gaps.map(g => g.code);
  for (const c of ['CONSENT_MISSING', 'JURISDICTION_MISSING', 'ACCOUNT_HOLDER_MISSING', 'TIMELINE_EMPTY',
                   'BILLS_NONE', 'RATE_MISSING', 'PHOTOS_NONE', 'COMMS_NONE', 'COMMS_NO_WRITTEN_NOTICE',
                   'LEASE_CLAUSE_MISSING', 'REPAIR_EVIDENCE_MISSING', 'LEAK_SOURCE_UNKNOWN']) {
    assert.ok(codes.includes(c), `expected gap ${c}`);
  }
  assert.ok(result.gaps.length >= 12);
  assert.equal(result.complete, false);
  assert.equal(result.can_build_packet, false);
});

test('every gap carries a code, a severity, a plain-language reason and a route', () => {
  const { gaps } = validateIntake({ bills: [{ id: 'x', disputed: true }], photos: [{ id: 'p' }], timeline: [{ event: 'no date' }] });
  assert.ok(gaps.length > 0);
  for (const g of gaps) {
    assert.match(g.code, /^[A-Z_]+$/);
    assert.ok(['BLOCKING', 'IMPORTANT', 'HELPFUL'].includes(g.severity));
    assert.ok(g.reason.length > 20, `reason too short for ${g.code}`);
    assert.ok(g.route.length > 10, `route too short for ${g.code}`);
  }
  const codes = gaps.map(g => g.code);
  assert.ok(codes.includes('BILL_PERIOD_MISSING'));
  assert.ok(codes.includes('BILL_USAGE_MISSING'));
  assert.ok(codes.includes('PHOTO_CAPTURE_DATE_MISSING'));
  assert.ok(codes.includes('TIMELINE_EVENT_DATE_MISSING'));
  assert.ok(codes.includes('BILLS_NO_BASELINE'));
  // blocking gaps come first
  const sev = gaps.map(g => g.severity);
  assert.deepEqual(sev, [...sev].sort((a, b) => ['BLOCKING', 'IMPORTANT', 'HELPFUL'].indexOf(a) - ['BLOCKING', 'IMPORTANT', 'HELPFUL'].indexOf(b)));
});

test('the sample case has exactly one open gap: repair evidence', () => {
  const r = validateIntake(SAMPLE_WATER_BILL_CASE);
  assert.deepEqual(r.gaps.map(g => g.code), ['REPAIR_EVIDENCE_MISSING']);
  assert.equal(r.can_build_packet, true);
});

test('billing periods are counted inclusively', () => {
  assert.equal(periodDays('2026-03-05', '2026-04-03'), 30);
  assert.equal(periodDays('2026-04-04', '2026-05-04'), 31);
  assert.equal(periodDays('2026-02-04', '2026-03-04'), 29);
  assert.equal(periodDays('2026-05-04', '2026-04-04'), null);
  assert.equal(toGallons(10, 'CCF'), 7481);
});

test('anomaly math: worked example reconciles to the cent', () => {
  const a = computeUsageAnomaly(SAMPLE_WATER_BILL_CASE.bills, SAMPLE_WATER_BILL_CASE.rate);
  assert.equal(a.model, 'EMPIRICAL MODEL');
  assert.equal(a.baseline.gallons, 9000);
  assert.equal(a.baseline.days, 90);
  assert.equal(a.baseline.gallons_per_day, 100);
  const b4 = a.rows.find(r => r.id === 'SAMPLE-B4');
  const b5 = a.rows.find(r => r.id === 'SAMPLE-B5');
  assert.equal(b4.expected_gallons, 3000);
  assert.equal(b4.excess_gallons, 6480);
  assert.equal(b4.excess_cost_cents, 8100);
  assert.equal(b5.expected_gallons, 3100);
  assert.equal(b5.excess_gallons, 7200);
  assert.equal(b5.excess_cost_cents, 9000);
  assert.equal(a.totals.excess_gallons, 13680);
  assert.equal(a.totals.excess_cost_cents, 17100);
  assert.equal(a.totals.disputed_billed_cents, 28725);
  assert.equal(a.totals.baseline_equivalent_cents, 11625);
  // billed = baseline-equivalent + excess, exactly
  assert.equal(a.totals.reconciliation_gap_cents, 0);
  assert.equal(a.totals.disputed_billed_cents, a.totals.baseline_equivalent_cents + a.totals.excess_cost_cents);
  for (const r of a.rows) assert.equal(r.bill_math_check, 'MATCH');
});

test('anomaly math flags a bill whose printed amount does not rebuild from the rate', () => {
  const bills = clone(SAMPLE_WATER_BILL_CASE.bills);
  bills[3].amount_cents += 137; // e.g. a surcharge not in the rate
  const a = computeUsageAnomaly(bills, SAMPLE_WATER_BILL_CASE.rate);
  assert.equal(a.rows[3].bill_math_check, 'MISMATCH_ASK_UTILITY');
  assert.equal(a.totals.reconciliation_gap_cents, 137);
});

test('anomaly math refuses to invent a baseline and never reports negative excess', () => {
  const none = computeUsageAnomaly([{ id: 'd', period_start: '2026-03-05', period_end: '2026-04-03', usage: 9000, disputed: true }], { marginal_cents_per_kgal: 1250 });
  assert.equal(none.ok, false);
  assert.equal(none.reason, 'NO_BASELINE');
  const low = computeUsageAnomaly([
    { id: 'p', period_start: '2026-01-01', period_end: '2026-01-30', usage: 3000 },
    { id: 'd', period_start: '2026-02-01', period_end: '2026-03-02', usage: 1000, disputed: true }
  ], { marginal_cents_per_kgal: 1250 });
  assert.equal(low.rows[1].excess_gallons, 0);
  assert.equal(low.rows[1].excess_cost_cents, 0);
});

test('continuous-leak estimate: running flapper 0.15 gal/min → 216 gal/day → 6,480 gal and $81.00 per 30 days', () => {
  const k = estimateContinuousLeak({ gallons_per_minute: 0.15, days: 30, marginal_cents_per_kgal: 1250, fixture: 'toilet flapper' });
  assert.equal(k.model, 'EMPIRICAL MODEL');
  assert.equal(k.gallons_per_day, 216);
  assert.equal(k.gallons, 6480);
  assert.equal(k.litres, 24529);
  assert.equal(k.cost_cents, 8100);
  assert.equal(k.cost_cents_per_day, 270);
  assert.ok(k.assumptions.length >= 2);
  assert.equal(estimateContinuousLeak({}).reason, 'NO_FLOW_RATE');
});

test('leak model is compared to observed excess and the residual is kept, not hidden', () => {
  const a = computeUsageAnomaly(SAMPLE_WATER_BILL_CASE.bills, SAMPLE_WATER_BILL_CASE.rate);
  const k = estimateContinuousLeak({ gallons_per_minute: 0.15, marginal_cents_per_kgal: 1250 });
  const cmp = compareLeakToAnomaly(a, k);
  assert.deepEqual(cmp.map(c => [c.id, c.modelled_leak_gallons, c.residual_gallons, c.explained_bp]), [
    ['SAMPLE-B4', 6480, 0, 10000],
    ['SAMPLE-B5', 6696, 504, 9300]
  ]);
});

test('no legal conclusion is ever authored, even when the quoted lease uses conclusion words', () => {
  const intake = clone(SAMPLE_WATER_BILL_CASE);
  intake.tenancy.lease_clause.text = 'Landlord is responsible for all plumbing repairs.';
  intake.communications.push({ date: '2026-05-20', party: 'LANDLORD', channel: 'EMAIL', direction: 'RECEIVED', summary: 'Tenant is liable for the water bill.' });
  const p = buildCasePacket(intake, FIXED);
  assert.equal(p.responsibility.decision, 'NOT_DECIDED_BY_SOFTWARE');
  assert.deepEqual(findLegalConclusions(p.markdown), []);
  const authored = p.markdown.split('\n').filter(l => !l.startsWith('>')).join('\n').replace(/“[^”]*”/g, '');
  for (const phrase of [/your landlord is liable/i, /landlord is responsible/i, /you will win/i, /you are entitled/i, /owes you/i, /tenant is liable/i]) {
    assert.doesNotMatch(authored, phrase);
  }
  // the guard itself catches authored conclusions
  assert.ok(findLegalConclusions('Your landlord is liable for this bill.').length > 0);
  assert.ok(findLegalConclusions('You have a strong case.').length > 0);
  assert.deepEqual(findLegalConclusions('> Landlord is responsible for repairs.'), []);
});

test('missing jurisdiction degrades to "look up your local X" questions', () => {
  const intake = clone(SAMPLE_WATER_BILL_CASE);
  delete intake.jurisdiction;
  const route = buildEscalationPath(intake, EXAMPLE_RESOURCE_MAP);
  const utility = route.steps.find(s => s.code === 'UTILITY_DISPUTE_LEAK_ADJUSTMENT').resource;
  assert.equal(utility.found, false);
  assert.equal(utility.verification, 'LOOKUP_REQUIRED');
  assert.match(utility.name, /^Look up your local /);
  const housing = lookupResource({ city: 'Somewhere', state_or_region: 'XX' }, 'HOUSING_CODE', EXAMPLE_RESOURCE_MAP);
  assert.equal(housing.found, false);
  assert.match(housing.lookup_query, /Somewhere, XX housing code/);
  const r = routeResponsibility(intake);
  assert.ok(r.questions.some(q => /Where is the property/.test(q)));
  assert.ok(validateIntake(intake).gaps.some(g => g.code === 'JURISDICTION_MISSING'));
  const p = buildCasePacket(intake, FIXED);
  assert.match(p.markdown, /Look up your local water utility billing-dispute/);
});

test('example resource entry is clearly labelled and VERIFY_LOCALLY', () => {
  const e = EXAMPLE_RESOURCE_MAP['EXAMPLE-US-CITY'];
  assert.match(e.label, /EXAMPLE ENTRY/);
  assert.equal(e.verification, 'VERIFY_LOCALLY');
  for (const r of Object.values(e.resources)) assert.equal(r.verification, 'VERIFY_LOCALLY');
});

test('packet renders every section in order', () => {
  const p = buildCasePacket(SAMPLE_WATER_BILL_CASE, FIXED);
  let last = -1;
  PACKET_SECTIONS.forEach((name, i) => {
    const idx = p.markdown.indexOf(`## ${i + 1} · ${name}`);
    assert.ok(idx > last, `section ${name} missing or out of order`);
    last = idx;
  });
  assert.match(p.markdown, /\| SAMPLE-B4 \(disputed\) \| 2026-03-05 → 2026-04-03 \| 30 \| 9,480 \| 3,000 \| 6,480 \|/);
  assert.match(p.markdown, /Reconciliation: billed \$287\.25 − baseline-equivalent \$116\.25 − excess \$171\.00 = \$0\.00/);
  assert.match(p.markdown, /SAMPLE —/);
  assert.equal(p.escalation.steps.length, 5);
  assert.deepEqual(p.escalation.steps.map(s => s.code), [
    'LANDLORD_WRITTEN_NOTICE', 'UTILITY_DISPUTE_LEAK_ADJUSTMENT', 'HOUSING_CODE_INSPECTION', 'TENANT_RESOURCE_LEGAL_AID', 'SMALL_CLAIMS_INFO'
  ]);
  assert.equal(p.escalation.steps[0].status, 'DONE');
  assert.equal(p.escalation.steps[1].status, 'WAITING_ON_REPAIR_EVIDENCE');
});

test('privacy: account numbers are redacted to the last 4 everywhere in the packet', () => {
  assert.equal(redactAccount('000048213377'), '****3377');
  assert.equal(redactAccount('12'), '****');
  assert.equal(scrubText('ref 1234567890123 ok'), 'ref ****0123 ok');
  const p = buildCasePacket(SAMPLE_WATER_BILL_CASE, FIXED);
  const json = JSON.stringify({ ...p, markdown: undefined });
  // The raw number may only survive nowhere in the rendered output.
  assert.equal(p.markdown.includes('000048213377'), false);
  assert.equal(p.account.account_number_redacted, '****3377');
  assert.equal(p.communications.some(c => c.summary.includes('000048213377')), false);
  assert.equal(p.timeline.some(e => e.event.includes('000048213377')), false);
  assert.equal(json.includes('000048213377'), false);
  assert.match(p.markdown, /\*\*\*\*3377/);
});

test('timeline is sorted by date regardless of entry order; undated events go last', () => {
  const intake = clone(SAMPLE_WATER_BILL_CASE);
  intake.timeline.push({ event: 'undated recollection' });
  const p = buildCasePacket(intake, FIXED);
  const dates = p.timeline.filter(e => e.date).map(e => e.date);
  assert.deepEqual(dates, [...dates].sort());
  assert.equal(p.timeline[0].date, '2026-03-02');
  assert.equal(p.timeline.at(-1).event, 'undated recollection');
});

test('cost exposure is money at stake, never a statement of who owes it', () => {
  const p = buildCasePacket(SAMPLE_WATER_BILL_CASE, FIXED);
  const x = p.cost_exposure;
  assert.equal(x.disputed_billed_cents, 28725);
  assert.equal(x.baseline_equivalent_cents, 11625);
  assert.equal(x.estimated_excess_cents, 17100);
  assert.equal(x.ongoing_cents_per_day, 270);
  assert.equal(x.ongoing_cents_per_30_days, 8100);
  assert.match(x.note, /not a statement of who owes/);
});

test('packet generation is deterministic for fixed inputs and lists all eleven help categories', () => {
  const a = buildCasePacket(SAMPLE_WATER_BILL_CASE, FIXED).markdown;
  const b = buildCasePacket(SAMPLE_WATER_BILL_CASE, FIXED).markdown;
  assert.equal(a, b);
  assert.equal(Object.keys(HELP_CATEGORIES).length, 11);
});
