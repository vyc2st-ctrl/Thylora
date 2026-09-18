// THYLORA · learner surface
// Workroom: WR-MATH-SURFACE-001
//
// The surface renders the model; it does not restate it. Every number shown
// here comes from math-surface/lib, and every spoken line comes from the voice
// registry. Where a line is written into the HTML, this file checks at load
// that it still matches the registry — THY-VOICE-PROMPT-NO-SILENT-MUTATION-001
// applied at runtime as well as in the test suite.

import { WORKED_EXAMPLES, exampleById } from './lib/examples.js';
import { languageLoad, wordsIn, lookup } from './lib/language.js';
import {
  observe, factorsFrom, solveProbability, diagnose, LAYER_NAMES
} from './lib/understanding.js';
import { conceptCards, buildUnderstandingCard, familyReading } from './lib/cards.js';
import { voiceLine, VOICE_LINES, digest } from './lib/continuity.js';
import { localRepository, saveUnderstandingCard, listUnderstandingCards, provisioningState } from './lib/backend.js';

const $ = id => document.getElementById(id);
const repository = localRepository();

const state = {
  example: null,
  observations: [],
  learnerRef: ''
};

// --- voice registry guard ---------------------------------------------------

function verifySurfaceVoice() {
  const problems = [];
  for (const node of document.querySelectorAll('[data-voice]')) {
    const id = node.dataset.voice;
    const registered = voiceLine(id);
    if (!registered) { problems.push(`${id} is not in the voice registry`); continue; }
    if (digest(node.textContent.trim()) !== registered.digest) {
      problems.push(`${id} on this page differs from the registered line`);
    }
  }
  if (problems.length > 0) {
    console.warn('THY-VOICE-PROMPT-NO-SILENT-MUTATION-001:', problems);
  }
  return problems;
}

function say(id, className = 'voice') {
  const line = voiceLine(id);
  if (!line) return '';
  return `<p class="${className}" data-voice="${id}">${escape(line.text)}</p>`;
}

function escape(text) {
  return String(text).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function format(value) {
  if (value === null || value === undefined) return '?';
  if (typeof value === 'boolean') return value ? 'yes' : 'no';
  return Number.isInteger(value) ? String(value) : String(Number(Number(value).toFixed(3)));
}

// --- navigation -------------------------------------------------------------

for (const button of document.querySelectorAll('.tabs button')) {
  button.addEventListener('click', () => {
    for (const b of document.querySelectorAll('.tabs button')) b.classList.toggle('active', b === button);
    for (const view of document.querySelectorAll('.view')) {
      view.classList.toggle('active-view', view.id === button.dataset.view);
    }
    if (button.dataset.view === 'cards') renderCards();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// --- the live equation ------------------------------------------------------

function renderEquation() {
  const factors = factorsFrom(state.observations);
  for (const layer of ['L', 'M', 'S']) {
    const node = $(`fac${layer}`);
    const factor = factors[layer];
    const known = factor.admissible && typeof factor.value === 'number';
    node.textContent = `${layer} = ${known ? format(factor.value) : '?'}`;
    node.classList.toggle('unknown', !known);
    node.title = known
      ? `${LAYER_NAMES[layer]} measured on its own`
      : `${LAYER_NAMES[layer]} has not been looked at on its own yet`;
  }
  const p = solveProbability(factors);
  $('facP').textContent = p.determined
    ? `P_solve = ${format(p.value)}`
    : `P_solve = ? (between ${format(p.bounds.low)} and ${format(p.bounds.high)})`;
}

// --- the problem flow -------------------------------------------------------

function loadExample(id) {
  state.example = exampleById(id);
  state.observations = [];

  const example = state.example;
  const load = languageLoad(example.story);

  $('storyText').innerHTML = highlight(example.story);
  $('loadFill').style.width = `${Math.min(100, load.load * 18)}%`;
  $('loadBand').textContent = load.band;
  $('loadFormula').textContent = load.formula;

  // 1 · language, isolated
  $('langAsk').textContent = example.language.ask;
  renderChoices($('langOptions'), choicesFor(example.language), example.language.accept[0], chosen => {
    record('L', chosen === example.language.accept[0], 'language probe');
    const right = chosen === example.language.accept[0];
    $('langResult').innerHTML = right
      ? `<div class="permit"><b>Read.</b><p>${escape(example.language.trap)}</p></div>`
      : `<div class="refusal"><b>The sentence was in the way.</b><p>${escape(example.language.trap)}</p>${say('VX-L-ZERO', 'voice stop')}</div>`;
    reveal('stepM');
  });
  $('langResult').innerHTML = '';

  // 2 · relationship, isolated
  $('quantities').innerHTML = example.quantities.map(q =>
    `<div><b>${escape(String(q.value))}</b><span>${escape(q.label)}${q.unit ? ` · ${escape(q.unit)}` : ''}</span></div>`
  ).join('');
  $('relAsk').textContent = example.relationship.ask;
  renderChoices($('relOptions'), [...example.relationship.options], example.relationship.answer, chosen => {
    const right = chosen === example.relationship.answer;
    record('M', right, 'relationship probe, quantities supplied');
    $('relResult').innerHTML = right
      ? `<div class="permit"><b>${escape(example.relationship.notation)}</b><p>${escape(example.relationship.why)}</p></div>`
      : `<div class="refusal"><b>Not this one.</b><p>The relationship here is <code>${escape(example.relationship.notation)}</code>. ${escape(example.relationship.why)}</p></div>`;
    reveal('stepS');
  });
  $('relResult').innerHTML = '';

  // 3 · solve, isolated
  $('bareWorking').textContent = example.solve.prompt;
  $('solveInput').value = '';
  $('solveResult').innerHTML = '';

  // 4 · explain back
  $('explainPrompt').textContent = example.explain_back.prompt;
  $('explainInput').value = '';

  for (const id of ['stepM', 'stepS', 'stepX']) $(id).hidden = true;
  $('outcome').innerHTML = '';
  renderEquation();
}

function highlight(story) {
  let html = escape(story);
  for (const word of wordsIn(story)) {
    const entry = lookup(word);
    for (const form of entry.surface_forms) {
      html = html.replace(new RegExp(`\\b(${form})\\b`, 'gi'), '<mark title="a word that decides how this sentence is read">$1</mark>');
    }
  }
  return html;
}

function choicesFor(language) {
  return [language.accept[0], ...language.reject];
}

function renderChoices(container, options, correct, onChoose) {
  const ordered = stableOrder(options);
  container.innerHTML = '';
  for (const option of ordered) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = option;
    button.addEventListener('click', () => {
      for (const b of container.querySelectorAll('button')) {
        b.disabled = true;
        if (b.textContent === correct) b.classList.add('right');
        else if (b === button) b.classList.add('wrong');
      }
      button.classList.add('chosen');
      onChoose(option);
    });
    container.appendChild(button);
  }
}

// Deterministic ordering so the same problem always looks the same,
// without putting the correct answer first every time.
function stableOrder(options) {
  return [...options].sort((a, b) => (digest(a) < digest(b) ? -1 : 1));
}

function record(layer, right, source) {
  state.observations = state.observations.filter(o => o.layer !== layer);
  state.observations.push(observe({
    layer, correct: right ? 1 : 0, attempted: 1, isolated: true, source, at: new Date().toISOString()
  }));
  renderEquation();
}

function reveal(id) {
  $(id).hidden = false;
  $(id).scrollIntoView({ behavior: 'smooth', block: 'start' });
}

$('solveCheck').addEventListener('click', () => {
  const example = state.example;
  const right = checkSolve(example, $('solveInput').value);
  record('S', right, 'bare computation, no words');
  $('solveResult').innerHTML = right
    ? `<div class="permit"><b>The working holds.</b><p>${escape(example.solve.steps.join(' · '))}</p></div>`
    : `<div class="refusal"><b>Not yet.</b><p>${escape(example.solve.steps.join(' · '))}</p></div>`;
  reveal('stepX');
});

export function checkSolve(example, input) {
  const raw = String(input ?? '').trim().toLowerCase();
  if (raw === '') return false;
  const answer = example.solve.answer;

  if (typeof answer === 'boolean') return /^(yes|true|y)$/.test(raw) === answer;

  if (typeof answer === 'number') {
    const numbers = raw.match(/-?\d+(?:\.\d+)?/g);
    return Boolean(numbers) && Math.abs(Number(numbers[numbers.length - 1]) - answer) < 1e-9;
  }

  if (answer && typeof answer === 'object') {
    const numbers = (raw.match(/-?\d+/g) ?? []).map(Number);
    const wanted = Object.values(answer);
    return wanted.every(w => numbers.includes(w));
  }

  // string answers such as "5000 m > 4800 m": compare the numbers and the relation
  const wantedNumbers = String(answer).match(/-?\d+(?:\.\d+)?/g) ?? [];
  const givenNumbers = raw.match(/-?\d+(?:\.\d+)?/g) ?? [];
  const relation = /[><=]/.exec(String(answer))?.[0];
  const sameNumbers = wantedNumbers.every(n => givenNumbers.includes(n));
  return sameNumbers && (!relation || raw.includes(relation));
}

$('finishBtn').addEventListener('click', async () => {
  const example = state.example;
  const learnerRef = ($('learnerRef').value || state.learnerRef || 'this learner').trim();
  state.learnerRef = learnerRef;

  const card = buildUnderstandingCard({
    learner_ref: learnerRef,
    example,
    observations: state.observations,
    explain_back: $('explainInput').value,
    recorded_by: 'learner surface'
  });

  let saved;
  try {
    saved = await saveUnderstandingCard(card, repository);
  } catch (error) {
    saved = { statement: `Card could not be stored: ${error.message}` };
  }

  renderOutcome(card, saved);
});

function renderOutcome(card, saved) {
  const read = diagnose(state.observations);
  const rows = card.layers.map(l => `
    <tr>
      <td><b class="key-${l.layer}">${l.layer}</b> ${escape(l.name)}</td>
      <td class="num">${l.isolated ? format(l.value) : '—'}</td>
      <td>${escape(l.reported_as)}</td>
    </tr>`).join('');

  const refusals = card.refused_claims.map(r =>
    `<li><b>${escape(r.claim)}</b> — ${escape(r.because)}</li>`).join('');

  const actions = read.next_actions.map(a =>
    `<li><b>${escape(a.code)}</b>${a.layer ? ` · ${escape(LAYER_NAMES[a.layer])}` : ''}<br><span class="small muted">${escape(a.why)} ${escape(a.how)}</span></li>`).join('');

  $('outcome').innerHTML = `
    <article class="uc">
      <header><b>${escape(card.id)}</b><span class="small muted">${escape(card.example_title)} · ${escape(card.at.slice(0, 10))}</span></header>
      <div class="body">
        ${say('VX-CARD-EARNED')}
        <div class="equation"><span class="factor">${escape(card.expression)}</span><span class="result">${escape(card.p_solve.shown_as)}</span></div>
        <table><thead><tr><th>Layer</th><th>Measured</th><th>What that means</th></tr></thead><tbody>${rows}</tbody></table>
        <div class="refusal">
          <b>Not measured</b>
          <p>${escape(card.not_measured_statement)}</p>
          ${card.not_measured.length ? say('VX-UNMEASURED', 'voice stop') : ''}
          <p class="small">What may not be said from this sitting:</p>
          <ul class="small">${refusals}</ul>
        </div>
        ${card.explain_back.present ? `<p class="said">“${escape(card.explain_back.child_words)}”</p>` : ''}
        <h3>What happens next</h3>
        <ul>${actions}</ul>
        <p class="small muted">${escape(saved.statement ?? '')}</p>
      </div>
    </article>
    <div class="card"><h3>For the people at home</h3><ul>${familyReading(card).map(l => `<li>${escape(l)}</li>`).join('')}</ul></div>
  `;
  $('outcome').scrollIntoView({ behavior: 'smooth', block: 'start' });
  renderCards();
}

// --- concept cards ----------------------------------------------------------

function renderConceptCards() {
  $('conceptGrid').innerHTML = conceptCards().map(card => `
    <article class="concept-card">
      <header><span>${escape(card.family_label)}</span><b>${escape(card.word)}</b></header>
      <div class="rows">
        <div class="row L"><b>L · ${escape(card.layers.L.question)}</b><p>${escape(card.layers.L.content)}</p>
          <p class="misread">Common misread: ${escape(card.layers.L.misread)}</p>
          <p class="small muted">${escape(card.layers.L.why_it_misleads)}</p></div>
        <div class="row M"><b>M · ${escape(card.layers.M.question)}</b><p>${escape(card.layers.M.content)}</p>
          <p><code>${escape(card.layers.M.notation)}</code></p></div>
        <div class="row S"><b>S · ${escape(card.layers.S.question)}</b><p class="small">${escape(card.layers.S.content)}</p></div>
        <div class="row"><p class="small muted">${escape(card.footer)}</p></div>
      </div>
    </article>`).join('');
}

// --- understanding cards ----------------------------------------------------

async function renderCards() {
  const ref = ($('learnerRef').value || state.learnerRef || '').trim();
  const cards = await listUnderstandingCards(ref || null, repository);
  if (cards.length === 0) {
    $('cardList').innerHTML = '<div class="card"><p class="muted">No cards yet. Finish a word problem and one is written here.</p></div>';
    return;
  }
  $('cardList').innerHTML = [...cards].reverse().map(card => `
    <article class="uc">
      <header><b>${escape(card.id)}</b><span class="small muted">${escape(card.example_title ?? card.example_id)} · ${escape(String(card.at).slice(0, 10))}</span></header>
      <div class="body">
        <p><code>${escape(card.expression)}</code> → <b>${escape(card.p_solve.shown_as)}</b></p>
        <p class="small">${escape(card.not_measured_statement)}</p>
        ${card.explain_back?.present ? `<p class="said">“${escape(card.explain_back.child_words)}”</p>` : ''}
      </div>
    </article>`).join('');
}

$('refreshCards').addEventListener('click', renderCards);
$('learnerRef').addEventListener('change', renderCards);

// --- start ------------------------------------------------------------------

function start() {
  $('examplePicker').innerHTML = WORKED_EXAMPLES
    .map(e => `<option value="${e.id}">${escape(`${e.id} · ${e.title}`)}</option>`).join('');
  $('examplePicker').addEventListener('change', event => loadExample(event.target.value));

  renderConceptCards();
  loadExample(WORKED_EXAMPLES[0].id);
  renderCards();
  verifySurfaceVoice();

  $('storageNote').textContent = `Cards are kept on this device, append-only. ${VOICE_LINES.length} spoken lines are registered.`;

  provisioningState().then(s => {
    $('backendChip').textContent = s.provisioned ? 'STORAGE · DEVICE + BACKEND' : 'STORAGE · THIS DEVICE';
    $('backendChip').title = s.detail ?? s.statement;
  }).catch(() => {
    $('backendChip').textContent = 'STORAGE · THIS DEVICE';
  });
}

start();
