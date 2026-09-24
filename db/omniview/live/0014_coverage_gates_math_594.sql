-- OMNIVIEW · 0014 · COVERAGE LEDGER, CURRENT GATES, MATH DISPLAY readers (head 594)
-- Work: THY-WORK-COVERAGE-HARD-GATE-593, THY-WORK-QUERY-COVERAGE-592,
--       THY-WORK-OMNIVIEW-LIVE-APPLY-591, MATH DISPLAY LAW (594)
--
-- Additive only. Reuses the existing registries instead of opening parallel ones:
--   coverage  -> thylora_response_point_coverage (query_id, point_no, ...)
--   gates     -> thy_omniview_gates + thylora_gate_definitions
--   equations -> thylora_math_equation_registry
-- The one new table, thy_math_display, carries the 11-part MATH DISPLAY LAW for
-- each registered equation. It does not restate the equation; it points at it.
--
-- Readers are SECURITY DEFINER with the Chairman guard inside, the backend's
-- own pattern (migration thylora_enforce_chairman_guard_inside_definer_rpcs),
-- because the underlying registries have RLS on and no client read policy. A
-- non-Chairman caller gets {"access":"DENIED"} and no rows.

begin;

create table if not exists public.thy_math_display (
  equation_id     text primary key references public.thylora_math_equation_registry(equation_id),
  whole_equation  text not null,
  left_side       text not null,
  equal_sign      text not null,
  right_side      text not null,
  symbols         jsonb not null,           -- [{symbol, name, meaning}]
  units           jsonb not null,           -- [{symbol, unit, range}]
  plain_speech    text not null,
  real_example    text not null,
  where_used      text not null,
  answer_meaning  text not null,
  next_question   text not null,
  f_is_function_of text,                    -- set whenever f appears in the equation
  entered_sequence_no bigint references public.thy_sequence_ledger(sequence_no),
  updated_at      timestamptz not null default now(),
  constraint thy_math_display_f_rule check (
    position('f(' in whole_equation) = 0
    or (f_is_function_of is not null and f_is_function_of ilike '%FUNCTION OF%'))
);

alter table public.thy_math_display enable row level security;
drop policy if exists thy_math_display_read on public.thy_math_display;
create policy thy_math_display_read on public.thy_math_display
  for select to authenticated using (public.thylora_is_chairman());
revoke all on public.thy_math_display from anon;
revoke insert, update, delete, truncate, references, trigger on public.thy_math_display from authenticated;
grant select on public.thy_math_display to authenticated;

-- COVERAGE LEDGER: every clause of a Chairman query with its one state, plus
-- C_q = (A+E+S+B+D+U)/N from MATH-COVERAGE-593. OPEN rows count against C_q.
create or replace function public.thy_omniview_coverage(p_query_id text default null)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare q text; rows jsonb; n int; settled int;
begin
  if not public.thylora_is_chairman() then
    return jsonb_build_object('access','DENIED','rows','[]'::jsonb);
  end if;
  q := coalesce(p_query_id, (select c.query_id from thylora_response_point_coverage c
                              order by c.created_at desc limit 1));
  select coalesce(jsonb_agg(jsonb_build_object(
           'point_no', c.point_no, 'source_point', c.source_point,
           'response_state', c.response_state, 'response_ref', c.response_ref,
           'omission_reason', c.omission_reason, 'updated_at', c.updated_at)
         order by c.point_no), '[]'::jsonb),
         count(*),
         count(*) filter (where c.response_state in
           ('ANSWERED','EXECUTED','ASSIGNED','DEFERRED','BLOCKED','UNKNOWN'))
    into rows, n, settled
    from thylora_response_point_coverage c where c.query_id = q;
  return jsonb_build_object(
    'access','OK', 'query_id', q, 'rows', rows, 'n', n, 'settled', settled,
    'c_q', case when n = 0 then null else round(settled::numeric / n, 4) end,
    'equation','MATH-COVERAGE-593  C_q=(A+E+S+B+D+U)/N',
    'complete', n > 0 and settled = n,
    'by_state', (select coalesce(jsonb_object_agg(s, k), '{}'::jsonb) from (
       select c.response_state s, count(*) k from thylora_response_point_coverage c
        where c.query_id = q group by 1) x),
    'queries', (select coalesce(jsonb_agg(distinct c.query_id), '[]'::jsonb)
                  from thylora_response_point_coverage c));
end $$;

-- CURRENT GATES: OMNIVIEW topic gates and the backend gate registry, one read.
create or replace function public.thy_omniview_current_gates()
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.thylora_is_chairman() then
    return jsonb_build_object('access','DENIED','topic_gates','[]'::jsonb,'registry','[]'::jsonb);
  end if;
  return jsonb_build_object(
    'access','OK',
    'head', (select max(sequence_no) from thy_sequence_ledger),
    'topic_gates', (select coalesce(jsonb_agg(jsonb_build_object(
        'gate_key', g.gate_key, 'topic_key', g.topic_key, 'gate_state', g.gate_state,
        'requirement', g.requirement, 'blocker', g.blocker, 'authority', g.authority,
        'evidence_ref', g.evidence_ref, 'entered_sequence_no', g.entered_sequence_no,
        'settled_sequence_no', g.settled_sequence_no)
        order by case g.gate_state when 'BLOCKED' then 0 when 'OPEN' then 1 else 2 end, g.topic_key, g.gate_key), '[]'::jsonb)
      from thy_omniview_gates g),
    'registry', (select coalesce(jsonb_agg(jsonb_build_object(
        'gate_code', d.gate_code, 'title', d.title, 'state', d.state,
        'purpose', d.purpose, 'equation', d.configuration->>'equation', 'updated_at', d.updated_at)
        order by case d.state when 'ACTIVE' then 0 else 1 end, d.updated_at desc), '[]'::jsonb)
      from thylora_gate_definitions d));
end $$;

-- MATH DISPLAY: the 11-part law joined to the registered equation.
create or replace function public.thy_math_display_get(p_equation_id text default null)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.thylora_is_chairman() then
    return jsonb_build_object('access','DENIED','rows','[]'::jsonb);
  end if;
  return jsonb_build_object('access','OK', 'rows', (select coalesce(jsonb_agg(jsonb_build_object(
      'equation_id', r.equation_id, 'equation_name', r.equation_name, 'state', r.state,
      'registered_text', r.equation_text,
      'display', case when m.equation_id is null then null else jsonb_build_object(
        '1_whole_equation', m.whole_equation, '2_left_side', m.left_side,
        '3_equal_sign', m.equal_sign, '4_right_side', m.right_side,
        '5_every_symbol', m.symbols, '6_every_unit', m.units,
        '7_plain_speech', m.plain_speech, '8_real_example', m.real_example,
        '9_where_used', m.where_used, '10_answer_meaning', m.answer_meaning,
        '11_next_question', m.next_question, 'f', m.f_is_function_of) end,
      'display_missing', m.equation_id is null)
      order by (m.equation_id is null), r.updated_at desc), '[]'::jsonb)
    from thylora_math_equation_registry r
    left join thy_math_display m on m.equation_id = r.equation_id
    where (p_equation_id is null or r.equation_id = p_equation_id)
      and r.state in ('ACTIVE','PROPOSED','HELD')));
end $$;

do $$
declare f text;
begin
  foreach f in array array['thy_omniview_coverage(text)','thy_omniview_current_gates()','thy_math_display_get(text)']
  loop
    execute format('revoke execute on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;

commit;
