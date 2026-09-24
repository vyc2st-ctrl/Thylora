/* THYLORA · OMNIVIEW surface delta
 * Work: THY-WORK-OMNIVIEW-ROUNDTRIP-587 / THY-WORK-SEQUENCE-CHANGE-LEDGER-587
 *
 * This is a DELTA on the existing dashboard and app. It builds no second
 * dashboard: it adds two surfaces — CONTEXT and SEQUENCE — into whatever host
 * page it is loaded into, using that page's own visual language.
 *
 * It reads the OMNIVIEW read model through PostgREST RPC. The pack is applied to
 * thylora-dash at ledger 591 (THY-WORK-OMNIVIEW-LIVE-APPLY-591), and reads are
 * Chairman-only. Every other state is named plainly instead of rendering an
 * empty or broken surface: NOT YET APPLIED on a backend without the pack,
 * SIGNED OUT with no session, NOT THE CHAIRMAN for any other signed-in account.
 *
 * The pure logic is exported for tests; the DOM half only runs in a browser.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.THY_OMNIVIEW = api;
  if (typeof document !== 'undefined') api.mount(document);
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const MARK = 'THY-OMNIVIEW-SURFACE-594';
  const BACKEND = 'https://jvsdxhrfhtlgaknhjxlz.supabase.co';
  const KEY = 'sb_publishable_ta33XJ9rtS8VljoUYw-GuA_Pi4OycpQ';
  const APPLY_PATH = 'db/omniview/ (see db/omniview/APPLY.md)';

  /* ---------- pure logic (tested in tests/omniview-surface.test.mjs) ---------- */

  const esc = (v) => String(v == null ? '' : v)
    .replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // The same normalisation the database uses, so the surface and the backend
  // agree on what "TIME-RUN", "time run" and "INÉS" mean.
  const normalizeKey = (key) => String(key == null ? '' : key)
    .toUpperCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim();

  // The twelve columns every sequence must carry.
  const LEDGER_COLUMNS = [
    ['sequence_no', 'SEQUENCE'],
    ['local_datetime', 'LOCAL DATE/TIME'],
    ['utc_datetime', 'UTC DATE/TIME'],
    ['previous_sequence_no', 'PREVIOUS SEQUENCE'],
    ['why_change_occurred', 'WHY CHANGE OCCURRED'],
    ['what_changed', 'WHAT CHANGED'],
    ['why_it_changed', 'WHY IT CHANGED'],
    ['what_remained', 'WHAT REMAINED'],
    ['authority', 'AUTHORITY'],
    ['truth_class', 'TRUTH CLASS'],
    ['next_better_question', 'NEXT-BETTER QUESTION'],
    ['restart_point', 'RESTART POINT']
  ];

  // The pre-response path, in order, mapped to the section each step renders.
  const PATH_SECTIONS = {
    'NEWEST DELTAS': 'newest_deltas',
    'TOPIC MANIFEST': 'topic_manifest',
    'AUTHORITY LOCKS': 'authority_locks',
    'LINKED GRAPH': 'linked_graph',
    'LINKED PEOPLE/PLACES/OBJECTS/PRODUCTS': 'linked_entities',
    'LINKED WORK': 'linked_work',
    'LINKED GATES': 'linked_gates',
    'CURRENT VS SUPERSEDED': 'current_vs_superseded',
    'LAST RESTART': 'last_restart',
    'ANSWER': 'answer'
  };

  // Render order is taken from the payload, never from this file's memory of it.
  function orderSections(read) {
    const path = Array.isArray(read && read.read_path) ? read.read_path : Object.keys(PATH_SECTIONS);
    return path.map((step) => ({ step, section: PATH_SECTIONS[step] || null }))
      .filter((s) => s.section);
  }

  function partitionStatements(read) {
    const cvs = (read && read.current_vs_superseded) || {};
    return { current: cvs.current || [], superseded: cvs.superseded || [] };
  }

  // A backend that has not had the pack applied yet answers with PGRST202 /
  // "Could not find the function". That is a deployment state, not a failure.
  function readState(error) {
    if (!error) return 'OK';
    const text = String((error && (error.code || '')) + ' ' + (error && (error.message || error))).toLowerCase();
    if (text.includes('pgrst202') || text.includes('could not find the function')
      || text.includes('does not exist') || text.includes('404')) return 'NOT_APPLIED';
    if (text.includes('jwt') || text.includes('401') || text.includes('sign in')) return 'SIGNED_OUT';
    if (text.includes('42501') || text.includes('permission denied') || text.includes('403')) return 'NOT_CHAIRMAN';
    return 'ERROR';
  }

  // Reads are Chairman-only (thylora_is_chairman). Any other signed-in account
  // gets a successful but empty read: no sequence head, no rows. The seeded
  // ledger is never empty, so an empty read means "not the Chairman", not
  // "nothing recorded" — and must never be shown as an empty board.
  function accessState(read) {
    if (!read || typeof read !== 'object') return 'ERROR';
    const head = read.sequence_head !== undefined ? read.sequence_head : read.head;
    if (head === null) return 'NOT_CHAIRMAN';
    return 'OK';
  }

  function stateMessage(state) {
    if (state === 'NOT_APPLIED') {
      return 'OMNIVIEW is not applied to this backend yet. Apply ' + APPLY_PATH
        + ', then reopen this surface. Nothing else on this dashboard is affected.';
    }
    if (state === 'SIGNED_OUT') return 'Sign in first. CONTEXT and SEQUENCE read protected rows.';
    if (state === 'NOT_CHAIRMAN') {
      return 'Signed in, but not as the Chairman. CONTEXT and SEQUENCE are readable only by the Chairman account; '
        + 'this account sees nothing, by design.';
    }
    return 'Read failed.';
  }

  function sequenceView(read) {
    if (!read || read.found === false) return null;
    return {
      sequence_no: read.sequence_no,
      previous_sequence_no: read.previous_sequence_no,
      next_sequence_no: read.next_sequence_no,
      local: read.local_datetime + ' ' + (read.local_timezone || ''),
      utc: read.utc_datetime,
      delta: read.delta || {},
      reason: read.reason || {},
      authority: read.authority || {},
      next_question: read.next_question,
      restart_point: read.restart_point,
      topics: read.topics || []
    };
  }

  function qyrisLines(qyris) {
    if (!qyris) return [];
    const reads = (qyris.tables_read || []).map((t) => t.table + ' (' + t.rows + ')');
    return [
      ['QYRIS', (qyris.qyris_version || 'QYRIS') + ' · ' + (qyris.scope || '') + (qyris.topic ? ' · ' + qyris.topic : '')],
      ['READ AT', qyris.read_at_utc || ''],
      ['SEQUENCE HEAD', qyris.sequence_head == null ? '—' : String(qyris.sequence_head)],
      ['TABLES READ', reads.length ? reads.join(' · ') : 'none'],
      ['NOT READ', (qyris.not_read || []).join(' · ')]
    ];
  }

  /* ---------- 594: COVERAGE LEDGER, CURRENT GATES, MATH DISPLAY, TOPIC SUMMARY ---------- */

  // Exactly one of these per clause (THY-WORK-QUERY-COVERAGE-592). Anything
  // else — OPEN included — is an unsettled clause and counts against C_q.
  const COVERAGE_STATES = ['ANSWERED', 'EXECUTED', 'ASSIGNED', 'DEFERRED', 'BLOCKED', 'UNKNOWN'];

  // The 594 readers answer {access:'DENIED'} for a non-Chairman account.
  const deniedRead = (read) => !!(read && read.access === 'DENIED');

  function coverageView(read) {
    if (!read || typeof read !== 'object') return null;
    if (deniedRead(read)) return { access: 'DENIED' };
    const rows = Array.isArray(read.rows) ? read.rows : [];
    const open = rows.filter((r) => !COVERAGE_STATES.includes(r.response_state));
    const n = rows.length;
    const settled = n - open.length;
    return {
      access: 'OK',
      query_id: read.query_id || null,
      queries: read.queries || [],
      rows, open, n, settled,
      // Recomputed here from the rows, so the screen never trusts a stale ratio.
      c_q: n ? Math.round((settled / n) * 10000) / 10000 : null,
      complete: n > 0 && open.length === 0,
      by_state: rows.reduce((m, r) => { m[r.response_state] = (m[r.response_state] || 0) + 1; return m; }, {})
    };
  }

  const F_MEANING = 'f = FUNCTION OF — the rule describing how these pieces work together.';

  // MATH DISPLAY LAW: the eleven parts, always in this order, never skipped.
  const MATH_PARTS = [
    ['1_whole_equation', '1 · WHOLE EQUATION'],
    ['2_left_side', '2 · LEFT SIDE'],
    ['3_equal_sign', '3 · EQUAL SIGN'],
    ['4_right_side', '4 · RIGHT SIDE'],
    ['5_every_symbol', '5 · EVERY SYMBOL'],
    ['6_every_unit', '6 · EVERY UNIT'],
    ['7_plain_speech', '7 · PLAIN SPEECH'],
    ['8_real_example', '8 · REAL EXAMPLE'],
    ['9_where_used', '9 · WHERE SOMEONE WOULD USE IT'],
    ['10_answer_meaning', '10 · WHAT THE ANSWER MEANS'],
    ['11_next_question', '11 · NEXT QUESTION']
  ];

  const usesF = (text) => /(^|[^A-Za-z_])f\s*\(/.test(String(text || ''));

  // Returns the parts as plain text lines. A missing part is shown as MISSING,
  // never silently dropped; f is always explained when the equation uses it.
  function mathParts(row) {
    const d = (row && row.display) || null;
    const parts = MATH_PARTS.map(([key, label]) => {
      const v = d ? d[key] : null;
      let text;
      if (Array.isArray(v)) {
        text = v.map((s) => key === '6_every_unit'
          ? s.symbol + ' — ' + s.unit + (s.range ? ' (' + s.range + ')' : '')
          : s.symbol + ' — ' + s.name + (s.meaning ? ': ' + s.meaning : '')).join('\n');
      } else {
        text = v == null || v === '' ? 'MISSING' : String(v);
      }
      return { key, label, text, missing: text === 'MISSING' };
    });
    const equation = (d && d['1_whole_equation']) || (row && row.registered_text) || '';
    return { parts, uses_f: usesF(equation), f_meaning: usesF(equation) ? F_MEANING : null,
      complete: !!d && parts.every((p) => !p.missing) };
  }

  // The ten things the Chairman asked every topic to show, read from one
  // thy_omniview_topic payload. Empty means "nothing recorded", said plainly.
  function topicSummary(read) {
    if (!read || read.found === false) return null;
    const links = read.linked_entities || {};
    const names = (rows) => (rows || []).map((r) => r.display_name).filter(Boolean);
    const parts = partitionStatements(read);
    const latestCorrection = parts.superseded.slice()
      .sort((a, b) => Number(b.superseded_sequence_no || 0) - Number(a.superseded_sequence_no || 0))[0];
    const gates = read.linked_gates || [];
    const openGates = gates.filter((g) => g.gate_state !== 'PASSED' && g.gate_state !== 'WAIVED');
    const locks = read.authority_locks || {};
    const next = (read.open_questions || []).find((q) => q.is_next_better);
    return [
      ['CURRENT AUTHORITY', (locks.authority_lock || '—') + (locks.authority_holder ? ' · ' + locks.authority_holder : '')
        + ' · ' + parts.current.length + ' current statement(s)'],
      ['SUPERSEDED MATERIAL', parts.superseded.length ? parts.superseded.length + ' superseded statement(s)' : 'Nothing superseded'],
      ['PEOPLE', names(links.people).join(', ') || 'None linked'],
      ['PLACES', names(links.places).join(', ') || 'None linked'],
      ['OBJECTS', names(links.objects).concat(names(links.products)).join(', ') || 'None linked'],
      ['WORK', (read.linked_work || []).map((w) => w.link_key).join(', ') || 'None linked'],
      ['GATES', gates.length ? openGates.length + ' open/blocked of ' + gates.length
        + (openGates.length ? ': ' + openGates.map((g) => g.gate_key + ' ' + g.gate_state).join(', ') : '') : 'No gates'],
      ['LATEST CORRECTION', latestCorrection
        ? '#' + latestCorrection.superseded_sequence_no + ': ' + latestCorrection.body : 'No correction recorded'],
      ['UNRESOLVED QUESTIONS', String((read.open_questions || []).length)],
      ['NEXT ACTION', (next && next.question) || (read.last_restart && read.last_restart.restart_point) || 'No next action recorded']
    ];
  }

  const api = {
    MARK, LEDGER_COLUMNS, PATH_SECTIONS, COVERAGE_STATES, MATH_PARTS, F_MEANING,
    esc, normalizeKey, orderSections, partitionStatements,
    readState, accessState, stateMessage, sequenceView, qyrisLines,
    coverageView, mathParts, usesF, topicSummary, deniedRead
  };

  /* ---------- DOM half ---------- */

  api.mount = function mount(doc) {
    if (!doc || !doc.body || doc.getElementById('thyOmniviewPanel')) return false;

    const token = () => {
      try {
        const dash = localStorage.getItem('thy_access_token');
        if (dash) return dash;
        const app = JSON.parse(sessionStorage.getItem('thylora_app_auth_session') || 'null');
        return (app && app.access_token) || '';
      } catch (_) { return ''; }
    };

    async function rpc(fn, body) {
      const t = token();
      if (!t) throw { code: '401', message: 'sign in first' };
      const res = await fetch(BACKEND + '/rest/v1/rpc/' + fn, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: KEY, Authorization: 'Bearer ' + t },
        body: JSON.stringify(body || {})
      });
      const text = await res.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch (_) { data = { message: text }; }
      if (!res.ok) throw { code: String(res.status) + ' ' + (data.code || ''), message: data.message || data.hint || text };
      return data;
    }

    const style = doc.createElement('style');
    style.id = 'thy-omniview-style';
    style.textContent = [
      // Full-screen and opaque: it sits above the host's floating launchers
      // (SPINE FORWARD .thy-spine-launch 120 / panel 121, and its own at 120),
      // so nothing floats over the content on a phone.
      '.thy-omni-panel{position:fixed;inset:0;z-index:125;background:#080d14;display:none;flex-direction:column}',
      '.thy-omni-panel.open{display:flex}',
      '.thy-omni-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:calc(14px + env(safe-area-inset-top)) 16px 13px;border-bottom:1px solid #293342;background:#0b1119;flex:none}',
      '.thy-omni-head strong{font-size:17px;letter-spacing:.06em}',
      '.thy-omni-tabs{display:flex;gap:8px;padding:11px 16px;border-bottom:1px solid #1e2734;flex:none;flex-wrap:wrap}',
      '.thy-omni-tabs button{border:1px solid #303b49;background:#101823;color:#f4efe6;border-radius:999px;padding:8px 14px;font-weight:750}',
      '.thy-omni-tabs button.active{background:#6d4f18;border-color:#a0792d}',
      '.thy-omni-body{flex:1;min-height:0;overflow:auto;padding:14px;-webkit-overflow-scrolling:touch}',
      '.thy-omni-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:10px}',
      '.thy-omni-card{border:1px solid #26313e;background:#0b121a;border-radius:13px;padding:12px;text-align:left;width:100%;min-width:0;color:#f4efe6;white-space:normal;overflow-wrap:anywhere;word-break:break-word}',
      '.thy-omni-body *{max-width:100%}',
      '.thy-omni-card b.t{display:block;font-size:15px;font-weight:850;margin-bottom:4px}',
      '.thy-omni-card .m{font-size:12px;color:#9fa8b5}',
      '.thy-omni-step{margin:16px 0 8px;color:#d6a348;font-size:12px;font-weight:850;letter-spacing:.09em;text-transform:uppercase;border-top:1px solid #1e2734;padding-top:12px}',
      '.thy-omni-step:first-child{border-top:0;margin-top:0}',
      '.thy-omni-row{border:1px solid #232e3b;background:#0a1018;border-radius:11px;padding:10px;margin-bottom:8px;white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.6}',
      '.thy-omni-row.sup{opacity:.72;border-style:dashed}',
      '.thy-omni-kv{display:grid;grid-template-columns:170px 1fr;gap:5px 10px;font-size:13px}',
      '.thy-omni-kv b{color:#cbd2dc}',
      '.thy-omni-pill{display:inline-block;border:1px solid #394656;border-radius:999px;padding:2px 8px;font-size:11px;color:#9fa8b5;margin-right:6px}',
      '.thy-omni-pill.open{border-color:#c07a7a;color:#ff9090}.thy-omni-pill.good{border-color:#4f8c68;color:#78d49b}',
      '.thy-omni-note{color:#9fa8b5;line-height:1.6;padding:8px 0}',
      '.thy-omni-note.bad{color:#ff9090}',
      '.thy-omni-qyris{margin-top:16px;border:1px solid #5a4728;background:#12100b;border-radius:13px;padding:12px}',
      '.thy-omni-back{border:1px solid #384454;background:#141c27;color:#fff;border-radius:10px;padding:8px 12px;margin-bottom:12px}',
      '.thy-omni-lookup{display:flex;gap:8px;margin-bottom:12px}',
      '.thy-omni-lookup input{flex:1;min-width:0;border:1px solid #303b49;background:#0b121a;color:#f4efe6;border-radius:10px;padding:9px 11px;font-size:15px}',
      '.thy-omni-lookup button{border:1px solid #a0792d;background:#6d4f18;color:#fff;border-radius:10px;padding:8px 14px;font-weight:800}',
      '.thy-omni-summary{border:1px solid #a0792d;background:#110e08;border-radius:13px;padding:12px;margin-bottom:12px}',
      '.thy-omni-part{border-left:3px solid #6d4f18;padding:6px 10px;margin:6px 0;white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.55}',
      '.thy-omni-part b{display:block;color:#d6a348;font-size:11px;letter-spacing:.08em}',
      '.thy-omni-part.missing{border-left-color:#c07a7a;color:#ff9090}',
      '.thy-omni-f{border:1px solid #4f8c68;background:#0b1510;border-radius:11px;padding:10px;margin:8px 0;color:#bfe8cf;font-weight:750}',
      '.thy-omni-meter{height:10px;border-radius:999px;background:#1e2734;overflow:hidden;margin:8px 0}',
      '.thy-omni-meter i{display:block;height:100%;background:#4f8c68}',
      '.thy-omni-meter.bad i{background:#c07a7a}',
      '@media(max-width:700px){.thy-omni-kv{grid-template-columns:1fr}}'
    ].join('');
    doc.head.appendChild(style);

    const panel = doc.createElement('section');
    panel.className = 'thy-omni-panel';
    panel.id = 'thyOmniviewPanel';
    panel.setAttribute('aria-label', 'OMNIVIEW context and sequence');
    panel.innerHTML =
      '<div class="thy-omni-head"><div><strong id="thyOmniTitle">CONTEXT</strong>'
      + '<div class="m" id="thyOmniSub">Current state, then the history behind it.</div></div>'
      + '<button type="button" class="thy-omni-back" id="thyOmniClose">Close</button></div>'
      + '<div class="thy-omni-tabs">'
      + '<button type="button" id="thyOmniTabContext" class="active">CONTEXT</button>'
      + '<button type="button" id="thyOmniTabSequence">SEQUENCE</button>'
      + '<button type="button" id="thyOmniTabCoverage">COVERAGE LEDGER</button>'
      + '<button type="button" id="thyOmniTabGates">CURRENT GATES</button>'
      + '<button type="button" id="thyOmniTabMath">MATH</button>'
      + '<button type="button" id="thyOmniRefresh">Refresh</button></div>'
      + '<div class="thy-omni-body" id="thyOmniBody"></div>';
    doc.body.appendChild(panel);

    const $ = (id) => doc.getElementById(id);
    const body = $('thyOmniBody');
    let view = 'CONTEXT';

    const note = (msg, bad) => { body.innerHTML = '<div class="thy-omni-note' + (bad ? ' bad' : '') + '">' + esc(msg) + '</div>'; };

    function qyrisBlock(qyris) {
      const lines = qyrisLines(qyris);
      if (!lines.length) return '';
      return '<div class="thy-omni-qyris"><div class="thy-omni-kv">'
        + lines.map((l) => '<b>' + esc(l[0]) + '</b><span>' + esc(l[1]) + '</span>').join('')
        + '</div></div>';
    }

    const VIEWS = {
      CONTEXT: { tab: 'thyOmniTabContext', sub: 'Current state, then the history behind it.', load: () => loadContext() },
      SEQUENCE: { tab: 'thyOmniTabSequence', sub: 'Every sequence: what changed, why, on whose authority.', load: () => loadLedger() },
      'COVERAGE LEDGER': { tab: 'thyOmniTabCoverage', sub: 'Every clause of the Chairman query, with exactly one state.', load: () => loadCoverage() },
      'CURRENT GATES': { tab: 'thyOmniTabGates', sub: 'What is blocked, what is open, what has passed.', load: () => loadGates() },
      MATH: { tab: 'thyOmniTabMath', sub: 'Every equation in eleven parts. f = FUNCTION OF.', load: () => loadMath() }
    };

    function open(which) {
      view = VIEWS[which] ? which : view;
      panel.classList.add('open');
      Object.keys(VIEWS).forEach((k) => $(VIEWS[k].tab).classList.toggle('active', k === view));
      $('thyOmniTitle').textContent = view;
      $('thyOmniSub').textContent = VIEWS[view].sub;
      const drawer = $('drawer');
      if (drawer) drawer.classList.remove('open');
      return VIEWS[view].load();
    }

    function close() { panel.classList.remove('open'); }

    async function loadContext() {
      note('Reading the current state manifest…');
      let read;
      try { read = await rpc('thy_omniview_manifest', { p_delta_limit: 8 }); }
      catch (e) { const s = readState(e); return note(stateMessage(s) + (s === 'ERROR' ? ' ' + (e.message || '') : ''), s !== 'NOT_APPLIED'); }
      if (accessState(read) !== 'OK') return note(stateMessage(accessState(read)), true);

      const topics = read.topic_manifest || [];
      body.innerHTML =
        '<form class="thy-omni-lookup" id="thyOmniLookup"><input id="thyOmniLookupInput" type="search" '
        + 'placeholder="TOPIC LOOKUP — e.g. Royal Castle, Alistair, first shirt" aria-label="Topic lookup" autocomplete="off">'
        + '<button type="submit">Look up</button></form>'
        + '<div class="thy-omni-note" id="thyOmniLookupNote" style="display:none"></div>'
        + '<div class="thy-omni-step">TOPIC MANIFEST · head ' + esc(read.sequence_head) + '</div>'
        + '<div class="thy-omni-grid">'
        + (topics.length ? topics.map((t) =>
          '<button type="button" class="thy-omni-card" data-omni-topic="' + esc(t.topic_key) + '">'
          + '<b class="t">' + esc(t.display_name) + '</b>'
          + '<div class="m">' + esc(t.topic_class) + ' · ' + esc(t.canon_state)
          + ' · lock ' + esc(t.authority_lock) + '</div>'
          + '<div class="m" style="margin-top:6px">'
          + '<span class="thy-omni-pill' + (Number(t.open_gates) ? ' open' : ' good') + '">' + esc(t.open_gates) + ' gates</span>'
          + '<span class="thy-omni-pill">' + esc(t.current_statements) + ' canon</span>'
          + '<span class="thy-omni-pill">' + esc(t.superseded_statements) + ' superseded</span>'
          + '<span class="thy-omni-pill">' + esc(t.open_questions) + ' questions</span>'
          + '</div>'
          + '<div class="m" style="margin-top:6px">last sequence ' + esc(t.last_sequence_no == null ? '—' : t.last_sequence_no) + '</div>'
          + '</button>').join('') : '<div class="thy-omni-note">No topics registered.</div>')
        + '</div>'
        + '<div class="thy-omni-step">LAST RESTART</div>'
        + '<div class="thy-omni-row">' + esc((read.last_restart && read.last_restart.restart_point) || 'No restart point recorded.') + '</div>'
        + qyrisBlock(read.qyris);

      doc.querySelectorAll('[data-omni-topic]').forEach((b) => { b.onclick = () => loadTopic(b.dataset.omniTopic); });
      $('thyOmniLookup').onsubmit = async (ev) => {
        ev.preventDefault();
        const q = $('thyOmniLookupInput').value.trim();
        const out = $('thyOmniLookupNote');
        if (!q) return;
        let key = null;
        try { key = await rpc('thy_omniview_resolve_topic', { p_key: q }); } catch (_) { key = null; }
        if (typeof key === 'string' && key) return loadTopic(key);
        out.style.display = 'block';
        out.className = 'thy-omni-note bad';
        out.textContent = 'No registered topic or alias matches "' + q + '". Nothing was guessed. '
          + 'Register it on the backend (thy_omniview_register_topic) before answering about it as canon.';
      };
    }

    async function loadTopic(key) {
      note('Reading ' + key + '…');
      let read;
      try { read = await rpc('thy_omniview_topic', { p_topic_key: key, p_history_limit: 25 }); }
      catch (e) { const s = readState(e); return note(stateMessage(s) + (s === 'ERROR' ? ' ' + (e.message || '') : ''), s !== 'NOT_APPLIED'); }

      const parts = partitionStatements(read);
      const links = read.linked_entities || {};
      const entity = (rows, label) => !rows || !rows.length ? '' :
        '<div class="thy-omni-row"><b>' + esc(label) + '</b><br>' + rows.map((r) =>
          esc(r.display_name) + ' — ' + esc(r.relation) + ' (' + esc(r.status) + ')').join('<br>') + '</div>';

      const section = {
        newest_deltas: () => (read.newest_deltas || []).map((d) =>
          '<button type="button" class="thy-omni-card" data-omni-seq="' + esc(d.sequence_no) + '" style="margin-bottom:8px">'
          + '<b class="t">#' + esc(d.sequence_no) + ' · ' + esc(d.what_changed) + '</b>'
          + '<div class="m">' + esc(d.occurred_local) + ' ' + esc(d.local_timezone) + ' · ' + esc(d.occurred_utc)
          + ' · ' + esc(d.authority) + ' · ' + esc(d.truth_class) + '</div></button>').join('')
          || '<div class="thy-omni-note">No sequence has touched this topic.</div>',
        topic_manifest: () => '<div class="thy-omni-row"><div class="thy-omni-kv">'
          + '<b>Topic</b><span>' + esc(read.topic_manifest.display_name) + '</span>'
          + '<b>Class</b><span>' + esc(read.topic_manifest.topic_class) + '</span>'
          + '<b>Canon state</b><span>' + esc(read.topic_manifest.canon_state) + '</span>'
          + '<b>Summary</b><span>' + esc(read.topic_manifest.summary || '—') + '</span></div></div>',
        authority_locks: () => '<div class="thy-omni-row"><div class="thy-omni-kv">'
          + '<b>Authority lock</b><span>' + esc(read.authority_locks.authority_lock) + '</span>'
          + '<b>Holder</b><span>' + esc(read.authority_locks.authority_holder || '—') + '</span>'
          + '<b>Answerable as canon</b><span>' + (read.authority_locks.answerable_as_canon ? 'Yes' : 'No') + '</span></div></div>',
        linked_graph: () => '<div class="thy-omni-note">' + esc((read.linked_graph || []).length) + ' linked records.</div>',
        linked_entities: () => (entity(links.people, 'People') + entity(links.places, 'Places')
          + entity(links.objects, 'Objects') + entity(links.products, 'Products')
          + entity(links.money, 'Money') + entity(links.systems, 'Systems') + entity(links.topics, 'Topics'))
          || '<div class="thy-omni-note">Nothing linked yet.</div>',
        linked_work: () => (read.linked_work || []).map((w) =>
          '<div class="thy-omni-row"><b>' + esc(w.link_key) + '</b><br>' + esc(w.display_name)
          + ' — ' + esc(w.relation) + ' (' + esc(w.status) + ')</div>').join('')
          || '<div class="thy-omni-note">No active work linked.</div>',
        linked_gates: () => (read.linked_gates || []).map((g) =>
          '<div class="thy-omni-row"><span class="thy-omni-pill'
          + (g.gate_state === 'PASSED' || g.gate_state === 'WAIVED' ? ' good' : ' open') + '">' + esc(g.gate_state) + '</span>'
          + '<b>' + esc(g.gate_key) + '</b><br>' + esc(g.requirement)
          + (g.blocker ? '<br><i>Blocker: ' + esc(g.blocker) + '</i>' : '') + '</div>').join('')
          || '<div class="thy-omni-note">No gates on this topic.</div>',
        current_vs_superseded: () =>
          '<div class="thy-omni-note">CURRENT CANON</div>'
          + (parts.current.map((s) => '<div class="thy-omni-row">' + esc(s.body)
            + '<div class="m" style="margin-top:6px">' + esc(s.truth_class) + ' · ' + esc(s.authority)
            + ' · entered at #' + esc(s.entered_sequence_no) + (s.source_ref ? ' · ' + esc(s.source_ref) : '') + '</div></div>').join('')
            || '<div class="thy-omni-note">No current canon. ' + esc(read.answer_rule) + '</div>')
          + '<div class="thy-omni-note">SUPERSEDED HISTORY</div>'
          + (parts.superseded.map((s) => '<div class="thy-omni-row sup">' + esc(s.body)
            + '<div class="m" style="margin-top:6px">entered #' + esc(s.entered_sequence_no)
            + ' · superseded at #' + esc(s.superseded_sequence_no) + '</div></div>').join('')
            || '<div class="thy-omni-note">Nothing has been superseded.</div>'),
        last_restart: () => '<div class="thy-omni-row">'
          + esc((read.last_restart && read.last_restart.restart_point) || 'No restart point recorded.') + '</div>',
        answer: () => '<div class="thy-omni-row"><b>ANSWER RULE</b><br>' + esc(read.answer_rule) + '</div>'
          + '<div class="thy-omni-note">OPEN QUESTIONS</div>'
          + ((read.open_questions || []).map((q) => '<div class="thy-omni-row">'
            + (q.is_next_better ? '<span class="thy-omni-pill open">NEXT-BETTER</span>' : '')
            + esc(q.question) + (q.why_it_matters ? '<div class="m" style="margin-top:6px">' + esc(q.why_it_matters) + '</div>' : '')
            + '</div>').join('') || '<div class="thy-omni-note">No open questions.</div>')
          + '<div class="thy-omni-note">LAST SEQUENCE</div>'
          + (read.last_sequence
            ? '<button type="button" class="thy-omni-card" data-omni-seq="' + esc(read.last_sequence.sequence_no) + '">'
            + '<b class="t">#' + esc(read.last_sequence.sequence_no) + '</b><div class="m">'
            + esc(read.last_sequence.what_changed) + '</div></button>'
            : '<div class="thy-omni-note">No sequence recorded for this topic.</div>')
      };

      if (read.found === false) {
        body.innerHTML = '<button type="button" class="thy-omni-back" id="thyOmniBack">← All topics</button>'
          + '<div class="thy-omni-row"><b>' + esc(read.topic_key) + '</b><br>' + esc(read.answer_rule) + '</div>'
          + '<div class="thy-omni-row">' + esc(read.next_better_question) + '</div>' + qyrisBlock(read.qyris);
      } else {
        const sum = topicSummary(read) || [];
        body.innerHTML = '<button type="button" class="thy-omni-back" id="thyOmniBack">← All topics</button>'
          + '<div class="thy-omni-summary"><div class="thy-omni-step" style="margin-top:0">'
          + esc(read.topic_manifest.display_name) + ' · AT A GLANCE</div><div class="thy-omni-kv">'
          + sum.map((l) => '<b>' + esc(l[0]) + '</b><span>' + esc(l[1]) + '</span>').join('') + '</div></div>'
          + orderSections(read).map((s) => {
            const render = section[s.section];
            return render ? '<div class="thy-omni-step">' + esc(s.step) + '</div>' + render() : '';
          }).join('')
          + qyrisBlock(read.qyris);
      }
      const back = $('thyOmniBack');
      if (back) back.onclick = loadContext;
      doc.querySelectorAll('[data-omni-seq]').forEach((b) => { b.onclick = () => loadSequence(b.dataset.omniSeq); });
    }

    async function loadLedger() {
      note('Reading the sequence ledger…');
      let read;
      try { read = await rpc('thy_sequence_ledger_page', { p_limit: 60 }); }
      catch (e) { const s = readState(e); return note(stateMessage(s) + (s === 'ERROR' ? ' ' + (e.message || '') : ''), s !== 'NOT_APPLIED'); }
      if (accessState(read) !== 'OK') return note(stateMessage(accessState(read)), true);

      const rows = read.rows || [];
      body.innerHTML = '<div class="thy-omni-step">SEQUENCE LEDGER · head ' + esc(read.head) + '</div>'
        + (rows.length ? rows.map((r) =>
          '<button type="button" class="thy-omni-card" data-omni-seq="' + esc(r.sequence_no) + '" style="margin-bottom:8px">'
          + '<b class="t">#' + esc(r.sequence_no) + ' · ' + esc(r.what_changed) + '</b>'
          + '<div class="m">' + esc(r.local_datetime) + ' ' + esc(r.local_timezone)
          + ' · ' + esc(r.utc_datetime) + ' · previous ' + esc(r.previous_sequence_no == null ? '—' : r.previous_sequence_no) + '</div>'
          + '<div class="m" style="margin-top:6px"><span class="thy-omni-pill">' + esc(r.authority) + '</span>'
          + '<span class="thy-omni-pill">' + esc(r.truth_class) + '</span>'
          + (r.topics || []).map((t) => '<span class="thy-omni-pill">' + esc(t) + '</span>').join('') + '</div>'
          + '</button>').join('') : '<div class="thy-omni-note">No sequences recorded.</div>')
        + qyrisBlock(read.qyris);
      doc.querySelectorAll('[data-omni-seq]').forEach((b) => { b.onclick = () => loadSequence(b.dataset.omniSeq); });
    }

    async function loadSequence(no) {
      note('Reading sequence ' + no + '…');
      let read;
      try { read = await rpc('thy_omniview_sequence', { p_sequence_no: Number(no) }); }
      catch (e) { const s = readState(e); return note(stateMessage(s) + (s === 'ERROR' ? ' ' + (e.message || '') : ''), s !== 'NOT_APPLIED'); }

      const v = sequenceView(read);
      if (!v) return note('Sequence ' + no + ' is not in the ledger.', true);
      body.innerHTML = '<button type="button" class="thy-omni-back" id="thyOmniBack">← Ledger</button>'
        + '<div class="thy-omni-step">SEQUENCE #' + esc(v.sequence_no) + '</div>'
        + '<div class="thy-omni-row"><div class="thy-omni-kv">'
        + '<b>Local date/time</b><span>' + esc(v.local) + '</span>'
        + '<b>UTC date/time</b><span>' + esc(v.utc) + '</span>'
        + '<b>Previous sequence</b><span>' + esc(v.previous_sequence_no == null ? '—' : v.previous_sequence_no) + '</span>'
        + '<b>Next sequence</b><span>' + esc(v.next_sequence_no == null ? '—' : v.next_sequence_no) + '</span>'
        + '</div></div>'
        + '<div class="thy-omni-step">DELTA</div>'
        + '<div class="thy-omni-row"><b>What changed</b><br>' + esc(v.delta.what_changed) + '</div>'
        + '<div class="thy-omni-row"><b>What remained</b><br>' + esc(v.delta.what_remained) + '</div>'
        + '<div class="thy-omni-step">REASON</div>'
        + '<div class="thy-omni-row"><b>Why the change occurred</b><br>' + esc(v.reason.why_change_occurred) + '</div>'
        + '<div class="thy-omni-row"><b>Why it changed</b><br>' + esc(v.reason.why_it_changed) + '</div>'
        + '<div class="thy-omni-step">AUTHORITY</div>'
        + '<div class="thy-omni-row"><div class="thy-omni-kv">'
        + '<b>Authority</b><span>' + esc(v.authority.authority) + '</span>'
        + '<b>Truth class</b><span>' + esc(v.authority.truth_class) + '</span>'
        + '<b>Recorded by</b><span>' + esc(v.authority.recorded_by) + '</span>'
        + '<b>Recorded at</b><span>' + esc(v.authority.recorded_at) + '</span></div></div>'
        + '<div class="thy-omni-step">NEXT QUESTION</div>'
        + '<div class="thy-omni-row">' + esc(v.next_question) + '</div>'
        + '<div class="thy-omni-step">RESTART POINT</div>'
        + '<div class="thy-omni-row">' + esc(v.restart_point) + '</div>'
        + '<div class="thy-omni-step">TOPICS TOUCHED</div>'
        + '<div class="thy-omni-row">' + (v.topics.length
          ? v.topics.map((t) => '<button type="button" class="thy-omni-back" data-omni-topic="'
            + esc(t.topic_key) + '" style="margin:0 8px 8px 0">' + esc(t.display_name) + ' · ' + esc(t.effect) + '</button>').join('')
          : 'No topic linked to this sequence.') + '</div>'
        + qyrisBlock(read.qyris);
      const back = $('thyOmniBack');
      if (back) back.onclick = loadLedger;
      doc.querySelectorAll('[data-omni-topic]').forEach((b) => { b.onclick = () => { view = 'CONTEXT'; open('CONTEXT'); loadTopic(b.dataset.omniTopic); }; });
    }

    async function loadCoverage(queryId) {
      note('Reading the coverage ledger…');
      let read;
      try { read = await rpc('thy_omniview_coverage', queryId ? { p_query_id: queryId } : {}); }
      catch (e) { const s = readState(e); return note(stateMessage(s) + (s === 'ERROR' ? ' ' + (e.message || '') : ''), s !== 'NOT_APPLIED'); }
      const v = coverageView(read);
      if (!v || v.access === 'DENIED') return note(stateMessage('NOT_CHAIRMAN'), true);
      const forQuery = v.query_id ? ' for ' + String(v.query_id) : '';
      if (!v.n) return note('No clause ledger recorded yet' + forQuery + '.', true);
      const pct = Math.round((v.c_q || 0) * 100);
      const openRows = v.open.map(covRow).join('');
      body.innerHTML =
        (v.queries.length > 1 ? '<div class="thy-omni-lookup"><select id="thyOmniCovQuery" aria-label="Query">'
          + v.queries.map((q) => '<option' + (q === v.query_id ? ' selected' : '') + '>' + esc(q) + '</option>').join('')
          + '</select></div>' : '')
        + '<div class="thy-omni-step">' + esc(v.query_id) + '</div>'
        + '<div class="thy-omni-row"><b>C_q = (A+E+S+B+D+U) / N = ' + esc(v.settled) + ' / ' + esc(v.n) + ' = ' + esc(v.c_q) + '</b>'
        + '<div class="thy-omni-meter' + (v.complete ? '' : ' bad') + '"><i style="width:' + pct + '%"></i></div>'
        + (v.complete ? 'Every clause has exactly one state. Nothing silently disappeared.'
          : v.open.length + ' clause(s) still OPEN — the response is NOT complete.')
        + '<div class="m" style="margin-top:6px">' + COVERAGE_STATES.concat(['OPEN']).map((s) =>
          '<span class="thy-omni-pill' + (s === 'OPEN' && v.open.length ? ' open' : '') + '">' + esc(s) + ' ' + esc(v.by_state[s] || 0) + '</span>').join('')
        + '</div></div>'
        + (v.open.length ? '<div class="thy-omni-step">OPEN — NEEDS A STATE</div>' + openRows : '')
        + '<div class="thy-omni-step">ALL CLAUSES</div>' + v.rows.map(covRow).join('');
      const sel = $('thyOmniCovQuery');
      if (sel) sel.onchange = () => loadCoverage(sel.value);
    }

    function covRow(r) {
      const settled = COVERAGE_STATES.includes(r.response_state);
      return '<div class="thy-omni-row"><span class="thy-omni-pill' + (settled ? ' good' : ' open') + '">'
        + esc(r.response_state) + '</span><b>#' + esc(r.point_no) + '</b> ' + esc(r.source_point)
        + (r.response_ref ? '<div class="m" style="margin-top:6px">→ ' + esc(r.response_ref) + '</div>' : '')
        + (r.omission_reason ? '<div class="m" style="margin-top:4px"><i>' + esc(r.omission_reason) + '</i></div>' : '')
        + '</div>';
    }

    async function loadGates() {
      note('Reading current gates…');
      let read;
      try { read = await rpc('thy_omniview_current_gates', {}); }
      catch (e) { const s = readState(e); return note(stateMessage(s) + (s === 'ERROR' ? ' ' + (e.message || '') : ''), s !== 'NOT_APPLIED'); }
      if (!read || deniedRead(read)) return note(stateMessage('NOT_CHAIRMAN'), true);
      const tg = read.topic_gates || [];
      const reg = read.registry || [];
      const group = (st) => tg.filter((g) => g.gate_state === st);
      const gateCard = (g) => '<div class="thy-omni-row"><span class="thy-omni-pill'
        + (g.gate_state === 'PASSED' || g.gate_state === 'WAIVED' ? ' good' : ' open') + '">' + esc(g.gate_state) + '</span>'
        + '<b>' + esc(g.gate_key) + '</b> <button type="button" class="thy-omni-pill" data-omni-topic="' + esc(g.topic_key) + '">'
        + esc(g.topic_key) + '</button><br>' + esc(g.requirement)
        + (g.blocker ? '<br><i>Blocker: ' + esc(g.blocker) + '</i>' : '')
        + '<div class="m" style="margin-top:6px">entered #' + esc(g.entered_sequence_no)
        + (g.settled_sequence_no ? ' · settled #' + esc(g.settled_sequence_no) : '') + ' · ' + esc(g.authority || '') + '</div></div>';
      body.innerHTML = '<div class="thy-omni-step">TOPIC GATES · head ' + esc(read.head) + '</div>'
        + ['BLOCKED', 'OPEN', 'PASSED', 'WAIVED'].map((st) => group(st).length
          ? '<div class="thy-omni-note">' + st + ' (' + group(st).length + ')</div>' + group(st).map(gateCard).join('') : '').join('')
        + '<div class="thy-omni-step">BACKEND GATE REGISTRY (' + reg.length + ')</div>'
        + reg.map((d) => '<div class="thy-omni-row"><span class="thy-omni-pill' + (d.state === 'ACTIVE' ? ' good' : '') + '">'
          + esc(d.state) + '</span><b>' + esc(d.title) + '</b> · ' + esc(d.gate_code)
          + '<br>' + esc(d.purpose) + (d.equation ? '<div class="m" style="margin-top:6px">' + esc(d.equation) + '</div>' : '')
          + '</div>').join('');
      doc.querySelectorAll('[data-omni-topic]').forEach((b) => { b.onclick = () => { open('CONTEXT'); loadTopic(b.dataset.omniTopic); }; });
    }

    async function loadMath() {
      note('Reading the equation registry…');
      let read;
      try { read = await rpc('thy_math_display_get', {}); }
      catch (e) { const s = readState(e); return note(stateMessage(s) + (s === 'ERROR' ? ' ' + (e.message || '') : ''), s !== 'NOT_APPLIED'); }
      if (!read || deniedRead(read)) return note(stateMessage('NOT_CHAIRMAN'), true);
      const rows = read.rows || [];
      body.innerHTML = '<div class="thy-omni-f">' + esc(F_MEANING) + '</div>'
        + rows.map((r) => {
          const m = mathParts(r);
          return '<details class="thy-omni-row"><summary><b>'
            + esc(r.registered_text) + '</b> · ' + esc(r.equation_name) + ' <span class="thy-omni-pill'
            + (m.complete ? ' good">11/11' : ' open">INCOMPLETE') + '</span></summary>'
            + (m.uses_f ? '<div class="thy-omni-f">' + esc(m.f_meaning) + '</div>' : '')
            + m.parts.map((p) => '<div class="thy-omni-part' + (p.missing ? ' missing' : '') + '"><b>'
              + esc(p.label) + '</b>' + esc(p.text) + '</div>').join('')
            + '</details>';
        }).join('');
    }

    $('thyOmniClose').onclick = close;
    $('thyOmniTabCoverage').onclick = () => open('COVERAGE LEDGER');
    $('thyOmniTabGates').onclick = () => open('CURRENT GATES');
    $('thyOmniTabMath').onclick = () => open('MATH');
    $('thyOmniTabContext').onclick = () => open('CONTEXT');
    $('thyOmniTabSequence').onclick = () => open('SEQUENCE');
    $('thyOmniRefresh').onclick = () => open(view);

    // Mount the entry points into the host page's own navigation. The drawer is
    // preferred; a floating launcher is the fallback so the surface is always
    // reachable, on the dashboard and in the app alike.
    const entry = doc.createElement('div');
    const drawerBody = doc.querySelector('.drawer-body');
    if (drawerBody) {
      entry.className = 'drawer-section';
      entry.innerHTML = '<h3>OMNIVIEW</h3><div class="nav-grid">'
        + '<button type="button" class="nav-btn" id="thyOmniOpenContext"><b>CONTEXT</b><div class="sub">Topic canon, history, links, gates</div></button>'
        + '<button type="button" class="nav-btn" id="thyOmniOpenSequence"><b>SEQUENCE</b><div class="sub">Every change, reason and authority</div></button>'
        + '</div>';
      drawerBody.insertBefore(entry, drawerBody.firstChild);
    } else {
      entry.innerHTML = '<button type="button" id="thyOmniOpenContext" style="position:fixed;right:14px;bottom:calc(76px + env(safe-area-inset-bottom));z-index:120;border:1px solid #b28a3d;background:#17120b;color:#fff;border-radius:999px;padding:11px 15px;font-weight:800">CONTEXT</button>'
        + '<button type="button" id="thyOmniOpenSequence" style="position:fixed;right:14px;bottom:calc(14px + env(safe-area-inset-bottom));z-index:120;border:1px solid #b28a3d;background:#17120b;color:#fff;border-radius:999px;padding:11px 15px;font-weight:800">SEQUENCE</button>';
      doc.body.appendChild(entry);
    }
    $('thyOmniOpenContext').onclick = () => open('CONTEXT');
    $('thyOmniOpenSequence').onclick = () => open('SEQUENCE');

    doc.addEventListener('keydown', (e) => { if (e.key === 'Escape' && panel.classList.contains('open')) close(); });
    return true;
  };

  return api;
});
