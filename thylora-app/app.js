// THYLORA APP · surface controller
// Workroom: WR-THYAPP-001
//
// The rules live in lib/. This file only moves them onto the screen, so the
// shell and the backend cannot drift apart:
//   - every backend object it touches is declared in lib/registry.js
//   - every access decision comes from lib/router.js
//   - every number in the Chairman readouts comes from lib/analytics.js
//   - the session comes from the canonical client and is shared with the
//     member app and RAE Link
//
// Nothing here invents a table, a second storefront or a second Chairman
// command path.

import { api, rpc, probe, safeRead, invokeFunction, getSession, signIn, signOut, isSignedIn, BACKEND_PROJECT }
  from '../lib/thylora-backend.js';
import { SECTIONS, SECTION_IDS, DEFAULT_SECTION, SERVICES, section, heldObjects }
  from './lib/registry.js';
import { resolveRoute, visibleSections, sectionFromHash, OUTCOME } from './lib/router.js';
import { chairmanAuthorization, memberAuthorization, setResolvedRole, clearResolvedRole,
  CANONICAL_ROLE_TABLE } from './lib/identity.js';
import { loadState, saveState, patchDrafts, toggleFollow, isFollowing, storageDurable }
  from './lib/state.js';
import { moneyDistanceView, arrivalAnalytics, promptCoverageLedger, isCoordinate,
  formatMinor, formatBp, formatKm } from './lib/analytics.js';
import {
  MEDIA_ROUTER_FUNCTION, ANIMATE_MODES, DEFAULT_MODE, animateRequest, readRouterResponse,
  settleReturnedJob, generationClaim, jobProgress, continuityLocks, qrDestination,
  markupPoint, markupSummary, isPencil, revisionRequest, decisionPayload, publishHandoff
} from './lib/media-studio.js';

const $ = id => document.getElementById(id);
const esc = (value = '') => String(value ?? '').replace(/[&<>'"]/g,
  c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
const num = value => Number(value ?? 0).toLocaleString('en-US');

// Readback speed is shared with the member app's witnessed hotfix so a reader
// who set their speed once does not have to set it again here.
const RATE_KEY = 'thylora_speech_rate';
const DEFAULT_RATE = '1.25';
const readRate = () => { try { return localStorage.getItem(RATE_KEY) || DEFAULT_RATE; } catch { return DEFAULT_RATE; } };
const writeRate = v => { try { localStorage.setItem(RATE_KEY, String(v)); } catch { /* not durable */ } };

const PROVISION_HINT = 'Apply db/thylora-app/0001…0004 to the thylora-dash backend.';

/* ------------------------------------------------------------------ notices */
function notice(element, { title, detail, hint = null, bad = false }) {
  if (!element) return;
  element.hidden = false;
  element.className = `notice${bad ? ' bad' : ''}`;
  element.innerHTML = `<strong>${esc(title)}</strong><span>${esc(detail)}</span>` +
    (hint ? `<code>${esc(hint)}</code>` : '');
}
function clearNotice(element) { if (element) { element.hidden = true; element.innerHTML = ''; } }

/**
 * Turn a failed read into an honest on-screen state. A missing table is
 * reported as "not provisioned yet" and an unreachable backend as unreachable;
 * neither is ever drawn as an empty list, which would read as "no content".
 */
function reportFailure(noticeEl, listEl, label, result) {
  const unreachable = result.unreachable;
  notice(noticeEl, unreachable
    ? { title: 'Backend unreachable',
        detail: `${label} could not be loaded because this device cannot reach the THYLORA backend. Nothing has been lost; the read will resume when the backend is reachable.`,
        bad: true }
    : result.provisionRequired
      ? { title: `${label} is not provisioned yet`,
          detail: 'The schema for this surface is written and reviewable but has not been applied to the live backend. This is not an empty feed.',
          hint: PROVISION_HINT }
      : { title: `${label} did not load`, detail: result.message, bad: true });
  if (listEl) listEl.innerHTML = `<p class="muted">${esc(label)} unavailable.</p>`;
}

/* ------------------------------------------------- registry-driven transport */
function refFor(sectionId, name) {
  const target = section(sectionId);
  return [...(target?.reads ?? []), ...(target?.writes ?? [])].find(r => r.name === name) ?? null;
}

function refPath(ref, extra = []) {
  const params = [];
  if (ref.select) params.push(`select=${ref.select}`);
  if (ref.filter) params.push(ref.filter);
  if (ref.order) params.push(`order=${ref.order}`);
  if (ref.limit) params.push(`limit=${ref.limit}`);
  params.push(...extra);
  return `/rest/v1/${ref.name}${params.length ? `?${params.join('&')}` : ''}`;
}

/** Read one declared object. Never throws; returns the safeRead envelope. */
function readRef(sectionId, name, extra = []) {
  const ref = refFor(sectionId, name);
  if (!ref) return Promise.resolve({ ok: false, label: name, message: `${name} is not declared in the registry.`, provisionRequired: false });
  return safeRead(name, () => api(refPath(ref, extra)));
}

/* ------------------------------------------------------------------ posture */
async function checkBackend() {
  const chip = $('backendChip');
  const report = await probe([
    ['site metrics', () => rpc(SERVICES.SITE_METRICS.totals)],
    ['departments', () => api(`/rest/v1/${SERVICES.CHAIRMAN_COMMAND.departments}?select=department_code&limit=1`)],
    ['storefront', () => api(`/rest/v1/${SERVICES.STOREFRONT.products}?select=id&limit=1`)],
    ['transmissions', () => api('/rest/v1/thy_transmissions?select=transmission_code&limit=1')],
    ['casefiles', () => api('/rest/v1/thy_casefiles?select=casefile_code&limit=1')]
  ]);

  const label = {
    READY: ['BACKEND · READY', 'ok'],
    PARTIAL: ['BACKEND · PARTIAL', 'warn'],
    NOT_PROVISIONED: ['BACKEND · NOT PROVISIONED', 'warn'],
    UNREACHABLE: ['BACKEND · UNREACHABLE', 'bad']
  }[report.state];
  chip.textContent = label[0];
  chip.className = `chip ${label[1]}`;

  const posture = $('homePosture');
  const held = heldObjects().length;
  posture.innerHTML = `
    <div class="rows">
      <div class="row"><div><strong>Canonical backend</strong><span>One project for every THYLORA surface. This shell adds no second backend.</span></div>
        <div class="row-actions"><code>${esc(BACKEND_PROJECT)}</code></div></div>
      <div class="row"><div><strong>Reachable surfaces</strong><span>${report.provisioned.length ? esc(report.provisioned.join(', ')) : 'none from this device right now'}</span></div></div>
      <div class="row"><div><strong>Not provisioned yet</strong><span>${report.missing.length ? esc(report.missing.join(', ')) : 'none reported'} · ${held} declared object${held === 1 ? '' : 's'} held for Chairman application</span></div></div>
    </div>`;

  if (report.state !== 'READY') {
    notice($('homeNotice'), report.state === 'UNREACHABLE'
      ? { title: 'Backend unreachable from this device',
          detail: 'The shell is loaded and every control works, but no live THYLORA data can be read until the backend is reachable. Nothing is being shown as empty that is merely unreachable.',
          bad: true }
      : { title: 'Some surfaces are not provisioned yet',
          detail: `These reads are not available on the live backend yet: ${report.missing.join(', ') || 'unknown'}. Each affected panel says so in place of showing an empty list.`,
          hint: PROVISION_HINT });
  } else {
    clearNotice($('homeNotice'));
  }
  return report;
}

/* --------------------------------------------------------------------- nav */
function buildNav() {
  const tabs = $('tabs');
  const visible = visibleSections(getSession());
  tabs.innerHTML = visible.map(s =>
    `<button type="button" data-view="${esc(s.id)}"${s.access === 'CHAIRMAN' ? ' class="chairman-tab"' : ''}>${esc(s.label)}</button>`
  ).join('') + '<button type="button" data-view="account">Account</button>';
}

/* ------------------------------------------------------------------ routing */
const LOADERS = {
  home: loadHome,
  transmissions: loadTransmissions,
  'earth-watch': loadEarthWatch,
  edereariah: loadEdereAriah,
  'ask-ersatz': loadAskErsatz,
  casefiles: loadCasefiles,
  'world-map': loadWorldMap,
  store: loadStore,
  'my-purchases': loadPurchases,
  'my-questions': loadMyQuestions,
  people: loadPeople,
  'live-link': loadLiveLink,
  chairman: loadChairman,
  'media-studio': loadMediaStudio
};

function showView(requested) {
  const session = getSession();
  // 'account' is the shell's own surface, not a registry section.
  const isAccount = requested === 'account';
  const route = isAccount
    ? { sectionId: 'account', outcome: OUTCOME.ALLOW, requested: 'account', redirected: false, message: null }
    : resolveRoute(requested, session);

  // A blocked Chairman route is not drawn at all, so an unauthorized reader
  // never sees its shape. The backend refuses the same identity separately.
  if (route.outcome === OUTCOME.BLOCK) {
    notice($('routeNotice'), {
      title: 'Chairman workspace not opened',
      detail: `${route.message} You have been returned to Home.`,
      bad: true
    });
  } else {
    clearNotice($('routeNotice'));
  }

  const target = route.sectionId;
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active-view', v.id === target));
  document.querySelectorAll('[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === target));

  const label = isAccount ? 'Account' : (section(target)?.label ?? 'Home');
  $('surfaceTitle').textContent = label;
  if (location.hash.slice(1) !== target) history.replaceState(null, '', `#${target}`);
  saveState({ section: target });

  const loader = LOADERS[target];
  if (loader) loader(route);
  return route;
}

document.addEventListener('click', event => {
  const trigger = event.target?.closest?.('[data-view]');
  if (!trigger) return;
  event.preventDefault();
  showView(trigger.dataset.view);
});
window.addEventListener('hashchange', () => showView(sectionFromHash(location.hash)));

/* --------------------------------------------------------------------- auth */
/**
 * Resolve the Chairman role from the CANONICAL `thylora_user_roles` table, the
 * same way the authoritative dashboard does. Without this the shell would read
 * only the JWT claim and refuse a Chairman the backend accepts.
 *
 * The read is RLS-protected, so a member cannot read a role they do not have.
 * A failure clears the role rather than leaving a stale one in place.
 */
async function resolveChairmanRole() {
  const session = getSession();
  if (!session?.user?.id) { clearResolvedRole(); return null; }
  const result = await safeRead('role', () => api(
    `/rest/v1/${CANONICAL_ROLE_TABLE}?select=role,display_name&user_id=eq.${encodeURIComponent(session.user.id)}`
  ));
  if (!result.ok) { clearResolvedRole(); return null; }
  const row = Array.isArray(result.data) ? result.data[0] ?? null : result.data ?? null;
  setResolvedRole(session.user.id, row?.role ?? null);
  return row?.role ?? null;
}

function authUI() {
  const session = getSession();
  const signed = isSignedIn();
  const member = memberAuthorization(session);
  const chairman = chairmanAuthorization(session);

  $('signedOut').hidden = signed;
  $('signedIn').hidden = !signed;
  $('whoChip').textContent = signed ? `SIGNED IN · ${member.identity?.label ?? 'member'}` : 'SIGNED OUT';
  $('whoChip').className = `chip who ${signed ? 'ok' : ''}`;
  if (signed) $('memberLabel').textContent = `Signed in · ${member.identity?.label ?? 'protected member'}`;
  $('chIdentity').textContent = chairman.authorized
    ? `Authorized · ${chairman.identity.label} · roles ${chairman.roles.join(', ')}`
    : '';
  $('storageState').textContent = storageDurable()
    ? 'Your language, subtitle and draft choices persist on this device.'
    : 'This device is not allowing local storage, so your choices last only for this session.';
  buildNav();
}

$('signInForm')?.addEventListener('submit', async event => {
  event.preventDefault();
  const status = $('authStatus');
  const email = $('signInEmail').value.trim();
  const password = $('signInPassword').value;
  if (!email || !password) { status.textContent = 'Enter email and password.'; return; }
  status.textContent = 'Signing in…';
  try {
    await signIn(email, password);
    $('signInPassword').value = '';
    status.textContent = 'Signed in.';
    await resolveChairmanRole();
    authUI();
    await checkBackend();
    showView(loadState().section || DEFAULT_SECTION);
  } catch (error) {
    status.textContent = `Sign-in did not complete: ${error.message}`;
  }
});

$('signOutBtn')?.addEventListener('click', () => {
  signOut();
  clearResolvedRole();
  authUI();
  $('authStatus').textContent = 'Signed out.';
  showView(DEFAULT_SECTION);
});

/* -------------------------------------------------------------------- HOME */
async function loadHome() {
  const rooms = $('homeRooms');
  rooms.innerHTML = visibleSections(getSession())
    .filter(s => s.id !== 'home')
    .map(s => `<button type="button" class="card" data-view="${esc(s.id)}">
      <strong>${esc(s.icon)} ${esc(s.label)}</strong><span>${esc(s.summary)}</span></button>`)
    .join('');

  const metrics = await safeRead('metrics', () => rpc(SERVICES.SITE_METRICS.totals));
  if (metrics.ok) {
    const totals = metrics.data?.totals ?? {};
    $('homeArrivals').textContent = num(totals.page_opens);
    $('homeSessions').textContent = num(totals.sessions);
    $('homeUnits').textContent = Number(totals.verified_units_sold ?? 0) > 0
      ? num(totals.verified_units_sold) : 'none yet';
  } else {
    for (const id of ['homeArrivals', 'homeSessions', 'homeUnits']) $(id).textContent = '—';
  }
}

/* ----------------------------------------------------------- TRANSMISSIONS */
let transmissionTracks = [];

async function loadTransmissions() {
  const list = $('txList');
  const state = loadState();
  $('txSubtitles').checked = state.englishSubtitles;

  const [transmissions, tracks] = await Promise.all([
    readRef('transmissions', 'thy_transmissions'),
    readRef('transmissions', 'thy_transmission_tracks')
  ]);

  if (!transmissions.ok) {
    $('txStatus').textContent = '';
    reportFailure($('txNotice'), list, 'Transmissions', transmissions);
    renderLanguages([]);
    return;
  }
  clearNotice($('txNotice'));
  transmissionTracks = tracks.ok ? (tracks.data ?? []) : [];

  const rows = transmissions.data ?? [];
  $('txStatus').textContent = `${rows.length} transmission${rows.length === 1 ? '' : 's'} · language and subtitle choices are remembered on this device.`;
  list.innerHTML = rows.length ? rows.map(t => `
    <button type="button" class="card" data-transmission="${esc(t.transmission_code)}">
      <strong>${esc(t.title)}</strong>
      <span>${esc(t.synopsis ?? '')}</span>
      <small>${esc(t.bureau_code ?? 'THYLORA')} · ${esc(t.publish_state ?? 'STATE UNKNOWN')} · ${Math.round(Number(t.runtime_seconds ?? 0) / 60)} min</small>
    </button>`).join('')
    : '<p class="muted">No transmission has been published yet.</p>';

  list.querySelectorAll('[data-transmission]').forEach(card =>
    card.addEventListener('click', () => openTransmission(card.dataset.transmission, card)));
  renderLanguages(transmissionTracks);
}

function renderLanguages(tracks) {
  const select = $('txLanguage');
  const state = loadState();
  const languages = [...new Map(
    tracks.filter(t => t.language_code)
      .map(t => [t.language_code, t.language_label || t.language_code])
  ).entries()];
  // Never offer a language the backend has not actually published a track for.
  select.innerHTML = languages.length
    ? languages.map(([code, label]) =>
        `<option value="${esc(code)}"${code === state.languageCode ? ' selected' : ''}>${esc(label)}</option>`).join('')
    : '<option value="">No language track published yet</option>';
  select.disabled = languages.length === 0;
}

function openTransmission(code, card) {
  const state = saveState({ lastTransmission: code }).state;
  document.querySelectorAll('[data-transmission]').forEach(c => c.classList.toggle('active', c === card));
  const track = transmissionTracks.find(t =>
    t.transmission_code === code && t.language_code === state.languageCode) ?? null;
  const player = $('txPlayer');
  const empty = $('txPlayerEmpty');

  // The registry does not expose a media URL, so the shell does not fabricate
  // one. It says what it has and what it is still waiting for.
  empty.hidden = false;
  empty.textContent = track
    ? `Selected ${code} · ${track.language_label || track.language_code}${state.englishSubtitles ? ' · English subtitles on' : ' · subtitles off'}. The playable media URL is delivered by the transmission media service once provisioned.`
    : `Selected ${code}. No published track matches your chosen language yet.`;
  player.removeAttribute('src');
  player.load?.();
  $('txStatus').textContent = `Opened ${code}.`;
}

$('txLanguage')?.addEventListener('change', event => {
  saveState({ languageCode: event.target.value });
  const state = loadState();
  if (state.lastTransmission) {
    openTransmission(state.lastTransmission,
      document.querySelector(`[data-transmission="${CSS.escape(state.lastTransmission)}"]`));
  }
});

$('txSubtitles')?.addEventListener('change', event => {
  const { durable } = saveState({ englishSubtitles: event.target.checked });
  $('txStatus').textContent = `English subtitles ${event.target.checked ? 'on' : 'off'}${durable ? '' : ' (this device is not saving preferences)'}.`;
});

$('txReadback')?.addEventListener('click', () => speak($('transmissions')));

/* ------------------------------------------------------------- EARTH WATCH */
async function loadEarthWatch() {
  const list = $('ewList');
  const result = await readRef('earth-watch', 'thy_earth_watch_signals');
  if (!result.ok) return reportFailure($('ewNotice'), list, 'Earth Watch', result);
  clearNotice($('ewNotice'));
  const rows = result.data ?? [];
  list.innerHTML = rows.length ? rows.map(s => `
    <button type="button" class="card"${s.casefile_code ? ` data-casefile="${esc(s.casefile_code)}"` : ' aria-disabled="true"'}>
      <strong>${esc(s.headline)}</strong>
      <span>${esc(s.earth_place ?? '')} · ${esc(s.signal_class ?? '')}</span>
      <small>Confidence ${esc(s.confidence_state ?? 'NOT STATED')}</small>
      ${s.casefile_code ? '<span class="flag">Open casefile</span>' : '<span class="flag">No casefile attached</span>'}
    </button>`).join('')
    : '<p class="muted">No Earth Watch signal recorded yet.</p>';
  list.querySelectorAll('[data-casefile]').forEach(card =>
    card.addEventListener('click', () => crossToCasefile(card.dataset.casefile)));
}

/* -------------------------------------------------------------- EDEREARIAH */
async function loadEdereAriah() {
  const list = $('edList');
  const result = await readRef('edereariah', 'rael_channels');
  if (!result.ok) return reportFailure($('edNotice'), list, 'The EdereAriah companion', result);
  clearNotice($('edNotice'));
  const rows = result.data ?? [];
  list.innerHTML = rows.length ? rows.map(c => `
    <div class="card" aria-disabled="true">
      <strong>${esc(c.display_name)}</strong>
      <span>${esc(c.channel_class)} · ${esc(c.world_status)}</span>
      <span class="flag">${esc(c.simulated_disclosure || 'World-simulated')}</span>
    </div>`).join('')
    : '<p class="muted">No mirror-world channel is published yet.</p>';
}

/* --------------------------------------------------------------- ASK ERSATZ */
function loadAskErsatz() {
  const state = loadState();
  $('askText').value = state.drafts.question;
  $('askDraftState').textContent = state.drafts.question
    ? 'An unsent question is saved on this device.' : '';
}

$('askText')?.addEventListener('input', event => {
  const { durable } = patchDrafts({ question: event.target.value });
  $('askDraftState').textContent = event.target.value
    ? (durable ? 'Draft saved on this device.' : 'Draft kept for this session only.') : '';
});

$('askClear')?.addEventListener('click', () => {
  patchDrafts({ question: '' });
  $('askText').value = '';
  $('askDraftState').textContent = '';
  $('askStatus').textContent = '';
});

$('askForm')?.addEventListener('submit', async event => {
  event.preventDefault();
  // Hold a stable reference: Safari can null event.currentTarget after an await.
  const status = $('askStatus');
  const button = $('askSubmit');
  const text = $('askText').value.trim();
  if (!text) { status.textContent = 'Write your question first.'; return; }

  const write = refFor('ask-ersatz', 'submit_ersatz_question_v1');
  button.disabled = true;
  status.textContent = 'Submitting to Ersatz…';
  try {
    const created = await rpc(write.name, { p_question_text: text });
    patchDrafts({ question: '' });
    $('askText').value = '';
    $('askDraftState').textContent = '';
    status.textContent = `Question submitted · ${created?.question_code ?? 'recorded'}. Answers are labelled as interpretations.`;
    clearNotice($('aeNotice'));
  } catch (error) {
    // The draft is deliberately kept so the reader does not lose their words.
    if (error.provisionRequired) {
      notice($('aeNotice'), {
        title: 'Ask Ersatz is not provisioned yet',
        detail: 'Your question was not sent and has been kept as a draft on this device. The submission path is written and reviewable but not yet applied to the live backend.',
        hint: PROVISION_HINT
      });
      status.textContent = 'Not sent. Your question is saved as a draft.';
    } else {
      status.textContent = `Not sent: ${error.message}. Your question is saved as a draft.`;
    }
  } finally {
    button.disabled = false;
  }
});

/* ---------------------------------------------------------------- CASEFILES */
let casefileEvidence = [];
// Set when arriving from another section: loadCasefiles() opens it once the
// evidence has actually arrived, instead of the caller racing the fetch.
let pendingCasefile = null;
// Whether the evidence read itself succeeded. "No rows for this casefile" and
// "the evidence table is not provisioned" are different facts and must not be
// reported with the same sentence.
let evidenceRead = { ok: false, provisionRequired: false, message: '' };

async function loadCasefiles() {
  const list = $('cfList');
  const [casefiles, evidence] = await Promise.all([
    readRef('casefiles', 'thy_casefiles'),
    readRef('casefiles', 'thy_casefile_evidence')
  ]);
  if (!casefiles.ok) return reportFailure($('cfNotice'), list, 'Casefiles', casefiles);
  clearNotice($('cfNotice'));
  casefileEvidence = evidence.ok ? (evidence.data ?? []) : [];
  evidenceRead = {
    ok: evidence.ok,
    provisionRequired: Boolean(evidence.provisionRequired),
    message: evidence.message ?? ''
  };

  const rows = casefiles.data ?? [];
  list.innerHTML = rows.length ? rows.map(c => `
    <button type="button" class="card" data-casefile="${esc(c.casefile_code)}">
      <strong>${esc(c.title)}</strong>
      <span>${esc(c.subject_summary ?? '')}</span>
      <small>${esc(c.casefile_code)} · confidence ${esc(c.confidence_state ?? 'NOT STATED')}</small>
    </button>`).join('')
    : '<p class="muted">No casefile has been opened yet.</p>';
  list.querySelectorAll('[data-casefile]').forEach(card =>
    card.addEventListener('click', () => openCasefile(card.dataset.casefile)));

  // Honour a casefile requested from another section now that evidence is in.
  if (pendingCasefile) {
    const requested = pendingCasefile;
    pendingCasefile = null;
    openCasefile(requested);
  }
}

function openCasefile(code) {
  const detail = $('cfDetail');
  const items = casefileEvidence.filter(e => e.casefile_code === code);
  detail.hidden = false;

  const body = items.length
    ? `<div class="rows">${items.map(e => `
        <div class="row"><div>
          <strong>${esc(e.evidence_code)} · ${esc(e.evidence_kind ?? 'document')}</strong>
          <span>Source ${esc(e.source_label ?? 'not stated')}</span>
        </div><div class="row-actions">
          <span class="flag">provenance ${esc(e.provenance_state ?? 'not stated')}</span>
          <span class="flag">confidence ${esc(e.confidence_state ?? 'not stated')}</span>
        </div></div>`).join('')}</div>`
    : evidenceRead.ok
      ? '<p class="muted">No evidence rows are attached to this casefile on the backend yet.</p>'
      : evidenceRead.provisionRequired
        ? `<p class="muted">The evidence table is not provisioned yet, so this casefile's evidence cannot be read. This is not the same as a casefile with no evidence.</p><code>${esc(PROVISION_HINT)}</code>`
        : `<p class="muted">Evidence could not be read: ${esc(evidenceRead.message)}. This is not the same as a casefile with no evidence.</p>`;

  detail.innerHTML = `<h4>Evidence · ${esc(code)}</h4>${body}`;
  detail.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

/** Open a casefile from another section without racing the evidence fetch. */
function crossToCasefile(code) {
  pendingCasefile = code;
  showView('casefiles');
}

/* ---------------------------------------------------------------- WORLD MAP */
function plotMap(container, rows) {
  // Equirectangular placement: x from longitude, y from latitude. Enough to
  // show where arrivals come from without shipping a map library.
  // isCoordinate rejects null/empty latitudes, which would otherwise coerce to
  // 0 and be drawn on the equator as if they had been measured.
  const pins = rows.filter(isCoordinate);
  container.innerHTML = '<div class="graticule"></div>' + pins.map(r => {
    const x = ((Number(r.longitude) + 180) / 360) * 100;
    const y = ((90 - Number(r.latitude)) / 180) * 100;
    return `<span class="pin" style="left:${x.toFixed(2)}%;top:${y.toFixed(2)}%" title="${esc(r.region_label)} · ${num(r.arrivals)} arrivals"></span>`;
  }).join('');
  return pins.length;
}

function renderBars(container, rows) {
  container.innerHTML = rows.length ? rows.map(r => `
    <div class="bar">
      <div class="bar-head"><span>${esc(r.label)}</span><span>${esc(r.value)}</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${Math.max(0, Math.min(100, r.percent)).toFixed(1)}%"></div></div>
    </div>`).join('') : '<p class="muted">Nothing to chart yet.</p>';
}

async function loadWorldMap() {
  const result = await readRef('world-map', 'thy_global_arrivals');
  if (!result.ok) {
    for (const id of ['wmArrivals', 'wmCountries', 'wmTop']) $(id).textContent = '—';
    $('wmRegions').innerHTML = '';
    $('wmMap').innerHTML = '<div class="graticule"></div>';
    return reportFailure($('wmNotice'), null, 'The arrival map', result);
  }
  clearNotice($('wmNotice'));
  const rows = result.data ?? [];
  const summary = arrivalAnalytics(rows);
  $('wmArrivals').textContent = num(summary.arrivals);
  $('wmCountries').textContent = num(summary.countries);
  $('wmTop').textContent = summary.top_region?.region_label ?? 'none yet';
  plotMap($('wmMap'), rows);
  renderBars($('wmRegions'), summary.regions.slice(0, 12).map(r => ({
    label: r.region_label, value: `${num(r.arrivals)} · ${formatBp(r.share_bp)}`, percent: r.share_bp / 100
  })));
}

/* -------------------------------------------------------------------- STORE */
async function loadStore() {
  const list = $('stList');
  const result = await readRef('store', SERVICES.STOREFRONT.products);
  if (!result.ok) return reportFailure($('stNotice'), list, 'The storefront', result);
  clearNotice($('stNotice'));
  const rows = result.data ?? [];
  $('stStatus').textContent = 'Purchase runs on the one approved THYLORA commerce path. A product that is not cleared shows why, not a button.';
  list.innerHTML = rows.length ? rows.map(p => {
    // A purchase button appears only when the backend says the product is
    // cleared AND released. Anything else states the gate instead.
    const cleared = p.purchasable === true && String(p.release_state ?? '').toUpperCase() === 'RELEASED';
    return `<div class="card">
      <strong>${esc(p.product_name)}</strong>
      <span>${esc(p.product_kind ?? 'product')} · ${esc(formatMinor(p.price_minor, p.currency))}</span>
      <small>${esc(p.product_code ?? '')} · ${esc(p.release_state ?? 'STATE UNKNOWN')}</small>
      ${cleared
        ? `<div class="form-actions" style="margin-top:10px"><button type="button" data-buy="${esc(p.product_code)}">Purchase</button></div>`
        : '<span class="flag">Not cleared for purchase yet</span>'}
    </div>`;
  }).join('') : '<p class="muted">No product is listed on the storefront yet.</p>';

  list.querySelectorAll('[data-buy]').forEach(button =>
    button.addEventListener('click', () => beginPurchase(button.dataset.buy, button)));
}

async function beginPurchase(productCode, button) {
  const status = $('stStatus');
  button.disabled = true;
  status.textContent = `Opening checkout for ${productCode}…`;
  try {
    // The one approved commerce path, named in the registry like every other
    // backend object. This shell implements no second checkout and does not
    // claim a charge it cannot complete.
    const checkout = refFor('store', 'begin_storefront_checkout_v1');
    const result = await rpc(checkout.name, { p_product_code: productCode });
    status.textContent = result?.checkout_url
      ? `Checkout ready for ${productCode}.`
      : `Checkout was accepted for ${productCode} but returned no session to open.`;
    if (result?.checkout_url) window.location.assign(result.checkout_url);
  } catch (error) {
    notice($('stNotice'), error.provisionRequired
      ? { title: 'Checkout is not connected yet',
          detail: `Nothing was charged. ${productCode} is listed, but the recurring/one-off checkout path is not live on the backend, so no purchase was started.`,
          hint: PROVISION_HINT }
      : { title: 'Checkout did not start', detail: `Nothing was charged. ${error.message}`, bad: true });
    status.textContent = 'No charge was made.';
  } finally {
    button.disabled = false;
  }
}

/* ------------------------------------------------------------ MY PURCHASES */
async function loadPurchases(route) {
  const list = $('mpList');
  if (route?.outcome === OUTCOME.SIGN_IN) {
    clearNotice($('mpNotice'));
    list.innerHTML = `<p class="muted">${esc(route.message)}</p>
      <div class="form-actions"><button type="button" data-view="account">Sign in</button></div>`;
    return;
  }
  const [orders, entitlements, passports] = await Promise.all([
    readRef('my-purchases', SERVICES.STOREFRONT.orders),
    readRef('my-purchases', SERVICES.STOREFRONT.entitlements),
    readRef('my-purchases', SERVICES.STOREFRONT.passports)
  ]);
  if (!orders.ok) return reportFailure($('mpNotice'), list, 'Your purchases', orders);
  clearNotice($('mpNotice'));

  const rows = orders.data ?? [];
  const grants = entitlements.ok ? (entitlements.data ?? []) : [];
  const serials = passports.ok ? (passports.data ?? []) : [];

  list.innerHTML = rows.length ? `<div class="rows">${rows.map(o => {
    const grant = grants.find(g => g.product_code === o.product_code);
    const passport = serials.find(s => s.product_code === o.product_code);
    return `<div class="row">
      <div>
        <strong>${esc(o.product_code ?? o.order_code)}</strong>
        <span>${esc(formatMinor(o.amount_minor, o.currency))} · ${esc(o.order_state ?? '')} · ${o.created_at ? new Date(o.created_at).toLocaleDateString() : ''}</span>
        ${passport
          ? `<span>Serialized asset · <code>${esc(passport.serial_number ?? passport.passport_code)}</code> · ${esc(passport.passport_state ?? '')}</span>`
          : '<span class="muted">No serialized asset issued for this purchase.</span>'}
      </div>
      <div class="row-actions">
        <span class="flag">${esc(grant ? `access ${grant.entitlement_state}` : 'no entitlement recorded')}</span>
      </div>
    </div>`;
  }).join('')}</div>` : '<p class="muted">You have no purchases on this account yet.</p>';
}

/* ------------------------------------------------------------ MY QUESTIONS */
async function loadMyQuestions(route) {
  const list = $('mqList');
  if (route?.outcome === OUTCOME.SIGN_IN) {
    clearNotice($('mqNotice'));
    list.innerHTML = `<p class="muted">${esc(route.message)}</p>
      <div class="form-actions"><button type="button" data-view="account">Sign in</button></div>`;
    return;
  }
  const result = await readRef('my-questions', 'thy_ersatz_questions');
  if (!result.ok) return reportFailure($('mqNotice'), list, 'Your questions', result);
  clearNotice($('mqNotice'));
  const rows = result.data ?? [];
  list.innerHTML = rows.length ? `<div class="rows">${rows.map(q => `
    <div class="row"><div>
      <strong>${esc(q.question_text)}</strong>
      <span>${esc(q.question_state ?? '')} · ${q.asked_at ? new Date(q.asked_at).toLocaleDateString() : ''}</span>
      ${q.answer_text
        ? `<span>${esc(q.answer_text)}</span><span class="flag">${esc(q.answer_label || 'ERSATZ INTERPRETATION')}</span>`
        : '<span class="muted">No answer yet.</span>'}
    </div></div>`).join('')}</div>`
    : '<p class="muted">You have not asked Ersatz a question yet.</p>';
}

/* ------------------------------------------------ PEOPLE / CORRESPONDENTS */
async function loadPeople() {
  const list = $('pcList');
  const result = await readRef('people', 'thy_correspondents');
  if (!result.ok) return reportFailure($('pcNotice'), list, 'Correspondents', result);
  clearNotice($('pcNotice'));
  const rows = result.data ?? [];
  const state = loadState();
  $('pcFollowState').textContent = state.follows.length
    ? `You follow ${state.follows.length} correspondent${state.follows.length === 1 ? '' : 's'} or bureau${state.follows.length === 1 ? '' : 's'}.`
    : 'You are not following anyone yet.';

  list.innerHTML = rows.length ? rows.map(c => {
    const following = isFollowing(c.correspondent_code, state);
    const bureauFollowing = c.bureau_code ? isFollowing(c.bureau_code, state) : false;
    return `<div class="card">
      <strong>${esc(c.display_name)}</strong>
      <span>${esc(c.role_label ?? 'correspondent')}${c.bureau_label ? ` · ${esc(c.bureau_label)}` : ''}</span>
      <small>${esc(c.world_status ?? '')} · ${esc(c.active_state ?? '')}</small>
      <div class="form-actions" style="margin-top:10px">
        <button type="button" class="${following ? '' : 'ghost'}" data-follow="${esc(c.correspondent_code)}">${following ? 'Following' : 'Follow reporter'}</button>
        ${c.bureau_code ? `<button type="button" class="${bureauFollowing ? '' : 'ghost'}" data-follow="${esc(c.bureau_code)}">${bureauFollowing ? 'Following bureau' : 'Follow bureau'}</button>` : ''}
      </div>
    </div>`;
  }).join('') : '<p class="muted">No correspondent is published yet.</p>';

  list.querySelectorAll('[data-follow]').forEach(button =>
    button.addEventListener('click', () => {
      const { following, durable } = toggleFollow(button.dataset.follow);
      loadPeople();
      $('pcFollowState').textContent = `${following ? 'Following' : 'Unfollowed'} ${button.dataset.follow}${durable ? '' : ' (not saved on this device)'}.`;
    }));
}

/* ---------------------------------------------------------------- LIVE LINK */
async function loadLiveLink() {
  const list = $('llList');
  const result = await readRef('live-link', 'thy_live_sessions');
  if (!result.ok) return reportFailure($('llNotice'), list, 'Live Link', result);
  clearNotice($('llNotice'));
  const rows = result.data ?? [];
  const live = rows.filter(s => String(s.live_state ?? '').toUpperCase() === 'LIVE');
  list.innerHTML = rows.length ? `<div class="rows">${rows.map(s => `
    <div class="row"><div>
      <strong>${esc(s.title)}</strong>
      <span>${esc(s.live_state ?? '')} · ${esc(s.language_code ?? '')} · ${s.scheduled_for ? new Date(s.scheduled_for).toLocaleString() : 'no time set'}</span>
    </div><div class="row-actions">
      ${String(s.live_state ?? '').toUpperCase() === 'LIVE'
        ? `<button type="button" data-view="transmissions">Open</button>`
        : '<span class="flag">not live</span>'}
    </div></div>`).join('')}</div>`
    : '<p class="muted">No live session is scheduled.</p>';
  if (!live.length && rows.length) {
    list.insertAdjacentHTML('afterbegin', '<p class="muted">THYLORA is not live right now.</p>');
  }
}

/* -------------------------------------------------------------- READBACK */
function speak(scope) {
  if (!('speechSynthesis' in window)) return false;
  const root = scope ?? document.querySelector('.view.active-view');
  if (!root) return false;
  const text = [...root.querySelectorAll('h2, h3, p, strong, span')]
    .filter(node => node.offsetParent !== null)
    .map(node => node.textContent.trim())
    .filter(Boolean)
    .join('. ');
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = Number(readRate());
  window.speechSynthesis.speak(utterance);
  return true;
}

/* ------------------------------------------------------ CHAIRMAN WORKSPACE */
async function loadChairman() {
  $('chRate').value = readRate();
  $('chNote').value = loadState().drafts.marginNote;
  $('chNoteDraftState').textContent = loadState().drafts.marginNote ? 'Unsaved note kept on this device.' : '';
  sizeSketch();
  await Promise.all([
    loadDepartments(), loadApprovals(), loadMarginNotes(), loadMoneyDistance(), loadLedger()
  ]);
}

async function loadDepartments() {
  const select = $('chDepartment');
  const result = await readRef('chairman', SERVICES.CHAIRMAN_COMMAND.departments);
  if (!result.ok) {
    select.innerHTML = '<option value="">Departments unavailable</option>';
    select.disabled = true;
    $('chDeptStatus').textContent = result.provisionRequired
      ? 'The department registry is not provisioned yet.'
      : `Department registry did not load: ${result.message}`;
    return;
  }
  const rows = result.data ?? [];
  select.disabled = rows.length === 0;
  select.innerHTML = rows.length
    ? rows.map(d => `<option value="${esc(d.department_code)}">${esc(d.name)} · ${esc(d.priority ?? '')}</option>`).join('')
    : '<option value="">No department recorded</option>';
  $('chDeptStatus').textContent = `${rows.length} department${rows.length === 1 ? '' : 's'} on the current registry.`;
}

/**
 * Approvals read through the CANONICAL narrow read
 * `thylora_approval_queue_safe_v1()`. It is SECURITY DEFINER behind
 * thylora_is_chairman() and returns { allowed, reason, ... } rather than
 * raising, so a refusal is legible here instead of arriving as a stack trace.
 */
async function loadApprovals() {
  const holder = $('chApprovals');
  const result = await safeRead('approvals', () => rpc(SERVICES.CHAIRMAN_COMMAND.approvalQueue));
  if (!result.ok) return reportFailure($('chApprovalNotice'), holder, 'Approvals', result);

  const data = result.data ?? {};
  if (data.allowed === false) {
    notice($('chApprovalNotice'), {
      title: 'Approval queue refused',
      detail: data.reason || 'The backend refused this identity.', bad: true
    });
    holder.innerHTML = '<p class="muted">Approvals unavailable.</p>';
    return;
  }
  clearNotice($('chApprovalNotice'));

  const rows = Array.isArray(data) ? data : (data.gates ?? data.approvals ?? data.rows ?? []);
  holder.innerHTML = rows.length ? `<div class="rows">${rows.map(a => {
    const id = a.canonical_id ?? a.gate_canonical_id ?? a.approval_code ?? '';
    return `<div class="row"><div>
      <strong>${esc(a.subject_title ?? a.title ?? id)}</strong>
      <span>${esc(a.subject_kind ?? a.gate_kind ?? '')} · ${esc(a.gate_state ?? a.approval_state ?? '')}</span>
    </div><div class="row-actions">
      <button type="button" data-approve="${esc(id)}">Approve</button>
      <button type="button" class="ghost" data-reject="${esc(id)}">Reject</button>
    </div></div>`;
  }).join('')}</div>`
    : '<p class="muted">Nothing is waiting for approval.</p>';

  holder.querySelectorAll('[data-approve]').forEach(b =>
    b.addEventListener('click', () => decide(b.dataset.approve, 'APPROVE', b)));
  holder.querySelectorAll('[data-reject]').forEach(b =>
    b.addEventListener('click', () => decide(b.dataset.reject, 'REJECT', b)));
}

/**
 * Record a decision in the CANONICAL append-only ledger through
 * `submit_thylora_review_gate_decision_v1`. The browser cannot modify a gate
 * directly — RLS blocks it — and a second decision ledger would split the
 * Chairman's own record of what he decided.
 */
async function decide(canonicalId, decision, button) {
  button.disabled = true;
  const status = $('chStatus');
  const built = decisionPayload({ decision, gateCanonicalId: canonicalId });
  if (!built.ok) {
    status.textContent = built.reason;
    button.disabled = false;
    return;
  }
  status.textContent = `Recording ${decision.toLowerCase()} for ${canonicalId}…`;
  try {
    const result = await rpc(SERVICES.CHAIRMAN_COMMAND.reviewDecision, built.payload);
    renderCommandResult(result);
    status.textContent = result?.resulting_state
      ? `Recorded ${result.decision ?? built.payload.p_decision} · gate is now ${result.resulting_state}.`
      : 'Decision recorded in the append-only ledger.';
    await loadApprovals();
  } catch (error) {
    status.textContent = error.status === 401 || error.code === '42501'
      ? 'Access denied: Chairman authentication required.'
      : `Decision was not recorded: ${error.message}`;
  } finally {
    button.disabled = false;
  }
}

function renderCommandResult(result) {
  const holder = $('chResult');
  if (!result || typeof result !== 'object') { holder.hidden = true; return; }
  holder.hidden = false;
  holder.innerHTML = '<h4>Routed</h4><dl>' + Object.entries(result).map(([key, value]) =>
    `<dt>${esc(key)}</dt><dd>${esc(typeof value === 'object' ? JSON.stringify(value) : value)}</dd>`
  ).join('') + '</dl>';
}

/* voice command ----------------------------------------------------------- */
$('chListen')?.addEventListener('click', () => {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const status = $('chStatus');
  if (!Recognition) {
    status.textContent = 'This device does not expose speech recognition, so type the command instead. Routing is identical either way.';
    return;
  }
  const recognition = new Recognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  status.textContent = 'Listening…';
  recognition.onresult = event => {
    const said = [...event.results].map(r => r[0].transcript).join(' ').trim();
    $('chCommand').value = said;
    status.textContent = 'Heard the command. Review it, then route.';
  };
  recognition.onerror = event => { status.textContent = `Speech capture did not complete: ${event.error}. Type the command instead.`; };
  recognition.onend = () => { if ($('chStatus').textContent === 'Listening…') $('chStatus').textContent = 'Nothing was captured. Type the command instead.'; };
  try { recognition.start(); } catch { status.textContent = 'Speech capture could not start. Type the command instead.'; }
});

$('chRoute')?.addEventListener('click', () => routeCommand($('chCommand').value.trim()));

$('chRouteDept')?.addEventListener('click', () => {
  const department = $('chDepartment').value;
  const command = $('chCommand').value.trim();
  if (!department) { $('chDeptStatus').textContent = 'Choose a department first.'; return; }
  if (!command) { $('chDeptStatus').textContent = 'Say or type the command first.'; return; }
  routeCommand(`ROUTE TO ${department}: ${command}`, $('chDeptStatus'));
});

async function routeCommand(command, statusEl = $('chStatus')) {
  if (!command) { statusEl.textContent = 'Say or type the command first.'; return; }
  const chairman = chairmanAuthorization(getSession());
  if (!chairman.authorized) { statusEl.textContent = chairman.message; return; }

  const button = $('chRoute');
  button.disabled = true;
  statusEl.textContent = 'Checking backend continuity and routing…';
  try {
    const result = await rpc(SERVICES.CHAIRMAN_COMMAND.submit, { p_command_text: command });
    renderCommandResult(result);
    statusEl.textContent = 'Backend checked first. Command is routed and preserved.';
  } catch (error) {
    statusEl.textContent = `Routing did not complete: ${error.message}`;
  } finally {
    button.disabled = false;
  }
}

$('chHear')?.addEventListener('click', () => {
  const result = $('chResult');
  const text = (!result.hidden && result.innerText.trim()) || $('chStatus').textContent || '';
  if (!('speechSynthesis' in window)) { $('chStatus').textContent = 'This device cannot read back aloud.'; return; }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = Number($('chRate').value || readRate());
  window.speechSynthesis.speak(utterance);
});

$('chRate')?.addEventListener('change', event => writeRate(event.target.value));

/* margin notes ----------------------------------------------------------- */
$('chNote')?.addEventListener('input', event => {
  const { durable } = patchDrafts({ marginNote: event.target.value });
  $('chNoteDraftState').textContent = event.target.value
    ? (durable ? 'Draft saved on this device.' : 'Draft kept for this session only.') : '';
});

/**
 * Margin notes go to the CANONICAL Live Margin queue via
 * `thylora_margin_note_add_v1`, which the dashboard reconciles. This lane adds
 * no second notes system. The function returns { added, reason, queue_depth }
 * rather than raising, and a refusal keeps the note on the device.
 */
$('chNoteSave')?.addEventListener('click', async () => {
  const status = $('chNoteStatus');
  const text = $('chNote').value.trim();
  if (!text) { status.textContent = 'Write the note first.'; return; }
  const state = loadState();
  status.textContent = 'Queueing margin note…';
  try {
    const result = await rpc(SERVICES.CHAIRMAN_COMMAND.marginAdd, {
      p_anchor_kind: 'SCREEN_COMPONENT',
      p_anchor_ref: state.lastTransmission ?? 'thylora-app#chairman',
      p_body: text,
      p_source_mode: 'TEXT',
      p_playback_position_ms: null,
      p_anchor_context: {
        detected_by: 'THYLORA_APP_SHELL',
        screen: '/thylora-app#chairman',
        at: new Date().toISOString()
      }
    });
    if (result && result.added === false) {
      status.textContent = `Not stored: ${result.reason || 'refused'}. Your note is kept as a draft on this device.`;
      return;
    }
    patchDrafts({ marginNote: '' });
    $('chNote').value = '';
    $('chNoteDraftState').textContent = '';
    status.textContent = result?.queue_depth !== undefined
      ? `Queued · ${result.queue_depth} waiting to be reconciled.`
      : 'Queued in the Live Margin queue.';
    await loadMarginNotes();
  } catch (error) {
    status.textContent = error.provisionRequired
      ? 'Not stored: the Live Margin function is not reachable. Your note is kept as a draft on this device.'
      : `Not stored: ${error.message}. Your note is kept as a draft on this device.`;
  }
});

async function loadMarginNotes() {
  const holder = $('chNotes');
  const result = await safeRead('margin', () =>
    rpc(SERVICES.CHAIRMAN_COMMAND.marginQueue, { p_include_resolved: true }));
  if (!result.ok) {
    holder.innerHTML = `<p class="muted">${result.provisionRequired
      ? 'The Live Margin queue is not reachable from this device.'
      : esc(`The margin queue did not load: ${result.message}`)}</p>`;
    return;
  }
  const data = result.data ?? {};
  if (data.allowed === false) {
    holder.innerHTML = `<p class="muted">${esc(data.reason || 'The backend refused this identity.')}</p>`;
    return;
  }
  const rows = data.notes ?? [];
  holder.innerHTML = rows.length ? `<div class="rows">${rows.map(n => `
    <div class="row"><div>
      <strong>${esc(n.anchor_kind ?? '')} · ${esc(n.anchor_ref ?? '')}</strong>
      <span>${esc(n.body ?? n.note_text ?? '')}</span>
      <small class="muted">${n.created_at ? new Date(n.created_at).toLocaleString() : ''}${n.disposition ? ` · ${esc(n.disposition)}` : ''}</small>
    </div></div>`).join('')}</div>`
    : '<p class="muted">No margin note yet. A note never stops the pass.</p>';
}

/* sketch + markup -------------------------------------------------------- */
const sketch = { strokes: [], current: null };

function sizeSketch() {
  const canvas = $('chSketch');
  if (!canvas) return;
  const ratio = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || 320;
  const height = canvas.clientHeight || 300;
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  const context = canvas.getContext('2d');
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  redrawSketch();
}

function redrawSketch() {
  const canvas = $('chSketch');
  if (!canvas) return;
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.lineCap = 'round';
  context.lineJoin = 'round';
  for (const stroke of sketch.strokes) {
    context.strokeStyle = stroke.markup ? '#ef7a72' : '#e5b65b';
    context.globalAlpha = stroke.markup ? 0.55 : 1;
    context.beginPath();
    stroke.points.forEach((point, index) => {
      context.lineWidth = stroke.markup ? 10 : Math.max(1, point.pressure * 4);
      if (index === 0) context.moveTo(point.x, point.y);
      else context.lineTo(point.x, point.y);
    });
    context.stroke();
  }
  context.globalAlpha = 1;
  $('chSketchState').textContent = `${sketch.strokes.length} stroke${sketch.strokes.length === 1 ? '' : 's'}`;
}

function sketchPoint(event) {
  const rect = $('chSketch').getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
    // A stylus reports real pressure; mouse and finger report 0 or 0.5.
    pressure: event.pressure > 0 && event.pressure !== 0.5 ? event.pressure : 0.6
  };
}

(() => {
  const canvas = $('chSketch');
  if (!canvas) return;
  canvas.addEventListener('pointerdown', event => {
    canvas.setPointerCapture(event.pointerId);
    sketch.current = { markup: $('chMarkup').checked, points: [sketchPoint(event)] };
    sketch.strokes.push(sketch.current);
    redrawSketch();
  });
  canvas.addEventListener('pointermove', event => {
    if (!sketch.current) return;
    sketch.current.points.push(sketchPoint(event));
    redrawSketch();
  });
  const finish = () => { sketch.current = null; };
  canvas.addEventListener('pointerup', finish);
  canvas.addEventListener('pointercancel', finish);
  canvas.addEventListener('pointerleave', finish);
})();

$('chSketchUndo')?.addEventListener('click', () => { sketch.strokes.pop(); redrawSketch(); });
$('chSketchClear')?.addEventListener('click', () => { sketch.strokes = []; redrawSketch(); });
window.addEventListener('resize', () => { if ($('chairman')?.classList.contains('active-view')) sizeSketch(); });

$('chSketchSave')?.addEventListener('click', async () => {
  const status = $('chSketchStatus');
  if (!sketch.strokes.length) { status.textContent = 'Draw or mark up something first.'; return; }
  const state = loadState();
  status.textContent = 'Saving sketch…';
  try {
    await api('/rest/v1/thy_chairman_sketches', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: {
        subject_kind: 'TRANSMISSION',
        subject_code: state.lastTransmission ?? 'UNASSIGNED',
        sketch_title: `Chairman sketch ${new Date().toISOString().slice(0, 10)}`,
        stroke_count: sketch.strokes.length,
        // Stored as vector strokes rather than a flattened image so the markup
        // stays inspectable and re-renderable.
        strokes: sketch.strokes,
        sketch_state: 'ACTIVE'
      }
    });
    status.textContent = `Sketch saved · ${sketch.strokes.length} strokes.`;
  } catch (error) {
    status.textContent = error.provisionRequired
      ? 'Not saved: the sketch surface is not provisioned on the backend yet. Your strokes are still on screen.'
      : `Not saved: ${error.message}. Your strokes are still on screen.`;
  }
});

/* money-distance, arrivals, coverage ------------------------------------- */
async function loadMoneyDistance() {
  const [orderRows, arrivalRows, originRows] = await Promise.all([
    readRef('chairman', 'thy_order_arrivals'),
    readRef('chairman', 'thy_global_arrivals'),
    readRef('chairman', 'thy_origin')
  ]);

  if (!orderRows.ok) {
    for (const id of ['chMoneyTotal', 'chMoneyDistance', 'chMoneyOrders']) $(id).textContent = '—';
    $('chMoneyBands').innerHTML = '';
    $('chMoneyNotes').textContent = '';
    reportFailure($('chMoneyNotice'), null, 'The money-distance view', orderRows);
    return renderArrivals(arrivalRows);
  }
  clearNotice($('chMoneyNotice'));

  const origin = originRows.ok ? (originRows.data ?? [])[0] ?? null : null;
  const view = moneyDistanceView(
    orderRows.data ?? [],
    arrivalRows.ok ? (arrivalRows.data ?? []) : [],
    origin
  );

  $('chMoneyTotal').textContent = formatMinor(view.total_revenue_minor, view.currency === 'MIXED' ? 'USD' : view.currency);
  $('chMoneyDistance').textContent = view.revenue_weighted_distance_km === null
    ? 'not measured' : formatKm(view.revenue_weighted_distance_km);
  $('chMoneyOrders').textContent = num(view.orders);
  renderBars($('chMoneyBands'), view.bands.filter(b => b.orders > 0).map(b => ({
    label: `${b.label} · ${b.regions} region${b.regions === 1 ? '' : 's'}`,
    value: `${formatMinor(b.revenue_minor, view.currency === 'MIXED' ? 'USD' : view.currency)} · ${formatBp(b.revenue_share_bp)}`,
    percent: b.revenue_share_bp / 100
  })));
  $('chMoneyNotes').textContent = view.notes.join(' ');
  renderArrivals(arrivalRows);
}

function renderArrivals(result) {
  const holder = $('chArrivals');
  if (!result.ok) {
    holder.innerHTML = `<p class="muted">${result.provisionRequired
      ? 'Global arrivals are not provisioned on the backend yet.'
      : esc(`Arrivals did not load: ${result.message}`)}</p>`;
    return;
  }
  const summary = arrivalAnalytics(result.data ?? []);
  holder.innerHTML = `
    <div class="stat-row">
      <div class="stat"><b>${num(summary.arrivals)}</b><span>ARRIVALS</span></div>
      <div class="stat"><b>${num(summary.sessions)}</b><span>SESSIONS</span></div>
      <div class="stat"><b>${num(summary.countries)}</b><span>COUNTRIES</span></div>
    </div>
    <div class="bars" id="chArrivalBars"></div>`;
  renderBars($('chArrivalBars'), summary.regions.slice(0, 8).map(r => ({
    label: r.region_label, value: `${num(r.arrivals)} · ${formatBp(r.share_bp)}`, percent: r.share_bp / 100
  })));
}

async function loadLedger() {
  const holder = $('chLedger');
  const result = await readRef('chairman', 'thy_prompt_ledger');
  if (!result.ok) {
    for (const id of ['chCoverage', 'chDelivery', 'chGap']) $(id).textContent = '—';
    return reportFailure($('chLedgerNotice'), holder, 'The prompt coverage ledger', result);
  }
  clearNotice($('chLedgerNotice'));
  const ledger = promptCoverageLedger(result.data ?? []);
  $('chCoverage').textContent = ledger.total ? formatBp(ledger.coverage_bp) : 'no prompts';
  $('chDelivery').textContent = ledger.total ? formatBp(ledger.delivery_bp) : '—';
  $('chGap').textContent = num(ledger.covered_not_delivered);

  holder.innerHTML = ledger.total === 0
    ? '<p class="muted">No prompt is recorded on the ledger yet.</p>'
    : `<p class="muted">${ledger.total} prompt${ledger.total === 1 ? '' : 's'} · ${ledger.covered} covered · ${ledger.partial} partial · ${ledger.uncovered} uncovered${ledger.unclassified ? ` · ${ledger.unclassified} unclassified` : ''}. ${ledger.complete ? 'Every prompt is covered and delivered.' : 'Outstanding prompts are listed below.'}</p>` +
      (ledger.outstanding.length ? `<div class="rows">${ledger.outstanding.map(p => `
        <div class="row"><div>
          <strong>${esc(p.prompt_code ?? 'prompt')}</strong>
          <span>${esc(p.prompt_text)}</span>
        </div><div class="row-actions">
          <span class="flag">${esc(p.coverage_state)}</span>
          <span class="flag">${p.delivered ? 'delivered' : 'not delivered'}</span>
        </div></div>`).join('')}</div>` : '');
}

/* ===================================================== MEDIA STUDIO (Chairman) */
// The mobile flow, in order:
//   open registered asset → master image + continuity locks → Animate →
//   mode → submit → progress → preview → approve/revise/reject → publishing queue
//
// Generation goes through the THYLORA Media Router Edge Function, which holds
// the provider credentials server-side. Nothing here stores a credential, and
// nothing here claims a generation the provider did not return.

const studio = {
  assets: [],
  renditions: [],
  provenance: [],
  rights: [],
  passports: [],
  requirements: [],
  asset: null,
  locks: null,
  job: null,
  mode: DEFAULT_MODE,
  markup: { strokes: [], current: null, active: false, ref: null },
  poll: null
};

async function loadMediaStudio() {
  $('msRouter').textContent =
    `Router · ${MEDIA_ROUTER_FUNCTION} · provider credentials remain server-side.`;
  renderModes();

  const [assets, renditions, provenance, rights, passports, requirements] = await Promise.all([
    readRef('media-studio', 'rael_media_assets'),
    readRef('media-studio', 'rael_media_renditions'),
    readRef('media-studio', 'rael_provenance_events'),
    readRef('media-studio', 'rael_rights_records'),
    readRef('media-studio', SERVICES.STOREFRONT.passports),
    readRef('media-studio', 'thy_media_release_requirements')
  ]);

  studio.renditions = renditions.ok ? (renditions.data ?? []) : [];
  studio.provenance = provenance.ok ? (provenance.data ?? []) : [];
  studio.rights = rights.ok ? (rights.data ?? []) : [];
  studio.passports = passports.ok ? (passports.data ?? []) : [];
  studio.requirements = requirements.ok ? (requirements.data ?? []) : [];

  if (!assets.ok) {
    $('msAssetStatus').textContent = '';
    $('msAssets').innerHTML = '';
    return reportFailure($('msNotice'), null, 'The registered asset registry', assets);
  }
  clearNotice($('msNotice'));
  studio.assets = assets.data ?? [];

  $('msAssetStatus').textContent = studio.assets.length
    ? `${studio.assets.length} registered asset${studio.assets.length === 1 ? '' : 's'}. Open one to read its continuity locks.`
    : 'No asset is registered yet.';

  $('msAssets').innerHTML = studio.assets.map(a => `
    <button type="button" class="card" data-asset="${esc(a.asset_code)}">
      <strong>${esc(a.title)}</strong>
      <span>${esc(a.media_kind ?? '')} · ${esc(a.pipeline_state ?? '')} · version ${Number(a.version_no ?? 1)}</span>
      <small>${esc(a.asset_code)}${a.passport_ref ? ` · passport ${esc(a.passport_ref)}` : ' · no passport bound'}</small>
      ${a.replaces_asset_id ? '<span class="flag">derivative</span>' : ''}
    </button>`).join('');

  $('msAssets').querySelectorAll('[data-asset]').forEach(card =>
    card.addEventListener('click', () => openAsset(card.dataset.asset)));
}

/* -------------------------------------------------------------- open asset */
function assetContext(asset) {
  const renditions = studio.renditions.filter(r => r.asset_id === asset.id);
  const passport = studio.passports.find(p =>
    p.passport_code === asset.passport_ref || p.product_code === asset.product_ref) ?? null;
  return {
    rights: studio.rights.find(r => r.asset_id === asset.id) ?? null,
    renditions,
    captions: [],
    moderation: null,
    scan: null,
    passport,
    requirements: studio.requirements.find(r => r.asset_code === asset.asset_code) ?? null,
    provenance: studio.provenance.filter(e => e.asset_id === asset.id)
  };
}

function openAsset(assetCode) {
  const asset = studio.assets.find(a => a.asset_code === assetCode);
  if (!asset) return;
  studio.asset = asset;
  studio.job = null;
  resetMarkup();
  stopPolling();

  document.querySelectorAll('[data-asset]').forEach(c =>
    c.classList.toggle('active', c.dataset.asset === assetCode));
  $('msOpen').hidden = false;
  $('msProgress').hidden = true;
  $('msResult').hidden = true;

  const context = assetContext(asset);

  // Master image. A poster or thumbnail rendition is the master frame; the
  // studio does not fabricate a URL it was not given.
  const master = context.renditions.find(r =>
    ['POSTER', 'THUMBNAIL', 'MASTER'].includes(String(r.rendition_kind)) &&
    String(r.rendition_state) === 'READY');
  const image = $('msMaster');
  const empty = $('msMasterEmpty');
  if (master?.storage_key && /^https?:\/\//i.test(master.storage_key)) {
    image.src = master.storage_key;
    image.alt = `Master frame for ${asset.title}`;
    image.hidden = false;
    empty.hidden = true;
  } else {
    image.removeAttribute('src');
    image.hidden = true;
    empty.hidden = false;
    empty.textContent = master
      ? 'A master rendition is registered but its storage key is not a resolvable URL, so no frame is displayed.'
      : 'No master rendition is ready for this asset, so there is no frame to display.';
  }

  const passport = context.passport;
  const requirements = context.requirements;
  $('msAssetFacts').innerHTML = [
    ['Asset code', asset.asset_code],
    ['Version', `${asset.version_no ?? 1}${asset.replaces_asset_id ? ' (derivative)' : ''}`],
    ['Pipeline state', asset.pipeline_state ?? 'unknown'],
    ['Checksum', asset.checksum_sha256 ? `${asset.checksum_sha256.slice(0, 16)}…` : 'not recorded'],
    ['Serial number', passport?.serial_number ?? 'no passport bound'],
    ['QR destination', qrDestination(passport) ?? 'not declared'],
    ['Logo required', requirements
      ? (requirements.logo_required === null || requirements.logo_required === undefined
          ? 'not decided'
          : requirements.logo_required ? `yes · ${requirements.logo_asset_ref ?? 'no logo attached'}` : 'no')
      : 'requirements not declared'],
    ['EDF package', asset.edf_ref ?? 'not bound']
  ].map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('');

  studio.locks = continuityLocks(asset, context);
  renderLocks(studio.locks);

  $('msSubmit').disabled = !studio.locks.can_animate;
  $('msSubmitState').textContent = studio.locks.can_animate
    ? ''
    : 'Animation is blocked until the blocking locks above are cleared.';
  $('msOpen').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function renderLocks(locks) {
  const holder = $('msLocks');
  if (!locks.locks.length) {
    holder.innerHTML = '<p class="muted">No continuity lock outstanding. This asset is clear to animate and to queue.</p>';
    return;
  }
  holder.innerHTML = locks.locks.map(l => `
    <div class="row lock" data-severity="${esc(l.severity)}"><div>
      <strong>${esc(l.code)}</strong>
      <span>${esc(l.detail)}</span>
    </div><div class="row-actions">
      <span class="flag">${l.severity === 'BLOCKING' ? 'blocks animation' : 'blocks publishing'}</span>
    </div></div>`).join('');
}

/* ------------------------------------------------------------------- modes */
function renderModes() {
  $('msModes').innerHTML = ANIMATE_MODES.map(m => `
    <button type="button" class="mode" role="radio" data-mode="${esc(m.code)}"
      aria-checked="${m.code === studio.mode}">
      <strong>${esc(m.label)}</strong><span>${esc(m.detail)}</span>
    </button>`).join('');
  $('msModes').querySelectorAll('[data-mode]').forEach(button =>
    button.addEventListener('click', () => {
      studio.mode = button.dataset.mode;
      $('msModes').querySelectorAll('[data-mode]').forEach(b =>
        b.setAttribute('aria-checked', String(b.dataset.mode === studio.mode)));
    }));
}

/* ------------------------------------------------------------- submit + poll */
$('msSubmit')?.addEventListener('click', submitAnimation);

async function submitAnimation() {
  if (!studio.asset) return;
  const button = $('msSubmit');
  const state = $('msSubmitState');

  if (!studio.locks?.can_animate) {
    state.textContent = 'Animation is blocked by a continuity lock.';
    return;
  }

  let request;
  try {
    request = animateRequest({
      asset: studio.asset,
      modeCode: studio.mode,
      instruction: $('msInstruction').value,
      markupRef: studio.markup.ref
    });
  } catch (error) {
    state.textContent = error.message;
    return;
  }

  button.disabled = true;
  state.textContent = 'Handing the request to the THYLORA Media Router…';
  // A local job record so progress is legible even before the backend answers.
  $('msDecisionOutcome').textContent = '';
  studio.job = {
    job_code: `LOCAL-${Date.now()}`,
    asset_code: studio.asset.asset_code,
    mode: studio.mode,
    job_state: 'SUBMITTED',
    instruction: request.instruction,
    provider_result: null,
    failure_reason: null,
    audit_canonical_id: null,
    review_gate_canonical_id: null
  };
  renderProgress();

  try {
    const response = await invokeFunction(MEDIA_ROUTER_FUNCTION, request);
    applyRouterResponse(response);
    state.textContent = 'The router answered.';
    // Record the attempt. A failure to record never invents a success.
    await recordJob();
    if (studio.job.job_state === 'ROUTING' || studio.job.job_state === 'RUNNING') startPolling();
  } catch (error) {
    studio.job.job_state = 'FAILED';
    studio.job.failure_reason = error.provisionRequired
      ? `The THYLORA Media Router (${MEDIA_ROUTER_FUNCTION}) did not accept this request: ${error.message}`
      : error.message;
    renderProgress();
    renderResult();
    notice($('msNotice'), error.provisionRequired
      ? { title: 'Router did not accept the animate task',
          detail: `Nothing was generated and nothing is claimed. The router is deployed for provider routing, but it did not accept an ANIMATE_MEDIA task: ${error.message}`,
          bad: true }
      : { title: 'Submission did not complete',
          detail: `Nothing was generated. ${error.message}`, bad: true });
    state.textContent = 'Not submitted.';
  } finally {
    button.disabled = false;
  }
}

function applyRouterResponse(response) {
  const update = readRouterResponse(response);
  Object.assign(studio.job, update);
  // A provider "success" is only a result once an asset is actually found.
  if (studio.job.job_state === 'RETURNED') {
    Object.assign(studio.job, settleReturnedJob(studio.job));
  }
  studio.job.review_gate_canonical_id =
    response?.review_gate_canonical_id ?? response?.gate_canonical_id ?? studio.job.review_gate_canonical_id;
  renderProgress();
  renderResult();
}

/** Persist the job. The job table is Chairman-only and may not be provisioned. */
async function recordJob() {
  const job = studio.job;
  if (!job) return;
  try {
    const created = await api('/rest/v1/thy_media_animation_jobs', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: {
        asset_code: job.asset_code,
        parent_version_no: studio.asset?.version_no ?? 1,
        parent_checksum_sha256: studio.asset?.checksum_sha256 ?? null,
        mode: job.mode,
        instruction: job.instruction,
        markup_ref: studio.markup.ref,
        job_state: job.job_state,
        provider_result: job.provider_result,
        failure_reason: job.failure_reason,
        audit_canonical_id: job.audit_canonical_id,
        submitted_at: new Date().toISOString()
      }
    });
    const row = Array.isArray(created) ? created[0] : created;
    if (row?.job_code) studio.job.job_code = row.job_code;
  } catch (error) {
    // The attempt still happened. Say the record was not written rather than
    // pretending it was, and never downgrade the router's own answer.
    $('msSubmitState').textContent = error.provisionRequired
      ? 'The router answered, but the job table is not provisioned so this attempt was not recorded.'
      : `The router answered, but the job was not recorded: ${error.message}`;
  }
}

function startPolling() {
  stopPolling();
  studio.poll = setInterval(async () => {
    if (!studio.job?.job_code || studio.job.job_code.startsWith('LOCAL-')) return stopPolling();
    const result = await readRef('media-studio', 'thy_media_animation_jobs',
      [`job_code=eq.${encodeURIComponent(studio.job.job_code)}`]);
    if (!result.ok) return stopPolling();
    const row = (result.data ?? [])[0];
    if (!row) return;
    studio.job = { ...studio.job, ...row };
    renderProgress();
    renderResult();
    if (!jobProgress(studio.job).in_flight) stopPolling();
  }, 4000);
}

function stopPolling() {
  if (studio.poll) { clearInterval(studio.poll); studio.poll = null; }
}

/* ---------------------------------------------------------------- progress */
function renderProgress() {
  const job = studio.job;
  if (!job) { $('msProgress').hidden = true; return; }
  const progress = jobProgress(job);
  $('msProgress').hidden = false;
  $('msProgressLabel').textContent = progress.label;
  $('msProgressPercent').textContent = `${progress.percent}%`;
  $('msProgressFill').style.width = `${progress.percent}%`;
  $('msProgressDetail').textContent = [
    job.job_code && !job.job_code.startsWith('LOCAL-') ? `Job ${job.job_code}` : null,
    `Mode ${job.mode}`,
    job.audit_canonical_id ? `Router audit ${job.audit_canonical_id}` : null,
    job.provider_result?.model ? `Model ${job.provider_result.model}` : null,
    job.provider_result?.latency_ms !== undefined ? `${job.provider_result.latency_ms} ms` : null
  ].filter(Boolean).join(' · ');
}

/* ------------------------------------------------------------------ result */
function isInFlightState(state) {
  return jobProgress({ job_state: state }).in_flight;
}

function renderResult() {
  const job = studio.job;
  if (!job) { $('msResult').hidden = true; return; }
  const claim = generationClaim(job);

  $('msResult').hidden = false;

  // THE CLAIM. Nothing on this screen says a media was generated unless the
  // provider handed back an asset we can locate.
  notice($('msClaim'), claim.generated
    ? { title: 'Provider returned an asset', detail: claim.claim }
    : { title: 'No media has been generated', detail: claim.claim, bad: true });

  const wrap = $('msPreviewWrap');
  const video = $('msPreviewVideo');
  const image = $('msPreviewImage');

  if (!claim.previewable) {
    wrap.hidden = true;
    video.hidden = true; video.removeAttribute('src');
    image.hidden = true; image.removeAttribute('src');
  } else {
    wrap.hidden = false;
    const asset = claim.asset;
    const url = asset.kind === 'URL' ? asset.url : null;
    const isVideo = /video|mp4|webm|mov/i.test(`${asset.mime ?? ''} ${url ?? ''}`);
    if (url && isVideo) {
      video.src = url; video.hidden = false;
      image.hidden = true; image.removeAttribute('src');
    } else if (url) {
      image.src = url; image.hidden = false;
      video.hidden = true; video.removeAttribute('src');
    } else {
      // A storage key is a real asset but not directly displayable here.
      video.hidden = true; image.hidden = true;
      wrap.hidden = true;
      notice($('msClaim'), {
        title: 'Provider returned an asset',
        detail: `${claim.claim} It is stored at ${asset.storage_key} and needs a signed URL to display, so it is not previewed here.`
      });
    }
  }

  // Decisions are only meaningful once there is something to decide on.
  const decidable = claim.generated && job.job_state === 'REVIEW';
  // A brand-new in-flight result clears any previous outcome.
  if (isInFlightState(job.job_state)) $('msDecisionOutcome').textContent = '';
  for (const id of ['msApprove', 'msRevise', 'msReject']) $(id).disabled = !decidable;
  $('msDecisionState').textContent = decidable
    ? ''
    : claim.generated
      ? `This result is ${jobProgress(job).label.toLowerCase()}.`
      : 'There is nothing to approve: no asset was generated.';

  // Markup needs a frame. Offer it whenever a frame is on screen.
  const frameAvailable = claim.previewable && !wrap.hidden;
  $('msMarkupToggle').disabled = !frameAvailable;
  $('msPencilNote').textContent = frameAvailable
    ? 'Draw directly over the frame. Apple Pencil pressure and tilt are recorded; a finger or mouse is recorded as touch input, not as Pencil.'
    : 'Markup becomes available once there is a frame to draw over.';

  renderQueueState();
}

/* --------------------------------------------------- Apple Pencil markup */
function resetMarkup() {
  studio.markup = { strokes: [], current: null, active: false, ref: null };
  const canvas = $('msPreviewMarkup');
  if (canvas) { canvas.hidden = true; clearCanvas(canvas); }
  $('msPreviewFrame')?.classList.remove('marking');
  if ($('msMarkupState')) $('msMarkupState').textContent = 'No markup';
  if ($('msMarkupToggle')) $('msMarkupToggle').textContent = 'Mark up frame';
}

function clearCanvas(canvas) {
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function sizeMarkupCanvas() {
  const canvas = $('msPreviewMarkup');
  const frame = $('msPreviewFrame');
  if (!canvas || !frame) return;
  const rect = frame.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.round(rect.width * ratio));
  canvas.height = Math.max(1, Math.round(rect.height * ratio));
  canvas.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0);
  redrawMarkup();
}

function redrawMarkup() {
  const canvas = $('msPreviewMarkup');
  if (!canvas) return;
  const frame = $('msPreviewFrame').getBoundingClientRect();
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.strokeStyle = '#ef7a72';
  for (const stroke of studio.markup.strokes) {
    context.beginPath();
    stroke.points.forEach((point, index) => {
      // Stored frame-relative, so a markup drawn on an iPad replays correctly
      // at any size.
      const x = point.x * frame.width;
      const y = point.y * frame.height;
      context.lineWidth = point.pressure ? Math.max(1.5, point.pressure * 6) : 2.5;
      if (index === 0) context.moveTo(x, y); else context.lineTo(x, y);
    });
    context.stroke();
  }
  const summary = markupSummary(studio.markup.strokes);
  $('msMarkupState').textContent = summary.empty
    ? 'No markup'
    : `${summary.strokes} stroke${summary.strokes === 1 ? '' : 's'} · ${summary.pencil_strokes} with Pencil`;
}

$('msMarkupToggle')?.addEventListener('click', () => {
  const canvas = $('msPreviewMarkup');
  studio.markup.active = !studio.markup.active;
  canvas.hidden = !studio.markup.active;
  $('msPreviewFrame').classList.toggle('marking', studio.markup.active);
  $('msMarkupToggle').textContent = studio.markup.active ? 'Done marking' : 'Mark up frame';
  if (studio.markup.active) sizeMarkupCanvas();
});

$('msMarkupUndo')?.addEventListener('click', () => { studio.markup.strokes.pop(); redrawMarkup(); });
$('msMarkupClear')?.addEventListener('click', () => { studio.markup.strokes = []; redrawMarkup(); });
window.addEventListener('resize', () => { if (studio.markup.active) sizeMarkupCanvas(); });

(() => {
  const canvas = $('msPreviewMarkup');
  if (!canvas) return;
  const frameRect = () => $('msPreviewFrame').getBoundingClientRect();

  canvas.addEventListener('pointerdown', event => {
    if (!studio.markup.active) return;
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    studio.markup.current = {
      pointer_type: event.pointerType || 'unknown',
      points: [markupPoint(event, frameRect())]
    };
    studio.markup.strokes.push(studio.markup.current);
    redrawMarkup();
  });

  canvas.addEventListener('pointermove', event => {
    if (!studio.markup.current) return;
    event.preventDefault();
    studio.markup.current.points.push(markupPoint(event, frameRect()));
    redrawMarkup();
  });

  const finish = () => { studio.markup.current = null; };
  canvas.addEventListener('pointerup', finish);
  canvas.addEventListener('pointercancel', finish);
  canvas.addEventListener('pointerleave', finish);
})();

/** Store the markup so the revision request can reference it. */
async function saveMarkup() {
  const summary = markupSummary(studio.markup.strokes);
  if (summary.empty) return { ok: true, ref: null, stored: false };
  try {
    const created = await api('/rest/v1/thy_media_markups', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: {
        job_code: studio.job?.job_code?.startsWith('LOCAL-') ? null : studio.job?.job_code ?? null,
        asset_code: studio.asset?.asset_code,
        frame_ref: $('msPreviewVideo')?.currentTime
          ? String(Math.round($('msPreviewVideo').currentTime * 1000))
          : null,
        strokes: studio.markup.strokes,
        stroke_count: summary.strokes,
        point_count: summary.points,
        pencil_stroke_count: summary.pencil_strokes
      }
    });
    const row = Array.isArray(created) ? created[0] : created;
    studio.markup.ref = row?.markup_ref ?? null;
    return { ok: true, ref: studio.markup.ref, stored: true };
  } catch (error) {
    return { ok: false, ref: null, stored: false, message: error.message, provisionRequired: error.provisionRequired };
  }
}

/* ---------------------------------------------------------------- decisions */
$('msApprove')?.addEventListener('click', () => decideResult('APPROVE'));
$('msRevise')?.addEventListener('click', () => decideResult('REVISE'));
$('msReject')?.addEventListener('click', () => decideResult('REJECT'));

async function decideResult(decision) {
  const job = studio.job;
  // #msDecisionState is the re-rendered hint; the outcome gets its own element
  // so a confirmation is never wiped by the next render.
  const state = $('msDecisionOutcome');
  if (!job) return;

  const note = $('msDecisionNote').value.trim();
  const summary = markupSummary(studio.markup.strokes);

  // A revision may be carried by the markup alone.
  if (decision === 'REVISE' && !note && summary.empty) {
    state.textContent = 'A revision needs a note or a markup over the frame.';
    return;
  }

  for (const id of ['msApprove', 'msRevise', 'msReject']) $(id).disabled = true;
  state.textContent = 'Recording the decision…';

  try {
    // 1 · A revision carries the markup into the canonical margin queue.
    if (decision === 'REVISE') {
      const stored = await saveMarkup();
      if (!stored.ok && !summary.empty) {
        state.textContent = stored.provisionRequired
          ? 'The markup store is not provisioned, so the markup could not be attached. Nothing was recorded; your strokes are still on screen.'
          : `The markup could not be stored: ${stored.message}. Nothing was recorded.`;
        return;
      }
      const request = revisionRequest({
        job, asset: studio.asset, note, markupRef: stored.ref,
        strokes: studio.markup.strokes,
        frameRef: job.job_code,
        playbackMs: $('msPreviewVideo')?.currentTime ? $('msPreviewVideo').currentTime * 1000 : null
      });
      if (!request.ok) { state.textContent = request.reason; return; }

      const queued = await rpc(SERVICES.CHAIRMAN_COMMAND.marginAdd, request.payload);
      if (queued && queued.added === false) {
        state.textContent = `The revision was not queued: ${queued.reason || 'refused'}.`;
        return;
      }
    }

    // 2 · The decision itself goes to the canonical append-only ledger.
    const built = decisionPayload({
      decision,
      gateCanonicalId: job.review_gate_canonical_id,
      note: note || (summary.empty ? null : 'Revision requested by markup.'),
      job
    });

    if (!built.ok) {
      // No gate means no ledger entry is possible. Say so rather than
      // recording the decision only locally and implying it was governed.
      state.textContent = `${built.reason} The result was not approved or rejected.`;
      return;
    }

    await rpc(SERVICES.CHAIRMAN_COMMAND.reviewDecision, built.payload);
    studio.job.job_state = built.next_state;
    await patchJobState(built.next_state);
    $('msDecisionNote').value = '';
    if (decision === 'REVISE') resetMarkup();
    state.textContent = {
      APPROVE: 'Approved and recorded in the append-only ledger.',
      REVISE: 'Revision requested. The markup is attached and the note is in the Live Margin queue.',
      REJECT: 'Rejected and recorded. Nothing will be published.'
    }[decision];
    renderProgress();
    renderResult();
  } catch (error) {
    state.textContent = error.status === 401 || error.code === '42501'
      ? 'Access denied: Chairman authentication required. Nothing was recorded.'
      : `The decision was not recorded: ${error.message}`;
  } finally {
    renderResult();
  }
}

async function patchJobState(nextState) {
  const job = studio.job;
  if (!job?.job_code || job.job_code.startsWith('LOCAL-')) return;
  try {
    await api(`/rest/v1/thy_media_animation_jobs?job_code=eq.${encodeURIComponent(job.job_code)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: { job_state: nextState, settled_at: new Date().toISOString(), markup_ref: studio.markup.ref }
    });
  } catch { /* the ledger entry is the record of decision; this is the mirror */ }
}

/* -------------------------------------------------------- publishing queue */
function renderQueueState() {
  const handoff = publishHandoff({
    job: studio.job,
    asset: studio.asset,
    locks: studio.locks,
    passport: assetContext(studio.asset ?? {}).passport,
    requirements: assetContext(studio.asset ?? {}).requirements
  });
  $('msQueue').disabled = !handoff.ok;
  $('msQueueProblems').innerHTML = handoff.ok
    ? '<p class="muted">Clear to hand over to the publishing queue.</p>'
    : handoff.problems.map(p => `<div class="row"><div><span>${esc(p)}</span></div></div>`).join('');
  return handoff;
}

$('msQueue')?.addEventListener('click', async () => {
  const state = $('msQueueState');
  const handoff = renderQueueState();
  if (!handoff.ok) { state.textContent = 'Not handed over.'; return; }

  $('msQueue').disabled = true;
  state.textContent = 'Writing provenance, then handing to the publishing queue…';
  try {
    // 1 · Provenance FIRST. The derivative names its parent and discloses the
    // tool before anything is queued, so a queued item can never lack its
    // provenance.
    await api('/rest/v1/rael_provenance_events', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: { asset_id: studio.asset.id, ...handoff.provenance }
    });

    // 2 · Hand over to the existing EDF publish path. This freezes release
    // metadata; it is immutable afterwards and there is no edit affordance.
    const result = await rpc(SERVICES.EDF_RELEASE.publish, handoff.payload);
    studio.job.job_state = 'QUEUED_FOR_PUBLISH';
    await patchJobState('QUEUED_FOR_PUBLISH');
    state.textContent = result?.state
      ? `In the publishing queue · ${result.state}. Release metadata is now frozen.`
      : 'Handed to the publishing queue. Release metadata is now frozen.';
    renderProgress();
  } catch (error) {
    state.textContent = error.provisionRequired
      ? 'Not queued: the publishing path is not reachable from this device. Nothing was published.'
      : `Not queued: ${error.message}. Nothing was published.`;
    $('msQueue').disabled = false;
  }
});

/* -------------------------------------------------------------------- boot */
$('footBackend').textContent = BACKEND_PROJECT;
// Resolve the canonical role BEFORE the first route decision, so a Chairman
// deep-linking to #media-studio is not bounced to Home on load.
await resolveChairmanRole();
authUI();
// Restore where the reader was; the route guard still decides whether they may
// be there, so a saved Chairman route does not reopen for a signed-out device.
const opening = sectionFromHash(location.hash) !== DEFAULT_SECTION
  ? sectionFromHash(location.hash)
  : (SECTION_IDS.includes(loadState().section) || loadState().section === 'account'
      ? loadState().section : DEFAULT_SECTION);
showView(opening);
checkBackend();

if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});

// Exposed for the browser proof only; the shell itself does not read these.
window.__thylora = { showView, resolveRoute, loadState, saveState, SECTIONS, studio, openAsset, renderResult, resolveChairmanRole };
