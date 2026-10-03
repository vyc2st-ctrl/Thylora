#!/usr/bin/env node
// THYLORA HEAD · SPINE FORWARD — generate the check-in report.
// Writes SPINE.md (repo root, readable by any AI with repo access) and
// spine/spine.json (served at /spine for the dashboard and any browser).
//
// Optional live read: set THYLORA_SUPABASE_URL and THYLORA_SUPABASE_KEY
// (GitHub Actions secrets) and the report counts live departments.
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

async function liveCheck() {
  const url = process.env.THYLORA_SUPABASE_URL, key = process.env.THYLORA_SUPABASE_KEY;
  if (!url || !key) return { state: 'NOT_CONFIGURED', detail: 'add THYLORA_SUPABASE_URL / THYLORA_SUPABASE_KEY secrets for live numbers' };
  try {
    const res = await fetch(`${url}/rest/v1/thylora_departments?select=department_code`, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: 'count=exact' }, signal: AbortSignal.timeout(8000) });
    if (!res.ok) return { state: 'ERROR', detail: `HTTP ${res.status}` };
    return { state: 'READ', detail: `${(await res.json()).length} live departments` };
  } catch (e) { return { state: 'UNREACHABLE', detail: String(e.message ?? e) }; }
}

const report = buildReport({
  now: new Date(), git, thread: await read('THREAD.md', ''), family: await json('lineage/family.json'),
  leads: await json('lineage/leads/latest.json', null), researchers: RESEARCHERS, sources: SOURCES,
  registry: await json('world/registry.json'), images: await json('world/image-queue.json'),
  testCount, migrations: { written, applied: 0 }, live: await liveCheck()
});
await writeFile(new URL('SPINE.md', root), toMarkdown(report));
await writeFile(new URL('spine/spine.json', root), JSON.stringify(report, null, 2) + '\n');
console.log(`SPINE FORWARD: ${report.mathematics.researchers_working}/${report.mathematics.researchers_total} working · ${report.lanes.length} lanes · ${report.questions.length} questions · live ${report.live_backend.state}`);
