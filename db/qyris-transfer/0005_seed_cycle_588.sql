-- QYRIS TRANSFER · 0005 · The cycle this build actually ran
-- Work: THY-WORK-TRANSFER-RECURSION-588
--
-- Not an example. This is the Q -> Y -> R -> I -> S -> T of sequence 588 on the
-- SPINE, with the frontier it genuinely left open, so the next context inherits
-- the real thread rather than a tidied one.
--
-- Idempotent: re-applying does not open a second cycle 1.

begin;

do $$
declare c1 bigint;
begin
  if exists (select 1 from thy_qyris_cycle where topic_key = 'SPINE') then
    return;
  end if;

  c1 := thy_qyris_open('SPINE',
    'What is the head of THYLORA at sequence 588, and what actually landed on the branches that claim it?',
    588);

  perform thy_qyris_record(c1,'Y',
    'Four Claude branches claim work at or near 588 — omniview-sequence, qyris-support-build, genealogy-commerce and tomorrows-starting-packet. '
    'None is merged to main. GitHub reports the patch-dashboard workflows returning no jobs. '
    'Unknowns: whether those branches hold real deltas or only workroom prose, whether they conflict, and why every workflow run fails.',
    'mcp github list_branches; git diff --stat main...origin/<branch> for each of the four');

  perform thy_qyris_record(c1,'R',
    'Read the repository and the GitHub API. All four branches hold real deltas: 3,851 / 9,323 / 2,702 / 3,175 lines. '
    'All four merge into main with zero conflicts and 339 tests pass on the merged head. '
    'The last 20 workflow runs are all conclusion=failure with the workflow file path as the run name, which is a startup failure, not a job failure. '
    'The backend of record was NOT read: egress to jvsdxhrfhtlgaknhjxlz.supabase.co remains denied.',
    'git merge x4, npm test (339 pass), mcp github actions_list, python yaml.safe_load over .github/workflows/*.yml');

  perform thy_qyris_record(c1,'I',
    'The branches are not proposals, they are the head — the head was simply never assembled. '
    'The workflow failure has a single mechanical cause: four workflow files embed a Python raw string whose lines start at column 0, '
    'which terminates the YAML block scalar, so the file never parses and no job is ever created. '
    'That is why the dashboard was reported as patched while nothing was patched.',
    'yaml.safe_load raises ScannerError at r6:37, r7:33, r7-repair:53, r8:73; r3 and spine-forward-both parse cleanly');

  perform thy_qyris_record(c1,'S',
    'Settled: the head is the merge of the four branches plus this delta; the workflow cause is identified and fixed in place; '
    'the gate law, the transfer recursion and the 874 milestone floor are written and verified against PostgreSQL 16. '
    'Not settled: nothing is applied to thylora-dash, nothing is witnessed on thylora-public-world, '
    'and every commerce number at 588 is UNMEASURED rather than zero.',
    'db/gate-law/validation/run.sh, db/qyris-transfer/validation/run.sh, db/milestone-874/validation/run.sh');

  -- The frontier this build genuinely leaves open.
  perform thy_qyris_frontier_add(c1,
    'The OMNIVIEW, gate-law, transfer and milestone packs are verified locally and not applied to thylora-dash.','GATE','S');
  perform thy_qyris_frontier_add(c1,
    'The head in this repository is seven capabilities below dashboard-baseline.json, and the live head was not checked.','GATE','R');
  perform thy_qyris_frontier_add(c1,
    'No build session has reached the backend of record in two lanes; every commerce figure at 588 is UNMEASURED.','RISK','R');
  perform thy_qyris_frontier_add(c1,
    'Five registered topics have no source: CASTLE, INÉS, VERONICA, FOOTBALL, VEHICLES. ALISTAIR and SPORTS join them at 588.','QUESTION','I');
  perform thy_qyris_frontier_add(c1,
    'The Chairman local timezone of record is unknown, so LOCAL DATE/TIME still defaults to UTC.','QUESTION','Y');
  perform thy_qyris_frontier_add(c1,
    'Sequences 589 to 873 have not happened. Milestone 874 cannot be compared until they do.','WORK','S');

  -- The cycle is left OPEN on purpose. T is written by whoever carries 588
  -- forward, and the transfer is what creates 589 — not this file.
end $$;

commit;
