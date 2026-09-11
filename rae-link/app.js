// RAE LINK · surface controller
// Workroom: WR-RAELINK-001
//
// The rules live in lib/. This file only moves them onto the screen, so the app
// and the backend cannot drift apart: the gate shown here is the gate stored in
// rael_publish_gate, and the money shown here is the money settled by
// rael_settle_revenue_event.

import { api, rpc, safeRead, readiness, getSession, currentUser, signIn, signUp, signOut, BackendError }
  from './lib/backend.js';
import { settleRevenueEvent, allocate, validateSplitPolicy, formatMinor, formatBp, REVENUE_LANES }
  from './lib/ledger.js';
import { publishGate, STAGES } from './lib/pipeline.js';
import { evaluateRightsGate, validatePartnership, validateChannelTruth, PARTNERSHIP_PROHIBITIONS }
  from './lib/rights.js';
import { CAPABILITIES, resolve, lockInRisk } from './lib/providers.js';

const $ = id => document.getElementById(id);
const esc = (value = '') => String(value).replace(/[&<>'"]/g,
  c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));

/* ---------------------------------------------------------------- navigation */
function showView(id) {
  const target = document.getElementById(id) ? id : 'watch';
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active-view', v.id === target));
  document.querySelectorAll('[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === target));
  history.replaceState(null, '', `#${target}`);
  if (target === 'following') loadFollowing();
  if (target === 'studio') loadStudio();
  if (target === 'earnings') loadChannelOptions($('statementChannel'));
  if (target === 'library') loadLibrary();
}
document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => showView(b.dataset.view)));

/* ----------------------------------------------------------- backend posture */
function notice(element, { title, detail, hint, bad = false }) {
  if (!element) return;
  element.hidden = false;
  element.classList.toggle('bad', bad);
  element.innerHTML = `<strong>${esc(title)}</strong><span>${esc(detail)}</span>` +
    (hint ? `<br><code>${esc(hint)}</code>` : '');
}

const PROVISION_HINT = 'Apply db/rae-link/0001…0010 to the thylora-dash backend.';

async function checkBackend() {
  const chip = $('backendChip');
  const report = await readiness();
  if (report.state === 'READY') {
    chip.textContent = 'BACKEND · READY';
    chip.className = 'chip ok';
    return report;
  }
  const unreachable = report.errored.some(e => /unreachable/i.test(e.message));
  chip.textContent = unreachable ? 'BACKEND · UNREACHABLE'
    : report.state === 'NOT_PROVISIONED' ? 'BACKEND · NOT PROVISIONED' : 'BACKEND · PARTIAL';
  chip.className = `chip ${unreachable ? 'bad' : 'warn'}`;

  const detail = unreachable
    ? 'The RAE Link surface cannot reach the THYLORA backend from this network. Nothing has been lost; reads will resume when the backend is reachable.'
    : `These RAE Link surfaces are not provisioned yet: ${report.missing.join(', ') || 'unknown'}. The schema is written and reviewable; it has not been applied to the live backend.`;

  for (const id of ['watchNotice', 'studioNotice', 'earningsNotice']) {
    notice($(id), { title: unreachable ? 'Backend unreachable' : 'RAE Link tables not provisioned yet',
                    detail, hint: unreachable ? null : PROVISION_HINT, bad: unreachable });
  }
  return report;
}

/* ---------------------------------------------------------------------- auth */
function authUI() {
  const user = currentUser();
  const signed = Boolean(getSession()?.access_token && user?.id);
  $('signedOut').hidden = signed;
  $('signedIn').hidden = !signed;
  $('whoChip').textContent = signed ? `SIGNED IN · ${user.email ?? 'member'}` : 'SIGNED OUT';
  $('whoChip').className = `chip who ${signed ? 'ok' : ''}`;
  if (signed) $('memberLabel').textContent = `Signed in · ${user.email ?? 'protected member'}`;
}

$('signInBtn')?.addEventListener('click', async () => {
  const status = $('authStatus');
  status.className = 'status';
  status.textContent = 'Signing in…';
  try {
    await signIn($('loginEmail').value.trim(), $('loginPassword').value);
    $('loginPassword').value = '';
    status.textContent = 'Signed in.';
    status.className = 'status good';
    authUI(); loadStudio(); loadFollowing(); loadLibrary();
  } catch (error) {
    status.textContent = `Sign-in did not complete: ${error.message}`;
    status.className = 'status bad';
  }
});

$('signUpBtn')?.addEventListener('click', async () => {
  const status = $('authStatus');
  status.className = 'status';
  status.textContent = 'Creating viewer account…';
  try {
    const data = await signUp($('loginEmail').value.trim(), $('loginPassword').value);
    status.textContent = data?.access_token
      ? 'Account created and signed in.'
      : 'Account created. Check your email to confirm before signing in.';
    status.className = 'status good';
    authUI();
  } catch (error) {
    status.textContent = `Account creation did not complete: ${error.message}`;
    status.className = 'status bad';
  }
});

$('signOutBtn')?.addEventListener('click', () => { signOut(); authUI(); showView('watch'); });

/* ---------------------------------------------------------------------- feed */
function classTag(channel) {
  const world = channel?.world_status === 'WORLD_SIMULATED';
  const label = world ? 'WORLD MEDIA · SIMULATED' : 'EARTH CHANNEL';
  return `<span class="tag ${world ? 'world' : 'earth'}">${label}</span>`;
}

function tile(item) {
  const channel = item.channel ?? {};
  const seconds = Number(item.duration_seconds || 0);
  const length = seconds ? `${Math.floor(seconds / 60)}m ${seconds % 60}s` : '';
  return `<article class="tile">
    <div class="poster" aria-hidden="true">${item.media_kind === 'AUDIO' ? '♪' : item.media_kind === 'EDF' ? '◆' : '▷'}</div>
    <div class="body">
      <strong>${esc(item.title)}</strong>
      <span class="meta">${esc(channel.name ?? 'Channel')}${length ? ` · ${length}` : ''}</span>
      <span class="meta">${item.published_at ? new Date(item.published_at).toLocaleDateString() : ''}</span>
      ${classTag(channel)}
    </div></article>`;
}

async function loadFeed() {
  const grid = $('feedGrid');
  grid.innerHTML = '<p class="muted">Loading the published feed…</p>';
  const result = await safeRead('feed', () => rpc('rael_public_feed', { p_limit: 24 }));
  if (!result.ok) {
    grid.innerHTML = `<p class="muted">${result.provisionRequired
      ? 'The published feed cannot load until the RAE Link tables are applied to the backend.'
      : `Feed unavailable: ${esc(result.message)}`}</p>`;
    return;
  }
  const rows = result.data ?? [];
  grid.innerHTML = rows.length
    ? rows.map(tile).join('')
    : '<p class="muted">No media has been published to RAE Link yet. The feed shows published work only — nothing is invented to fill it.</p>';
}
$('refreshFeed')?.addEventListener('click', loadFeed);

/* -------------------------------------------------------------------- search */
let searchKind = 'ALL';
document.querySelectorAll('#searchFilters .chip-btn').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('#searchFilters .chip-btn').forEach(b => b.classList.remove('active'));
    button.classList.add('active');
    searchKind = button.dataset.kind;
  });
});

$('searchForm')?.addEventListener('submit', async event => {
  event.preventDefault();
  const query = $('searchInput').value.trim();
  const out = $('searchResults');
  if (!query) { out.innerHTML = '<p class="muted">Enter a search to read the published index.</p>'; return; }
  out.innerHTML = '<p class="muted">Searching the published index…</p>';
  const result = await safeRead('search', () => rpc('rael_search', { p_query: query, p_limit: 36 }));
  if (!result.ok) {
    out.innerHTML = `<p class="muted">${result.provisionRequired
      ? 'Search cannot run until the RAE Link tables are applied to the backend.'
      : `Search unavailable: ${esc(result.message)}`}</p>`;
    return;
  }
  const rows = (result.data ?? []).filter(r => searchKind === 'ALL' || r.media_kind === searchKind);
  out.innerHTML = rows.length
    ? rows.map(r => tile({ ...r, channel: { name: r.channel_name, world_status: r.world_status } })).join('')
    : '<p class="muted">No published match. Unpublished and private work never appears in search.</p>';
});

/* ----------------------------------------------------------------- following */
async function loadFollowing() {
  const list = $('followingList');
  if (!getSession()?.access_token) {
    list.innerHTML = '<p class="muted">Sign in to load the channels you follow.</p>'; return;
  }
  list.innerHTML = '<p class="muted">Loading…</p>';
  const result = await safeRead('follows', () => api(
    '/rest/v1/rael_follows?select=channel_id,rael_channels(name,slug,channel_class,world_status)&follow_state=eq.ACTIVE'));
  if (!result.ok) {
    list.innerHTML = `<p class="muted">${result.provisionRequired
      ? 'Follows cannot load until the RAE Link tables are applied.' : esc(result.message)}</p>`;
    return;
  }
  const rows = result.data ?? [];
  list.innerHTML = rows.length ? rows.map(row => {
    const channel = row.rael_channels ?? {};
    return `<article class="tile"><div class="body"><strong>${esc(channel.name ?? 'Channel')}</strong>
      <span class="meta">${esc(channel.channel_class ?? '')}</span>${classTag(channel)}</div></article>`;
  }).join('') : '<p class="muted">You are not following any channel yet.</p>';
}

/* ------------------------------------------------------------ creator studio */
async function loadChannelOptions(select) {
  if (!select) return [];
  if (!getSession()?.access_token) { select.innerHTML = '<option value="">Sign in first</option>'; return []; }
  const result = await safeRead('channels', () => api(
    '/rest/v1/rael_channels?select=id,name,channel_class,world_status,simulated_disclosure&order=name'));
  if (!result.ok) {
    select.innerHTML = `<option value="">${result.provisionRequired ? 'Channels not provisioned' : 'Channels unavailable'}</option>`;
    return [];
  }
  const rows = result.data ?? [];
  select.innerHTML = rows.length
    ? rows.map(c => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('')
    : '<option value="">No channel yet</option>';
  return rows;
}

let studioDrafts = [];

async function loadStudio() {
  await loadChannelOptions($('studioChannel'));
  const list = $('draftList');
  if (!getSession()?.access_token) { list.innerHTML = '<p class="muted">Sign in to load your channel drafts.</p>'; return; }
  list.innerHTML = '<p class="muted">Loading drafts…</p>';
  const result = await safeRead('drafts', () => api(
    '/rest/v1/rael_media_assets?select=id,asset_code,title,media_kind,pipeline_state,channel_id&order=created_at.desc&limit=50'));
  if (!result.ok) {
    list.innerHTML = `<p class="muted">${result.provisionRequired
      ? 'Drafts cannot load until the RAE Link tables are applied.' : esc(result.message)}</p>`;
    return;
  }
  studioDrafts = result.data ?? [];
  list.innerHTML = studioDrafts.length ? studioDrafts.map(d =>
    `<button type="button" class="card" style="width:100%;text-align:left" data-draft="${esc(d.id)}">
      <strong>${esc(d.title)}</strong>
      <span class="meta muted">${esc(d.asset_code ?? '')} · ${esc(d.media_kind)} · ${esc(d.pipeline_state)}</span>
    </button>`).join('') : '<p class="muted">No drafts on your channels yet.</p>';
  list.querySelectorAll('[data-draft]').forEach(button =>
    button.addEventListener('click', () => runGate(button.dataset.draft)));
  paintStages(studioDrafts[0]?.pipeline_state ?? 'INPUT');
}

function paintStages(state) {
  const index = STAGES.indexOf(state);
  document.querySelectorAll('#stageRail span').forEach(span => {
    const position = STAGES.indexOf(span.dataset.stage);
    span.className = '';
    if (state === 'BLOCKED') { span.classList.add('blocked'); return; }
    if (position < index) span.classList.add('done');
    else if (position === index) span.classList.add('current');
  });
}

function renderGate(report) {
  const holder = $('gateReport');
  paintStages(report.pipeline_state ?? 'INPUT');
  if (report.ready) {
    holder.innerHTML = `<div class="gate-item gate-ok"><b>READY TO PUBLISH</b>
      <span>Every prerequisite is met. Publication will record the gate result as evidence.</span></div>`;
    return;
  }
  holder.innerHTML = report.blockers.map(b => `<div class="gate-item">
      <b>${esc(b.code)}</b><span>${esc(b.detail)}</span><em>Route: ${esc(b.route ?? 'creator')}</em>
    </div>`).join('');
}

async function runGate(assetId) {
  const holder = $('gateReport');
  holder.innerHTML = '<p class="muted">Reading the publication gate…</p>';
  const result = await safeRead('gate', () => rpc('rael_publish_gate', { p_asset_id: assetId }));
  if (result.ok) { renderGate(result.data); return; }

  // Backend gate unavailable: evaluate locally from what the draft carries, and
  // say plainly that this is the client copy of the same rule.
  const draft = studioDrafts.find(d => d.id === assetId) ?? { media_kind: 'VIDEO', title: '' };
  const local = publishGate(draft, {});
  holder.innerHTML = `<div class="notice" style="margin-bottom:12px"><strong>Gate evaluated locally</strong>
    <span>${result.provisionRequired
      ? 'The backend gate is not provisioned yet, so this is the client copy of the same rule set.'
      : esc(result.message)}</span></div>` +
    local.blockers.map(b => `<div class="gate-item"><b>${esc(b.code)}</b>
      <span>${esc(b.detail)}</span><em>Route: ${esc(b.route)}</em></div>`).join('');
}

$('assetForm')?.addEventListener('submit', async event => {
  event.preventDefault();
  const status = $('assetStatus');
  const form = new FormData(event.currentTarget);
  status.className = 'status';

  // Rights are evaluated before anything is written. That is the gate order.
  const rightsCheck = evaluateRightsGate({
    ownership_basis: form.get('ownership_basis'),
    rights_holder_name: form.get('rights_holder_name')?.trim() || null,
    license_ref: form.get('license_ref')?.trim() || null
  });
  if (rightsCheck.gate_state !== 'PASSED') {
    status.className = 'status bad';
    status.textContent = 'Rights gate did not pass:\n' +
      rightsCheck.problems.map(p => `· ${p.detail}`).join('\n');
    return;
  }

  if (!getSession()?.access_token) {
    status.className = 'status bad';
    status.textContent = 'Rights gate passed. Sign in under Account before the draft can be saved to the backend.';
    return;
  }

  status.textContent = 'Rights gate passed. Saving draft…';
  const assetCode = `RAEL-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  try {
    const created = await api('/rest/v1/rael_media_assets', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: {
        asset_code: assetCode,
        channel_id: form.get('channel_id'),
        owner_user_id: currentUser()?.id,
        media_kind: form.get('media_kind'),
        title: form.get('title').trim(),
        description: form.get('description')?.trim() || null,
        pipeline_state: 'RIGHTS_GATE'
      }
    });
    const asset = Array.isArray(created) ? created[0] : created;
    await api('/rest/v1/rael_rights_records', {
      method: 'POST', headers: { Prefer: 'return=minimal' },
      body: {
        asset_id: asset.id,
        ownership_basis: form.get('ownership_basis'),
        rights_holder_name: form.get('rights_holder_name')?.trim() || null,
        license_ref: form.get('license_ref')?.trim() || null,
        gate_state: 'PASSED',
        verified_by: currentUser()?.id,
        verified_at: new Date().toISOString(),
        authority_evidence: { declared_in: 'rae-link-studio', checked_at: new Date().toISOString() }
      }
    });
    if (form.get('provenance')?.trim()) {
      await api('/rest/v1/rael_provenance_events', {
        method: 'POST', headers: { Prefer: 'return=minimal' },
        body: {
          asset_id: asset.id,
          event_type: form.get('ai_disclosure') ? 'AI_ASSISTED' : 'CREATED',
          source_description: form.get('provenance').trim(),
          recorded_by: currentUser()?.id
        }
      });
    }
    event.currentTarget.reset();
    status.className = 'status good';
    status.textContent = `Draft saved · ${assetCode} · rights gate PASSED. Upload, validation, encoding, poster and moderation remain.`;
    await loadStudio();
    await runGate(asset.id);
  } catch (error) {
    status.className = 'status bad';
    status.textContent = error instanceof BackendError && error.provisionRequired
      ? `Rights gate passed, but the RAE Link tables are not applied to the backend yet. Nothing was lost. ${PROVISION_HINT}`
      : `Draft did not save: ${error.message}`;
  }
});

/* ------------------------------------------------------------------ earnings */
function statementTable(rows) {
  const head = ['Lane', 'Gross', 'Processor fees', 'Refunds', 'Chargebacks', 'Tax', 'Platform', 'Creator', 'Beneficiary', 'Net payable'];
  return `<div class="table-wrap"><table class="ledger"><thead><tr>${
    head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${
    rows.map(r => `<tr>
      <td>${esc(REVENUE_LANES[r.lane_code]?.label ?? r.lane_code)}</td>
      <td class="num">${formatMinor(r.gross_minor, r.currency)}</td>
      <td class="num">${formatMinor(r.processor_fee_minor, r.currency)}</td>
      <td class="num">${formatMinor(r.refund_minor, r.currency)}</td>
      <td class="num">${formatMinor(r.chargeback_minor, r.currency)}</td>
      <td class="num">${formatMinor(r.tax_minor, r.currency)} <span class="muted">${esc((r.tax_states ?? []).join('/'))}</span></td>
      <td class="num">${formatMinor(r.platform_share_minor, r.currency)}</td>
      <td class="num">${formatMinor(r.creator_share_minor, r.currency)}</td>
      <td class="num">${formatMinor(r.beneficiary_share_minor, r.currency)}</td>
      <td class="num">${formatMinor(r.net_payable_minor, r.currency)}</td>
    </tr>`).join('')}</tbody></table></div>`;
}

$('statementForm')?.addEventListener('submit', async event => {
  event.preventDefault();
  const out = $('statementOut');
  const channel = $('statementChannel').value;
  if (!channel) { out.innerHTML = '<p class="muted">Select a channel.</p>'; return; }
  out.innerHTML = '<p class="muted">Reading the statement…</p>';
  const result = await safeRead('statement', () => rpc('rael_creator_statement', {
    p_channel_id: channel,
    p_from: $('statementFrom').value || '2026-01-01',
    p_to: $('statementTo').value || new Date().toISOString().slice(0, 10)
  }));
  if (!result.ok) {
    out.innerHTML = `<p class="muted">${result.provisionRequired
      ? 'Statements cannot load until the RAE Link ledger tables are applied to the backend.'
      : esc(result.message)}</p>`;
    return;
  }
  const lanes = result.data?.lanes ?? [];
  out.innerHTML = lanes.length
    ? statementTable(lanes) + '<p class="muted">Held amounts are shown separately and are never folded into net payable. A payout reads PAID only with a date, a processor reference and stored evidence.</p>'
    : '<p class="muted">No revenue recorded for this channel and period.</p>';
});

/* ------------------------------------------------ live monetization worked example */
function renderCalc() {
  const form = $('calcForm');
  const data = Object.fromEntries(new FormData(form).entries());
  const event = {
    lane_code: data.lane_code,
    channel_id: 'THIS_CHANNEL',
    currency: 'USD',
    gross_minor: Number(data.gross_minor || 0),
    processor_fee_minor: Number(data.processor_fee_minor || 0),
    refund_minor: Number(data.refund_minor || 0),
    chargeback_minor: Number(data.chargeback_minor || 0),
    tax_minor: Number(data.tax_minor || 0),
    tax_state: data.tax_state,
    tax_remitted_by: data.tax_state === 'PLATFORM_REMITTED' ? 'PLATFORM'
      : data.tax_state === 'CREATOR_RESPONSIBLE' ? 'CREATOR' : 'NONE'
  };
  const policy = {
    policy_code: 'WORKED_EXAMPLE',
    lane_code: data.lane_code,
    platform_share_bp: Number(data.platform_share_bp || 0),
    creator_share_bp: Number(data.creator_share_bp || 0),
    beneficiary_share_bp: Number(data.beneficiary_share_bp || 0),
    partner_share_bp: 0,
    beneficiary_ref: data.beneficiary_ref?.trim() || null,
    declared_before_publication: true
  };

  let settled;
  try { settled = settleRevenueEvent(event, policy); }
  catch (error) { $('calcOut').innerHTML = `<p class="status bad">${esc(error.message)}</p>`; return; }

  if (!settled.settled) {
    $('calcOut').innerHTML = `<div class="notice bad"><strong>${esc(settled.reason)}</strong>
      <span>${settled.problems.map(esc).join(' · ')}</span></div>`;
    return;
  }

  const line = (label, value, note = '') =>
    `<tr><td>${esc(label)}</td><td class="num">${value}</td><td class="muted">${esc(note)}</td></tr>`;
  const c = settled.currency;
  $('calcOut').innerHTML = `<div class="table-wrap"><table class="ledger">
    <thead><tr><th>Line</th><th>Amount</th><th>Note</th></tr></thead><tbody>
    ${line('Gross revenue', formatMinor(settled.gross_revenue_minor, c))}
    ${line('Processor fees', `− ${formatMinor(settled.processor_fees_minor, c)}`, 'Charged by the payment provider')}
    ${line('Refunds', `− ${formatMinor(settled.refunds_minor, c)}`)}
    ${line('Chargebacks', `− ${formatMinor(settled.chargebacks_minor, c)}`)}
    ${line('Tax', `${settled.tax_remitted_by === 'PLATFORM' ? '− ' : ''}${formatMinor(settled.tax_minor, c)}`,
           `State: ${settled.tax_state} · remitted by ${settled.tax_remitted_by}`)}
    <tr class="total">${`<td>Distributable base</td><td class="num">${formatMinor(settled.distributable_base_minor, c)}</td><td class="muted">What the split applies to</td>`}</tr>
    ${line('Platform share', formatMinor(settled.platform_share_minor, c), formatBp(policy.platform_share_bp))}
    ${line('Creator share', formatMinor(settled.creator_share_minor, c), formatBp(policy.creator_share_bp))}
    ${settled.beneficiary_share_minor
      ? line('Beneficiary share', formatMinor(settled.beneficiary_share_minor, c),
             `${formatBp(policy.beneficiary_share_bp)} to ${policy.beneficiary_ref ?? 'unnamed'}`)
      : ''}
    <tr class="total"><td>Net payable to creator</td><td class="num">${formatMinor(settled.net_payable_minor, c)}</td>
      <td class="muted">Payout state: ${esc(settled.payout_state)}</td></tr>
    ${line('Payment date', settled.payment_date ?? '—', 'Set only when the payout is sent')}
    ${line('Payment evidence', settled.payment_evidence ? 'stored' : '—', 'Processor reference required before a payout reads PAID')}
    </tbody></table></div>
    <p class="muted">Rounding: floor by basis points, then the remaining minor units are handed out to beneficiary, then creator, then the platform — so no cent disappears and rounding never favours the house.</p>`;
}

$('calcForm')?.addEventListener('input', renderCalc);

/* ------------------------------------------------------------------- library */
async function loadLibrary() {
  const list = $('libraryList');
  if (!getSession()?.access_token) { list.innerHTML = '<p class="muted">Sign in to load your entitlements.</p>'; return; }
  list.innerHTML = '<p class="muted">Loading your library…</p>';
  const result = await safeRead('entitlements', () => api(
    '/rest/v1/rael_entitlements?select=id,grant_basis,is_perpetual,granted_at,expires_at,asset_id,product_ref&revoked_at=is.null&order=granted_at.desc'));
  if (!result.ok) {
    list.innerHTML = `<p class="muted">${result.provisionRequired
      ? 'Your library cannot load until the RAE Link tables are applied.' : esc(result.message)}</p>`;
    return;
  }
  const rows = result.data ?? [];
  list.innerHTML = rows.length ? rows.map(row => `<article class="tile"><div class="body">
      <strong>${esc(row.asset_id ?? row.product_ref ?? 'Entitlement')}</strong>
      <span class="meta">${esc(row.grant_basis)} · ${row.is_perpetual ? 'perpetual re-access' : 'time limited'}</span>
      <span class="meta">Granted ${new Date(row.granted_at).toLocaleDateString()}</span>
    </div></article>`).join('') : '<p class="muted">No entitlements yet.</p>';
}

/* --------------------------------------------------------------- partnership */
$('prohibitionList').innerHTML = PARTNERSHIP_PROHIBITIONS
  .map(([code, statement]) => `<div><b>${esc(code.replaceAll('_', ' '))}</b><span>${esc(statement)}</span></div>`)
  .join('');

$('partnershipForm')?.addEventListener('input', renderPartnership);
$('partnershipForm')?.addEventListener('submit', event => { event.preventDefault(); renderPartnership(); });

function renderPartnership() {
  const data = Object.fromEntries(new FormData($('partnershipForm')).entries());
  const beneficiaryBp = Number(data.beneficiary_share_bp || 0);
  const check = validatePartnership({
    beneficiary_share_bp: beneficiaryBp,
    beneficiary_ref: data.beneficiary_ref?.trim() || null,
    purpose_statement: data.purpose_statement?.trim() || null,
    declared_at: new Date().toISOString()
  }, {
    subject_kind: data.subject_kind,
    storytelling_mode: data.storytelling_mode,
    guardian_user_id: data.subject_kind === 'MINOR' ? null : 'not-required',
    medical_details_collected: false
  });

  const platformBp = 1000;
  const creatorBp = Math.max(0, 10000 - platformBp - beneficiaryBp);
  const policy = {
    policy_code: 'PARTNERSHIP_PREVIEW', lane_code: 'FAMILY_PARTNERSHIP',
    platform_share_bp: platformBp, creator_share_bp: creatorBp,
    beneficiary_share_bp: beneficiaryBp, partner_share_bp: 0,
    beneficiary_ref: data.beneficiary_ref?.trim() || null, declared_before_publication: true
  };
  const policyCheck = validateSplitPolicy(policy);
  const example = policyCheck.valid ? allocate(10000, policyCheck.shares) : [];

  $('partnershipPreview').innerHTML = `
    ${check.valid
      ? '<div class="gate-item gate-ok"><b>DECLARATION COMPLETE</b><span>This partnership can be recorded. Publication still requires the consent record and the publish gate.</span></div>'
      : check.problems.map(p => `<div class="gate-item"><b>${esc(p.code)}</b><span>${esc(p.detail)}</span></div>`).join('')}
    <h3>Declared split</h3>
    ${policyCheck.valid ? `<div class="table-wrap"><table class="ledger">
      <thead><tr><th>Party</th><th>Share</th><th>On $100.00</th></tr></thead><tbody>
      ${example.map(e => `<tr><td>${esc(e.party_kind)}</td><td class="num">${formatBp(e.share_bp)}</td>
        <td class="num">${formatMinor(e.amount_minor)}</td></tr>`).join('')}
      </tbody></table></div>`
      : `<p class="status bad">${policyCheck.problems.map(esc).join(' · ')}</p>`}
    <p class="muted">Storytelling mode: <strong>${esc(data.storytelling_mode)}</strong>. A family may change mode going forward; the mode is never a condition of receiving help.</p>
    ${data.subject_kind === 'MINOR'
      ? '<p class="status bad">A child participant requires recorded guardian authority before anything publishes.</p>' : ''}`;
}

/* ---------------------------------------------------------------- build map */
function renderProviders() {
  const risk = lockInRisk();
  $('lockinStats').innerHTML = `
    <div><b>${risk.capabilities}</b><span>CAPABILITIES MAPPED</span></div>
    <div><b>${risk.open_decisions}</b><span>OPEN PROVIDER DECISIONS</span></div>
    <div><b>${risk.high_exit_cost}</b><span>HIGH EXIT COST</span></div>
    <div><b>${risk.without_two_alternates}</b><span>WITHOUT TWO ALTERNATES</span></div>`;

  $('providerTable').innerHTML = Object.keys(CAPABILITIES).map(key => {
    const decision = resolve(key);
    const state = decision.status === 'UNRESOLVED' ? 'UNRESOLVED' : decision.status;
    return `<div class="provider-row">
      <b>${esc(key.replaceAll('_', ' '))}</b>
      <span class="muted">${esc(decision.provider ?? 'no provider chosen')}</span>
      <span class="alts">alternates: ${esc((decision.alternates ?? []).join(', '))}</span>
      <span class="state ${esc(state)}">${esc(state)}</span>
    </div>`;
  }).join('');
}

/* ----------------------------------------------------------------- start-up */
function populateLanes() {
  const select = $('calcLane');
  select.innerHTML = Object.entries(REVENUE_LANES)
    .map(([code, lane]) => `<option value="${code}">${esc(lane.label)}</option>`).join('');
}

(function start() {
  populateLanes();
  renderCalc();
  renderProviders();
  renderPartnership();
  authUI();
  showView((location.hash || '#watch').slice(1));
  checkBackend().then(loadFeed);
})();
