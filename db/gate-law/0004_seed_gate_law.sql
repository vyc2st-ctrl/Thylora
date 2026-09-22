-- GATE LAW · 0004 · The gates in force at sequence 588
-- Work: THY-WORK-DYNAMIC-GATE-LAW-588
--
-- Every gate below is declared at version 1 from something this repository can
-- show. No gate is seeded from memory: where the evidence is a file, the file is
-- named; where there is no evidence yet, EVIDENCE says so in those words.
--
-- Idempotent: re-applying this file does not attempt a second version 1.

begin;

do $$
declare v_seq bigint := 588;
begin

  if not exists (select 1 from thy_gate_law where gate_key = 'GATE-DEPLOYMENT-AUTHORITY') then
    perform thy_gate_declare(
      'GATE-DEPLOYMENT-AUTHORITY',
      'DASHBOARD',
      'CHAIRMAN','Chairman',
      'DASHBOARD_AUTHORITY.md, committed in vyc2st-ctrl/Thylora',
      'This repository holds development source for the Chairman dashboard, and an earlier session treated it as the deployment source.',
      'Evaluated whenever a dashboard change is described as live, deployed, shipped or witnessed.',
      'BLOCKED',
      'The head in this repository is not the deployed head. Nothing here is live until it is merged into vyc2st-ctrl/thylora-executive-dashboard and witnessed on thylora-public-world.',
      'NO EXCEPTION. A change witnessed only in this repository is not witnessed.',
      'Deployment authority is vyc2st-ctrl/thylora-executive-dashboard to thylora-public-world. This repository is source, not authority.',
      v_seq, null, 'Holds until the Chairman moves deployment authority in writing.', 'DASHBOARD');
  end if;

  if not exists (select 1 from thy_gate_law where gate_key = 'GATE-BASELINE-FLOOR') then
    perform thy_gate_declare(
      'GATE-BASELINE-FLOOR',
      'DASHBOARD',
      'CHAIRMAN','Chairman',
      'dashboard-baseline.json (THY-DASH-FLOOR-20260823-001) and dashboard-baseline-gap.json',
      'The head in this repository is seven capabilities below its own recorded baseline, and the shortfall predates the OMNIVIEW delta.',
      'Evaluated on every change to dashboard-current-head.html.',
      'BLOCKED',
      'Product & Storefront, Commerce Proof, System Health, Required Chairman Action, Approvals, Digital Product Passports and Connection Evidence are named in the baseline and absent from the head in this repository. Whether the live head carries them was not checked and is not claimed.',
      'NO EXCEPTION for removal. A delta may leave the gap unchanged; it may not widen it.',
      'The baseline floor is not met by the head in this repository. The gap is recorded, guarded by a test, and not yet repaired.',
      v_seq, null, 'Holds until the gap file is empty or the Chairman restates the baseline.', 'DASHBOARD');
  end if;

  if not exists (select 1 from thy_gate_law where gate_key = 'GATE-BACKEND-EGRESS') then
    perform thy_gate_declare(
      'GATE-BACKEND-EGRESS',
      'BACKEND',
      'BACKEND_OF_RECORD','thylora-dash (jvsdxhrfhtlgaknhjxlz)',
      'Two build sessions recorded denied egress to jvsdxhrfhtlgaknhjxlz.supabase.co: WR-RAELINK-001 on 2026-09-11 and WR-OMNIVIEW-587 on 2026-09-22.',
      'Build sessions cannot reach the backend of record, so no live row can be read or written from a build.',
      'Evaluated whenever a session states the live value of anything held in thylora-dash.',
      'BLOCKED',
      'No live backend row has been read in this lane. Every SQL pack written here is verified against a throwaway PostgreSQL 16 database and held for Chairman execution.',
      'NO EXCEPTION. A number that was not read is reported as UNMEASURED, never as zero and never as an estimate.',
      'The backend of record is unreachable from build sessions. Backend state is written as reviewable SQL and verified locally; it is not applied and not read.',
      v_seq, null, 'Holds until a session reaches thylora-dash and records the read.', 'ECONOMY');
  end if;

  if not exists (select 1 from thy_gate_law where gate_key = 'GATE-OMNIVIEW-APPLIED') then
    perform thy_gate_declare(
      'GATE-OMNIVIEW-APPLIED',
      'OMNIVIEW',
      'CHAIRMAN','Chairman',
      'db/omniview/APPLY.md; db/omniview/validation/run.sh exits 0 against PostgreSQL 16',
      'The OMNIVIEW read model is written and verified locally but has not been applied to thylora-dash.',
      'Evaluated whenever CONTEXT or SEQUENCE is described as live.',
      'OPEN',
      'The pack applies cleanly twice and passes four proof tests locally. Applying it to the live backend is a production mutation held for the Chairman.',
      'NO EXCEPTION. Until the apply is recorded as a sequence, the surface reads NOT YET APPLIED rather than failing.',
      'OMNIVIEW is verified and not applied. CONTEXT and SEQUENCE are not live.',
      v_seq, null, 'Closes when the apply is recorded as a sequence above 588.', 'OMNIVIEW');
  end if;

  if not exists (select 1 from thy_gate_law where gate_key = 'GATE-DEAD-CONTROLS') then
    perform thy_gate_declare(
      'GATE-DEAD-CONTROLS',
      'SURFACE',
      'WORKROOM','THY-WORK-DASHBOARD-INTERACTION-CLOSEOUT-562',
      'tests/dead-controls.test.mjs sweeps every surface in the repository and fails on the first control with no destination.',
      'Dead buttons were found by inspection before, which meant a later change could reintroduce one silently.',
      'Evaluated on every push that changes a surface file.',
      'PASSED',
      'Every control on the dashboard, member app, sports surface, Time Run, public site, store, RAE Link, QYRIS and the OMNIVIEW surfaces reaches a real destination. The sweep is a regression test, so closeout is held by the test rather than by inspection.',
      'NO EXCEPTION. A control with no destination fails the suite; it is not annotated as known.',
      'Dead-control closeout is held closed by a regression test across every surface in the repository.',
      v_seq, null, 'Re-evaluated automatically by the test suite on every change.', 'DASHBOARD');
  end if;

  if not exists (select 1 from thy_gate_law where gate_key = 'GATE-SEQUENCE-HONESTY') then
    perform thy_gate_declare(
      'GATE-SEQUENCE-HONESTY',
      'SEQUENCE',
      'CHAIRMAN','Chairman',
      'db/omniview/0001_sequence_ledger.sql: the ledger refuses UPDATE and DELETE and enforces its own chain.',
      'A ledger that can be back-filled or rewritten cannot carry a truth class, and a milestone counted from invented sequences measures nothing.',
      'Evaluated whenever a sequence number is written or a milestone is compared.',
      'PASSED',
      'Sequences are appended, never edited. Sequences below 587 were not imported. No sequence between 589 and 873 may be manufactured to reach a milestone.',
      'NO EXCEPTION. A correction is a new sequence that names what it supersedes.',
      'Sequences are appended in order, never invented, never rewritten. The ledger opened at 587 and does not claim what it did not witness.',
      v_seq, null, 'Permanent law of the ledger; reviewed only if the Chairman restates it.', 'OMNIVIEW');
  end if;

end $$;

commit;
