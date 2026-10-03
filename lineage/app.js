// THE ROOT HOUSE · surface
// Workroom: WR-ROOTHOUSE-001
//
// The tree is saved on this device until db/lineage is applied to thylora-dash;
// "Download the tree" is the backup. Nothing here is sent anywhere.

import { LINES, CONFIDENCE, relationOf, lineOf, planFor, coverage, creditFinding, validatePerson } from './lib/lineage.js';
import { SOURCES, SOURCE_BY_CODE } from './lib/sources.js';
import { RESEARCHERS, DESKS, deskTeamFor } from './lib/researchers.js';
import { silhouetteSVG } from './silhouettes.js';

const STORE_KEY = 'thylora_root_house_v1';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function load() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) ?? { people: [], findings: [] }; }
  catch { return { people: [], findings: [] }; }
}
let state = load();
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); setChip('SAVED ON THIS DEVICE', 'ok'); }
  catch { setChip('NOT SAVED · DOWNLOAD A BACKUP', 'bad'); }
}
function setChip(text, cls) { const c = document.getElementById('saveChip'); c.textContent = text; c.className = `chip ${cls}`; }

// ── Views ──────────────────────────────────────────────────────────────────
function showView(target) {
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active-view', v.id === target));
  document.querySelectorAll('[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === target));
  if (target === 'plans') renderPlans();
  if (target === 'canada') renderCanada();
}
document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => showView(b.dataset.view)));

// ── The building ───────────────────────────────────────────────────────────
const FLOORS = [
  [8, 'DNA Lab'], [7, 'Pre-1870 Bridge'], [6, 'Canada Desk'], [5, "Mother's Mother"],
  [4, "Mother's Father"], [3, "Father's Mother"], [2, "Father's Father"], [1, 'Lobby · Memphis Desk · Elder Interviews']
];
function renderTower() {
  document.getElementById('tower').innerHTML = FLOORS.map(([n, label]) => {
    const staff = RESEARCHERS.filter(r => r.floor === n);
    return `<div class="floor"><div class="floor-no">${n}</div><div class="floor-body"><strong>${esc(label)}</strong>
      <div class="staff">${staff.map(r => `<figure class="person">${silhouetteSVG(r)}<figcaption><b>${esc(r.name)}</b><span>${esc(r.focus)}</span></figcaption></figure>`).join('')}</div></div></div>`;
  }).join('') + '<p class="muted small">World staff (simulated). Real contributors are credited on the Credit Wall.</p>';
}

// ── Four lines ─────────────────────────────────────────────────────────────
// Slots per line through great-grandparents: grandparent, then their father and mother.
const SLOTS = { FF: [4, 8, 9], FM: [5, 10, 11], MF: [6, 12, 13], MM: [7, 14, 15] };
const person = slot => state.people.find(p => p.slot === slot) ?? { slot };

function personFields(slot) {
  const p = person(slot);
  return `<fieldset class="pslot" data-slot="${slot}"><legend>${esc(relationOf(slot))} <small>#${slot}</small></legend>
    <label>Name or nickname<input data-k="name" value="${esc(p.name)}"></label>
    <div class="two"><label>Born (year)<input data-k="born" inputmode="numeric" value="${esc(p.born)}"></label>
    <label>Died (year)<input data-k="died" inputmode="numeric" value="${esc(p.died)}"></label></div>
    <label>Places<input data-k="place" placeholder="Memphis, TN · Chatham, Ontario" value="${esc(p.place)}"></label>
    <label>What the family says<textarea data-k="clue" rows="2" placeholder="Came out of Canada · worked the railroad · sang at …">${esc(p.clue)}</textarea></label>
    <label>How sure<select data-k="confidence">${CONFIDENCE.map(c => `<option ${p.confidence === c ? 'selected' : ''}>${c}</option>`).join('')}</select></label>
    <p class="status" data-status></p></fieldset>`;
}
function renderLines() {
  const top = `<div class="line-card"><h3>Parents</h3>${personFields(2)}${personFields(3)}</div>`;
  document.getElementById('lineForms').innerHTML = top + LINES.map(l =>
    `<div class="line-card line-${l.code}"><h3>${esc(l.label)}</h3><p class="muted small">${esc(l.dnaNote)}</p>${SLOTS[l.code].map(personFields).join('')}</div>`).join('');
  renderCoverage();
}
function renderCoverage() {
  const { perLine } = coverage(state.people.filter(p => p.name), 3);
  document.getElementById('coverage').innerHTML = LINES.map(l =>
    `<div class="cov"><span>${esc(l.label)}</span><b>${perLine[l.code].known} / ${perLine[l.code].total}</b></div>`).join('');
}
document.getElementById('lineForms').addEventListener('input', e => {
  const fs = e.target.closest('.pslot'); if (!fs) return;
  const slot = Number(fs.dataset.slot);
  const p = { ...person(slot) };
  const k = e.target.dataset.k;
  let v = e.target.value.trim();
  if (k === 'born' || k === 'died') v = v ? Number(v) : undefined;
  p[k] = v || undefined;
  const check = validatePerson({ ...p, evidence: state.findings.filter(f => f.slot === slot) });
  fs.querySelector('[data-status]').textContent = p.name || p.clue ? check.problems.join(' ') : '';
  state.people = [...state.people.filter(x => x.slot !== slot), p].filter(x => x.name || x.clue || x.place);
  save(); renderCoverage();
});

document.getElementById('exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ ...state, exported_at: new Date().toISOString() }, null, 2)], { type: 'application/json' });
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'root-house-tree.json' });
  a.click(); URL.revokeObjectURL(a.href);
});
document.getElementById('importInput').addEventListener('change', async e => {
  const file = e.target.files[0]; if (!file) return;
  try { const data = JSON.parse(await file.text()); state = { people: data.people ?? [], findings: data.findings ?? [] }; save(); renderAll(); }
  catch { setChip('THAT FILE IS NOT A ROOT HOUSE TREE', 'bad'); }
});

// ── Plans ──────────────────────────────────────────────────────────────────
function renderPlans() {
  const slots = [2, 3, ...Object.values(SLOTS).flat()];
  document.getElementById('planList').innerHTML = slots.map(slot => {
    const plan = planFor(person(slot));
    const team = deskTeamFor(plan);
    return `<details class="card plan" ${slot === 15 ? 'open' : ''}><summary><b>${esc(plan.relation)}</b> ${person(slot).name ? `· ${esc(person(slot).name)}` : '<span class="tag">OPEN SLOT</span>'}
      ${plan.flags.map(f => `<span class="tag">${f.replaceAll('_', ' ')}</span>`).join('')}</summary>
      <p class="muted small">Desks on it: ${team.map(r => `${esc(r.name)} (${esc(DESKS[r.desk])})`).join(' · ')}</p>
      ${plan.dnaNote ? `<p class="small"><b>DNA route:</b> ${esc(plan.dnaNote)}</p>` : ''}
      <ol class="steps">${plan.steps.map(s => `<li><b>${esc(s.name)}</b> <span class="tag">${s.access}</span><br><span class="muted small">${esc(s.holder)} — ${esc(s.why)}</span></li>`).join('')}</ol></details>`;
  }).join('');
}

// ── The Canada Question ────────────────────────────────────────────────────
function renderCanada() {
  const plan = planFor({ ...person(15), slot: person(15).slot ?? 15, clue: `${person(15).clue ?? ''} came out of Canada` });
  const canadaSteps = plan.steps.filter(s => ['US_CENSUS_1900_1940', 'US_CENSUS_1880', 'US_CANADA_BORDER', 'LAC_CENSUS', 'ONTARIO_VITALS', 'NS_ARCHIVES_BLACK', 'BOOK_OF_NEGROES', 'BUXTON_ELGIN', 'CHATHAM_KENT_BHS', 'CANADA_BLACK_PRESS', 'TSLA_VITALS', 'SHELBY_REGISTER'].includes(s.source));
  document.getElementById('canadaBrief').innerHTML = `
  <div class="card"><h3>The claim</h3><p>Grandmother → mother → you: your great-grandmother "came out of Canada" and did not start in Memphis. Slot it as an <b>ORAL</b> fact until a record confirms it — that is the honest grade, not a doubt about your grandmother.</p></div>
  <div class="card"><h3>What history makes likely</h3>
  <ul>
    <li><b>Underground Railroad descendants.</b> Tens of thousands of freedom seekers reached Canada West (Ontario) before 1865 — Chatham, Buxton, Windsor, Amherstburg, St. Catharines, Toronto. After the Civil War a large share of them went back to the US to find family and land. A daughter or granddaughter born in Ontario and later living in Memphis fits that pattern exactly.</li>
    <li><b>African Nova Scotians.</b> Black Loyalists (1783, the Book of Negroes) and Black Refugees of the War of 1812 built communities in Nova Scotia. Some families later moved to the US.</li>
    <li><b>Québec.</b> Less common for a Memphis family, but Montreal had a Black community tied to the railways (sleeping-car porters), and the church registers there are excellent.</li>
  </ul></div>
  <div class="card"><h3>Counterpoints — kept on the table</h3>
  <ul>
    <li>"Canada" in family memory sometimes meant the <b>North</b> generally, or Detroit, across the river from Windsor.</li>
    <li>The story can slide a generation: the Canadian birth may belong to <b>her</b> mother or father.</li>
    <li>It can also point to a non-Black Canadian line (French-Canadian, Indigenous, Scottish). Only records and DNA will say.</li>
  </ul></div>
  <div class="card"><h3>The test that settles it fastest</h3>
  <p>Find her in the US census 1900–1940. Each one asks where she was born <b>and</b> where her father and mother were born; 1900–1930 also asks the year she came to the US. If it says "Canada" (or "Canada Eng"), you have her. Then the Canadian census of 1881–1921 and Ontario or Nova Scotia births give you her parents. Her mtDNA travels to you unbroken if she sits on your mother's-mother line.</p></div>
  <div class="card"><h3>Pull list for the Canada desk</h3><ol class="steps">${canadaSteps.map(s => `<li><b>${esc(s.name)}</b> <span class="tag">${s.access}</span><br><span class="muted small">${esc(s.why)}</span></li>`).join('')}</ol></div>`;
}

// ── Sources ────────────────────────────────────────────────────────────────
let sourceFilter = 'ALL';
function renderSources() {
  const kinds = ['ALL', ...new Set(SOURCES.map(s => s.kind))];
  document.getElementById('sourceFilters').innerHTML = kinds.map(k => `<button class="chip-btn ${k === sourceFilter ? 'active' : ''}" data-kind="${k}" type="button">${k}</button>`).join('');
  document.getElementById('sourceGrid').innerHTML = SOURCES.filter(s => sourceFilter === 'ALL' || s.kind === sourceFilter).map(s =>
    `<div class="card src"><b>${esc(s.name)}</b><span class="muted small">${esc(s.holder)} · ${s.era[0] || '—'}–${s.era[1]} · ${s.places.join(', ')}</span><p class="small">${esc(s.yields)}</p><span class="tag">${s.access}</span></div>`).join('');
}
document.getElementById('sourceFilters').addEventListener('click', e => {
  const k = e.target.dataset.kind; if (!k) return; sourceFilter = k; renderSources();
});

// ── Credit Wall ────────────────────────────────────────────────────────────
function renderCredits() {
  const slots = [2, 3, ...Object.values(SLOTS).flat()];
  document.getElementById('findingSlot').innerHTML = slots.map(s => `<option value="${s}">${esc(relationOf(s))}${person(s).name ? ` · ${esc(person(s).name)}` : ''}</option>`).join('');
  document.getElementById('findingSource').innerHTML = SOURCES.map(s => `<option value="${s.code}">${esc(s.name)}</option>`).join('');
  document.getElementById('creditWall').innerHTML = state.findings.length
    ? state.findings.slice().reverse().map(f => `<div class="card credit"><b>${esc(f.relation)}</b><p>${esc(f.fact)}</p><p class="muted small">${esc(SOURCE_BY_CODE.get(f.source)?.name)}</p><div>${f.credits.map(c => `<span class="tag">${esc(c.role.replace('_', ' '))} · ${esc(c.who)}</span>`).join(' ')}</div></div>`).join('')
    : '<p class="muted">Nothing on the wall yet. The first name found goes here with the name of whoever found it.</p>';
}
document.getElementById('findingForm').addEventListener('submit', e => {
  e.preventDefault();
  const f = new FormData(e.target);
  const credits = [{ who: f.get('foundBy').trim(), role: 'FOUND' }];
  if (f.get('rememberedBy').trim()) credits.push({ who: f.get('rememberedBy').trim(), role: 'REMEMBERED' });
  const result = creditFinding({ slot: Number(f.get('slot')), fact: f.get('fact').trim(), source: f.get('source'), credits });
  const status = document.getElementById('findingStatus');
  if (!result.ok) { status.textContent = result.problems.join(' '); return; }
  state.findings.push({ ...result.finding, at: new Date().toISOString() });
  save(); e.target.reset(); status.textContent = 'On the wall.'; renderCredits();
});

function renderAll() { renderTower(); renderLines(); renderSources(); renderCredits(); }
renderAll();
