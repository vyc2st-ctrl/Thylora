// SIX UNDERSTANDING ENGINE · twin check
// Workroom: WR-SIXENGINE-001
//
// The L × M × S rule exists twice: in six-engine/lib/mathload.js (what the app
// shows a learner) and in sixu_diagnose_load (what the backend stores). Two
// implementations of one rule drift, and the drift is invisible until a child is
// told they cannot do mathematics.
//
// This walks every combination of L, M, S and the two control flags across both
// implementations and fails on the first disagreement.
//
//   sudo service postgresql start
//   db/six-engine/validation/run.sh          # apply the migrations first
//   node db/six-engine/validation/twin-check.mjs
//
// Requires a psql that can reach the validation database. Set SIXU_PSQL to
// override the command (e.g. "su postgres -c psql" style wrappers).

import { execSync } from 'node:child_process';
import { diagnose } from '../../../six-engine/lib/mathload.js';

const DB = process.env.SIXU_VALIDATION_DB ?? 'sixu_check';
const LEVELS = { L: [null, 0, 0.2, 0.49, 0.5, 0.8, 1], M: [null, 0.2, 0.59, 0.6, 1], S: [null, 0.3, 0.59, 0.6, 1] };

const grid = [];
for (const L of LEVELS.L) for (const M of LEVELS.M) for (const S of LEVELS.S)
  for (const m_controlled of [true, false]) for (const s_controlled of [true, false])
    grid.push({ L, M, S, m_controlled, s_controlled });

const lit = (v) => (v === null ? 'null' : v);
const rows = grid.map((g, i) =>
  `select ${i} as i, sixu_diagnose_load(${lit(g.L)},${lit(g.M)},${lit(g.S)},${g.m_controlled},${g.s_controlled}) as d`
).join(' union all ');

const command = `psql -qtA -F'|' -d ${DB} -c "select i, d from (${rows}) t order by i"`;

let out;
try {
  out = execSync(process.env.SIXU_PSQL ? `${process.env.SIXU_PSQL} ${JSON.stringify(command)}` : command,
    { encoding: 'utf8', maxBuffer: 1 << 26, stdio: ['ignore', 'pipe', 'pipe'] });
} catch (err) {
  // The query is thousands of characters long; dumping it helps nobody.
  console.error(`twin check could not reach the validation database "${DB}".`);
  console.error(String(err.stderr ?? '').trim().split('\n').slice(0, 3).join('\n'));
  console.error('Apply the migrations first (db/six-engine/validation/run.sh).');
  console.error('If psql runs as another OS user here, set SIXU_PSQL, e.g.  SIXU_PSQL="su postgres -c" node ...');
  process.exit(2);
}

let mismatches = 0;
for (const line of out.trim().split('\n')) {
  const [idx, json] = line.split('|');
  const input = grid[Number(idx)];
  const sql = JSON.parse(json);
  const js = diagnose({
    language: { L: input.L },
    mathematical: { M: input.M, controlled_measurement: input.m_controlled },
    procedure: { S: input.S, controlled_measurement: input.s_controlled }
  });
  const agree =
    sql.verdict === js.verdict &&
    sql.mathematics_deficit_claim === js.mathematics_deficit_claim &&
    (sql.M ?? null) === js.M && (sql.S ?? null) === js.S &&
    (sql.p_solve === null ? js.P_solve === null : Math.abs(sql.p_solve - js.P_solve) < 0.002);

  if (!agree) {
    mismatches++;
    if (mismatches <= 5) {
      console.error('MISMATCH', JSON.stringify(input));
      console.error('  sql:', sql.verdict, sql.mathematics_deficit_claim, 'M=' + sql.M, 'S=' + sql.S, 'P=' + sql.p_solve);
      console.error('  js :', js.verdict, js.mathematics_deficit_claim, 'M=' + js.M, 'S=' + js.S, 'P=' + js.P_solve);
    }
  }
}

console.log(`twin check: ${grid.length} input combinations, ${mismatches} mismatch(es)`);
process.exit(mismatches === 0 ? 0 : 1);
