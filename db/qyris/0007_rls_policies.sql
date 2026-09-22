-- THYLORA · QYRIS · 0007 · Row-level security
--
-- Two classes of table:
--
--   REFERENCE  the grammar itself — packs, nodes, deltas, axes, domains, role
--              families, scopes, breach categories, rules, the SR candidate and
--              its test results. Readable by anyone. Writable by no browser
--              session; these change by migration.
--
--   HOUSEHOLD  passes, answers, seats, grants, draws, breaches, conflicts,
--              disqualifications, appeals, audit. Reachable only by the
--              household owner.
--
-- Every table gets RLS. A table with RLS enabled and no policy is closed, which
-- is the safe default for anything added later and forgotten here.

do $$
declare t text;
begin
  foreach t in array array[
    'qyr_deltas','qyr_packs','qyr_nodes','qyr_node_deltas','qyr_rules',
    'qyr_passes','qyr_pass_answers','qyr_pass_settled','qyr_pass_disturbances',
    'qyr_axes','qyr_domains','qyr_axis_deltas','qyr_projections',
    'qyr_scopes','qyr_role_families','qyr_family_scopes',
    'qyr_households','qyr_seats','qyr_access_grants','qyr_resource_draws',
    'qyr_audit','qyr_breach_categories','qyr_breaches','qyr_self_disqualifications',
    'qyr_conflicts','qyr_restoration_checks','qyr_appeals',
    'qyr_sr_candidate','qyr_sr_factors','qyr_sr_floors','qyr_sr_observations','qyr_sr_test_results'
  ] loop
    if to_regclass(t) is not null then
      execute format('alter table %I enable row level security', t);
    end if;
  end loop;
end $$;

-- ── Reference data: read for everyone, write for nobody through the API ───
do $$
declare t text;
begin
  foreach t in array array[
    'qyr_deltas','qyr_packs','qyr_nodes','qyr_node_deltas','qyr_rules',
    'qyr_axes','qyr_domains','qyr_axis_deltas','qyr_projections',
    'qyr_scopes','qyr_role_families','qyr_family_scopes','qyr_breach_categories',
    'qyr_sr_candidate','qyr_sr_factors','qyr_sr_floors','qyr_sr_test_results'
  ] loop
    if to_regclass(t) is not null then
      execute format('drop policy if exists %I on %I', t || '_read', t);
      execute format('create policy %I on %I for select using (true)', t || '_read', t);
    end if;
  end loop;
end $$;

-- ── Household-scoped: owner only ──────────────────────────────────────────

drop policy if exists qyr_households_owner on qyr_households;
create policy qyr_households_owner on qyr_households
  for all using (owner_ref = auth.uid()::text) with check (owner_ref = auth.uid()::text);

drop policy if exists qyr_seats_owner on qyr_seats;
create policy qyr_seats_owner on qyr_seats
  for all using (exists (select 1 from qyr_households h
                          where h.household_id = qyr_seats.household_id and h.owner_ref = auth.uid()::text))
  with check (exists (select 1 from qyr_households h
                       where h.household_id = qyr_seats.household_id and h.owner_ref = auth.uid()::text));

drop policy if exists qyr_access_grants_owner on qyr_access_grants;
create policy qyr_access_grants_owner on qyr_access_grants
  for all using (exists (select 1 from qyr_seats s join qyr_households h on h.household_id = s.household_id
                          where s.seat_id = qyr_access_grants.seat_id and h.owner_ref = auth.uid()::text))
  with check (exists (select 1 from qyr_seats s join qyr_households h on h.household_id = s.household_id
                       where s.seat_id = qyr_access_grants.seat_id and h.owner_ref = auth.uid()::text));

drop policy if exists qyr_resource_draws_owner on qyr_resource_draws;
create policy qyr_resource_draws_owner on qyr_resource_draws
  for all using (exists (select 1 from qyr_seats s join qyr_households h on h.household_id = s.household_id
                          where s.seat_id = qyr_resource_draws.seat_id and h.owner_ref = auth.uid()::text))
  with check (exists (select 1 from qyr_seats s join qyr_households h on h.household_id = s.household_id
                       where s.seat_id = qyr_resource_draws.seat_id and h.owner_ref = auth.uid()::text));

drop policy if exists qyr_breaches_owner on qyr_breaches;
create policy qyr_breaches_owner on qyr_breaches
  for all using (exists (select 1 from qyr_seats s join qyr_households h on h.household_id = s.household_id
                          where s.seat_id = qyr_breaches.seat_id and h.owner_ref = auth.uid()::text))
  with check (exists (select 1 from qyr_seats s join qyr_households h on h.household_id = s.household_id
                       where s.seat_id = qyr_breaches.seat_id and h.owner_ref = auth.uid()::text));

drop policy if exists qyr_self_dq_owner on qyr_self_disqualifications;
create policy qyr_self_dq_owner on qyr_self_disqualifications
  for all using (exists (select 1 from qyr_seats s join qyr_households h on h.household_id = s.household_id
                          where s.seat_id = qyr_self_disqualifications.seat_id and h.owner_ref = auth.uid()::text))
  with check (exists (select 1 from qyr_seats s join qyr_households h on h.household_id = s.household_id
                       where s.seat_id = qyr_self_disqualifications.seat_id and h.owner_ref = auth.uid()::text));

drop policy if exists qyr_conflicts_owner on qyr_conflicts;
create policy qyr_conflicts_owner on qyr_conflicts
  for all using (exists (select 1 from qyr_seats s join qyr_households h on h.household_id = s.household_id
                          where s.seat_id = qyr_conflicts.seat_id and h.owner_ref = auth.uid()::text))
  with check (exists (select 1 from qyr_seats s join qyr_households h on h.household_id = s.household_id
                       where s.seat_id = qyr_conflicts.seat_id and h.owner_ref = auth.uid()::text));

drop policy if exists qyr_appeals_owner on qyr_appeals;
create policy qyr_appeals_owner on qyr_appeals
  for all using (exists (select 1 from qyr_breaches b join qyr_seats s on s.seat_id = b.seat_id
                           join qyr_households h on h.household_id = s.household_id
                          where b.breach_id = qyr_appeals.breach_id and h.owner_ref = auth.uid()::text))
  with check (exists (select 1 from qyr_breaches b join qyr_seats s on s.seat_id = b.seat_id
                        join qyr_households h on h.household_id = s.household_id
                       where b.breach_id = qyr_appeals.breach_id and h.owner_ref = auth.uid()::text));

drop policy if exists qyr_restoration_owner on qyr_restoration_checks;
create policy qyr_restoration_owner on qyr_restoration_checks
  for all using (exists (select 1 from qyr_breaches b join qyr_seats s on s.seat_id = b.seat_id
                           join qyr_households h on h.household_id = s.household_id
                          where b.breach_id = qyr_restoration_checks.breach_id and h.owner_ref = auth.uid()::text))
  with check (exists (select 1 from qyr_breaches b join qyr_seats s on s.seat_id = b.seat_id
                        join qyr_households h on h.household_id = s.household_id
                       where b.breach_id = qyr_restoration_checks.breach_id and h.owner_ref = auth.uid()::text));

drop policy if exists qyr_sr_observations_owner on qyr_sr_observations;
create policy qyr_sr_observations_owner on qyr_sr_observations
  for all using (exists (select 1 from qyr_seats s join qyr_households h on h.household_id = s.household_id
                          where s.seat_id = qyr_sr_observations.seat_id and h.owner_ref = auth.uid()::text))
  with check (exists (select 1 from qyr_seats s join qyr_households h on h.household_id = s.household_id
                       where s.seat_id = qyr_sr_observations.seat_id and h.owner_ref = auth.uid()::text));

-- Audit is readable by the household and written only by triggers running as
-- the table owner. There is no INSERT, UPDATE or DELETE policy for a session.
drop policy if exists qyr_audit_owner_read on qyr_audit;
create policy qyr_audit_owner_read on qyr_audit
  for select using (exists (select 1 from qyr_households h
                             where h.household_id = qyr_audit.household_id and h.owner_ref = auth.uid()::text));

-- ── Passes: owner only ────────────────────────────────────────────────────
drop policy if exists qyr_passes_owner on qyr_passes;
create policy qyr_passes_owner on qyr_passes
  for all using (owner_ref = auth.uid()::text) with check (owner_ref = auth.uid()::text);

do $$
declare t text;
begin
  foreach t in array array['qyr_pass_answers','qyr_pass_settled','qyr_pass_disturbances'] loop
    execute format($f$
      drop policy if exists %I on %I;
      create policy %I on %I for all
        using (exists (select 1 from qyr_passes p where p.pass_id = %I.pass_id and p.owner_ref = auth.uid()::text))
        with check (exists (select 1 from qyr_passes p where p.pass_id = %I.pass_id and p.owner_ref = auth.uid()::text));
    $f$, t || '_owner', t, t || '_owner', t, t, t);
  end loop;
end $$;

-- The scalar is not reachable from a browser session at all.
do $$
begin
  if to_regprocedure('qyr_sr_score(text)') is not null then
    execute 'revoke all on function qyr_sr_score(text) from public';
    begin execute 'revoke all on function qyr_sr_score(text) from anon, authenticated';
    exception when undefined_object then null; end;
  end if;
end $$;
