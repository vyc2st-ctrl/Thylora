-- THY-WORK-MATH-FAMOUS-THOUGHT-559 · 0002 · Math display layer
--
-- thylora_math_equation_registry is the registry of record and is NOT recreated,
-- copied or competed with here. This file adds only the display contract the
-- work order names — WHOLE / LEFT / EQUAL / RIGHT / VARIABLE BREAKDOWN /
-- PLAIN / EVERYDAY / TECHNICAL / REAL-LIFE EXAMPLE — as an adjunct table that
-- soft-references the registry by equation code, the same way RAE Link
-- soft-references products.
--
-- Reading levels are PLAIN, EVERYDAY, TECHNICAL. Child / Adult / Scholar are
-- prohibited by the work order and by the check constraint below.
--
-- Section 11: no invented math definitions. Every definition column defaults to
-- 'UNKNOWN_DEFINITION' and a row may not claim an authority while still unknown.

begin;

create table if not exists thy_math_equation_display (
  equation_code      text primary key,
  whole_equation     text not null,
  left_side          text not null,
  equal_sign         text not null default '=',
  right_side         text not null,
  plain              text not null default 'UNKNOWN_DEFINITION',
  everyday           text not null default 'UNKNOWN_DEFINITION',
  technical          text not null default 'UNKNOWN_DEFINITION',
  real_life_example  text not null default 'UNKNOWN_DEFINITION',
  status             text not null default 'ACTIVE',
  authority          text not null default 'UNKNOWN_DEFINITION',
  registry_ref       text,
  graph_stable_id    text not null default 'SYSTEM-MATH-ENGINE-001',
  version            integer not null default 1,
  superseded_by      text references thy_math_equation_display (equation_code),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint thy_math_display_status_known
    check (status in ('ACTIVE', 'SUPERSEDED', 'UNKNOWN_DEFINITION')),
  constraint thy_math_display_equation_shape
    check (whole_equation like '%=%' and length(btrim(left_side)) > 0 and length(btrim(right_side)) > 0),
  -- The prohibited reading-level vocabulary may not re-enter through the text.
  constraint thy_math_display_no_age_levels
    check (plain !~* '\m(child|adult|scholar)\M'
       and everyday !~* '\m(child|adult|scholar)\M'
       and technical !~* '\m(child|adult|scholar)\M')
);

comment on table thy_math_equation_display is
  'Display contract for the Chairman equations. Adjunct to thylora_math_equation_registry,
   which remains the registry of record. Unsupplied text stays UNKNOWN_DEFINITION.';

create table if not exists thy_math_equation_variable (
  equation_code   text not null references thy_math_equation_display (equation_code) on delete cascade,
  variable_key    text not null,
  ordinal         integer not null,
  variable_name   text not null default 'UNKNOWN_DEFINITION',
  definition      text not null default 'UNKNOWN_DEFINITION',
  authority       text not null default 'UNKNOWN_DEFINITION',
  created_at      timestamptz not null default now(),
  primary key (equation_code, variable_key),
  constraint thy_math_variable_authority_honest
    check (definition <> 'UNKNOWN_DEFINITION' or authority = 'UNKNOWN_DEFINITION')
);

comment on constraint thy_math_variable_authority_honest on thy_math_equation_variable is
  'A variable with no recovered definition may not carry an authority. An unknown
   cannot borrow standing from a source that never defined it.';

-- Soft resolver into the registry of record, guarded exactly like
-- rael_resolve_product_ref: absent registry is reported, never assumed.
create or replace function thy_math_resolve_equation_ref(p_code text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare found jsonb;
begin
  if p_code is null then
    return jsonb_build_object('ref', p_code, 'resolved', false, 'reason', 'NO_REF');
  end if;
  if to_regclass('public.thylora_math_equation_registry') is null then
    return jsonb_build_object('ref', p_code, 'resolved', false, 'reason', 'REGISTRY_ABSENT');
  end if;
  begin
    execute 'select to_jsonb(r) from thylora_math_equation_registry r
             where r::text is not null and (to_jsonb(r) ->> ''equation_code'') = $1 limit 1'
      into found using p_code;
  exception when others then
    return jsonb_build_object('ref', p_code, 'resolved', false, 'reason', 'SHAPE_MISMATCH');
  end;
  if found is null then
    return jsonb_build_object('ref', p_code, 'resolved', false, 'reason', 'NOT_FOUND');
  end if;
  return jsonb_build_object('ref', p_code, 'resolved', true, 'equation', found);
end $$;

-- Supersede, never delete. Section: "Use SUPERSEDES, not deletion."
create or replace function thy_math_supersede_equation(p_old text, p_new text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_old is null or p_new is null or p_old = p_new then
    raise exception 'supersede requires two distinct equation codes';
  end if;
  if not exists (select 1 from thy_math_equation_display where equation_code = p_new) then
    raise exception 'superseding equation % does not exist', p_new;
  end if;
  update thy_math_equation_display
     set status = 'SUPERSEDED', superseded_by = p_new, updated_at = now()
   where equation_code = p_old;
end $$;

-- ---------------------------------------------------------------------------
-- Seed: the four ACTIVE equations named by the work order.
--
-- Only F=S×A×C×T carries variable definitions and reading text, because only its
-- four variables are stated in the work order (section 3). Q, U and D are
-- registered as ACTIVE equations with their display structure — which is string
-- structure, not meaning — and every meaning left as UNKNOWN_DEFINITION pending
-- readback from thylora_math_equation_registry.
-- ---------------------------------------------------------------------------

insert into thy_math_equation_display
  (equation_code, whole_equation, left_side, right_side, status, authority, registry_ref)
values
  ('EQ-Q-001', 'Q=f(K,E,C)',      'Q', 'f(K,E,C)',      'ACTIVE', 'UNKNOWN_DEFINITION', 'Q=f(K,E,C)'),
  ('EQ-U-001', 'U=K×E×C×X×T',     'U', 'K×E×C×X×T',     'ACTIVE', 'UNKNOWN_DEFINITION', 'U=K×E×C×X×T'),
  ('EQ-D-001', 'D=A×H×W×T×M×P',   'D', 'A×H×W×T×M×P',   'ACTIVE', 'UNKNOWN_DEFINITION', 'D=A×H×W×T×M×P'),
  ('EQ-F-001', 'F=S×A×C×T',       'F', 'S×A×C×T',       'ACTIVE', 'WORK_ORDER_559',     'F=S×A×C×T')
on conflict (equation_code) do nothing;

update thy_math_equation_display set
  plain = 'A thought only counts when we can show where it came from, who said it, what was happening around it, and what it is good for now. Score each of the four from 0 to 5 and multiply them.',
  everyday = 'Four questions decide whether a famous thought is usable: can the source be checked, is the speaker correctly named, is the situation around it known, and does it still teach something we can act on. Each answer is worth 0 to 5, and the four are multiplied rather than averaged, so one weak answer drags the whole result down.',
  technical = 'F is the product of four ordinal scores in 0..5. PASS requires every variable >= 4 AND F >= 256. Because 4^4 = 256, the product threshold is exactly the all-fours floor, so no combination containing a variable below 4 reaches a pass without another variable exceeding its own ceiling. The gate fails closed: an unscored variable yields no product at all.',
  real_life_example = 'A quote circulating with no printed source, attached to the wrong speaker, scores S=1, A=1, C=2, T=4. F = 8, far under 256, and the gate stops it before it becomes a draft — the same way a payment with no receipt does not post to the ledger.',
  updated_at = now()
where equation_code = 'EQ-F-001'
  and plain = 'UNKNOWN_DEFINITION';

insert into thy_math_equation_variable (equation_code, variable_key, ordinal, variable_name, definition, authority)
values
  ('EQ-F-001', 'S', 1, 'Source verification', 'Source verification', 'WORK_ORDER_559'),
  ('EQ-F-001', 'A', 2, 'Attribution',         'Attribution',         'WORK_ORDER_559'),
  ('EQ-F-001', 'C', 3, 'Context',             'Context',             'WORK_ORDER_559'),
  ('EQ-F-001', 'T', 4, 'Transfer value',      'Transfer value',      'WORK_ORDER_559')
on conflict (equation_code, variable_key) do nothing;

-- Q, U and D variable slots exist so the dashboard can show the breakdown line
-- with an honest UNKNOWN_DEFINITION against each letter, rather than omitting it.
insert into thy_math_equation_variable (equation_code, variable_key, ordinal)
values
  ('EQ-Q-001','K',1),('EQ-Q-001','E',2),('EQ-Q-001','C',3),
  ('EQ-U-001','K',1),('EQ-U-001','E',2),('EQ-U-001','C',3),('EQ-U-001','X',4),('EQ-U-001','T',5),
  ('EQ-D-001','A',1),('EQ-D-001','H',2),('EQ-D-001','W',3),('EQ-D-001','T',4),('EQ-D-001','M',5),('EQ-D-001','P',6)
on conflict (equation_code, variable_key) do nothing;

-- Section 9: searched, not recovered. Registered as UNKNOWN_DEFINITION so the
-- gap is visible in the system instead of living only in a report.
create table if not exists thy_math_unrecovered_equation (
  equation_code text primary key,
  whole_equation text not null,
  searched_where text not null,
  search_result  text not null,
  status         text not null default 'UNKNOWN_DEFINITION',
  recorded_at    timestamptz not null default now(),
  constraint thy_math_unrecovered_status check (status = 'UNKNOWN_DEFINITION')
);

insert into thy_math_unrecovered_equation (equation_code, whole_equation, searched_where, search_result)
values
  ('EQ-PSOLVE-001', 'P_solve=L×M×S',
   'repository working tree, full git history across all refs (content search), workroom records',
   'NOT PRESENT IN CONTINUITY REACHABLE FROM THIS SESSION'),
  ('EQ-CW-001', 'C_w=I×P×T×O×M×R×E',
   'repository working tree, full git history across all refs (content search), workroom records',
   'NOT PRESENT IN CONTINUITY REACHABLE FROM THIS SESSION')
on conflict (equation_code) do nothing;

commit;
