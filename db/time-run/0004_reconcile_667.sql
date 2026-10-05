-- TIME RUN · 0004 · Reconciliation to live head 667
-- Workroom: WR-RECONCILE-667 · reconciles WR-TIMERUN-581 forward
-- Backend: thylora-dash (jvsdxhrfhtlgaknhjxlz)
--
-- AUTHORITY NOTE
-- Reviewable migration. NOT applied by this repository, and NOT to be applied
-- until the whole set 0001–0004 has passed independent cross-agent review and a
-- clean authority / precondition / evidence / readback gate.
--
-- ADDITIVE ONLY. This file creates and alters trun_* objects, which do not exist
-- in the live backend. It does not create, alter, drop or rename any existing
-- live table. References to live canon rows are SOFT (text codes, no foreign
-- keys), because the live tables are owned by other lanes.
--
-- WHAT THIS FILE CORRECTS, all read live from thylora-dash on 2026-10-05:
--   1. The castle is ER-CASTLE-ROYAL-001, not a new place node.
--   2. The castle name is OPEN_PENDING_CHAIRMAN_NAME_RECOVERY — DO NOT GUESS.
--   3. Inés Morales is ER-ROYAL-COOK-001, Royal Cook, truth_state CHAIRMAN_LOCKED.
--   4. An EdereAirah arrival time is an EdereAirah time (MATH-EA-TIME-660).
--   5. Death is real (THY-TIME-RUN-001 v4 death_rule), so authorization is a gate.
--   6. The six mechanics carry working selections; nothing is canon.

begin;

-- ---------------------------------------------------------------- 1 · CANON LINKS
-- Soft links from this lane to rows owned by other lanes. Nothing is duplicated.
create table if not exists trun_canon_links (
  link_code        text primary key,
  local_subject    text not null,
  canon_table      text not null,
  canon_key        text not null,
  canon_state      text not null,
  relation         text not null,
  read_live_at     date not null,
  note             text,
  constraint trun_canon_relation check (
    relation in ('SUBORDINATE_TO','SUPERSEDED_BY','REFERENCES','CORRECTS')
  )
);

insert into trun_canon_links (link_code, local_subject, canon_table, canon_key, canon_state, relation, read_live_at, note) values
  ('LNK-CASTLE','THY-PLACE-CASTLE-001','thylora_world_entities','ER-CASTLE-ROYAL-001',
   'OPEN_PENDING_CHAIRMAN_NAME_RECOVERY','SUPERSEDED_BY','2026-10-05',
   'ROYAL CASTLE — CANONICAL NAME OPEN (DO NOT GUESS). Time Run must reference the canon node, never a second castle.'),
  ('LNK-CASTLE-GEOM','THY-PLACE-CASTLE-001','thylora_castle_space_geometry','THY-SPC-CASTLE-001',
   'CURRENT','SUBORDINATE_TO','2026-10-05',
   'measurement_state UNKNOWN; erc_name Windsor Castle; source THY-WORK-CASTLE-DIMENSIONAL-TWIN-572; PRIVATE_EXACT_PUBLIC_ABSTRACT.'),
  ('LNK-INES','THY-PER-INES-MORALES','thylora_world_entities','ER-ROYAL-COOK-001',
   'CHAIRMAN_LOCKED','SUPERSEDED_BY','2026-10-05',
   'Inés Morales, Royal Cook. Role was already locked; the three role candidates proposed at 581 are withdrawn.'),
  ('LNK-TIMERUN','TIME_RUN_LAWS','thylora_time_run_registry','THY-TIME-RUN-001',
   'IMPLEMENTATION_ACTIVE','SUBORDINATE_TO','2026-10-05',
   'v4 already carries living_people_rule, technology_rule and death_rule. The 581 laws restate canon; they do not create it.'),
  ('LNK-NAMEGATE','CASTLE_NAMING','thylora_name_provenance_gate','THY-NAME-PROVENANCE-001',
   'LOCKED','SUBORDINATE_TO','2026-10-05',
   'Prohibits silently replacing canon names with assistant-invented names; requires a source class per name.')
on conflict (link_code) do nothing;

-- ---------------------------------------------- 2 · EDEREAIRAH CLOCK ON A TRAVERSAL
-- An arrival in a living EdereAirah era is an EdereAirah time. Recording only an
-- Earth clock imports a 24-hour day into a 26-hour world.
alter table trun_traversals add column if not exists ea_year        integer;
alter table trun_traversals add column if not exists ea_month       integer;
alter table trun_traversals add column if not exists ea_day         integer;
alter table trun_traversals add column if not exists ea_hour        integer;
alter table trun_traversals add column if not exists ea_minute      integer;
alter table trun_traversals add column if not exists ea_zone_hours  integer;
alter table trun_traversals add column if not exists ea_renewal_day boolean not null default false;
alter table trun_traversals add column if not exists ea_equation    text not null default 'MATH-EA-TIME-660';

do $$ begin
  alter table trun_traversals add constraint trun_ea_month_range
    check (ea_month is null or ea_month between 1 and 12);
exception when duplicate_object then null; end $$;
do $$ begin
  alter table trun_traversals add constraint trun_ea_day_range
    check (ea_day is null or ea_day between 1 and 28);
exception when duplicate_object then null; end $$;
do $$ begin
  -- 26-hour day, from MATH-EA-TIME-660 (93,600 s ÷ 3600).
  alter table trun_traversals add constraint trun_ea_hour_range
    check (ea_hour is null or ea_hour between 0 and 25);
exception when duplicate_object then null; end $$;
do $$ begin
  -- Renewal Day sits after Month 12, outside the months.
  alter table trun_traversals add constraint trun_ea_renewal_outside_months
    check (not ea_renewal_day or (ea_month is null and ea_day is null));
exception when duplicate_object then null; end $$;

comment on constraint trun_ea_hour_range on trun_traversals is
  'MATH-EA-TIME-660. The EdereAirah day is 26 hours. An hour of 26 or more is an Earth clock leaking in.';

-- ------------------------------------------------- 3 · WORKING SELECTIONS (NOT CANON)
alter table trun_open_mechanics add column if not exists working_selection text;
alter table trun_open_mechanics add column if not exists canon boolean not null default false;

do $$ begin
  alter table trun_open_mechanics add constraint trun_mechanic_working_not_canon
    check (not canon);
exception when duplicate_object then null; end $$;

comment on constraint trun_mechanic_working_not_canon on trun_open_mechanics is
  'A working selection is the direction work proceeds in. Sealing it as canon is a separate Chairman act.';

update trun_open_mechanics set working_selection = v.sel, decided_by = 'Chairman — reconciliation packet at live head 667', decided_at = now()
from (values
  ('ENTRY_EXIT','EE_A_THRESHOLD_SITES'),
  ('CLOTHING','CL_C_PARTIAL'),
  ('VISIT_DURATION','VD_C_OPEN_RESIDENCE'),
  ('INJURY_DEATH','ID_A_FULLY_EMBODIED'),
  ('CAUSALITY','CA_C_LEDGERED_CAUSALITY'),
  ('INFORMATION_TRANSFER','IT_C_LEDGERED_DISCLOSURE')
) as v(mech, sel)
where trun_open_mechanics.mechanic_id = v.mech;

-- NO-LOSS: every option keeps an explicit disposition. Nothing is erased by being unchosen.
create table if not exists trun_option_dispositions (
  option_code  text primary key,
  mechanic_id  text not null references trun_open_mechanics(mechanic_id) on delete cascade,
  disposition  text not null,
  reason       text,
  constraint trun_disposition_vocab check (
    disposition in ('SELECTED_WORKING','RETAINED_ALTERNATIVE','SUPERSEDED_AS_CURRENT_CANDIDATE')
  )
);

insert into trun_option_dispositions (option_code, mechanic_id, disposition, reason) values
  ('EE_A_THRESHOLD_SITES','ENTRY_EXIT','SELECTED_WORKING',null),
  ('EE_B_CARRIED_ANCHOR','ENTRY_EXIT','RETAINED_ALTERNATIVE',null),
  ('EE_C_HOST_ADMISSION','ENTRY_EXIT','RETAINED_ALTERNATIVE',null),
  ('CL_A_ARRIVAL_VESTING','CLOTHING','RETAINED_ALTERNATIVE',null),
  ('CL_B_NO_ADAPTATION','CLOTHING','RETAINED_ALTERNATIVE',null),
  ('CL_C_PARTIAL','CLOTHING','SELECTED_WORKING','Clothing obeys the same envelope as every other object. No clothing exception.'),
  ('VD_A_FIXED_WINDOW','VISIT_DURATION','RETAINED_ALTERNATIVE',null),
  ('VD_B_ANCHOR_DECAY','VISIT_DURATION','RETAINED_ALTERNATIVE','Also unavailable under EE-A: it requires the carried anchor of EE-B.'),
  ('VD_C_OPEN_RESIDENCE','VISIT_DURATION','SELECTED_WORKING','A living era must permit someone to genuinely remain and live there.'),
  ('ID_A_FULLY_EMBODIED','INJURY_DEATH','SELECTED_WORKING','Matches the live death_rule in THY-TIME-RUN-001 v4.'),
  ('ID_B_RETURN_ON_CRITICAL','INJURY_DEATH','RETAINED_ALTERNATIVE',null),
  ('ID_C_ERA_BOUND_MORTALITY','INJURY_DEATH','RETAINED_ALTERNATIVE',null),
  ('CA_A_VISITS_BECOME_HISTORY','CAUSALITY','SUPERSEDED_AS_CURRENT_CANDIDATE','Unresolved CONSISTENCY_PRESSURE: what prevents an action that eliminates the departure itself. All CA-A work, guards and tests are preserved.'),
  ('CA_B_BRANCH_ON_CHANGE','CAUSALITY','RETAINED_ALTERNATIVE',null),
  ('CA_C_LEDGERED_CAUSALITY','CAUSALITY','SELECTED_WORKING','Compatible with the live visitor_history_rule, which is the shared floor of CA-A and CA-C.'),
  ('IT_A_SPEECH_ONLY','INFORMATION_TRANSFER','RETAINED_ALTERNATIVE',null),
  ('IT_B_ERA_EXPRESSIBLE','INFORMATION_TRANSFER','RETAINED_ALTERNATIVE',null),
  ('IT_C_LEDGERED_DISCLOSURE','INFORMATION_TRANSFER','SELECTED_WORKING','Destination-era people retain agency and may decline information.')
on conflict (option_code) do nothing;

-- ------------------------------------------- 4 · ID-A AUTHORIZATION / PREVENTION GATE
-- Death is real. Safety is bought before departure, not by making the traveler
-- less real than the people of the destination era.
create table if not exists trun_traversal_authorizations (
  authorization_id uuid primary key default gen_random_uuid(),
  traversal_id     uuid references trun_traversals(traversal_id) on delete cascade,
  state            text not null,
  death_rule_acknowledged boolean not null default false,
  threshold_place  text,
  threshold_admits boolean,
  residence_intent text,
  origin_era_continuity_arrangement text,
  guardian_authority text,
  medical_floor_met boolean,
  purpose          text,
  blockers         jsonb not null default '[]'::jsonb,
  decided_at       timestamptz not null default now(),
  constraint trun_auth_state check (state in ('AUTHORIZED','AUTHORIZED_WITH_CONDITIONS','REFUSED')),
  constraint trun_auth_residence check (residence_intent is null or residence_intent in ('VISIT','REMAIN')),
  -- An authorized traversal must have acknowledged the death rule.
  constraint trun_auth_death_rule check (state = 'REFUSED' or death_rule_acknowledged),
  -- A traveler who remains must have left the origin era resolved.
  constraint trun_auth_remain_resolved check (
    state = 'REFUSED' or residence_intent is distinct from 'REMAIN'
      or (origin_era_continuity_arrangement is not null and btrim(origin_era_continuity_arrangement) <> '')
  ),
  -- Invitation is a privilege, not a right.
  constraint trun_auth_threshold_admits check (state = 'REFUSED' or threshold_admits is not false),
  constraint trun_auth_medical check (state = 'REFUSED' or medical_floor_met is not false)
);

comment on table trun_traversal_authorizations is
  'ID-A. A traversal that should not happen is stopped here, not survived there.';

-- A traversal may not be recorded as departed without an authorization that cleared.
create or replace function trun_departure_requires_authorization() returns trigger as $$
declare cleared boolean;
begin
  if new.departure_at is null or btrim(new.departure_at) = '' or new.departure_at = 'UNSEALED' then
    return new;
  end if;
  select exists (
    select 1 from trun_traversal_authorizations a
    where a.traversal_id = new.traversal_id and a.state <> 'REFUSED'
  ) into cleared;
  if not cleared then
    raise exception 'UNAUTHORIZED_DEPARTURE: traversal % has no cleared authorization (ID-A: death is real)', new.traversal_id;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trun_departure_requires_authorization_trg on trun_traversals;
create trigger trun_departure_requires_authorization_trg
  before insert or update on trun_traversals
  for each row execute function trun_departure_requires_authorization();

-- ------------------------------------------------------ 5 · DISCLOSURE LEDGER (IT-C)
alter table trun_information_shared add column if not exists ledgered boolean not null default false;
alter table trun_information_shared add column if not exists declined_at timestamptz;

do $$ begin
  alter table trun_information_shared add constraint trun_disclosure_itc_ledgered
    check (model <> 'IT_C_LEDGERED_DISCLOSURE' or ledgered);
exception when duplicate_object then null; end $$;

comment on constraint trun_disclosure_itc_ledgered on trun_information_shared is
  'IT-C. Under ledgered disclosure every disclosure is recorded, including the ones declined.';

-- ------------------------------------------------- 6 · NAME RECOVERY, NOT NAME GUESSING
create table if not exists trun_name_recovery (
  subject_code    text primary key,
  canon_key       text not null,
  recovery_state  text not null,
  do_not_guess    boolean not null default true,
  withdrawn_candidates jsonb not null default '[]'::jsonb,
  language_state  text not null,
  note            text,
  constraint trun_name_recovery_state check (
    recovery_state in ('OPEN_PENDING_CHAIRMAN_NAME_RECOVERY','RECOVERED','SEALED')
  ),
  constraint trun_name_recovery_no_guessing check (
    recovery_state <> 'OPEN_PENDING_CHAIRMAN_NAME_RECOVERY' or do_not_guess
  )
);

insert into trun_name_recovery (subject_code, canon_key, recovery_state, withdrawn_candidates, language_state, note) values
  ('ROYAL_CASTLE','ER-CASTLE-ROYAL-001','OPEN_PENDING_CHAIRMAN_NAME_RECOVERY',
   '["Ederehald","Ariahdura","Torvaenah"]'::jsonb,
   'EDEREAIRAH_NATIVE_LANGUAGE_UNKNOWN',
   'Three candidates were proposed at WR-TIMERUN-581 and are WITHDRAWN. The live record says DO NOT GUESS and the state is name RECOVERY, not name selection. No EdereAirah language, lexicon or morpheme registry exists in the live backend, so the morphemes had no canonical source.')
on conflict (subject_code) do nothing;

comment on constraint trun_name_recovery_no_guessing on trun_name_recovery is
  'A name under recovery is the Chairman''s to supply. It is not derived, proposed or guessed.';

commit;
