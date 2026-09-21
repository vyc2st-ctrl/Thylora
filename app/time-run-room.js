// THY-WORK-TIME-RUN-OPS-VERONICA-582
// Additive Time Run operations surface. Loaded as a module beside the existing
// time-run.js, which is unchanged. Renders from app/lib/time-run-ops.mjs so the
// room and the tests read the same rules.

import {
  CREW_ROLES, TEAM_SIZE_MIN, TEAM_SIZE_MAX, minimumReadyCrew,
  RECOVERY_STAGES, AWARD_CLASSES, CAPABILITIES,
} from './lib/time-run-ops.mjs';

const esc = (v = '') => String(v).replace(/[&<>'"]/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));

// ---------------------------------------------------------------------------
// QYRIS · the visible record stamp. Shown, never hidden.
// ---------------------------------------------------------------------------
const QYRIS = {
  head: 'THY-WORK-TIME-RUN-OPS-VERONICA-582',
  sequence: 582,
  run: 'THY-TIME-RUN-001',
  room: '/app/time-run.html',
  authority: 'Dashboard authority remains vyc2st-ctrl/thylora-executive-dashboard → thylora-public-world',
  backend: 'thylora-dash (jvsdxhrfhtlgaknhjxlz)',
  registries: [
    'thylora_time_run_registry',
    'thylora_time_run_host_rules',
    'thylora_time_run_events',
    'thylora_time_run_award_catalog',
  ],
  locks: [
    'LOCK-ER-VERONICA-HALL-001',
    'LOCK-ER-CLARA-BENNETT-001',
    'OBJ-LOCKET-001 · CLOSED',
  ],
  sealed: [
    'Kinship degree, Inés Morales ↔ Veronica Hall — UNKNOWN, not stored',
    'The locket — closed; no contents column exists',
    'Exact event years — open until sealed per run',
  ],
  held: [
    'Vyctor Ebeneezer ↔ Inés Morales — PREEXISTING_ACQUAINTANCE_FROM_PRIOR_VISITS. No first meeting.',
    'Death is real and is not undone.',
    'Destination-era capability governs functioning technology.',
    'Preserve life before competition.',
  ],
  state: 'SCHEMA REVIEWABLE · NOT APPLIED · backend host unreachable from build session',
};

function renderQyris(root) {
  root.innerHTML = `
    <div class="qyris-stamp">
      <div class="qyris-head">
        <p class="eyebrow">QYRIS · VISIBLE RECORD</p>
        <h3>${esc(QYRIS.head)}</h3>
        <p class="qyris-state">${esc(QYRIS.state)}</p>
      </div>
      <dl class="qyris-grid">
        <div><dt>Sequence</dt><dd>${esc(QYRIS.sequence)}</dd></div>
        <div><dt>Authoritative run</dt><dd>${esc(QYRIS.run)}</dd></div>
        <div><dt>App room</dt><dd>${esc(QYRIS.room)}</dd></div>
        <div><dt>Backend of record</dt><dd>${esc(QYRIS.backend)}</dd></div>
        <div class="wide"><dt>Deployment authority</dt><dd>${esc(QYRIS.authority)}</dd></div>
        <div class="wide"><dt>Registries read first</dt><dd>${QYRIS.registries.map((r) => `<code>${esc(r)}</code>`).join(' ')}</dd></div>
        <div class="wide"><dt>Locks carried</dt><dd>${QYRIS.locks.map((l) => `<code>${esc(l)}</code>`).join(' ')}</dd></div>
      </dl>
      <div class="qyris-cols">
        <div><p class="eyebrow">SEALED</p><ul>${QYRIS.sealed.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></div>
        <div><p class="eyebrow">HELD</p><ul>${QYRIS.held.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></div>
      </div>
    </div>`;
}

// ---------------------------------------------------------------------------
// Operations map
// ---------------------------------------------------------------------------
const OPS_MAP = [
  ['Era assignment', 'Era profile sealed: law, money, travel, technology ceiling, road and weather expectation. Exact years stay open until sealed for the run.'],
  ['Team formation', `Crew slots opened against ${CREW_ROLES.length} roles. A team is not READY until every required role is covered.`],
  ['Vehicle fit-out', 'Era-specific vehicles assigned per role: lead, passenger, freight, repair caravan, feed and water, kitchen, medical.'],
  ['Money conversion', 'Period money converted at a recorded rate. Two roles, never one: one converts, one witnesses.'],
  ['Clothing and provision', 'Period clothing fitted and weather-rated. Food, water, fodder, fuel loaded and ledgered.'],
  ['Capability check', 'Every item checked against the destination-era ceiling. Identity, memory, knowledge and experience carry. Later-era capability does not function.'],
  ['Host arrangement', 'Host communities and host homes recorded with beds, stable places and their own standing. A host may withdraw at any time.'],
  ['Travel', 'Legs and stops. Road condition and weather reported per leg. Safe speed only. Local advice outranks the map.'],
  ['Help', 'Every stop can create useful work. Consent first, materials paid, double verification after.'],
  ['Emergency', 'Preserve life before competition. Standing is suspended for the duration, never lost.'],
  ['Rest', 'Scheduled rest days for crew and for animals. Care records are part of completing a day.'],
  ['Recovery', 'If a death occurs, the run stops and the fourteen-stage protocol runs to its end before anything else resumes.'],
  ['Return and verify', 'Arrival recorded. Help, care, safety and conduct verified from the record, not from the finish order.'],
  ['Awards', 'Fourteen classes across help, build, vehicle, animal, crew, community, safety and conduct. None is speed weighted.'],
];

const HOST_SYSTEM = [
  ['Who offers', 'Host communities and host homes offer beds, stable places, a sick room and a table. The offer is theirs to make and theirs to end.'],
  ['What the guest owes', 'Payment in era money at local rate or better, before departure, without being asked twice.'],
  ['What the guest leaves', 'Something repaired, restocked or built. A team that lodges and leaves nothing useful has not completed the stop.'],
  ['Household labour', 'Cooking, washing, carrying, stable work and child care done for the team is work, and is paid as work.'],
  ['Closed doors', 'Rooms, stores, records and persons of the household are not entered or reported on without invitation.'],
  ['Withdrawal', 'If hosting ends, the team leaves the same day, pays in full, and files no complaint.'],
];

const HELP_SYSTEM = [
  ['Repair a bridge', 'Local lead decides the method. The team supplies hands and iron.'],
  ['Help a farm', 'Harvest, fencing, ditching, stock moving. The season decides the work.'],
  ['Transport supplies', 'The Run already has vehicles and animals on the road. This is its greatest ordinary usefulness.'],
  ['Repair a cart', 'The repair caravan already carries the tools.'],
  ['Flood or fire', 'Preserve life first. Competition standing suspends, it does not end.'],
  ['Deliver medicine', 'Era-available medicine only.'],
  ['Repair a roof', 'Timber, thatch, slate — whatever the place actually uses.'],
  ['Help an isolated family', 'Fuel, water, food store, repair. Quietly, and only if welcome.'],
  ['Assist a local workshop', 'Hands and materials, under the local craftsman’s direction.'],
];

function card(title, body) {
  return `<article><h3>${esc(title)}</h3><p>${esc(body)}</p></article>`;
}

function renderInto(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

function renderOps() {
  renderInto('opsMap', `<ol class="ops-map">${OPS_MAP.map(
    ([t, b]) => `<li><strong>${esc(t)}</strong><span>${esc(b)}</span></li>`).join('')}</ol>`);

  const byGroup = new Map();
  for (const r of CREW_ROLES) {
    if (!byGroup.has(r.group)) byGroup.set(r.group, []);
    byGroup.get(r.group).push(r);
  }
  renderInto('crewMap', `
    <p class="muted">Team band ${TEAM_SIZE_MIN}–${TEAM_SIZE_MAX}. Minimum crew to stand a team READY: <b>${minimumReadyCrew()}</b>.</p>
    <div class="role-groups">${[...byGroup.entries()].map(([g, roles]) => `
      <div class="role-group"><p class="eyebrow">${esc(g)}</p><ul>${roles.map((r) =>
        `<li><b>${esc(r.label)}</b> <span class="role-min">×${r.min}${r.ready ? '' : ' · optional'}</span></li>`).join('')}</ul></div>`).join('')}</div>`);

  renderInto('vehicleMap', `<div class="grid">${[
    ['Lead buggy', 'Pair-horse. The working vehicle of the 1700s lane.'],
    ['Passenger buggy', 'Light. Fast on good road, first to fail on bad.'],
    ['Freight wagon', 'Bulk supply, fodder, timber, materials for help orders.'],
    ['Repair caravan', 'Forge, wheel stock, axles, timber, leather. Repairs local carts, gates, tools and roofs as well as its own.'],
    ['Feed and water cart', 'Sets the real pace of the run.'],
    ['Kitchen cart', 'Feeds crew, and shares at the host table where welcome.'],
    ['Medical cart', 'Era-available care and a covered bed. Also serves as the recovery transit vehicle. Not award eligible.'],
  ].map(([t, b]) => card(t, b)).join('')}</div>`);

  renderInto('hostMap', `<div class="grid">${HOST_SYSTEM.map(([t, b]) => card(t, b)).join('')}</div>`);
  renderInto('helpMap', `<div class="grid">${HELP_SYSTEM.map(([t, b]) => card(t, b)).join('')}</div>`);

  renderInto('techMap', `<div class="cap-cols">
    <div><p class="eyebrow">CARRIES BACKWARD</p><ul>${Object.entries(CAPABILITIES)
      .filter(([, c]) => c.carriesBackward)
      .map(([k, c]) => `<li><b>${esc(k)}</b> — ${esc(c.note)}</li>`).join('')}</ul></div>
    <div><p class="eyebrow">DOES NOT FUNCTION</p><ul>${Object.entries(CAPABILITIES)
      .filter(([, c]) => !c.carriesBackward)
      .map(([k, c]) => `<li><b>${esc(k)}</b> — ${esc(c.note)}</li>`).join('')}</ul></div>
  </div>`);

  renderInto('recoveryMap', `
    <p class="muted">Death is real whenever and wherever it occurs. A traveller who dies outside their origin era remains dead. The body may be returned. The death is not undone.</p>
    <ol class="ops-map recovery-map">${RECOVERY_STAGES.map((s) =>
      `<li><strong>${esc(s.code)} · ${esc(s.label)}</strong><span>${s.owner ? `Owner: ${esc(s.owner)}. ` : ''}${s.blocking ? 'Blocking gate.' : 'Not blocking.'}</span></li>`).join('')}</ol>
    <p class="muted">Disposition is decided at stage D6 and may be return to the origin era, interment in the era of death, or a hold by local law. Local interment is a complete outcome, not a failure.</p>`);

  const awardGroups = new Map();
  for (const a of AWARD_CLASSES) {
    if (!awardGroups.has(a.group)) awardGroups.set(a.group, []);
    awardGroups.get(a.group).push(a);
  }
  renderInto('awardMap', `
    <p class="muted">${AWARD_CLASSES.length} classes. None is speed weighted. Viewer votes and the votes of the people of the era are counted separately and are never summed.</p>
    <div class="role-groups">${[...awardGroups.entries()].map(([g, list]) => `
      <div class="role-group"><p class="eyebrow">${esc(g)}</p><ul>${list.map((a) =>
        `<li><b>${esc(a.label)}</b> <span class="role-min">${esc(a.decidedBy.toLowerCase().replace(/_/g, ' '))}</span></li>`).join('')}</ul></div>`).join('')}</div>`);
}

const stamp = document.getElementById('qyrisStamp');
if (stamp) renderQyris(stamp);
renderOps();
