#!/usr/bin/env node
// THYLORA SPINE FORWARD · run QYRIS-2ST over a backend snapshot.
//   node spine/advance.mjs spine/snapshots/<snapshot>.json spine/runs/<date>
// Writes advancement-records.json and run-summary.json. Never overwrites an
// existing run directory, so every earlier run is kept.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { run } from './lib/qyris.mjs';

const [snapPath, outDir] = process.argv.slice(2);
if (!snapPath || !outDir) {
  console.error('usage: node spine/advance.mjs <snapshot.json> <out-dir>');
  process.exit(2);
}
if (existsSync(`${outDir}/advancement-records.json`)) {
  console.error(`${outDir} already holds a run. Earlier runs are never overwritten. Choose a new directory.`);
  process.exit(3);
}
const snapshot = JSON.parse(readFileSync(snapPath, 'utf8'));
const result = run(snapshot);
mkdirSync(outDir, { recursive: true });
writeFileSync(`${outDir}/advancement-records.json`, JSON.stringify(result.records, null, 1));
const clusterSizes = Object.fromEntries(Object.entries(result.clusters)
  .sort((a, b) => b[1].length - a[1].length).map(([k, v]) => [k, v.length]));
const summary = {
  snapshot: snapPath, captured_at: snapshot.captured_at, total_open_items: result.total,
  by_registry: result.byRegistry, lanes: result.lanes, clusters: clusterSizes,
  gates: result.gates, findings: result.findings, state_vocabulary_size: result.stateVocab,
  money_nearest: result.moneyNearest,
};
writeFileSync(`${outDir}/run-summary.json`, JSON.stringify(summary, null, 1));
console.log(JSON.stringify(summary, null, 1));
