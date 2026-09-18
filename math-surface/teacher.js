// THYLORA · teacher surface
// Workroom: WR-MATH-SURFACE-001
//
// Every number on this page is computed by the model, including the ones a
// teacher would rather not see — the refused claims and the lift that a layer
// already at 1 would return, which is nothing.

import {
  observe, factorsFrom, solveProbability, diagnose, liftRanking, ceiling, LAYER_NAMES, CLAIMS, claimSupported
} from './lib/understanding.js';
import { probesFor, languageLoad } from './lib/language.js';
import { WORKED_EXAMPLES } from './lib/examples.js';
import { voiceLine, digest } from './lib/continuity.js';

const $ = id => document.getElementById(id);
const escape = text => String(text).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const format = v => (v === null || v === undefined ? '—' : Number.isInteger(v) ? String(v) : String(Number(Number(v).toFixed(3))));

function verifySurfaceVoice() {
  for (const node of document.querySelectorAll('[data-voice]')) {
    const registered = voiceLine(node.dataset.voice);
    if (!registered || digest(node.textContent.trim()) !== registered.digest) {
      console.warn('THY-VOICE-PROMPT-NO-SILENT-MUTATION-001:', node.dataset.voice);
    }
  }
}

function readObservations() {
  const mixedOnly = $('mixedOnly').checked;
  const observations = [];
  for (const layer of ['L', 'M', 'S']) {
    const correct = Number($(`${layer.toLowerCase()}Correct`).value);
    const attempted = Number($(`${layer.toLowerCase()}Attempted`).value);
    if (!Number.isInteger(attempted) || attempted <= 0) continue;
    if (!Number.isInteger(correct) || correct < 0 || correct > attempted) continue;
    const isolated = !(mixedOnly && layer !== 'L');
    observations.push(observe({
      layer, correct, attempted, isolated,
      source: isolated ? 'isolated probe' : 'inside the word problem'
    }));
  }
  return observations;
}

$('readBtn').addEventListener('click', () => {
  const observations = readObservations();
  if (observations.length === 0) {
    $('readout').innerHTML = '<div class="card"><p class="muted">Nothing was entered. The model reports nothing rather than assuming a zero.</p></div>';
    return;
  }

  const read = diagnose(observations);
  const factors = read.factors;
  const p = read.p_solve;

  const layerRows = ['L', 'M', 'S'].map(layer => {
    const f = factors[layer];
    return `<tr>
      <td><b>${layer}</b> ${escape(LAYER_NAMES[layer])}</td>
      <td class="num">${f.admissible ? format(f.value) : '—'}</td>
      <td>${escape(f.evidence)}</td>
      <td>${f.admissible ? 'admissible' : 'not admissible for this layer'}</td>
    </tr>`;
  }).join('');

  const lifts = liftRanking(factors).map(l => `<tr>
    <td>${escape(LAYER_NAMES[l.layer])}</td>
    <td class="num">${l.determined ? format(l.gain) : '—'}</td>
    <td>${l.determined
      ? (l.gain === 0 ? 'nothing; this layer is already at its ceiling' : `P_solve would move ${format(l.before)} → ${format(l.after)}`)
      : `cannot be computed while ${l.unmeasured.map(x => LAYER_NAMES[x]).join(' and ')} ${l.unmeasured.length > 1 ? 'are' : 'is'} unmeasured`}</td>
  </tr>`).join('');

  const permitted = read.permitted_claims.map(c => `<li><b>${escape(c.claim)}</b> — ${escape(c.because)}</li>`).join('');
  const refused = read.refused_claims.map(c => `<li><b>${escape(c.claim)}</b> — ${escape(c.because)}${c.requires ? `<br><span class="small muted">Requires: ${escape(c.requires)}</span>` : ''}</li>`).join('');
  const actions = read.next_actions.map(a => `<li><b>${escape(a.code)}</b>${a.layer ? ` · ${escape(LAYER_NAMES[a.layer])}` : ''}<br><span class="small muted">${escape(a.why)} ${escape(a.how)}</span></li>`).join('');

  const mathClaim = claimSupported(factors, CLAIMS.MATH_DEFICIT);

  $('readout').innerHTML = `
    <section class="card">
      <div class="equation"><span class="factor">${escape(read.p_solve.expression)}</span><span class="result">${p.determined ? `P_solve = ${format(p.value)}` : `between ${format(p.bounds.low)} and ${format(p.bounds.high)}`}</span></div>
      <p><b>${escape(read.headline)}</b></p>
      <table><thead><tr><th>Layer</th><th>Value</th><th>Evidence</th><th>Status</th></tr></thead><tbody>${layerRows}</tbody></table>
      <p class="small muted">Ceiling: ${ceiling(factors) === null ? 'not computable while a layer is unmeasured' : format(ceiling(factors))}. P_solve can never exceed its smallest factor.</p>
    </section>

    <section class="card">
      <h3>Where the next hour returns the most</h3>
      <table><thead><tr><th>Lifting this layer to 1</th><th>Gain</th><th>Effect</th></tr></thead><tbody>${lifts}</tbody></table>
    </section>

    <section class="${mathClaim.permitted ? 'permit' : 'refusal'}">
      <b>May we say this learner lacks the mathematics?</b>
      <p>${mathClaim.permitted ? 'Yes — and only because the relationship layer was measured on its own.' : 'No.'} ${escape(mathClaim.because)}</p>
      ${mathClaim.requires ? `<p class="small">Requires: ${escape(mathClaim.requires)}</p>` : ''}
    </section>

    <section class="card">
      <h3>Supported by this sitting</h3>
      <ul>${permitted || '<li class="muted">Nothing.</li>'}</ul>
      <h3>Refused by this sitting</h3>
      <ul>${refused || '<li class="muted">Nothing.</li>'}</ul>
    </section>

    <section class="card">
      <h3>Next, in order</h3>
      <ul>${actions}</ul>
    </section>
  `;
  $('readout').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

$('probeBank').innerHTML = `<table>
  <thead><tr><th>Word</th><th>Probe</th><th>Accepts</th><th>Rejects</th></tr></thead>
  <tbody>${probesFor().map(p => `<tr>
    <td><b>${escape(p.word)}</b><br><span class="small muted">${escape(p.family_label)}</span></td>
    <td>${escape(p.ask)}</td>
    <td class="small">${p.accept.map(escape).join('<br>')}</td>
    <td class="small muted">${p.reject.map(escape).join('<br>')}</td>
  </tr>`).join('')}</tbody></table>`;

$('exampleTable').innerHTML = `<table>
  <thead><tr><th>Example</th><th>Word</th><th>Load</th><th>Built to expose</th></tr></thead>
  <tbody>${WORKED_EXAMPLES.map(e => {
    const load = languageLoad(e.story);
    return `<tr>
      <td><b>${escape(e.id)}</b><br><span class="small muted">${escape(e.title)}</span></td>
      <td class="small">${e.word_focus.map(escape).join(', ')}</td>
      <td class="num">${load.load} <span class="band">${escape(load.band)}</span></td>
      <td class="small">${escape(e.expected_failure_mode)}</td>
    </tr>`;
  }).join('')}</tbody></table>`;

verifySurfaceVoice();
