import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createClient, isExpired } from '../api/client.js';
import { CHECKS, CUT_ITEMS, summarize, projectWith, isCounted } from '../api/acceptance.js';

function memoryStorage(initial = null) {
  let v = initial;
  return { load: () => v, save: (x) => { v = x; }, clear: () => { v = null; }, peek: () => v };
}

function fakeTransport({ refreshOk = true, first401 = false } = {}) {
  const calls = { refresh: 0, request: 0, tokens: [] };
  let issued = 0;
  let sent401 = false;
  return {
    calls,
    async refresh(rt) {
      calls.refresh += 1;
      await new Promise((r) => setTimeout(r, 5));
      if (!refreshOk || rt !== 'rt-valid') throw new Error('bad refresh');
      issued += 1;
      return { access_token: `at-${issued}`, refresh_token: 'rt-valid', expires_at: 10_000 };
    },
    async request(path, init, token) {
      calls.request += 1;
      calls.tokens.push(token);
      if (first401 && !sent401) { sent401 = true; return { status: 401 }; }
      return { status: 200, path };
    },
  };
}

test('expired stored session is refreshed during restore, before any request', async () => {
  const storage = memoryStorage({ access_token: 'at-old', refresh_token: 'rt-valid', expires_at: 900 });
  const t = fakeTransport();
  const c = createClient({ transport: t, storage, now: () => 1000 });
  const r = await c.restore();
  assert.deepEqual(r, { state: 'SIGNED_IN', reason: 'RESTORED_AFTER_REFRESH' });
  assert.equal(t.calls.refresh, 1);
  assert.equal(t.calls.request, 0);
  assert.equal(storage.peek().access_token, 'at-1');
});

test('valid stored session restores without a refresh', async () => {
  const t = fakeTransport();
  const c = createClient({ transport: t, storage: memoryStorage({ access_token: 'a', refresh_token: 'rt-valid', expires_at: 5000 }), now: () => 1000 });
  assert.equal((await c.restore()).reason, 'RESTORED');
  assert.equal(t.calls.refresh, 0);
});

test('a 401 triggers exactly one refresh and one retry', async () => {
  const t = fakeTransport({ first401: true });
  const c = createClient({ transport: t, storage: memoryStorage({ access_token: 'a', refresh_token: 'rt-valid', expires_at: 5000 }), now: () => 1000 });
  const res = await c.request('/v1/dashboard/status');
  assert.equal(res.status, 200);
  assert.equal(t.calls.refresh, 1);
  assert.equal(t.calls.request, 2);
  assert.deepEqual(t.calls.tokens, ['a', 'at-1']);
});

test('concurrent expired requests share one refresh', async () => {
  const t = fakeTransport();
  const c = createClient({ transport: t, storage: memoryStorage({ access_token: 'a', refresh_token: 'rt-valid', expires_at: 900 }), now: () => 1000 });
  await Promise.all([c.request('/v1/lanes'), c.request('/v1/tasks'), c.request('/v1/audit')]);
  assert.equal(t.calls.refresh, 1);
  assert.equal(t.calls.request, 3);
});

test('failed refresh clears the session and reports why', async () => {
  const storage = memoryStorage({ access_token: 'a', refresh_token: 'rt-revoked', expires_at: 900 });
  const c = createClient({ transport: fakeTransport(), storage, now: () => 1000 });
  const r = await c.restore();
  assert.deepEqual(r, { state: 'SIGNED_OUT', reason: 'REFRESH_FAILED' });
  assert.equal(storage.peek(), null);
  assert.match(c.events.at(-1).reason, /^REFRESH_FAILED/);
});

test('isExpired applies a skew window and tolerates unknown expiry', () => {
  assert.equal(isExpired({ access_token: 'a', expires_at: 1030 }, 1000), true);
  assert.equal(isExpired({ access_token: 'a', expires_at: 1100 }, 1000), false);
  assert.equal(isExpired({ access_token: 'a' }, 1000), false);
  assert.equal(isExpired(null, 1000), true);
});

test('acceptance: percent = PASS-with-evidence / all checks, recomputed not typed', () => {
  const s = summarize();
  const manual = CHECKS.filter((c) => c.state === 'PASS' && c.evidence).length;
  assert.equal(s.passed, manual);
  assert.equal(s.total, CHECKS.length);
  assert.equal(s.percent, Math.round((manual / CHECKS.length) * 1000) / 10);
  assert.equal(s.passed + s.byState.FAIL + s.byState.BLOCKED + s.byState.NOT_TESTED + s.byState.APPROVAL, s.total);
});

test('acceptance: a PASS without evidence is not counted', () => {
  assert.equal(isCounted({ state: 'PASS', evidence: null }), false);
  assert.equal(isCounted({ state: 'PASS', evidence: '' }), false);
  const s = summarize([{ id: 'X', item: 1, state: 'PASS', evidence: null }]);
  assert.equal(s.passed, 0);
});

test('acceptance: every cut item has at least one check and every check maps to a cut item', () => {
  const items = new Set(CUT_ITEMS.map(([n]) => n));
  for (const c of CHECKS) assert.ok(items.has(c.item), `${c.id} maps to unknown item`);
  for (const [n] of CUT_ITEMS) assert.ok(CHECKS.some((c) => c.item === n), `item ${n} has no check`);
  assert.equal(new Set(CHECKS.map((c) => c.id)).size, CHECKS.length);
});

test('acceptance: every non-PASS check names its dependency or observed failure', () => {
  for (const c of CHECKS.filter((x) => x.state !== 'PASS')) {
    assert.ok(c.dependency || c.evidence, `${c.id} has neither dependency nor evidence`);
  }
});

test('acceptance: the RLS policy fix is the single largest step on the fastest path', () => {
  const base = summarize().percent;
  const rls = projectWith(['C16', 'C17', 'C18', 'C22', 'C26']).percent;
  const refresh = projectWith(['C05']).percent;
  assert.ok(rls - base > refresh - base);
});

test('acceptance: unknown state is refused', () => {
  assert.throws(() => summarize([{ id: 'X', item: 1, state: 'DONE', evidence: 'x' }]), /UNKNOWN_STATE/);
});
