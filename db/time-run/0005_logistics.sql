-- 0005 · Money conversion, clothing, food, water, communications, weather,
--        security, medical support, route support.

begin;

-- ---------------------------------------------------------------------------
-- Money. Era-specific. Integer minor units only. No floating point money.
-- A conversion is a recorded act with a rate and a witness, not a silent cast.
-- ---------------------------------------------------------------------------
create table if not exists thytr_money_conversion (
  conversion_id       uuid primary key default gen_random_uuid(),
  run_code            text not null references thytr_run(run_code),
  era_code            text not null references thytr_era_profile(era_code),
  source_unit         text not null,
  source_minor        bigint not null check (source_minor > 0),
  target_unit         text not null,
  target_minor        bigint not null check (target_minor > 0),
  rate_numerator      bigint not null check (rate_numerator > 0),
  rate_denominator    bigint not null check (rate_denominator > 0),
  converted_where     text,
  converted_by_role   text not null references thytr_crew_role(role_code),
  witnessed_by_role   text not null references thytr_crew_role(role_code),
  fee_minor           bigint not null default 0 check (fee_minor >= 0),
  converted_at        timestamptz not null default now(),
  constraint thytr_money_conversion_two_people
    check (converted_by_role is distinct from witnessed_by_role)
);

comment on table thytr_money_conversion is
  'Initiation and witness are separate roles. Period money entering the era is the single largest opportunity for quiet distortion of a local economy, so it is rate-recorded and capped by policy, not by trust.';

create table if not exists thytr_money_ledger (
  entry_id            uuid primary key default gen_random_uuid(),
  run_code            text not null references thytr_run(run_code),
  team_code           text references thytr_team(team_code),
  era_code            text not null references thytr_era_profile(era_code),
  unit                text not null,
  direction           text not null check (direction in ('OUT','IN')),
  amount_minor        bigint not null check (amount_minor > 0),
  purpose             text not null
                      check (purpose in (
                        'LODGING','FOOD','FODDER','WATER','FUEL','REPAIR','PARTS',
                        'LOCAL_WAGE','ANIMAL_HIRE','TOLL','MEDICINE','MATERIALS',
                        'GIFT_REFUSED','FINE','RECOVERY','OTHER')),
  counterparty_kind   text not null default 'LOCAL'
                      check (counterparty_kind in ('LOCAL','HOST_HOME','HOST_COMMUNITY','RUN','CROWN')),
  stop_id             uuid references thytr_stop(stop_id),
  recorded_by_role    text references thytr_crew_role(role_code),
  recorded_at         timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Period clothing. Issued per person-slot, checked before the era is entered.
-- ---------------------------------------------------------------------------
create table if not exists thytr_clothing_issue (
  issue_id            uuid primary key default gen_random_uuid(),
  slot_id             uuid references thytr_crew_slot(slot_id) on delete cascade,
  era_code            text not null references thytr_era_profile(era_code),
  garment_set         text not null,
  period_correct      boolean not null default true,
  fitted              boolean not null default false,
  weather_rated       boolean not null default false,
  work_rated          boolean not null default false,
  issued_at           timestamptz not null default now(),
  returned_at         timestamptz
);

-- ---------------------------------------------------------------------------
-- Food and water for crew. Fodder for animals is in thytr_animal_care.
-- ---------------------------------------------------------------------------
create table if not exists thytr_provision (
  provision_id        uuid primary key default gen_random_uuid(),
  team_code           text not null references thytr_team(team_code),
  stop_id             uuid references thytr_stop(stop_id),
  provision_kind      text not null
                      check (provision_kind in ('FOOD','WATER','FODDER','FUEL','SALT','MEDICINE')),
  source              text not null
                      check (source in ('CARRIED','PURCHASED_LOCAL','HOST_GIFT','FORAGED','SHARED_TO_LOCAL')),
  quantity_note       text,
  paid_minor          bigint check (paid_minor is null or paid_minor >= 0),
  recorded_at         timestamptz not null default now()
);

alter table thytr_provision drop constraint if exists thytr_provision_purchase_paid;
alter table thytr_provision add constraint thytr_provision_purchase_paid
  check (source <> 'PURCHASED_LOCAL' or paid_minor is not null);

-- ---------------------------------------------------------------------------
-- Communications. Era-bound. Nothing later-era functions.
-- ---------------------------------------------------------------------------
create table if not exists thytr_comm_channel (
  channel_code        text primary key,
  era_code            text not null references thytr_era_profile(era_code),
  channel_label       text not null,
  channel_kind        text not null
                      check (channel_kind in (
                        'RIDER','WRITTEN_NOTE','TOWN_POST','CHURCH_BELL','SIGNAL_FIRE',
                        'FLAG','TELEGRAPH','TELEPHONE','RADIO','VOICE')),
  typical_delay_note  text,
  available           boolean not null default true
);

create table if not exists thytr_message (
  message_id          uuid primary key default gen_random_uuid(),
  run_code            text not null references thytr_run(run_code),
  channel_code        text not null references thytr_comm_channel(channel_code),
  from_role           text references thytr_crew_role(role_code),
  to_label            text,
  urgency             text not null default 'ROUTINE'
                      check (urgency in ('ROUTINE','HELP','MEDICAL','DEATH','RECOVERY','HOST')),
  sent_at             timestamptz not null default now(),
  received_at         timestamptz,
  lost                boolean not null default false
);

-- ---------------------------------------------------------------------------
-- Weather and road survey, medical support, security posture.
-- ---------------------------------------------------------------------------
create table if not exists thytr_condition_report (
  report_id           uuid primary key default gen_random_uuid(),
  leg_id              uuid references thytr_leg(leg_id) on delete cascade,
  weather_state       text not null
                      check (weather_state in ('CLEAR','RAIN','STORM','SNOW','HEAT','FOG','UNKNOWN')),
  road_condition      text not null
                      check (road_condition in ('GOOD','ROUGH','WASHED_OUT','FLOODED','SNOW','MUD','IMPASSABLE','UNSURVEYED')),
  water_crossing_safe boolean,
  local_advice_taken  boolean not null default false,
  decision            text not null default 'PROCEED'
                      check (decision in ('PROCEED','SLOW','HALT','REROUTE','SHELTER')),
  reported_at         timestamptz not null default now()
);

create table if not exists thytr_medical_event (
  medical_id          uuid primary key default gen_random_uuid(),
  run_code            text not null references thytr_run(run_code),
  subject_kind        text not null check (subject_kind in ('CREW','LOCAL','HOST','ANIMAL')),
  slot_id             uuid references thytr_crew_slot(slot_id),
  severity            text not null
                      check (severity in ('MINOR','SERIOUS','CRITICAL','FATAL')),
  era_appropriate_care boolean not null default true,
  care_note           text,
  run_halted          boolean not null default false,
  occurred_at         timestamptz not null default now()
);

comment on column thytr_medical_event.era_appropriate_care is
  'Care is bounded by destination-era capability. Knowledge carried forward may inform judgement; later-era equipment and medicine do not function and are not recorded as used.';

create table if not exists thytr_security_posture (
  posture_id          uuid primary key default gen_random_uuid(),
  leg_id              uuid references thytr_leg(leg_id) on delete cascade,
  threat_note         text,
  escorts_posted      integer not null default 0 check (escorts_posted >= 0),
  night_watch         boolean not null default false,
  local_law_informed  boolean not null default false,
  policing_local_people boolean not null default false
                      check (policing_local_people = false),
  set_at              timestamptz not null default now()
);

comment on column thytr_security_posture.policing_local_people is
  'Locked false. Escort protects the team and its cargo. It does not police, detain, search or govern host communities.';

commit;
