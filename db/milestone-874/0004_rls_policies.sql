-- MILESTONE 874 · 0004 · Row level security
-- Work: THY-WORK-MILESTONE-874-588
-- A signed-in session reads the floor and the comparison. Readings are written
-- by the service role only, on a sequence that already exists.

begin;

alter table thy_milestone_metric  enable row level security;
alter table thy_milestone_reading enable row level security;

drop policy if exists thy_milestone_metric_read on thy_milestone_metric;
create policy thy_milestone_metric_read on thy_milestone_metric
  for select to authenticated using (true);

drop policy if exists thy_milestone_reading_read on thy_milestone_reading;
create policy thy_milestone_reading_read on thy_milestone_reading
  for select to authenticated using (true);

drop policy if exists thy_milestone_reading_service on thy_milestone_reading;
create policy thy_milestone_reading_service on thy_milestone_reading
  for insert to service_role with check (true);

-- No UPDATE or DELETE policy for any role: a reading is what was observed.

revoke all on thy_milestone_metric, thy_milestone_reading from anon;
grant select on thy_milestone_metric, thy_milestone_reading to authenticated;

grant execute on function thy_milestone_readback(bigint)        to authenticated;
grant execute on function thy_milestone_compare(bigint, bigint) to authenticated;

commit;
