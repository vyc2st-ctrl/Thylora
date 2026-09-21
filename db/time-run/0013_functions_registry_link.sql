-- 0013 · Read functions for the app room, and guarded links into the four
--        canonical Time Run registries. Those registries are NOT redefined.

begin;

-- ---------------------------------------------------------------------------
-- Guarded soft links. to_regclass so nothing breaks if a registry is absent,
-- and no blind foreign key onto a table whose shape was not inspected.
-- ---------------------------------------------------------------------------
create or replace function thytr_registry_present(p_name text)
returns boolean language sql stable as $$
  select to_regclass(p_name) is not null;
$$;

create or replace function thytr_resolve_registry_ref(p_ref text)
returns jsonb language plpgsql stable as $$
declare result jsonb;
begin
  if p_ref is null then return null; end if;
  if to_regclass('thylora_time_run_registry') is null then
    return jsonb_build_object('ref', p_ref, 'resolved', false,
                              'reason', 'thylora_time_run_registry not present');
  end if;
  execute 'select to_jsonb(r) from thylora_time_run_registry r where r::text like $1 limit 1'
    into result using '%' || p_ref || '%';
  return coalesce(result, jsonb_build_object('ref', p_ref, 'resolved', false));
end;
$$;

comment on function thytr_resolve_registry_ref(text) is
  'Soft resolution only. The live shape of thylora_time_run_registry could not be inspected from the build session, so this resolves by reference text and never assumes a column name.';

-- ---------------------------------------------------------------------------
-- App room reads.
-- ---------------------------------------------------------------------------

-- Released host-home rules, for the public room.
create or replace function thytr_released_host_rules()
returns table (rule_code text, title text, rule_text text, binds text, breach_severity text)
language sql stable as $$
  select rule_code, title, rule_text, binds, breach_severity
    from thytr_host_home_rule
   where public_release and enforcement_state = 'ACTIVE'
   order by rule_code;
$$;

-- Released award classes, for the public room.
create or replace function thytr_released_awards()
returns table (award_code text, award_label text, award_group text, decided_by text, award_note text)
language sql stable as $$
  select award_code, award_label, award_group, decided_by, award_note
    from thytr_award_class
   where public_release
   order by award_group, award_code;
$$;

-- Crew coverage: is a team ready, and what is missing.
create or replace function thytr_team_readiness(p_team_code text)
returns table (role_code text, role_label text, required integer, filled integer, short integer)
language sql stable as $$
  select r.role_code,
         r.role_label,
         r.minimum_per_team as required,
         count(s.slot_id) filter (where s.slot_state = 'FILLED')::int as filled,
         greatest(r.minimum_per_team
                  - count(s.slot_id) filter (where s.slot_state = 'FILLED')::int, 0) as short
    from thytr_crew_role r
    left join thytr_crew_slot s
      on s.role_code = r.role_code and s.team_code = p_team_code
   where r.required_for_ready
   group by r.role_code, r.role_label, r.minimum_per_team
   order by r.role_code;
$$;

-- Help standing: verified help only. This is what the HELP awards count.
create or replace function thytr_verified_help(p_run_code text)
returns table (team_code text, orders_verified integer, hours numeric, materials_paid_minor bigint)
language sql stable as $$
  select o.team_code,
         count(*)::int,
         coalesce(sum(o.hours_worked), 0),
         coalesce(sum(o.materials_paid_minor), 0)::bigint
    from thytr_help_order o
   where o.run_code = p_run_code
     and o.order_state = 'VERIFIED'
   group by o.team_code
   order by 2 desc, 1;
$$;

-- Recovery position, for the operations surface. Never exposes the death record.
create or replace function thytr_recovery_position(p_recovery_id uuid)
returns table (stage_index integer, stage_code text, stage_label text, stage_rule text, disposition text, closed boolean)
language sql stable as $$
  select rec.current_stage_index,
         st.stage_code,
         st.stage_label,
         st.stage_rule,
         rec.disposition,
         rec.closed_at is not null
    from thytr_recovery rec
    join thytr_recovery_stage st on st.stage_index = rec.current_stage_index
   where rec.recovery_id = p_recovery_id;
$$;

revoke all on function thytr_recovery_position(uuid) from anon;

commit;
