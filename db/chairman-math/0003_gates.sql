-- THY-WORK-MATH-FAMOUS-THOUGHT-559 · 0003 · The two gates
--
-- F = S × A × C × T   Famous Thought gate. PASS requires all four >= 4 AND F >= 256.
-- D = A × H × W × T × M × P   store / social value gate.
--
-- Both fail closed. The SQL here is the mirror of math-thought/lib/gates.js and
-- tests/math-thought.test.mjs; all three must agree or the validation run fails.
--
-- thylora_famous_thought_gate_evaluations is the evaluation table of record.
-- This file does NOT write to it and does not copy it. Session-level preflight
-- evaluations land in thy_thought_gate_session_eval, which is explicitly barred
-- from superseding a registry evaluation: a build session that cannot read the
-- source records has no standing to overturn a stored verdict.

begin;

create table if not exists thy_thought_gate_session_eval (
  eval_id            bigserial primary key,
  work_code          text not null default 'THY-WORK-MATH-FAMOUS-THOUGHT-559',
  thought_code       text not null,
  gate               text not null,
  verdict            text not null,
  f_value            integer,
  d_value            integer,
  score_s            integer, score_a integer, score_c integer, score_t integer,
  fail_closed        text[] not null default '{}',
  blocking           text[] not null default '{}',
  below_threshold    text[] not null default '{}',
  evaluator          text not null default 'BUILD_SESSION',
  supersedes_registry boolean not null default false,
  evaluated_at       timestamptz not null default now(),
  constraint thy_gate_eval_gate_known   check (gate in ('F', 'D')),
  constraint thy_gate_eval_verdict_known check (verdict in ('PASS', 'FAIL')),
  -- A session evaluation never outranks the registry of record.
  constraint thy_gate_eval_never_supersedes check (supersedes_registry = false),
  -- A PASS must carry a computed value. A FAIL may legitimately have none.
  constraint thy_gate_eval_pass_has_value
    check (verdict = 'FAIL'
           or (gate = 'F' and f_value is not null and f_value >= 256)
           or (gate = 'D' and d_value is not null)),
  -- A PASS may not coexist with any recorded obstruction.
  constraint thy_gate_eval_pass_is_clean
    check (verdict = 'FAIL'
           or (cardinality(fail_closed) = 0 and cardinality(blocking) = 0
               and cardinality(below_threshold) = 0))
);

comment on table thy_thought_gate_session_eval is
  'Preflight gate results produced by a build session. Advisory only:
   thylora_famous_thought_gate_evaluations remains the evaluation of record.';

-- ------------------------------------------------------------------ F gate --
create or replace function thy_famous_thought_f_gate_v1(
  p_thought_code text,
  p_s integer, p_a integer, p_c integer, p_t integer,
  p_source_record_present       boolean,
  p_speaker_certain             boolean,
  p_wording_from_source_record  boolean,
  p_context_present             boolean,
  p_tied_to_meaningful_question boolean
) returns jsonb language plpgsql immutable as $$
declare
  fail_closed     text[] := '{}';
  blocking        text[] := '{}';
  below_threshold text[] := '{}';
  f_value         integer;
  scores          integer[] := array[p_s, p_a, p_c, p_t];
  names           text[]    := array['S (source verification)', 'A (attribution)',
                                     'C (context)', 'T (transfer value)'];
  i               integer;
  computable      boolean := true;
begin
  if p_source_record_present       is distinct from true then fail_closed := array_append(fail_closed, 'SOURCE_UNCERTAIN'); end if;
  if p_speaker_certain             is distinct from true then fail_closed := array_append(fail_closed, 'SPEAKER_UNCERTAIN'); end if;
  if p_wording_from_source_record  is distinct from true then fail_closed := array_append(fail_closed, 'WORDING_UNCERTAIN'); end if;
  if p_context_present             is distinct from true then fail_closed := array_append(fail_closed, 'CONTEXT_MISSING'); end if;
  if p_tied_to_meaningful_question is distinct from true then fail_closed := array_append(fail_closed, 'NO_MEANINGFUL_QUESTION'); end if;

  for i in 1 .. 4 loop
    if scores[i] is null then
      blocking := array_append(blocking, (names[i] || ' is not scored (UNKNOWN_DEFINITION)'));
      computable := false;
    elsif scores[i] < 0 or scores[i] > 5 then
      blocking := array_append(blocking, (names[i] || ' is outside 0..5'));
      computable := false;
    elsif scores[i] < 4 then
      below_threshold := array_append(below_threshold, (names[i] || ' scored ' || scores[i] || ', minimum is 4'));
    end if;
  end loop;

  if computable then
    f_value := p_s * p_a * p_c * p_t;
    if f_value < 256 then
      below_threshold := array_append(below_threshold, ('F = ' || f_value || ', minimum is 256'));
    end if;
  end if;

  return jsonb_build_object(
    'gate', 'F',
    'equation', 'F = S x A x C x T',
    'thought_code', p_thought_code,
    'verdict', case when cardinality(fail_closed) = 0
                     and cardinality(blocking) = 0
                     and cardinality(below_threshold) = 0
                    then 'PASS' else 'FAIL' end,
    'f_value', f_value,
    'scores', jsonb_build_object('S', p_s, 'A', p_a, 'C', p_c, 'T', p_t),
    'fail_closed', to_jsonb(fail_closed),
    'blocking', to_jsonb(blocking),
    'below_threshold', to_jsonb(below_threshold)
  );
end $$;

comment on function thy_famous_thought_f_gate_v1 is
  'F = S x A x C x T. PASS requires every variable >= 4 and F >= 256, with no
   fail-closed condition present. An unscored variable produces no product.';

-- ------------------------------------------------------------------ D gate --
-- D cannot be scored while the meanings of A, H, W, T, M and P are unrecovered.
-- The gate reads thy_math_equation_variable rather than accepting meanings from
-- the caller, so no caller can supply an invented definition to force a pass.
create or replace function thy_store_value_d_gate_v1(
  p_subject_code text,
  p_a integer, p_h integer, p_w integer, p_t integer, p_m integer, p_p integer,
  p_provides_help  boolean,
  p_has_destination boolean
) returns jsonb language plpgsql stable as $$
declare
  blocking  text[] := '{}';
  unknowns  text[] := '{}';
  d_value   integer;
  scores    integer[] := array[p_a, p_h, p_w, p_t, p_m, p_p];
  keys      text[]    := array['A','H','W','T','M','P'];
  i         integer;
  computable boolean := true;
  defined    text;
begin
  for i in 1 .. 6 loop
    select v.definition into defined
      from thy_math_equation_variable v
     where v.equation_code = 'EQ-D-001' and v.variable_key = keys[i];
    if defined is null or defined = 'UNKNOWN_DEFINITION' then
      unknowns := array_append(unknowns, keys[i]);
      computable := false;
    end if;
  end loop;

  -- Section 8, stated plainly by the work order and independent of the letters:
  -- attention without help or without a destination is a FAIL.
  if p_provides_help   is distinct from true then blocking := array_append(blocking, 'NO_HELP_PROVIDED'); end if;
  if p_has_destination is distinct from true then blocking := array_append(blocking, 'NO_DESTINATION'); end if;

  for i in 1 .. 6 loop
    if scores[i] is null then
      blocking := array_append(blocking, (keys[i] || ' is not scored (UNKNOWN_DEFINITION)'));
      computable := false;
    elsif scores[i] < 0 or scores[i] > 5 then
      blocking := array_append(blocking, (keys[i] || ' is outside 0..5'));
      computable := false;
    end if;
  end loop;

  if cardinality(unknowns) > 0 then
    blocking := array_append(blocking, ('UNKNOWN_DEFINITION for D variables: ' || array_to_string(unknowns, ', ')));
  end if;

  if computable then
    d_value := p_a * p_h * p_w * p_t * p_m * p_p;
  end if;

  return jsonb_build_object(
    'gate', 'D',
    'equation', 'D = A x H x W x T x M x P',
    'subject_code', p_subject_code,
    'verdict', case when cardinality(blocking) = 0 then 'PASS' else 'FAIL' end,
    'd_value', d_value,
    'unknown_definitions', to_jsonb(unknowns),
    'blocking', to_jsonb(blocking)
  );
end $$;

comment on function thy_store_value_d_gate_v1 is
  'D = A x H x W x T x M x P. Reads the variable meanings from the registry
   display layer; while they are UNKNOWN_DEFINITION the gate cannot pass. A draft
   that gets attention but provides no help or no destination fails outright.';

commit;
