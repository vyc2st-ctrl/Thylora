// CONVEYOR · board surface
// Workroom: WR-CONVEYOR-001
//
// Read-only. This is not a dashboard: it has no sign-in, no command, no write
// path and no backend mutation. Dashboard authority stays where
// DASHBOARD_AUTHORITY.md puts it.
//
// It imports the SAME modules the tests verify, so what the board shows and what
// the gate decides cannot drift apart.

import { project, laneSummary, scheduleAllLanes, moneyNext, chairmanGates, LANES } from './lib/lanes.js';

const esc = (v = '') => String(v).replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
const $ = id => document.getElementById(id);

const FIELDS = [
  ['source_parent', 'Source / parent'], ['owner_department', 'Owner department'],
  ['responsible_person', 'Responsible person'], ['stage', 'Stage'],
  ['blocker', 'Blocker'], ['next_action', 'Next action'],
  ['actions_remaining', 'Actions remaining'], ['rights_state', 'Rights'],
  ['provenance_state', 'Provenance'], ['serial_state', 'Serial'], ['qr_state', 'QR'],
  ['cost_state', 'Cost'], ['price_state', 'Price'], ['storefront_state', 'Storefront'],
  ['money_distance', 'Money distance'], ['last_advanced_at', 'Last advanced']
];

function itemCard(p) {
  const tone = p.executable_now ? 'moving' : 'held';
  return `<article class="item ${tone}">
    <header>
      <b>${esc(p.canonical_id)}</b>
      <span class="stage">${esc(p.stage)}</span>
      <span class="md">money distance ${esc(p.money_distance)}</span>
    </header>
    <h4>${esc(p.title)}</h4>
    <p class="next"><span class="who ${esc(p.next_action_authority)}">${esc(p.next_action_authority)}</span> ${esc(p.next_action)}</p>
    <dl>${FIELDS.map(([k, label]) =>
      `<div><dt>${esc(label)}</dt><dd>${esc(p[k] ?? '—')}</dd></div>`).join('')}</dl>
  </article>`;
}

function render(registry) {
  const items = registry.items;
  const summary = laneSummary(items);
  const schedule = scheduleAllLanes(items);

  $('meta').textContent = `${registry.registry_id} · ${items.length} items · ${summary.length} lanes · captured ${registry.captured_at}`;

  $('lanes').innerHTML = summary.map(l => `
    <article class="lane">
      <header><b>${esc(l.label)}</b><span>${esc(l.code)}</span></header>
      <div class="counts">
        <span><b>${l.items}</b> items</span>
        <span class="ok"><b>${l.executable}</b> moving</span>
        <span class="held"><b>${l.chairman_gated}</b> held</span>
        <span><b>${l.nearest_money ?? '—'}</b> nearest money</span>
      </div>
      <div class="items">${items.filter(i => i.lane === l.lane).map(i => itemCard(project(i))).join('')}</div>
    </article>`).join('');

  $('moving').innerHTML = schedule.work.length
    ? schedule.work.map(w => `<li><b>${esc(w.canonical_id)}</b> · ${esc(LANES[w.lane].label)} · ${esc(w.next_action)}</li>`).join('')
    : '<li>No lane has executable work. Every item is on a Chairman gate.</li>';

  $('idle').innerHTML = schedule.idle.length
    ? schedule.idle.map(l => `<li><b>${esc(LANES[l.lane].label)}</b> · ${esc(l.reason)}${l.items ? ' · ' + esc(l.items.join(', ')) : ''}</li>`).join('')
    : '<li>No idle lane.</li>';

  $('money').innerHTML = moneyNext(items).map(m =>
    `<li><b>${esc(m.canonical_id)}</b> ${esc(m.title)} — distance ${esc(m.money_distance)} (${esc(m.money_chairman_gates)} Chairman)</li>`).join('');

  const gates = chairmanGates(items);
  $('gates').innerHTML = gates.length
    ? gates.map(g => `<li><b>${esc(g.canonical_id)}</b> · ${esc(g.code)} — ${esc(g.detail)}</li>`).join('')
    : '<li>No Chairman gate is currently blocking any item.</li>';
  $('gateCount').textContent = gates.length;
}

fetch('./registry/conveyor-registry.json')
  .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
  .then(render)
  .catch(err => { $('meta').textContent = `The conveyor registry could not be read: ${err.message}`; });
