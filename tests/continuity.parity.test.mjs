// THY-CONTINUITY-WATCHDOG-001 · the backend rule and the JavaScript rule agree.
//
// Two implementations of one rule is two rules unless something holds them
// level. This runs the same cases through thy_continuity_classify in PostgreSQL
// and through the watchdog in this repository, and fails if any verdict differs.
//
// It needs a local PostgreSQL to run against. With none reachable it skips
// rather than passing quietly — a skipped parity check is reported as skipped.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { postTask, preTask } from '../spine/continuity/watchdog.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DB = process.env.CONTINUITY_PARITY_DB ?? 'continuity_parity';
const AUTHORITY = 'CHAIR-PARITY';
const NOW = new Date();
const iso = date => date.toISOString();
const daysAgo = n => iso(new Date(NOW.getTime() - n * 86400000));

const RECORDED = daysAgo(400);

/**
 * One case = one subject, so a supersession written for one case cannot reach
 * another. Each carries what the rule needs and the verdict both sides must give.
 */
const CASES = [
  { ref: 'S01', field: 'names', controlling: 'Ada Vyc2st', current: 'Ada  VYC2ST', expect: 'UNCHANGED' },
  { ref: 'S02', field: 'names', controlling: 'Ada Vyc2st', current: 'Ada Vycst', expect: 'DRIFTED' },
  { ref: 'S03', field: 'names', controlling: 'Ada Vyc2st', current: null, expect: 'MISSING' },
  { ref: 'S04', field: 'ages', controlling: 34, current: 35, expect: 'ADVANCED' },
  { ref: 'S05', field: 'ages', controlling: 34, current: 33, expect: 'DRIFTED' },
  { ref: 'S06', field: 'ages', controlling: 34, current: 41, expect: 'DRIFTED' },
  { ref: 'S07', field: 'publication_state', controlling: 'REVIEW', current: 'PUBLISHED', expect: 'DRIFTED' },
  { ref: 'S08', field: 'publication_state', controlling: 'REVIEW', current: 'PUBLISHED', authority: AUTHORITY, expect: 'ADVANCED' },
  { ref: 'S09', field: 'publication_state', controlling: 'PUBLISHED', current: 'REVIEW', authority: AUTHORITY, expect: 'DRIFTED' },
  { ref: 'S10', field: 'store_state', controlling: 'DRAFT', current: 'SOLD_OUT', authority: AUTHORITY, expect: 'DRIFTED' },
  { ref: 'S11', field: 'price', controlling: 4900, current: 3900, expect: 'DRIFTED' },
  { ref: 'S12', field: 'price', controlling: 4900, current: 3900, expect: 'EXPLICITLY_SUPERSEDED',
    supersession: { from: 4900, to: 3900 } },
  { ref: 'S13', field: 'price', controlling: 4900, current: 2900, expect: 'CONFLICTING',
    supersession: { from: 4900, to: 3900 } },
  { ref: 'S14', field: 'active_workstreams', controlling: ['a', 'b', 'c'], current: ['a', 'b'], expect: 'MISSING' },
  { ref: 'S15', field: 'active_workstreams', controlling: ['a'], current: ['a', 'b'], expect: 'ADVANCED' },
  { ref: 'S16', field: 'family_relationships', controlling: ['mother: Rae'], current: ['mother: Rae', 'aunt: Ola'], expect: 'DRIFTED' },
  { ref: 'S17', field: 'family_relationships', controlling: ['mother: Rae', 'sister: Nia'], current: ['mother: Rae'], expect: 'MISSING' },
  { ref: 'S18', field: 'dimensions', controlling: '1080x1920', current: '1080X1920', expect: 'UNCHANGED' },
  { ref: 'S19', field: 'geometry', controlling: 12.5, current: 12.51, expect: 'DRIFTED' },
  { ref: 'S20', field: 'world_coordinates', controlling: '48.8566,2.3522', current: '48.8566,2.3522', expect: 'UNCHANGED' },
  { ref: 'S21', field: 'delivery', controlling: 'PREPARING', current: 'IN_TRANSIT', expect: 'ADVANCED' },
  { ref: 'S22', field: 'delivery', controlling: 'DELIVERED', current: 'PREPARING', expect: 'DRIFTED' },
  { ref: 'S23', field: 'vyc2st_mark', controlling: 'VYC2ST//469', current: 'VYC2ST//470', expect: 'DRIFTED' },
  { ref: 'S24', field: 'barrier', controlling: 'SEALED', current: 'SEALED', expect: 'UNCHANGED' },
  { ref: 'S25', field: 'person_state', controlling: 'ACTIVE', current: 'ARCHIVED', authority: AUTHORITY, expect: 'ADVANCED' },
  { ref: 'S26', field: 'person_state', controlling: 'ACTIVE', current: 'ARCHIVED', authority: 'NOT-A-REAL-AUTHORITY', expect: 'DRIFTED' }
];

/** psql as the invoking user, or as postgres when root and that works. */
function psqlCommand() {
  const tries = [['psql', []], ['sudo', ['-u', 'postgres', 'psql']]];
  for (const [bin, prefix] of tries) {
    try {
      execFileSync(bin, [...prefix, '-tAq', '-c', 'select 1'], { stdio: 'pipe' });
      return { bin, prefix };
    } catch { /* try the next one */ }
  }
  return null;
}

const psql = psqlCommand();

const sqlLiteral = value => `'${JSON.stringify(value ?? null).replaceAll("'", "''")}'::jsonb`;

test('the backend rule and the JavaScript rule return the same verdict', { skip: psql ? false : 'no local PostgreSQL reachable' }, () => {
  const run = (args, input) =>
    execFileSync(psql.bin, [...psql.prefix, ...args], { input, encoding: 'utf8', stdio: 'pipe' });

  run(['-q', '-c', `drop database if exists ${DB}`]);
  run(['-q', '-c', `create database ${DB}`]);
  // Piped rather than read with -f: psql may be running as another user that
  // cannot read this checkout or a temp file created here.
  const apply = file => run(['-q', '-v', 'ON_ERROR_STOP=1', '-d', DB],
    readFileSync(join(ROOT, file), 'utf8'));
  apply('db/rae-link/validation/supabase_stub.sql');
  apply('db/continuity/0001_continuity_watchdog.sql');
  apply('db/continuity/0002_watchdog_functions.sql');

  const setup = [
    `insert into thy_continuity_authorities(authority_ref, authority_kind) values ('${AUTHORITY}','CHAIRMAN');`,
    ...CASES.filter(c => c.supersession).map(c =>
      `insert into thy_continuity_supersessions
         (subject_kind, subject_ref, field_key, from_value, to_value, authority_ref, reason)
       values ('PARITY','${c.ref}','${c.field}',${sqlLiteral(c.supersession.from)},
               ${sqlLiteral(c.supersession.to)},'${AUTHORITY}','parity fixture');`)
  ].join('\n');

  const queries = CASES.map(c => `select '${c.ref}=' || (thy_continuity_classify(
    '${c.field}', '${c.ref}', ${sqlLiteral(c.controlling)}, ${sqlLiteral(c.current)},
    '${RECORDED}'::timestamptz, ${c.authority ? `'${c.authority}'` : 'null'}, true, false,
    '${iso(NOW)}'::timestamptz)->>'classification');`).join('\n');

  const out = run(['-tAq', '-v', 'ON_ERROR_STOP=1', '-d', DB], `${setup}\n${queries}\n`);

  const fromSql = Object.fromEntries(out.trim().split('\n')
    .filter(Boolean).map(line => line.split('=')));

  const mismatches = [];
  for (const c of CASES) {
    const brief = preTask({ task_ref: `PARITY-${c.ref}`, now: iso(NOW) }, {
      facts: [{
        subject_kind: 'PARITY', subject_ref: c.ref, field_key: c.field,
        value: c.controlling, sequence_no: 1, recorded_at: RECORDED
      }],
      authorities: [AUTHORITY],
      supersessions: c.supersession ? [{
        subject_ref: c.ref, field_key: c.field,
        from_value: c.supersession.from, to_value: c.supersession.to,
        authority_ref: AUTHORITY, approved_at: daysAgo(1), reason: 'parity fixture'
      }] : []
    });
    const produced = {
      [c.ref]: {
        [c.field]: c.authority ? { value: c.current, authority_ref: c.authority } : c.current
      }
    };
    const js = postTask(brief, produced, { now: iso(NOW) }).findings[0].classification;

    if (js !== c.expect) mismatches.push(`${c.ref} ${c.field}: JS said ${js}, expected ${c.expect}`);
    if (fromSql[c.ref] !== c.expect) mismatches.push(`${c.ref} ${c.field}: SQL said ${fromSql[c.ref]}, expected ${c.expect}`);
    if (js !== fromSql[c.ref]) mismatches.push(`${c.ref} ${c.field}: JS ${js} != SQL ${fromSql[c.ref]}`);
  }

  assert.equal(Object.keys(fromSql).length, CASES.length, 'the backend did not answer every case');
  assert.deepEqual(mismatches, []);
});
