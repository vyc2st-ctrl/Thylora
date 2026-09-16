#!/usr/bin/env node
// CONVEYOR · readback
// Workroom: WR-CONVEYOR-001
//
// Prints the conveyor state from the committed registry. `--json` emits the
// whole board for a machine; the default is the human table.

import { loadRegistry, validateRegistry, board } from './lib/registry.js';

const registry = loadRegistry();
const check = validateRegistry(registry);
if (!check.valid) {
  console.error('REGISTRY INVALID');
  for (const p of check.problems) console.error(` ${p.id}: ${p.problem}${p.detail ? ' · ' + p.detail : ''}`);
  process.exit(1);
}

const view = board(registry);

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(view, null, 2));
  process.exit(0);
}

const pad = (s, n) => String(s ?? '').padEnd(n).slice(0, n);
console.log(`CONVEYOR · ${view.registry_id} · ${view.item_count} items · ${view.generated_at}`);
console.log('');
console.log('LANES');
console.log(pad('LANE', 26) + pad('ITEMS', 7) + pad('EXECUTABLE', 12) + pad('GATED', 7) + 'NEAREST MONEY');
for (const l of view.lanes) {
  console.log(pad(l.label, 26) + pad(l.items, 7) + pad(l.executable, 12) + pad(l.chairman_gated, 7) + (l.nearest_money ?? '—'));
}
console.log('');
console.log(`EXECUTABLE NOW · one per lane · ${view.executable_now.length} lanes moving`);
for (const w of view.executable_now) {
  console.log(` ${pad(w.canonical_id, 14)} ${pad(w.stage, 11)} md=${pad(w.money_distance, 4)} ${w.next_action}`);
}
console.log('');
console.log(`CLOSEST TO MONEY · ${view.money_next.length} shown`);
for (const m of view.money_next) {
  console.log(` ${pad(m.canonical_id, 14)} ${pad(m.title, 34)} distance ${m.money_distance} (${m.money_chairman_gates} Chairman)`);
}
console.log('');
console.log(`CHAIRMAN GATES · ${view.chairman_gates.length}`);
for (const g of view.chairman_gates) {
  console.log(` ${pad(g.canonical_id, 14)} ${pad(g.code, 30)} ${g.detail}`);
}
