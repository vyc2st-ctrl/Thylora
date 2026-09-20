// THY-WORK-MATH-FAMOUS-THOUGHT-559 · MATH + Famous Thought dashboard surface
//
// Mounts INTO the existing dashboard. It creates no new top-level app, no new
// navigation entry and no new page. It looks for an existing MATH surface first;
// if the dashboard has none, it mounts in the most logical existing surface
// (Ideas & Creation) and says so, rather than inventing a section.
//
// Everything it renders comes from the backend registries:
//   thylora_math_equation_registry
//   thylora_famous_thought_registry
//   thylora_famous_thought_gate_evaluations
// When a registry is not readable, the field renders UNKNOWN_DEFINITION. It
// never fills a quotation, a source, a speaker or a variable meaning from
// anywhere else. A quote poster is not a failure mode of this component: without
// the question, evidence, connection and transfer parts, the card renders as
// BLOCKED and the quote line stays empty.
(() => {
  const MARK = 'THY-WORK-MATH-FAMOUS-THOUGHT-559';
  const URL = 'https://jvsdxhrfhtlgaknhjxlz.supabase.co';
  const KEY = 'sb_publishable_ta33XJ9rtS8VljoUYw-GuA_Pi4OycpQ';
  const UNKNOWN = 'UNKNOWN_DEFINITION';
  const READING_LEVELS = ['PLAIN', 'EVERYDAY', 'TECHNICAL'];
  const THOUGHT_CODES = ['THOUGHT-DOUGLASS-001', 'THOUGHT-CARVER-001',
                         'THOUGHT-WASHINGTON-001', 'THOUGHT-FORD-001'];

  if (document.getElementById('thyMathThought')) return;

  const esc = v => String(v ?? '').replace(/[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const dashboardToken = () => localStorage.getItem('thy_access_token') || '';
  const appToken = () => {
    try { return JSON.parse(sessionStorage.getItem('thylora_app_auth_session') || 'null')?.access_token || ''; }
    catch { return ''; }
  };
  const token = () => dashboardToken() || appToken();

  async function table(name, query) {
    const t = token();
    if (!t) throw new Error('NO_SESSION');
    const r = await fetch(`${URL}/rest/v1/${name}?${query}`, {
      headers: { apikey: KEY, Authorization: 'Bearer ' + t }
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }

  // ---- display helpers: structure only, never meaning ----------------------
  const splitEquation = whole => {
    if (typeof whole !== 'string' || !whole.includes('=')) {
      return { whole: whole || UNKNOWN, left: UNKNOWN, equals: '=', right: UNKNOWN };
    }
    const at = whole.indexOf('=');
    return { whole: whole.trim(), left: whole.slice(0, at).trim(), equals: '=', right: whole.slice(at + 1).trim() };
  };
  const variableSlots = right => {
    const found = [];
    for (const letter of String(right || '').replace(/^f\s*\(/i, '(').match(/[A-Za-z](?:_[A-Za-z0-9]+)?/g) || []) {
      if (!found.includes(letter)) found.push(letter);
    }
    return found;
  };
  const equationOfTheDay = rows => {
    if (!rows.length) return null;
    const ordered = [...rows].sort((a, b) => String(a.equation_code).localeCompare(String(b.equation_code)));
    const days = Math.floor(Date.now() / 86400000);
    return ordered[((days % ordered.length) + ordered.length) % ordered.length];
  };
  const unknownSpan = () => `<span class="thy-unknown">${UNKNOWN}</span>`;
  const orUnknown = v => (v && v !== UNKNOWN ? esc(v) : unknownSpan());

  // ---- renderers -----------------------------------------------------------
  function equationCard(row, heading) {
    const parts = splitEquation(row.whole_equation);
    const supplied = new Map((row.variables || []).map(v => [v.variable_key || v.key, v]));
    const slots = variableSlots(parts.right);
    const rows = slots.map(key => {
      const v = supplied.get(key) || {};
      return `<tr><td class="thy-var-key">${esc(key)}</td>
                  <td>${orUnknown(v.variable_name || v.name)}</td>
                  <td>${orUnknown(v.definition)}</td></tr>`;
    }).join('');

    return `<div class="thy-math-card">
      <h4>${esc(heading)}</h4>
      <div class="thy-eq-line">
        <span class="side">${esc(parts.left)}</span>
        <span class="eq">${esc(parts.equals)}</span>
        <span class="side">${esc(parts.right)}</span>
      </div>
      <div class="thy-eq-whole">WHOLE EQUATION · ${esc(parts.whole)} · ${esc(row.equation_code || UNKNOWN)}</div>
      <table class="thy-var-table">
        <thead><tr><th>Variable</th><th>Name</th><th>Definition</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="3">' + UNKNOWN + '</td></tr>'}</tbody>
      </table>
      <div class="thy-read">
        ${READING_LEVELS.map(level =>
          `<div><b>${level}</b>${orUnknown(row[level.toLowerCase()])}</div>`).join('')}
        <div><b>REAL-LIFE EXAMPLE</b>${orUnknown(row.real_life_example)}</div>
      </div>
    </div>`;
  }

  function thoughtCard(row) {
    const verdict = row.gate_verdict === 'PASS' ? 'PASS' : 'FAIL';
    const blocking = [].concat(row.fail_closed || [], row.blocking || [], row.below_threshold || []);
    const field = (label, value) =>
      `<div class="thy-thought-row"><b>${label}</b><span>${orUnknown(value)}</span></div>`;

    // A quotation is shown only when the gate passed on its source record.
    const quote = verdict === 'PASS' && row.verified_quote ? esc(row.verified_quote) : unknownSpan();

    return `<div class="thy-math-card">
      <h4>${esc(row.thought_code || UNKNOWN)}</h4>
      <div class="thy-thought-row"><b>Pass / fail</b><span>
        <span class="thy-verdict ${verdict.toLowerCase()}">${verdict}</span>
        ${row.f_value != null ? ' F = ' + esc(row.f_value) : ' F = ' + UNKNOWN}
      </span></div>
      ${field('Person', row.person)}
      <div class="thy-thought-row"><b>Verified quote</b><span>${quote}</span></div>
      ${field('Source', row.source_citation)}
      ${field('Date / context', row.date_context)}
      ${field('Next question', row.next_question)}
      ${field('Math connection', row.math_connection)}
      ${field('Transfer question', row.transfer_question)}
      ${blocking.length ? `<ul class="thy-gate-list">${blocking.map(b => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
    </div>`;
  }

  // ---- mount ---------------------------------------------------------------
  function findMathSurface() {
    const direct = document.getElementById('math-section')
      || document.querySelector('[data-section="MATH"]')
      || document.querySelector('[data-scroll="math-section"]');
    if (direct) return { host: direct.closest('section') || direct, named: true };

    for (const heading of document.querySelectorAll('.section-title, h2, h3')) {
      if (/^\s*math\b/i.test(heading.textContent || '')) {
        return { host: heading.nextElementSibling || heading.parentElement, named: true };
      }
    }
    // No MATH surface in this build: use the existing Ideas & Creation grid.
    const fallback = document.getElementById('ideas-section');
    const grid = fallback ? fallback.nextElementSibling : null;
    return { host: grid || document.querySelector('main') || document.body, named: false };
  }

  const { host, named } = findMathSurface();
  const panel = document.createElement('article');
  panel.className = 'panel';
  panel.id = 'thyMathThought';
  panel.innerHTML = `<h3>Chairman Math &amp; Famous Thought</h3>
    <div class="thy-math-note" id="thyMathStatus">Sign in to read the math and famous-thought registries.</div>
    <div class="thy-math-wrap" id="thyMathBody"></div>`;
  host.appendChild(panel);

  const body = () => document.getElementById('thyMathBody');
  const status = () => document.getElementById('thyMathStatus');

  function renderUnreadable(reason) {
    status().innerHTML = `Registries not readable in this session (${esc(reason)}). `
      + `Every field below is ${UNKNOWN} until readback. Nothing is filled in from memory.`
      + (named ? '' : ' Mounted in the existing Ideas &amp; Creation surface: this build has no MATH section.');
    body().innerHTML =
      ['Q=f(K,E,C)', 'U=K×E×C×X×T', 'D=A×H×W×T×M×P', 'F=S×A×C×T']
        .map((whole, i) => equationCard({ whole_equation: whole, equation_code: 'PENDING_READBACK' },
             i === 0 ? 'ACTIVE EQUATIONS · 1 of 4' : 'ACTIVE EQUATIONS · ' + (i + 1) + ' of 4')).join('')
      + THOUGHT_CODES.map(code => thoughtCard({
          thought_code: code, gate_verdict: 'FAIL',
          fail_closed: ['SOURCE_UNCERTAIN', 'SPEAKER_UNCERTAIN', 'WORDING_UNCERTAIN', 'CONTEXT_MISSING']
        })).join('');
  }

  async function load() {
    if (!token()) { renderUnreadable('NO_SESSION'); return; }
    status().textContent = 'Reading registries…';
    let equations = [], thoughts = [];
    try {
      equations = await table('thylora_math_equation_registry', 'select=*&limit=50');
    } catch (e) { renderUnreadable(e.message); return; }
    try {
      thoughts = await table('thylora_famous_thought_registry',
        'select=*&thought_code=in.(' + THOUGHT_CODES.join(',') + ')&limit=20');
    } catch (e) { thoughts = []; }

    const active = equations.filter(e => (e.status || 'ACTIVE') === 'ACTIVE');
    const today = equationOfTheDay(active);
    status().innerHTML = `Read ${active.length} active equation(s) and ${thoughts.length} famous-thought record(s).`
      + (named ? '' : ' Mounted in the existing Ideas &amp; Creation surface: this build has no MATH section.');

    body().innerHTML =
      (today ? equationCard(today, "TODAY'S EQUATION") : '')
      + active.map((row, i) => equationCard(row, `ACTIVE EQUATIONS · ${i + 1} of ${active.length}`)).join('')
      + (thoughts.length
          ? thoughts.map(thoughtCard).join('')
          : THOUGHT_CODES.map(code => thoughtCard({
              thought_code: code, gate_verdict: 'FAIL',
              fail_closed: ['REGISTRY_RECORD_NOT_READABLE']
            })).join(''));
  }

  load();
  document.getElementById('refresh')?.addEventListener('click', load);
  document.getElementById('signin')?.addEventListener('click', () => setTimeout(load, 1200));
  console.info(MARK);
})();
