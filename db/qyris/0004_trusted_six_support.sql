-- THYLORA · QYRIS · 0004 · Trusted Six support — roles, seats, ACCESS, STEWARDSHIP
--
-- FICTIONAL MODEL. Simulated paid support roles inside the THYLORA world. No
-- real employment, no claimed credential, and no clinical, legal, financial or
-- educational advice. Every role family names the real professional it routes
-- out to, and that column is NOT NULL.
--
-- A household holds at most SIX concurrent active seats. The limit is enforced
-- by trigger, not by a convention that a later feature can quietly raise.
--
-- ACCESS ≠ AUTHORITY: qyr_seats.decision_rights is constrained to 'NONE'.

-- ── Scope vocabulary ──────────────────────────────────────────────────────
create table if not exists qyr_scopes (
  scope_code text primary key,
  describe   text not null,
  grantable  boolean not null default true
);

insert into qyr_scopes (scope_code, describe, grantable) values
  ('HOME_VISIT',               'Attend the household at an agreed time.',                         true),
  ('SCHEDULE_VIEW',            'See the household calendar entries relevant to the engagement.',   true),
  ('LEARNING_RECORD',          'See a learner''s work and school correspondence.',                 true),
  ('MEAL_PLANNING',            'Plan meals and shopping with the household.',                      true),
  ('HOME_HAZARD_SURVEY',       'Walk the home and record hazards.',                                true),
  ('DEVICE_SETUP',             'Configure a device or an account alongside its owner.',            true),
  ('BUDGET_WORKSHEET',         'Build a budget worksheet with the household.',                     true),
  ('INTERPRETATION_SESSION',   'Interpret in an informal, non-proceeding setting.',                true),
  ('SKILL_SESSION',            'Run a practical teaching session.',                                true),
  ('MINOR_CONTACT_SUPERVISED', 'Contact with a minor, with a responsible adult present throughout.', true),
  ('COMPANY_RESOURCE_DRAW',    'Request company resources for declared mission-aligned work.',      true),
  -- Never grantable. Present as rows so a refusal can name the row rather than a hard-coded string.
  ('MONEY_MOVEMENT',           'Move household money. Never granted to any support seat.',          false),
  ('CREDENTIAL_HOLDING',       'Hold a household credential. Never granted.',                       false),
  ('MEDICAL_DECISION',         'Decide medical care. Never granted.',                               false),
  ('LEGAL_REPRESENTATION',     'Represent the household legally. Never granted.',                   false),
  ('DISCIPLINE_AUTHORITY',     'Discipline a household member. Never granted.',                     false),
  ('HOUSEHOLD_SURVEILLANCE',   'Monitor a household member. Never granted.',                        false),
  ('MINOR_CONTACT_UNSUPERVISED','Unsupervised contact with a minor. Never granted.',                false),
  ('IDENTITY_DOCUMENT_CUSTODY','Hold identity documents. Never granted.',                           false),
  ('BENEFICIARY_DESIGNATION',  'Be named a beneficiary of the household. Never granted.',           false)
on conflict (scope_code) do update
  set describe = excluded.describe, grantable = excluded.grantable;

-- ── The eight role families ───────────────────────────────────────────────
create table if not exists qyr_role_families (
  family_id      text primary key,
  label          text not null,
  purpose        text not null,
  routes_out_to  text not null,   -- NOT NULL: a role with no route out is a role pretending to be a profession
  fictional      boolean not null default true,
  constraint qyr_role_families_fictional check (fictional is true)
);

insert into qyr_role_families (family_id, label, purpose, routes_out_to) values
  ('PARENTS_CAREGIVERS', 'PARENTS / CAREGIVERS',
   'Practical support for the adults doing the caring — routine, respite, navigation, and someone to think out loud with.',
   'A clinician, a social worker or a statutory service for anything involving a child''s safety, a diagnosis, or a legal order.'),
  ('LEARNING_SUPPORT', 'LEARNING SUPPORT',
   'Sitting with a learner and the work in front of them — reading, homework, study habits, and translating what a school actually said.',
   'A qualified assessor or the institution''s statutory support process for diagnosis, accommodations or an exclusion dispute.'),
  ('NUTRITION_LITERACY', 'NUTRITION LITERACY',
   'Reading a label, planning a week, cooking what is actually affordable and available — literacy, not therapy.',
   'A registered dietitian or physician for any therapeutic diet, any diagnosis, any medication interaction, and anything at all involving a child''s weight.'),
  ('SAFETY', 'SAFETY',
   'Home hazards, fire, water, heat, carbon monoxide, road and equipment safety — finding the risk before it finds the household.',
   'The fire service, a licensed trade, or an emergency service. A safety seat never performs the repair it identifies.'),
  ('SECURITY', 'SECURITY',
   'Locks, lighting, passwords, backups, phishing, account recovery — the literacy that makes a household harder to reach.',
   'Law enforcement or a licensed investigator. A security seat never investigates a member of the household it serves.'),
  ('FINANCIAL_LITERACY', 'FINANCIAL LITERACY',
   'Reading a statement, building a budget, understanding an interest rate, and knowing what a document actually commits someone to.',
   'A licensed adviser, an accountant or a regulated debt service for advice on a specific product, an investment or an insolvency.'),
  ('LANGUAGE', 'LANGUAGE',
   'Learning, practising and being understood — including sitting beside someone while they make a call they have been avoiding.',
   'A certified interpreter for any medical, legal or immigration proceeding. A language seat is never the interpreter of record.'),
  ('LIFE_SKILLS', 'LIFE SKILLS',
   'The things nobody taught — a first tenancy, a form, a job application, a repair, a bus route, a difficult phone call.',
   'A licensed trade, a legal advice service or a clinician. A life-skills seat never substitutes for a licensed one.')
on conflict (family_id) do update
  set label = excluded.label, purpose = excluded.purpose, routes_out_to = excluded.routes_out_to;

-- Which scopes each family may ever hold. A scope that is not grantable cannot
-- appear here at all — enforced by the check below, not by care.
create table if not exists qyr_family_scopes (
  family_id  text not null references qyr_role_families(family_id) on delete cascade,
  scope_code text not null references qyr_scopes(scope_code),
  primary key (family_id, scope_code)
);

create or replace function qyr_assert_scope_grantable() returns trigger
language plpgsql as $$
declare ok boolean;
begin
  select grantable into ok from qyr_scopes where scope_code = new.scope_code;
  if ok is not true then
    raise exception 'SCOPE_FORBIDDEN_ALWAYS: % cannot be held by any support family', new.scope_code;
  end if;
  return new;
end $$;

drop trigger if exists qyr_family_scopes_guard on qyr_family_scopes;
create trigger qyr_family_scopes_guard before insert or update on qyr_family_scopes
  for each row execute function qyr_assert_scope_grantable();

insert into qyr_family_scopes (family_id, scope_code) values
  ('PARENTS_CAREGIVERS','HOME_VISIT'), ('PARENTS_CAREGIVERS','SCHEDULE_VIEW'),
  ('PARENTS_CAREGIVERS','SKILL_SESSION'), ('PARENTS_CAREGIVERS','MINOR_CONTACT_SUPERVISED'),
  ('PARENTS_CAREGIVERS','COMPANY_RESOURCE_DRAW'),
  ('LEARNING_SUPPORT','LEARNING_RECORD'), ('LEARNING_SUPPORT','SCHEDULE_VIEW'),
  ('LEARNING_SUPPORT','SKILL_SESSION'), ('LEARNING_SUPPORT','MINOR_CONTACT_SUPERVISED'),
  ('LEARNING_SUPPORT','COMPANY_RESOURCE_DRAW'),
  ('NUTRITION_LITERACY','MEAL_PLANNING'), ('NUTRITION_LITERACY','HOME_VISIT'),
  ('NUTRITION_LITERACY','BUDGET_WORKSHEET'), ('NUTRITION_LITERACY','SKILL_SESSION'),
  ('NUTRITION_LITERACY','COMPANY_RESOURCE_DRAW'),
  ('SAFETY','HOME_HAZARD_SURVEY'), ('SAFETY','HOME_VISIT'),
  ('SAFETY','SKILL_SESSION'), ('SAFETY','COMPANY_RESOURCE_DRAW'),
  ('SECURITY','DEVICE_SETUP'), ('SECURITY','HOME_HAZARD_SURVEY'),
  ('SECURITY','SKILL_SESSION'), ('SECURITY','COMPANY_RESOURCE_DRAW'),
  ('FINANCIAL_LITERACY','BUDGET_WORKSHEET'), ('FINANCIAL_LITERACY','HOME_VISIT'),
  ('FINANCIAL_LITERACY','SKILL_SESSION'), ('FINANCIAL_LITERACY','COMPANY_RESOURCE_DRAW'),
  ('LANGUAGE','INTERPRETATION_SESSION'), ('LANGUAGE','SKILL_SESSION'),
  ('LANGUAGE','HOME_VISIT'), ('LANGUAGE','MINOR_CONTACT_SUPERVISED'),
  ('LANGUAGE','COMPANY_RESOURCE_DRAW'),
  ('LIFE_SKILLS','SKILL_SESSION'), ('LIFE_SKILLS','HOME_VISIT'),
  ('LIFE_SKILLS','SCHEDULE_VIEW'), ('LIFE_SKILLS','COMPANY_RESOURCE_DRAW')
on conflict do nothing;

-- ── Households and the Trusted Six ────────────────────────────────────────
create table if not exists qyr_households (
  household_id text primary key,
  label        text,
  seat_limit   integer not null default 6,
  owner_ref    text,
  created_at   timestamptz not null default now(),
  constraint qyr_households_seat_limit check (seat_limit between 1 and 6)
);

create table if not exists qyr_seats (
  seat_id          text primary key,
  household_id     text not null references qyr_households(household_id) on delete cascade,
  family_id        text not null references qyr_role_families(family_id),
  person_ref       text not null,
  engaged_by       text not null,
  paid_rate_minor  integer,
  state            text not null default 'ACTIVE',
  decision_rights  text not null default 'NONE',
  opened_at        timestamptz not null default now(),
  watch_until      timestamptz,
  constraint qyr_seats_state check (state in ('ACTIVE','SUSPENDED','STOOD_DOWN','ENDED','ENDED_NOT_RESTORABLE')),
  -- ACCESS ≠ AUTHORITY. There is no value of this column that grants a decision.
  constraint qyr_seats_no_authority check (decision_rights = 'NONE'),
  constraint qyr_seats_rate check (paid_rate_minor is null or paid_rate_minor >= 0),
  constraint qyr_seats_not_self_engaged check (engaged_by is distinct from person_ref)
);

create index if not exists qyr_seats_household_idx on qyr_seats (household_id, state);

-- The Trusted Six limit, enforced.
create or replace function qyr_assert_seat_limit() returns trigger
language plpgsql as $$
declare active integer; lim integer;
begin
  if new.state <> 'ACTIVE' then return new; end if;
  select seat_limit into lim from qyr_households where household_id = new.household_id;
  select count(*) into active from qyr_seats
    where household_id = new.household_id and state = 'ACTIVE' and seat_id <> new.seat_id;
  if active >= lim then
    raise exception 'TRUSTED_SIX_LIMIT: % of % seats already active for household %', active, lim, new.household_id;
  end if;
  return new;
end $$;

drop trigger if exists qyr_seats_limit_guard on qyr_seats;
create trigger qyr_seats_limit_guard before insert or update on qyr_seats
  for each row execute function qyr_assert_seat_limit();

-- ── 1 · ACCESS ────────────────────────────────────────────────────────────
-- Scoped, purpose-bound, time-bounded, revocable without a reason.
create table if not exists qyr_access_grants (
  grant_id     uuid primary key default gen_random_uuid(),
  seat_id      text not null references qyr_seats(seat_id) on delete cascade,
  scope_code   text not null references qyr_scopes(scope_code),
  purpose      text not null,
  granted_by   text not null,
  granted_at   timestamptz not null default now(),
  expires_at   timestamptz not null,
  state        text not null default 'ACTIVE',
  revoked_at   timestamptz,
  revoke_reason text,
  constraint qyr_access_state check (state in ('ACTIVE','REVOKED','EXPIRED')),
  constraint qyr_access_purpose check (length(btrim(purpose)) >= 8),
  constraint qyr_access_bounded check (expires_at > granted_at)
);

create index if not exists qyr_access_seat_idx on qyr_access_grants (seat_id, state);

-- A grant may never carry a non-grantable scope, may never be self-granted, and
-- may never sit outside its family's permitted scopes.
create or replace function qyr_assert_grant_legal() returns trigger
language plpgsql as $$
declare fam text; person text; ok boolean;
begin
  select family_id, person_ref into fam, person from qyr_seats where seat_id = new.seat_id;
  select grantable into ok from qyr_scopes where scope_code = new.scope_code;
  if ok is not true then
    raise exception 'SCOPE_FORBIDDEN_ALWAYS: % cannot be granted to any support seat', new.scope_code;
  end if;
  if new.granted_by = person then
    raise exception 'SELF_GRANT_REFUSED: a seat cannot grant itself access';
  end if;
  if not exists (select 1 from qyr_family_scopes where family_id = fam and scope_code = new.scope_code) then
    raise exception 'SCOPE_OUTSIDE_FAMILY: % does not hold %', fam, new.scope_code;
  end if;
  return new;
end $$;

drop trigger if exists qyr_access_grants_guard on qyr_access_grants;
create trigger qyr_access_grants_guard before insert or update on qyr_access_grants
  for each row execute function qyr_assert_grant_legal();

-- ── 2 · STEWARDSHIP ───────────────────────────────────────────────────────
-- Company resources are available for mission-aligned work. Available is the
-- whole risk, so a draw carries a purpose, a mission basis, a cap, an approver
-- who is not the requester, and a receipt on close.
create table if not exists qyr_resource_draws (
  draw_id       uuid primary key default gen_random_uuid(),
  seat_id       text not null references qyr_seats(seat_id) on delete cascade,
  resource      text not null,
  purpose       text not null,
  mission_basis text not null,
  amount_minor  integer not null,
  cap_minor     integer not null,
  approved_by   text not null,
  matter_ref    text,
  state         text not null default 'OPEN',
  opened_at     timestamptz not null default now(),
  receipt_ref   text,
  spent_minor   integer,
  returned_minor integer,
  closed_by     text,
  closed_at     timestamptz,
  constraint qyr_draw_state check (state in ('OPEN','CLOSED','UNRECEIPTED','DISPUTED')),
  constraint qyr_draw_purpose check (length(btrim(purpose)) >= 8),
  constraint qyr_draw_mission check (length(btrim(mission_basis)) >= 8),
  constraint qyr_draw_amount check (amount_minor > 0),
  constraint qyr_draw_cap check (cap_minor > 0 and amount_minor <= cap_minor),
  constraint qyr_draw_spend check (spent_minor is null or (spent_minor >= 0 and spent_minor <= amount_minor)),
  -- A closed draw without a receipt is not a state this table can hold.
  constraint qyr_draw_closed_has_receipt check (
    state <> 'CLOSED' or (receipt_ref is not null and spent_minor is not null)
  )
);

create or replace function qyr_assert_draw_not_self_approved() returns trigger
language plpgsql as $$
declare person text;
begin
  select person_ref into person from qyr_seats where seat_id = new.seat_id;
  if new.approved_by = person then
    raise exception 'SELF_APPROVAL_REFUSED: the requester cannot approve their own draw';
  end if;
  return new;
end $$;

drop trigger if exists qyr_resource_draws_guard on qyr_resource_draws;
create trigger qyr_resource_draws_guard before insert or update on qyr_resource_draws
  for each row execute function qyr_assert_draw_not_self_approved();

insert into qyr_rules (rule_key, rule_text) values
  ('TRUSTED_SIX',
   'A household holds at most six concurrent active support seats. Scarcity is the mechanism: a seat is access to a household.'),
  ('STEWARDSHIP',
   'Company resources are available for mission-aligned work under a named purpose, a named mission basis, a cap, an approver who is not the requester, and a receipt on close.'),
  ('SUPPORT_FICTION',
   'Support roles are a fictional THYLORA model. No real employment, no claimed credential, no clinical, legal, financial or educational advice. Every family names the professional it routes out to.')
on conflict (rule_key) do update set rule_text = excluded.rule_text;
