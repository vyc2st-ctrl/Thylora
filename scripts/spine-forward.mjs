#!/usr/bin/env node
// THYLORA HEAD · SPINE FORWARD — generate the check-in report.
// Writes SPINE.md (repo root, readable by any AI with repo access) and
// spine/spine.json (served at /spine for the dashboard and any browser).
//
// Live read: aggregate-only Supabase RPC with a public publishable key; no
// privileged GitHub secret is required.
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { buildReport, toMarkdown } from '../spine/lib.js';
import { RESEARCHERS } from '../lineage/lib/researchers.js';
import { SOURCES } from '../lineage/lib/sources.js';

const root = new URL('../', import.meta.url);
const read = async (p, fallback = null) => { try { return await readFile(new URL(p, root), 'utf8'); } catch { return fallback; } };
const json = async (p, fallback = {}) => { const t = await read(p); try { return t ? JSON.parse(t) : fallback; } catch { return fallback; } };
const sh = cmd => { try { return execSync(cmd, { cwd: root, encoding: 'utf8' }).trim(); } catch { return null; } };

const git = {
  last_commit: sh('git rev-parse --short HEAD'),
  last_message: sh('git log -1 --format=%s'),
  last_commit_at: sh('git log -1 --format=%cI'),
  branch: process.env.GITHUB_REF_NAME ?? sh('git rev-parse --abbrev-ref HEAD'),
  commits_7d: Number(sh('git rev-list --count --since="7 days ago" HEAD') ?? 0)
};

let testCount = 0;
for (const f of (await readdir(new URL('tests/', root))).filter(f => f.endsWith('.mjs'))) {
  testCount += ((await read(`tests/${f}`, '')).match(/^test\(/gm) ?? []).length;
}
let written = 0;
for (const d of ['db/rae-link/', 'db/lineage/']) {
  try { written += (await readdir(new URL(d, root))).filter(f => /^0\d+.*\.sql$/.test(f)).length; } catch { /* none */ }
}

// Least-privilege live check: a public publishable key calls an aggregate-only
// Supabase RPC. It never reads department rows or needs a privileged GitHub secret.
async function actionsBackendReadCheck() {
  const url = process.env.THYLORA_SUPABASE_URL ?? 'https://jvsdxhrfhtlgaknhjxlz.supabase.co';
  // Publishable keys are public identifiers, not secrets. Override if rotated.
  const key = process.env.THYLORA_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_ta33XJ9rtS8VljoUYw-GuA_Pi4OycpQ';
  try {
    const res = await fetch(`${url}/rest/v1/rpc/thylora_spine_department_count_v1`, {
      method: 'GET',
      headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) return { state: 'READ_ERROR', detail: `Aggregate-only Supabase gate returned HTTP ${res.status}` };
    const count = await res.json();
    if (!Number.isSafeInteger(count) || count < 0) return { state: 'READ_ERROR', detail: 'Aggregate-only Supabase gate returned an invalid count' };
    return { state: 'READ_OK', detail: `${count} departments; aggregate count only, no department rows read` };
  } catch (e) {
    return { state: 'READ_ERROR', detail: `Aggregate-only Supabase gate failed: ${String(e.message ?? e)}` };
  }
}

const report = buildReport({
  now: new Date(), git, thread: await read('THREAD.md', ''), family: await json('lineage/family.json'),
  leads: await json('lineage/leads/latest.json', null), researchers: RESEARCHERS, sources: SOURCES,
  registry: await json('world/registry.json'), images: await json('world/image-queue.json'),
  testCount, migrations: { written, applied: 0 }, live: await actionsBackendReadCheck()
});
await writeFile(new URL('SPINE.md', root), toMarkdown(report));
await writeFile(new URL('spine/spine.json', root), JSON.stringify(report, null, 2) + '\n');
const gateSummary = [
  '## SPINE scheduled worker — Supabase read gate',
  '',
  `- Result: **${report.live_backend.state}**`,
  `- Detail: ${report.live_backend.detail}`,
  '- Access: public publishable key + aggregate-only RPC; no service-role credential.',
  '- Scope: this workflow publishes a SPINE health report; it does not generate or publish digital products.'
].join('\\n') + '\\n';
if (process.env.GITHUB_STEP_SUMMARY) {
  const { appendFile } = await import('node:fs/promises');
  await appendFile(process.env.GITHUB_STEP_SUMMARY, gateSummary);
}
console.log(`SPINE FORWARD: ${report.mathematics.researchers_working}/${report.mathematics.researchers_total} working · ${report.lanes.length} lanes · ${report.questions.length} questions · aggregate-only live ${report.live_backend.state}`);
