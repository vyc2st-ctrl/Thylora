// RAE LINK · creator studio — channel creation and upload custody
// Workroom: WR-RAELINK-001
//
// The creator flow, in the order the pipeline actually runs:
//   create channel → declare work → rights gate → upload → validation →
//   metadata + poster → publish-eligibility check
//
// The upload panel is honest about the one thing that is not wired: with no
// storage provider chosen, the bytes do not move. Everything else still happens
// — the file is validated, the poster is captured, the metadata and the chunk
// plan are recorded — so no creator work is lost waiting on a provider decision.

import { rpc, safeRead, getSession, currentUser } from '../lib/backend.js';
import { classify, gapReport } from '../lib/qyris.js';
import { announce, progressAnnouncer } from '../lib/a11y.js';
import { validateChannelTruth, CHANNEL_CLASSES } from '../lib/rights.js';
import { validateFile, sha256Hex, capturePoster, readMediaElementMetadata, formatBytes, normalizeMetadata, metadataProblems }
  from '../lib/media.js';
import { ResumableUpload, planChunks, resolveTransport, progressOf } from '../lib/upload.js';
import { DEPLOYMENT, uploadConfigured } from '../config.js';
import { gapPanel } from './channel.js';

const esc = (value = '') => String(value).replace(/[&<>'"]/g,
  c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));

/* ------------------------------------------------------------ channel form */

export function renderChannelForm(root) {
  root.innerHTML = `
    <form class="card form" id="channelForm">
      <h3>Create a channel</h3>
      <p class="muted">A channel declares whose media this is. An Earth channel is a real person, business or
        organization. A world channel is EdereAriah media and must say so — RAE Link will not let it appear
        as an Earth person.</p>
      <label>Channel name<input name="name" required maxlength="80" placeholder="What is this channel called?"></label>
      <label>Channel address
        <input name="slug" required pattern="[a-z0-9][a-z0-9-]{1,38}[a-z0-9]"
          placeholder="lowercase-with-hyphens" aria-describedby="slugHelp">
        <small id="slugHelp" class="muted">Used in the link: /rae-link#channel/your-address</small>
      </label>
      <label>Channel class
        <select name="channel_class" id="channelClass" required>
          ${Object.entries(CHANNEL_CLASSES).map(([key, spec]) =>
            `<option value="${key}">${esc(spec.label)}</option>`).join('')}
        </select>
      </label>
      <label id="disclosureField" hidden>Simulated-media disclosure
        <textarea name="simulated_disclosure" rows="2"
          placeholder="Stated plainly, at least 12 characters. Example: Simulated world media from EdereAriah. Not an Earth person."></textarea>
      </label>
      <label>Description<textarea name="description" rows="3"></textarea></label>
      <button type="submit">Create channel</button>
      <p class="status" id="channelStatus" role="status"></p>
    </form>`;

  const classSelect = root.querySelector('#channelClass');
  const disclosureField = root.querySelector('#disclosureField');
  const syncDisclosure = () => {
    const simulated = CHANNEL_CLASSES[classSelect.value]?.world_status === 'WORLD_SIMULATED';
    disclosureField.hidden = !simulated;
    disclosureField.querySelector('textarea').required = simulated;
  };
  classSelect.addEventListener('change', syncDisclosure);
  syncDisclosure();

  root.querySelector('#channelForm').addEventListener('submit', async event => {
    event.preventDefault();
    const status = root.querySelector('#channelStatus');
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    status.className = 'status';

    const spec = CHANNEL_CLASSES[data.channel_class];
    const truth = validateChannelTruth({
      channel_class: data.channel_class,
      world_status: spec?.world_status,
      simulated_disclosure: spec?.world_status === 'WORLD_SIMULATED' ? data.simulated_disclosure : ''
    });
    if (!truth.valid) {
      status.className = 'status bad';
      status.textContent = truth.problems.map(p => p.detail).join(' ');
      return;
    }
    if (!getSession()?.access_token) {
      status.className = 'status bad';
      status.textContent = 'Sign in under Account before creating a channel. Nothing you typed is lost.';
      return;
    }

    status.textContent = 'Creating…';
    try {
      const response = await rpc('rael_create_channel', { p_payload: data });
      if (!response?.created) {
        status.className = 'status bad';
        status.textContent = (response?.problems ?? []).map(p => p.detail).join(' ') || 'The channel was not created.';
        return;
      }
      status.className = 'status good';
      status.textContent = `Channel created · ${response.channel_code} · ${response.world_status.replace('_', ' ').toLowerCase()}`;
      announce('Channel created.');
      event.currentTarget.reset();
      syncDisclosure();
      document.dispatchEvent(new CustomEvent('rael:channels-changed'));
    } catch (error) {
      const gap = classify(error);
      status.className = 'status bad';
      status.textContent = `${gap.detail} ${gap.recovery}`;
    }
  });
}

/* ----------------------------------------------------------- upload panel */

const uploads = new Map();   // assetId → { engine, session, file }

export function renderUploadPanel(root, { assetId = null, assetTitle = '' } = {}) {
  const configured = uploadConfigured();
  root.innerHTML = `
    <div class="card" id="uploadCard">
      <h3>Upload media${assetTitle ? ` · ${esc(assetTitle)}` : ''}</h3>
      ${configured ? '' : gapPanel(classify({ code: 'UPLOAD_TRANSPORT_UNCONFIGURED' }))}
      <label>Choose a file
        <input type="file" id="uploadFile" ${assetId ? '' : 'disabled'}
          accept="video/*,audio/*,image/*,application/pdf">
      </label>
      ${assetId ? '' : '<p class="muted">Select one of your drafts first — a file belongs to a declared work, not to nothing.</p>'}
      <div id="fileReport"></div>
      <div class="progress-shell" id="progressShell" hidden>
        <div class="progress-bar"><i id="progressFill" style="width:0%"></i></div>
        <p class="progress-line"><span id="progressText">0%</span>
          <span class="muted" id="progressDetail"></span></p>
        <div class="btn-row">
          <button type="button" id="uploadPause" class="ghost">Pause</button>
          <button type="button" id="uploadResume" class="ghost" hidden>Resume</button>
        </div>
      </div>
      <p class="status" id="uploadStatus" role="status"></p>
    </div>`;

  const fileInput = root.querySelector('#uploadFile');
  if (!fileInput || !assetId) return;

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    await handleFile(root, assetId, file);
  });

  root.querySelector('#uploadPause')?.addEventListener('click', () => {
    uploads.get(assetId)?.engine?.pause();
    root.querySelector('#uploadPause').hidden = true;
    root.querySelector('#uploadResume').hidden = false;
    root.querySelector('#uploadStatus').textContent =
      'Paused. Every chunk already sent is recorded — resuming continues from there.';
  });

  root.querySelector('#uploadResume')?.addEventListener('click', async () => {
    root.querySelector('#uploadPause').hidden = false;
    root.querySelector('#uploadResume').hidden = true;
    const entry = uploads.get(assetId);
    if (entry?.engine) await runEngine(root, assetId, entry.engine);
  });
}

async function handleFile(root, assetId, file) {
  const report = root.querySelector('#fileReport');
  const status = root.querySelector('#uploadStatus');
  status.className = 'status';
  status.textContent = 'Checking the file…';

  // 1. Structural validation, before anything leaves the device.
  const headerBytes = new Uint8Array(await file.slice(0, 64).arrayBuffer());
  const validation = validateFile({ declaredMime: file.type || null, size: file.size, headerBytes });

  report.innerHTML = `
    <dl class="kv">
      <dt>File</dt><dd>${esc(file.name)}</dd>
      <dt>Size</dt><dd>${esc(formatBytes(file.size))}</dd>
      <dt>Declared type</dt><dd>${esc(file.type || 'not stated')}</dd>
      <dt>Detected type</dt><dd>${esc(validation.detected_mime ?? 'unrecognized')}</dd>
      <dt>Structural check</dt><dd class="${validation.verdict === 'CLEAN' ? 'good' : 'bad'}">${esc(validation.verdict)}</dd>
    </dl>
    ${validation.problems.length
      ? `<ul class="plain">${validation.problems.map(p => `<li>${esc(p.detail)}</li>`).join('')}</ul>` : ''}
    <p class="muted">Structural validation only — this is not a malware scan. Malware scanning is a separate
      provider stage that has not been chosen, and the publish gate blocks on it regardless of this result.</p>`;

  if (validation.verdict !== 'CLEAN') {
    status.className = 'status bad';
    status.textContent = 'The file did not pass structural validation. Nothing was uploaded.';
    return;
  }

  // 2. Poster and metadata, captured in the browser — no provider needed.
  const derived = await deriveFromFile(file);
  if (derived.poster) {
    report.insertAdjacentHTML('beforeend',
      `<figure class="poster-preview"><img src="${derived.poster.dataUrl}" alt="Captured poster frame">
       <figcaption class="muted">Poster captured in the browser at ${derived.poster.width}×${derived.poster.height}.</figcaption></figure>`);
  }

  // 3. Open (or resume) the upload session in OUR database.
  if (!getSession()?.access_token) {
    status.className = 'status bad';
    status.textContent = 'Sign in under Account before uploading. The file check and poster above are kept.';
    return;
  }

  const opened = await safeRead('upload-session', () => rpc('rael_start_upload', {
    p_payload: {
      asset_id: assetId,
      total_bytes: file.size,
      chunk_size_bytes: DEPLOYMENT.chunk_size_bytes,
      provider: uploadConfigured() ? 'tus' : 'UNCONFIGURED'
    }
  }));

  if (!opened.ok || !opened.data?.started) {
    const gap = opened.ok
      ? classify({ code: opened.data?.code === 'NOT_AUTHORIZED' ? 'NOT_AUTHORIZED' : 'CONSTRAINT_REFUSED' })
      : classify({ provisionRequired: opened.provisionRequired, message: opened.message });
    status.className = 'status bad';
    status.innerHTML = `${esc(gap.detail)} ${esc(gap.recovery)}`;
    showPlanOnly(root, file);
    return;
  }

  const session = {
    id: opened.data.session_id,
    total_bytes: Number(opened.data.total_bytes),
    chunk_size_bytes: Number(opened.data.chunk_size_bytes),
    received_chunks: opened.data.received_chunks ?? [],
    received_bytes: Number(opened.data.received_bytes ?? 0)
  };

  if (opened.data.resumed && session.received_chunks.length > 0) {
    status.textContent = `Resuming an earlier upload: ${session.received_chunks.length} of `
      + `${planChunks(session.total_bytes, session.chunk_size_bytes).length} chunks already recorded.`;
    announce('Resuming an earlier upload.');
  }

  // 4. Transport. With no provider chosen the bytes stay put and we say so.
  const transport = resolveTransport({
    endpoint: DEPLOYMENT.upload_endpoint,
    overrides: DEPLOYMENT.provider_overrides
  });
  if (!transport.ok) {
    status.className = 'status';
    status.innerHTML = `Draft, file check, poster and chunk plan are recorded. `
      + `<strong>The bytes are not uploaded:</strong> ${esc(transport.gap.detail)} `
      + `Upload resumes from chunk ${session.received_chunks.length} once a provider is chosen.`;
    showPlanOnly(root, file, session);
    await persistDerived(assetId, derived, file);
    return;
  }

  const engine = new ResumableUpload({
    file,
    session,
    transport: transport.transport,
    maxAttempts: DEPLOYMENT.max_upload_attempts,
    backoffMs: DEPLOYMENT.upload_backoff_ms,
    persist: async current => {
      const last = [...current.received_chunks].pop();
      if (last !== undefined) await rpc('rael_record_chunk', { p_session_id: session.id, p_chunk_index: last });
    }
  });
  uploads.set(assetId, { engine, session, file, derived });
  await runEngine(root, assetId, engine);
}

async function runEngine(root, assetId, engine) {
  const shell = root.querySelector('#progressShell');
  const fill = root.querySelector('#progressFill');
  const text = root.querySelector('#progressText');
  const detail = root.querySelector('#progressDetail');
  const status = root.querySelector('#uploadStatus');
  shell.hidden = false;
  const speak = progressAnnouncer({ everyPercent: 25 });

  engine.onProgress = progress => {
    fill.style.width = `${progress.percent}%`;
    text.textContent = `${progress.percent}%`;
    detail.textContent = `${progress.chunks_done} of ${progress.chunks_total} chunks · ${formatBytes(progress.bytes_sent)} of ${formatBytes(progress.bytes_total)}`;
    speak(progress.percent);
  };

  status.className = 'status';
  status.textContent = 'Uploading…';
  const result = await engine.start();

  if (result.state === 'COMPLETE') {
    const entry = uploads.get(assetId);
    const checksum = entry?.derived?.checksum ?? null;
    await rpc('rael_complete_upload', {
      p_payload: { session_id: engine.session.id, storage_key: result.storage_key, checksum_sha256: checksum }
    });
    await persistDerived(assetId, entry?.derived, entry?.file);
    status.className = 'status good';
    status.textContent = 'Upload complete. Recorded for validation.';
    announce('Upload complete.');
    document.dispatchEvent(new CustomEvent('rael:asset-changed', { detail: { assetId } }));
  } else if (result.state === 'FAILED') {
    status.className = 'status bad';
    status.textContent = `Upload stopped at chunk ${result.failed_chunk}: ${result.error}. `
      + `Everything already sent is recorded — Resume continues from there, not from zero.`;
    root.querySelector('#uploadPause').hidden = true;
    root.querySelector('#uploadResume').hidden = false;
    announce('Upload interrupted. It can be resumed.', { assertive: true });
  }
  return result;
}

function showPlanOnly(root, file, session = null) {
  const plan = planChunks(file.size, DEPLOYMENT.chunk_size_bytes);
  const progress = session ? progressOf(session, plan) : { percent: 0, chunks_done: 0, chunks_total: plan.length };
  root.querySelector('#progressShell').hidden = false;
  root.querySelector('#progressFill').style.width = `${progress.percent}%`;
  root.querySelector('#progressText').textContent = `${progress.percent}%`;
  root.querySelector('#progressDetail').textContent =
    `${progress.chunks_done} of ${plan.length} chunks recorded · ${formatBytes(file.size)} planned`;
  root.querySelector('#uploadPause').hidden = true;
}

async function persistDerived(assetId, derived, file) {
  if (!derived) return;
  const metadata = normalizeMetadata({
    title: 'placeholder', duration_seconds: derived.duration_seconds,
    width: derived.width, height: derived.height,
    byte_size: file?.size, checksum_sha256: derived.checksum
  });
  try {
    await rpc('rael_record_validation', {
      p_payload: {
        asset_id: assetId, verdict: 'CLEAN',
        declared_mime: file?.type ?? null, detected_mime: derived.detected_mime ?? null,
        details: { source: 'rae-link-studio' }
      }
    });
  } catch { /* recorded best-effort; the publish gate blocks if it did not land */ }
}

/** Read duration, dimensions, a poster frame and a content hash from the file. */
export async function deriveFromFile(file) {
  const result = { poster: null, duration_seconds: null, width: null, height: null, checksum: null };
  try {
    const bytes = new Uint8Array(await file.slice(0, 8 * 1024 * 1024).arrayBuffer());
    result.checksum = await sha256Hex(bytes);
    result.checksum_scope = file.size <= 8 * 1024 * 1024 ? 'WHOLE_FILE' : 'FIRST_8MB';
  } catch { /* hashing is best-effort in the browser */ }

  if (typeof document === 'undefined') return result;
  const url = URL.createObjectURL(file);
  try {
    if (file.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.src = url;
      await new Promise((done, fail) => {
        video.onloadeddata = done;
        video.onerror = fail;
        setTimeout(done, 4000);
      });
      Object.assign(result, readMediaElementMetadata(video));
      try {
        video.currentTime = Math.min(1, (video.duration || 2) / 2);
        await new Promise(done => { video.onseeked = done; setTimeout(done, 1500); });
        result.poster = capturePoster(video);
      } catch { /* a poster is desirable, not mandatory at this step */ }
    } else if (file.type.startsWith('image/')) {
      const image = new Image();
      image.src = url;
      await new Promise((done, fail) => { image.onload = done; image.onerror = fail; setTimeout(done, 3000); });
      Object.assign(result, readMediaElementMetadata(image));
    }
  } finally {
    URL.revokeObjectURL(url);
  }
  return result;
}

export function studioGapSummary(gaps) { return gapReport(gaps); }
