// RAE LINK · resumable upload, progress and recovery
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  planChunks, receivedFromOffset, offsetFromReceived, reconcile, progressOf,
  ResumableUpload, MemoryTransport, TusTransport, resolveTransport, DEFAULT_CHUNK_BYTES
} from '../rae-link/lib/upload.js';

const CHUNK = 1000;
function fakeFile(size) {
  return { size, slice: (start, end) => ({ size: end - start, start, end }) };
}
const noSleep = async () => {};

test('a chunk plan covers every byte exactly once', () => {
  const plan = planChunks(2500, CHUNK);
  assert.equal(plan.length, 3);
  assert.deepEqual(plan.map(c => c.size), [1000, 1000, 500]);
  assert.equal(plan.at(-1).end, 2500);
  assert.equal(plan.reduce((sum, c) => sum + c.size, 0), 2500);
});

test('an empty file plans no chunks and a tiny file plans one', () => {
  assert.equal(planChunks(0, CHUNK).length, 0);
  assert.equal(planChunks(1, CHUNK).length, 1);
});

test('offset and chunk-index views of progress agree', () => {
  const plan = planChunks(2500, CHUNK);
  assert.deepEqual(receivedFromOffset(2000, plan), [0, 1]);
  assert.deepEqual(receivedFromOffset(1500, plan), [0], 'a half-sent chunk does not count as received');
  assert.equal(offsetFromReceived([0, 1], plan), 2000);
  assert.equal(offsetFromReceived([0, 2], plan), 1000, 'a gap stops the contiguous offset');
});

test('the server is the authority: a shorter remote offset rewinds local progress', () => {
  const plan = planChunks(2500, CHUNK);
  const session = { received_chunks: [0, 1], received_bytes: 2000 };
  const result = reconcile(session, { mode: 'offset', offset: 1000 }, plan);
  assert.deepEqual(result.received_chunks, [0]);
  assert.equal(result.received_bytes, 1000);
  assert.equal(result.rewound, true);
  assert.equal(result.resumed_at_chunk, 1);
});

test('a completed upload reconciles to no remaining chunk', () => {
  const plan = planChunks(2500, CHUNK);
  const result = reconcile({ received_chunks: [] }, { mode: 'offset', offset: 2500 }, plan);
  assert.deepEqual(result.received_chunks, [0, 1, 2]);
  assert.equal(result.resumed_at_chunk, null);
});

test('an upload runs to completion and reports progress as it goes', async () => {
  const transport = new MemoryTransport();
  const seen = [];
  const engine = new ResumableUpload({
    file: fakeFile(2500),
    session: { total_bytes: 2500, chunk_size_bytes: CHUNK },
    transport,
    onProgress: p => seen.push(p.percent),
    sleepImpl: noSleep
  });
  const result = await engine.start();
  assert.equal(result.state, 'COMPLETE');
  assert.equal(result.progress.percent, 100);
  // The first report is the recovered starting point (0%), which is what makes a
  // resumed upload show its true position before it sends anything.
  assert.deepEqual(seen, [0, 40, 80, 100]);
  assert.equal(transport.finalized, true);
});

test('a transient failure is retried and the upload still completes', async () => {
  const transport = new MemoryTransport({ failures: { 1: 2 } });
  const engine = new ResumableUpload({
    file: fakeFile(2500),
    session: { total_bytes: 2500, chunk_size_bytes: CHUNK },
    transport, sleepImpl: noSleep
  });
  const result = await engine.start();
  assert.equal(result.state, 'COMPLETE');
  // chunk 1 was attempted three times; chunks 0 and 2 once each
  assert.equal(transport.attempts.filter(i => i === 1).length, 3);
  assert.equal(transport.attempts.filter(i => i === 0).length, 1);
});

test('a persistent failure fails the upload but preserves the session for resume', async () => {
  const transport = new MemoryTransport({ failures: { 1: 99 } });
  const persisted = [];
  const engine = new ResumableUpload({
    file: fakeFile(2500),
    session: { total_bytes: 2500, chunk_size_bytes: CHUNK },
    transport, maxAttempts: 3, sleepImpl: noSleep,
    persist: async s => persisted.push([...s.received_chunks])
  });
  const result = await engine.start();
  assert.equal(result.state, 'FAILED');
  assert.equal(result.recoverable, true);
  assert.equal(result.failed_chunk, 1);
  assert.deepEqual(result.session.received_chunks, [0], 'chunk 0 stays recorded');
  assert.equal(result.progress.percent, 40);
  assert.deepEqual(persisted.at(-1), [0], 'progress was persisted before the failure');
});

test('resume continues from the recorded point and never re-sends a finished chunk', async () => {
  const transport = new MemoryTransport({ failures: { 1: 99 } });
  const engine = new ResumableUpload({
    file: fakeFile(2500), session: { total_bytes: 2500, chunk_size_bytes: CHUNK },
    transport, maxAttempts: 2, sleepImpl: noSleep
  });
  await engine.start();
  const attemptsBefore = transport.attempts.filter(i => i === 0).length;

  transport.failures[1] = 0;          // the network comes back
  const resumed = await engine.resume();

  assert.equal(resumed.state, 'COMPLETE');
  assert.equal(transport.attempts.filter(i => i === 0).length, attemptsBefore,
    'chunk 0 was not re-sent after resume');
});

test('a brand new engine recovers a half-finished upload from the server', async () => {
  const transport = new MemoryTransport();
  const first = new ResumableUpload({
    file: fakeFile(2500), session: { total_bytes: 2500, chunk_size_bytes: CHUNK },
    transport, sleepImpl: noSleep
  });
  first.pause();
  await first.recover();
  await transport.sendChunk(planChunks(2500, CHUNK)[0], null);   // one chunk lands

  // Simulate a closed tab: a fresh engine with an empty local record.
  const second = new ResumableUpload({
    file: fakeFile(2500), session: { total_bytes: 2500, chunk_size_bytes: CHUNK, received_chunks: [] },
    transport, sleepImpl: noSleep
  });
  const recovered = await second.recover();
  assert.deepEqual(recovered.received_chunks, [0]);
  assert.equal(recovered.resumed_at_chunk, 1);
  const result = await second.run();
  assert.equal(result.state, 'COMPLETE');
});

test('pause stops the upload without losing recorded chunks', async () => {
  const transport = new MemoryTransport();
  let pausedOnce = false;
  const engine = new ResumableUpload({
    file: fakeFile(5000), session: { total_bytes: 5000, chunk_size_bytes: CHUNK },
    transport, sleepImpl: noSleep,
    // One-shot: on resume the engine re-reports 2 chunks done, which is correct,
    // so a standing handler would pause it again forever.
    onProgress: p => { if (!pausedOnce && p.chunks_done === 2) { pausedOnce = true; engine.pause(); } }
  });
  const result = await engine.start();
  assert.equal(result.state, 'PAUSED');
  assert.equal(result.session.received_chunks.length, 2);

  const finished = await engine.resume();
  assert.equal(finished.state, 'COMPLETE');
  assert.equal(finished.progress.percent, 100);
});

test('a non-retryable failure stops immediately instead of burning attempts', async () => {
  const transport = {
    mode: 'offset',
    probe: async () => ({ mode: 'offset', offset: 0 }),
    sendChunk: async () => { const e = new Error('rejected'); e.retryable = false; throw e; },
    finalize: async () => ({})
  };
  let slept = 0;
  const engine = new ResumableUpload({
    file: fakeFile(2500), session: { total_bytes: 2500, chunk_size_bytes: CHUNK },
    transport, sleepImpl: async () => { slept += 1; }
  });
  const result = await engine.start();
  assert.equal(result.state, 'FAILED');
  assert.equal(slept, 0, 'no backoff waiting on a permanent rejection');
});

test('progress is reported in both bytes and chunks', () => {
  const plan = planChunks(2500, CHUNK);
  const progress = progressOf({ received_chunks: [0, 1] }, plan);
  assert.equal(progress.bytes_sent, 2000);
  assert.equal(progress.bytes_total, 2500);
  assert.equal(progress.percent, 80);
  assert.equal(progress.chunks_done, 2);
  assert.equal(progress.chunks_total, 3);
});

test('a multipart transport reports parts rather than one offset', async () => {
  const transport = new MemoryTransport({ mode: 'parts' });
  const engine = new ResumableUpload({
    file: fakeFile(2500), session: { total_bytes: 2500, chunk_size_bytes: CHUNK },
    transport, sleepImpl: noSleep
  });
  const result = await engine.start();
  assert.equal(result.state, 'COMPLETE');
  assert.deepEqual((await transport.probe()).parts, [0, 1, 2]);
});

test('no upload provider means a named gap, never a fabricated client', () => {
  const unconfigured = resolveTransport({ endpoint: null });
  assert.equal(unconfigured.ok, false);
  assert.equal(unconfigured.gap.code, 'UPLOAD_TRANSPORT_UNCONFIGURED');
  assert.equal(unconfigured.gap.route, 'providers');

  const configured = resolveTransport({
    endpoint: 'https://example.invalid/upload/abc',
    overrides: { resumable_upload: 'tus' }
  });
  assert.equal(configured.ok, true);
  assert.ok(configured.transport instanceof TusTransport);
});

test('the TUS transport speaks the real protocol and carries no credential of its own', async () => {
  const calls = [];
  const transport = new TusTransport({
    endpoint: 'https://example.invalid/upload/abc',
    headers: { Authorization: 'Bearer caller-supplied' },
    fetchImpl: async (url, options) => {
      calls.push({ url, method: options.method, headers: options.headers });
      return {
        ok: true,
        headers: { get: name => (name === 'Upload-Offset' ? '1000' : null) }
      };
    }
  });
  await transport.probe();
  await transport.sendChunk({ index: 0, start: 0, end: 1000, size: 1000 }, null);

  assert.equal(calls[0].method, 'HEAD');
  assert.equal(calls[1].method, 'PATCH');
  assert.equal(calls[1].headers['Tus-Resumable'], '1.0.0');
  assert.equal(calls[1].headers['Upload-Offset'], '0');
  assert.equal(calls[1].headers['Content-Type'], 'application/offset+octet-stream');
  assert.equal(calls[1].headers.Authorization, 'Bearer caller-supplied',
    'the transport passes the caller header through and invents none');
});

test('an offset conflict re-probes instead of failing the upload', async () => {
  let sent = 0;
  const transport = {
    mode: 'offset',
    probe: async () => ({ mode: 'offset', offset: sent ? 1000 : 0 }),
    sendChunk: async chunk => {
      if (chunk.index === 0 && sent === 0) {
        sent = 1;
        const e = new Error('conflict'); e.retryable = true; e.offsetConflict = true; throw e;
      }
      return { mode: 'offset', offset: Math.max(1000, chunk.end) };
    },
    finalize: async () => ({ storage_key: 'k' })
  };
  const engine = new ResumableUpload({
    file: fakeFile(2000), session: { total_bytes: 2000, chunk_size_bytes: CHUNK },
    transport, sleepImpl: noSleep
  });
  const result = await engine.start();
  assert.equal(result.state, 'COMPLETE');
});

test('the default chunk size is a sane 8 MiB', () => {
  assert.equal(DEFAULT_CHUNK_BYTES, 8 * 1024 * 1024);
});
