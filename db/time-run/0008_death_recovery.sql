-- 0008 · Death and body return / recovery protocol.
--
-- Death is real whenever and wherever it occurs.
-- If a traveller dies outside their origin era, they remain dead.
-- The body may be returned to the origin era.
-- Death is NOT undone. Nothing in this file provides a path to undo it.

begin;

-- ---------------------------------------------------------------------------
-- Death record. Append-only in effect: no state may leave death.
-- ---------------------------------------------------------------------------
create table if not exists thytr_death (
  death_id            uuid primary key default gen_random_uuid(),
  run_code            text references thytr_run(run_code),
  slot_id             uuid references thytr_crew_slot(slot_id),
  person_ref          text not null,               -- soft person ref
  person_kind         text not null
                      check (person_kind in ('TRAVELLER','CREW','LOCAL','HOST','ANIMAL')),

  origin_era_code     text references thytr_era_profile(era_code),
  death_era_code      text not null references thytr_era_profile(era_code),
  died_outside_origin boolean generated always as
                      (origin_era_code is distinct from death_era_code) stored,

  place_label         text,
  cause_note          text,
  witnessed_by_role   text not null references thytr_crew_role(role_code),
  confirmed_by_role   text not null references thytr_crew_role(role_code),

  -- The lock. Set true at insert, may never become false.
  is_dead             boolean not null default true check (is_dead),
  reversible          boolean not null default false check (reversible = false),

  died_at             timestamptz not null default now(),
  recorded_at         timestamptz not null default now(),

  constraint thytr_death_two_witnesses
    check (witnessed_by_role is distinct from confirmed_by_role)
);

comment on table thytr_death is
  'Death is real whenever and wherever it occurs. A traveller who dies outside their origin era remains dead. There is no undo path, no revival state and no pre-death restore.';

-- Hard locks: no resurrection, no deletion, no era rewrite.
create or replace function thytr_death_is_final() returns trigger
language plpgsql as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'THYTR-DEATH-001 a death record cannot be deleted';
  end if;
  if old.is_dead and not new.is_dead then
    raise exception 'THYTR-DEATH-002 death cannot be undone';
  end if;
  if new.reversible then
    raise exception 'THYTR-DEATH-003 death is not reversible';
  end if;
  if new.person_ref is distinct from old.person_ref
     or new.death_era_code is distinct from old.death_era_code
     or new.died_at is distinct from old.died_at then
    raise exception 'THYTR-DEATH-004 identity, era and time of death are fixed at record';
  end if;
  return new;
end;
$$;

drop trigger if exists thytr_death_is_final_upd on thytr_death;
create trigger thytr_death_is_final_upd
  before update on thytr_death
  for each row execute function thytr_death_is_final();

drop trigger if exists thytr_death_is_final_del on thytr_death;
create trigger thytr_death_is_final_del
  before delete on thytr_death
  for each row execute function thytr_death_is_final();

-- ---------------------------------------------------------------------------
-- Recovery protocol. The EXACT ordered stages for returning a body.
-- Return of a body is a permission, never an obligation, and never a reversal.
-- ---------------------------------------------------------------------------
create table if not exists thytr_recovery_stage (
  stage_code          text primary key,
  stage_index         integer not null unique check (stage_index >= 0),
  stage_label         text not null,
  owner_role          text references thytr_crew_role(role_code),
  blocking            boolean not null default true,
  stage_rule          text not null
);

insert into thytr_recovery_stage (stage_code, stage_index, stage_label, owner_role, blocking, stage_rule) values
  ('D0_STOP',          0, 'Stop the run',                 'ROAD_CAPTAIN',    true,
   'The team halts. Competition standing is suspended for every team present, not only the bereaved team.'),
  ('D1_CONFIRM',       1, 'Confirm death',                'SURGEON',         true,
   'Confirmed by the medical lead and witnessed by a second role. Two people, never one.'),
  ('D2_RECORD',        2, 'Record the death',             'WITNESS_KEEPER',  true,
   'Person, era of origin, era of death, place, time, cause, witnesses. Written before the body is moved.'),
  ('D3_CUSTODY',       3, 'Take custody of the body',      'ROAD_CAPTAIN',    true,
   'Custody is a named, unbroken chain from this point to release. Any break voids the return.'),
  ('D4_LOCAL_LAW',     4, 'Satisfy local law',             'LOCAL_GUIDE',     true,
   'Era-specific law of the place of death governs the body. Coroner, magistrate, parish, elder or headman as that era requires. The Run does not carry its own jurisdiction.'),
  ('D5_COMMUNITY',     5, 'Answer the host community',     'ROAD_CAPTAIN',    true,
   'The host community is told first, in person, before any message leaves for another era. It may ask for its own rite and may ask that the body stay.'),
  ('D6_NEXT_OF_KIN',   6, 'Ask the next of kin',           'WITNESS_KEEPER',  true,
   'Where next of kin can be reached, their instruction decides between origin-era return and local interment. If they cannot be reached in time, local interment is the default and is not a failure.'),
  ('D7_PREPARE',       7, 'Prepare the body',              'SURGEON',         true,
   'Era-available preparation only. No later-era preservation functions. Preparation is bounded by how far and how long the return must travel.'),
  ('D8_ESCORT',        8, 'Assign the escort',             'SECOND',          true,
   'Two named crew, never one, and never the road captain alone. The escort travels with the body and does nothing else until release.'),
  ('D9_TRANSIT',       9, 'Transit',                       'SECOND',         true,
   'A dedicated vehicle. No freight, no competition, no stops for standing. The transit is not part of the run.'),
  ('D10_RECEIPT',     10, 'Origin-era receipt',            'WITNESS_KEEPER',  true,
   'The body is received in the origin era by a named receiver who signs. Custody ends here, not before.'),
  ('D11_FAMILY',      11, 'Release to family',             'WITNESS_KEEPER',  true,
   'Release to family or to the origin-era authority they name. Effects, wages owed and the death record go with the body.'),
  ('D12_RITE',        12, 'Rite and mourning',             null,              false,
   'Both eras may mourn. A rest day is entered in the run record for the mourning. Mourning is not a penalty.'),
  ('D13_CLOSE',       13, 'Close the recovery',            'WITNESS_KEEPER',  true,
   'Recovery is closed by the witness keeper. The death record stays open forever; only the recovery closes.')
on conflict (stage_code) do nothing;

create table if not exists thytr_recovery (
  recovery_id         uuid primary key default gen_random_uuid(),
  death_id            uuid not null references thytr_death(death_id),
  disposition         text not null default 'UNDECIDED'
                      check (disposition in (
                        'UNDECIDED','RETURN_TO_ORIGIN_ERA','INTERRED_IN_ERA_OF_DEATH','HELD_BY_LOCAL_LAW')),
  next_of_kin_reached boolean not null default false,
  next_of_kin_instruction text,
  community_asked     boolean not null default false,
  community_requested_stay boolean not null default false,
  custody_unbroken    boolean not null default true,
  current_stage_index integer not null default 0 check (current_stage_index between 0 and 13),
  escort_slot_a       uuid references thytr_crew_slot(slot_id),
  escort_slot_b       uuid references thytr_crew_slot(slot_id),
  received_by_label   text,
  received_at         timestamptz,
  closed_at           timestamptz,
  -- the lock again, at the recovery layer
  restores_life       boolean not null default false check (restores_life = false),
  -- Both null before stage D8 is the normal starting state. Two escorts that
  -- are the same person is not, at any stage.
  constraint thytr_recovery_two_escorts
    check (escort_slot_a is null or escort_slot_b is null or escort_slot_a <> escort_slot_b)
);

comment on column thytr_recovery.restores_life is
  'Locked false. Returning a body to its origin era returns a body. It does not return a life.';

-- Stages advance one at a time, forward only, and never past a blocking gate.
create or replace function thytr_recovery_advance() returns trigger
language plpgsql as $$
begin
  if new.restores_life then
    raise exception 'THYTR-REC-000 returning a body does not return a life';
  end if;
  if new.current_stage_index < old.current_stage_index then
    raise exception 'THYTR-REC-001 recovery stages do not run backward';
  end if;
  if new.current_stage_index > old.current_stage_index + 1 then
    raise exception 'THYTR-REC-002 recovery stages advance one at a time (% -> %)',
      old.current_stage_index, new.current_stage_index;
  end if;
  if new.current_stage_index >= 5 and not new.community_asked then
    raise exception 'THYTR-REC-003 the host community is answered before any era is left (stage D5)';
  end if;
  if new.current_stage_index >= 8 and new.disposition = 'UNDECIDED' then
    raise exception 'THYTR-REC-004 disposition must be decided before an escort is assigned (stage D8)';
  end if;
  if new.current_stage_index >= 8
     and new.disposition = 'RETURN_TO_ORIGIN_ERA'
     and (new.escort_slot_a is null or new.escort_slot_b is null
          or new.escort_slot_a = new.escort_slot_b) then
    raise exception 'THYTR-REC-005 a returning body travels with two named escorts, never one';
  end if;
  if new.current_stage_index >= 10
     and new.disposition = 'RETURN_TO_ORIGIN_ERA'
     and not new.custody_unbroken then
    raise exception 'THYTR-REC-006 custody was broken; origin-era receipt cannot be recorded';
  end if;
  if new.closed_at is not null and new.current_stage_index < 13 then
    raise exception 'THYTR-REC-007 recovery cannot close before stage D13';
  end if;
  return new;
end;
$$;

drop trigger if exists thytr_recovery_advance_trg on thytr_recovery;
create trigger thytr_recovery_advance_trg
  before update on thytr_recovery
  for each row execute function thytr_recovery_advance();

create table if not exists thytr_recovery_log (
  log_id              uuid primary key default gen_random_uuid(),
  recovery_id         uuid not null references thytr_recovery(recovery_id) on delete cascade,
  stage_code          text not null references thytr_recovery_stage(stage_code),
  entered_at          timestamptz not null default now(),
  by_role             text references thytr_crew_role(role_code),
  note                text
);

commit;
