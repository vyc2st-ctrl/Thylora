#!/usr/bin/env node
// ROOT HOUSE · run the research worker and write leads to lineage/leads/.
// Usage: node scripts/lineage-worker.mjs [--offline]
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { runWorker } from '../lineage/lib/worker.js';

const offline = process.argv.includes('--offline');
const family = JSON.parse(await readFile(new URL('../lineage/family.json', import.meta.url)));
const report = await runWorker(family, offline ? { providers: [] } : {});
const dir = new URL('../lineage/leads/', import.meta.url);
await mkdir(dir, { recursive: true });
const day = report.run_at.slice(0, 10);
const body = JSON.stringify(report, null, 2) + '\n';
await writeFile(new URL(`${day}.json`, dir), body);
await writeFile(new URL('latest.json', dir), body);
console.log(`Root House worker: ${report.named_people} named people, ${report.leads.length} leads, ${report.tasks.length} open tasks, ${report.errors.length} provider errors.`);
