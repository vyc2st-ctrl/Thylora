-- CASTLE SERVICE ZONE · 0004 · Inés residence models and Deputy Cook relief
-- Workroom: WR-CASTLE-SERVICE-ZONE-576
--
-- THREE MODELS ARE TESTED. NONE IS CANONIZED. The table enforces that: at most one
-- row may ever carry chairman_selected, and no model may claim DOCUMENTED state
-- while citing this work as its source.

begin;

do $$ begin
  create type thy_csz_residence_model as enum (
    'A_CASTLE_SERVICE_APARTMENT','B_ESTATE_COTTAGE','C_NEARBY_TOWN_RESIDENCE'
  );
exception when duplicate_object then null; end $$;

create table if not exists thy_csz_residence_option (
  model               thy_csz_residence_model primary key,
  serial              text not null references thy_csz_serial(serial),
  person_role         text not null references thy_csz_role_slot(role_code),

  distance_to_kitchen_m   integer check (distance_to_kitchen_m is null or distance_to_kitchen_m >= 0),
  travel_time_min         integer check (travel_time_min       is null or travel_time_min       >= 0),
  route_text              text not null,
  meal_arrangement        text not null,
  lodging_rent_treatment  text not null,
  privacy_text            text not null,
  personal_storage        text not null,
  day_off_experience      text not null,
  emergency_recall_min    integer check (emergency_recall_min is null or emergency_recall_min >= 0),
  security_access_effect  text not null,

  measurement_state   thy_csz_measurement_state not null,
  basis_text          text not null,
  access_class        thy_csz_access_class not null,
  public_safe         boolean not null,
  chairman_selected   boolean not null default false,
  source_text         text not null,

  constraint thy_csz_residence_not_documented_from_self
    check (measurement_state <> 'DOCUMENTED'
           or source_text !~* 'THY-WORK-KITCHEN-SUITE-RESIDENCE-576'),
  constraint thy_csz_residence_unknown_carries_no_numbers
    check (measurement_state <> 'UNKNOWN'
           or (distance_to_kitchen_m is null and travel_time_min is null and emergency_recall_min is null)),
  constraint thy_csz_residence_secure_not_public
    check (not (public_safe and access_class in ('RESTRICTED_SERVICE','SECURE')))
);

-- Exactly one model may be selected, and only by Chairman decision. Until then the
-- set stays open. This index is the canonization guard.
create unique index if not exists thy_csz_residence_single_selection
  on thy_csz_residence_option ((chairman_selected)) where chairman_selected;

create or replace function thy_csz_guard_residence_selection()
returns trigger language plpgsql as $$
begin
  if new.chairman_selected and (new.measurement_state <> 'CHAIRMAN_AUTHORED') then
    raise exception
      'a residence model may only be selected by CHAIRMAN_AUTHORED decision (model %, state %)',
      new.model, new.measurement_state;
  end if;
  return new;
end $$;

drop trigger if exists thy_csz_residence_selection_guard on thy_csz_residence_option;
create trigger thy_csz_residence_selection_guard
  before insert or update on thy_csz_residence_option
  for each row execute function thy_csz_guard_residence_selection();

-- ---------------------------------------------------------------- day-off / relief
-- Uses the existing Deputy Cook relief fact. Each row answers: with Inés off, and
-- under this residence model, what happens to handoff, recall, herb control, menu
-- change, shortage response and her personal time.

create table if not exists thy_csz_relief_matrix (
  model              thy_csz_residence_model primary key
                     references thy_csz_residence_option(model) on delete cascade,
  serial             text not null references thy_csz_serial(serial),
  authority_holder   text not null references thy_csz_role_slot(role_code),
  handoff_text       text not null,
  recall_text        text not null,
  recall_min         integer check (recall_min is null or recall_min >= 0),
  herb_control_text  text not null,
  menu_change_text   text not null,
  shortage_text      text not null,
  personal_time_text text not null,
  measurement_state  thy_csz_measurement_state not null,
  access_class       thy_csz_access_class not null,
  public_safe        boolean not null,
  source_text        text not null,
  constraint thy_csz_relief_secure_not_public
    check (not (public_safe and access_class in ('RESTRICTED_SERVICE','SECURE')))
);

commit;
