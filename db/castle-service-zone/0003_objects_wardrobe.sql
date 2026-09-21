-- CASTLE SERVICE ZONE · 0003 · Object home map and wardrobe / laundry path
-- Workroom: WR-CASTLE-SERVICE-ZONE-576
--
-- NO TELEPORTING. An object has one home. Every other location it may occupy is
-- declared, and every move between declared locations must be a step that a flow
-- in 0002 actually carries. An object whose wash location is not reachable from
-- its in-use location by a recorded link is a conflict, not a detail.

begin;

do $$ begin
  create type thy_csz_object_class as enum (
    'CUTTING_TOOL','VESSEL','COOKING_IRON','MEASURE','TABLEWARE','CONTAINER',
    'RECORD','GARMENT','FOOTWEAR','FURNITURE'
  );
exception when duplicate_object then null; end $$;

-- Custodians are ROLE SLOTS. Only two occupants are carried, and both are given
-- facts, not inventions: Inés (Head Cook) and the Deputy Cook relief. Every other
-- slot is left unoccupied. NO RANDOM PEOPLE.
create table if not exists thy_csz_role_slot (
  role_code      text primary key check (role_code ~ '^CSZ-ROLE-[A-Z_]+$'),
  role_title     text not null,
  occupant_name  text,                        -- NULL = slot open, deliberately
  occupant_state thy_csz_measurement_state not null,
  occupant_source text not null,
  authority_note text not null
);

comment on column thy_csz_role_slot.occupant_name is
  'A name here must come from thylora_person_world_sheet or from an explicit Chairman fact. The registry was unreadable from the build session, so only the two facts supplied with the work order are carried.';

create table if not exists thy_csz_object_home (
  object_id        text primary key check (object_id ~ '^CSZ-OBJ-[0-9]{3}$'),
  serial           text not null references thy_csz_serial(serial),
  object_name      text not null,
  object_class     thy_csz_object_class not null,
  count_text       text not null,
  count_state      thy_csz_measurement_state not null,

  home_space       text references thy_csz_space_intake(stable_id),
  home_fixture     text not null,             -- the exact shelf, hook, rack, chest
  in_use_space     text references thy_csz_space_intake(stable_id),
  wash_space       text references thy_csz_space_intake(stable_id),
  dry_space        text references thy_csz_space_intake(stable_id),
  repair_space     text references thy_csz_space_intake(stable_id),
  repair_external  text,                      -- forge / cooper / cordwainer outside the slice
  custodian_role   text not null references thy_csz_role_slot(role_code),

  location_state   thy_csz_measurement_state not null,
  access_class     thy_csz_access_class not null,
  public_safe      boolean not null,
  mark_present     boolean not null default false,   -- see 0005: branding
  source_text      text not null,
  notes            text,

  constraint thy_csz_object_has_home     check (home_space is not null),
  constraint thy_csz_object_repair_once  check (num_nonnulls(repair_space, repair_external) <= 1),
  constraint thy_csz_object_secure_not_public
    check (not (public_safe and access_class in ('RESTRICTED_SERVICE','SECURE')))
);

-- ---------------------------------------------------------------- wardrobe / laundry
-- Connects to THY-WORK-INES-LIFE-ECONOMY-575. This file does NOT restate 575's
-- economy facts; it gives the garments physical storage and a laundry path, and
-- carries the residence dependency so 575 can read it back.

do $$ begin
  create type thy_csz_garment_kind as enum (
    'WORK_DRESS','APRON','SPARE_APRON','SHOES','SPARE_CLOTHING','PERSONAL_CLOTHING'
  );
exception when duplicate_object then null; end $$;

create table if not exists thy_csz_wardrobe (
  wardrobe_id        text primary key check (wardrobe_id ~ '^CSZ-WARD-[0-9]{2}$'),
  serial             text not null references thy_csz_serial(serial),
  person_role        text not null references thy_csz_role_slot(role_code),
  garment_kind       thy_csz_garment_kind not null,
  work_storage_space text references thy_csz_space_intake(stable_id),
  work_storage_fixture text,
  personal_storage_note text not null,          -- varies by residence model; see 0004
  residence_dependent boolean not null,
  laundry_path       text not null,
  mending_location   text not null,
  shoe_repair_location text not null,
  location_state     thy_csz_measurement_state not null,
  access_class       thy_csz_access_class not null,
  public_safe        boolean not null,
  links_work         text not null default 'THY-WORK-INES-LIFE-ECONOMY-575',
  source_text        text not null,
  constraint thy_csz_wardrobe_secure_not_public
    check (not (public_safe and access_class in ('RESTRICTED_SERVICE','SECURE')))
);

commit;
