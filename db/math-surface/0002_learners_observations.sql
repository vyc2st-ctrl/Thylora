-- THYLORA MATHEMATICS SURFACE · 0002 · Learners, sittings and layer observations
-- Workroom: WR-MATH-SURFACE-001
--
-- A learner here is an opaque reference chosen by a family or a teacher. This
-- schema does not hold a legal identity, a date of birth, a school record, a
-- medical note or a diagnosis, and there is no column for one. That is the same
-- position the family story archive takes: identity and money move through a
-- separate protected path, never through a child's learning record.
--
-- The column that carries the whole model is `isolated`. An observation taken
-- inside the mixed word problem is stored, because it happened — but it is not
-- admissible evidence about its layer, and every read path respects that.

begin;

create table if not exists thy_math_learner_refs (
  id                uuid primary key default gen_random_uuid(),
  learner_ref       text not null,
  owner_user_id     uuid references auth.users(id) on delete cascade,
  -- A chosen name or nickname. Not a legal identity.
  constraint thy_math_learner_ref_shape check (length(trim(learner_ref)) between 1 and 60),
  -- No protected name on a child record (THY-MINOR-NAME-ADULT-USE-001).
  constraint thy_math_learner_ref_no_protected_name check (learner_ref !~* '\mdaniel\M'),
  created_at        timestamptz not null default now(),
  unique (owner_user_id, learner_ref)
);

create table if not exists thy_math_sittings (
  id                uuid primary key default gen_random_uuid(),
  learner_id        uuid not null references thy_math_learner_refs(id) on delete cascade,
  example_id        text references thy_math_worked_examples(id),
  recorded_by       text,
  started_at        timestamptz not null default now(),
  finished_at       timestamptz,
  surface           text not null default 'LEARNER'
                    check (surface in ('LEARNER','TEACHER','FAMILY','PRINT'))
);

create index if not exists thy_math_sittings_learner_idx on thy_math_sittings (learner_id, started_at desc);

create table if not exists thy_math_layer_observations (
  id                uuid primary key default gen_random_uuid(),
  sitting_id        uuid not null references thy_math_sittings(id) on delete cascade,
  layer             thy_math_layer not null,
  correct           integer not null check (correct >= 0),
  attempted         integer not null check (attempted > 0),
  -- The distinction the whole model rests on.
  isolated          boolean not null,
  source            text not null,
  note              text,
  observed_at       timestamptz not null default now(),
  constraint thy_math_observation_within_range check (correct <= attempted),
  -- An observation is either isolated or it names the mixed task it came from.
  constraint thy_math_observation_source_named check (length(trim(source)) > 0)
);

create index if not exists thy_math_layer_observations_sitting_idx
  on thy_math_layer_observations (sitting_id, layer);

-- The admissible score for a layer in a sitting: isolated observations only.
-- A layer with no isolated observation returns NULL, never 0. That single
-- difference is what stops an unmeasured layer being read as a failed one.
create or replace view thy_math_layer_factors as
select
  o.sitting_id,
  o.layer,
  sum(o.correct) filter (where o.isolated)   as isolated_correct,
  sum(o.attempted) filter (where o.isolated) as isolated_attempted,
  case
    when sum(o.attempted) filter (where o.isolated) > 0
      then sum(o.correct) filter (where o.isolated)::numeric
         / sum(o.attempted) filter (where o.isolated)
    else null
  end as value,
  case
    when sum(o.attempted) filter (where o.isolated) > 0 then 'OBSERVED'::thy_math_evidence
    when count(*) > 0 then 'NOT_ISOLATED'::thy_math_evidence
    else 'UNMEASURED'::thy_math_evidence
  end as evidence
from thy_math_layer_observations o
group by o.sitting_id, o.layer;

comment on view thy_math_layer_factors is
  'One factor per layer per sitting. NULL value means not measured in isolation. NULL is not zero and must never be coalesced to zero on a read path.';

commit;
