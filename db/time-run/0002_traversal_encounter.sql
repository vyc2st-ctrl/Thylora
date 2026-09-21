-- TIME RUN · 0002 · Traversals, the destination capability envelope and encounter contracts
-- Workroom: WR-TIMERUN-581 · Directive: THY-WORK-TIME-RUN-LIVE-TRAVERSAL-581
--
-- AUTHORITY NOTE
-- Reviewable migration. NOT applied by this repository.
--
-- The two laws this file enforces in the database rather than in a comment:
--   TR-L4 DESTINATION CAPABILITY ENVELOPE — technology is governed by the
--         destination era, not the origin era.
--   TR-L5 NO TIME-TECHNOLOGY LEAK — nothing arrives functioning above the
--         destination ceiling, in either direction of travel.

begin;

do $$ begin
  create type trun_arrival_state as enum (
    'NATIVE', 'DEGRADED_TO_ERA', 'INERT', 'TRANSFORMED', 'REFUSED_ENTRY'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type trun_record_state as enum (
    'PENDING_FULFILLMENT', 'FULFILLED', 'CONTESTED', 'SEALED'
  );
exception when duplicate_object then null; end $$;

-- People. Travelers and the people they meet are the same kind of record:
-- both are persons living their own lives in their own era.
create table if not exists trun_persons (
  person_id       text primary key,
  name            text not null,
  native_era      text not null references trun_eras(era_id),
  living          boolean not null default true,
  era_role_state  text not null default 'UNSEALED',
  created_at      timestamptz not null default now(),
  constraint trun_persons_living check (living is true)
);

comment on table trun_persons is
  'TR-L6. There is no prop, extra or scenery person table. Every person met is recorded here.';

create table if not exists trun_traversals (
  traversal_id     uuid primary key default gen_random_uuid(),
  serial           text not null unique,
  traveler_id      text not null references trun_persons(person_id),
  origin_era       text not null references trun_eras(era_id),
  destination_era  text not null references trun_eras(era_id),
  direction        text generated always as (
                     case when origin_era = destination_era then 'SAME_ERA' else 'CROSS_ERA' end
                   ) stored,
  arrival_place    text references trun_places(place_id),
  arrival_stratum  text references trun_place_strata(stratum_id),
  era_band         text not null,
  exact_year       text not null default 'UNSEALED',
  presence         text not null default 'PHYSICAL',
  departure_at     text,
  memory_retained  boolean not null default true,
  record_state     trun_record_state not null default 'PENDING_FULFILLMENT',
  workroom         text not null default 'WR-TIMERUN-581',
  created_at       timestamptz not null default now(),
  constraint trun_traversal_physical check (presence = 'PHYSICAL'),
  constraint trun_traversal_memory_kept check (memory_retained is true)
);

comment on constraint trun_traversal_physical on trun_traversals is
  'TR-L2. There is no observer, viewer or remote presence value. A traveler is bodily there.';
comment on constraint trun_traversal_memory_kept on trun_traversals is
  'TR-L4. Identity, memory, knowledge and experience are retained in both directions.';

-- Objects carried, with the envelope applied. The check constraint is the leak guard.
create table if not exists trun_carried_objects (
  object_row_id       uuid primary key default gen_random_uuid(),
  traversal_id        uuid not null references trun_traversals(traversal_id) on delete cascade,
  object_id           text not null,
  label               text not null,
  domain              text not null,
  declared_tier       integer not null,
  destination_ceiling integer not null,
  arrival_state       trun_arrival_state not null,
  functioning_tier    integer not null,
  reason              text not null,
  created_at          timestamptz not null default now(),
  unique (traversal_id, object_id),
  constraint trun_object_domain check (
    domain in ('POWER','TRANSPORT','COMMUNICATION','COMPUTATION','MEDICINE','MATERIALS','RECORDING','UNSPECIFIED')
  ),
  constraint trun_object_no_leak check (functioning_tier <= destination_ceiling),
  constraint trun_object_inert_is_inert check (
    arrival_state <> 'INERT' or functioning_tier = 0
  ),
  constraint trun_object_refused_is_refused check (
    arrival_state <> 'REFUSED_ENTRY' or functioning_tier = 0
  ),
  constraint trun_object_native_is_within check (
    arrival_state <> 'NATIVE' or declared_tier <= destination_ceiling
  ),
  constraint trun_object_over_ceiling_resolved check (
    declared_tier <= destination_ceiling or arrival_state <> 'NATIVE'
  )
);

comment on constraint trun_object_no_leak on trun_carried_objects is
  'TR-L5. The database refuses to store a carried object functioning above the destination era ceiling.';

-- Capability transformations are recorded, never implied.
create table if not exists trun_capability_transformations (
  transformation_id uuid primary key default gen_random_uuid(),
  traversal_id      uuid not null references trun_traversals(traversal_id) on delete cascade,
  object_id         text not null,
  from_tier         integer not null,
  to_state          trun_arrival_state not null,
  to_functioning    integer not null,
  reason            text not null,
  created_at        timestamptz not null default now(),
  unique (traversal_id, object_id),
  constraint trun_transformation_not_native check (to_state <> 'NATIVE')
);

-- People met, with their own agency recorded.
create table if not exists trun_people_met (
  met_id             uuid primary key default gen_random_uuid(),
  traversal_id       uuid not null references trun_traversals(traversal_id) on delete cascade,
  person_id          text not null references trun_persons(person_id),
  era_role_state     text not null default 'UNSEALED',
  may_decline        boolean not null default true,
  remembers_meeting  boolean not null default true,
  created_at         timestamptz not null default now(),
  unique (traversal_id, person_id),
  constraint trun_met_may_decline check (may_decline is true)
);

comment on constraint trun_met_may_decline on trun_people_met is
  'TR-L6. A person met may decline contact, decline information and decline to be recorded.';

-- Information shared, with the instantiation guard.
create table if not exists trun_information_shared (
  disclosure_id        text primary key,
  traversal_id         uuid not null references trun_traversals(traversal_id) on delete cascade,
  subject              text not null,
  form                 text not null,
  domain               text not null,
  required_tier        integer not null default 0,
  era_ceiling          integer not null,
  instantiable_in_era  boolean not null,
  era_impact           text not null,
  declined_by_recipient boolean not null default false,
  model                text not null,
  created_at           timestamptz not null default now(),
  constraint trun_disclosure_form check (
    form in ('SPOKEN','WRITTEN_ERA_MEDIUM','ARTIFACT','LATER_ERA_MEDIUM')
  ),
  constraint trun_disclosure_model check (
    model in ('IT_A_SPEECH_ONLY','IT_B_ERA_EXPRESSIBLE','IT_C_LEDGERED_DISCLOSURE')
  ),
  constraint trun_disclosure_instantiation_honest check (
    instantiable_in_era = (required_tier <= era_ceiling)
  ),
  constraint trun_disclosure_no_knowledge_leak check (
    not (instantiable_in_era and required_tier > era_ceiling)
  )
);

comment on constraint trun_disclosure_no_knowledge_leak on trun_information_shared is
  'TR-L5. Knowledge is always retained, but it cannot be marked buildable in an era that cannot supply the capability.';

commit;
