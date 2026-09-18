-- THYLORA CONTINUITY WATCHDOG · 0002 · Compile, classify, compare, alert
-- Workstream: THY-CONTINUITY-WATCHDOG-001
--
-- The rule in the backend, so a direct write is checked the same as an
-- application write. Mirrors spine/continuity/watchdog.mjs; the two are held
-- level by tests/continuity.parity.test.mjs and db/continuity/validation.

begin;

-- ---------------------------------------------------------------------------
-- Normalization. Case, spacing and quote style are not continuity; meaning is.
-- ---------------------------------------------------------------------------

create or replace function thy_continuity_text(p_value jsonb)
returns text language sql immutable as $$
  select case
    when p_value is null then null
    when jsonb_typeof(p_value) = 'null' then null
    when jsonb_typeof(p_value) = 'string' then p_value #>> '{}'
    else p_value::text
  end;
$$;

create or replace function thy_continuity_normalize_text(p_text text)
returns text language sql immutable as $$
  select btrim(regexp_replace(
    lower(translate(coalesce(p_text, ''),
      E'‘’“”‐‑‒–—―',
      '''''""------')),
    '\s+', ' ', 'g'));
$$;

create or replace function thy_continuity_normalize(p_kind thy_continuity_kind, p_value jsonb)
returns jsonb language plpgsql immutable as $$
declare
  raw text := thy_continuity_text(p_value);
  cleaned text;
begin
  if p_value is null or jsonb_typeof(p_value) = 'null' then
    return null;
  end if;

  if p_kind = 'NUMERIC' then
    cleaned := regexp_replace(coalesce(raw, ''), '[^0-9.eE+-]', '', 'g');
    if cleaned = '' then return null; end if;
    begin
      return to_jsonb(cleaned::numeric);
    exception when others then
      return null;
    end;
  end if;

  if p_kind = 'SET' then
    return coalesce((
      select jsonb_agg(member order by member)
      from (
        select distinct thy_continuity_normalize_text(item) as member
        from (
          select case
                   when jsonb_typeof(element) = 'string' then element #>> '{}'
                   else element::text
                 end as item
          from jsonb_array_elements(
                 case when jsonb_typeof(p_value) = 'array'
                      then p_value
                      else to_jsonb(string_to_array(coalesce(raw, ''), ','))
                 end) as element
        ) as split
        where thy_continuity_normalize_text(item) <> ''
      ) as members
    ), '[]'::jsonb);
  end if;

  return to_jsonb(thy_continuity_normalize_text(raw));
end $$;

/* A produced value carries no assertion at all. */
create or replace function thy_continuity_is_absent(p_kind thy_continuity_kind, p_value jsonb)
returns boolean language sql immutable as $$
  select p_value is null
      or jsonb_typeof(p_value) = 'null'
      or (p_kind = 'SET' and coalesce(jsonb_array_length(thy_continuity_normalize(p_kind, p_value)), 0) = 0)
      or (p_kind <> 'SET' and coalesce(thy_continuity_normalize_text(thy_continuity_text(p_value)), '')
            in ('', 'null', 'n/a', 'na', 'none', '-', 'tbd', 'unknown'));
$$;

-- ---------------------------------------------------------------------------
-- Authority. Verified against the controlling side, never self-declared.
-- ---------------------------------------------------------------------------

create or replace function thy_continuity_authority_valid(p_ref text)
returns boolean language sql stable as $$
  select exists (
    select 1 from thy_continuity_authorities a
    where a.authority_ref = p_ref
      and a.revoked_at is null
      and (a.expires_at is null or a.expires_at > now())
  );
$$;

-- ---------------------------------------------------------------------------
-- PRE · compile the controlling facts relevant to a task
-- ---------------------------------------------------------------------------

/**
 * Current controlling facts for the named subjects and fields, plus every
 * contradiction inside the controlling set itself. A task whose own controlling
 * facts disagree is held before work starts, not after.
 */
create or replace function thy_continuity_compile(
  p_task_ref text,
  p_subject_refs text[] default null,
  p_field_keys text[] default null
) returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  entries jsonb := '[]'::jsonb;
  conflicts jsonb := '[]'::jsonb;
begin
  with scoped as (
    select f.*, r.kind, r.hard_watch
    from thy_controlling_facts f
    join thy_continuity_fields r on r.field_key = f.field_key
    where f.superseded_by is null
      and (p_subject_refs is null or f.subject_ref = any(p_subject_refs))
      and (p_field_keys is null or f.field_key = any(p_field_keys))
  ),
  grouped as (
    select subject_ref, field_key,
           count(distinct thy_continuity_normalize(kind, value)) as distinct_values,
           jsonb_agg(jsonb_build_object(
             'value', value, 'sequence_no', sequence_no, 'recorded_at', recorded_at)
             order by sequence_no, id) as all_values,
           (array_agg(subject_kind order by sequence_no desc, id desc))[1] as subject_kind,
           (array_agg(value       order by sequence_no desc, id desc))[1] as winning_value,
           (array_agg(sequence_no order by sequence_no desc, id desc))[1] as winning_sequence,
           (array_agg(recorded_at order by sequence_no desc, id desc))[1] as winning_recorded_at,
           (array_agg(authority_ref order by sequence_no desc, id desc))[1] as winning_authority,
           (array_agg(kind        order by sequence_no desc, id desc))[1] as kind,
           bool_or(hard_watch) as hard_watch
    from scoped
    group by subject_ref, field_key
  )
  select
    coalesce(jsonb_agg(jsonb_build_object(
      'subject_kind', subject_kind,
      'subject_ref',  subject_ref,
      'field_key',    field_key,
      'kind',         kind,
      'value',        winning_value,
      'normalized',   thy_continuity_normalize(kind, winning_value),
      'sequence_no',  winning_sequence,
      'recorded_at',  winning_recorded_at,
      'authority_ref', winning_authority,
      'hard_watch',   hard_watch,
      'conflicting',  distinct_values > 1,
      'conflict_values', case when distinct_values > 1 then all_values else null end
    ) order by subject_ref, field_key), '[]'::jsonb),
    coalesce(jsonb_agg(jsonb_build_object(
      'subject_kind', subject_kind,
      'subject_ref',  subject_ref,
      'field_key',    field_key,
      'hard_watch',   hard_watch,
      'values',       all_values,
      'detail', distinct_values || ' current controlling facts disagree for this field.'
    ) order by subject_ref, field_key) filter (where distinct_values > 1), '[]'::jsonb)
  into entries, conflicts
  from grouped;

  return jsonb_build_object(
    'task_ref', p_task_ref,
    'phase', 'PRE',
    'compiled_at', now(),
    'field_count', jsonb_array_length(entries),
    'entries', entries,
    'conflicts', conflicts,
    'proceed_allowed', jsonb_array_length(conflicts) = 0,
    'D', case when jsonb_array_length(conflicts) = 0 then 0 else 1 end
  );
end $$;

-- ---------------------------------------------------------------------------
-- Classification
-- ---------------------------------------------------------------------------

/**
 * Classify one produced value against one controlling fact.
 *
 * Order is deliberate: a contradiction in the controlling set outranks
 * everything, absence outranks difference, and an explicit supersession is
 * checked before any advance rule so an authorized change is never called drift.
 */
create or replace function thy_continuity_classify(
  p_field_key text,
  p_subject_ref text,
  p_controlling jsonb,
  p_current jsonb,
  p_recorded_at timestamptz default null,
  p_authority_ref text default null,
  p_subject_present boolean default true,
  p_controlling_conflicting boolean default false,
  p_now timestamptz default now()
) returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  spec        thy_continuity_fields%rowtype;
  ctrl        jsonb;
  cur         jsonb;
  magnitude   numeric := 1;
  missing_members text[];
  added_members   text[];
  sup         record;
  sup_any     boolean := false;
  from_index  integer;
  to_index    integer;
  elapsed_days numeric;
  allowed_advance numeric;
  ctrl_num    numeric;
  cur_num     numeric;
begin
  select * into spec from thy_continuity_fields where field_key = p_field_key;
  if not found then
    return jsonb_build_object('classification','CONFLICTING','d',1,'magnitude',1,
      'detail','Field is not in the watch registry: ' || p_field_key);
  end if;

  if p_controlling_conflicting then
    return jsonb_build_object('classification','CONFLICTING','d',1,'magnitude',1,
      'detail','Controlling set contains more than one current value for this field.');
  end if;

  -- A subject the task never produced is not evidence of loss. A subject that
  -- was produced with this field dropped is.
  if thy_continuity_is_absent(spec.kind, p_current) then
    if not p_subject_present then
      return jsonb_build_object('classification','UNCHANGED','d',0,'magnitude',0,
        'detail','Subject not produced by this task; controlling fact untouched.');
    end if;
    return jsonb_build_object('classification','MISSING','d',1,'magnitude',1,
      'detail','Controlling fact carries a value; produced state carries none.');
  end if;

  ctrl := thy_continuity_normalize(spec.kind, p_controlling);
  cur  := thy_continuity_normalize(spec.kind, p_current);

  if spec.kind = 'NUMERIC' then
    ctrl_num := (ctrl #>> '{}')::numeric;
    cur_num  := (cur  #>> '{}')::numeric;
    if ctrl_num is not null and cur_num is not null then
      magnitude := abs(cur_num - ctrl_num);
      if magnitude <= spec.tolerance then
        return jsonb_build_object('classification','UNCHANGED','d',0,'magnitude',0,
          'detail','Value identical to controlling fact.');
      end if;
    -- A numeric field whose value does not parse as a number is still compared
    -- by text rather than declared drift for failing to be a number.
    elsif thy_continuity_normalize_text(thy_continuity_text(p_controlling))
        = thy_continuity_normalize_text(thy_continuity_text(p_current)) then
      return jsonb_build_object('classification','UNCHANGED','d',0,'magnitude',0,
        'detail','Value identical to controlling fact.');
    end if;
  elsif ctrl = cur then
    return jsonb_build_object('classification','UNCHANGED','d',0,'magnitude',0,
      'detail', case when spec.kind = 'SET'
                     then 'Set membership identical.'
                     else 'Value identical to controlling fact.' end);
  end if;

  -- Explicit supersession. It must name this subject, this field, the value it
  -- came from and the value it goes to, and rest on a live authority.
  for sup in
    select s.* from thy_continuity_supersessions s
    where s.field_key = p_field_key
      and s.subject_ref = p_subject_ref
      and thy_continuity_authority_valid(s.authority_ref)
      and (s.from_value is null
           or thy_continuity_normalize(spec.kind, s.from_value) = ctrl)
    order by s.approved_at desc
  loop
    sup_any := true;
    if thy_continuity_normalize(spec.kind, sup.to_value) = cur then
      return jsonb_build_object('classification','EXPLICITLY_SUPERSEDED','d',0,'magnitude',0,
        'detail','Superseded by ' || sup.authority_ref || ' on ' || sup.approved_at || ': ' || sup.reason);
    end if;
  end loop;

  if sup_any then
    return jsonb_build_object('classification','CONFLICTING','d',1,'magnitude',magnitude,
      'detail','A supersession authorizes a different value than the one produced.');
  end if;

  if exists (
    select 1 from thy_continuity_supersessions s
    where s.field_key = p_field_key and s.subject_ref = p_subject_ref
      and thy_continuity_authority_valid(s.authority_ref)
  ) then
    return jsonb_build_object('classification','CONFLICTING','d',1,'magnitude',magnitude,
      'detail','A supersession exists for this field but records a different prior value.');
  end if;

  -- Sets
  if spec.kind = 'SET' then
    select array_agg(member) into missing_members
      from jsonb_array_elements_text(ctrl) as member
      where not (cur @> to_jsonb(member));
    select array_agg(member) into added_members
      from jsonb_array_elements_text(cur) as member
      where not (ctrl @> to_jsonb(member));

    if coalesce(array_length(missing_members, 1), 0) > 0 then
      return jsonb_build_object('classification','MISSING','d',1,'magnitude',1,
        'detail', array_length(missing_members,1) ||
          ' member(s) dropped without a closure record: ' || array_to_string(missing_members, ', ') || '.');
    end if;
    if spec.rule = 'SET_GROWTH' then
      return jsonb_build_object('classification','ADVANCED','d',0,'magnitude',0,
        'detail', coalesce(array_length(added_members,1),0) ||
          ' member(s) added: ' || coalesce(array_to_string(added_members, ', '), '') || '.');
    end if;
    return jsonb_build_object('classification','DRIFTED','d',1,'magnitude',1,
      'detail', coalesce(array_length(added_members,1),0) ||
        ' member(s) added to an immutable set: ' || coalesce(array_to_string(added_members, ', '), '') || '.');
  end if;

  -- Ages and anything else that may only move forward with time behind it
  if spec.rule = 'MONOTONIC_TIME' then
    if cur_num is null then
      return jsonb_build_object('classification','DRIFTED','d',1,'magnitude',magnitude,
        'detail','Produced value is not a number.');
    end if;
    if cur_num < ctrl_num then
      return jsonb_build_object('classification','DRIFTED','d',1,'magnitude',magnitude,
        'detail','Value moved backward: ' || ctrl_num || ' -> ' || cur_num || '.');
    end if;
    if p_recorded_at is null then
      return jsonb_build_object('classification','DRIFTED','d',1,'magnitude',magnitude,
        'detail','Value advanced with no recorded time basis to advance against.');
    end if;
    elapsed_days := greatest(0, extract(epoch from (p_now - p_recorded_at)) / 86400);
    allowed_advance := floor(elapsed_days / 365) + 1;
    if (cur_num - ctrl_num) <= allowed_advance then
      return jsonb_build_object('classification','ADVANCED','d',0,'magnitude',magnitude,
        'detail','Advanced ' || (cur_num - ctrl_num) || ' within ' || allowed_advance ||
                 ' allowed by ' || floor(elapsed_days) || ' elapsed day(s).');
    end if;
    return jsonb_build_object('classification','DRIFTED','d',1,'magnitude',magnitude,
      'detail','Advanced ' || (cur_num - ctrl_num) || '; elapsed time allows at most ' || allowed_advance || '.');
  end if;

  -- Ordered states
  if spec.rule = 'LADDER' then
    select i into to_index from generate_subscripts(spec.ladder, 1) as i
      where thy_continuity_normalize_text(spec.ladder[i]) = (cur #>> '{}');
    select i into from_index from generate_subscripts(spec.ladder, 1) as i
      where thy_continuity_normalize_text(spec.ladder[i]) = (ctrl #>> '{}');
    if to_index is null then
      return jsonb_build_object('classification','DRIFTED','d',1,'magnitude',1,
        'detail','Value "' || (cur #>> '{}') || '" is not on the declared ladder.');
    end if;
    if from_index is null then
      return jsonb_build_object('classification','CONFLICTING','d',1,'magnitude',1,
        'detail','Controlling value "' || (ctrl #>> '{}') || '" is not on the declared ladder.');
    end if;
    if to_index < from_index then
      return jsonb_build_object('classification','DRIFTED','d',1,'magnitude',1,
        'detail','Ladder reversed: ' || spec.ladder[from_index] || ' -> ' || spec.ladder[to_index] || '.');
    end if;
    if spec.requires_authority then
      if p_authority_ref is null then
        return jsonb_build_object('classification','DRIFTED','d',1,'magnitude',1,
          'detail','Change requires a recorded authority reference; none present.');
      end if;
      if not thy_continuity_authority_valid(p_authority_ref) then
        return jsonb_build_object('classification','DRIFTED','d',1,'magnitude',1,
          'detail','Authority "' || p_authority_ref || '" is not a live entry in the authority registry.');
      end if;
    end if;
    return jsonb_build_object('classification','ADVANCED','d',0,'magnitude',1,
      'detail', spec.ladder[from_index] || ' -> ' || spec.ladder[to_index] ||
        coalesce(', authorized by ' || p_authority_ref, '') || '.');
  end if;

  -- Authority-only fields
  if spec.rule = 'AUTHORITY_ONLY' then
    if p_authority_ref is null then
      return jsonb_build_object('classification','DRIFTED','d',1,'magnitude',magnitude,
        'detail','Change requires a recorded authority reference; none present.');
    end if;
    if not thy_continuity_authority_valid(p_authority_ref) then
      return jsonb_build_object('classification','DRIFTED','d',1,'magnitude',magnitude,
        'detail','Authority "' || p_authority_ref || '" is not a live entry in the authority registry.');
    end if;
    return jsonb_build_object('classification','ADVANCED','d',0,'magnitude',magnitude,
      'detail','authorized by ' || p_authority_ref);
  end if;

  return jsonb_build_object('classification','DRIFTED','d',1,'magnitude',magnitude,
    'detail','Immutable field changed with no supersession record.');
end $$;

-- ---------------------------------------------------------------------------
-- POST · compare produced state against the controlling facts
-- ---------------------------------------------------------------------------

/**
 * p_produced is { "<subject_ref>": { "<field_key>": <value> } }, where a value
 * may be bare or wrapped as { "value": ..., "authority_ref": ... }.
 *
 * Writes one check row and one finding per compared field. The alert, if any,
 * is raised by trigger from the findings, not from here, so an alert cannot be
 * skipped by inserting findings another way.
 */
create or replace function thy_continuity_check(
  p_task_ref text,
  p_phase text,
  p_sequence_no bigint default null,
  p_produced jsonb default '{}'::jsonb,
  p_subject_refs text[] default null,
  p_field_keys text[] default null,
  p_brief_digest text default null
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_brief        jsonb;
  v_entry        jsonb;
  v_raw          jsonb;
  v_current      jsonb;
  v_authority    text;
  v_verdict      jsonb;
  v_check_id     bigint;
  v_subject_seen boolean;
  v_d_max        numeric := 0;
  v_hard         integer := 0;
  v_soft         integer := 0;
  v_fields       integer := 0;
begin
  if p_phase not in ('PRE','POST') then
    raise exception 'THY_CONTINUITY_PHASE_INVALID: %', p_phase;
  end if;

  v_brief := thy_continuity_compile(p_task_ref, p_subject_refs, p_field_keys);

  insert into thy_continuity_checks
    (task_ref, phase, sequence_no, brief_digest, produced_digest, field_count,
     d_max, hard_breach_count, soft_breach_count, proceed_allowed)
  values (p_task_ref, p_phase, p_sequence_no, p_brief_digest,
          md5(p_produced::text), 0, 0, 0, 0, true)
  returning id into v_check_id;

  for v_entry in select * from jsonb_array_elements(v_brief->'entries') loop
    v_fields := v_fields + 1;
    v_subject_seen := jsonb_exists(p_produced, v_entry->>'subject_ref');
    v_raw := case when v_subject_seen
                  then p_produced -> (v_entry->>'subject_ref') -> (v_entry->>'field_key')
                  else null end;

    if v_raw is not null and jsonb_typeof(v_raw) = 'object' and jsonb_exists(v_raw, 'value') then
      v_current   := v_raw -> 'value';
      v_authority := v_raw ->> 'authority_ref';
    else
      v_current   := v_raw;
      v_authority := null;
    end if;

    v_verdict := thy_continuity_classify(
      v_entry->>'field_key',
      v_entry->>'subject_ref',
      v_entry->'value',
      v_current,
      (v_entry->>'recorded_at')::timestamptz,
      v_authority,
      v_subject_seen,
      coalesce((v_entry->>'conflicting')::boolean, false)
    );

    insert into thy_continuity_findings
      (check_id, subject_kind, subject_ref, field_key, classification, d, magnitude,
       hard_watch, controlling, current_value, detail)
    values (v_check_id, v_entry->>'subject_kind', v_entry->>'subject_ref', v_entry->>'field_key',
            (v_verdict->>'classification')::thy_continuity_class,
            (v_verdict->>'d')::numeric, (v_verdict->>'magnitude')::numeric,
            coalesce((v_entry->>'hard_watch')::boolean, true),
            v_entry->'value', v_current, v_verdict->>'detail');
  end loop;

  select coalesce(max(f.d), 0),
         count(*) filter (where f.d = 1 and f.hard_watch),
         count(*) filter (where f.d = 1 and not f.hard_watch)
    into v_d_max, v_hard, v_soft
    from thy_continuity_findings f where f.check_id = v_check_id;

  update thy_continuity_checks c
     set field_count = v_fields,
         d_max = v_d_max,
         hard_breach_count = v_hard,
         soft_breach_count = v_soft,
         proceed_allowed = (v_hard = 0)
   where c.id = v_check_id;

  return jsonb_build_object(
    'check_id', v_check_id,
    'task_ref', p_task_ref,
    'phase', p_phase,
    'sequence_no', p_sequence_no,
    'field_count', v_fields,
    'D', v_d_max,
    'proceed_allowed', v_hard = 0,
    'hard_breach_count', v_hard,
    'soft_breach_count', v_soft,
    'findings', (
      select coalesce(jsonb_agg(to_jsonb(f) order by f.id), '[]'::jsonb)
      from thy_continuity_findings f where f.check_id = v_check_id
    ),
    'alert', (
      select to_jsonb(a) from thy_continuity_alerts a where a.check_id = v_check_id
    )
  );
end $$;

-- ---------------------------------------------------------------------------
-- Carryforward · an active workstream that silently disappears
-- ---------------------------------------------------------------------------

/**
 * Silent is the word that matters. A workstream closed, suspended or handed off
 * has a record and is accounted for. One simply absent from the next sequence,
 * with nothing saying why, is continuity loss and holds.
 */
create or replace function thy_continuity_carryforward_gap(
  p_previous_sequence bigint,
  p_sequence bigint
) returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  vanished text[];
  closed   text[];
  added    text[];
  previous_count integer;
  carried_count  integer;
begin
  select array_agg(w.workstream_ref order by w.workstream_ref)
    into vanished
    from thy_workstream_carryforward w
   where w.sequence_no = p_previous_sequence
     and w.workstream_state = 'ACTIVE'
     and not exists (
       select 1 from thy_workstream_carryforward n
        where n.sequence_no = p_sequence and n.workstream_ref = w.workstream_ref
     );

  select array_agg(w.workstream_ref order by w.workstream_ref)
    into closed
    from thy_workstream_carryforward w
   where w.sequence_no = p_sequence
     and w.workstream_state <> 'ACTIVE'
     and exists (
       select 1 from thy_workstream_carryforward o
        where o.sequence_no = p_previous_sequence
          and o.workstream_ref = w.workstream_ref
          and o.workstream_state = 'ACTIVE'
     );

  select array_agg(w.workstream_ref order by w.workstream_ref)
    into added
    from thy_workstream_carryforward w
   where w.sequence_no = p_sequence
     and not exists (
       select 1 from thy_workstream_carryforward o
        where o.sequence_no = p_previous_sequence and o.workstream_ref = w.workstream_ref
     );

  select count(*) into previous_count from thy_workstream_carryforward
   where sequence_no = p_previous_sequence and workstream_state = 'ACTIVE';
  select count(*) into carried_count from thy_workstream_carryforward
   where sequence_no = p_sequence and workstream_state = 'ACTIVE';

  return jsonb_build_object(
    'previous_sequence', p_previous_sequence,
    'sequence_no', p_sequence,
    'previous_count', previous_count,
    'carried_count', carried_count,
    'vanished', coalesce(to_jsonb(vanished), '[]'::jsonb),
    'closed_with_record', coalesce(to_jsonb(closed), '[]'::jsonb),
    'added', coalesce(to_jsonb(added), '[]'::jsonb),
    'D', case when coalesce(array_length(vanished, 1), 0) = 0 then 0 else 1 end,
    'proceed_allowed', coalesce(array_length(vanished, 1), 0) = 0,
    'detail', case when coalesce(array_length(vanished, 1), 0) = 0
      then 'Every active workstream is either carried forward or closed on the record.'
      else array_length(vanished,1) ||
           ' active workstream(s) disappeared from carryforward with no closure record: ' ||
           array_to_string(vanished, ', ') || '.'
    end
  );
end $$;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

/* Historical records are not rewritten. A correction is a new fact. */
create or replace function thy_continuity_facts_immutable()
returns trigger language plpgsql as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'THY_CONTINUITY_FACT_IMMUTABLE: controlling facts are append-only; supersede instead of deleting (id %)', old.id;
  end if;

  if old.subject_kind is distinct from new.subject_kind
     or old.subject_ref is distinct from new.subject_ref
     or old.field_key   is distinct from new.field_key
     or old.value       is distinct from new.value
     or old.sequence_no is distinct from new.sequence_no
     or old.recorded_at is distinct from new.recorded_at
     or old.created_at  is distinct from new.created_at then
    raise exception 'THY_CONTINUITY_FACT_IMMUTABLE: controlling fact % cannot be rewritten; record a new fact and supersede this one', old.id;
  end if;

  if old.superseded_by is not null and new.superseded_by is distinct from old.superseded_by then
    raise exception 'THY_CONTINUITY_FACT_IMMUTABLE: controlling fact % is already superseded by %', old.id, old.superseded_by;
  end if;

  if new.superseded_by is not null and new.superseded_at is null then
    new.superseded_at := now();
  end if;
  return new;
end $$;

drop trigger if exists thy_facts_no_rewrite on thy_controlling_facts;
create trigger thy_facts_no_rewrite before update or delete on thy_controlling_facts
  for each row execute function thy_continuity_facts_immutable();

/**
 * Detect continuity loss immediately, before it propagates: a second current
 * controlling fact that disagrees with the one already standing is a
 * contradiction the moment it lands, not at the next task boundary.
 */
create or replace function thy_continuity_fact_conflict_watch()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  spec     thy_continuity_fields%rowtype;
  rival    thy_controlling_facts%rowtype;
  check_id bigint;
begin
  select * into spec from thy_continuity_fields where field_key = new.field_key;
  if not found then return new; end if;

  select * into rival from thy_controlling_facts f
   where f.superseded_by is null
     and f.id <> new.id
     and f.subject_ref = new.subject_ref
     and f.field_key = new.field_key
     and thy_continuity_normalize(spec.kind, f.value)
         is distinct from thy_continuity_normalize(spec.kind, new.value)
   order by f.sequence_no desc, f.id desc
   limit 1;

  if not found then return new; end if;

  insert into thy_continuity_checks
    (task_ref, phase, sequence_no, field_count, d_max,
     hard_breach_count, soft_breach_count, proceed_allowed)
  values ('CONTROLLING_FACT_WRITE', 'PRE', new.sequence_no, 1, 1,
          case when spec.hard_watch then 1 else 0 end,
          case when spec.hard_watch then 0 else 1 end,
          not spec.hard_watch)
  returning id into check_id;

  insert into thy_continuity_findings
    (check_id, subject_kind, subject_ref, field_key, classification, d, magnitude,
     hard_watch, controlling, current_value, detail)
  values (check_id, new.subject_kind, new.subject_ref, new.field_key, 'CONFLICTING', 1, 1,
          spec.hard_watch, rival.value, new.value,
          'A second current controlling fact (id ' || new.id ||
          ') disagrees with standing fact id ' || rival.id ||
          '. Supersede one explicitly or the field has no controlling value.');
  return new;
end $$;

drop trigger if exists thy_facts_conflict_watch on thy_controlling_facts;
create trigger thy_facts_conflict_watch after insert on thy_controlling_facts
  for each row execute function thy_continuity_fact_conflict_watch();

/**
 * Raise the alert from the findings themselves. Whatever wrote the breach —
 * thy_continuity_check, the conflict watch, or a hand at the console — the
 * alert record exists.
 */
create or replace function thy_continuity_raise_alert()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  chk        thy_continuity_checks%rowtype;
  breaches   integer;
  hard       integer;
  severity   text;
  code       text;
begin
  select * into chk from thy_continuity_checks where id = new.check_id;
  if not found then return null; end if;

  select count(*) filter (where d = 1),
         count(*) filter (where d = 1 and hard_watch)
    into breaches, hard
    from thy_continuity_findings where check_id = new.check_id;

  if breaches = 0 then return null; end if;

  severity := case when hard > 0 then 'HOLD' else 'WARN' end;
  code := upper('THY-CONT-' || coalesce(chk.sequence_no::text, '0') || '-' ||
                substr(md5(chk.id::text || chk.task_ref || chk.phase), 1, 8));

  insert into thy_continuity_alerts
    (alert_code, check_id, task_ref, phase, sequence_no, severity, headline,
     breach_count, hard_breach_count, evidence, raised_at)
  values (code, chk.id, chk.task_ref, chk.phase, chk.sequence_no, severity,
          case when hard > 0
            then 'HOLD · ' || hard || ' hard-watch field(s) lost continuity at ' || chk.phase || '.'
            else 'WARN · ' || breaches || ' watched field(s) deviated at ' || chk.phase || '.' end,
          breaches, hard,
          jsonb_build_object(
            'brief_digest', chk.brief_digest,
            'produced_digest', chk.produced_digest,
            'field_count', chk.field_count,
            'breach_count', breaches,
            'hard_breach_count', hard),
          now())
  on conflict (alert_code) do update set
    severity = excluded.severity,
    headline = excluded.headline,
    breach_count = excluded.breach_count,
    hard_breach_count = excluded.hard_breach_count,
    evidence = excluded.evidence;
  return null;
end $$;

drop trigger if exists thy_findings_raise_alert on thy_continuity_findings;
create trigger thy_findings_raise_alert after insert on thy_continuity_findings
  for each row execute function thy_continuity_raise_alert();

commit;
