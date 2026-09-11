// RAE LINK · QYRIS error and gap handling
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classify, describe as describeGap, gapReport, humanizeConstraint, SEVERITY } from '../rae-link/lib/qyris.js';
import { parseRoute, buildHash, normalizeRoute, isParamView } from '../rae-link/lib/router.js';

test('every gap carries a route, a severity and a recovery', () => {
  for (const code of ['BACKEND_UNREACHABLE', 'NOT_PROVISIONED', 'NOT_AUTHORIZED',
                      'UPLOAD_TRANSPORT_UNCONFIGURED', 'RATE_LIMITED', 'COMMENT_HELD']) {
    const gap = describeGap(code);
    assert.ok(gap.route, `${code} has no route`);
    assert.ok(gap.recovery, `${code} has no recovery`);
    assert.ok(SEVERITY.includes(gap.severity), `${code} has an unknown severity`);
  }
});

test('a network failure is a hold, and the work is preserved', () => {
  const gap = classify({ status: 0, message: 'Backend unreachable: fetch failed' });
  assert.equal(gap.code, 'BACKEND_UNREACHABLE');
  assert.equal(gap.severity, 'HOLD');
  assert.equal(gap.work_preserved, true);
});

test('a missing table is reported as not provisioned, not as empty content', () => {
  const gap = classify({ provisionRequired: true, message: 'relation does not exist' });
  assert.equal(gap.code, 'NOT_PROVISIONED');
  assert.match(gap.recovery, /db\/rae-link/);
});

test('an authorization failure is a block that names authority, not a fault', () => {
  const gap = classify({ status: 403, message: 'new row violates row-level security policy' });
  assert.equal(gap.code, 'NOT_AUTHORIZED');
  assert.equal(gap.severity, 'BLOCK');
  assert.match(gap.recovery, /Access is not authority/);
});

test('a signed-out action is separated from an unauthorized one', () => {
  assert.equal(classify({ status: 401, message: 'invalid token' }).code, 'NOT_SIGNED_IN');
  assert.equal(classify({ status: 403, message: 'permission denied' }).code, 'NOT_AUTHORIZED');
});

test('a database constraint is translated into a sentence a person can act on', () => {
  const gap = classify({ message: 'new row for relation "rael_channels" violates check constraint "rael_channels_world_truth"' });
  assert.equal(gap.code, 'CONSTRAINT_REFUSED');
  assert.match(gap.message, /world channel must be marked simulated/i);

  assert.match(humanizeConstraint('violates check constraint "rael_consent_no_medical_detail"'),
    /does not collect medical detail/i);
  assert.match(humanizeConstraint('RAE LINK: consent 123 is revoked; partnership cannot be published'),
    /^consent 123 is revoked/);
});

test('an unclassified failure is marked FAULT and keeps the raw message', () => {
  const gap = classify(new Error('something entirely new'));
  assert.equal(gap.code, 'UNKNOWN');
  assert.equal(gap.severity, 'FAULT');
  assert.equal(gap.message, 'something entirely new');
  assert.equal(gap.work_preserved, false, 'an unknown fault does not get to claim the work is safe');
});

test('a gap already shaped by another module passes through with its catalogue entry', () => {
  const gap = classify({ code: 'UPLOAD_TRANSPORT_UNCONFIGURED', detail: 'no endpoint' });
  assert.equal(gap.route, 'providers');
  assert.equal(gap.work_preserved, true);
});

test('a gap report ranks worst first and collapses duplicates', () => {
  const report = gapReport([
    classify({ status: 0, message: 'unreachable' }),
    classify({ status: 0, message: 'unreachable' }),
    classify({ status: 403, message: 'permission denied' }),
    classify(new Error('mystery'))
  ]);
  assert.equal(report.worst, 'FAULT');
  assert.equal(report.items[0].code, 'UNKNOWN');
  assert.equal(report.items.find(i => i.code === 'BACKEND_UNREACHABLE').count, 2);
  assert.equal(report.blocking, 2);
  assert.equal(report.work_preserved, false);
});

test('routes parse, rebuild and normalize', () => {
  assert.deepEqual(parseRoute('#channel/green-milk'), { view: 'channel', param: 'green-milk' });
  assert.deepEqual(parseRoute('#player/abc-123'), { view: 'player', param: 'abc-123' });
  assert.deepEqual(parseRoute(''), { view: 'watch', param: null });
  assert.deepEqual(parseRoute('#studio'), { view: 'studio', param: null });
  assert.equal(buildHash('channel', 'green-milk'), '#channel/green-milk');
  assert.equal(buildHash('watch'), '#watch');
  assert.equal(isParamView('player'), true);
  assert.equal(isParamView('studio'), false);
});

test('a param route with no param falls back rather than rendering nothing', () => {
  assert.deepEqual(normalizeRoute(parseRoute('#channel')), { view: 'watch', param: null });
  assert.deepEqual(normalizeRoute(parseRoute('#player')), { view: 'watch', param: null });
  assert.deepEqual(normalizeRoute(parseRoute('#nope'), v => v === 'watch'), { view: 'watch', param: null });
});
