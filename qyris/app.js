// THYLORA · QYRIS surface
// Workroom: WR-QYRIS-585
//
// Visible QYRIS. Every question, the live stopping rule, the industry
// projection, the Trusted Six register and the SR test bench all run here from
// the same modules the tests and the SQL generator use. Nothing on this page is
// a mock-up of the model — it is the model.

import {
  DELTAS, DELTA_MEANING, STOPPING_RULE, Pass, flatten, walk, validatePack,
} from './lib/grammar.js';
import { PREMARRIAGE_PACK, PACK_TITLE } from './data/premarriage-pack.js';
import { DOMAIN_IDS, DOMAINS, projectDomain, projectionReport } from './lib/industry.js';
import {
  ROLE_FAMILIES, ROLE_FAMILY_IDS, MECHANISMS, FICTION_NOTICE, NEVER_SCOPES,
  SupportRegister, SupportError, TRUSTED_SEAT_LIMIT, permittedScopes,
} from './lib/support.js';
import { runBattery, CANON_NOTE, FACTOR_MEANING, FACTORS, srReport } from './lib/sr.js';
import { runProbes } from './lib/backend.js';

const $ = (id) => document.getElementById(id);
const esc = (value) => String(value ?? '').replace(/[&<>'"]/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));

validatePack(PREMARRIAGE_PACK);

// ── Navigation ─────────────────────────────────────────────────────────
function showView(id) {
  const target = document.getElementById(id) ? id : 'pack';
  document.querySelectorAll('.view').forEach((view) => view.classList.toggle('active-view', view.id === target));
  document.querySelectorAll('[data-view]').forEach((button) => button.classList.toggle('active', button.dataset.view === target));
  history.replaceState(null, '', `#${target}`);
}
document.querySelectorAll('[data-view]').forEach((button) => {
  button.addEventListener('click', () => showView(button.dataset.view));
});

// ── Rendering one QYRIS node ───────────────────────────────────────────
function deltaChips(moves) {
  return `<div class="deltas">${moves.map((delta) => `<span class="delta ${delta}" title="${esc(DELTA_MEANING[delta])}">${delta}</span>`).join('')}</div>`;
}

function fieldRows(node) {
  const rows = [
    ['YIELD', node.yield, ''],
    ['REASON', node.reason, ''],
    ['INSPECT', node.inspect, ''],
    ['SAFEGUARD', node.safeguard, 'safeguard'],
  ];
  return rows.map(([label, value, cls]) =>
    `<div class="field ${cls}"><b>${label}</b><span>${esc(value)}</span></div>`).join('');
}

function renderNode(node, depth = 0, extra = '') {
  const children = node.children ?? [];
  const label = node.label ? `<span class="node-label">${esc(node.label)}</span>` : '';
  return `
    <div class="node" data-depth="${depth}" data-node="${esc(node.id)}" data-moves="${node.moves.join(',')}">
      <button type="button" class="node-head" data-toggle="${esc(node.id)}">
        <span class="caret">▸</span>
        <span class="qtext">${label}${esc(node.question)}</span>
      </button>
      <div class="node-body">
        ${fieldRows(node)}
        ${extra}
        ${deltaChips(node.moves)}
      </div>
      ${children.length ? `<div class="node-children">${children.map((child) => renderNode(child, depth + 1)).join('')}</div>` : ''}
    </div>`;
}

function wireToggles(root) {
  root.querySelectorAll('[data-toggle]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const node = button.closest('.node');
      node.classList.toggle('open');
      button.querySelector('.caret').textContent = node.classList.contains('open') ? '▾' : '▸';
    });
  });
}

// ── A · the pre-marriage pack ──────────────────────────────────────────
function renderPack() {
  const entries = flatten(PREMARRIAGE_PACK);
  const byDepth = entries.reduce((acc, entry) => {
    acc[entry.depth] = (acc[entry.depth] ?? 0) + 1;
    return acc;
  }, {});
  $('packSummary').textContent =
    `${PACK_TITLE} — ${PREMARRIAGE_PACK.length} clusters, ${entries.length} questions `
    + `(${byDepth[0]} cluster roots, ${byDepth[1]} children, ${byDepth[2] ?? 0} grandchildren). `
    + 'Open any question to see its YIELD, REASON, INSPECT and SAFEGUARD, and the deltas it moves.';
  $('packNotice').textContent =
    'This is a question pack, not advice, not a contract, and not a substitute for a lawyer, a clinician '
    + 'or a counsellor. Every SAFEGUARD line exists because the question above it can be misused — by a '
    + 'partner, by a family, or by the pack itself.';
  const tree = $('packTree');
  tree.innerHTML = PREMARRIAGE_PACK.map((cluster) => renderNode(cluster, 0)).join('');
  wireToggles(tree);
}

function applyDeltaFilter(value) {
  document.querySelectorAll('#packTree .node').forEach((node) => {
    if (!value) { node.style.display = ''; return; }
    const moves = (node.dataset.moves ?? '').split(',');
    const selfMatch = moves.includes(value);
    const childMatch = node.querySelector(`.node[data-moves*="${value}"]`) !== null;
    node.style.display = selfMatch || childMatch ? '' : 'none';
  });
}

$('expandAll').addEventListener('click', () => {
  document.querySelectorAll('#packTree .node').forEach((node) => {
    node.classList.add('open');
    node.querySelector('.caret').textContent = '▾';
  });
});
$('collapseAll').addEventListener('click', () => {
  document.querySelectorAll('#packTree .node').forEach((node) => {
    node.classList.remove('open');
    node.querySelector('.caret').textContent = '▸';
  });
});
$('deltaFilter').addEventListener('change', (event) => applyDeltaFilter(event.target.value));

// ── The live pass ──────────────────────────────────────────────────────
let pass = null;

function startPass(scope) {
  pass = new Pass(PREMARRIAGE_PACK, scope ? { scope: [scope] } : {});
  renderPass();
}

function renderPass() {
  const report = pass.report();
  $('passState').innerHTML = `
    <span class="state-badge ${report.state}">${report.state.replace('_', ' ')}</span>
    <div class="state-line"><b>Frontier</b><span>OPEN — always</span></div>
    <div class="state-line"><b>Globally finished</b><span>never</span></div>
    <div class="state-line"><b>Answered</b><span>${report.answered} of ${report.inScope} in scope</span></div>
    <div class="state-line"><b>Settled deltas</b><span>${report.settledDeltas.join(', ') || '—'}</span></div>
    <div class="state-line"><b>Unsettled deltas</b><span>${report.unsettledDeltas.join(', ') || '—'}</span></div>
    <p class="muted" style="margin-top:10px;font-size:.84rem">${esc(report.pauseReason ?? STOPPING_RULE.text)}</p>`;

  const frontier = $('passFrontier');
  if (!report.liveQuestions.length) {
    frontier.innerHTML =
      '<div class="empty"><b>Pass paused.</b> No remaining question in scope would change ACTION, '
      + 'EVIDENCE, RISK, AUTHORITY or TRANSFER. The frontier stays open — disturb a delta and it resumes.</div>';
  } else {
    frontier.innerHTML = report.liveQuestions.map((entry) => `
      <button type="button" data-answer="${esc(entry.id)}">
        ${esc(entry.question)}
        <div class="deltas">${entry.moves.map((delta) => `<span class="delta ${delta}">${delta}</span>`).join('')}</div>
      </button>`).join('');
    frontier.querySelectorAll('[data-answer]').forEach((button) => {
      button.addEventListener('click', () => {
        pass.answer(button.dataset.answer, 'Answered from the QYRIS surface.');
        renderPass();
      });
    });
  }

  $('passTrail').innerHTML = pass.trail.length
    ? [...pass.trail].reverse().map((entry) => (entry.event === 'ANSWERED'
      ? `<div class="entry ok"><b>ANSWERED</b> ${esc(entry.nodeId)} — settled ${entry.moves.join(', ')}</div>`
      : `<div class="entry warn"><b>DISTURBED</b> ${esc(entry.delta)} — ${esc(entry.cause)}</div>`)).join('')
    : '<div class="entry info">Nothing answered yet. Every question below is live.</div>';
}

$('passScope').innerHTML = '<option value="">All sixteen clusters</option>'
  + PREMARRIAGE_PACK.map((cluster) => `<option value="${esc(cluster.id)}">${esc(cluster.label)}</option>`).join('');
$('passScope').addEventListener('change', (event) => startPass(event.target.value));
$('passReset').addEventListener('click', () => startPass($('passScope').value));

$('disturbButtons').innerHTML = DELTAS.map((delta) =>
  `<button type="button" class="ghost" data-disturb="${delta}" title="${esc(DELTA_MEANING[delta])}">${delta}</button>`).join('');
$('disturbButtons').querySelectorAll('[data-disturb]').forEach((button) => {
  button.addEventListener('click', () => {
    pass.disturb(button.dataset.disturb, 'A new fact arrived that unsettles this.');
    renderPass();
  });
});

// ── B · the industry template ──────────────────────────────────────────
let currentDomain = DOMAIN_IDS[0];

function renderIndustry() {
  const report = projectionReport();
  $('industrySummary').textContent =
    `${report.axes} axes × ${report.domains} domains = ${report.nodes} domain-specific questions, `
    + `${report.fields} QYRIS fields in total. ${report.mechanical} fields (${Math.round(report.mechanicalShare * 100)}%) `
    + 'are produced by the grammar from the axis invariant plus the domain lexicon; the rest had to be written.';
  $('provenanceNote').textContent = report.note;

  $('domainButtons').innerHTML = DOMAIN_IDS.map((id) =>
    `<button type="button" class="${id === currentDomain ? '' : 'ghost'}" data-domain="${id}">${esc(DOMAINS[id].label)}</button>`).join('');
  $('domainButtons').querySelectorAll('[data-domain]').forEach((button) => {
    button.addEventListener('click', () => { currentDomain = button.dataset.domain; renderIndustry(); });
  });

  const nodes = projectDomain(currentDomain);
  const list = $('industryList');
  list.innerHTML = nodes.map((node) => {
    const provenance = Object.entries(node.provenance)
      .map(([field, state]) => `<span class="prov ${state}">${field.toUpperCase()} ${state}</span>`).join(' ');
    const extra = `<div class="field"><b>INVARIANT</b><span>${esc(node.invariant)}</span></div>`
      + `<div class="deltas" style="margin-top:8px">${provenance}</div>`;
    return renderNode(node, 0, extra);
  }).join('');
  wireToggles(list);
}

// ── C · Trusted Six ────────────────────────────────────────────────────
let register = null;

function renderSupportStatic() {
  $('fictionNotice').textContent = FICTION_NOTICE;
  $('mechanismGrid').innerHTML = MECHANISMS.map((mechanism, index) =>
    `<article><h3>${index + 1} · ${esc(mechanism.id.replace(/_/g, ' '))}</h3><p>${esc(mechanism.line)}</p></article>`).join('');
  $('familyGrid').innerHTML = ROLE_FAMILY_IDS.map((id) => {
    const family = ROLE_FAMILIES[id];
    return `<article>
      <h3>${esc(family.label)}</h3>
      <p>${esc(family.purpose)}</p>
      <p style="margin-top:8px"><b style="color:var(--gold);font-size:.68rem;letter-spacing:.1em">MAY HOLD</b><br>${permittedScopes(id).map((scope) => esc(scope)).join(' · ')}</p>
      <p style="margin-top:8px"><b style="color:var(--green);font-size:.68rem;letter-spacing:.1em">ROUTES OUT TO</b><br>${esc(family.routesOutTo)}</p>
    </article>`;
  }).join('');
}

const SEATING = [
  ['TS1', 'LEARNING_SUPPORT'], ['TS2', 'SAFETY'], ['TS3', 'SECURITY'],
  ['TS4', 'NUTRITION_LITERACY'], ['TS5', 'FINANCIAL_LITERACY'], ['TS6', 'LANGUAGE'],
];

const registerLog = [];
function log(kind, text) { registerLog.push({ kind, text }); }

function resetRegister() {
  registerLog.length = 0;
  register = new SupportRegister('HH-SURFACE');
  SEATING.forEach(([seatId, familyId], index) => {
    register.seat({ seatId, familyId, personRef: `person-${index + 1}`, engagedBy: 'household-owner', paidRate: 2000 + index * 100 });
  });
  log('ok', `Seated the Trusted Six — ${SEATING.length} of ${TRUSTED_SEAT_LIMIT} seats active.`);
  renderRegister();
}

const ACTIONS = [
  {
    id: 'seventh', label: 'Try a seventh seat', run() {
      try {
        register.seat({ seatId: 'TS7', familyId: 'LIFE_SKILLS', personRef: 'person-7', engagedBy: 'household-owner' });
        log('bad', 'A seventh seat was accepted. The limit is not a limit.');
      } catch (error) { log('warn', `Refused — ${error.message}`); }
    },
  },
  {
    id: 'grant', label: 'Grant scoped access', run() {
      const expires = new Date(Date.now() + 30 * 86400000).toISOString();
      const grant = register.grantAccess({
        seatId: 'TS1', scope: 'LEARNING_RECORD',
        purpose: 'Read the school correspondence for MATTER-1', grantedBy: 'household-owner', expiresAt: expires,
      });
      log('ok', `Granted ${grant.scope} to TS1 until ${expires.slice(0, 10)} — purpose named, revocable without a reason.`);
    },
  },
  {
    id: 'forbidden', label: 'Try a forbidden scope', run() {
      try {
        register.grantAccess({
          seatId: 'TS5', scope: 'MONEY_MOVEMENT', purpose: 'Just to make the budget easier',
          grantedBy: 'household-owner', expiresAt: new Date(Date.now() + 86400000).toISOString(),
        });
        log('bad', 'A never-grantable scope was granted.');
      } catch (error) { log('warn', `Refused — ${error.message}`); }
    },
  },
  {
    id: 'draw', label: 'Draw company resources', run() {
      const result = register.requestDraw({
        seatId: 'TS1', resource: 'Reading books', purpose: 'Books for the learner to keep at home',
        missionBasis: 'Learning support for a household inside the programme',
        amountMinor: 5000, cap: 10000, approvedBy: 'steward-1', matterId: 'MATTER-1',
      });
      if (result.approved) {
        log('ok', `Draw ${result.draw.drawId} approved — 5000 against a cap of 10000, approver is not the requester.`);
        const closed = register.closeDraw({ drawId: result.draw.drawId, receiptRef: 'RCPT-1', spentMinor: 4200, closedBy: 'steward-1' });
        log('ok', `Draw closed with receipt RCPT-1 — 4200 spent, ${closed.draw.returnedMinor} returned.`);
      } else {
        log('warn', `Draw refused — ${result.blockers.map((blocker) => blocker.code).join(', ')}`);
      }
    },
  },
  {
    id: 'selfapprove', label: 'Try a self-approved draw', run() {
      const result = register.requestDraw({
        seatId: 'TS2', resource: 'Smoke alarms', purpose: 'Replace the alarms found dead in the survey',
        missionBasis: 'Household safety inside the programme',
        amountMinor: 3000, cap: 6000, approvedBy: 'person-2',
      });
      log(result.approved ? 'bad' : 'warn',
        result.approved ? 'A self-approved draw was accepted.' : `Refused — ${result.blockers.map((b) => b.code).join(', ')}`);
    },
  },
  {
    id: 'conflict', label: 'Declare, then clear a conflict', run() {
      const conflict = register.declareConflict({
        seatId: 'TS2', matterId: 'MATTER-2', nature: 'The contractor quoting for the repair is my brother',
      });
      log('ok', `Conflict ${conflict.coiId} declared before acting — declaring is always the cheaper move.`);
      register.clearConflict({ coiId: conflict.coiId, clearedBy: 'household-owner', condition: 'A second quote is obtained from an unrelated trade' });
      log('ok', 'Cleared by someone other than the seat holder, with the condition recorded.');
    },
  },
  {
    id: 'undeclared', label: 'Discover an undeclared conflict', run() {
      const result = register.discoverUndeclaredConflict({
        seatId: 'TS5', matterId: 'MATTER-3', nature: 'Holds a referral fee arrangement with the lender discussed',
        foundBy: 'household-owner',
      });
      log('warn', `Discovered rather than declared — recorded as ${result.breach.category} (${result.breach.severity}), seat suspended on record.`);
    },
  },
  {
    id: 'standdown', label: 'Stand down from a matter', run() {
      const record = register.selfDisqualify({
        seatId: 'TS3', matterId: 'MATTER-4', reason: 'I am too close to this one', mandatory: false,
      });
      log('ok', `Stood down from ${record.matterId} — penalty ${record.penalty}, standing ${record.standing}. No reason was required.`);
    },
  },
  {
    id: 'critical', label: 'Record a critical breach', run() {
      const breach = register.recordBreach({
        seatId: 'TS6', category: 'SURVEILLANCE',
        detail: 'Installed a camera covering a bedroom door', raisedBy: 'household-owner',
      });
      log('bad', `${breach.category} (${breach.severity}) — effect ${breach.effect} applied on record, before any review. Restorable: ${breach.restorable}.`);
    },
  },
  {
    id: 'restore', label: 'Try to restore the critical breach', run() {
      const breach = register.breaches.find((candidate) => candidate.category === 'SURVEILLANCE');
      if (!breach) { log('info', 'Record the critical breach first.'); return; }
      const check = register.restorationCheck({
        seatId: breach.seatId, breachId: breach.breachId, elapsedDays: 100000,
        acknowledged: true, independentReview: true, harmedPartyNotified: true, remedyCompleted: true,
      });
      log('warn', `Restoration refused even with everything else met — ${check.blockers.map((blocker) => blocker.code).join(', ')}.`);
      const appeal = register.appeal({
        breachId: breach.breachId, by: 'person-6',
        grounds: 'The camera was installed by the previous tenant and the invoice shows the date',
        reviewer: 'reviewer-x',
      });
      log('ok', `Appeal ${appeal.appealId} opened — the appeal challenges the finding, which stays available even where restoration is not.`);
    },
  },
  {
    id: 'overturn', label: 'Overturn on appeal', run() {
      const appeal = register.appeals.find((candidate) => candidate.state === 'OPEN');
      if (!appeal) { log('info', 'Open an appeal first.'); return; }
      register.decideAppeal({
        appealId: appeal.appealId, outcome: 'OVERTURNED', decidedBy: 'reviewer-x',
        reasoning: 'Invoice and tenancy record confirm the camera predates this engagement',
      });
      log('ok', 'Finding overturned and the seat reinstated. Both the finding and the reinstatement stay in the trail.');
    },
  },
  {
    id: 'tamper', label: 'Try to edit the audit trail', run() {
      const before = register.audit.length;
      register.audit.correct(1, 'Wanted to remove an entry');
      log('warn', `The trail cannot be edited. A correction appended instead — ${before} entries became ${register.audit.length}, nothing was removed.`);
    },
  },
  { id: 'reset', label: 'Reset register', run: resetRegister },
];

function renderRegister() {
  const snapshot = register.snapshot();
  const states = snapshot.seats.reduce((acc, seat) => {
    acc[seat.state] = (acc[seat.state] ?? 0) + 1;
    return acc;
  }, {});
  $('registerState').innerHTML = `
    <div class="state-line"><b>Household</b><span>${esc(snapshot.householdId)}</span></div>
    <div class="state-line"><b>Seats</b><span>${snapshot.activeSeats} active of ${snapshot.seatLimit}</span></div>
    <div class="state-line"><b>Seat states</b><span>${Object.entries(states).map(([state, n]) => `${state} ${n}`).join(' · ')}</span></div>
    <div class="state-line"><b>Decision rights</b><span>NONE — on every seat, always</span></div>
    <div class="state-line"><b>Active grants</b><span>${register.activeGrants().length}</span></div>
    <div class="state-line"><b>Open draws</b><span>${register.openDraws().length}</span></div>
    <div class="state-line"><b>Breaches</b><span>${snapshot.breaches.length}</span></div>
    <div class="state-line"><b>Conflicts</b><span>${snapshot.conflicts.length}</span></div>
    <div class="state-line"><b>Stand-downs</b><span>${snapshot.disqualifications.length}</span></div>
    <div class="state-line"><b>Audit entries</b><span>${snapshot.auditLength}</span></div>
    <p class="muted" style="margin-top:10px;font-size:.82rem">
      Never grantable to any seat, in any family, under any approval:
      ${NEVER_SCOPES.join(' · ')}</p>`;

  $('registerTrail').innerHTML = [...registerLog].reverse()
    .map((entry) => `<div class="entry ${entry.kind}">${esc(entry.text)}</div>`).join('')
    || '<div class="entry info">Nothing yet.</div>';
}

$('registerButtons').innerHTML = ACTIONS.map((action) =>
  `<button type="button" class="${action.id === 'reset' ? 'ghost' : ''}" data-action="${action.id}">${esc(action.label)}</button>`).join('');
$('registerButtons').querySelectorAll('[data-action]').forEach((button) => {
  button.addEventListener('click', () => {
    const action = ACTIONS.find((candidate) => candidate.id === button.dataset.action);
    try { action.run(); } catch (error) {
      log(error instanceof SupportError ? 'warn' : 'bad', `Refused — ${error.message}`);
    }
    renderRegister();
  });
});

// ── SR test bench ──────────────────────────────────────────────────────
function renderSrStatic() {
  $('srCanonNotice').textContent = CANON_NOTE;
  $('srFactorGrid').innerHTML = FACTORS.map((factor) => {
    const [name, description] = FACTOR_MEANING[factor].split(' — ');
    return `<article><h3>${factor} · ${esc(name)}</h3><p>${esc(description)}</p></article>`;
  }).join('');
  $('srRecommendation').innerHTML =
    '<strong>Before the battery runs</strong>'
    + '<p class="muted">The candidate is implemented exactly as proposed. Nothing on this page uses it to '
    + 'decide anything. Press the button and read what it does.</p>';
}

$('runBattery').addEventListener('click', () => {
  const battery = runBattery();
  $('srResults').innerHTML = battery.tests.map((test) => `
    <div class="test ${test.pass ? 'pass' : ''}">
      <h3><span>${test.id} · ${esc(test.name.replace(/_/g, ' '))}</span><span class="verdict">${test.pass ? 'PASS' : 'DEFECT'}</span></h3>
      <p>${esc(test.finding)}</p>
    </div>`).join('');

  const example = srReport({ N: 0.9, E: 0.4, S: 0.95, A: 1, C: 'UNKNOWN', R: 0.9 });
  $('srRecommendation').innerHTML = `
    <strong>${esc(battery.equation)} — ${battery.passed} of ${battery.tested} tests passed</strong>
    <p class="muted">${esc(battery.recommendation)}</p>
    <p class="muted" style="margin-top:10px"><b style="color:var(--gold)">WHAT IS PUBLISHED INSTEAD</b><br>
      The vector and the binding constraint, with UNKNOWN carried as UNKNOWN:</p>
    <pre style="margin:8px 0 0;padding:10px;background:#0a0f16;border:1px solid var(--line);border-radius:8px;font-size:.76rem;overflow-x:auto">${esc(JSON.stringify(example, null, 2))}</pre>`;
});

// ── Readback ───────────────────────────────────────────────────────────
function localReadback() {
  const checks = [];
  const entries = flatten(PREMARRIAGE_PACK);

  const rendered = document.querySelectorAll('#packTree .node').length;
  checks.push({
    name: 'Every question in the source of truth is rendered on this page',
    expected: entries.length, observed: rendered,
  });

  const safeguards = entries.filter((entry) => (entry.node.safeguard ?? '').trim().length >= 8).length;
  checks.push({ name: 'Every question carries a SAFEGUARD', expected: entries.length, observed: safeguards });

  const withDelta = entries.filter((entry) => entry.node.moves.length > 0).length;
  checks.push({ name: 'Every question declares at least one delta', expected: entries.length, observed: withDelta });

  const industry = projectionReport();
  checks.push({
    name: 'Industry projection produces axes × domains questions',
    expected: industry.axes * industry.domains,
    observed: industry.nodes,
  });
  // The industry list shows one domain at a time, so the honest comparison is
  // against that domain's axis count, not against the whole projection.
  checks.push({
    name: `Every axis of the open domain (${currentDomain}) is rendered`,
    expected: industry.axes,
    observed: document.querySelectorAll('#industryList .node').length,
  });

  const clusters = new Set([...walk(PREMARRIAGE_PACK)].map((entry) => entry.clusterId)).size;
  checks.push({ name: 'Clusters', expected: 16, observed: clusters });

  const battery = runBattery();
  checks.push({ name: 'SR candidate is not canon', expected: 'false', observed: String(battery.canon) });
  checks.push({ name: 'SR failure-mode tests failed', expected: 7, observed: battery.failed });

  const paused = new Pass(PREMARRIAGE_PACK, { scope: ['MONEY'] });
  paused.answer('MONEY');
  checks.push({ name: 'A pass with everything settled reports OPEN_PAUSED, never CLOSED', expected: 'OPEN_PAUSED', observed: paused.state() });
  checks.push({ name: 'A disturbed pass resumes', expected: 'OPEN_ACTIVE', observed: (paused.disturb('TRANSFER', 'readback'), paused.state()) });

  $('localReadback').innerHTML = checks.map((check) => {
    const ok = String(check.expected) === String(check.observed);
    return `<div class="entry ${ok ? 'ok' : 'bad'}"><b>${ok ? 'MATCH' : 'MISMATCH'}</b> ${esc(check.name)} — expected ${esc(check.expected)}, read back ${esc(check.observed)}</div>`;
  }).join('');
}

async function backendReadback() {
  const chip = $('backendChip');
  const probe = await runProbes();
  const chipState = { READY: 'ready', PARTIAL: 'partial', NOT_PROVISIONED: 'down' }[probe.state];
  chip.className = `chip ${chipState}`;
  chip.textContent = `BACKEND · ${probe.state.replace('_', ' ')} · ${probe.passed}/${probe.total}`;
  $('probeNote').textContent = probe.state === 'READY'
    ? 'All probes passed. The QYRIS migrations are applied and readable.'
    : 'The QYRIS tables are held for Chairman application. Everything on this page still runs — the pack, '
      + 'the stopping rule, the projection, the register and the SR bench are all local.';
  $('probeList').innerHTML = probe.results.map((result) =>
    `<div class="entry ${result.ok ? 'ok' : 'warn'}"><b>${result.ok ? 'PASS' : 'HELD'}</b> ${esc(result.label)}${result.note ? ` — ${esc(result.note)}` : ''}</div>`).join('');
}

// ── Boot ───────────────────────────────────────────────────────────────
renderPack();
startPass('');
renderIndustry();
renderSupportStatic();
resetRegister();
renderSrStatic();
localReadback();
showView((location.hash || '#pack').slice(1));
backendReadback();
