-- QYRIS TRANSFER · behavioural checks
-- Every block below MUST fail. An ERROR line here is the passing result.
-- Work: THY-WORK-TRANSFER-RECURSION-588

\set ON_ERROR_STOP off

do $$
declare c bigint;
begin
  c := thy_qyris_open('BEHAVIOUR-TEST','Does the loop refuse to be short-circuited?',588);
  raise notice 'EXPECT-REJECT SETUP: cycle % opened with Q recorded', c;
end $$;

-- The loop runs in order ------------------------------------------------------
do $$
declare c bigint;
begin
  select cycle_id into c from thy_qyris_cycle where topic_key='BEHAVIOUR-TEST' order by cycle_no desc limit 1;
  perform thy_qyris_record(c,'I','integration before read','none');
  raise notice 'EXPECT-REJECT FAIL: I was recorded before Y and R';
exception when others then
  raise notice 'EXPECT-REJECT PASS: a stage cannot be recorded before the stages it depends on (%)', left(sqlerrm,110);
end $$;

do $$
declare c bigint;
begin
  select cycle_id into c from thy_qyris_cycle where topic_key='BEHAVIOUR-TEST' order by cycle_no desc limit 1;
  perform thy_qyris_transfer(c,'a question with nothing behind it',589);
  raise notice 'EXPECT-REJECT FAIL: a cycle transferred at stage 2';
exception when others then
  raise notice 'EXPECT-REJECT PASS: transfer is the sixth stage, not the second (%)', left(sqlerrm,110);
end $$;

do $$
declare c bigint;
begin
  select cycle_id into c from thy_qyris_cycle where topic_key='BEHAVIOUR-TEST' order by cycle_no desc limit 1;
  perform thy_qyris_record(c,'Q','a second, different question','none');
  raise notice 'EXPECT-REJECT FAIL: a cycle was given a second Q';
exception when others then
  raise notice 'EXPECT-REJECT PASS: a cycle has exactly one question (%)', left(sqlerrm,110);
end $$;

-- A cycle cannot be orphaned --------------------------------------------------
do $$ begin
  perform thy_qyris_open('BEHAVIOUR-TEST','a cycle with no parent, invented mid-chain',589);
  raise notice 'EXPECT-REJECT FAIL: a later cycle was opened with no parent';
exception when others then
  raise notice 'EXPECT-REJECT PASS: a later cycle is created by transfer and must name its parent (%)', left(sqlerrm,110);
end $$;

-- The frontier cannot be dropped ----------------------------------------------
-- Setup runs in its own block: a failed attempt rolls back the block it is in,
-- so raising the item here is what makes the next three checks meaningful.
do $$
declare c bigint;
begin
  select cycle_id into c from thy_qyris_cycle where topic_key='BEHAVIOUR-TEST' order by cycle_no desc limit 1;
  perform thy_qyris_frontier_add(c,'an item nobody wants to carry','QUESTION','Y');
  raise notice 'EXPECT-REJECT SETUP: one open frontier item raised on the test cycle';
end $$;

do $$
declare f bigint;
begin
  select id into f from thy_qyris_frontier where item='an item nobody wants to carry';
  delete from thy_qyris_frontier where id = f;
  raise notice 'EXPECT-REJECT FAIL: a frontier item was deleted';
exception when others then
  raise notice 'EXPECT-REJECT PASS: a frontier item cannot be deleted, only carried or closed with a reason (%)', left(sqlerrm,110);
end $$;

do $$
declare f bigint;
begin
  select id into f from thy_qyris_frontier where item='an item nobody wants to carry';
  perform thy_qyris_frontier_close(f, '');
  raise notice 'EXPECT-REJECT FAIL: a frontier item was closed with no reason';
exception when others then
  raise notice 'EXPECT-REJECT PASS: a frontier item cannot be closed silently (%)', left(sqlerrm,110);
end $$;

do $$
declare c bigint;
begin
  select cycle_id into c from thy_qyris_cycle where topic_key='BEHAVIOUR-TEST' order by cycle_no desc limit 1;
  perform thy_qyris_terminate(c, 'stopping here');
  raise notice 'EXPECT-REJECT FAIL: a chain ended with an open frontier item';
exception when others then
  raise notice 'EXPECT-REJECT PASS: a chain does not end on an open frontier (%)', left(sqlerrm,110);
end $$;

do $$
declare c bigint;
begin
  select cycle_id into c from thy_qyris_cycle where topic_key='BEHAVIOUR-TEST' order by cycle_no desc limit 1;
  perform thy_qyris_terminate(c, '');
  raise notice 'EXPECT-REJECT FAIL: a chain ended with no stated reason';
exception when others then
  raise notice 'EXPECT-REJECT PASS: a chain cannot end without saying why (%)', left(sqlerrm,110);
end $$;

-- A recorded stage is never rewritten -----------------------------------------
do $$
declare c bigint;
begin
  select cycle_id into c from thy_qyris_cycle where topic_key='BEHAVIOUR-TEST' order by cycle_no desc limit 1;
  update thy_qyris_stage set body = 'a tidier question' where cycle_id = c and stage = 'Q';
  raise notice 'EXPECT-REJECT FAIL: a recorded stage was edited';
exception when others then
  raise notice 'EXPECT-REJECT PASS: a recorded stage cannot be edited (%)', left(sqlerrm,110);
end $$;

-- A transferred cycle is closed ------------------------------------------------
do $$
declare c bigint;
begin
  c := thy_qyris_open('BEHAVIOUR-CLOSED','Does a transferred cycle stay closed?',588);
  perform thy_qyris_record(c,'Y','y','none');
  perform thy_qyris_record(c,'R','r','none');
  perform thy_qyris_record(c,'I','i','none');
  perform thy_qyris_record(c,'S','s','none');
  perform thy_qyris_transfer(c,'the next question',589);
  raise notice 'EXPECT-REJECT SETUP: BEHAVIOUR-CLOSED cycle 1 ran the full loop and transferred';
end $$;

do $$
declare c bigint;
begin
  select cycle_id into c from thy_qyris_cycle where topic_key='BEHAVIOUR-CLOSED' and cycle_no=1;
  perform thy_qyris_frontier_add(c,'raised after the fact','QUESTION','S');
  raise notice 'EXPECT-REJECT FAIL: a frontier item was added to a transferred cycle';
exception when others then
  raise notice 'EXPECT-REJECT PASS: a transferred cycle takes no new work (%)', left(sqlerrm,110);
end $$;

do $$
declare c bigint;
begin
  select cycle_id into c from thy_qyris_cycle where topic_key='BEHAVIOUR-CLOSED' and cycle_no=1;
  perform thy_qyris_transfer(c,'a second successor',590);
  raise notice 'EXPECT-REJECT FAIL: a cycle transferred twice';
exception when others then
  raise notice 'EXPECT-REJECT PASS: a cycle transfers once; two successors would be a fork (%)', left(sqlerrm,110);
end $$;
