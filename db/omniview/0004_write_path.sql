-- OMNIVIEW · 0004 · Write path (writeback, with readback in the same call)
-- Work: THY-WORK-SEQUENCE-CHANGE-LEDGER-587
--
-- Every write goes through a function that returns the readback of what it just
-- wrote. A write whose readback does not match is a failed write, not a quiet
-- one. Nothing here edits history: supersession is an insert plus a status flip
-- in the CURRENT -> SUPERSEDED direction only.

begin;

-- 1. APPEND A SEQUENCE --------------------------------------------------------
create or replace function thy_sequence_append(
  p_sequence_no          bigint,
  p_occurred_local       timestamp,
  p_local_timezone       text,
  p_why_change_occurred  text,
  p_what_changed         text,
  p_why_it_changed       text,
  p_what_remained        text,
  p_authority            text,
  p_truth_class          text,
  p_next_better_question text,
  p_restart_point        text,
  p_topics               jsonb default '[]'::jsonb,   -- ["CASTLE", ...] or [{"topic_key":..,"effect":..}]
  p_supersedes           bigint default null,
  p_source_ref           text   default null,
  p_occurred_utc         timestamptz default null
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_prev bigint;
  v_utc  timestamptz;
  item   jsonb;
  v_key  text;
  v_eff  text;
begin
  select max(sequence_no) into v_prev from thy_sequence_ledger;

  -- Local is authoritative for "when the Chairman lived it"; UTC is derived from
  -- the stated zone unless the caller supplies it explicitly.
  v_utc := coalesce(p_occurred_utc, p_occurred_local at time zone p_local_timezone);

  insert into thy_sequence_ledger (
    sequence_no, previous_sequence_no, occurred_utc, occurred_local, local_timezone,
    why_change_occurred, what_changed, why_it_changed, what_remained,
    authority, truth_class, next_better_question, restart_point,
    supersedes_sequence_no, source_ref)
  values (
    p_sequence_no, v_prev, v_utc, p_occurred_local, p_local_timezone,
    p_why_change_occurred, p_what_changed, p_why_it_changed, p_what_remained,
    p_authority, p_truth_class, p_next_better_question, p_restart_point,
    p_supersedes, p_source_ref);

  for item in select * from jsonb_array_elements(coalesce(p_topics,'[]'::jsonb)) loop
    if jsonb_typeof(item) = 'string' then
      v_key := upper(btrim(item #>> '{}')); v_eff := 'TOUCHED';
    else
      v_key := upper(btrim(item->>'topic_key')); v_eff := coalesce(item->>'effect','TOUCHED');
    end if;
    if v_key is null or v_key = '' then continue; end if;
    if not exists (select 1 from thy_omniview_topics where topic_key = v_key) then
      raise exception 'UNKNOWN_TOPIC: % is not in the topic manifest. Register it before linking a sequence to it.', v_key;
    end if;
    insert into thy_sequence_ledger_topics (sequence_no, topic_key, effect)
    values (p_sequence_no, v_key, v_eff)
    on conflict (sequence_no, topic_key) do update set effect = excluded.effect;

    update thy_omniview_topics
       set last_sequence_no = p_sequence_no,
           restart_point    = p_restart_point,
           updated_at       = now()
     where topic_key = v_key;
  end loop;

  -- READBACK: the caller is handed what the database now holds, not what was sent.
  return thy_omniview_sequence(p_sequence_no);
end $$;

-- 2. REGISTER / RELOCK A TOPIC ------------------------------------------------
create or replace function thy_omniview_register_topic(
  p_topic_key text, p_display_name text, p_topic_class text,
  p_authority_lock text, p_authority_holder text default null,
  p_summary text default null, p_canon_state text default 'UNSEEDED'
) returns jsonb language plpgsql security definer set search_path = public as $$
declare k text := upper(btrim(p_topic_key));
begin
  insert into thy_omniview_topics (topic_key, display_name, topic_class, authority_lock,
                                   authority_holder, summary, canon_state)
  values (k, p_display_name, p_topic_class, p_authority_lock, p_authority_holder, p_summary, p_canon_state)
  on conflict (topic_key) do update
    set display_name     = excluded.display_name,
        topic_class      = excluded.topic_class,
        authority_lock   = excluded.authority_lock,
        authority_holder = excluded.authority_holder,
        summary          = coalesce(excluded.summary, thy_omniview_topics.summary),
        canon_state      = excluded.canon_state,
        updated_at       = now();
  return thy_omniview_topic(k, 5);
end $$;

-- 3. STATE CANON (supersedes, never edits) ------------------------------------
create or replace function thy_omniview_state_canon(
  p_topic_key text,
  p_body text,
  p_truth_class text,
  p_authority text,
  p_sequence_no bigint,
  p_supersedes_id bigint default null,
  p_statement_kind text default 'CANON',
  p_source_ref text default null
) returns jsonb language plpgsql security definer set search_path = public as $$
declare k text := upper(btrim(p_topic_key)); v_new bigint; v_old thy_omniview_statements%rowtype;
begin
  if not exists (select 1 from thy_omniview_topics where topic_key = k) then
    raise exception 'UNKNOWN_TOPIC: % is not in the topic manifest.', k;
  end if;
  if not exists (select 1 from thy_sequence_ledger where sequence_no = p_sequence_no) then
    raise exception 'UNKNOWN_SEQUENCE: canon must enter on a recorded sequence; % does not exist.', p_sequence_no;
  end if;

  insert into thy_omniview_statements (topic_key, statement_kind, body, truth_class, authority,
                                       entered_sequence_no, source_ref)
  values (k, p_statement_kind, p_body, p_truth_class, p_authority, p_sequence_no, p_source_ref)
  returning id into v_new;

  if p_supersedes_id is not null then
    select * into v_old from thy_omniview_statements where id = p_supersedes_id;
    if not found then
      raise exception 'UNKNOWN_STATEMENT: cannot supersede statement %; it does not exist.', p_supersedes_id;
    end if;
    if v_old.topic_key <> k then
      raise exception 'CROSS_TOPIC_SUPERSESSION: statement % belongs to %, not %.', p_supersedes_id, v_old.topic_key, k;
    end if;
    update thy_omniview_statements
       set status = 'SUPERSEDED', superseded_by_id = v_new, superseded_sequence_no = p_sequence_no
     where id = p_supersedes_id;
  end if;

  update thy_omniview_topics
     set canon_state = case when canon_state = 'UNSEEDED' then 'PARTIAL' else canon_state end,
         last_sequence_no = greatest(coalesce(last_sequence_no, 0), p_sequence_no),
         updated_at = now()
   where topic_key = k;

  insert into thy_sequence_ledger_topics (sequence_no, topic_key, effect)
  values (p_sequence_no, k, 'CANON_CHANGED')
  on conflict (sequence_no, topic_key) do update set effect = 'CANON_CHANGED';

  return thy_omniview_topic(k, 10);
end $$;

-- 4. LINK AN ENTITY -----------------------------------------------------------
create or replace function thy_omniview_link(
  p_topic_key text, p_link_class text, p_link_key text, p_display_name text,
  p_relation text, p_status text default 'ACTIVE',
  p_source_table text default null, p_source_ref text default null,
  p_sequence_no bigint default null
) returns jsonb language plpgsql security definer set search_path = public as $$
declare k text := upper(btrim(p_topic_key));
begin
  insert into thy_omniview_links (topic_key, link_class, link_key, display_name, relation,
                                  status, source_table, source_ref, entered_sequence_no)
  values (k, p_link_class, p_link_key, p_display_name, p_relation, p_status,
          p_source_table, p_source_ref, p_sequence_no)
  on conflict (topic_key, link_class, link_key) do update
    set display_name = excluded.display_name,
        relation     = excluded.relation,
        status       = excluded.status,
        source_table = coalesce(excluded.source_table, thy_omniview_links.source_table),
        source_ref   = coalesce(excluded.source_ref,   thy_omniview_links.source_ref);
  return thy_omniview_topic(k, 5);
end $$;

-- 5. GATES --------------------------------------------------------------------
create or replace function thy_omniview_set_gate(
  p_gate_key text, p_topic_key text, p_requirement text, p_gate_state text,
  p_authority text, p_blocker text default null, p_evidence_ref text default null,
  p_sequence_no bigint default null
) returns jsonb language plpgsql security definer set search_path = public as $$
declare k text := upper(btrim(p_topic_key));
begin
  insert into thy_omniview_gates (gate_key, topic_key, requirement, gate_state, blocker,
                                  authority, evidence_ref, entered_sequence_no,
                                  settled_sequence_no)
  values (p_gate_key, k, p_requirement, p_gate_state, p_blocker, p_authority, p_evidence_ref,
          p_sequence_no,
          case when p_gate_state in ('PASSED','WAIVED') then p_sequence_no else null end)
  on conflict (gate_key) do update
    set requirement = excluded.requirement,
        gate_state  = excluded.gate_state,
        blocker     = excluded.blocker,
        authority   = excluded.authority,
        evidence_ref= coalesce(excluded.evidence_ref, thy_omniview_gates.evidence_ref),
        settled_sequence_no = case when excluded.gate_state in ('PASSED','WAIVED')
                                   then coalesce(excluded.settled_sequence_no, thy_omniview_gates.settled_sequence_no)
                                   else null end,
        updated_at  = now();
  return thy_omniview_topic(k, 5);
end $$;

-- 6. QUESTIONS ----------------------------------------------------------------
create or replace function thy_omniview_ask(
  p_topic_key text, p_question text, p_why_it_matters text default null,
  p_is_next_better boolean default false, p_sequence_no bigint default null
) returns jsonb language plpgsql security definer set search_path = public as $$
declare k text := upper(btrim(p_topic_key));
begin
  if p_is_next_better then
    update thy_omniview_questions set is_next_better = false
     where topic_key = k and state = 'OPEN' and is_next_better;
  end if;
  insert into thy_omniview_questions (topic_key, question, why_it_matters, is_next_better, entered_sequence_no)
  values (k, p_question, p_why_it_matters, p_is_next_better, p_sequence_no);
  return thy_omniview_topic(k, 5);
end $$;

create or replace function thy_omniview_answer(p_question_id bigint, p_sequence_no bigint)
returns jsonb language plpgsql security definer set search_path = public as $$
declare k text;
begin
  update thy_omniview_questions
     set state = 'ANSWERED', answered_sequence_no = p_sequence_no, is_next_better = false
   where id = p_question_id returning topic_key into k;
  if k is null then raise exception 'UNKNOWN_QUESTION: %', p_question_id; end if;
  return thy_omniview_topic(k, 5);
end $$;

-- 7. RESTART POINT ------------------------------------------------------------
create or replace function thy_omniview_restart(
  p_restart_point text, p_reason text, p_authority text, p_sequence_no bigint,
  p_scope text default 'SPINE', p_topic_key text default null
) returns jsonb language plpgsql security definer set search_path = public as $$
begin
  insert into thy_omniview_restarts (scope, topic_key, restart_point, reason, authority, sequence_no)
  values (p_scope, nullif(upper(btrim(coalesce(p_topic_key,''))),''), p_restart_point, p_reason, p_authority, p_sequence_no);
  if p_topic_key is not null then
    insert into thy_sequence_ledger_topics (sequence_no, topic_key, effect)
    values (p_sequence_no, upper(btrim(p_topic_key)), 'RESTARTED')
    on conflict (sequence_no, topic_key) do update set effect = 'RESTARTED';
  end if;
  return thy_omniview_manifest(3);
end $$;

commit;
