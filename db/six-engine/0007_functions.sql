-- SIX UNDERSTANDING ENGINE · 0007 · Governed functions
-- Workroom: WR-SIXENGINE-001
--
-- These are the custody points. Evidence grading, claim resolution, load
-- diagnosis and run closure happen here so the rule lives with the data instead
-- of in a client that can be replaced.
--
-- Each function is the SQL twin of a module in six-engine/lib/:
--   sixu_grade_evidence      ↔ evidence.js  gradeEvidence
--   sixu_resolve_claim       ↔ evidence.js  resolveClaim
--   sixu_diagnose_load       ↔ mathload.js  diagnose
--   sixu_prerequisite_floor  ↔ prerequisites.js prerequisiteClosure
--   sixu_close_run           ↔ pipeline.js  finish
-- Both sides must produce the same verdict for the same input, so an answer
-- shown in the app equals the answer stored in the backend.

begin;

-- 1. EVIDENCE GRADING ---------------------------------------------------------
-- Strength is capped by the best INDEPENDENT line. Repetition of one origin is
-- collapsed before anything is counted, so a widely repeated claim does not
-- outrank a well evidenced one.
create or replace function sixu_grade_evidence(p_position_id uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  lines_count   integer;
  best_weight   numeric;
  best_tier     text;
  supplied      integer;
  flags         text[] := '{}';
  newest        date;
  corroboration numeric;
  strength      numeric;
begin
  select count(*) into supplied from sixu_evidence_items where position_id = p_position_id;
  if supplied = 0 then
    return jsonb_build_object('strength', 0, 'independent_lines', 0, 'supplied_items', 0,
      'best_tier', null, 'cap', 0, 'flags', jsonb_build_array('NO_EVIDENCE_SUPPLIED'));
  end if;

  -- One row per origin, keeping that origin's strongest tier.
  with per_origin as (
    select s.origin_key,
           max(w.weight) as weight,
           (array_agg(e.tier::text order by w.weight desc))[1] as tier,
           max(coalesce(e.as_of, s.as_of)) as as_of
      from sixu_evidence_items e
      join sixu_sources s on s.id = e.source_id
      join sixu_evidence_tier_weights w on w.tier = e.tier
     where e.position_id = p_position_id
     group by s.origin_key
  )
  select count(*), max(weight), max(as_of) into lines_count, best_weight, newest from per_origin;

  select tier into best_tier from (
    select s.origin_key, max(w.weight) as weight,
           (array_agg(e.tier::text order by w.weight desc))[1] as tier
      from sixu_evidence_items e
      join sixu_sources s on s.id = e.source_id
      join sixu_evidence_tier_weights w on w.tier = e.tier
     where e.position_id = p_position_id
     group by s.origin_key
  ) t where t.weight = best_weight limit 1;

  corroboration := least(0.08, 0.04 * (lines_count - 1));
  strength := least(round(best_weight + corroboration, 2), 0.98);

  if supplied > lines_count then flags := array_append(flags, 'REPETITION_COLLAPSED'); end if;
  if lines_count = 1 then flags := array_append(flags, 'SINGLE_LINE'); end if;
  if not exists (
    select 1 from sixu_evidence_items e
     where e.position_id = p_position_id
       and e.tier not in ('TERTIARY_SUMMARY','SECONDARY_ACCOUNT')
  ) then flags := array_append(flags, 'NO_PRIMARY_LINE'); end if;
  if newest is not null and newest < date '2000-01-01' then flags := array_append(flags, 'EVIDENCE_MAY_BE_STALE'); end if;

  return jsonb_build_object(
    'strength', strength, 'cap', strength,
    'independent_lines', lines_count, 'supplied_items', supplied,
    'best_tier', best_tier, 'flags', to_jsonb(flags));
end;
$$;

-- 2. CLAIM RESOLUTION ---------------------------------------------------------
-- Returns the state, the confidence and the cap. Standing is attached for
-- reporting and is never added to strength.
create or replace function sixu_resolve_claim(p_claim_id uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  rec            record;
  positions      jsonb := '[]'::jsonb;
  lead_id        uuid;
  lead_strength  numeric := 0;
  lead_lines     integer := 0;
  rival_strength numeric := null;
  lead_conditions text[] := '{}';
  separation     numeric;
  state          text;
  confidence     numeric := 0;
  has_record_gap boolean;
  undecidable    boolean;
  malformed      jsonb;
begin
  select coalesce(
    (select jsonb_build_object('assumption', q.asked_text)
       from sixu_claims c join sixu_questions q on q.id = c.question_id
       join sixu_question_routes r on r.question_id = q.id
      where c.id = p_claim_id and r.question_class = 'MALFORMED'), null)
    into malformed;

  if malformed is not null then
    return jsonb_build_object('state','MALFORMED','confidence',0,'confidence_cap',0,
      'cap_reason','the question assumes something that is not established',
      'positions', positions);
  end if;

  for rec in
    select p.id, p.position_key, p.statement, p.standing, p.conditions,
           sixu_grade_evidence(p.id) as grade
      from sixu_claim_positions p
     where p.claim_id = p_claim_id
     order by (sixu_grade_evidence(p.id)->>'strength')::numeric desc
  loop
    positions := positions || jsonb_build_object(
      'position_id', rec.id, 'key', rec.position_key, 'statement', rec.statement,
      'standing', rec.standing, 'grade', rec.grade);
    if lead_id is null then
      lead_id := rec.id;
      lead_strength := (rec.grade->>'strength')::numeric;
      lead_lines := (rec.grade->>'independent_lines')::integer;
      lead_conditions := rec.conditions;
    elsif rival_strength is null then
      rival_strength := (rec.grade->>'strength')::numeric;
    end if;
  end loop;

  select exists (select 1 from sixu_claim_unknowns where claim_id = p_claim_id and kind = 'RECORD_GAP'),
         exists (select 1 from sixu_claim_unknowns where claim_id = p_claim_id and kind = 'UNDECIDABLE_IN_PRINCIPLE')
    into has_record_gap, undecidable;

  separation := case when rival_strength is null then null else round(lead_strength - rival_strength, 2) end;

  if lead_id is null then
    state := case when undecidable then 'UNDECIDABLE' else 'UNKNOWN' end;
    confidence := 0;
  elsif rival_strength is not null and separation < 0.2 and rival_strength >= 0.4 then
    state := 'CONTESTED';
    confidence := lead_strength;
  elsif lead_strength >= 0.75 then
    -- One line is still one line, and an open record gap is an open question.
    state := case when array_length(lead_conditions,1) > 0 or lead_lines < 2 or has_record_gap
                  then 'RESOLVED_WITH_CONDITIONS' else 'RESOLVED' end;
    confidence := lead_strength;
  elsif lead_strength >= 0.4 then
    state := 'RESOLVED_WITH_CONDITIONS';
    confidence := lead_strength;
  else
    state := 'UNKNOWN';
    confidence := lead_strength;
  end if;

  return jsonb_build_object(
    'state', state,
    'confidence', confidence,
    'confidence_cap', lead_strength,
    'cap_reason', format('capped by the strongest independent line across %s line(s)', coalesce(lead_lines,0)),
    'lead_position_id', lead_id,
    'separation', separation,
    'positions', positions,
    'record_gap_open', has_record_gap);
end;
$$;

-- 3. LOAD DIAGNOSIS -----------------------------------------------------------
-- The SQL twin of the L × M × S rule. Given an attempt, it returns the verdict
-- and, where L is low, discards the uncontrolled M and S rather than scoring
-- them — the same behaviour the check constraints in 0005 refuse to permit
-- being written any other way.
create or replace function sixu_diagnose_load(
  p_language numeric, p_math numeric, p_procedure numeric,
  p_m_controlled boolean default false, p_s_controlled boolean default false)
returns jsonb language plpgsql immutable as $$
declare
  m          numeric := p_math;
  s          numeric := p_procedure;
  discarded  text[] := '{}';
  verdict    text;
  claim      text;
  p_solve    numeric;
  notes      text[] := '{}';
begin
  if p_language is not null and p_language < 0.5 then
    if m is not null and not p_m_controlled then m := null; discarded := array_append(discarded, 'M'); end if;
    if s is not null and not p_s_controlled then s := null; discarded := array_append(discarded, 'S'); end if;
    notes := array_append(notes, 'L is below threshold. A wrong answer here is evidence about the sentence, not about the mathematics.');
    notes := array_append(notes, 'Any M or S taken from the story presentation has been discarded rather than scored.');
  end if;

  if p_language is null then verdict := 'LANGUAGE_UNMEASURED';
  elsif p_language < 0.5 then verdict := 'LANGUAGE_BLOCKED';
  elsif m is null then verdict := 'RELATIONSHIP_UNMEASURED';
  elsif m < 0.6 then verdict := 'RELATIONSHIP_BLOCKED';
  elsif s is null then verdict := 'PROCEDURE_UNMEASURED';
  elsif s < 0.6 then verdict := 'PROCEDURE_BLOCKED';
  else verdict := 'SECURE';
  end if;

  claim := case verdict
    when 'LANGUAGE_BLOCKED' then 'NOT_SUPPORTED'
    when 'LANGUAGE_UNMEASURED' then 'NOT_SUPPORTED'
    when 'RELATIONSHIP_BLOCKED' then 'SUPPORTED_RELATIONSHIP'
    when 'PROCEDURE_BLOCKED' then 'SUPPORTED_PROCEDURE'
    else 'NOT_CLAIMED' end;

  if p_language is not null and m is not null and s is not null then
    p_solve := round(p_language * m * s, 3);
  end if;

  return jsonb_build_object(
    'verdict', verdict, 'L', p_language, 'M', m, 'S', s,
    'p_solve', p_solve, 'computable', p_solve is not null,
    'discarded_measurements', to_jsonb(discarded),
    'mathematics_deficit_claim', claim,
    'evidence_notes', to_jsonb(notes),
    'teaching_target', case verdict
      when 'LANGUAGE_BLOCKED' then 'the sentence'
      when 'RELATIONSHIP_BLOCKED' then 'the relationship'
      when 'PROCEDURE_BLOCKED' then 'the procedure'
      when 'SECURE' then 'transfer'
      else 'unknown — measure first' end);
end;
$$;

-- 4. PREREQUISITE FLOOR -------------------------------------------------------
-- The deepest concept this learner does not hold. Teaching starts there.
create or replace function sixu_prerequisite_floor(
  p_learner_id uuid, p_concept_id text, p_max_depth integer default 6)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  floor_id    text;
  floor_depth integer;
  unmet       jsonb;
  truncated   boolean := false;
begin
  if not exists (select 1 from sixu_concepts where id = p_concept_id) then
    return jsonb_build_object('found', false, 'gap', jsonb_build_object(
      'code','CONCEPT_NOT_IN_GRAPH',
      'detail', format('"%s" is not in the concept graph. The engine will not invent a prerequisite chain for a concept it does not hold.', p_concept_id)));
  end if;

  with recursive walk(concept_id, depth) as (
    select p_concept_id, 0
    union all
    select pr.prerequisite_id, w.depth + 1
      from walk w
      join sixu_concept_prerequisites pr on pr.concept_id = w.concept_id
      -- A held concept ends the dig: there is no reason to unpack what the
      -- learner already carries.
      left join sixu_learner_mastery m
        on m.learner_id = p_learner_id and m.concept_id = w.concept_id
     where w.depth < p_max_depth
       and coalesce(m.level, 'UNKNOWN') not in ('HELD','TRANSFERRED')
  ),
  deduped as (select concept_id, min(depth) as depth from walk group by concept_id),
  open_nodes as (
    select d.concept_id, d.depth, c.label, coalesce(m.level, 'UNKNOWN') as level
      from deduped d
      join sixu_concepts c on c.id = d.concept_id
      left join sixu_learner_mastery m on m.learner_id = p_learner_id and m.concept_id = d.concept_id
     where coalesce(m.level, 'UNKNOWN') not in ('HELD','TRANSFERRED')
  )
  select jsonb_agg(jsonb_build_object('id', concept_id, 'label', label, 'depth', depth, 'mastery', level) order by depth desc),
         (array_agg(concept_id order by depth desc))[1],
         max(depth)
    into unmet, floor_id, floor_depth
    from open_nodes;

  truncated := coalesce(floor_depth, 0) >= p_max_depth;

  return jsonb_build_object(
    'found', true,
    'floor_concept_id', floor_id,
    'unmet', coalesce(unmet, '[]'::jsonb),
    'ready', floor_id is null,
    'truncated', truncated,
    'truncation_note', case when truncated then
      format('Prerequisite walk hit the depth cap of %s. The chain below is unexamined, not assumed held.', p_max_depth)
      else null end);
end;
$$;

-- 5. RUN CLOSURE --------------------------------------------------------------
-- A run may not be closed COMPLETE while a BLOCKING failure stands against it.
create or replace function sixu_close_run(p_run_id uuid, p_state sixu_run_state, p_halt_reason text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  blocking integer;
  missing_transfer boolean;
  route    sixu_question_routes%rowtype;
begin
  select count(*) into blocking
    from sixu_run_failures
   where run_id = p_run_id and severity = 'BLOCKING' and cleared_at is null;

  if p_state = 'COMPLETE' and blocking > 0 then
    update sixu_runs set state = 'HALTED',
           halt_reason = format('%s blocking failure(s) stand against this run', blocking),
           finished_at = now()
     where id = p_run_id;
    return jsonb_build_object('state','HALTED','blocking_failures',blocking,
      'detail','A run carrying a blocking failure mode cannot be reported as complete.');
  end if;

  select r.* into route
    from sixu_question_routes r
    join sixu_runs run on run.question_id = r.question_id
   where run.id = p_run_id;

  if p_state = 'COMPLETE' and route.required_stages @> array['TRANSFER'] then
    select not exists (select 1 from sixu_transfer_tasks where run_id = p_run_id) into missing_transfer;
    if missing_transfer then
      insert into sixu_run_failures (run_id, code, failure_name, severity, detail, response)
      values (p_run_id, 'FM-10', 'Understanding assumed, never checked', 'CORRECTING',
              'transfer stage required by route, none produced',
              'Attach the transfer task before closing the run.');
    end if;
  end if;

  update sixu_runs
     set state = p_state, halt_reason = coalesce(p_halt_reason, halt_reason), finished_at = now()
   where id = p_run_id;

  return jsonb_build_object('state', p_state, 'blocking_failures', blocking);
end;
$$;

commit;
