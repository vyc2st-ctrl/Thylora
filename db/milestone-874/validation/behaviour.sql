-- MILESTONE 874 · behavioural checks
-- Every block below MUST fail. An ERROR line here is the passing result.
-- Work: THY-WORK-MILESTONE-874-588

\set ON_ERROR_STOP off

-- DO NOT MANUFACTURE SEQUENCES ------------------------------------------------
do $$ begin
  perform thy_milestone_record(874,'REVENUE','MEASURED','invented',588, 1000000);
  raise notice 'EXPECT-REJECT FAIL: a reading was recorded at a sequence that has not happened';
exception when others then
  raise notice 'EXPECT-REJECT PASS: a milestone cannot be recorded before its sequence exists (%)', left(sqlerrm,120);
end $$;

-- UNMEASURED IS NOT ZERO ------------------------------------------------------
do $$ begin
  perform thy_milestone_record(588,'REVENUE','UNMEASURED','no source',588, 0, null, 'we did not look');
  raise notice 'EXPECT-REJECT FAIL: an unmeasured reading was given a number';
exception when others then
  raise notice 'EXPECT-REJECT PASS: an unmeasured reading cannot carry a number (%)', left(sqlerrm,120);
end $$;

do $$ begin
  perform thy_milestone_record(588,'SOCIAL','UNMEASURED','no source',588, null, null, null);
  raise notice 'EXPECT-REJECT FAIL: an unmeasured reading was accepted with no reason';
exception when others then
  raise notice 'EXPECT-REJECT PASS: an unmeasured reading must say why it is unmeasured (%)', left(sqlerrm,120);
end $$;

do $$ begin
  perform thy_milestone_record(588,'ORDERS','MEASURED','a source',588, null, null, null);
  raise notice 'EXPECT-REJECT FAIL: a measured reading was accepted with no value';
exception when others then
  raise notice 'EXPECT-REJECT PASS: a measured reading must carry what was measured (%)', left(sqlerrm,120);
end $$;

do $$ begin
  perform thy_milestone_record(588,'REVENUE','GUESSED','a hunch',588, null, null, 'roughly');
  raise notice 'EXPECT-REJECT FAIL: an invented measurement state was accepted';
exception when others then
  raise notice 'EXPECT-REJECT PASS: an invented measurement state is refused (%)', left(sqlerrm,120);
end $$;

do $$ begin
  perform thy_milestone_record(588,'VIBES','MEASURED','a feeling',588, 10);
  raise notice 'EXPECT-REJECT FAIL: a metric outside the ten was accepted';
exception when others then
  raise notice 'EXPECT-REJECT PASS: a measure outside the ten named at 588 is refused (%)', left(sqlerrm,120);
end $$;

-- A READING IS NOT REVISED ----------------------------------------------------
do $$ begin
  update thy_milestone_reading set value_numeric = 999 where milestone_no = 588 and metric_key = 'WORLD_WINDOWS';
  raise notice 'EXPECT-REJECT FAIL: a recorded reading was edited';
exception when others then
  raise notice 'EXPECT-REJECT PASS: a recorded reading cannot be edited (%)', left(sqlerrm,120);
end $$;

do $$ begin
  delete from thy_milestone_reading where milestone_no = 588 and metric_key = 'REVENUE';
  raise notice 'EXPECT-REJECT FAIL: a recorded reading was deleted';
exception when others then
  raise notice 'EXPECT-REJECT PASS: a recorded reading cannot be deleted (%)', left(sqlerrm,120);
end $$;

do $$ begin
  perform thy_milestone_record(588,'WORLD_WINDOWS','MEASURED','a second opinion',588, 99);
  raise notice 'EXPECT-REJECT FAIL: a second reading of the same measure at the same milestone was accepted';
exception when others then
  raise notice 'EXPECT-REJECT PASS: one measure has one reading per milestone (%)', left(sqlerrm,120);
end $$;
