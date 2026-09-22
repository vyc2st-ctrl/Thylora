-- GATE LAW · 0003 · Row level security
-- Work: THY-WORK-DYNAMIC-GATE-LAW-588
--
-- A signed-in THYLORA session may READ the law. Nobody writes it through the
-- API: a gate version is put in force by the service role, on a recorded
-- sequence. This is the RLS half of NO SILENT MUTATION — the append-only
-- trigger stops a rewrite, these policies stop an unattributed write.

begin;

alter table thy_gate_law enable row level security;

drop policy if exists thy_gate_law_read on thy_gate_law;
create policy thy_gate_law_read on thy_gate_law
  for select to authenticated using (true);

drop policy if exists thy_gate_law_service_write on thy_gate_law;
create policy thy_gate_law_service_write on thy_gate_law
  for insert to service_role with check (true);

-- No UPDATE or DELETE policy exists for any role, including service_role.
-- The absence is the point: there is no path that edits a rule in place.

revoke all on thy_gate_law from anon;
grant select on thy_gate_law to authenticated;
grant select on thy_gate_law_current to authenticated;

grant execute on function thy_gate_current(text)                              to authenticated;
grant execute on function thy_gate_law_readback(text, text, timestamptz)      to authenticated;
grant execute on function thy_gate_law_field_order()                          to authenticated;

-- Write path: service role only.
revoke execute on function thy_gate_declare(text,text,text,text,text,text,text,text,text,text,text,bigint,timestamptz,text,text)   from authenticated;
revoke execute on function thy_gate_supersede(text,int,text,text,text,text,text,text,text,text,text,text,bigint,timestamptz,text,text) from authenticated;

commit;
