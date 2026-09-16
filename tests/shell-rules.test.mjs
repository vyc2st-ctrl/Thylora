// THYLORA APP · shell rule tests
// Workroom: WR-THYAPP-001
//
// These prove the rules the mobile shell enforces, without a browser:
// who may open the Chairman workspace, what survives a reload, and whether the
// Chairman readouts are arithmetically right.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { resolveRoute, visibleSections, sectionFromHash, OUTCOME } from '../thylora-app/lib/router.js';
import { chairmanAuthorization, serverRoles, decodeClaims, isExpired, REFUSAL,
  setResolvedRole, clearResolvedRole, CANONICAL_ROLE_TABLE }
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
test('every requested section exists in the registry, Chairman surfaces last and gated', () => {
  const required = [
    'home', 'transmissions', 'earth-watch', 'edereariah', 'ask-ersatz', 'casefiles',
    'world-map', 'store', 'my-purchases', 'my-questions', 'people', 'live-link',
    'chairman', 'media-studio'
  ];
  assert.deepEqual(SECTION_IDS, required);
  // Both Chairman surfaces are gated, and they are the last two.
  const gated = SECTIONS.filter(s => s.access === 'CHAIRMAN').map(s => s.id);
  assert.deepEqual(gated, ['chairman', 'media-studio']);
  assert.equal(section('chairman').access, 'CHAIRMAN');
  assert.equal(section('media-studio').access, 'CHAIRMAN');
});

test('the Media Studio declares every step of the required mobile flow', () => {
  const required = [
    'open-registered-asset', 'view-master-image', 'view-continuity-locks',
    'animate', 'choose-animate-mode', 'submit-to-media-router', 'see-progress',
    'preview-result', 'pencil-markup', 'attach-markup-to-revision',
    'approve-revise-reject', 'send-to-publishing-queue', 'preserve-provenance'
  ];
  const declared = section('media-studio').capabilities;
  for (const capability of required) {
    assert.ok(declared.includes(capability), `missing ${capability}`);
  }
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

test('neither Chairman surface appears in the nav unless authorized', () => {
  for (const id of ['chairman', 'media-studio']) {
    assert.equal(visibleSections(null).some(s => s.id === id), false, id);
    assert.equal(visibleSections(MEMBER_SESSION).some(s => s.id === id), false, id);
    assert.equal(visibleSections(CHAIRMAN_SESSION).some(s => s.id === id), true, id);
  }
  const gated = SECTIONS.filter(s => s.access === 'CHAIRMAN').length;
  assert.equal(visibleSections(null).length, SECTIONS.length - gated);
});

test('the Media Studio route is refused exactly like the Chairman workspace', () => {
  assert.equal(resolveRoute('media-studio', null).outcome, OUTCOME.BLOCK);
  assert.equal(resolveRoute('media-studio', null).sectionId, 'home');
  assert.equal(resolveRoute('media-studio', MEMBER_SESSION).outcome, OUTCOME.BLOCK);
  assert.equal(resolveRoute('media-studio', CHAIRMAN_SESSION).outcome, OUTCOME.ALLOW);
  assert.equal(resolveRoute('media-studio', CHAIRMAN_SESSION).sectionId, 'media-studio');
});

test('hashes are read tolerantly', () => {
  assert.equal(sectionFromHash(''), 'home');
  assert.equal(sectionFromHash('#'), 'home');
  assert.equal(sectionFromHash('#store'), 'store');
  assert.equal(sectionFromHash('#/store'), 'store');
  assert.equal(sectionFromHash('#store?ref=x'), 'store');
});

/* ------------------------------- the canonical role table (thylora_user_roles) */
test('the Chairman role is accepted from the canonical role table', () => {
  // The authoritative dashboard resolves the Chairman from thylora_user_roles,
  // not from a JWT claim. A session with NO app_metadata role must still open
  // the workspace once that table says chairman — otherwise the shell refuses
  // an identity the backend accepts.
  assert.equal(CANONICAL_ROLE_TABLE, 'thylora_user_roles');
  const plain = sessionWith({ exp: FUTURE }, { id: 'user-table', email: 'chair@thylora.test' });
  assert.equal(chairmanAuthorization(plain).authorized, false);

  // The canonical value is lowercase.
  setResolvedRole('user-table', 'chairman');
  const allowed = chairmanAuthorization(plain);
  assert.equal(allowed.authorized, true);
  assert.ok(allowed.roles.includes('CHAIRMAN'));
  assert.equal(resolveRoute('media-studio', plain).outcome, OUTCOME.ALLOW);
  clearResolvedRole();
});

test('a resolved role never leaks to a different identity', () => {
  setResolvedRole('user-table', 'chairman');
  // Same role cached, different user: must not authorize.
  const other = sessionWith({ exp: FUTURE }, { id: 'someone-else', email: 'x@y.z' });
  assert.equal(chairmanAuthorization(other).authorized, false);
  assert.equal(chairmanAuthorization(other).reason, REFUSAL.NOT_AUTHORIZED);
  clearResolvedRole();
});

test('a non-chairman row in the role table does not authorize', () => {
  const plain = sessionWith({ exp: FUTURE }, { id: 'user-ops', email: 'ops@thylora.test' });
  for (const role of ['ops', 'member', 'viewer', '', null]) {
    setResolvedRole('user-ops', role);
    assert.equal(chairmanAuthorization(plain).authorized, false, `role ${role}`);
  }
  clearResolvedRole();
});

test('clearing the resolved role closes the workspace again', () => {
  const plain = sessionWith({ exp: FUTURE }, { id: 'user-table' });
  setResolvedRole('user-table', 'CHAIRMAN');
  assert.equal(chairmanAuthorization(plain).authorized, true);
  clearResolvedRole();
  assert.equal(chairmanAuthorization(plain).authorized, false);
});

test('an expired token is refused even when the role table says chairman', () => {
  setResolvedRole('user-table', 'chairman');
  const expired = sessionWith({ exp: PAST }, { id: 'user-table' });
  assert.equal(chairmanAuthorization(expired).reason, REFUSAL.EXPIRED);
  clearResolvedRole();
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
    // 'function' is an Edge Function — the Media Router. It is not a table and
    // is never reachable through PostgREST.
    assert.ok(['table', 'view', 'rpc', 'function'].includes(object.kind),
      `${object.name} has unknown kind ${object.kind}`);
  }
  // The canonical command spine is reused, never re-declared as new.
  const command = contract.find(o => o.name === 'submit_thylora_chairman_command_v1');
  assert.equal(command.status, 'EXISTING');
  assert.equal(contract.find(o => o.name === 'thylora_departments').status, 'EXISTING');
});

test('the corrected continuity: no invented gate, approval store or margin store', () => {
  // An earlier pass of this lane declared thy_approvals, thy_margin_notes and
  // thy_is_chairman(). All three already exist canonically, so the duplicates
  // must be gone from the contract entirely.
  const names = backendContract().map(o => o.name);
  for (const invented of ['thy_approvals', 'thy_margin_notes', 'thy_is_chairman']) {
    assert.ok(!names.includes(invented), `${invented} is still declared`);
  }
  // And the canonical ones are declared as already existing.
  for (const canonical of [
    'thylora_approval_queue_safe_v1',
    'submit_thylora_review_gate_decision_v1',
    'thylora_margin_note_add_v1',
    'thylora_margin_queue_v1'
  ]) {
    const found = backendContract().find(o => o.name === canonical);
    assert.ok(found, `${canonical} is not declared`);
    assert.equal(found.status, 'EXISTING', `${canonical} must be reused, not created`);
    assert.equal(found.provisionedBy, 'CHAIRMAN_SPINE');
  }
});

test('the Media Router is an existing Edge Function, not a table this lane creates', () => {
  const router = backendContract().find(o => o.name === 'thylora-ai-router');
  assert.ok(router, 'the Media Router is not declared');
  assert.equal(router.kind, 'function');
  assert.equal(router.status, 'EXISTING');
  assert.equal(router.provisionedBy, 'AI_ROUTING');
  assert.deepEqual(router.sections, ['media-studio']);
});

test('the Media Studio reuses the existing asset registry and provenance store', () => {
  const contract = backendContract();
  for (const reused of ['rael_media_assets', 'rael_provenance_events', 'rael_rights_records']) {
    const found = contract.find(o => o.name === reused);
    assert.ok(found, `${reused} is not declared`);
    assert.equal(found.provisionedBy, 'RAE_LINK', `${reused} must stay with the RAE Link lane`);
  }
  // Serial number and QR destination come from the existing passport table.
  const passport = contract.find(o => o.name === 'digital_product_passports');
  assert.equal(passport.status, 'EXISTING');
  assert.ok(passport.sections.includes('media-studio'));
  // Publishing hands over to the existing EDF path.
  assert.equal(contract.find(o => o.name === 'thylora_edf_publish_v1').status, 'EXISTING');
});
