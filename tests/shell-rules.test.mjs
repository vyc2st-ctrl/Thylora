// THYLORA APP · shell rule tests
// Workroom: WR-THYAPP-001
//
// These prove the rules the mobile shell enforces, without a browser:
// who may open the Chairman workspace, what survives a reload, and whether the
// Chairman readouts are arithmetically right.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { resolveRoute, visibleSections, sectionFromHash, OUTCOME } from '../thylora-app/lib/router.js';
import { chairmanAuthorization, serverRoles, decodeClaims, isExpired, REFUSAL }
  from '../thylora-app/lib/identity.js';
import { SECTIONS, SECTION_IDS, backendContract, section } from '../thylora-app/lib/registry.js';
import { moneyDistanceView, promptCoverageLedger, arrivalAnalytics, haversineKm, bandFor, BP }
  from '../thylora-app/lib/analytics.js';

/* ------------------------------------------------------------------ helpers */
const b64 = object => Buffer.from(JSON.stringify(object)).toString('base64url');
const jwt = payload => `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64(payload)}.unverified-signature`;
const FUTURE = Math.floor(Date.now() / 1000) + 3600;
const PAST = Math.floor(Date.now() / 1000) - 3600;

const sessionWith = (payload, user = { id: 'user-1', email: 'chair@thylora.test' }) =>
  ({ access_token: jwt(payload), user });

const CHAIRMAN_SESSION = sessionWith({ exp: FUTURE, app_metadata: { thylora_role: 'CHAIRMAN' } });
const MEMBER_SESSION = sessionWith({ exp: FUTURE, app_metadata: { thylora_role: 'MEMBER' } },
  { id: 'user-2', email: 'member@thylora.test' });

/* ------------------------------------------------------------- the nav set */
test('every requested section exists in the registry, Chairman last and gated', () => {
  const required = [
    'home', 'transmissions', 'earth-watch', 'edereariah', 'ask-ersatz', 'casefiles',
    'world-map', 'store', 'my-purchases', 'my-questions', 'people', 'live-link', 'chairman'
  ];
  assert.deepEqual(SECTION_IDS, required);
  assert.equal(SECTIONS.filter(s => s.access === 'CHAIRMAN').length, 1);
  assert.equal(section('chairman').access, 'CHAIRMAN');
});

test('the Chairman workspace declares every required Chairman capability', () => {
  const required = [
    'voice-command', 'readback', 'margin-notes', 'sketch-surface', 'markup',
    'approve-reject', 'route-to-department', 'money-distance-view',
    'global-arrival-analytics', 'prompt-coverage-ledger'
  ];
  const declared = section('chairman').capabilities;
  for (const capability of required) assert.ok(declared.includes(capability), `missing ${capability}`);
});

test('every public capability is claimed by at least one public section', () => {
  const required = [
    'watch-transmission', 'select-language', 'english-subtitle-toggle', 'open-casefile',
    'open-evidence', 'submit-question', 'purchase-report', 'purchase-story',
    'purchase-product', 'view-serialized-asset', 'follow-reporter', 'follow-bureau',
    'mirror-world-companion'
  ];
  const declared = new Set(SECTIONS.filter(s => s.access === 'PUBLIC').flatMap(s => s.capabilities));
  for (const capability of required) assert.ok(declared.has(capability), `missing ${capability}`);
});

/* --------------------------------------------------------- authenticated routing */
test('the Chairman workspace is refused and not drawn for a signed-out device', () => {
  const route = resolveRoute('chairman', null);
  assert.equal(route.outcome, OUTCOME.BLOCK);
  assert.equal(route.reason, REFUSAL.NO_SESSION);
  // Falls back to Home, so the section is never rendered at all.
  assert.equal(route.sectionId, 'home');
  assert.equal(route.redirected, true);
});

test('a signed-in member without the Chairman role is still refused', () => {
  const route = resolveRoute('chairman', MEMBER_SESSION);
  assert.equal(route.outcome, OUTCOME.BLOCK);
  assert.equal(route.reason, REFUSAL.NOT_AUTHORIZED);
  assert.equal(route.sectionId, 'home');
});

test('a role in user_metadata cannot open the Chairman workspace', () => {
  // user_metadata is writable by the signed-in user. Honouring it would let any
  // member promote themselves, so it must be ignored.
  const selfPromoted = sessionWith({
    exp: FUTURE,
    user_metadata: { thylora_role: 'CHAIRMAN' },
    app_metadata: { thylora_role: 'MEMBER' }
  });
  assert.deepEqual(serverRoles(decodeClaims(selfPromoted.access_token)), ['MEMBER']);
  assert.equal(resolveRoute('chairman', selfPromoted).outcome, OUTCOME.BLOCK);
});

test('an expired token is treated as signed out, not kept on screen', () => {
  const expired = sessionWith({ exp: PAST, app_metadata: { thylora_role: 'CHAIRMAN' } });
  assert.equal(isExpired(decodeClaims(expired.access_token)), true);
  const route = resolveRoute('chairman', expired);
  assert.equal(route.outcome, OUTCOME.BLOCK);
  assert.equal(route.reason, REFUSAL.EXPIRED);
});

test('an authorized Chairman identity opens the workspace', () => {
  const route = resolveRoute('chairman', CHAIRMAN_SESSION);
  assert.equal(route.outcome, OUTCOME.ALLOW);
  assert.equal(route.sectionId, 'chairman');
  assert.equal(route.authorization.identity.email, 'chair@thylora.test');
});

test('the Chairman role is accepted from a roles array and is case-insensitive', () => {
  const viaArray = sessionWith({ exp: FUTURE, app_metadata: { thylora_roles: ['ops', 'chairman'] } });
  assert.equal(chairmanAuthorization(viaArray).authorized, true);
});

test('a malformed token is refused rather than assumed valid', () => {
  const broken = { access_token: 'not-a-jwt', user: { id: 'u' } };
  assert.equal(resolveRoute('chairman', broken).reason, REFUSAL.UNREADABLE_TOKEN);
});

test('a personal public section asks for sign-in but is still drawn', () => {
  for (const id of ['my-purchases', 'my-questions']) {
    const route = resolveRoute(id, null);
    assert.equal(route.outcome, OUTCOME.SIGN_IN, id);
    // Not redirected: hiding a public surface behind a redirect would be wrong.
    assert.equal(route.sectionId, id);
    assert.equal(route.redirected, false);
  }
  assert.equal(resolveRoute('my-purchases', MEMBER_SESSION).outcome, OUTCOME.ALLOW);
});

test('public sections open with no session at all', () => {
  for (const id of ['home', 'transmissions', 'earth-watch', 'edereariah', 'ask-ersatz',
    'casefiles', 'world-map', 'store', 'people', 'live-link']) {
    assert.equal(resolveRoute(id, null).outcome, OUTCOME.ALLOW, id);
  }
});

test('an unknown route falls back to Home instead of erroring', () => {
  const route = resolveRoute('does-not-exist', null);
  assert.equal(route.sectionId, 'home');
  assert.equal(route.outcome, OUTCOME.ALLOW);
});

test('the Chairman tab is absent from the nav unless authorized', () => {
  assert.equal(visibleSections(null).some(s => s.id === 'chairman'), false);
  assert.equal(visibleSections(MEMBER_SESSION).some(s => s.id === 'chairman'), false);
  assert.equal(visibleSections(CHAIRMAN_SESSION).some(s => s.id === 'chairman'), true);
  assert.equal(visibleSections(null).length, SECTIONS.length - 1);
});

test('hashes are read tolerantly', () => {
  assert.equal(sectionFromHash(''), 'home');
  assert.equal(sectionFromHash('#'), 'home');
  assert.equal(sectionFromHash('#store'), 'store');
  assert.equal(sectionFromHash('#/store'), 'store');
  assert.equal(sectionFromHash('#store?ref=x'), 'store');
});

/* ------------------------------------------------------------- money-distance */
test('great-circle distance matches a known route', () => {
  // London to New York is about 5,570 km.
  const km = haversineKm({ latitude: 51.5, longitude: -0.12 }, { latitude: 40.71, longitude: -74.01 });
  assert.ok(Math.abs(km - 5570) < 30, `got ${km}`);
  // A missing latitude must NOT coerce to 0 and become a point on the equator.
  assert.equal(haversineKm({ latitude: 1, longitude: 1 }, { latitude: null, longitude: 1 }), null);
  assert.equal(haversineKm({ latitude: 1, longitude: 1 }, { latitude: '', longitude: 1 }), null);
  assert.equal(haversineKm({ latitude: 1, longitude: 1 }, { longitude: 1 }), null);
  // Out-of-range values are refused rather than wrapped around the globe.
  assert.equal(haversineKm({ latitude: 1, longitude: 1 }, { latitude: 91, longitude: 1 }), null);
  // A real zero is still a real coordinate.
  assert.ok(haversineKm({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 1 }) > 0);
});

test('an arrival row with an unusable coordinate is not given a fake distance', () => {
  const view = moneyDistanceView(
    [{ order_code: 'A', amount_minor: 1000, currency: 'USD', order_state: 'PAID', region_label: 'Nowhere' }],
    [{ region_label: 'Nowhere', latitude: null, longitude: null, arrivals: 4 }],
    { latitude: 0, longitude: 0, label: 'Origin' }
  );
  assert.equal(view.regions[0].distance_km, null);
  assert.equal(view.regions[0].band, null);
  // Revenue is still counted, and the gap is disclosed rather than hidden.
  assert.equal(view.total_revenue_minor, 1000);
  assert.equal(view.unmatched_regions, 1);
});

test('distance bands are half-open and ordered', () => {
  assert.equal(bandFor(0).code, 'LOCAL');
  assert.equal(bandFor(499).code, 'LOCAL');
  assert.equal(bandFor(500).code, 'REGIONAL');
  assert.equal(bandFor(7999).code, 'CONTINENTAL');
  assert.equal(bandFor(8000).code, 'GLOBAL');
});

test('money-distance refuses to invent an origin', () => {
  const view = moneyDistanceView(
    [{ order_code: 'A', amount_minor: 5000, currency: 'USD', order_state: 'PAID', region_label: 'London' }],
    [{ region_label: 'London', latitude: 51.5, longitude: -0.12, arrivals: 10 }],
    null
  );
  assert.equal(view.state, 'ORIGIN_NOT_DECLARED');
  // Revenue is still exact; only distance is withheld.
  assert.equal(view.total_revenue_minor, 5000);
  assert.equal(view.revenue_weighted_distance_km, null);
  assert.ok(view.notes.some(n => /No THYLORA origin is declared/.test(n)));
});

test('refunded orders are excluded from money-distance revenue', () => {
  const origin = { latitude: 40.71, longitude: -74.01, label: 'New York' };
  const arrivals = [{ region_label: 'London', latitude: 51.5, longitude: -0.12, arrivals: 10 }];
  const view = moneyDistanceView([
    { order_code: 'A', amount_minor: 4000, currency: 'USD', order_state: 'PAID', region_label: 'London' },
    { order_code: 'B', amount_minor: 9999, currency: 'USD', order_state: 'REFUNDED', region_label: 'London' }
  ], arrivals, origin);
  assert.equal(view.total_revenue_minor, 4000);
  assert.equal(view.orders, 1);
});

test('money-distance weights distance by revenue and never divides by zero', () => {
  const origin = { latitude: 0, longitude: 0, label: 'Origin' };
  const arrivals = [
    { region_label: 'Near', latitude: 0, longitude: 1, arrivals: 1 },
    { region_label: 'Far', latitude: 0, longitude: 90, arrivals: 1 }
  ];
  const view = moneyDistanceView([
    { order_code: 'A', amount_minor: 100, currency: 'USD', order_state: 'PAID', region_label: 'Near' },
    { order_code: 'B', amount_minor: 900, currency: 'USD', order_state: 'PAID', region_label: 'Far' }
  ], arrivals, origin);
  const near = view.regions.find(r => r.region_label === 'Near');
  const far = view.regions.find(r => r.region_label === 'Far');
  // 90% of the money came from far away, so the weighted distance sits near it.
  assert.ok(view.revenue_weighted_distance_km > far.distance_km * 0.85);
  assert.ok(view.revenue_weighted_distance_km < far.distance_km);
  assert.ok(near.distance_km < far.distance_km);

  const free = moneyDistanceView(
    [{ order_code: 'Z', amount_minor: 0, currency: 'USD', order_state: 'PAID', region_label: 'Near' }],
    arrivals, origin);
  assert.equal(free.revenue_weighted_distance_km, null);
});

test('money-distance band shares total 100% and unmatched regions are disclosed', () => {
  const view = moneyDistanceView([
    { order_code: 'A', amount_minor: 2500, currency: 'USD', order_state: 'PAID', region_label: 'Known' },
    { order_code: 'B', amount_minor: 7500, currency: 'USD', order_state: 'PAID', region_label: 'Unmapped' }
  ], [{ region_label: 'Known', latitude: 10, longitude: 10, arrivals: 3 }],
     { latitude: 0, longitude: 0, label: 'Origin' });
  assert.equal(view.unmatched_regions, 1);
  assert.ok(view.notes.some(n => /no matching arrival point/.test(n)));
  const measured = view.bands.reduce((sum, b) => sum + b.revenue_share_bp, 0);
  // Only the mapped region carries a band, so shares cover that region only.
  assert.equal(measured, 2500 * BP / 10000);
});

test('mixed currencies are reported, not silently added up', () => {
  const view = moneyDistanceView([
    { order_code: 'A', amount_minor: 100, currency: 'USD', order_state: 'PAID', region_label: 'X' },
    { order_code: 'B', amount_minor: 100, currency: 'GBP', order_state: 'PAID', region_label: 'X' }
  ], [], null);
  assert.equal(view.currency, 'MIXED');
  assert.ok(view.notes.some(n => /more than one currency/.test(n)));
});

/* ------------------------------------------------------ prompt coverage ledger */
test('an empty prompt ledger says so rather than reporting 100%', () => {
  const ledger = promptCoverageLedger([]);
  assert.equal(ledger.state, 'NO_PROMPTS_RECORDED');
  assert.equal(ledger.coverage_bp, 0);
  assert.equal(ledger.complete, false);
});

test('prompt coverage counts a partial as half and exposes the delivery gap', () => {
  const ledger = promptCoverageLedger([
    { prompt_code: 'P1', coverage_state: 'COVERED', delivered_state: 'DELIVERED' },
    { prompt_code: 'P2', coverage_state: 'PARTIAL', delivered_state: 'PENDING' },
    { prompt_code: 'P3', coverage_state: 'UNCOVERED', delivered_state: 'PENDING' },
    { prompt_code: 'P4', coverage_state: 'COVERED', delivered_state: 'PENDING' }
  ]);
  // (2 covered * 2 + 1 partial) / (4 * 2) = 5/8 = 62.5%
  assert.equal(ledger.coverage_bp, 6250);
  assert.equal(ledger.delivery_bp, 2500);
  // Covered work that never reached the Chairman is its own number.
  assert.equal(ledger.covered_not_delivered, 1);
  assert.equal(ledger.complete, false);
  assert.equal(ledger.outstanding.length, 3);
});

test('a fully covered and delivered ledger reports complete', () => {
  const ledger = promptCoverageLedger([
    { prompt_code: 'P1', coverage_state: 'COVERED', delivered_state: 'DELIVERED' },
    { prompt_code: 'P2', coverage_state: 'COVERED', delivered_state: 'DELIVERED' }
  ]);
  assert.equal(ledger.coverage_bp, BP);
  assert.equal(ledger.delivery_bp, BP);
  assert.equal(ledger.complete, true);
  assert.equal(ledger.outstanding.length, 0);
});

test('an unrecognised coverage state is counted as unclassified, not as covered', () => {
  const ledger = promptCoverageLedger([{ prompt_code: 'P', coverage_state: 'MAYBE', delivered_state: 'PENDING' }]);
  assert.equal(ledger.unclassified, 1);
  assert.equal(ledger.covered, 0);
  assert.equal(ledger.coverage_bp, 0);
});

/* -------------------------------------------------------------- arrivals */
test('arrival shares total 100% and regions merge', () => {
  const summary = arrivalAnalytics([
    { region_label: 'A', country_code: 'GB', arrivals: 30, sessions: 40 },
    { region_label: 'A', country_code: 'GB', arrivals: 20, sessions: 10 },
    { region_label: 'B', country_code: 'JP', arrivals: 70, sessions: 50 }
  ]);
  assert.equal(summary.arrivals, 120);
  assert.equal(summary.countries, 2);
  assert.equal(summary.regions.length, 2);
  assert.equal(summary.regions.reduce((s, r) => s + r.share_bp, 0), BP);
  assert.equal(summary.top_region.region_label, 'B');
});

test('no arrivals is reported as no arrivals', () => {
  assert.equal(arrivalAnalytics([]).state, 'NO_ARRIVALS_RECORDED');
});

/* -------------------------------------------------------- backend contract */
test('the shell declares a backend contract and marks held objects honestly', () => {
  const contract = backendContract();
  assert.ok(contract.length > 0);
  for (const object of contract) {
    assert.ok(['EXISTING', 'HELD'].includes(object.status), `${object.name} has status ${object.status}`);
    assert.ok(['table', 'view', 'rpc'].includes(object.kind));
  }
  // The canonical command spine is reused, never re-declared as new.
  const command = contract.find(o => o.name === 'submit_thylora_chairman_command_v1');
  assert.equal(command.status, 'EXISTING');
  assert.equal(contract.find(o => o.name === 'thylora_departments').status, 'EXISTING');
});
