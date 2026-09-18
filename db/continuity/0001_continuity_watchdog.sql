-- THYLORA CONTINUITY WATCHDOG · 0001 · Registry, controlling facts, checks, alerts
-- Workstream: THY-CONTINUITY-WATCHDOG-001
--
--   D = max_i | F_i(current) - F_i(controlling) |
--   unauthorized D > 0  =>  HOLD + ALERT
--
-- RULE HELD BY THIS SCHEMA: historical records are never rewritten. A
-- controlling fact is append-only. Correcting one means writing a new fact and
-- pointing the old one at it; the old row keeps its value, its sequence and its
-- timestamp forever. thy_continuity_facts_immutable() enforces that in the
-- database, so a direct UPDATE from a console is refused the same as one from
-- an application.
--
-- REUSE: this schema deliberately reuses the patterns already proved in
-- db/rae-link — do-block enum creation, `if not exists` everywhere, an
-- append-only event table written by trigger, to_regclass-guarded links to
-- registries this session could not inspect, and rael_touch_updated_at() when
-- it is already present. It adds no second identity system and no second
-- product, order or approval truth: it records what the controlling value was
-- and whether the produced value still matches it.

begin;

do $$ begin
  create type thy_continuity_kind as enum ('SCALAR','NUMERIC','SET','LADDER');
exception when duplicate_object then null; end $$;

do $$ begin
  create type thy_continuity_rule as enum
    ('IMMUTABLE','AUTHORITY_ONLY','MONOTONIC_TIME','LADDER','SET_GROWTH');
exception when duplicate_object then null; end $$;

do $$ begin
  create type thy_continuity_class as enum
    ('UNCHANGED','ADVANCED','EXPLICITLY_SUPERSEDED','DRIFTED','MISSING','CONFLICTING');
exception when duplicate_object then null; end $$;

-- 1 · What is watched, and what a legal change to it looks like.
--     Mirrors spine/continuity/fields.mjs. tests/continuity.fields.test.mjs
--     fails if the two ever disagree.
create table if not exists thy_continuity_fields (
  field_key          text primary key,
  label              text not null,
  kind               thy_continuity_kind not null,
  rule               thy_continuity_rule not null,
  hard_watch         boolean not null default true,
  requires_authority boolean not null default false,
  ladder             text[],
  tolerance          numeric not null default 0 check (tolerance >= 0),
  watch_order        integer not null,
  created_at         timestamptz not null default now(),
  constraint thy_continuity_ladder_present
    check (rule <> 'LADDER' or (ladder is not null and array_length(ladder, 1) > 1))
);

insert into thy_continuity_fields
  (field_key, label, kind, rule, requires_authority, ladder, watch_order) values
  ('names',                'Names',                'SCALAR',  'IMMUTABLE',      false, null, 1),
  ('ages',                 'Ages',                 'NUMERIC', 'MONOTONIC_TIME', false, null, 2),
  ('family_relationships', 'Family relationships', 'SET',     'IMMUTABLE',      false, null, 3),
  ('identity',             'Identity',             'SCALAR',  'IMMUTABLE',      false, null, 4),
  ('geometry',             'Geometry',             'NUMERIC', 'IMMUTABLE',      false, null, 5),
  ('dimensions',           'Dimensions',           'NUMERIC', 'IMMUTABLE',      false, null, 6),
  -- A coordinate is a tuple, not a magnitude: compared for identity, not
  -- subtracted, so it is a scalar fact rather than a number.
  ('world_coordinates',    'World coordinates',    'SCALAR',  'IMMUTABLE',      false, null, 7),
  ('period_technology',    'Period technology',    'SET',     'IMMUTABLE',      false, null, 8),
  ('visual_rules',         'Visual rules',         'SET',     'IMMUTABLE',      false, null, 9),
  ('barrier',              'Barrier',              'SCALAR',  'IMMUTABLE',      false, null, 10),
  ('vyc2st_mark',          'Vyc2st mark',          'SCALAR',  'IMMUTABLE',      false, null, 11),
  ('rights',               'Rights',               'SCALAR',  'AUTHORITY_ONLY', true,  null, 12),
  ('approval',             'Approval',             'LADDER',  'LADDER',         true,
     array['NONE','REQUESTED','PENDING','APPROVED'], 13),
  ('publication_state',    'Publication state',    'LADDER',  'LADDER',         true,
     array['DRAFT','REVIEW','APPROVED','PUBLISHED','ARCHIVED'], 14),
  ('store_state',          'Store state',          'LADDER',  'LADDER',         true,
     array['DRAFT','LISTED','RELEASED','DELISTED'], 15),
  ('price',                'Price',                'NUMERIC', 'AUTHORITY_ONLY', true,  null, 16),
  ('delivery',             'Delivery',             'LADDER',  'LADDER',         false,
     array['NOT_STARTED','PREPARING','IN_TRANSIT','DELIVERED'], 17),
  ('person_state',         'Person state',         'SCALAR',  'AUTHORITY_ONLY', true,  null, 18),
  ('active_workstreams',   'Active workstreams',   'SET',     'SET_GROWTH',     false, null, 19)
on conflict (field_key) do update set
  label = excluded.label,
  kind = excluded.kind,
  rule = excluded.rule,
  requires_authority = excluded.requires_authority,
  ladder = excluded.ladder,
  watch_order = excluded.watch_order;

-- 2 · Controlling facts. Append-only. The current controlling value for a
--     subject/field is the highest-sequence row with superseded_by is null.
create table if not exists thy_controlling_facts (
  id            bigserial primary key,
  subject_kind  text not null,
  subject_ref   text not null,
  field_key     text not null references thy_continuity_fields(field_key),
  value         jsonb not null,
  sequence_no   bigint not null default 0,
  authority_ref text,
  source_ref    text,
  recorded_at   timestamptz not null default now(),
  superseded_by bigint references thy_controlling_facts(id),
  superseded_at timestamptz,
  created_at    timestamptz not null default now(),
  constraint thy_fact_supersede_pair
    check ((superseded_by is null) = (superseded_at is null)),
  constraint thy_fact_no_self_supersede
    check (superseded_by is null or superseded_by <> id)
);

create index if not exists thy_facts_current_idx
  on thy_controlling_facts(subject_ref, field_key, sequence_no desc)
  where superseded_by is null;
create index if not exists thy_facts_subject_idx
  on thy_controlling_facts(subject_kind, subject_ref);

-- 3 · Authority registry. Authorization comes from the controlling side. A
--     reference the produced state supplies about itself is not authorization,
--     which is why the watchdog holds instead of trusting an unlisted ref.
create table if not exists thy_continuity_authorities (
  authority_ref text primary key,
  authority_kind text not null check (authority_kind in
    ('CHAIRMAN','APPROVAL','LEGAL','OPERATIONAL','SYSTEM')),
  granted_by    uuid,
  granted_at    timestamptz not null default now(),
  expires_at    timestamptz,
  revoked_at    timestamptz,
  note          text,
  constraint thy_authority_window check (expires_at is null or expires_at > granted_at)
);

-- 4 · Explicit supersession. The only thing that turns a changed hard-watch
--     field from DRIFTED into EXPLICITLY_SUPERSEDED. It must name the subject,
--     the field, what the value was, what it becomes, and who authorized it.
create table if not exists thy_continuity_supersessions (
  id            bigserial primary key,
  subject_kind  text not null,
  subject_ref   text not null,
  field_key     text not null references thy_continuity_fields(field_key),
  from_value    jsonb,
  to_value      jsonb not null,
  authority_ref text not null references thy_continuity_authorities(authority_ref),
  reason        text not null,
  approved_by   uuid,
  approved_at   timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

create index if not exists thy_supersession_lookup_idx
  on thy_continuity_supersessions(subject_ref, field_key, approved_at desc);

-- 5 · One PRE or POST comparison.
create table if not exists thy_continuity_checks (
  id                 bigserial primary key,
  task_ref           text not null,
  phase              text not null check (phase in ('PRE','POST')),
  sequence_no        bigint,
  brief_digest       text,
  produced_digest    text,
  field_count        integer not null default 0,
  d_max              numeric not null default 0 check (d_max >= 0),
  hard_breach_count  integer not null default 0,
  soft_breach_count  integer not null default 0,
  proceed_allowed    boolean not null default true,
  actor              uuid,
  checked_at         timestamptz not null default now(),
  -- The equation, enforced rather than described: any hard-watch breach and the
  -- check cannot claim proceed_allowed.
  constraint thy_check_hold_on_hard_breach
    check (hard_breach_count = 0 or proceed_allowed = false),
  constraint thy_check_d_matches_breach
    check ((hard_breach_count + soft_breach_count = 0) = (d_max = 0))
);

create index if not exists thy_checks_task_idx on thy_continuity_checks(task_ref, checked_at desc);
create index if not exists thy_checks_hold_idx on thy_continuity_checks(checked_at desc)
  where proceed_allowed = false;

-- 6 · Per-field result of a check.
create table if not exists thy_continuity_findings (
  id             bigserial primary key,
  check_id       bigint not null references thy_continuity_checks(id) on delete cascade,
  subject_kind   text,
  subject_ref    text,
  field_key      text not null references thy_continuity_fields(field_key),
  classification thy_continuity_class not null,
  d              numeric not null check (d in (0, 1)),
  magnitude      numeric not null default 0,
  hard_watch     boolean not null default true,
  controlling    jsonb,
  current_value  jsonb,
  detail         text not null,
  created_at     timestamptz not null default now(),
  -- d is not a free number. It is 1 exactly when continuity was lost.
  constraint thy_finding_distance_matches_class
    check (d = case when classification in ('DRIFTED','MISSING','CONFLICTING') then 1 else 0 end)
);

create index if not exists thy_findings_check_idx on thy_continuity_findings(check_id);
create index if not exists thy_findings_breach_idx
  on thy_continuity_findings(field_key, created_at desc) where d = 1;

-- 7 · Alert record. Raised by trigger from findings, so an alert cannot be
--     skipped by writing findings directly.
create table if not exists thy_continuity_alerts (
  id               bigserial primary key,
  alert_code       text not null unique,
  check_id         bigint not null references thy_continuity_checks(id) on delete cascade,
  task_ref         text not null,
  phase            text not null check (phase in ('PRE','POST')),
  sequence_no      bigint,
  severity         text not null check (severity in ('HOLD','WARN')),
  alert_state      text not null default 'OPEN'
                   check (alert_state in ('OPEN','ACKNOWLEDGED','CLEARED')),
  headline         text not null,
  breach_count     integer not null default 0,
  hard_breach_count integer not null default 0,
  evidence         jsonb not null default '{}'::jsonb,
  raised_at        timestamptz not null default now(),
  acknowledged_by  uuid,
  acknowledged_at  timestamptz,
  cleared_by       uuid,
  cleared_at       timestamptz,
  clearance_note   text,
  -- An alert is never cleared silently: clearing requires a hand and a reason.
  constraint thy_alert_clearance_evidence check (
    alert_state <> 'CLEARED'
    or (cleared_at is not null and clearance_note is not null and length(btrim(clearance_note)) > 0)
  ),
  constraint thy_alert_ack_evidence check (
    alert_state <> 'ACKNOWLEDGED' or acknowledged_at is not null
  )
);

create index if not exists thy_alerts_open_idx on thy_continuity_alerts(raised_at desc)
  where alert_state <> 'CLEARED';

-- 8 · Workstream carryforward. One row per workstream per sequence, so a
--     workstream that stops being carried forward is a visible absence rather
--     than a silence.
create table if not exists thy_workstream_carryforward (
  id             bigserial primary key,
  sequence_no    bigint not null,
  workstream_ref text not null,
  workstream_state text not null default 'ACTIVE'
                   check (workstream_state in ('ACTIVE','CLOSED','HANDED_OFF','SUSPENDED')),
  closure_ref    text,
  note           text,
  recorded_at    timestamptz not null default now(),
  unique (sequence_no, workstream_ref),
  -- Leaving the active set requires a record naming why.
  constraint thy_carryforward_closure_evidence
    check (workstream_state = 'ACTIVE' or closure_ref is not null)
);

create index if not exists thy_carryforward_seq_idx
  on thy_workstream_carryforward(sequence_no desc, workstream_ref);

commit;
