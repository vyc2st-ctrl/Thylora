-- THYLORA · Helper access · 0001
-- "Hook people up" without opening the back end.
--
-- A helper (family member, partner, contractor) gets:
--   * READ   only the items the Chairman has placed in their scope
--   * INSERT their own inputs (answers, notes, files, requests)
--   * NEVER  update, delete, or read anything outside their scope
--   * NEVER  read another helper's inputs
-- The AI assistant a helper talks to is given ONLY the rows this policy lets that
-- helper read. Access does not equal authority: nothing a helper inserts changes
-- a THYLORA record until the Chairman (or a named reviewer) accepts it.

begin;

create table if not exists thy_helper_profiles (
  user_id           uuid primary key references auth.users(id) on delete cascade,
  display_name      text not null,
  relationship      text not null,                 -- e.g. 'GRANDCHILD', 'PARENT', 'PARTNER'
  is_minor          boolean not null default false,
  guardian_user_id  uuid references auth.users(id) on delete restrict,
  helper_state      text not null default 'ACTIVE' check (helper_state in ('ACTIVE','PAUSED','ENDED')),
  created_at        timestamptz not null default now(),
  -- A child helper always has a recorded guardian. No exception path.
  constraint thy_helper_minor_guardian check (not is_minor or guardian_user_id is not null)
);

-- What a helper is allowed to see. Curated by the Chairman, one row per item.
create table if not exists thy_helper_scope_items (
  id            uuid primary key default gen_random_uuid(),
  helper_id     uuid not null references thy_helper_profiles(user_id) on delete cascade,
  item_kind     text not null check (item_kind in ('TASK','QUESTION','INFO','FORM','FILE')),
  title         text not null,
  body          text not null,
  -- The plain-language reason this helper can see it. Required, so scope is never accidental.
  why_visible   text not null,
  visible_until timestamptz,
  created_at    timestamptz not null default now()
);

-- What a helper sends in. Append-only for the helper.
create table if not exists thy_helper_inputs (
  id             uuid primary key default gen_random_uuid(),
  helper_id      uuid not null references thy_helper_profiles(user_id) on delete cascade,
  scope_item_id  uuid references thy_helper_scope_items(id) on delete set null,
  input_kind     text not null check (input_kind in ('ANSWER','NOTE','REQUEST','FILE_REF')),
  body           text not null check (length(body) between 1 and 20000),
  submitted_at   timestamptz not null default now(),
  review_state   text not null default 'RECEIVED'
                 check (review_state in ('RECEIVED','ACCEPTED','RETURNED','DECLINED')),
  reviewed_by    uuid references auth.users(id),
  reviewed_at    timestamptz
);

alter table thy_helper_profiles     enable row level security;
alter table thy_helper_scope_items  enable row level security;
alter table thy_helper_inputs       enable row level security;

-- Helpers see their own profile only.
drop policy if exists helper_profile_self on thy_helper_profiles;
create policy helper_profile_self on thy_helper_profiles
  for select to authenticated using (user_id = auth.uid());

-- Helpers see only their own, active, unexpired scope items.
drop policy if exists helper_scope_read on thy_helper_scope_items;
create policy helper_scope_read on thy_helper_scope_items
  for select to authenticated using (
    helper_id = auth.uid()
    and (visible_until is null or visible_until > now())
    and exists (select 1 from thy_helper_profiles p where p.user_id = auth.uid() and p.helper_state = 'ACTIVE')
  );

-- Helpers insert their own inputs, only in RECEIVED state, only against their own scope.
drop policy if exists helper_input_insert on thy_helper_inputs;
create policy helper_input_insert on thy_helper_inputs
  for insert to authenticated with check (
    helper_id = auth.uid()
    and review_state = 'RECEIVED' and reviewed_by is null and reviewed_at is null
    and (scope_item_id is null or exists (
          select 1 from thy_helper_scope_items s where s.id = scope_item_id and s.helper_id = auth.uid()))
    and exists (select 1 from thy_helper_profiles p where p.user_id = auth.uid() and p.helper_state = 'ACTIVE')
  );

-- Helpers can read back what they sent, nothing else.
drop policy if exists helper_input_read_own on thy_helper_inputs;
create policy helper_input_read_own on thy_helper_inputs
  for select to authenticated using (helper_id = auth.uid());

-- No update or delete policy exists for helpers, so RLS refuses both.
-- Belt and braces: remove the privileges too.
revoke update, delete on thy_helper_inputs, thy_helper_scope_items, thy_helper_profiles from authenticated, anon;
revoke insert on thy_helper_scope_items, thy_helper_profiles from authenticated, anon;
revoke all on thy_helper_profiles, thy_helper_scope_items, thy_helper_inputs from anon;
grant select on thy_helper_profiles, thy_helper_scope_items to authenticated;
grant select, insert on thy_helper_inputs to authenticated;

commit;
