// THYLORA HEAD · SPINE FORWARD — the check-in report
// One function turns the backend's current state into the same report every
// time: time, where we left off, who is working, the mathematics, the world,
// the questions, and what is waiting. Pure: inputs in, report out.

import { openTasks, seatsForLine, LINES } from '../lineage/lib/lineage.js';

export const HEADER = 'THYLORA HEAD - SPINE FORWARD';

export function parseLanes(threadMd = '') {
  const rows = threadMd.split('\n').filter(l => /^\|\s*\d+\s*\|/.test(l));
  return rows.map(l => {
    const c = l.split('|').slice(1, -1).map(x => x.trim().replace(/\*\*/g, ''));
    return { n: Number(c[0]), lane: c[1], where: c[2], status: c[3], moved: c[4], next: c[5], needs: c[6] };
  });
}

export function buildReport({ now = new Date(), git = {}, thread = '', family = {}, leads = null,
  researchers = [], sources = [], registry = {}, images = {}, testCount = 0, migrations = {}, live = null } = {}) {
  const lanes = parseLanes(thread);
  const people = family.people ?? {};
  const allSeats = [2, 3, ...Object.keys(LINES).flatMap(c => seatsForLine(c, 3))];
  const named = allSeats.filter(s => people[s]?.given || people[s]?.surname).length;
  const tasks = openTasks(people, researchers, 3);
  const working = researchers.map(r => {
    const mine = tasks.filter(t => t.assigned === r.id);
    return { name: r.name, desk: r.desk, status: mine.length ? 'WORKING' : 'STANDING BY',
      on: mine[0]?.ask ?? null, queue: mine.length };
  });
  const needsChairman = lanes.filter(l => l.needs && l.needs !== '—');
  const econ = registry.economy ?? {};
  const daysSince = git.last_commit_at ? Math.floor((now - new Date(git.last_commit_at)) / 86400000) : null;

  const mathematics = {
    lanes_total: lanes.length,
    lanes_waiting_on_chairman: needsChairman.length,
    family_seats_named: `${named} / ${allSeats.length}`,
    family_percent_named: allSeats.length ? Math.round(100 * named / allSeats.length) : 0,
    open_research_tasks: tasks.length,
    researchers_working: working.filter(w => w.status === 'WORKING').length,
    researchers_total: researchers.length,
    worker_leads_waiting_review: leads?.leads?.length ?? 0,
    record_collections: sources.length,
    tests_defined: testCount,
    migrations_written: migrations.written ?? 0,
    migrations_applied_live: migrations.applied ?? 0,
    world_people: (registry.people ?? []).length,
    world_companies: (registry.companies ?? []).length,
    revenue_recorded: econ.recorded_revenue_minor ?? 0,
    payouts_recorded: econ.recorded_payouts_minor ?? 0,
    images_queued: (images.jobs ?? []).filter(j => j.status !== 'ACCEPTED').length,
    commits_last_7_days: git.commits_7d ?? 0,
    days_since_last_commit: daysSince
  };

  const questions = [
    ...needsChairman.slice(0, 6).map(l => `${l.lane}: ${l.needs}?`),
    named === 0 ? 'Who are your parents and four grandparents (even first names)?' : null,
    (images.jobs ?? []).some(j => j.blocked_on) ? 'Can you attach the reference pictures for the first image?' : null,
    econ.recorded_revenue_minor ? null : 'Earth lane: which shirt or digital product sells first? Our World: what is the REE smallest unit, and what does one hide sell for?'
  ].filter(Boolean);

  return {
    header: HEADER,
    checked_in_at: now.toISOString(),
    left_off: { commit: git.last_commit ?? null, message: git.last_message ?? null, at: git.last_commit_at ?? null, branch: git.branch ?? null },
    data_source_boundary: {
      spine_report: 'Computed from checked-in repository files: THREAD.md, lineage/family.json, lineage/leads/latest.json, world/registry.json, and world/image-queue.json.',
      root_house_worker: 'Reads lineage/family.json and writes lineage/leads/*.json in this repository; it does not read or write Supabase.',
      supabase_probe: 'Optional GitHub Actions read of department-code rows only; it does not write business or product records.',
      production_authority: 'vyc2st-ctrl/thylora-executive-dashboard; this development/history repository is not the live dashboard source.'
    },
    live_backend: { state: 'NOT_CHECKED_BY_THIS_WORKFLOW', detail: 'This GitHub report job does not measure the Supabase connector service health.' },
    github_actions_backend_read: live ?? { state: 'NOT_CONFIGURED', detail: 'The GitHub Actions backend read was not checked in this run.' },
    mathematics,
    working,
    worker: leads ? { last_run: leads.run_at, leads: leads.leads?.length ?? 0, errors: leads.errors?.length ?? 0 } : null,
    lanes,
    world: { people: registry.people ?? [], companies: registry.companies ?? [], economy: econ },
    images: images.jobs ?? [],
    questions
  };
}

export function toMarkdown(r) {
  const m = r.mathematics;
  const row = (k, v) => `| ${k.replace(/_/g, ' ')} | ${v ?? '—'} |`;
  return [
    `# ${r.header}`,
    `**Checked in:** ${r.checked_in_at.replace('T', ' ').slice(0, 16)} UTC · **Supabase connector health:** ${r.live_backend.state} — ${r.live_backend.detail} · **GitHub Actions backend read:** ${r.github_actions_backend_read.state}${r.github_actions_backend_read.detail ? ` — ${r.github_actions_backend_read.detail}` : ''}`,
    '',
    `## Where we left off`,
    `\`${r.left_off.commit ?? '?'}\` on \`${r.left_off.branch ?? '?'}\` · ${r.left_off.at ?? '?'}  `,
    `${r.left_off.message ?? ''}`,
    '',
    '',
    '## Data source boundary',
    '- Spine report calculations use checked-in repository files; they are not a live read of all backend records.',
    '- Root House reads `lineage/family.json` and saves leads to `lineage/leads/` in this repository. It does not write those leads to Supabase.',
    '- The optional Supabase check only reads department-code rows. It does not write product, sales, or workflow records.',
    '- The authoritative live dashboard source is `vyc2st-ctrl/thylora-executive-dashboard`; this repository is development/history.',
    '## Who is working',
    '| Name | Desk | Status | On |', '|---|---|---|---|',
    ...r.working.map(w => `| ${w.name} | ${w.desk.replace(/_/g, ' ').toLowerCase()} | ${w.status}${w.queue ? ` (${w.queue})` : ''} | ${w.on ?? '—'} |`),
    r.worker ? `\nResearch worker last ran ${r.worker.last_run} · ${r.worker.leads} leads · ${r.worker.errors} provider errors.` : '',
    '',
    '## Mathematics', '| Measure | Value |', '|---|---|',
    ...Object.entries(m).map(([k, v]) => row(k, v)),
    '',
    '## All lanes', '| # | Lane | Status | Next | Needs from Chairman |', '|---|---|---|---|---|',
    ...r.lanes.map(l => `| ${l.n} | ${l.lane} | ${l.status} | ${l.next} | ${l.needs} |`),
    '',
    '## The world', '**Companies**', ...r.world.companies.map(c => `- **${c.name}** — ${c.lane} · ${c.status}`),
    '', '**People**', ...r.world.people.map(p => `- ${p.name} — ${p.job} (${p.kind === 'WORLD_CHARACTER' ? 'world character' : 'open role'})`),
    '', `**Economy:** revenue recorded ${r.world.economy.recorded_revenue_minor ?? 0} · payouts recorded ${r.world.economy.recorded_payouts_minor ?? 0} · ${r.world.economy.note ?? ''}`,
    '',
    '## Waiting in the back (images)', ...r.images.map(j => `- **${j.id} ${j.title}** — ${j.status}${j.blocked_on ? ` · blocked on: ${j.blocked_on}` : ''}`),
    '',
    '## Questions for the Chairman', ...r.questions.map((q, i) => `${i + 1}. ${q}`),
    ''
  ].join('\n');
}
