-- MILESTONE 874 · 0001 · The comparison floor
-- Work: THY-WORK-MILESTONE-874-588
--
-- DO NOT MANUFACTURE SEQUENCES.
--
-- The instruction for 874 is a comparison against 588 across ten measures. The
-- obvious wrong way to build it is to write 874 into the ledger now and fill the
-- gap later. This pack does the opposite: it records the 588 floor honestly and
-- REFUSES to produce the comparison until sequence 874 has actually happened.
--
-- The second honesty rule is about zero. At 588 this repository cannot reach the
-- backend of record, so revenue, orders and conversion are not zero — they are
-- UNMEASURED. A reading carries its measurement state, and a number that was
-- never read cannot be stored as if it were.

begin;

-- THE TEN MEASURES ------------------------------------------------------------
create table if not exists thy_milestone_metric (
  metric_key  text primary key,
  ordinal     int  not null unique,
  label       text not null,
  unit        text not null,
  -- COUNTED: this repository can count it. BACKEND: only thylora-dash knows it.
  -- EXTERNAL: only an outside platform knows it.
  source_class text not null check (source_class in ('COUNTED','BACKEND','EXTERNAL','DERIVED')),
  asks        text not null
);

insert into thy_milestone_metric (metric_key, ordinal, label, unit, source_class, asks) values
  ('ELAPSED_TIME',   1,'Elapsed time',       'days',        'DERIVED', 'How long did 588 to 874 actually take?'),
  ('REVENUE',        2,'Revenue',            'minor units', 'BACKEND', 'How much money came in, in integer minor units?'),
  ('LIVE_PRODUCTS',  3,'Live products',      'count',       'BACKEND', 'How many products are published and buyable?'),
  ('ORDERS',         4,'Orders',             'count',       'BACKEND', 'How many orders completed?'),
  ('CONVERSION',     5,'Conversion',         'basis points','DERIVED', 'Orders per thousand sessions, from measured numbers only.'),
  ('SOCIAL',         6,'Social',             'count',       'EXTERNAL','What was published, and what reach was actually recorded?'),
  ('DASHBOARD_APP',  7,'Dashboard and app',  'state',       'COUNTED', 'What is live on thylora-public-world, and what is only in source?'),
  ('WORLD_WINDOWS',  8,'World Windows',      'count',       'COUNTED', 'How many World Windows exist, and how many are open?'),
  ('GATE_HEALTH',    9,'Gate health',        'count',       'COUNTED', 'How many gates are blocked, open and settled?'),
  ('CANON_CHANGES', 10,'Canon changes',      'count',       'COUNTED', 'How many canon statements were entered or superseded?')
on conflict (metric_key) do update
  set ordinal = excluded.ordinal, label = excluded.label, unit = excluded.unit,
      source_class = excluded.source_class, asks = excluded.asks;

-- READINGS --------------------------------------------------------------------
create table if not exists thy_milestone_reading (
  id            bigint generated always as identity primary key,
  milestone_no  bigint not null,
  metric_key    text   not null references thy_milestone_metric(metric_key),

  -- A reading is EITHER a measured value OR a stated reason there is none.
  -- It is never both, and never neither.
  measurement_state text not null check (measurement_state in
                      ('MEASURED',     -- read from the system that owns it
                       'UNMEASURED',   -- nobody tried, or nobody could
                       'UNREACHABLE',  -- tried and was refused
                       'NOT_APPLICABLE')),
  value_numeric numeric,
  value_text    text,
  unmeasured_reason text,

  source        text not null check (length(btrim(source)) > 0),
  taken_at_utc  timestamptz not null default now(),
  entered_sequence_no bigint not null,

  unique (milestone_no, metric_key),

  -- Zero is a measurement. Absence is not zero.
  constraint thy_milestone_reading_measured_has_value check (
    (measurement_state = 'MEASURED') = (value_numeric is not null or value_text is not null)),
  constraint thy_milestone_reading_unmeasured_says_why check (
    (measurement_state in ('UNMEASURED','UNREACHABLE'))
      = (unmeasured_reason is not null and length(btrim(unmeasured_reason)) > 0)),
  constraint thy_milestone_reading_unmeasured_has_no_number check (
    measurement_state = 'MEASURED' or value_numeric is null)
);

create index if not exists thy_milestone_reading_idx on thy_milestone_reading (milestone_no, metric_key);

comment on table thy_milestone_reading is
  'One reading of one measure at one milestone. A number that was not read is UNMEASURED with a reason, never zero.';

-- A reading is a record of an observation, so it is not edited afterwards.
create or replace function thy_milestone_reading_append_only()
returns trigger language plpgsql set search_path = public as $$
begin
  raise exception
    'MILESTONE_READING_IMMUTABLE: reading % (milestone %, %) is a record of what was observed and cannot be % .',
    old.id, old.milestone_no, old.metric_key, lower(tg_op)
    using errcode = 'raise_exception';
end $$;

drop trigger if exists thy_milestone_reading_no_rewrite on thy_milestone_reading;
create trigger thy_milestone_reading_no_rewrite
  before update or delete on thy_milestone_reading
  for each row execute function thy_milestone_reading_append_only();

-- DO NOT MANUFACTURE SEQUENCES ------------------------------------------------
-- A milestone may only be read against a sequence that exists in the ledger.
-- Guarded with to_regclass so this pack applies whether or not the OMNIVIEW
-- ledger is present, and refuses honestly when it is not.
create or replace function thy_milestone_sequence_exists(p_sequence_no bigint)
returns boolean language plpgsql stable set search_path = public as $$
declare v_found boolean;
begin
  if to_regclass('public.thy_sequence_ledger') is null then
    raise exception
      'MILESTONE_NO_LEDGER: the sequence ledger is not present in this database. A milestone cannot be checked against a ledger that does not exist. Apply db/omniview/ first.'
      using errcode = 'raise_exception';
  end if;
  execute 'select exists (select 1 from thy_sequence_ledger where sequence_no = $1)'
    into v_found using p_sequence_no;
  return v_found;
end $$;

create or replace function thy_milestone_record(
  p_milestone_no bigint,
  p_metric_key   text,
  p_measurement_state text,
  p_source       text,
  p_sequence_no  bigint,
  p_value_numeric numeric default null,
  p_value_text   text default null,
  p_unmeasured_reason text default null
) returns jsonb language plpgsql set search_path = public as $$
declare v_row thy_milestone_reading;
begin
  if not thy_milestone_sequence_exists(p_milestone_no) then
    raise exception
      'MILESTONE_UNRECORDED_SEQUENCE: sequence % is not in the ledger. A milestone is recorded when it happens, never in advance.',
      p_milestone_no using errcode = 'raise_exception';
  end if;

  insert into thy_milestone_reading (
    milestone_no, metric_key, measurement_state, value_numeric, value_text,
    unmeasured_reason, source, entered_sequence_no)
  values (
    p_milestone_no, upper(btrim(p_metric_key)), upper(btrim(p_measurement_state)),
    p_value_numeric, p_value_text, p_unmeasured_reason, p_source, p_sequence_no)
  returning * into v_row;

  return jsonb_build_object(
    'milestone_no', v_row.milestone_no,
    'metric_key',   v_row.metric_key,
    'state',        v_row.measurement_state,
    'value',        coalesce(v_row.value_numeric::text, v_row.value_text, v_row.unmeasured_reason),
    'source',       v_row.source);
end $$;

commit;
