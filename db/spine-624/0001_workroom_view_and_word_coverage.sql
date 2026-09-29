-- WR-SPINE-624 · migration spine_624_workroom_view_and_word_coverage
-- Backend: thylora-dash (jvsdxhrfhtlgaknhjxlz). Additive only: one view, one function.
-- No table is created, altered, dropped or rewritten.
--
-- 1. thylora_department_workroom_v1
--    Answers Lane C: persistent department workrooms need NO new table. They are the join of
--    thylora_departments (identity) + thylora_workroom_registry (workroom, 21-field card in
--    evidence->'workroom_card') + thylora_department_personnel (people) +
--    thylora_workroom_task_registry (work queue). security_invoker = true, so row-level security
--    on every underlying table still applies to whoever reads the view.
--
-- 2. thylora_word_coverage_v1(query_id)
--    Every-word coverage with the Chairman's eight explicit states:
--    Cq = atoms with an explicit state / total atoms.  Target Cq = 1.00.
--    The older thylora_response_coverage_gate_v1 is left untouched (it only knows
--    ANSWERED_IN_DRAFT / ANSWERED_IN_OUTPUT and so reports the new states as open).

create or replace view public.thylora_department_workroom_v1
with (security_invoker = true) as
select
  w.workroom_code,
  w.title,
  w.lane,
  w.state,
  w.evidence->>'department_code'        as department_code,
  d.name                                as department_name,
  w.evidence->>'desk'                   as desk,
  w.purpose,
  w.evidence->'workroom_card'           as workroom_card,
  (select count(*) from public.thylora_department_personnel p
    where p.department_code = w.evidence->>'department_code')          as personnel_rows,
  (select count(*) from public.thylora_workroom_task_registry t
    where t.workroom_code = w.workroom_code)                           as work_items,
  (select count(*) from public.thylora_workroom_task_registry t
    where t.workroom_code = w.workroom_code
      and coalesce(t.state,'') not in ('DONE','EXECUTED','SUPERSEDED')) as open_work_items,
  w.current_blockers,
  w.restart_point,
  w.updated_at                          as last_verified_movement
from public.thylora_workroom_registry w
left join public.thylora_departments d
  on d.department_code = w.evidence->>'department_code'
where w.evidence ? 'department_code';

revoke all on public.thylora_department_workroom_v1 from anon, public;
grant select on public.thylora_department_workroom_v1 to authenticated;

create or replace function public.thylora_word_coverage_v1(p_query_id text)
returns jsonb
language sql
stable
security definer
set search_path to 'public'
as $$
  with a as (
    select response_state from public.thylora_response_point_coverage where query_id = p_query_id
  ), s as (
    select count(*) total,
           count(*) filter (where response_state in
             ('ANSWERED','EXECUTED','ASSIGNED','BLOCKED','DEFERRED','UNKNOWN','PRIVATE','NONACTIONABLE_CONTEXT')) stated
    from a
  )
  select jsonb_build_object(
    'query_id', p_query_id,
    'total_atoms', s.total,
    'stated_atoms', s.stated,
    'Cq', case when s.total = 0 then null else round(s.stated::numeric / s.total, 4) end,
    'target', 1.00,
    'status', case when s.total = 0 then 'BLOCKED_NO_ATOMS'
                   when s.stated = s.total then 'COVERAGE_COMPLETE'
                   else 'COVERAGE_OPEN' end,
    'by_state', coalesce((select jsonb_object_agg(response_state, n)
                          from (select response_state, count(*) n from a group by 1) x), '{}'::jsonb))
  from s
$$;

revoke all on function public.thylora_word_coverage_v1(text) from anon, public;
grant execute on function public.thylora_word_coverage_v1(text) to authenticated;
