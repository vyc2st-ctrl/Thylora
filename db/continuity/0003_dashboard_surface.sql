-- THYLORA CONTINUITY WATCHDOG · 0003 · Dashboard surface and access
-- Workstream: THY-CONTINUITY-WATCHDOG-001
--
-- AUTHORITY: DASHBOARD_AUTHORITY.md places the Chairman dashboard outside this
-- repository. Nothing here edits dashboard-current-head.html or any deployed
-- dashboard file. The surface offered is a read side — four views and one feed
-- function — so the authoritative dashboard adds one panel and one call and
-- keeps its own deployment path.
--
-- ACCESS != AUTHORITY. Everything below is read-only to signed-in readers.
-- Writing a controlling fact, a supersession or an authority stays with the
-- service role; clearing an alert is a named, evidenced act.

begin;

-- 1 · Current controlling value per subject and field, with its last verdict.
create or replace view thy_continuity_dashboard as
with current_facts as (
  select distinct on (f.subject_ref, f.field_key)
         f.subject_kind, f.subject_ref, f.field_key, f.value, f.sequence_no,
         f.recorded_at, f.authority_ref, r.label, r.kind, r.rule, r.hard_watch, r.watch_order
    from thy_controlling_facts f
    join thy_continuity_fields r on r.field_key = f.field_key
   where f.superseded_by is null
   order by f.subject_ref, f.field_key, f.sequence_no desc, f.id desc
),
last_finding as (
  select distinct on (n.subject_ref, n.field_key)
         n.subject_ref, n.field_key, n.classification, n.d, n.magnitude,
         n.detail, n.created_at, c.task_ref, c.phase, c.proceed_allowed
    from thy_continuity_findings n
    join thy_continuity_checks c on c.id = n.check_id
   order by n.subject_ref, n.field_key, n.id desc
)
select cf.subject_kind,
       cf.subject_ref,
       cf.field_key,
       cf.label,
       cf.kind,
       cf.rule,
       cf.hard_watch,
       cf.watch_order,
       cf.value          as controlling_value,
       cf.sequence_no    as controlling_sequence,
       cf.recorded_at    as controlling_recorded_at,
       cf.authority_ref  as controlling_authority,
       lf.classification as last_classification,
       coalesce(lf.d, 0) as last_d,
       lf.magnitude      as last_magnitude,
       lf.detail         as last_detail,
       lf.task_ref       as last_task_ref,
       lf.created_at     as last_checked_at,
       (lf.d = 1)        as in_breach
  from current_facts cf
  left join last_finding lf
    on lf.subject_ref = cf.subject_ref and lf.field_key = cf.field_key;

-- 2 · Open alerts, newest first. This is the panel a Chairman reads.
create or replace view thy_continuity_open_alerts as
select a.alert_code, a.severity, a.alert_state, a.headline, a.task_ref, a.phase,
       a.sequence_no, a.breach_count, a.hard_breach_count, a.raised_at,
       a.acknowledged_at, a.evidence,
       (select coalesce(jsonb_agg(jsonb_build_object(
                 'subject_kind', f.subject_kind,
                 'subject_ref',  f.subject_ref,
                 'field_key',    f.field_key,
                 'classification', f.classification,
                 'hard_watch',   f.hard_watch,
                 'controlling',  f.controlling,
                 'current',      f.current_value,
                 'magnitude',    f.magnitude,
                 'detail',       f.detail) order by f.id), '[]'::jsonb)
          from thy_continuity_findings f
         where f.check_id = a.check_id and f.d = 1) as breaches
  from thy_continuity_alerts a
 where a.alert_state <> 'CLEARED'
 order by (a.severity = 'HOLD') desc, a.raised_at desc;

-- 3 · Is the spine holding right now, and on what.
create or replace view thy_continuity_hold_state as
select exists (select 1 from thy_continuity_alerts
                where alert_state <> 'CLEARED' and severity = 'HOLD') as holding,
       (select count(*) from thy_continuity_alerts
         where alert_state <> 'CLEARED' and severity = 'HOLD')        as open_holds,
       (select count(*) from thy_continuity_alerts
         where alert_state <> 'CLEARED' and severity = 'WARN')        as open_warnings,
       (select max(raised_at) from thy_continuity_alerts
         where alert_state <> 'CLEARED')                              as latest_alert_at,
       (select count(*) from thy_continuity_dashboard where in_breach) as fields_in_breach,
       (select count(*) from thy_continuity_fields where hard_watch)   as hard_watch_fields;

-- 4 · Workstream carryforward, latest sequence against the one before it.
create or replace view thy_continuity_workstream_state as
with latest as (select max(sequence_no) as seq from thy_workstream_carryforward),
previous as (select max(sequence_no) as seq from thy_workstream_carryforward, latest
              where sequence_no < latest.seq)
select w.sequence_no, w.workstream_ref, w.workstream_state, w.closure_ref, w.recorded_at,
       (w.sequence_no = (select seq from latest)) as is_latest,
       exists (select 1 from thy_workstream_carryforward n, latest
                where n.sequence_no = latest.seq and n.workstream_ref = w.workstream_ref)
         as carried_forward
  from thy_workstream_carryforward w
 where w.sequence_no in ((select seq from latest), (select seq from previous))
 order by w.sequence_no desc, w.workstream_ref;

-- 5 · One call, one payload. The dashboard adds one panel and one fetch.
create or replace function thy_continuity_dashboard_feed(p_limit integer default 25)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'generated_at', now(),
    'hold_state', (select to_jsonb(h) from thy_continuity_hold_state h),
    'open_alerts', (select coalesce(jsonb_agg(to_jsonb(a)), '[]'::jsonb)
                      from (select * from thy_continuity_open_alerts limit greatest(p_limit, 1)) a),
    'fields_in_breach', (select coalesce(jsonb_agg(to_jsonb(d) order by d.watch_order), '[]'::jsonb)
                           from thy_continuity_dashboard d where d.in_breach),
    'latest_checks', (select coalesce(jsonb_agg(to_jsonb(c)), '[]'::jsonb)
                        from (select id, task_ref, phase, sequence_no, field_count, d_max,
                                     hard_breach_count, soft_breach_count, proceed_allowed, checked_at
                                from thy_continuity_checks
                               order by id desc limit greatest(p_limit, 1)) c),
    'watch_registry', (select coalesce(jsonb_agg(to_jsonb(r) order by r.watch_order), '[]'::jsonb)
                         from thy_continuity_fields r)
  );
$$;

-- 6 · Clearing an alert is a named act with a reason. Nothing clears silently.
create or replace function thy_continuity_clear_alert(
  p_alert_code text, p_note text, p_cleared_by uuid default auth.uid()
) returns thy_continuity_alerts language plpgsql security definer set search_path = public as $$
declare cleared thy_continuity_alerts;
begin
  if p_note is null or length(btrim(p_note)) = 0 then
    raise exception 'THY_CONTINUITY_CLEARANCE_NOTE_REQUIRED: alert % cannot be cleared without a reason', p_alert_code;
  end if;
  update thy_continuity_alerts
     set alert_state = 'CLEARED', cleared_at = now(),
         cleared_by = p_cleared_by, clearance_note = p_note
   where alert_code = p_alert_code and alert_state <> 'CLEARED'
  returning * into cleared;
  if not found then
    raise exception 'THY_CONTINUITY_ALERT_NOT_OPEN: %', p_alert_code;
  end if;
  return cleared;
end $$;

-- 7 · Access. Read for signed-in readers, custody writes for the service role.
alter table thy_continuity_fields        enable row level security;
alter table thy_controlling_facts        enable row level security;
alter table thy_continuity_authorities   enable row level security;
alter table thy_continuity_supersessions enable row level security;
alter table thy_continuity_checks        enable row level security;
alter table thy_continuity_findings      enable row level security;
alter table thy_continuity_alerts        enable row level security;
alter table thy_workstream_carryforward  enable row level security;

do $$
declare t text;
begin
  foreach t in array array[
    'thy_continuity_fields','thy_controlling_facts','thy_continuity_authorities',
    'thy_continuity_supersessions','thy_continuity_checks','thy_continuity_findings',
    'thy_continuity_alerts','thy_workstream_carryforward'
  ] loop
    execute format('drop policy if exists %I on %I', t || '_read', t);
    execute format('create policy %I on %I for select using (auth.uid() is not null)', t || '_read', t);
  end loop;
end $$;

revoke all on function thy_continuity_check(text, text, bigint, jsonb, text[], text[], text) from public;
revoke all on function thy_continuity_clear_alert(text, text, uuid) from public;

grant select on thy_continuity_dashboard, thy_continuity_open_alerts,
                thy_continuity_hold_state, thy_continuity_workstream_state
  to authenticated;
grant execute on function thy_continuity_dashboard_feed(integer) to authenticated;
grant execute on function thy_continuity_compile(text, text[], text[]) to authenticated;
grant execute on function thy_continuity_carryforward_gap(bigint, bigint) to authenticated;
grant execute on function thy_continuity_classify(text, text, jsonb, jsonb, timestamptz, text, boolean, boolean, timestamptz)
  to authenticated;

-- 8 · Register the workstream in the existing department registry if it exists.
--     Guarded exactly as db/rae-link/0010: this session could not inspect the
--     live backend, so a shape mismatch no-ops instead of failing the migration.
do $$
begin
  if to_regclass('public.thylora_departments') is not null
     and exists (select 1 from information_schema.columns
                  where table_name = 'thylora_departments' and column_name = 'department_code') then
    execute $q$
      insert into thylora_departments (department_code, name, purpose, status, priority)
      values ('THY-CONTINUITY-WATCHDOG-001', 'Continuity Watchdog',
              'Pre-task and post-task continuity comparison against controlling facts. Holds and alerts on unauthorized drift, loss or conflict in any hard-watch field.',
              'IMPLEMENTATION_ACTIVE', 'P1')
      on conflict (department_code) do update
        set purpose = excluded.purpose, status = excluded.status
    $q$;
    raise notice 'CONTINUITY: workstream registered in thylora_departments';
  else
    raise notice 'CONTINUITY: thylora_departments not present; workstream registration skipped';
  end if;
end $$;

commit;
