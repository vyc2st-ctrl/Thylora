-- THYLORA · QYRIS · 0006 · SR CANDIDATE — UNDER TEST, NOT CANON
--
--        SR = N × E × S × A × C × R
--
-- The candidate is stored so it can be tested and argued with, not so it can be
-- used. Three structural refusals are built in:
--
--   1. qyr_sr_candidate.canon is constrained to false. There is no UPDATE that
--      makes it true. Canonization requires a migration and a Chairman act.
--   2. Any attempt to read a scalar through the gate function raises.
--   3. The factor UNKNOWN is a real state (null), because the equation has no
--      term for "not established" and substituting a number for it lies.

create table if not exists qyr_sr_candidate (
  candidate_id text primary key,
  formula      text not null,
  canon        boolean not null default false,
  status       text not null default 'UNDER_TEST',
  note         text not null,
  constraint qyr_sr_not_canon check (canon is false),
  constraint qyr_sr_status check (status in ('UNDER_TEST','REJECTED','HELD_FOR_CHAIRMAN'))
);

insert into qyr_sr_candidate (candidate_id, formula, canon, status, note) values
  ('SR-001', 'SR = N × E × S × A × C × R', false, 'HELD_FOR_CHAIRMAN',
   'Implemented and tested. 1 of 8 failure-mode tests passes. Not canon, not used to gate anything, '
   || 'and not displayed as a score anywhere a decision is made. See docs/QYRIS-SR-EQUATION-TEST.md.')
on conflict (candidate_id) do update
  set formula = excluded.formula, status = excluded.status, note = excluded.note;

create table if not exists qyr_sr_factors (
  factor_code text primary key,
  meaning     text not null,
  critical    boolean not null default false
);

insert into qyr_sr_factors (factor_code, meaning, critical) values
  ('N','NEED — the declared need is real, current, and matches this role family.', false),
  ('E','EVIDENCE — the basis to act is checkable rather than asserted.', false),
  ('S','SAFETY — safety clearance stands, with no open safety finding.', true),
  ('A','AUTHORITY FIT — the requested scope is inside what this family may ever hold.', false),
  ('C','CONFLICT CLEARANCE — declared, and cleared by someone other than the supporter.', true),
  ('R','RESTORATION STANDING — breach record resolved, remedies completed, watch served.', false)
on conflict (factor_code) do update
  set meaning = excluded.meaning, critical = excluded.critical;

-- Per-factor floors — the alternative the tests recommend. Note SAFETY and
-- CONFLICT carry higher floors than the others, which the scalar cannot express.
create table if not exists qyr_sr_floors (
  factor_code text primary key references qyr_sr_factors(factor_code),
  floor_value numeric(4,3) not null,
  constraint qyr_sr_floor_range check (floor_value >= 0 and floor_value <= 1)
);

insert into qyr_sr_floors (factor_code, floor_value) values
  ('N',0.600), ('E',0.600), ('S',0.900), ('A',1.000), ('C',0.900), ('R',0.600)
on conflict (factor_code) do update set floor_value = excluded.floor_value;

-- Observed factor vectors. A null value means UNKNOWN and is preserved as such.
create table if not exists qyr_sr_observations (
  observation_id uuid primary key default gen_random_uuid(),
  seat_id        text references qyr_seats(seat_id) on delete cascade,
  factor_code    text not null references qyr_sr_factors(factor_code),
  value          numeric(4,3),
  basis          text not null,
  observed_at    timestamptz not null default now(),
  constraint qyr_sr_obs_range check (value is null or (value >= 0 and value <= 1)),
  constraint qyr_sr_obs_basis check (basis in ('OBSERVATION','MEASUREMENT','INFERENCE','PROOF','UNKNOWN')),
  -- THYLORA evidence rule: observation ≠ measurement ≠ inference ≠ proof.
  -- An UNKNOWN basis cannot carry a number, and a number cannot claim to be UNKNOWN.
  constraint qyr_sr_obs_unknown_has_no_value check ((basis = 'UNKNOWN') = (value is null))
);

-- Recorded battery results, so the finding travels with the schema.
create table if not exists qyr_sr_test_results (
  test_id   text primary key,
  test_name text not null,
  passed    boolean not null,
  finding   text not null,
  recorded_at timestamptz not null default now()
);

insert into qyr_sr_test_results (test_id, test_name, passed, finding) values
  ('T1','ZERO_PROPAGATION', true,
   'Any single factor at zero drives SR to zero. The candidate working as intended, and worth keeping — as a gate.'),
  ('T2','RANGE_COLLAPSE', false,
   'Sweeping all six factors across a healthy 0.6-1.0 band over 1,771,561 points, 97.0% of results fall below 0.5 and the mean is 0.262. A supporter with nothing wrong reads as a failing score.'),
  ('T3','COMPENSABILITY_ORDERING', false,
   'A supporter with SAFETY at 0.12 scores 0.1200, above a supporter who is 0.7 on everything at 0.1176. The product ranks a near-total safety failure above uniform adequacy. This is the finding that blocks canonization.'),
  ('T4','NOISE_AMPLIFICATION', false,
   'Plus or minus 10% error on each of six factors produces a 124.0% swing on SR, from inputs each individually acceptable. Several of these factors are judgements, not measurements.'),
  ('T5','GAMING_GRADIENT', false,
   'The steepest available gain is on EVIDENCE, the factor cheapest to raise by producing paperwork, rather than on SAFETY or CONFLICT.'),
  ('T6','THRESHOLD_UNDEFINED', false,
   'At a threshold of 0.3 a vector with CONFLICT at 0.35 is admitted alongside one that is 0.8 across the board. The scalar has already discarded which factor was weak.'),
  ('T7','DIMENSION_SENSITIVITY', false,
   'Adding a seventh factor at the same quality drops SR by 10.0% with nothing about the supporter changed. Scores are not comparable across model versions.'),
  ('T8','UNKNOWN_HAS_NO_TERM', false,
   'With one factor unestablished, treating UNKNOWN as 1 hides that nothing was checked, as 0 refuses everyone with incomplete paperwork, and as 0.5 invents a number nobody measured.')
on conflict (test_id) do update
  set passed = excluded.passed, finding = excluded.finding, recorded_at = now();

-- The recommended replacement, implemented: a gate that reports every blocker
-- at once and names the binding constraint. No scalar is returned.
create or replace function qyr_sr_gate(p_seat_id text)
returns table (eligible boolean, binding text, blockers jsonb)
language plpgsql stable as $$
declare b jsonb := '[]'::jsonb; worst text := null; worst_val numeric := 2; rec record;
begin
  for rec in
    select f.factor_code, fl.floor_value,
           (select o.value from qyr_sr_observations o
             where o.seat_id = p_seat_id and o.factor_code = f.factor_code
             order by o.observed_at desc limit 1) as value
      from qyr_sr_factors f join qyr_sr_floors fl on fl.factor_code = f.factor_code
     order by f.factor_code
  loop
    if rec.value is null then
      b := b || jsonb_build_object('code','FACTOR_UNKNOWN','factor',rec.factor_code,
             'route','Establish ' || rec.factor_code || ' before this is decidable.');
      if worst is null then worst := rec.factor_code; worst_val := -1; end if;
    elsif rec.value < rec.floor_value then
      b := b || jsonb_build_object('code','BELOW_FLOOR','factor',rec.factor_code,
             'value',rec.value,'floor',rec.floor_value);
      if rec.value < worst_val then worst := rec.factor_code; worst_val := rec.value; end if;
    elsif rec.value < worst_val then
      worst := rec.factor_code; worst_val := rec.value;
    end if;
  end loop;
  return query select jsonb_array_length(b) = 0, worst, b;
end $$;

-- Refuses to produce the scalar. Present so that a caller reaching for one gets
-- the finding rather than a number.
create or replace function qyr_sr_score(p_seat_id text) returns numeric
language plpgsql immutable as $$
begin
  raise exception 'SR_NOT_CANON: SR = N x E x S x A x C x R failed 7 of 8 failure-mode tests and is not published as a score. Use qyr_sr_gate(%) for the vector and the binding constraint.', p_seat_id;
end $$;

insert into qyr_rules (rule_key, rule_text) values
  ('SR_NOT_CANON',
   'SR = N x E x S x A x C x R is a tested candidate, not canon. It is not used to gate anything and is not published as a score. The gate and the binding constraint are published instead.')
on conflict (rule_key) do update set rule_text = excluded.rule_text;
