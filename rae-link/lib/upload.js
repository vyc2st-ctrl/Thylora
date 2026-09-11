// RAE LINK · resumable upload engine
// Workroom: WR-RAELINK-001
//
// An upload that dies at 90% must not cost the creator the other 90%. The chunk
// map lives in OUR database (rael_upload_sessions), not at the vendor, so a
// dropped connection, a closed tab or a changed storage provider all resume from
// the same record.
//
// The engine is transport-agnostic. A transport declares how the far side counts
// what it already has:
//   mode 'offset' — TUS-style: the server reports one byte offset (sequential)
//   mode 'parts'  — multipart-style: the server reports which part numbers landed
// No transport in this file carries or invents a credential. TusTransport uses
// the caller-supplied headers only; when no provider is configured the engine
// says so instead of pretending to upload.

import { resolve } from './providers.js';

export const DEFAULT_CHUNK_BYTES = 8 * 1024 * 1024;

export const UPLOAD_STATES = Object.freeze([
  'IDLE', 'PREPARING', 'UPLOADING', 'PAUSED', 'COMPLETE', 'FAILED', 'ABORTED'
]);

/** Split a byte length into an explicit, inspectable chunk plan. */
export function planChunks(totalBytes, chunkSize = DEFAULT_CHUNK_BYTES) {
  const total = Number(totalBytes);
  if (!Number.isInteger(total) || total < 0) throw new TypeError('totalBytes must be a non-negative integer');
  const size = Number(chunkSize);
  if (!Number.isInteger(size) || size <= 0) throw new TypeError('chunkSize must be a positive integer');
  const plan = [];
  for (let start = 0, index = 0; start < total; start += size, index += 1) {
    const end = Math.min(start + size, total);
    plan.push({ index, start, end, size: end - start });
  }
  return plan;
}

/** Which chunk indices a sequential byte offset accounts for. */
export function receivedFromOffset(offset, plan) {
  return plan.filter(chunk => chunk.end <= Number(offset)).map(chunk => chunk.index);
}

/** The contiguous byte offset implied by a set of received chunk indices. */
export function offsetFromReceived(received, plan) {
  const have = new Set((received ?? []).map(Number));
  let offset = 0;
  for (const chunk of plan) {
    if (!have.has(chunk.index)) break;
    offset = chunk.end;
  }
  return offset;
}

/**
 * Reconcile a stored session against what the far side actually holds.
 * The server is the authority: if it has less than we recorded, we rewind rather
 * than reporting progress that does not exist.
 */
export function reconcile(session, remote, plan) {
  const localReceived = new Set((session.received_chunks ?? []).map(Number));
  let received;
  let rewound = false;

  if (remote?.mode === 'parts') {
    received = new Set((remote.parts ?? []).map(Number));
  } else {
    received = new Set(receivedFromOffset(remote?.offset ?? 0, plan));
  }

  for (const index of localReceived) {
    if (!received.has(index)) rewound = true;
  }
  const sorted = [...received].sort((a, b) => a - b);
  return {
    received_chunks: sorted,
    received_bytes: sorted.reduce((sum, index) => sum + (plan[index]?.size ?? 0), 0),
    rewound,
    resumed_at_chunk: plan.find(chunk => !received.has(chunk.index))?.index ?? null
  };
}

export function progressOf(session, plan) {
  const total = plan.reduce((sum, chunk) => sum + chunk.size, 0);
  const done = (session.received_chunks ?? []).reduce((sum, i) => sum + (plan[i]?.size ?? 0), 0);
  return {
    bytes_sent: done,
    bytes_total: total,
    percent: total === 0 ? 100 : Math.floor((done / total) * 100),
    chunks_done: (session.received_chunks ?? []).length,
    chunks_total: plan.length
  };
}

/** Transport used by the test suite and by offline drafting. Holds bytes in memory. */
export class MemoryTransport {
  constructor({ failures = {}, mode = 'offset' } = {}) {
    this.mode = mode;
    this.received = new Map();
    this.failures = { ...failures };   // { chunkIndex: remainingFailures }
    this.attempts = [];
    this.finalized = false;
  }
  async probe() {
    const parts = [...this.received.keys()].sort((a, b) => a - b);
    if (this.mode === 'parts') return { mode: 'parts', parts };
    let offset = 0;
    for (const index of parts) {
      if (!this.received.has(index)) break;
      offset += this.received.get(index).size;
    }
    return { mode: 'offset', offset };
  }
  async sendChunk(chunk, body) {
    this.attempts.push(chunk.index);
    if (this.failures[chunk.index] > 0) {
      this.failures[chunk.index] -= 1;
      const error = new Error(`simulated transport failure on chunk ${chunk.index}`);
      error.retryable = true;
      throw error;
    }
    this.received.set(chunk.index, { size: chunk.size, body });
    return this.probe();
  }
  async finalize() {
    this.finalized = true;
    return { storage_key: `memory://${this.received.size}-chunks` };
  }
}

/**
 * TUS 1.0.0 transport — the real protocol, no vendor lock. Works against any
 * TUS server (Supabase Storage resumable, tusd, Uppy Companion). Headers are
 * supplied by the caller; this class never manufactures a credential.
 */
export class TusTransport {
  constructor({ endpoint, headers = {}, fetchImpl = globalThis.fetch } = {}) {
    if (!endpoint) throw new Error('TusTransport needs an endpoint');
    this.mode = 'offset';
    this.endpoint = endpoint;
    this.headers = headers;
    this.fetch = fetchImpl;
  }
  async probe() {
    const response = await this.fetch(this.endpoint, {
      method: 'HEAD',
      headers: { ...this.headers, 'Tus-Resumable': '1.0.0' }
    });
    if (!response.ok) {
      const error = new Error(`upload probe failed: HTTP ${response.status}`);
      error.retryable = response.status >= 500;
      throw error;
    }
    return { mode: 'offset', offset: Number(response.headers.get('Upload-Offset') || 0) };
  }
  async sendChunk(chunk, body) {
    const response = await this.fetch(this.endpoint, {
      method: 'PATCH',
      headers: {
        ...this.headers,
        'Tus-Resumable': '1.0.0',
        'Upload-Offset': String(chunk.start),
        'Content-Type': 'application/offset+octet-stream'
      },
      body
    });
    if (!response.ok) {
      const error = new Error(`chunk ${chunk.index} rejected: HTTP ${response.status}`);
      // 409/460 mean our offset is stale — recoverable by re-probing, not fatal.
      error.retryable = response.status >= 500 || response.status === 409 || response.status === 460;
      error.offsetConflict = response.status === 409 || response.status === 460;
      throw error;
    }
    return { mode: 'offset', offset: Number(response.headers.get('Upload-Offset') || chunk.end) };
  }
  async finalize() {
    const { offset } = await this.probe();
    return { storage_key: this.endpoint, bytes: offset };
  }
}

const sleep = ms => new Promise(done => setTimeout(done, ms));

/**
 * The engine. Drives a plan through a transport, persisting after every chunk so
 * progress survives anything that kills the page.
 */
export class ResumableUpload {
  constructor({
    file,
    session,
    transport,
    persist = async () => {},
    onProgress = () => {},
    onStateChange = () => {},
    maxAttempts = 5,
    backoffMs = 500,
    sleepImpl = sleep
  }) {
    if (!transport) throw new Error('ResumableUpload needs a transport');
    this.file = file;
    this.transport = transport;
    this.persist = persist;
    this.onProgress = onProgress;
    this.onStateChange = onStateChange;
    this.maxAttempts = maxAttempts;
    this.backoffMs = backoffMs;
    this.sleep = sleepImpl;

    this.session = {
      received_chunks: [],
      received_bytes: 0,
      chunk_size_bytes: DEFAULT_CHUNK_BYTES,
      ...session,
      total_bytes: session?.total_bytes ?? file?.size ?? 0
    };
    this.plan = planChunks(this.session.total_bytes, this.session.chunk_size_bytes);
    this.state = 'IDLE';
    this.lastError = null;
    this.paused = false;
    this.aborted = false;
  }

  setState(state) {
    this.state = state;
    this.onStateChange({ state, session: this.session, progress: this.progress, error: this.lastError });
  }

  get progress() { return progressOf(this.session, this.plan); }

  /** Ask the far side what it already has, and correct our record to match. */
  async recover() {
    this.setState('PREPARING');
    const remote = await this.transport.probe(this.session);
    const reconciled = reconcile(this.session, remote, this.plan);
    this.session.received_chunks = reconciled.received_chunks;
    this.session.received_bytes = reconciled.received_bytes;
    await this.persist(this.session);
    this.onProgress(this.progress);
    return reconciled;
  }

  async start() {
    this.paused = false;
    this.aborted = false;
    this.lastError = null;
    await this.recover();
    return this.run();
  }

  async resume() { return this.start(); }
  pause() { this.paused = true; this.setState('PAUSED'); }
  abort() { this.aborted = true; this.setState('ABORTED'); }

  async run() {
    this.setState('UPLOADING');
    const have = () => new Set(this.session.received_chunks.map(Number));

    for (const chunk of this.plan) {
      if (this.aborted) return { state: 'ABORTED', session: this.session, progress: this.progress };
      if (this.paused) return { state: 'PAUSED', session: this.session, progress: this.progress };
      if (have().has(chunk.index)) continue;

      let attempt = 0;
      for (;;) {
        try {
          const body = this.file?.slice ? this.file.slice(chunk.start, chunk.end) : null;
          const remote = await this.transport.sendChunk(chunk, body, this.session);
          const reconciled = reconcile(this.session, remote, this.plan);
          this.session.received_chunks = reconciled.received_chunks;
          this.session.received_bytes = reconciled.received_bytes;
          await this.persist(this.session);
          this.onProgress(this.progress);
          break;
        } catch (error) {
          attempt += 1;
          this.lastError = error;
          const retryable = error.retryable !== false;
          if (!retryable || attempt >= this.maxAttempts) {
            this.setState('FAILED');
            return {
              state: 'FAILED',
              session: this.session,
              progress: this.progress,
              error: error.message,
              // The session is intact: resume() picks up from here.
              recoverable: true,
              failed_chunk: chunk.index
            };
          }
          if (error.offsetConflict) await this.recover();
          await this.sleep(this.backoffMs * 2 ** (attempt - 1));
        }
      }
    }

    const finalized = await this.transport.finalize(this.session);
    this.session.session_state = 'COMPLETE';
    this.session.storage_key = finalized?.storage_key ?? null;
    await this.persist(this.session);
    this.setState('COMPLETE');
    return { state: 'COMPLETE', session: this.session, progress: this.progress, ...finalized };
  }
}

/**
 * Choose a transport from the provider map. Returns a gap record rather than a
 * fabricated client when no provider is configured — an unwired capability is a
 * visible gap, never a silent default or an invented credential.
 */
export function resolveTransport({ endpoint = null, headers = {}, overrides = {} } = {}) {
  const decision = resolve('resumable_upload', overrides);
  if (decision.status === 'UNRESOLVED' || !endpoint) {
    return {
      ok: false,
      gap: {
        code: 'UPLOAD_TRANSPORT_UNCONFIGURED',
        detail: endpoint
          ? 'No resumable-upload provider is chosen yet.'
          : 'No upload endpoint is configured for this deployment.',
        route: 'providers',
        alternates: decision.alternates ?? []
      }
    };
  }
  return { ok: true, transport: new TusTransport({ endpoint, headers }), provider: decision.provider };
}
