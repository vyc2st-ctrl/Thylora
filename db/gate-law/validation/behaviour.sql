-- GATE LAW · behavioural checks
-- Every block below MUST fail. An ERROR line here is the passing result.
-- Work: THY-WORK-DYNAMIC-GATE-LAW-588

\set ON_ERROR_STOP off

-- EXPLICIT SUPERSESSION ONLY --------------------------------------------------
do $$ begin
  perform thy_gate_declare('GATE-TEST-A','TEST','CHAIRMAN','Chairman','none','ctx','trg',
    'OPEN','reason','NO EXCEPTION','readback',588,null,'no review');
  raise notice 'EXPECT-REJECT SETUP: GATE-TEST-A declared at version 1';
end $$;

do $$ begin
  -- A second version that names nothing.
  insert into thy_gate_law (gate_key,version,scope,authority,authority_holder,evidence,context,
    trigger_condition,gate_state,state_reason,exception_clause,supersedes_version,readback,
    no_review_reason,entered_sequence_no)
  values ('GATE-TEST-A',2,'TEST','CHAIRMAN','Chairman','none','ctx','trg','OPEN','reason',
    'NO EXCEPTION',null,'readback','no review',589);
  raise notice 'EXPECT-REJECT FAIL: version 2 was accepted without naming what it supersedes';
exception when others then
  raise notice 'EXPECT-REJECT PASS: a later version must name what it supersedes (%)', left(sqlerrm,110);
end $$;

-- NO OLD RULE OVERRIDING NEWER RULE -------------------------------------------
do $$ begin
  perform thy_gate_supersede('GATE-TEST-A',1,'TEST','CHAIRMAN','Chairman','none','ctx','trg',
    'HELD','reason 2','NO EXCEPTION','readback 2',589,null,'no review');
  perform thy_gate_supersede('GATE-TEST-A',2,'TEST','CHAIRMAN','Chairman','none','ctx','trg',
    'PASSED','reason 3','NO EXCEPTION','readback 3',590,null,'no review');
  raise notice 'EXPECT-REJECT SETUP: GATE-TEST-A is now at version 3';
end $$;

do $$ begin
  -- A rule drafted against version 1 arriving after version 3 is in force.
  perform thy_gate_supersede('GATE-TEST-A',1,'TEST','CHAIRMAN','Chairman','none','ctx','trg',
    'OPEN','stale author still believes version 1 is current','NO EXCEPTION','stale readback',591,null,'no review');
  raise notice 'EXPECT-REJECT FAIL: a rule superseding version 1 was accepted while version 3 was current';
exception when others then
  raise notice 'EXPECT-REJECT PASS: an old rule cannot override a newer one (%)', left(sqlerrm,110);
end $$;

do $$ begin
  -- Re-declaring a version that already exists.
  insert into thy_gate_law (gate_key,version,scope,authority,authority_holder,evidence,context,
    trigger_condition,gate_state,state_reason,exception_clause,supersedes_version,readback,
    no_review_reason,entered_sequence_no)
  values ('GATE-TEST-A',2,'TEST','CHAIRMAN','Chairman','none','ctx','trg','OPEN','reason',
    'NO EXCEPTION',1,'readback','no review',591);
  raise notice 'EXPECT-REJECT FAIL: version 2 was rewritten while version 3 was current';
exception when others then
  raise notice 'EXPECT-REJECT PASS: a version at or below the current one is refused (%)', left(sqlerrm,110);
end $$;

-- NO SILENT MUTATION ----------------------------------------------------------
do $$ begin
  update thy_gate_law set gate_state = 'PASSED' where gate_key = 'GATE-TEST-A' and version = 1;
  raise notice 'EXPECT-REJECT FAIL: a gate rule was edited in place';
exception when others then
  raise notice 'EXPECT-REJECT PASS: a gate rule cannot be edited in place (%)', left(sqlerrm,110);
end $$;

do $$ begin
  delete from thy_gate_law where gate_key = 'GATE-TEST-A' and version = 1;
  raise notice 'EXPECT-REJECT FAIL: a gate rule was deleted';
exception when others then
  raise notice 'EXPECT-REJECT PASS: a gate rule cannot be deleted (%)', left(sqlerrm,110);
end $$;

-- A gate must answer every field ----------------------------------------------
do $$ begin
  perform thy_gate_declare('GATE-TEST-B','TEST','CHAIRMAN','Chairman','none','ctx','trg',
    'OPEN','reason',null,'readback',588,null,'no review');
  raise notice 'EXPECT-REJECT FAIL: a gate with no EXCEPTION field was accepted';
exception when others then
  raise notice 'EXPECT-REJECT PASS: silence is never read as permission; EXCEPTION must be stated (%)', left(sqlerrm,110);
end $$;

do $$ begin
  perform thy_gate_declare('GATE-TEST-C','TEST','CHAIRMAN','Chairman','none','ctx','trg',
    'OPEN','reason','NO EXCEPTION','readback',588,null,null);
  raise notice 'EXPECT-REJECT FAIL: a gate with neither a review date nor a reason was accepted';
exception when others then
  raise notice 'EXPECT-REJECT PASS: NEXT REVIEW must be a date or a stated reason there is none (%)', left(sqlerrm,110);
end $$;

do $$ begin
  perform thy_gate_declare('GATE-TEST-D','TEST','PRESIDENT','Someone','none','ctx','trg',
    'OPEN','reason','NO EXCEPTION','readback',588,null,'no review');
  raise notice 'EXPECT-REJECT FAIL: an invented authority was accepted';
exception when others then
  raise notice 'EXPECT-REJECT PASS: an invented authority is refused (%)', left(sqlerrm,110);
end $$;

do $$ begin
  perform thy_gate_supersede('GATE-TEST-NOPE',1,'TEST','CHAIRMAN','Chairman','none','ctx','trg',
    'OPEN','reason','NO EXCEPTION','readback',588,null,'no review');
  raise notice 'EXPECT-REJECT FAIL: an undeclared gate was superseded';
exception when others then
  raise notice 'EXPECT-REJECT PASS: a gate that was never declared cannot be superseded (%)', left(sqlerrm,110);
end $$;

-- A retired gate stays retired ------------------------------------------------
do $$ begin
  perform thy_gate_supersede('GATE-TEST-A',3,'TEST','CHAIRMAN','Chairman','none','ctx','trg',
    'RETIRED','work finished','NO EXCEPTION','retired readback',592,null,'retired');
  perform thy_gate_supersede('GATE-TEST-A',4,'TEST','CHAIRMAN','Chairman','none','ctx','trg',
    'OPEN','quietly revived','NO EXCEPTION','revived readback',593,null,'no review');
  raise notice 'EXPECT-REJECT FAIL: a retired gate was revived as a new version';
exception when others then
  raise notice 'EXPECT-REJECT PASS: a retired gate is not revived by a later version (%)', left(sqlerrm,110);
end $$;
