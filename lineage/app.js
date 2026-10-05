// ROOT HOUSE · surface controller · WR-LINEAGE-001
// Rules live in lib/. This file only puts them on screen.
import { LINES, seatsForLine, relationName, gradeClaim, isProtectedLiving, migrationTests, openTasks } from './lib/lineage.js';
import { RESEARCHERS, WORLD_DISCLOSURE, silhouette } from './lib/researchers.js';
import { SOURCES, ACCESS_LABEL, sourcesFor } from './lib/sources.js';
import { hypothesisBoard, ORIGIN_HYPOTHESES } from './lib/gate.js';
import { dealNight, elderAnswer, MONSTER_NIGHT, SNACKS } from './lib/teatable.js';

const $ = id => document.getElementById(id);
const esc = (v = '') => String(v).replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
const store = {
  get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode: page still works */ } }
};
const PEOPLE_KEY = 'roothouse_people_v1', STORIES_KEY = 'roothouse_stories_v1';

function showView(id) {
  const target = $(id) ? id : 'house';
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active-view', v.id === target));
  document.querySelectorAll('[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === target));
  history.replaceState(null, '', `#${target}`);
  if (target === 'worker') loadWorker();
}
document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => showView(b.dataset.view)));

/* the house */
const FLOORS = [
  { cls: 'roof', title: 'Roof · Canada Desk', detail: 'Border crossings, Ontario and Nova Scotia', crew: ['ines'] },
  { title: "4 · Mother's mother line", detail: 'mtDNA line · church and cemetery desk', crew: ['june'] },
  { title: "3 · Mother's father line", detail: 'Newspaper desk · obituaries and the Black press', crew: ['theo'] },
  { title: "2 · Father's mother line", detail: 'Land and law desk · deeds, probate, courts', crew: ['amara'] },
  { title: "1 · Father's father line", detail: 'Y-DNA line · military desk', crew: ['marcus'] },
  { title: 'Ground · Parlor', detail: 'Tea table · oral history comes in here', crew: ['odessa', 'pip', 'dez'] },
  { cls: 'base', title: 'Basement · Vault and Lab', detail: `${SOURCES.length} source collections · DNA`, crew: ['rosa', 'kofi'] }
];
function renderHouse() {
  $('building').innerHTML = FLOORS.map(f => `<div class="floor ${f.cls ?? ''}"><div><h3>${esc(f.title)}</h3><p>${esc(f.detail)}</p></div>
    <div class="crew">${f.crew.map(id => { const r = RESEARCHERS.find(x => x.id === id);
      return `<div class="person p-${r.id}" title="${esc(r.role)}">${silhouette(r.look, 130)}<b>${esc(r.name.split(' ')[0] === 'Mother' ? 'Mother Odessa' : r.name.replace(/“.*”\s/, ''))}</b><span>${esc(r.desk.replace(/_/g, ' ').toLowerCase())}</span></div>`; }).join('')}</div></div>`).join('');
  $('worldNote').textContent = WORLD_DISCLOSURE;
}

/* four lines */
function people() { return store.get(PEOPLE_KEY, {}); }
function renderLines() {
  const ppl = people();
  const seatRow = n => {
    const p = ppl[n];
    const name = p && (p.given || p.surname) ? (isProtectedLiving(p) ? `${p.given ?? ''} (living · private)` : `${p.given ?? ''} ${p.surname ?? ''}`) : '—';
    const grade = p ? gradeClaim({ family_told: p.teller ? [p.teller] : [], evidence: p.evidence ?? [] }) : 'UNKNOWN';
    return `<div class="seat"><span><b>${n}</b> · ${esc(relationName(n))}<br>${esc(name)}</span><span class="grade g-${grade}">${grade.replace('_', ' ')}</span></div>`;
  };
  $('lineGrid').innerHTML = `<div class="line-card"><h3>Parents</h3>${[2, 3].map(seatRow).join('')}</div>` +
    Object.values(LINES).map(l => `<div class="line-card"><h3>${esc(l.label)}</h3><p class="muted small">${esc(l.dna)}</p>${seatsForLine(l.code, 3).map(seatRow).join('')}</div>`).join('');
  const tasks = openTasks(ppl, RESEARCHERS, 3);
  $('pSeat').innerHTML = [2, 3, ...Object.values(LINES).flatMap(l => seatsForLine(l.code, 3))]
    .map(n => `<option value="${n}">${n} · ${esc(relationName(n))}</option>`).join('');
  $('lineGrid').insertAdjacentHTML('beforeend', `<div class="line-card"><h3>Open tasks · ${tasks.length}</h3>${tasks.slice(0, 8).map(t => `<div class="seat"><span>${esc(t.ask)}</span><span class="grade">${esc(t.desk.replace(/_/g, ' '))}</span></div>`).join('')}</div>`);
}
$('personForm').addEventListener('submit', e => {
  e.preventDefault();
  const seat = Number($('pSeat').value);
  const num = v => (v && /^\d{3,4}$/.test(v.trim()) ? Number(v) : undefined);
  const ppl = people();
  ppl[seat] = { ...ppl[seat], given: $('pGiven').value.trim() || undefined, surname: $('pSurname').value.trim() || undefined,
    maiden_name: $('pMaiden').value.trim() || undefined, birth_year: num($('pBirth').value), birth_place: $('pBirthPlace').value.trim() || undefined,
    death_year: num($('pDeath').value), teller: $('pTeller').value.trim() || undefined };
  store.set(PEOPLE_KEY, ppl);
  e.target.reset();
  renderLines();
});

/* parlor */
function pour() {
  const players = $('players').value.split(',').map(s => s.trim()).filter(Boolean);
  const today = new Date().toISOString().slice(0, 10);
  const night = Math.floor(Date.now() / 86400000);
  $('nightCards').innerHTML = dealNight(players, today, night).map(c =>
    `<article><p class="cardline">${esc(c.deck)} CARD</p><h3>${esc(c.player)}</h3><p class="muted small">poured by ${esc(c.pouredBy)}</p><p>${esc(c.card)}</p></article>`).join('');
}
$('playersForm').addEventListener('submit', e => { e.preventDefault(); pour(); });
function renderStories() {
  const stories = store.get(STORIES_KEY, []);
  $('storyList').innerHTML = stories.length ? stories.map(s => `<article><span class="grade g-FAMILY_TOLD">FAMILY TOLD</span><p>“${esc(s.text)}”</p><p class="muted small">${esc(s.teller)} · asked by ${esc(s.asked_by)} · ${esc(s.recorded)}</p></article>`).join('')
    : '<p class="muted">No Elder answers yet. The first one becomes the House’s first credited story.</p>';
}
$('elderForm').addEventListener('submit', e => {
  e.preventDefault();
  try {
    const s = elderAnswer({ asker: $('eAsker').value.trim(), teller: $('eTeller').value.trim(), question: $('eQuestion').value.trim(), answer: $('eAnswer').value.trim() });
    store.set(STORIES_KEY, [s, ...store.get(STORIES_KEY, [])]);
    e.target.reset(); renderStories();
  } catch (err) { alert(err.message); }
});
$('monsterList').innerHTML = MONSTER_NIGHT.map(m => `<article><h3>${esc(m.title)} <span class="muted">(${m.year})</span></h3><p class="cardline">${esc(m.rating)}</p><p>${esc(m.note)}</p></article>`).join('');
$('snackList').textContent = `Snacks: ${SNACKS.join(' · ')}`;

/* canada */
$('hypBoard').innerHTML = hypothesisBoard({ familySays: { never: ['ENSLAVED'] } }).map(h => `<article><p class="cardline">${esc(h.hypothesis.replace(/_/g, ' '))}</p><h3>${Math.round(h.p * 100)}%</h3><p>${esc(h.label)}</p><p class="muted small">${h.gate.pass ? 'PROVEN' : 'OPEN — needs records'}</p></article>`).join('');
$('canadaTests').innerHTML = migrationTests('Canada').map((t, i) => `<article><p class="cardline">TEST ${i + 1}</p><h3>${esc(t.test)}</h3><p>${esc(t.look)}</p></article>`).join('');

/* vault */
let desk = null;
const DESKS = [...new Set(SOURCES.map(s => s.desk))];
$('deskChips').innerHTML = ['ALL', ...DESKS].map(d => `<button type="button" class="chip-btn ${d === 'ALL' ? 'active' : ''}" data-desk="${d}">${d.replace(/_/g, ' ').toLowerCase()}</button>`).join('');
$('deskChips').addEventListener('click', e => {
  const b = e.target.closest('[data-desk]'); if (!b) return;
  desk = b.dataset.desk === 'ALL' ? null : b.dataset.desk;
  $('deskChips').querySelectorAll('button').forEach(x => x.classList.toggle('active', x === b));
  renderVault();
});
function renderVault() {
  const list = sourcesFor({ desk, query: $('vaultQ').value.trim() || undefined });
  $('vaultCount').textContent = `${SOURCES.length} collections in the catalog — each holds thousands to billions of records. Showing ${list.length}.`;
  $('vaultList').innerHTML = list.map(s => `<div class="source"><b><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a></b>
    <div class="meta">${esc(s.holder)} · ${esc(s.region)} · ${esc(s.era)} · ${esc(ACCESS_LABEL[s.access])} · ${esc(s.desk.replace(/_/g, ' ').toLowerCase())} desk</div><p class="small">${esc(s.why)}</p></div>`).join('');
}
$('vaultForm').addEventListener('submit', e => { e.preventDefault(); renderVault(); });

/* worker */
async function loadWorker() {
  try {
    const res = await fetch('./leads/latest.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`report not published (${res.status})`);
    const r = await res.json();
    $('workerReport').innerHTML = `<article><p class="cardline">LAST RUN</p><h3>${esc(r.run_at.slice(0, 16).replace('T', ' '))} UTC</h3><p>${r.named_people} named people · ${r.leads.length} leads · ${r.tasks.length} open tasks</p></article>` +
      (r.leads.length ? r.leads.slice(0, 24).map(l => `<article><span class="grade g-LEAD">LEAD</span><h3><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.title ?? 'Untitled')}</a></h3><p class="muted small">${esc(l.relation)} · ${esc(l.query)} · ${esc(l.date ?? '')}</p></article>`).join('')
        : '<article><h3>Waiting on names</h3><p>The worker searches named people. Add the first names in Four Lines, or in lineage/family.json, and the next run starts searching.</p></article>');
  } catch (err) {
    $('workerReport').innerHTML = `<article><h3>No report yet</h3><p class="muted">${esc(err.message)}</p></article>`;
  }
}

/* credits */
$('creditList').innerHTML = RESEARCHERS.map(r => `<article class="person p-${r.id}" style="max-width:none;justify-items:start;text-align:left">${silhouette(r.look, 80)}<h3>${esc(r.name)}</h3><p class="small">${esc(r.role)}</p><p class="muted small">${esc(r.floor)} · world character</p></article>`).join('') +
  `<article><h3>Record keepers</h3><p class="small">Every accepted find also credits the archive that kept the record — National Archives, Library and Archives Canada, Shelby County Register of Deeds, Tennessee State Library and Archives, churches, funeral homes and the families who held on to the paper.</p></article>`;

renderHouse(); renderLines(); renderStories(); renderVault(); pour();
showView(location.hash.slice(1) || 'house');
