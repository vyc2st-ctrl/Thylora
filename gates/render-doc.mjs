// Renders docs/GATE-NETWORK-620.md from gates/gate-network.js so the document
// can never drift from the code.  Run: node gates/render-doc.mjs
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { GATES, GATE_CODES, AUTHORITY, DECISIONS, GAP_ACTIONS, PASS_THRESHOLD, validateGraph } from './gate-network.js';
import { ROUTES } from './routes.js';

const authName = Object.fromEntries(Object.entries(AUTHORITY).map(([k, v]) => [v, k]));

export function renderGateDoc() {
const L = [];
L.push('# GATE NETWORK 620 · first connected adjacency map');
L.push('');
L.push('> Generated from `gates/gate-network.js` by `node gates/render-doc.mjs`. Do not edit by hand.');
L.push('');
L.push('**Math:** `G_i = E_i × C_i × A_i × R_i × X_i` (MATH-GATE-NETWORK-620) · `Ω_k = (V×E×C×Rev×Cap×Fit) ÷ (1+Risk+Cost+Dep)` (MATH-ROUTE-VALUE-620)');
L.push('');
L.push('**Factor reading (working interpretation — the letters are authoritative, these readings must be confirmed against the MATH-GATE-NETWORK-620 source):**');
L.push('E evidence · C self-check · A authority (computed from held level vs floor; never supplied by a model) · R redundancy check · X cross-gate clearance (each open warning on the same route halves it).');
L.push('');
L.push(`**Decision order:** authority below floor → ESCALATE · any factor UNKNOWN → HOLD / PRESERVE_UNKNOWN · E below evidence floor → HOLD / REPAIR · G ≥ ${PASS_THRESHOLD} → PASS · otherwise PARTIAL. A route takes its worst gate. Warnings apply only inside the route that raised them.`);
L.push('');
L.push(`**Graph check:** ${validateGraph().length === 0 ? 'consistent — all edges reciprocated, all rules and gap actions defined' : 'PROBLEMS: ' + validateGraph().join('; ')}`);
L.push('');
L.push('## Adjacency matrix');
L.push('');
L.push('| | ' + GATE_CODES.map(c => c.slice(0, 4)).join(' | ') + ' |');
L.push('|---|' + GATE_CODES.map(() => ':-:').join('|') + '|');
for (const a of GATE_CODES) {
  L.push(`| **${a}** | ` + GATE_CODES.map(b => a === b ? '·' : GATES[a].connected.includes(b) ? '●' : '').join(' | ') + ' |');
}
L.push('');
L.push('## Lane routes');
L.push('');
L.push('| Lane | Gate path | Current gate | Autonomy may pass alone | Artifact |');
L.push('|---|---|---|---|---|');
for (const [id, r] of Object.entries(ROUTES)) {
  L.push(`| ${id} | ${r.path.join(' → ')} | ${r.current_gate} | ${r.path.filter(c => GATES[c].authority_floor <= AUTHORITY.AUTONOMY_SAFE_INTERNAL).join(', ') || 'none'} | \`${r.artifact}\` |`);
}
L.push('');
for (const code of GATE_CODES) {
  const g = GATES[code];
  L.push(`## ${code}`);
  L.push('');
  L.push(`**Purpose:** ${g.purpose}`);
  L.push('');
  L.push(`**Inputs:** ${g.inputs.join(' · ')}`);
  L.push('');
  L.push(`**Outputs:** ${g.outputs.join(' · ')}`);
  L.push('');
  L.push(`**Evidence floor (E ≥ ${g.evidence_floor_value}):** ${g.evidence_floor}`);
  L.push('');
  L.push(`**Authority floor:** ${authName[g.authority_floor]}`);
  L.push('');
  L.push(`**Self-check:** ${g.self_check}`);
  L.push('');
  L.push(`**Redundancy check:** ${g.redundancy_check}`);
  L.push('');
  if (g.binds) { L.push(`**Binds existing gate:** ${g.binds}`); L.push(''); }
  L.push(`**Connected gates:** ${g.connected.join(', ')}`);
  L.push('');
  L.push('| Decision | Rule |');
  L.push('|---|---|');
  for (const d of DECISIONS) L.push(`| ${d} | ${g.rules[d]} |`);
  L.push('');
  L.push('| Gap action | What it means here |');
  L.push('|---|---|');
  for (const a of GAP_ACTIONS) L.push(`| ${a} | ${g.gap_actions[a]} |`);
  L.push('');
}
return L.join('\n');
}

export const DOC_URL = new URL('../docs/GATE-NETWORK-620.md', import.meta.url);

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync(DOC_URL, renderGateDoc());
  console.log('wrote docs/GATE-NETWORK-620.md');
}
