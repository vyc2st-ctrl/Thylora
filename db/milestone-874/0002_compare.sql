-- MILESTONE 874 · 0002 · The comparison
-- Work: THY-WORK-MILESTONE-874-588
--
-- The comparison refuses rather than guesses. It refuses when the milestone has
-- not happened, and it refuses to subtract two numbers when either of them was
-- never measured — the difference between UNMEASURED and 0 is the whole point.

begin;

create or replace function thy_milestone_readback(p_milestone_no bigint)
returns jsonb language plpgsql stable set search_path = public as $$
begin
  return jsonb_build_object(
    'milestone_no', p_milestone_no,
    'recorded',     (select count(*) from thy_milestone_reading where milestone_no = p_milestone_no),
    'of',           (select count(*) from thy_milestone_metric),
    'readings', (
      select coalesce(jsonb_agg(jsonb_build_object(
               'ordinal', m.ordinal,
               'metric',  m.metric_key,
               'label',   m.label,
               'unit',    m.unit,
               'asks',    m.asks,
               'state',   coalesce(r.measurement_state,'NOT_RECORDED'),
               -- A reading that carries both a count and a breakdown shows both;
               -- the count alone would hide what it is a count of.
               'value',   case
                            when r.id is null then null
                            when r.measurement_state <> 'MEASURED' then r.unmeasured_reason
                            when r.value_numeric is not null and r.value_text is not null
                              then r.value_numeric::text || ' — ' || r.value_text
                            else coalesce(r.value_numeric::text, r.value_text) end,
               'source',  r.source) order by m.ordinal), '[]'::jsonb)
        from thy_milestone_metric m
        left join thy_milestone_reading r
          on r.metric_key = m.metric_key and r.milestone_no = p_milestone_no));
end $$;

-- THE COMPARISON --------------------------------------------------------------
create or replace function thy_milestone_compare(
  p_to_milestone   bigint default 874,
  p_from_milestone bigint default 588
) returns jsonb language plpgsql stable set search_path = public as $$
declare
  v_head      bigint;
  v_rows      jsonb;
  v_from_at   timestamptz;
  v_to_at     timestamptz;
begin
  if to_regclass('public.thy_sequence_ledger') is null then
    return jsonb_build_object(
      'comparable', false,
      'reason', 'The sequence ledger is not present in this database. Apply db/omniview/ before asking for a milestone comparison.');
  end if;

  execute 'select max(sequence_no) from thy_sequence_ledger' into v_head;

  -- DO NOT MANUFACTURE SEQUENCES.
  if not thy_milestone_sequence_exists(p_to_milestone) then
    return jsonb_build_object(
      'comparable', false,
      'to_milestone',   p_to_milestone,
      'from_milestone', p_from_milestone,
      'sequence_head',  v_head,
      'sequences_remaining', greatest(p_to_milestone - coalesce(v_head, 0), 0),
      'reason', format(
        'Sequence %s has not happened. The ledger head is %s. %s sequences remain, and not one of them may be written to reach this milestone.',
        p_to_milestone, coalesce(v_head::text,'(empty)'), greatest(p_to_milestone - coalesce(v_head,0),0)),
      'floor', thy_milestone_readback(p_from_milestone),
      'law', 'DO NOT MANUFACTURE SEQUENCES. The comparison is produced when 874 arrives, from readings taken at 874.');
  end if;

  if not thy_milestone_sequence_exists(p_from_milestone) then
    return jsonb_build_object(
      'comparable', false,
      'reason', format('The floor sequence %s is not in the ledger.', p_from_milestone));
  end if;

  execute 'select occurred_utc from thy_sequence_ledger where sequence_no = $1'
    into v_from_at using p_from_milestone;
  execute 'select occurred_utc from thy_sequence_ledger where sequence_no = $1'
    into v_to_at using p_to_milestone;

  select coalesce(jsonb_agg(x order by x_ord), '[]'::jsonb) into v_rows
  from (
    select m.ordinal as x_ord, jsonb_build_object(
      'ordinal', m.ordinal,
      'metric',  m.metric_key,
      'label',   m.label,
      'unit',    m.unit,
      'from', jsonb_build_object(
        'state', coalesce(f.measurement_state,'NOT_RECORDED'),
        'value', case when f.measurement_state <> 'MEASURED' then f.unmeasured_reason
                      when f.value_numeric is not null and f.value_text is not null
                        then f.value_numeric::text || ' — ' || f.value_text
                      else coalesce(f.value_numeric::text, f.value_text) end,
        'source', f.source),
      'to', jsonb_build_object(
        'state', coalesce(t.measurement_state,'NOT_RECORDED'),
        'value', case when t.measurement_state <> 'MEASURED' then t.unmeasured_reason
                      when t.value_numeric is not null and t.value_text is not null
                        then t.value_numeric::text || ' — ' || t.value_text
                      else coalesce(t.value_numeric::text, t.value_text) end,
        'source', t.source),
      -- A delta exists only when BOTH ends were measured as numbers. Anything
      -- else returns the reason there is no delta, never a number.
      'delta', case
        when f.measurement_state = 'MEASURED' and t.measurement_state = 'MEASURED'
             and f.value_numeric is not null and t.value_numeric is not null
          then to_jsonb(t.value_numeric - f.value_numeric)
        else to_jsonb(format('NO DELTA: %s at %s, %s at %s. A difference between a measurement and a non-measurement is not a number.',
               coalesce(f.measurement_state,'NOT_RECORDED'), p_from_milestone,
               coalesce(t.measurement_state,'NOT_RECORDED'), p_to_milestone)) end
    ) as x
    from thy_milestone_metric m
    left join thy_milestone_reading f on f.metric_key = m.metric_key and f.milestone_no = p_from_milestone
    left join thy_milestone_reading t on t.metric_key = m.metric_key and t.milestone_no = p_to_milestone
  ) s;

  return jsonb_build_object(
    'comparable',     true,
    'from_milestone', p_from_milestone,
    'to_milestone',   p_to_milestone,
    'elapsed',        case when v_from_at is null or v_to_at is null then null
                           else (v_to_at - v_from_at)::text end,
    'sequences_between', p_to_milestone - p_from_milestone,
    'metrics',        v_rows,
    'measured_both_ends', (
      select count(*) from thy_milestone_metric m
       join thy_milestone_reading f on f.metric_key = m.metric_key and f.milestone_no = p_from_milestone
       join thy_milestone_reading t on t.metric_key = m.metric_key and t.milestone_no = p_to_milestone
      where f.measurement_state = 'MEASURED' and t.measurement_state = 'MEASURED'),
    'law', 'A delta is reported only where both ends were measured. UNMEASURED is never read as zero.');
end $$;

commit;
