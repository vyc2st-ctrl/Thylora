-- THYLORA · QYRIS · 0005 · AUDIT · TRUST BREACH · SELF-DISQUALIFICATION ·
--                            RESTORATION/APPEAL · CONFLICT-OF-INTEREST
--
-- Five of the seven mechanisms. The append-only guarantee is a trigger, so a
-- direct UPDATE or DELETE on the trail fails at the database rather than being
-- prevented by an application that can be bypassed.

-- ── 3 · AUDIT ─────────────────────────────────────────────────────────────
create table if not exists qyr_audit (
  seq          bigserial primary key,
  household_id text references qyr_households(household_id) on delete cascade,
  seat_id      text,
  event        text not null,
  detail       jsonb not null default '{}'::jsonb,
  corrects     bigint references qyr_audit(seq),
  at           timestamptz not null default now()
);

create index if not exists qyr_audit_household_idx on qyr_audit (household_id, seq);
create index if not exists qyr_audit_seat_idx on qyr_audit (seat_id, seq);

create or replace function qyr_audit_append_only() returns trigger
language plpgsql as $$
begin
  raise exception 'AUDIT_APPEND_ONLY: the trail is not edited or removed. Append a CORRECTION that points back (corrects = %).',
    coalesce(old.seq, -1);
end $$;

drop trigger if exists qyr_audit_no_update on qyr_audit;
create trigger qyr_audit_no_update before update on qyr_audit
  for each row execute function qyr_audit_append_only();

drop trigger if exists qyr_audit_no_delete on qyr_audit;
create trigger qyr_audit_no_delete before delete on qyr_audit
  for each row execute function qyr_audit_append_only();

-- ── 4 · TRUST BREACH ──────────────────────────────────────────────────────
create table if not exists qyr_breach_categories (
  category  text primary key,
  severity  text not null,
  effect    text not null,
  describe  text not null,
  restorable boolean not null,
  constraint qyr_breach_sev check (severity in ('MODERATE','SERIOUS','CRITICAL')),
  constraint qyr_breach_effect check (effect in ('SUSPEND_SCOPE','SUSPEND_SEAT','SUSPEND_ALL'))
);

insert into qyr_breach_categories (category, severity, effect, describe, restorable) values
  ('SCOPE_EXCEEDED',      'MODERATE','SUSPEND_SCOPE','Acted outside the granted scope, however helpfully.', true),
  ('UNDECLARED_CONFLICT', 'SERIOUS', 'SUSPEND_SEAT', 'Held an interest in a matter and did not declare it before acting.', true),
  ('RESOURCE_MISUSE',     'SERIOUS', 'SUSPEND_SEAT', 'Drew company resources outside the declared mission-aligned purpose, or without a receipt.', true),
  ('CONFIDENCE_BROKEN',   'SERIOUS', 'SUSPEND_SEAT', 'Repeated something the household said, outside the people it was said to.', true),
  ('RECORD_FALSIFIED',    'CRITICAL','SUSPEND_ALL',  'Altered, backdated or fabricated a record, including an audit entry or a receipt.', true),
  ('SURVEILLANCE',        'CRITICAL','SUSPEND_ALL',  'Monitored a household member, retained credentials, or installed anything that watches.', false),
  ('HARM_TO_DEPENDANT',   'CRITICAL','SUSPEND_ALL',  'Harm, or credible risk of harm, to a child or a dependant adult.', false),
  ('COERCION',            'CRITICAL','SUSPEND_ALL',  'Used the position to pressure a household member into anything — money, silence, contact or compliance.', false)
on conflict (category) do update
  set severity = excluded.severity, effect = excluded.effect,
      describe = excluded.describe, restorable = excluded.restorable;

create table if not exists qyr_breaches (
  breach_id   uuid primary key default gen_random_uuid(),
  seat_id     text not null references qyr_seats(seat_id) on delete cascade,
  category    text not null references qyr_breach_categories(category),
  detail      text not null,
  raised_by   text not null,
  recorded_at timestamptz not null default now(),
  state       text not null default 'RECORDED',
  constraint qyr_breaches_state check (state in ('RECORDED','RESTORED','OVERTURNED','VARIED'))
);

-- The effect applies on record, before any review. The review decides
-- restoration; it never decides whether access stops.
create or replace function qyr_apply_breach_effect() returns trigger
language plpgsql as $$
declare eff text; rest boolean; hh text;
begin
  select effect, restorable into eff, rest from qyr_breach_categories where category = new.category;
  select household_id into hh from qyr_seats where seat_id = new.seat_id;

  update qyr_access_grants set state = 'REVOKED', revoked_at = now(), revoke_reason = new.category
   where state = 'ACTIVE'
     and (eff = 'SUSPEND_SCOPE' and seat_id = new.seat_id
       or eff = 'SUSPEND_SEAT'  and seat_id = new.seat_id
       or eff = 'SUSPEND_ALL'   and seat_id in (select seat_id from qyr_seats where household_id = hh));

  if eff = 'SUSPEND_SEAT' then
    update qyr_seats set state = 'SUSPENDED' where seat_id = new.seat_id and state = 'ACTIVE';
  elsif eff = 'SUSPEND_ALL' then
    update qyr_seats set state = 'SUSPENDED' where household_id = hh and state = 'ACTIVE';
  end if;

  if rest is false then
    update qyr_seats set state = 'ENDED_NOT_RESTORABLE' where seat_id = new.seat_id;
  end if;

  insert into qyr_audit (household_id, seat_id, event, detail)
  values (hh, new.seat_id, 'BREACH_RECORDED',
          jsonb_build_object('category', new.category, 'effect', eff, 'restorable', rest, 'detail', new.detail));
  return new;
end $$;

drop trigger if exists qyr_breaches_effect on qyr_breaches;
create trigger qyr_breaches_effect after insert on qyr_breaches
  for each row execute function qyr_apply_breach_effect();

-- ── 5 · SELF-DISQUALIFICATION ─────────────────────────────────────────────
-- Always available, never penalised, standing unchanged. The penalty and
-- standing columns are constrained so no later process can write a penalty in.
create table if not exists qyr_self_disqualifications (
  dq_id      uuid primary key default gen_random_uuid(),
  seat_id    text not null references qyr_seats(seat_id) on delete cascade,
  matter_ref text,
  reason     text,
  mandatory  boolean not null default false,
  grounds    text[] not null default '{}',
  penalty    text not null default 'NONE',
  standing   text not null default 'UNCHANGED',
  at         timestamptz not null default now(),
  constraint qyr_dq_no_penalty  check (penalty = 'NONE'),
  constraint qyr_dq_no_demotion check (standing = 'UNCHANGED'),
  constraint qyr_dq_grounds check (
    grounds <@ array['RELATED_TO_PARTY','HOLDS_INTEREST','REVIEWING_OWN_WORK','PRIOR_BREACH_IN_MATTER']
  ),
  -- A mandatory stand-down names its ground. An optional one needs no reason at all.
  constraint qyr_dq_mandatory_has_ground check (mandatory is false or cardinality(grounds) > 0)
);

create or replace function qyr_apply_disqualification() returns trigger
language plpgsql as $$
declare hh text;
begin
  select household_id into hh from qyr_seats where seat_id = new.seat_id;
  update qyr_access_grants set state = 'REVOKED', revoked_at = now(), revoke_reason = 'SELF_DISQUALIFICATION'
   where seat_id = new.seat_id and state = 'ACTIVE'
     and (new.matter_ref is null or purpose like '%' || new.matter_ref || '%');
  if new.matter_ref is null then
    update qyr_seats set state = 'STOOD_DOWN' where seat_id = new.seat_id and state = 'ACTIVE';
  end if;
  insert into qyr_audit (household_id, seat_id, event, detail)
  values (hh, new.seat_id, 'SELF_DISQUALIFIED',
          jsonb_build_object('matter', new.matter_ref, 'mandatory', new.mandatory,
                             'grounds', to_jsonb(new.grounds), 'penalty', 'NONE', 'standing', 'UNCHANGED'));
  return new;
end $$;

drop trigger if exists qyr_self_dq_effect on qyr_self_disqualifications;
create trigger qyr_self_dq_effect after insert on qyr_self_disqualifications
  for each row execute function qyr_apply_disqualification();

-- ── 7 · CONFLICT-OF-INTEREST ──────────────────────────────────────────────
create table if not exists qyr_conflicts (
  coi_id      uuid primary key default gen_random_uuid(),
  seat_id     text not null references qyr_seats(seat_id) on delete cascade,
  matter_ref  text,
  nature      text not null,
  kind        text not null default 'PER_MATTER',
  state       text not null default 'DECLARED',
  declared_at timestamptz,
  discovered_at timestamptz,
  found_by    text,
  cleared_by  text,
  condition   text,
  cleared_at  timestamptz,
  constraint qyr_coi_kind  check (kind in ('STANDING','PER_MATTER')),
  constraint qyr_coi_state check (state in ('DECLARED','CLEARED','DISCOVERED')),
  constraint qyr_coi_nature check (length(btrim(nature)) >= 8),
  -- Clearance is never self-clearance, and never bare: it carries its condition.
  constraint qyr_coi_cleared_has_condition check (
    state <> 'CLEARED' or (cleared_by is not null and length(btrim(coalesce(condition,''))) >= 8)
  ),
  -- A declared conflict has a declaration time; a discovered one has a discovery time.
  constraint qyr_coi_timed check (
    (state = 'DISCOVERED' and discovered_at is not null) or (state <> 'DISCOVERED' and declared_at is not null)
  )
);

create or replace function qyr_assert_conflict_not_self_cleared() returns trigger
language plpgsql as $$
declare person text;
begin
  if new.state = 'CLEARED' then
    select person_ref into person from qyr_seats where seat_id = new.seat_id;
    if new.cleared_by = person then
      raise exception 'SELF_CLEARANCE_REFUSED: a seat cannot clear its own conflict';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists qyr_conflicts_guard on qyr_conflicts;
create trigger qyr_conflicts_guard before insert or update on qyr_conflicts
  for each row execute function qyr_assert_conflict_not_self_cleared();

-- A conflict discovered rather than declared is a breach, by definition.
create or replace function qyr_discovered_conflict_is_breach() returns trigger
language plpgsql as $$
begin
  if new.state = 'DISCOVERED' then
    insert into qyr_breaches (seat_id, category, detail, raised_by)
    values (new.seat_id, 'UNDECLARED_CONFLICT', new.nature, coalesce(new.found_by, 'CONFLICT_CHECK'));
  end if;
  return new;
end $$;

drop trigger if exists qyr_conflicts_discovery on qyr_conflicts;
create trigger qyr_conflicts_discovery after insert on qyr_conflicts
  for each row execute function qyr_discovered_conflict_is_breach();

-- ── 6 · RESTORATION / APPEAL ──────────────────────────────────────────────
create table if not exists qyr_restoration_checks (
  check_id      uuid primary key default gen_random_uuid(),
  breach_id     uuid not null references qyr_breaches(breach_id) on delete cascade,
  elapsed_days  integer not null,
  acknowledged  boolean not null default false,
  independent_review boolean not null default false,
  harmed_party_notified boolean not null default false,
  remedy_completed boolean not null default false,
  eligible      boolean not null default false,
  blockers      text[] not null default '{}',
  checked_at    timestamptz not null default now()
);

-- Eligibility is computed, never asserted.
create or replace function qyr_restoration_eligibility(p_breach_id uuid, p_elapsed_days integer,
  p_acknowledged boolean, p_independent_review boolean, p_harmed_notified boolean, p_remedy_completed boolean)
returns table (eligible boolean, blockers text[])
language plpgsql stable as $$
declare sev text; rest boolean; minimum integer; b text[] := '{}';
begin
  select c.severity, c.restorable into sev, rest
    from qyr_breaches x join qyr_breach_categories c on c.category = x.category
   where x.breach_id = p_breach_id;
  if not found then raise exception 'BREACH_NOT_FOUND: %', p_breach_id; end if;
  minimum := case sev when 'MODERATE' then 30 when 'SERIOUS' then 90 else 365 end;
  -- ::text on each literal: without it Postgres reads text[] || unknown as an
  -- array-to-array concat and fails on "malformed array literal".
  if rest is false then b := b || 'NOT_RESTORABLE'::text; end if;
  if p_elapsed_days is null or p_elapsed_days < minimum then b := b || 'TIME_NOT_ELAPSED'::text; end if;
  if p_acknowledged is not true then b := b || 'NOT_ACKNOWLEDGED'::text; end if;
  if p_independent_review is not true then b := b || 'NO_INDEPENDENT_REVIEW'::text; end if;
  if p_harmed_notified is not true then b := b || 'HARMED_PARTY_NOT_NOTIFIED'::text; end if;
  if p_remedy_completed is not true then b := b || 'REMEDY_INCOMPLETE'::text; end if;
  return query select cardinality(b) = 0, b;
end $$;

create table if not exists qyr_appeals (
  appeal_id  uuid primary key default gen_random_uuid(),
  breach_id  uuid not null references qyr_breaches(breach_id) on delete cascade,
  raised_by  text not null,
  grounds    text not null,
  reviewer   text,
  state      text not null default 'OPEN',
  outcome    text,
  reasoning  text,
  decided_by text,
  opened_at  timestamptz not null default now(),
  decided_at timestamptz,
  constraint qyr_appeal_state check (state in ('OPEN','DECIDED')),
  constraint qyr_appeal_outcome check (outcome is null or outcome in ('UPHELD','OVERTURNED','VARIED')),
  constraint qyr_appeal_grounds check (length(btrim(grounds)) >= 8),
  constraint qyr_appeal_decided_has_reasoning check (
    state <> 'DECIDED' or (outcome is not null and length(btrim(coalesce(reasoning,''))) >= 8)
  )
);

-- The reviewer may be neither the seat holder nor the person who raised the finding.
create or replace function qyr_assert_appeal_reviewer() returns trigger
language plpgsql as $$
declare person text; raiser text;
begin
  select s.person_ref, x.raised_by into person, raiser
    from qyr_breaches x join qyr_seats s on s.seat_id = x.seat_id
   where x.breach_id = new.breach_id;
  if new.reviewer is not null and new.reviewer = person then
    raise exception 'SELF_REVIEW_REFUSED';
  end if;
  if new.reviewer is not null and new.reviewer = raiser then
    raise exception 'RAISER_CANNOT_REVIEW_OWN_FINDING';
  end if;
  return new;
end $$;

drop trigger if exists qyr_appeals_guard on qyr_appeals;
create trigger qyr_appeals_guard before insert or update on qyr_appeals
  for each row execute function qyr_assert_appeal_reviewer();

-- An overturned finding reinstates the seat. Appeal is available even where
-- restoration is not, because the appeal challenges whether the finding is true.
create or replace function qyr_apply_appeal_outcome() returns trigger
language plpgsql as $$
declare hh text; seat text;
begin
  if new.state = 'DECIDED' and new.outcome = 'OVERTURNED' then
    select x.seat_id into seat from qyr_breaches x where x.breach_id = new.breach_id;
    select household_id into hh from qyr_seats where seat_id = seat;
    update qyr_breaches set state = 'OVERTURNED' where breach_id = new.breach_id;
    update qyr_seats set state = 'ACTIVE'
     where seat_id = seat and state in ('SUSPENDED','ENDED_NOT_RESTORABLE');
    insert into qyr_audit (household_id, seat_id, event, detail)
    values (hh, seat, 'SEAT_REINSTATED_ON_APPEAL',
            jsonb_build_object('appeal', new.appeal_id, 'decided_by', new.decided_by));
  end if;
  return new;
end $$;

drop trigger if exists qyr_appeals_outcome on qyr_appeals;
create trigger qyr_appeals_outcome after insert or update on qyr_appeals
  for each row execute function qyr_apply_appeal_outcome();

insert into qyr_rules (rule_key, rule_text) values
  ('AUDIT_APPEND_ONLY',
   'The audit trail is append-only. A correction appends a new entry that points back. Nothing is edited or removed.'),
  ('BREACH_EFFECT_PRECEDES_REVIEW',
   'A breach effect applies on record, before any review. The review decides restoration; it never decides whether access stops.'),
  ('SELF_DISQUALIFICATION_FREE',
   'Standing down is always available, never penalised, and standing is unchanged. It is mandatory on four named grounds.'),
  ('APPEAL_ALWAYS_AVAILABLE',
   'Appeal is available against any finding, including one that is not restorable, because the appeal challenges whether the finding is true.')
on conflict (rule_key) do update set rule_text = excluded.rule_text;
