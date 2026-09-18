// THYLORA · family surface
// Workroom: WR-MATH-SURFACE-001
//
// The same registries the learner and teacher surfaces read, rendered without
// notation. A family gets the whole model, not a simplified version of it — the
// simplification is in the wording, never in what is claimed.

import { VOCABULARY, WORD_FAMILIES } from './lib/language.js';
import { WORKED_EXAMPLES } from './lib/examples.js';
import { voiceLine, digest } from './lib/continuity.js';

const $ = id => document.getElementById(id);
const escape = text => String(text).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

for (const node of document.querySelectorAll('[data-voice]')) {
  const registered = voiceLine(node.dataset.voice);
  if (!registered || digest(node.textContent.trim()) !== registered.digest) {
    console.warn('THY-VOICE-PROMPT-NO-SILENT-MUTATION-001:', node.dataset.voice);
  }
}

$('familyWords').innerHTML = `<table>
  <thead><tr><th>Word</th><th>What it means</th><th>The mistake almost everybody makes</th></tr></thead>
  <tbody>${VOCABULARY.map(entry => `<tr>
    <td><b>${escape(entry.word)}</b><br><span class="small muted">${escape(WORD_FAMILIES[entry.family])}</span></td>
    <td>${escape(entry.plain)}</td>
    <td class="small">${escape(entry.common_misread)}<br><span class="muted">${escape(entry.why_it_misleads)}</span></td>
  </tr>`).join('')}</tbody></table>`;

$('familyExamples').innerHTML = WORKED_EXAMPLES.map(example => `
  <article class="card">
    <p class="eyebrow">${escape(example.id)} · ${escape(example.word_focus.join(', '))}</p>
    <p class="story">${escape(example.story)}</p>
    <p><b>Ask this first, before any working:</b><br>${escape(example.language.ask)}</p>
    <p class="small muted"><b>Why it catches people:</b> ${escape(example.language.trap)}</p>
    <details>
      <summary class="small">What a good answer sounds like</summary>
      <p class="small">${escape(example.answer_in_story)}</p>
      <p class="said small">“${escape(example.explain_back.child_words)}”</p>
      <p class="small muted">${escape(example.expected_failure_mode)}</p>
    </details>
  </article>`).join('');
