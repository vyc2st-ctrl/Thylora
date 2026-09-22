-- GATE LAW · 0002 · The read and write path
-- Work: THY-WORK-DYNAMIC-GATE-LAW-588
--
-- Every write returns the readback of what it just wrote. A caller never has to
-- ask a second question to find out what it did, and can never report a rule it
-- did not actually put in force.

begin;

-- CURRENT RULE ----------------------------------------------------------------
-- One row per gate: the highest version, always. Reading "the gate" and reading
-- "the current rule" are the same act, so they cannot come apart.
create or replace view thy_gate_law_current as
  select distinct on (gate_key) *
    from thy_gate_law
   order by gate_key, version desc;

comment on view thy_gate_law_current is
  'HOLD CURRENT RULE STRONGLY: the highest version of every gate. Never filtered by state — a PASSED or RETIRED rule is still the rule in force.';

-- READBACK --------------------------------------------------------------------
-- The eleven fields, in the order the law names them.
create or replace function thy_gate_law_render(p_row thy_gate_law)
returns jsonb language sql immutable set search_path = public as $$
  select jsonb_build_object(
    'GATE',          p_row.gate_key,
    'SCOPE',         p_row.scope,
    'AUTHORITY',     p_row.authority,
    'AUTHORITY_HOLDER', p_row.authority_holder,
    'EVIDENCE',      p_row.evidence,
    'CONTEXT',       p_row.context,
    'TRIGGER',       p_row.trigger_condition,
    'STATE',         p_row.gate_state,
    'STATE_REASON',  p_row.state_reason,
    'EXCEPTION',     p_row.exception_clause,
    'VERSION',       p_row.version,
    'SUPERSEDES',    case when p_row.supersedes_version is null
                          then 'NOTHING — this is the first version of this gate'
                          else 'version ' || p_row.supersedes_version end,
    'READBACK',      p_row.readback,
    'NEXT_REVIEW',   coalesce(
                       to_char(p_row.next_review_utc at time zone 'utc','YYYY-MM-DD"T"HH24:MI:SS"Z"'),
                       'NO REVIEW DATE — ' || p_row.no_review_reason),
    'entered_sequence_no', p_row.entered_sequence_no,
    'topic_key',     p_row.topic_key
  )
$$;

-- The field order is data, so a surface cannot quietly reorder the law.
create or replace function thy_gate_law_field_order()
returns jsonb language sql immutable set search_path = public as $$
  select jsonb_build_array('SCOPE','AUTHORITY','EVIDENCE','CONTEXT','TRIGGER',
                           'STATE','EXCEPTION','VERSION','SUPERSEDES','READBACK','NEXT_REVIEW')
$$;

-- DECLARE (version 1) ---------------------------------------------------------
create or replace function thy_gate_declare(
  p_gate_key   text,
  p_scope      text,
  p_authority  text,
  p_authority_holder text,
  p_evidence   text,
  p_context    text,
  p_trigger    text,
  p_state      text,
  p_state_reason text,
  p_exception  text,
  p_readback   text,
  p_sequence_no bigint,
  p_next_review_utc timestamptz default null,
  p_no_review_reason text default null,
  p_topic_key  text default null
) returns jsonb language plpgsql set search_path = public as $$
declare v_row thy_gate_law;
begin
  insert into thy_gate_law (
    gate_key, version, scope, authority, authority_holder, evidence, context,
    trigger_condition, gate_state, state_reason, exception_clause,
    supersedes_version, readback, next_review_utc, no_review_reason,
    entered_sequence_no, topic_key)
  values (
    upper(btrim(p_gate_key)), 1, p_scope, p_authority, p_authority_holder, p_evidence, p_context,
    p_trigger, p_state, p_state_reason, p_exception,
    null, p_readback, p_next_review_utc, p_no_review_reason,
    p_sequence_no, case when p_topic_key is null then null else upper(btrim(p_topic_key)) end)
  returning * into v_row;
  return thy_gate_law_render(v_row);
end $$;

-- SUPERSEDE (every later version) ---------------------------------------------
-- p_supersedes_version is required and is checked against what is actually
-- current. Passing it is how a caller proves it read the rule it is replacing.
create or replace function thy_gate_supersede(
  p_gate_key   text,
  p_supersedes_version int,
  p_scope      text,
  p_authority  text,
  p_authority_holder text,
  p_evidence   text,
  p_context    text,
  p_trigger    text,
  p_state      text,
  p_state_reason text,
  p_exception  text,
  p_readback   text,
  p_sequence_no bigint,
  p_next_review_utc timestamptz default null,
  p_no_review_reason text default null,
  p_topic_key  text default null
) returns jsonb language plpgsql set search_path = public as $$
declare
  v_key text := upper(btrim(p_gate_key));
  v_current int;
  v_row thy_gate_law;
begin
  select max(version) into v_current from thy_gate_law where gate_key = v_key;
  if v_current is null then
    raise exception
      'GATE_LAW_UNKNOWN: gate % has no version 1. Declare it before superseding it.', v_key
      using errcode = 'raise_exception';
  end if;
  if p_supersedes_version is null then
    raise exception
      'GATE_LAW_SUPERSESSION_REQUIRED: gate % is at version %. Name the version being superseded.',
      v_key, v_current using errcode = 'raise_exception';
  end if;

  insert into thy_gate_law (
    gate_key, version, scope, authority, authority_holder, evidence, context,
    trigger_condition, gate_state, state_reason, exception_clause,
    supersedes_version, readback, next_review_utc, no_review_reason,
    entered_sequence_no, topic_key)
  values (
    v_key, v_current + 1, p_scope, p_authority, p_authority_holder, p_evidence, p_context,
    p_trigger, p_state, p_state_reason, p_exception,
    p_supersedes_version, p_readback, p_next_review_utc, p_no_review_reason,
    p_sequence_no, case when p_topic_key is null then null else upper(btrim(p_topic_key)) end)
  returning * into v_row;
  return thy_gate_law_render(v_row);
end $$;

-- READ ONE --------------------------------------------------------------------
create or replace function thy_gate_current(p_gate_key text)
returns jsonb language plpgsql stable set search_path = public as $$
declare
  v_key text := upper(btrim(p_gate_key));
  v_row thy_gate_law;
  v_history jsonb;
begin
  select * into v_row from thy_gate_law
   where gate_key = v_key order by version desc limit 1;

  if v_row.gate_key is null then
    return jsonb_build_object(
      'found', false,
      'gate_key', v_key,
      'answer', 'No gate by that key is declared. An undeclared gate is not an open gate and not a passed one — it does not exist.',
      'field_order', thy_gate_law_field_order());
  end if;

  select coalesce(jsonb_agg(thy_gate_law_render(h) order by h.version desc), '[]'::jsonb)
    into v_history
    from thy_gate_law h where h.gate_key = v_key and h.version < v_row.version;

  return jsonb_build_object(
    'found', true,
    'field_order',   thy_gate_law_field_order(),
    'current',       thy_gate_law_render(v_row),
    'superseded',    v_history,
    'version_count', (select count(*) from thy_gate_law where gate_key = v_key),
    'law', jsonb_build_array(
      'HOLD CURRENT RULE STRONGLY: version ' || v_row.version || ' is in force.',
      'NO SILENT MUTATION: this row cannot be edited or deleted.',
      'NO OLD RULE OVERRIDING NEWER RULE: only a version above ' || v_row.version || ' can replace it.',
      'EXPLICIT SUPERSESSION ONLY: that version must name version ' || v_row.version || '.'));
end $$;

-- READ MANY -------------------------------------------------------------------
-- CURRENT GATES for the dashboard: the rule in force for every gate, with the
-- open ones first, and the review debt named rather than left to be noticed.
create or replace function thy_gate_law_readback(
  p_scope text default null,
  p_topic_key text default null,
  p_as_of timestamptz default null
) returns jsonb language plpgsql stable set search_path = public as $$
declare
  v_as_of timestamptz := coalesce(p_as_of, now());
  v_gates jsonb;
  v_due   jsonb;
begin
  -- Read the current version straight from the base table, so render() receives a
  -- thy_gate_law row rather than a view row that merely looks like one.
  select coalesce(jsonb_agg(thy_gate_law_render(c)
           order by (case c.gate_state when 'BLOCKED' then 0 when 'OPEN' then 1 when 'HELD' then 2
                                       when 'WAIVED' then 3 when 'PASSED' then 4 else 5 end),
                    c.gate_key), '[]'::jsonb)
    into v_gates
    from thy_gate_law c
   where c.version = (select max(v.version) from thy_gate_law v where v.gate_key = c.gate_key)
     and (p_scope is null or c.scope = p_scope)
     and (p_topic_key is null or c.topic_key = upper(btrim(p_topic_key)));

  select coalesce(jsonb_agg(jsonb_build_object(
           'GATE', c.gate_key, 'VERSION', c.version,
           'NEXT_REVIEW', to_char(c.next_review_utc at time zone 'utc','YYYY-MM-DD"T"HH24:MI:SS"Z"'),
           'overdue_by', (v_as_of - c.next_review_utc)::text) order by c.next_review_utc), '[]'::jsonb)
    into v_due
    from thy_gate_law c
   where c.version = (select max(v.version) from thy_gate_law v where v.gate_key = c.gate_key)
     and c.next_review_utc is not null and c.next_review_utc <= v_as_of
     and c.gate_state <> 'RETIRED'
     and (p_scope is null or c.scope = p_scope);

  return jsonb_build_object(
    'scope',        coalesce(p_scope, 'ALL'),
    'topic_key',    p_topic_key,
    'read_at_utc',  to_char(v_as_of at time zone 'utc','YYYY-MM-DD"T"HH24:MI:SS"Z"'),
    'field_order',  thy_gate_law_field_order(),
    'gates',        v_gates,
    'counts', jsonb_build_object(
      'total',   jsonb_array_length(v_gates),
      'blocked', (select count(*) from thy_gate_law_current c where c.gate_state = 'BLOCKED'
                    and (p_scope is null or c.scope = p_scope)),
      'open',    (select count(*) from thy_gate_law_current c where c.gate_state in ('OPEN','HELD')
                    and (p_scope is null or c.scope = p_scope)),
      'settled', (select count(*) from thy_gate_law_current c where c.gate_state in ('PASSED','WAIVED','RETIRED')
                    and (p_scope is null or c.scope = p_scope))),
    'review_due',   v_due,
    'law', jsonb_build_array(
      'HOLD CURRENT RULE STRONGLY',
      'NO SILENT MUTATION',
      'NO OLD RULE OVERRIDING NEWER RULE',
      'EXPLICIT SUPERSESSION ONLY'));
end $$;

commit;
