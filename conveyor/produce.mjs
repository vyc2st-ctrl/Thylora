#!/usr/bin/env node
// CONVEYOR · production pass
// Workroom: WR-CONVEYOR-001
//
// Applies the evidenced advancement plan to the registry and writes it back.
// Idempotent: an operation whose effect is already present is skipped, so this
// can be re-run without duplicating a provenance chain or reissuing a serial.
//
// Every operation carries its evidence. Nothing here advances an item by
// declaring it advanced; the gates in stages.js decide how far each item moves.

import { readFileSync, writeFileSync } from 'node:fs';
import { REGISTRY_PATH, loadRegistry, validateRegistry } from './lib/registry.js';
import { runPlan } from './lib/advance.js';
import { stageGate } from './lib/stages.js';

const RIGHTS_RECORD = 'conveyor/rights/internal-origin.json';
const rights = JSON.parse(readFileSync(new URL('./rights/internal-origin.json', import.meta.url), 'utf8'));
const rightsCovered = new Set(rights.covers.map(c => c.canonical_id));

// The plan. Each entry says what to do and names the evidence that permits it.
const PLAN = {
  'CONV-RAE-0001': [
    { op: 'recordProvenance', arg: {
      event_type: 'CREATED',
      source_description: 'RAE Link surface, libraries and ten migrations authored in workroom WR-RAELINK-001 in this repository.',
      occurred_at: '2026-09-11', derived_from_ref: 'WR-RAELINK-001', recorded_by: 'WR-CONVEYOR-001' } },
    { op: 'serialize', arg: {} },
    { op: 'attachQr', arg: { visibility: 'REGISTRY_ONLY' } }
  ],
  'CONV-GAM-0001': [
    { op: 'recordProvenance', arg: {
      event_type: 'CREATED',
      source_description: 'GAME-BET-001 sportsbook and casino workroom surface authored in this repository, commit e4a9a83.',
      occurred_at: '2026-08-26', recorded_by: 'WR-CONVEYOR-001' } },
    { op: 'serialize', arg: {} },
    { op: 'attachQr', arg: { visibility: 'REGISTRY_ONLY' } },
    { op: 'attachEvidence', arg: 'tests/conveyor.surfaces.test.mjs · element contract, escaping boundary and third-party-origin checks pass for app/sports-betting.html + .js; the Earth-money prohibition is asserted present on the surface itself' }
  ],
  'CONV-GAM-0002': [
    { op: 'attachArtifact', arg: 'app/time-run.html' },
    { op: 'recordProvenance', arg: {
      event_type: 'CREATED',
      source_description: 'Time Run surface authored in this repository, commit 84b5565.',
      occurred_at: '2026-08-25', recorded_by: 'WR-CONVEYOR-001' } },
    { op: 'serialize', arg: {} },
    { op: 'attachQr', arg: { visibility: 'REGISTRY_ONLY' } },
    { op: 'attachEvidence', arg: 'tests/conveyor.surfaces.test.mjs · element contract, escaping boundary and third-party-origin checks pass for app/time-run.html + .js' }
  ],
  'CONV-MEM-0001': [
    { op: 'recordProvenance', arg: {
      event_type: 'CREATED',
      source_description: 'THYLORA membership tiers and channel entitlements surfaced in public-site/store.html, commit df1e141; pricing approved in the THYLORA backend per that page.',
      occurred_at: '2026-08-26', recorded_by: 'WR-CONVEYOR-001' } },
    { op: 'serialize', arg: {} },
    { op: 'attachQr', arg: { visibility: 'REGISTRY_ONLY' } },
    { op: 'setCost', arg: { cost_state: 'KNOWN', cost_evidence: 'No per-unit production cost: the membership is access to surfaces already built. Provider fees are not yet quoted and are tracked as the checkout gate, not as a unit cost.' } },
    { op: 'setPrice', arg: { price_state: 'SET', price_evidence: 'public-site/store.html: Public Access free, Member $3.99/mo, Family $5.99/mo, Creator $7.99/mo, Business Residency $14.99/mo, Enterprise custom. Stated as approved in the THYLORA backend.' } },
    { op: 'setStorefront', arg: { storefront_state: 'LISTED', storefront_evidence: 'public-site/store.html memberships section renders all six tiers with their channel entitlements.' } },
    { op: 'attachEvidence', arg: 'tests/conveyor.surfaces.test.mjs · every priced tier in the conveyor appears on the storefront, and no purchase control is offered while the checkout path is unverified' }
  ]
};

const registry = loadRegistry();
const now = new Date().toISOString();
const report = [];

registry.items = registry.items.map(item => {
  const plan = PLAN[item.canonical_id];
  if (!plan) return item;

  let working = { ...item };

  // Rights clearance is applied only where the internal-origin record covers it,
  // and only when the item is not held on a Chairman rights gate.
  if (rightsCovered.has(item.canonical_id) && item.rights_authority !== 'CHAIRMAN') {
    working = { ...working, rights_state: 'CLEARED', rights_evidence: `${RIGHTS_RECORD} · ${rights.record_id}` };
  }

  // Idempotency keyed on the VALUE, never on the state label. A registry that
  // says "ISSUED" with no serial has not been serialized, and skipping the
  // operation because of the label is how an unbacked claim survives a rerun.
  const steps = plan.filter(step => {
    if (step.op === 'recordProvenance') return !(working.provenance_chain?.length > 0);
    if (step.op === 'serialize') return !working.serial;
    if (step.op === 'attachQr') return !working.qr_payload;
    return true;
  });

  const before = working.stage;
  const result = runPlan(working, steps, now);
  report.push({
    id: item.canonical_id, from: before, to: result.stopped_at,
    applied: result.applied, cleared: result.cleared,
    stopped_because: result.stopped_because, authority: result.stopped_authority
  });
  return result.item;
});

const check = validateRegistry(registry);
if (!check.valid) {
  console.error('PRODUCTION PASS REFUSED — the resulting registry does not validate:');
  for (const p of check.problems) console.error(` ${p.id}: ${p.problem}${p.detail ? ' · ' + p.detail : ''}`);
  process.exit(1);
}

writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2) + '\n');

console.log(`PRODUCTION PASS · ${report.length} items touched · ${now}`);
for (const r of report) {
  const moved = r.cleared.length ? r.cleared.join(', ') : 'no stage cleared';
  console.log(`\n ${r.id}`);
  console.log(`   applied   : ${r.applied.length ? r.applied.join(', ') : 'nothing (already current)'}`);
  console.log(`   stages    : ${moved}`);
  console.log(`   stopped at: ${r.to}${r.stopped_because ? ` · ${r.stopped_because} (${r.authority})` : ' · gate met'}`);
}
