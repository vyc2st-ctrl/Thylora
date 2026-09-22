/* THYLORA · OMNIVIEW surface delta
 * Work: THY-WORK-OMNIVIEW-ROUNDTRIP-587 / THY-WORK-SEQUENCE-CHANGE-LEDGER-587
 *
 * This is a DELTA on the existing dashboard and app. It builds no second
 * dashboard: it adds two surfaces — CONTEXT and SEQUENCE — into whatever host
 * page it is loaded into, using that page's own visual language.
 *
 * It reads the OMNIVIEW read model through PostgREST RPC. Until the pack in
 * db/omniview/ is applied to the backend of record, every read comes back
 * "NOT YET APPLIED" with the apply path, never as a broken surface.
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

  const MARK = 'THY-OMNIVIEW-SURFACE-588';
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
    return 'ERROR';
  }

  function stateMessage(state) {
    if (state === 'NOT_APPLIED') {
      return 'OMNIVIEW is not applied to the backend of record yet. Apply ' + APPLY_PATH
        + ' to thylora-dash, then reopen this surface. Nothing else on this dashboard is affected.';
    }
    if (state === 'SIGNED_OUT') return 'Sign in first. CONTEXT and SEQUENCE read protected rows.';
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

  // The eleven fields a gate rule carries, in the order the gate law names them.
  // Used only as a fallback: when the payload carries field_order, that wins, so
  // the surface can never quietly reorder the law it is displaying.
  const GATE_FIELDS = ['SCOPE', 'AUTHORITY', 'EVIDENCE', 'CONTEXT', 'TRIGGER',
    'STATE', 'EXCEPTION', 'VERSION', 'SUPERSEDES', 'READBACK', 'NEXT_REVIEW'];

  function gateFieldOrder(read) {
    const order = read && Array.isArray(read.field_order) ? read.field_order : null;
    return order && order.length ? order : GATE_FIELDS;
  }

  // A gate rendered as label/value pairs. A field the backend did not send is
  // shown as "not stated" rather than dropped: a missing field of a gate rule is
  // information, not an empty space.
  function gateView(gate, order) {
    return (order || GATE_FIELDS).map((key) => [
      key.replace(/_/g, ' '),
      gate && gate[key] != null && gate[key] !== '' ? gate[key] : 'not stated'
    ]);
  }

  // BLOCKED and OPEN read as live; settled states read as settled. RETIRED is
  // neither — it is shown plainly so a retired rule is never mistaken for a pass.
  function gateSeverity(state) {
    if (state === 'BLOCKED' || state === 'OPEN' || state === 'HELD') return 'open';
    if (state === 'PASSED' || state === 'WAIVED') return 'good';
    return '';
  }

  // The next question queue, already ordered by the backend. The surface keeps
  // that order and shows where each item came from, so a topic curiosity can
  // never be displayed above a blocking gate.
  function nextQuestionRows(read) {
    const queue = read && Array.isArray(read.queue) ? read.queue : [];
    return queue.map((q) => ({
      source: q.source || 'UNKNOWN',
      ref: q.ref || '',
      topic_key: q.topic_key || null,
      question: q.question || '',
      why_it_matters: q.why_it_matters || '',
      blocking: q.source === 'GATE'
    }));
  }

  const api = {
    MARK, LEDGER_COLUMNS, PATH_SECTIONS, GATE_FIELDS,
    esc, normalizeKey, orderSections, partitionStatements,
    readState, stateMessage, sequenceView, qyrisLines,
    gateFieldOrder, gateView, gateSeverity, nextQuestionRows
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
      '.thy-omni-panel{position:fixed;inset:0;z-index:95;background:#080d14;display:none;flex-direction:column}',
      '.thy-omni-panel.open{display:flex}',
      '.thy-omni-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:calc(14px + env(safe-area-inset-top)) 16px 13px;border-bottom:1px solid #293342;background:#0b1119;flex:none}',
      '.thy-omni-head strong{font-size:17px;letter-spacing:.06em}',
      '.thy-omni-tabs{display:flex;gap:8px;padding:11px 16px;border-bottom:1px solid #1e2734;flex:none;flex-wrap:wrap}',
      '.thy-omni-tabs button{border:1px solid #303b49;background:#101823;color:#f4efe6;border-radius:999px;padding:8px 14px;font-weight:750}',
      '.thy-omni-tabs button.active{background:#6d4f18;border-color:#a0792d}',
      '.thy-omni-body{flex:1;min-height:0;overflow:auto;padding:14px;-webkit-overflow-scrolling:touch}',
      '.thy-omni-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:10px}',
      '.thy-omni-card{border:1px solid #26313e;background:#0b121a;border-radius:13px;padding:12px;text-align:left;width:100%;color:#f4efe6}',
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
      + '<button type="button" id="thyOmniTabGates">GATES</button>'
      + '<button type="button" id="thyOmniTabNext">NEXT</button>'
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

    const SUBTITLE = {
      CONTEXT: 'Current state, then the history behind it.',
      SEQUENCE: 'Every sequence: what changed, why, on whose authority.',
      GATES: 'The rule in force for every gate, blocking ones first.',
      NEXT: 'One question, chosen by what is actually blocking.'
    };
    const LOADER = {
      CONTEXT: () => loadContext(),
      SEQUENCE: () => loadLedger(),
      GATES: () => loadGates(),
      NEXT: () => loadNext()
    };

    function open(which) {
      view = which || view;
      $('thyOmniTabContext').classList.toggle('active', view === 'CONTEXT');
      $('thyOmniTabSequence').classList.toggle('active', view === 'SEQUENCE');
      $('thyOmniTabGates').classList.toggle('active', view === 'GATES');
      $('thyOmniTabNext').classList.toggle('active', view === 'NEXT');
      panel.classList.add('open');
      $('thyOmniTitle').textContent = view === 'NEXT' ? 'NEXT QUESTION' : view;
      $('thyOmniSub').textContent = SUBTITLE[view] || '';
      const drawer = $('drawer');
      if (drawer) drawer.classList.remove('open');
      return (LOADER[view] || LOADER.CONTEXT)();
    }

    function close() { panel.classList.remove('open'); }

    async function loadContext() {
      note('Reading the current state manifest…');
      let read;
      try { read = await rpc('thy_omniview_manifest', { p_delta_limit: 8 }); }
      catch (e) { const s = readState(e); return note(stateMessage(s) + (s === 'ERROR' ? ' ' + (e.message || '') : ''), s !== 'NOT_APPLIED'); }

      const topics = read.topic_manifest || [];
      body.innerHTML =
        '<div class="thy-omni-step">TOPIC MANIFEST · head ' + esc(read.sequence_head) + '</div>'
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
        body.innerHTML = '<button type="button" class="thy-omni-back" id="thyOmniBack">← All topics</button>'
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

    // CURRENT GATES. Reads the gate law directly, so what is shown is the rule in
    // force and not a cached summary of it.
    async function loadGates() {
      note('Reading the gates in force\u2026');
      let read;
      try { read = await rpc('thy_gate_law_readback', {}); }
      catch (e) { const st = readState(e); return note(stateMessage(st) + (st === 'ERROR' ? ' ' + (e.message || '') : ''), st !== 'NOT_APPLIED'); }

      const order = gateFieldOrder(read);
      const gates = read.gates || [];
      const counts = read.counts || {};
      const due = read.review_due || [];

      body.innerHTML =
        '<div class="thy-omni-step">CURRENT GATES</div>'
        + '<div class="thy-omni-row">'
        + '<span class="thy-omni-pill' + (Number(counts.blocked) ? ' open' : ' good') + '">' + esc(counts.blocked || 0) + ' blocked</span>'
        + '<span class="thy-omni-pill' + (Number(counts.open) ? ' open' : ' good') + '">' + esc(counts.open || 0) + ' open</span>'
        + '<span class="thy-omni-pill good">' + esc(counts.settled || 0) + ' settled</span>'
        + '<div class="m" style="margin-top:8px">' + esc((read.law || []).join(' \u00b7 ')) + '</div></div>'
        + (due.length
          ? '<div class="thy-omni-step">REVIEW OVERDUE</div>'
            + due.map((d) => '<div class="thy-omni-row"><b>' + esc(d.GATE) + '</b> version ' + esc(d.VERSION)
              + '<div class="m">due ' + esc(d.NEXT_REVIEW) + '</div></div>').join('')
          : '')
        + (gates.length ? gates.map((g) =>
          '<div class="thy-omni-step">' + esc(g.GATE) + ' \u00b7 version ' + esc(g.VERSION) + '</div>'
          + '<div class="thy-omni-row">'
          + '<span class="thy-omni-pill ' + gateSeverity(g.STATE) + '">' + esc(g.STATE) + '</span>'
          + '<div class="thy-omni-kv" style="margin-top:8px">'
          + gateView(g, order).map((kv) => '<b>' + esc(kv[0]) + '</b><span>' + esc(kv[1]) + '</span>').join('')
          + '</div></div>').join('')
          : '<div class="thy-omni-note">No gate is declared. An undeclared gate is not a passed one.</div>');
    }

    // NEXT QUESTION. The order comes from the backend and is not re-sorted here.
    async function loadNext() {
      note('Reading what is actually blocking\u2026');
      let read;
      try { read = await rpc('thy_spine_next_question', { p_limit: 8 }); }
      catch (e) { const st = readState(e); return note(stateMessage(st) + (st === 'ERROR' ? ' ' + (e.message || '') : ''), st !== 'NOT_APPLIED'); }

      const top = read.next_question || {};
      const rows = nextQuestionRows(read);
      const notRead = read.not_read || [];

      body.innerHTML =
        '<div class="thy-omni-step">NEXT QUESTION</div>'
        + '<div class="thy-omni-row"><b>' + esc(top.question || '') + '</b>'
        + '<div class="m" style="margin-top:8px">' + esc(top.source || '') + (top.ref ? ' \u00b7 ' + esc(top.ref) : '') + '</div>'
        + (top.why_it_matters ? '<div class="m" style="margin-top:6px">' + esc(top.why_it_matters) + '</div>' : '')
        + '</div>'
        + '<div class="thy-omni-step">QUEUE \u00b7 ' + esc(read.total || 0) + ' open</div>'
        + (rows.length ? rows.map((q) =>
          (q.topic_key
            ? '<button type="button" class="thy-omni-card" data-omni-topic="' + esc(q.topic_key) + '" style="margin-bottom:8px">'
            : '<div class="thy-omni-row">')
          + '<span class="thy-omni-pill' + (q.blocking ? ' open' : '') + '">' + esc(q.source) + '</span>'
          + (q.ref ? '<span class="thy-omni-pill">' + esc(q.ref) + '</span>' : '')
          + '<div style="margin-top:7px">' + esc(q.question) + '</div>'
          + (q.why_it_matters ? '<div class="m" style="margin-top:6px">' + esc(q.why_it_matters) + '</div>' : '')
          + (q.topic_key ? '</button>' : '</div>')).join('')
          : '<div class="thy-omni-note">Nothing is queued.</div>')
        + '<div class="thy-omni-note" style="margin-top:12px">' + esc(read.ordering || '') + '</div>'
        + (notRead.length
          ? '<div class="thy-omni-step">NOT READ</div>'
            + notRead.map((n) => '<div class="thy-omni-row sup">' + esc(n) + '</div>').join('')
          : '');

      doc.querySelectorAll('[data-omni-topic]').forEach((b) => {
        b.onclick = () => { view = 'CONTEXT'; open('CONTEXT').then(() => loadTopic(b.dataset.omniTopic)); };
      });
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

    $('thyOmniClose').onclick = close;
    $('thyOmniTabContext').onclick = () => open('CONTEXT');
    $('thyOmniTabSequence').onclick = () => open('SEQUENCE');
    $('thyOmniTabGates').onclick = () => open('GATES');
    $('thyOmniTabNext').onclick = () => open('NEXT');
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
        + '<button type="button" class="nav-btn" id="thyOmniOpenGates"><b>GATES</b><div class="sub">The rule in force, blocking ones first</div></button>'
        + '<button type="button" class="nav-btn" id="thyOmniOpenNext"><b>NEXT QUESTION</b><div class="sub">What is actually blocking</div></button>'
        + '</div>';
      drawerBody.insertBefore(entry, drawerBody.firstChild);
    } else {
      const pill = (id, label, bottom) => '<button type="button" id="' + id + '" style="position:fixed;right:14px;bottom:calc('
        + bottom + 'px + env(safe-area-inset-bottom));z-index:120;border:1px solid #b28a3d;background:#17120b;color:#fff;border-radius:999px;padding:11px 15px;font-weight:800">'
        + label + '</button>';
      entry.innerHTML = pill('thyOmniOpenContext', 'CONTEXT', 200)
        + pill('thyOmniOpenSequence', 'SEQUENCE', 138)
        + pill('thyOmniOpenGates', 'GATES', 76)
        + pill('thyOmniOpenNext', 'NEXT', 14);
      doc.body.appendChild(entry);
    }
    $('thyOmniOpenContext').onclick = () => open('CONTEXT');
    $('thyOmniOpenSequence').onclick = () => open('SEQUENCE');
    $('thyOmniOpenGates').onclick = () => open('GATES');
    $('thyOmniOpenNext').onclick = () => open('NEXT');

    doc.addEventListener('keydown', (e) => { if (e.key === 'Escape' && panel.classList.contains('open')) close(); });
    return true;
  };

  return api;
});
