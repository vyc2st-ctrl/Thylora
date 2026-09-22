-- QYRIS TRANSFER · 0004 · Row level security
-- Work: THY-WORK-TRANSFER-RECURSION-588
-- A signed-in session reads the loop. Only the service role writes it, so a
-- cycle always carries the sequence that opened it.

begin;

alter table thy_qyris_cycle    enable row level security;
alter table thy_qyris_stage    enable row level security;
alter table thy_qyris_frontier enable row level security;

do $$
declare t text;
begin
  foreach t in array array['thy_qyris_cycle','thy_qyris_stage','thy_qyris_frontier'] loop
    execute format('drop policy if exists %I_read on %I', t, t);
    execute format('create policy %I_read on %I for select to authenticated using (true)', t, t);
    execute format('drop policy if exists %I_service on %I', t, t);
    execute format('create policy %I_service on %I for insert to service_role with check (true)', t, t);
    execute format('revoke all on %I from anon', t);
    execute format('grant select on %I to authenticated', t);
  end loop;
end $$;

-- The frontier is the one table that must also be updatable by the service role:
-- carrying an item forward marks the original CARRIED. Nothing else is updatable.
drop policy if exists thy_qyris_frontier_service_update on thy_qyris_frontier;
create policy thy_qyris_frontier_service_update on thy_qyris_frontier
  for update to service_role using (true) with check (true);

drop policy if exists thy_qyris_cycle_service_update on thy_qyris_cycle;
create policy thy_qyris_cycle_service_update on thy_qyris_cycle
  for update to service_role using (true) with check (true);

grant execute on function thy_qyris_loop(bigint)      to authenticated;
grant execute on function thy_qyris_chain(text, int)  to authenticated;
grant execute on function thy_qyris_stage_order()     to authenticated;

commit;
