-- 0007 · Living time. All eras are alive.
-- Visitors physically enter another era. Meetings become part of history.
-- People may talk across eras. People may tell each other facts about history.
-- Branch universes are NOT created automatically.

begin;

-- ---------------------------------------------------------------------------
-- Technology gate. Destination-era capability governs functioning technology.
-- What the visitor keeps: identity, memory, knowledge, experience.
-- What does not function: later-era capability, exported backward.
-- ---------------------------------------------------------------------------
create table if not exists thytr_capability_class (
  capability_code     text primary key,
  capability_label    text not null,
  carries_backward    boolean not null,
  carry_note          text not null
);

insert into thytr_capability_class (capability_code, capability_label, carries_backward, carry_note) values
  ('IDENTITY',   'Identity',                 true,  'The visitor remains themselves. Identity is not era-bound.'),
  ('MEMORY',     'Memory',                   true,  'Memory of a later era is retained in full.'),
  ('KNOWLEDGE',  'Knowledge',                true,  'Knowledge is retained and may be spoken. Speaking it is permitted.'),
  ('EXPERIENCE', 'Experience and skill',     true,  'Judgement, training and craft are retained, bounded by era-available tools.'),
  ('DEVICE',     'Later-era device',         false, 'Does not function. Presence may be recorded; operation may not.'),
  ('POWER',      'Later-era power supply',   false, 'Does not function.'),
  ('NETWORK',    'Later-era network',        false, 'Does not function. No signal exists to reach.'),
  ('MEDICINE',   'Later-era medicine',       false, 'Does not function. Era-available care only.'),
  ('MATERIAL',   'Later-era manufactured material', false, 'Does not function as engineered. May exist as inert object.'),
  ('WEAPON',     'Later-era weapon',         false, 'Does not function. Carriage is itself a disqualifying breach.')
on conflict (capability_code) do nothing;

create table if not exists thytr_capability_check (
  check_id            uuid primary key default gen_random_uuid(),
  run_code            text not null references thytr_run(run_code),
  era_code            text not null references thytr_era_profile(era_code),
  slot_id             uuid references thytr_crew_slot(slot_id),
  capability_code     text not null references thytr_capability_class(capability_code),
  item_note           text,
  functions_here      boolean not null,
  breach_recorded     boolean not null default false,
  checked_at          timestamptz not null default now()
);

-- A capability that does not carry backward can never be recorded as functioning.
create or replace function thytr_capability_gate() returns trigger
language plpgsql as $$
declare
  carries boolean;
begin
  select carries_backward into carries
    from thytr_capability_class where capability_code = new.capability_code;
  if carries is null then
    raise exception 'THYTR-CAP-000 unknown capability_code %', new.capability_code;
  end if;
  if new.functions_here and not carries then
    raise exception
      'THYTR-CAP-001 destination-era capability governs: % cannot function in era %',
      new.capability_code, new.era_code;
  end if;
  return new;
end;
$$;

drop trigger if exists thytr_capability_gate_trg on thytr_capability_check;
create trigger thytr_capability_gate_trg
  before insert or update on thytr_capability_check
  for each row execute function thytr_capability_gate();

-- ---------------------------------------------------------------------------
-- Cross-era encounter. A meeting is history, not a cutscene.
-- ---------------------------------------------------------------------------
create table if not exists thytr_encounter (
  encounter_id        uuid primary key default gen_random_uuid(),
  run_code            text references thytr_run(run_code),
  era_code            text not null references thytr_era_profile(era_code),
  place_label         text,
  party_a_ref         text not null,               -- soft person ref
  party_b_ref         text not null,               -- soft person ref
  encounter_kind      text not null
                      check (encounter_kind in (
                        'FIRST_MEETING','CONTINUED_ACQUAINTANCE','WORK_TOGETHER',
                        'HOUSEHOLD','TRAVEL_TOGETHER','CONFLICT','PARTING','RECOGNITION')),
  cross_era           boolean not null default false,
  became_history      boolean not null default true
                      check (became_history),
  history_note        text,
  branch_universe_created boolean not null default false
                      check (branch_universe_created = false),
  occurred_at         timestamptz not null default now()
);

comment on column thytr_encounter.became_history is
  'Locked true. A meeting that happened, happened. It enters the record of that era.';

comment on column thytr_encounter.branch_universe_created is
  'Locked false at the schema level. Branch universes are not created automatically by an encounter, a disclosure or a death. Any branching is a sealed Chairman act outside this table.';

-- ---------------------------------------------------------------------------
-- Cross-era disclosure. People MAY tell each other facts about history.
-- This is permitted and recorded. It is not silently suppressed or reversed.
-- ---------------------------------------------------------------------------
create table if not exists thytr_disclosure (
  disclosure_id       uuid primary key default gen_random_uuid(),
  encounter_id        uuid references thytr_encounter(encounter_id) on delete cascade,
  from_era_code       text references thytr_era_profile(era_code),
  to_era_code         text references thytr_era_profile(era_code),
  subject             text not null,
  disclosure_kind     text not null
                      check (disclosure_kind in (
                        'HISTORICAL_FACT','PERSONAL_FUTURE','TECHNICAL_KNOWLEDGE',
                        'WARNING','ORIGIN','DENIAL','SILENCE_KEPT')),
  permitted           boolean not null default true,
  reversed            boolean not null default false
                      check (reversed = false),
  consequence_note    text,
  disclosed_at        timestamptz not null default now()
);

comment on column thytr_disclosure.reversed is
  'Locked false. Something said cannot be unsaid by the system. Consequence is recorded, not erased.';

commit;
