#!/usr/bin/env node
// THYLORA · QYRIS · seed generator
//
// ONE SOURCE OF TRUTH. The pre-marriage pack lives in
// qyris/data/premarriage-pack.js and the industry projection lives in
// qyris/lib/industry.js. This script emits the SQL seeds from those, so the
// database and the surface cannot disagree about what a question says.
//
//   node db/qyris/generate-seed.mjs          write the files
//   node db/qyris/generate-seed.mjs --check  fail if the committed files differ
//
// tests/qyris-seed-drift.test.mjs runs --check, so editing the SQL by hand
// breaks the build instead of quietly forking the pack.

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PREMARRIAGE_PACK, PACK_ID, PACK_TITLE } from '../../qyris/data/premarriage-pack.js';
import { flatten } from '../../qyris/lib/grammar.js';
import { AXES, DOMAINS, AXIS_IDS, DOMAIN_IDS, projectAll } from '../../qyris/lib/industry.js';

const HERE = dirname(fileURLToPath(import.meta.url));

const q = (value) => (value === null || value === undefined ? 'null' : `'${String(value).replace(/'/g, "''")}'`);

const GENERATED_HEADER = (name, source) => `-- THYLORA · QYRIS · ${name}
--
-- GENERATED FILE — DO NOT EDIT BY HAND.
-- Source of truth: ${source}
-- Regenerate:     node db/qyris/generate-seed.mjs
-- Drift check:    node db/qyris/generate-seed.mjs --check  (run by npm test)
--
-- Idempotent: every insert is an upsert, so a second application is a no-op.
`;

// ── 0002 · pre-marriage pack ──────────────────────────────────────────────
function buildPremarriage() {
  const lines = [GENERATED_HEADER('0002 · Pre-marriage pack', 'qyris/data/premarriage-pack.js')];
  lines.push('');
  lines.push('insert into qyr_packs (pack_id, title, kind, notice) values');
  lines.push(`  (${q(PACK_ID)}, ${q(PACK_TITLE)}, 'PREMARRIAGE', ${q(
    'A question pack, not advice, not a contract, and not a substitute for a lawyer, a clinician or a counsellor. '
    + 'Every SAFEGUARD exists because the question can be misused.',
  )})`);
  lines.push('on conflict (pack_id) do update set title = excluded.title, notice = excluded.notice;');
  lines.push('');

  const entries = flatten(PREMARRIAGE_PACK);
  const ordinals = new Map();
  lines.push('insert into qyr_nodes (node_id, pack_id, parent_id, cluster_id, label, depth, ordinal, question, yield, reason, inspect, safeguard) values');
  const rows = entries.map((entry) => {
    const key = `${entry.parentId ?? 'ROOT'}`;
    const ordinal = (ordinals.get(key) ?? 0);
    ordinals.set(key, ordinal + 1);
    const n = entry.node;
    return `  (${q(n.id)}, ${q(PACK_ID)}, ${q(entry.parentId)}, ${q(entry.clusterId)}, ${q(n.label ?? null)}, `
      + `${entry.depth}, ${ordinal}, ${q(n.question)}, ${q(n.yield)}, ${q(n.reason)}, ${q(n.inspect)}, ${q(n.safeguard)})`;
  });
  lines.push(rows.join(',\n'));
  lines.push('on conflict (node_id) do update set');
  lines.push('  pack_id = excluded.pack_id, parent_id = excluded.parent_id, cluster_id = excluded.cluster_id,');
  lines.push('  label = excluded.label, depth = excluded.depth, ordinal = excluded.ordinal,');
  lines.push('  question = excluded.question, yield = excluded.yield, reason = excluded.reason,');
  lines.push('  inspect = excluded.inspect, safeguard = excluded.safeguard;');
  lines.push('');

  lines.push('insert into qyr_node_deltas (node_id, delta_code) values');
  const deltaRows = [];
  for (const entry of entries) {
    for (const delta of entry.node.moves) deltaRows.push(`  (${q(entry.node.id)}, ${q(delta)})`);
  }
  lines.push(deltaRows.join(',\n'));
  lines.push('on conflict do nothing;');
  lines.push('');
  lines.push(`-- ${entries.length} nodes across ${PREMARRIAGE_PACK.length} clusters, ${deltaRows.length} declared deltas.`);
  lines.push('');
  return lines.join('\n');
}

// ── 0003 · industry template ──────────────────────────────────────────────
const INDUSTRY_DDL = `
create table if not exists qyr_axes (
  axis_id   text primary key,
  label     text not null,
  invariant text not null
);

create table if not exists qyr_domains (
  domain_id text primary key,
  label     text not null
);

create table if not exists qyr_axis_deltas (
  axis_id    text not null references qyr_axes(axis_id) on delete cascade,
  delta_code text not null references qyr_deltas(delta_code),
  primary key (axis_id, delta_code)
);

-- Which fields the grammar produced mechanically and which a human had to
-- write. The AUTHORED rows are the honest finding about where a generic
-- projection would have been vague or unsafe.
create table if not exists qyr_projections (
  node_id    text primary key references qyr_nodes(node_id) on delete cascade,
  axis_id    text not null references qyr_axes(axis_id),
  domain_id  text not null references qyr_domains(domain_id),
  provenance jsonb not null,
  constraint qyr_projections_provenance_shape check (
    provenance ?& array['question','yield','reason','inspect','safeguard']
  )
);
`;

function buildIndustry() {
  const lines = [GENERATED_HEADER('0003 · Industry template', 'qyris/lib/industry.js')];
  lines.push(INDUSTRY_DDL);

  lines.push('insert into qyr_packs (pack_id, title, kind, notice) values');
  lines.push(`  ('QYRIS-INDUSTRY-001', 'QYRIS Industry Template', 'INDUSTRY', ${q(
    'The same QYRIS grammar projected across six domains. Sixteen axes times six domains. '
    + 'Every QUESTION is authored per domain; YIELD, REASON and INSPECT are produced from the axis '
    + 'invariant plus the domain lexicon; SAFEGUARD is authored only where a generic one would be unsafe.',
  )})`);
  lines.push('on conflict (pack_id) do update set title = excluded.title, notice = excluded.notice;');
  lines.push('');

  lines.push('insert into qyr_axes (axis_id, label, invariant) values');
  lines.push(AXIS_IDS.map((id) => `  (${q(id)}, ${q(AXES[id].label)}, ${q(AXES[id].invariant)})`).join(',\n'));
  lines.push('on conflict (axis_id) do update set label = excluded.label, invariant = excluded.invariant;');
  lines.push('');

  lines.push('insert into qyr_axis_deltas (axis_id, delta_code) values');
  const axisDeltas = [];
  for (const id of AXIS_IDS) for (const delta of AXES[id].moves) axisDeltas.push(`  (${q(id)}, ${q(delta)})`);
  lines.push(axisDeltas.join(',\n'));
  lines.push('on conflict do nothing;');
  lines.push('');

  lines.push('insert into qyr_domains (domain_id, label) values');
  lines.push(DOMAIN_IDS.map((id) => `  (${q(id)}, ${q(DOMAINS[id].label)})`).join(',\n'));
  lines.push('on conflict (domain_id) do update set label = excluded.label;');
  lines.push('');

  const all = projectAll();
  const nodeRows = [];
  const deltaRows = [];
  const projectionRows = [];
  for (const domainId of DOMAIN_IDS) {
    all[domainId].forEach((node, index) => {
      nodeRows.push(
        `  (${q(node.id)}, 'QYRIS-INDUSTRY-001', null, ${q(domainId)}, ${q(node.label)}, 0, ${index}, `
        + `${q(node.question)}, ${q(node.yield)}, ${q(node.reason)}, ${q(node.inspect)}, ${q(node.safeguard)})`,
      );
      for (const delta of node.moves) deltaRows.push(`  (${q(node.id)}, ${q(delta)})`);
      projectionRows.push(
        `  (${q(node.id)}, ${q(node.axisId)}, ${q(domainId)}, ${q(JSON.stringify(node.provenance))}::jsonb)`,
      );
    });
  }

  lines.push('insert into qyr_nodes (node_id, pack_id, parent_id, cluster_id, label, depth, ordinal, question, yield, reason, inspect, safeguard) values');
  lines.push(nodeRows.join(',\n'));
  lines.push('on conflict (node_id) do update set');
  lines.push('  pack_id = excluded.pack_id, cluster_id = excluded.cluster_id, label = excluded.label,');
  lines.push('  ordinal = excluded.ordinal, question = excluded.question, yield = excluded.yield,');
  lines.push('  reason = excluded.reason, inspect = excluded.inspect, safeguard = excluded.safeguard;');
  lines.push('');

  lines.push('insert into qyr_node_deltas (node_id, delta_code) values');
  lines.push(deltaRows.join(',\n'));
  lines.push('on conflict do nothing;');
  lines.push('');

  lines.push('insert into qyr_projections (node_id, axis_id, domain_id, provenance) values');
  lines.push(projectionRows.join(',\n'));
  lines.push('on conflict (node_id) do update set provenance = excluded.provenance;');
  lines.push('');
  lines.push(`-- ${nodeRows.length} projected questions: ${AXIS_IDS.length} axes x ${DOMAIN_IDS.length} domains.`);
  lines.push('');
  return lines.join('\n');
}

const targets = [
  { path: join(HERE, '0002_premarriage_pack.sql'), build: buildPremarriage },
  { path: join(HERE, '0003_industry_template.sql'), build: buildIndustry },
];

const check = process.argv.includes('--check');
let drift = 0;
for (const target of targets) {
  const content = target.build();
  if (check) {
    const existing = existsSync(target.path) ? readFileSync(target.path, 'utf8') : null;
    if (existing !== content) {
      drift += 1;
      process.stderr.write(`DRIFT ${target.path}\n`);
    }
  } else {
    writeFileSync(target.path, content, 'utf8');
    process.stdout.write(`wrote ${target.path} (${content.length} bytes)\n`);
  }
}
if (check) {
  if (drift) {
    process.stderr.write('SEED_DRIFT: committed SQL does not match the JS source of truth. Run: node db/qyris/generate-seed.mjs\n');
    process.exit(1);
  }
  process.stdout.write('seed in sync with source of truth\n');
}
