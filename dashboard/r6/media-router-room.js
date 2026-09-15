// THYLORA MEDIA ROUTER · Chairman dashboard room
// Authoritative backend: thylora-dash (jvsdxhrfhtlgaknhjxlz)
//
// The room the Chairman works in: pick a registered THYLORA asset, see every
// provider's offer side by side, authorise a spend explicitly, watch the job,
// receive the clip as a derivative, and approve, revise or reject it.
//
// It reads and writes the EXISTING backend only:
//   assets, thylora_visual_assets            source stills and generated clips
//   studio_world_characters                  continuity
//   studio_character_reference_assets        continuity clearance
//   studio_render_jobs, studio_render_attempts   the render pipeline that
//                                            already exists and has never run
//   thylora_visual_provenance, vlegh_registry    provenance and serials
//   approval_queue                           Chairman approval
//
// It creates no table of its own.

import {
  PROVIDER_CATALOGUE, OPERATIONS, JOB_STATES, MEDIA_ROUTER_GATES,
  allOffers, selectProvider, toRenderJobRow
} from './lib/media-router.js';
import { buildContinuity, deriveClip } from './lib/media-provenance.js';
import { measureStore, GATE_STATES } from './lib/money-distance.js';

const el = (tag, props = {}, kids = []) => {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'style') Object.assign(node.style, v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (v !== null && v !== undefined) node.setAttribute(k, v);
  }
  for (const kid of [].concat(kids)) {
    if (kid == null) continue;
    node.appendChild(typeof kid === 'string' ? document.createTextNode(kid) : kid);
  }
  return node;
};

const btn = (primary = false) => primary
  ? { minHeight: '44px', padding: '0 16px', borderRadius: '10px', border: '1px solid #d6a348', background: '#d6a348', color: '#10141b', fontWeight: '800', cursor: 'pointer' }
  : { minHeight: '44px', padding: '0 14px', borderRadius: '10px', border: '1px solid #293342', background: '#151e29', color: '#f4efe6', cursor: 'pointer' };

const money = (minor, currency = 'USD') =>
  minor == null ? 'cost unknown' : `${(minor / 100).toFixed(2)} ${currency}`;

export function buildMediaRouterRoom({ custody, onStatus = () => {} }) {
  const state = {
    assets: [],
    characters: [],
    references: [],
    selectedAsset: null,
    selectedCharacterIds: new Set(),
    offers: [],
    chosen: null,
    consentedSubstitution: null,
    job: null,
    request: {
      operation: OPERATIONS.IMAGE_TO_VIDEO,
      duration_seconds: 6,
      resolution: '1280x720',
      audio_required: false,
      prompt: '',
      preferred_provider: ''
    }
  };

  const ui = {};
  ui.status = el('div', { class: 'thy-r6-state', id: 'thyMRStatus', text: 'Load registered assets to begin.' });
  const say = (m, kind = '') => { ui.status.className = 'thy-r6-state ' + kind; ui.status.textContent = m; onStatus(m, kind); };

  // ---- asset lane ----------------------------------------------------------

  ui.assetList = el('div', { class: 'thy-r6-notes', id: 'thyMRAssets' },
    [el('div', { class: 'thy-r6-empty', text: 'Not loaded.' })]);

  ui.characterList = el('div', { class: 'thy-r6-notes', id: 'thyMRCharacters' },
    [el('div', { class: 'thy-r6-empty', text: 'Not loaded.' })]);

  ui.continuityLine = el('div', { class: 'thy-r6-sub', id: 'thyMRContinuity', text: 'No characters selected.' });

  // ---- request lane --------------------------------------------------------

  const opSelect = el('select', { class: 'thy-r6-input', id: 'thyMROperation' },
    Object.values(OPERATIONS).map(o => el('option', { value: o }, [o])));
  opSelect.addEventListener('change', () => { state.request.operation = opSelect.value; renderOffers(); });

  const durationInput = el('input', { class: 'thy-r6-input', id: 'thyMRDuration', type: 'number', min: '1', max: '10', value: '6' });
  durationInput.addEventListener('input', () => { state.request.duration_seconds = Number(durationInput.value) || 0; renderOffers(); });

  const resolutionInput = el('input', { class: 'thy-r6-input', id: 'thyMRResolution', value: '1280x720' });
  resolutionInput.addEventListener('input', () => { state.request.resolution = resolutionInput.value.trim(); renderOffers(); });

  const audioToggle = el('input', { type: 'checkbox', id: 'thyMRAudio' });
  audioToggle.addEventListener('change', () => { state.request.audio_required = audioToggle.checked; renderOffers(); });

  const providerSelect = el('select', { class: 'thy-r6-input', id: 'thyMRProvider' }, [
    el('option', { value: '' }, ['Automatic — router chooses and discloses']),
    ...Object.values(PROVIDER_CATALOGUE).map(p => el('option', { value: p.provider_code }, [p.label]))
  ]);
  providerSelect.addEventListener('change', () => {
    state.request.preferred_provider = providerSelect.value;
    state.consentedSubstitution = null;   // a new choice retracts any prior consent
    renderOffers();
  });

  ui.prompt = el('textarea', { class: 'thy-r6-input thy-r6-textarea', id: 'thyMRPrompt', placeholder: 'Direction for the clip — motion, camera, mood.' });
  ui.prompt.addEventListener('input', () => { state.request.prompt = ui.prompt.value; });

  // ---- offers --------------------------------------------------------------

  ui.offerBox = el('div', { id: 'thyMROffers' }, [el('div', { class: 'thy-r6-empty', text: 'Choose an asset to see provider offers.' })]);
  ui.decision = el('div', { class: 'thy-r6-gate-verdict fail', id: 'thyMRDecision', text: 'No request composed.' });

  ui.authorise = el('button', {
    type: 'button', id: 'thyMRAuthorise', class: 'thy-r6-build', disabled: 'disabled', onclick: authoriseSpend
  }, ['AUTHORISE THIS SPEND AND QUEUE THE JOB']);

  // ---- job + result --------------------------------------------------------

  ui.jobBox = el('div', { id: 'thyMRJob' }, [el('div', { class: 'thy-r6-empty', text: 'No job.' })]);
  ui.moneyBox = el('div', { id: 'thyMRMoney' }, [el('div', { class: 'thy-r6-empty', text: 'Not measured.' })]);
  ui.moneyLine = el('div', { class: 'thy-r6-sub', id: 'thyMRMoneyLine', text: '' });

  // ---- layout --------------------------------------------------------------

  const node = el('div', { class: 'thy-r6-room', id: 'thyR6RoomMedia', role: 'tabpanel' }, [
    el('div', { class: 'thy-r6-pad' }, [
      el('div', { class: 'thy-r6-card' }, [
        el('h3', { text: 'Media Router' }),
        el('div', { class: 'thy-r6-sub', text: 'Generate or animate a registered THYLORA asset. The provider, the estimated cost, the expected duration, the resolution and whether audio is included are shown before anything is paid for. A provider is never substituted without the Chairman naming the substitute.' }),
        el('div', { class: 'thy-r6-row', style: { marginTop: '10px' } }, [
          el('button', { type: 'button', id: 'thyMRLoad', style: btn(true), onclick: loadRegistries }, ['Load registered assets and continuity']),
          el('button', { type: 'button', id: 'thyMRMeasure', style: btn(), onclick: renderMoneyDistance }, ['Measure money-distance'])
        ]),
        ui.status
      ]),

      el('div', { class: 'thy-r6-preview-grid' }, [
        el('div', {}, [
          el('div', { class: 'thy-r6-card' }, [
            el('h3', { text: '1 · Registered asset' }),
            ui.assetList
          ]),
          el('div', { class: 'thy-r6-card' }, [
            el('h3', { text: '2 · Character continuity' }),
            el('div', { class: 'thy-r6-sub', text: 'Pulled from studio_world_characters. A character with no reference approved for generation cannot be generated — the provider would invent the face.' }),
            ui.characterList,
            ui.continuityLine
          ])
        ]),
        el('div', {}, [
          el('div', { class: 'thy-r6-card' }, [
            el('h3', { text: '3 · What to make' }),
            el('label', { class: 'thy-r6-sub', text: 'Operation' }), opSelect,
            el('label', { class: 'thy-r6-sub', text: 'Duration (seconds)' }), durationInput,
            el('label', { class: 'thy-r6-sub', text: 'Resolution' }), resolutionInput,
            el('label', { style: { display: 'flex', gap: '8px', alignItems: 'center', margin: '8px 0', fontSize: '12px', color: '#9fa8b5' } },
              [audioToggle, 'Audio track required']),
            el('label', { class: 'thy-r6-sub', text: 'Provider' }), providerSelect,
            ui.prompt
          ]),
          el('div', { class: 'thy-r6-card' }, [
            el('h3', { text: '4 · Offers — shown before any spend' }),
            ui.offerBox,
            ui.decision,
            ui.authorise
          ])
        ])
      ]),

      el('div', { class: 'thy-r6-card' }, [
        el('h3', { text: '5 · Job, result and approval' }),
        ui.jobBox
      ]),
      el('div', { class: 'thy-r6-card' }, [
        el('h3', { text: 'Money-distance — Chairman command to finished clip' }),
        ui.moneyLine,
        ui.moneyBox
      ])
    ])
  ]);

  // ---- backend reads -------------------------------------------------------

  async function read(table, query) {
    const token = custody.token();
    if (!token) return { ok: false, reason: 'NOT_SIGNED_IN', rows: [] };
    try {
      const r = await fetch(`${custody.url}/rest/v1/${table}?${query}`, {
        headers: { apikey: custody.key, Authorization: `Bearer ${token}` }
      });
      if (!r.ok) return { ok: false, reason: `HTTP_${r.status}`, rows: [] };
      return { ok: true, rows: await r.json() };
    } catch (err) {
      return { ok: false, reason: 'NETWORK', rows: [] };
    }
  }

  async function loadRegistries() {
    say('Reading the authoritative backend…');
    const [visual, chars, refs] = await Promise.all([
      read('thylora_visual_assets', 'select=asset_id,canonical_name,asset_type,truth_class,world_layer,subject,approval_state,rights_state,version&limit=200'),
      read('studio_world_characters', 'select=character_id,canonical_entity_id,first_name,last_name,truth_class,identity_state&limit=200'),
      read('studio_character_reference_assets', 'select=reference_id,character_id,reference_type,angle_or_pose,approved_for_generation,identity_lock_state,rights_state,visual_asset_id&limit=500')
    ]);

    if (!visual.ok) {
      say(`Registered assets not readable (${visual.reason}). Sign in on the dashboard first — the router will not invent an asset list.`, 'bad');
      return;
    }
    state.assets = visual.rows;
    state.characters = chars.rows || [];
    state.references = refs.rows || [];
    renderAssets();
    renderCharacters();
    say(`${state.assets.length} registered visual asset(s), ${state.characters.length} character(s), ${state.references.length} reference(s).`, 'good');
  }

  function renderAssets() {
    ui.assetList.replaceChildren();
    if (!state.assets.length) {
      ui.assetList.appendChild(el('div', { class: 'thy-r6-empty', text: 'No registered assets returned.' }));
      return;
    }
    for (const asset of state.assets) {
      const selected = state.selectedAsset?.asset_id === asset.asset_id;
      ui.assetList.appendChild(el('div', {
        class: `thy-r6-note${selected ? ' selected' : ''}`,
        onclick: () => { state.selectedAsset = asset; renderAssets(); renderOffers(); }
      }, [
        el('div', { class: 'thy-r6-note-top' }, [
          el('span', { class: 'thy-r6-note-at', text: asset.asset_id }),
          el('span', { class: 'thy-r6-note-kind', text: asset.asset_type || '—' }),
          el('span', { class: 'thy-r6-note-kind', text: `v${asset.version ?? 1}` })
        ]),
        el('div', { class: 'thy-r6-note-body', text: asset.canonical_name || '(untitled)' })
      ]));
    }
  }

  function renderCharacters() {
    ui.characterList.replaceChildren();
    if (!state.characters.length) {
      ui.characterList.appendChild(el('div', { class: 'thy-r6-empty', text: 'No characters returned.' }));
      return;
    }
    for (const c of state.characters) {
      const picked = state.selectedCharacterIds.has(c.character_id);
      const own = state.references.filter(r => r.character_id === c.character_id);
      const approved = own.filter(r => r.approved_for_generation).length;
      ui.characterList.appendChild(el('div', {
        class: `thy-r6-note${picked ? ' selected' : ''}`,
        onclick: () => {
          if (picked) state.selectedCharacterIds.delete(c.character_id);
          else state.selectedCharacterIds.add(c.character_id);
          renderCharacters(); renderOffers();
        }
      }, [
        el('div', { class: 'thy-r6-note-top' }, [
          el('span', { class: 'thy-r6-note-at', text: [c.first_name, c.last_name].filter(Boolean).join(' ') || 'UNNAMED' }),
          el('span', { class: 'thy-r6-note-kind', text: c.canonical_entity_id || '—' }),
          el('span', { class: `thy-r6-cell ${approved > 0 ? 'SERVING' : 'UNPROVEN'}`, text: `${approved}/${own.length} refs approved` })
        ]),
        el('div', { class: 'thy-r6-note-body', text: c.identity_state || '' })
      ]));
    }
  }

  function currentContinuity() {
    const chosen = state.characters.filter(c => state.selectedCharacterIds.has(c.character_id));
    return buildContinuity({ characters: chosen, references: state.references });
  }

  // ---- offers --------------------------------------------------------------

  function renderOffers() {
    const request = { ...state.request, source_asset_id: state.selectedAsset?.asset_id || null };
    const offers = allOffers(request);
    state.offers = offers;

    ui.offerBox.replaceChildren();
    for (const offer of offers) {
      ui.offerBox.appendChild(el('div', { class: 'thy-r6-note' }, [
        el('div', { class: 'thy-r6-note-top' }, [
          el('span', { class: 'thy-r6-note-at', text: offer.provider_label }),
          el('span', { class: 'thy-r6-note-kind', text: offer.model_label })
        ]),
        el('div', { class: 'thy-r6-kv-grid', style: { display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '3px 10px', fontSize: '12px', marginTop: '6px' } }, [
          el('b', { text: 'Estimated cost' }), el('span', { text: money(offer.estimated_cost_minor, offer.estimated_cost_currency) }),
          el('b', { text: 'Expected duration' }), el('span', { text: `${offer.expected_duration_seconds}s (asked ${offer.requested_duration_seconds}s)` }),
          el('b', { text: 'Resolution' }), el('span', { text: `${offer.resolution || '—'} · supports ${offer.supported_resolutions.join(', ')}` }),
          el('b', { text: 'Audio' }), el('span', { text: offer.audio_included ? 'included' : 'NOT included' }),
          el('b', { text: 'Rate card' }), el('span', { text: offer.rate_card_verified ? 'verified' : 'UNVERIFIED — spend blocked' }),
          el('b', { text: 'Credential' }), el('span', { text: offer.credential_present ? 'held' : 'ABSENT — spend blocked' })
        ]),
        offer.blocking.length
          ? el('div', { class: 'thy-r6-note-quote', text: offer.blocking.map(b => `${b.code}: ${b.detail}`).join(' · ') })
          : el('div', { class: 'thy-r6-note-quote', text: 'Ready to run.' })
      ]));
    }
    if (!offers.length) ui.offerBox.appendChild(el('div', { class: 'thy-r6-empty', text: 'No provider offers.' }));

    decide(request);
  }

  function decide(request) {
    const continuity = currentContinuity();
    const result = selectProvider(request, { consentedSubstitution: state.consentedSubstitution });
    state.chosen = result.ok ? result.offer : null;

    const blockers = [];
    if (!state.selectedAsset) blockers.push('No registered asset selected.');
    if (!continuity.ok) blockers.push(continuity.statement);
    if (!result.ok) blockers.push(...result.refusals.map(r => `${r.code}: ${r.detail}`));

    ui.continuityLine.textContent = state.selectedCharacterIds.size
      ? continuity.statement
      : 'No characters selected — the clip will carry no character continuity.';

    const ok = blockers.length === 0;
    ui.decision.className = `thy-r6-gate-verdict ${ok ? 'pass' : 'fail'}`;
    ui.decision.textContent = ok
      ? `Ready: ${state.chosen.statement}`
      : `Cannot generate yet — ${blockers.join(' | ')}`;
    ui.authorise.disabled = !ok;

    // A refused substitution is offered as an explicit choice, never applied.
    const substitutionOffer = result.refusals?.find(r => r.code === 'SUBSTITUTION_REQUIRES_CONSENT');
    const existing = document.getElementById('thyMRConsent');
    if (existing) existing.remove();
    // A provider that could do the work but is itself blocked is named as
    // information, not offered as a choice. "Impossible" and "unfunded" are
    // different answers and the Chairman is owed the right one.
    if (substitutionOffer && !result.alternates?.length && result.capability_alternates?.length) {
      const names = [...new Set(result.capability_alternates
        .filter(o => o.provider_code !== request.preferred_provider)
        .map(o => o.provider_label))];
      if (names.length) {
        const why = [...new Set(result.capability_alternates.flatMap(o => o.blocking.map(b => b.code)))].join(', ');
        ui.decision.after(el('div', { id: 'thyMRConsent', class: 'thy-r6-note-quote', style: { marginTop: '8px' } },
          [`${names.join(', ')} can perform ${request.operation}, but is blocked on ${why}. No substitute can be named until that clears.`]));
      }
    }

    if (substitutionOffer && result.alternates?.length) {
      const alt = result.alternates[0];
      ui.decision.after(el('div', { id: 'thyMRConsent', class: 'thy-r6-row', style: { marginTop: '8px' } }, [
        el('span', { class: 'thy-r6-sub', text: `${alt.provider_label} could run this instead.` }),
        el('button', {
          type: 'button', style: btn(),
          onclick: () => {
            state.consentedSubstitution = alt.provider_code;
            say(`Substitution to ${alt.provider_label} named by the Chairman. It is now allowed for this request only.`, 'warn');
            renderOffers();
          }
        }, [`Name ${alt.provider_label} as the substitute`])
      ]));
    }
  }

  // ---- spend authorisation -------------------------------------------------

  async function authoriseSpend() {
    const request = { ...state.request, source_asset_id: state.selectedAsset?.asset_id || null };
    const continuity = currentContinuity();
    const result = selectProvider(request, { consentedSubstitution: state.consentedSubstitution });
    if (!result.ok) { say('Refused: the offer changed since it was shown. Re-read the offers.', 'bad'); renderOffers(); return; }

    const offer = result.offer;
    const confirmed = window.confirm(
      `AUTHORISE SPEND\n\n` +
      `Provider: ${offer.provider_label}${result.substituted ? ' (substitute you named)' : ''}\n` +
      `Model: ${offer.model_label}\n` +
      `Operation: ${offer.operation}\n` +
      `Estimated cost: ${money(offer.estimated_cost_minor, offer.estimated_cost_currency)}\n` +
      `Duration: ${offer.expected_duration_seconds}s\n` +
      `Resolution: ${offer.resolution}\n` +
      `Audio: ${offer.audio_included ? 'included' : 'NOT included'}\n\n` +
      `Proceed?`
    );
    if (!confirmed) { say('Spend not authorised. Nothing was sent.', ''); return; }

    const row = toRenderJobRow({
      offer, request, continuity,
      productionId: null, sceneId: null
    });
    row.state = JOB_STATES.QUEUED;

    const token = custody.token();
    if (!token) { say('Not signed in — the job was composed but not lodged.', 'warn'); state.job = row; renderJob(); return; }

    try {
      const r = await fetch(`${custody.url}/rest/v1/studio_render_jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: custody.key, Authorization: `Bearer ${token}`, Prefer: 'return=representation' },
        body: JSON.stringify([row])
      });
      const text = await r.text();
      if (!r.ok) {
        say(`Backend refused the job: ${text.slice(0, 200)}`, 'bad');
        state.job = { ...row, _refused: text.slice(0, 200) };
      } else {
        state.job = (JSON.parse(text)[0]) || row;
        say('Job lodged into studio_render_jobs. No provider call is made until a worker with a credential picks it up.', 'good');
      }
    } catch (err) {
      say(`Job not lodged: ${err.message}`, 'bad');
      state.job = row;
    }
    renderJob();
  }

  function renderJob() {
    ui.jobBox.replaceChildren();
    if (!state.job) { ui.jobBox.appendChild(el('div', { class: 'thy-r6-empty', text: 'No job.' })); return; }
    const j = state.job;
    ui.jobBox.appendChild(el('div', { class: 'thy-r6-kv-grid', style: { display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 12px', fontSize: '13px' } }, [
      el('b', { text: 'State' }), el('span', { text: j.state }),
      el('b', { text: 'Provider' }), el('span', { text: `${j.provider_code} · ${j.model_code}` }),
      el('b', { text: 'Operation' }), el('span', { text: j.operation_type }),
      el('b', { text: 'Estimated cost' }), el('span', { text: money(j.estimated_cost) }),
      el('b', { text: 'Idempotency key' }), el('span', { text: j.idempotency_key }),
      el('b', { text: 'Render job id' }), el('span', { text: j.render_job_id || 'not assigned (not lodged)' })
    ]));
    if (j._refused) ui.jobBox.appendChild(el('div', { class: 'thy-r6-note-quote', text: `Backend refusal: ${j._refused}` }));
    ui.jobBox.appendChild(el('div', { class: 'thy-r6-sub', style: { marginTop: '8px' },
      text: 'No clip can arrive until a worker holding a provider credential executes this job. This dashboard composes, prices and lodges the job; it does not hold provider keys and must not.' }));
  }

  // ---- money-distance ------------------------------------------------------

  async function renderMoneyDistance() {
    const readings = {};
    const mark = (code, evidence) => { readings[code] = { state: GATE_STATES.SATISFIED, evidence_id: evidence }; };

    if (state.selectedAsset) mark('ASSET_REGISTERED', state.selectedAsset.asset_id);
    else if (state.assets.length) mark('ASSET_REGISTERED', state.assets[0].asset_id);

    const continuity = currentContinuity();
    if (state.selectedCharacterIds.size && continuity.ok) {
      mark('CONTINUITY_CLEARED', continuity.snapshot.characters.map(c => c.canonical_entity_id || c.character_id).join(','));
    }
    // The adapter layer exists in this build; that gate is genuinely closed.
    mark('PROVIDER_CATALOGUED', 'dashboard/r6/lib/media-router.js');

    for (const p of Object.values(PROVIDER_CATALOGUE)) {
      if (p.rate_card.verified_at) mark('RATE_CARD_VERIFIED', `${p.provider_code}@${p.rate_card.verified_at}`);
      if (p.credential_state === 'PRESENT') mark('CREDENTIAL_HELD', p.provider_code);
    }
    if (state.job?.render_job_id) mark('BUDGET_AUTHORISED', state.job.render_job_id);

    const attempts = await read('studio_render_attempts', 'select=attempt_id,provider_request_id&limit=1');
    if (attempts.ok && attempts.rows.length && attempts.rows[0].provider_request_id) {
      mark('JOB_ACCEPTED', attempts.rows[0].provider_request_id);
    }
    const clips = await read('thylora_visual_assets', 'select=asset_id&asset_type=eq.GENERATED_CLIP&limit=1');
    if (clips.ok && clips.rows.length) mark('RESULT_INGESTED', clips.rows[0].asset_id);

    const measured = measureStore({
      store_code: 'MEDIA_ROUTER', label: 'Chairman command to finished clip',
      gates: MEDIA_ROUTER_GATES, readings
    });

    ui.moneyLine.textContent = measured.statement;
    ui.moneyBox.replaceChildren(...measured.gates.map(g => el('div', { class: 'thy-r6-gate-line' }, [
      el('span', { class: `thy-r6-dot${g.closed ? ' on' : ''}` }),
      el('span', { style: { flex: '1 1 auto' }, text: g.label }),
      el('span', { class: 'thy-r6-sub', text: g.closed ? `evidenced · ${String(g.evidence_id).slice(0, 28)}` : `OPEN · ${g.evidence}` })
    ])));
    say(measured.statement, measured.distance === 0 ? 'good' : 'warn');
    return measured;
  }

  renderOffers();
  renderMoneyDistance().catch(() => {});

  return {
    node,
    refresh: () => { renderAssets(); renderCharacters(); renderOffers(); },
    loadRegistries,
    measure: renderMoneyDistance,
    get state() { return state; }
  };
}
