-- SPINE 588 · behavioural checks
-- These prove the head DEGRADES honestly rather than failing or lying.
-- Work: THY-WORK-DASHBOARD-INTERACTION-CLOSEOUT-562
--
-- The check removes a pack to see what the head says about it, so the whole file
-- runs inside a transaction that is ROLLED BACK. DDL is transactional in
-- PostgreSQL, so the dropped table is back before anything else reads it.

begin;

do $$
declare v jsonb;
begin
  drop table thy_gate_law cascade;

  v := thy_spine_head();
  if jsonb_array_length(v->'not_applied') = 0 then
    raise notice 'EXPECT-REJECT FAIL: the gate law was missing and the head said nothing';
  else
    raise notice 'EXPECT-REJECT PASS: a missing pack is named, not silently skipped (%)',
      left(v->'not_applied'->>0, 90);
  end if;

  if v->'current_gates' is not null and v->'current_gates' <> 'null'::jsonb then
    raise notice 'EXPECT-REJECT FAIL: CURRENT GATES returned content from a pack that is not applied';
  else
    raise notice 'EXPECT-REJECT PASS: an unavailable surface returns nothing rather than stale content';
  end if;

  v := thy_spine_next_question();
  if jsonb_array_length(v->'not_read') = 0 then
    raise notice 'EXPECT-REJECT FAIL: blocking gates were unreadable and not_read was empty';
  else
    raise notice 'EXPECT-REJECT PASS: an unreadable source is declared in not_read (%)',
      left(v->'not_read'->>0, 90);
  end if;

  -- And the head still answers from what IS present.
  if v->'next_question' is null then
    raise notice 'EXPECT-REJECT FAIL: the head failed outright instead of degrading';
  else
    raise notice 'EXPECT-REJECT PASS: the head still answers from the packs that are present (%)',
      left(v->'next_question'->>'source', 40);
  end if;
end $$;

rollback;

-- Confirm the rollback actually restored the pack, so the proofs that follow
-- run against a complete database rather than the wreckage of this check.
do $$ begin
  if to_regclass('public.thy_gate_law') is null then
    raise notice 'EXPECT-REJECT FAIL: the gate law was not restored by rollback';
  else
    raise notice 'EXPECT-REJECT PASS: the removed pack was restored by rollback';
  end if;
end $$;
