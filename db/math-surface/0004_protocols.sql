-- THYLORA MATHEMATICS SURFACE · 0004 · Standing protocols
-- Workroom: WR-MATH-SURFACE-001
--
--   THY-CONTINUITY-WATCHDOG-001              no active workstream is dropped at a restart
--   THY-VOICE-PROMPT-NO-SILENT-MUTATION-001  spoken and prompt text cannot change unannounced
--   THY-MINOR-NAME-ADULT-USE-001             a protected name is not worn by a child
--
-- These are held as tables rather than as prose so a later session inherits the
-- rules with the data, instead of inheriting a promise that somebody remembered.

begin;

create table if not exists thy_protocols (
  id            text primary key,
  subject       text not null,
  statement     text not null,
  opened_at     timestamptz not null default now(),
  active        boolean not null default true
);

insert into thy_protocols (id, subject, statement) values
  ('THY-CONTINUITY-WATCHDOG-001','Active parallel workstreams',
   'A workstream active at a restart point is still carried afterwards. A lane may be closed deliberately and said so. It may not disappear.'),
  ('THY-VOICE-PROMPT-NO-SILENT-MUTATION-001','Spoken and prompt text',
   'Any change to a registered voice or prompt line must be declared. An undeclared change is a violation, because a spoken line is the part of the system nobody diffs.'),
  ('THY-MINOR-NAME-ADULT-USE-001','Protected names',
   'A protected name is reserved for declared adult use, age 18 or over. It is not given to a person under 18 in any story, example, probe, card or product.')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- THY-CONTINUITY-WATCHDOG-001
-- ---------------------------------------------------------------------------

create table if not exists thy_workstreams (
  id            text primary key,
  label         text not null,
  state         text not null check (state in ('CARRIED_UNTOUCHED','CARRIED_ADDITIVE','CARRIED_UNDER_PROTOCOL','OPENED','CLOSED_DELIBERATELY')),
  held_by       text not null,
  note          text,
  opened_at     timestamptz not null default now(),
  closed_at     timestamptz,
  closed_reason text,
  -- A workstream may only be closed with a reason. Silence is not a closure.
  constraint thy_workstream_closure_is_stated check (
    state <> 'CLOSED_DELIBERATELY' or (closed_at is not null and length(trim(coalesce(closed_reason,''))) > 0)
  )
);

insert into thy_workstreams (id, label, state, held_by, note) values
  ('WS-DASHBOARD-AUTHORITY','Chairman dashboard authority','CARRIED_UNTOUCHED','DASHBOARD_AUTHORITY.md, dashboard-baseline.json','Authority remains vyc2st-ctrl/thylora-executive-dashboard to thylora-public-world.'),
  ('WS-APP-BUILD7','THYLORA member app, Build 7 command rooms','CARRIED_ADDITIVE','app/','One navigation entry added; no existing view or script changed.'),
  ('WS-PUBLIC-SITE','THYLORA public site and storefront','CARRIED_UNTOUCHED','public-site/',null),
  ('WS-RAELINK','RAE Link owned media network','CARRIED_UNTOUCHED','rae-link/, db/rae-link/, WR-RAELINK-001','48 existing tests continue to pass unchanged.'),
  ('WS-TIME-RUN','Time Run room','CARRIED_UNTOUCHED','app/time-run.*',null),
  ('WS-GAME-BET','GAME-BET-001 sportsbook and casino workroom','CARRIED_UNTOUCHED','app/sports-betting.*',null),
  ('WS-SPINE-VOICE','SPINE FORWARD voice command spine','CARRIED_UNDER_PROTOCOL','app/index.html','Voice text governed by THY-VOICE-PROMPT-NO-SILENT-MUTATION-001.'),
  ('WS-FAMILY-STORY','Family Story archive and Story Studio','CARRIED_UNTOUCHED','app/index.html, db/rae-link/0007_family_partnership.sql',null),
  ('WS-MATH-SURFACE','THYLORA mathematics surface layer (L × M × S)','OPENED','math-surface/, db/math-surface/, WR-MATH-SURFACE-001','Opened 2026-09-18.')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- THY-VOICE-PROMPT-NO-SILENT-MUTATION-001
-- ---------------------------------------------------------------------------

create table if not exists thy_voice_lines (
  id            text primary key,
  role          text not null check (role in ('learner','family','teacher','system')),
  text          text not null,
  digest        text not null,
  surface       text,
  registered_at timestamptz not null default now()
);

create table if not exists thy_voice_mutations (
  id            uuid primary key default gen_random_uuid(),
  line_id       text not null,
  kind          text not null check (kind in ('ADDED','CHANGED','REMOVED')),
  from_text     text,
  to_text       text,
  reason        text not null check (length(trim(reason)) > 0),
  declared_by   text not null check (length(trim(declared_by)) > 0),
  declared_at   timestamptz not null default now()
);

-- A registered line cannot be changed in place. Changing the text means
-- recording the change first; that is what "no silent mutation" means.
create or replace function thy_voice_line_change_must_be_declared()
returns trigger language plpgsql as $$
begin
  if tg_op = 'DELETE' then
    if not exists (select 1 from thy_voice_mutations m where m.line_id = old.id and m.kind = 'REMOVED') then
      raise exception 'THY-VOICE-PROMPT-NO-SILENT-MUTATION-001: removing voice line % requires a declared mutation', old.id
        using errcode = 'restrict_violation';
    end if;
    return old;
  end if;

  if new.text is distinct from old.text then
    if not exists (
      select 1 from thy_voice_mutations m
      where m.line_id = old.id and m.kind = 'CHANGED' and m.to_text = new.text
    ) then
      raise exception 'THY-VOICE-PROMPT-NO-SILENT-MUTATION-001: changing voice line % requires a declared mutation naming the new text', old.id
        using errcode = 'restrict_violation';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists thy_voice_lines_declared on thy_voice_lines;
create trigger thy_voice_lines_declared
  before update or delete on thy_voice_lines
  for each row execute function thy_voice_line_change_must_be_declared();

-- ---------------------------------------------------------------------------
-- THY-MINOR-NAME-ADULT-USE-001
-- ---------------------------------------------------------------------------

create table if not exists thy_protected_names (
  name          text primary key,
  reserved_for  text not null default 'DECLARED_ADULT_USE',
  minimum_age   integer not null default 18 check (minimum_age >= 18),
  note          text,
  created_at    timestamptz not null default now()
);

insert into thy_protected_names (name, note) values
  ('Daniel','Not used for any person under 18 in a story or person example, on any surface, in any product candidate.')
on conflict (name) do nothing;

create table if not exists thy_protected_name_adult_uses (
  id            uuid primary key default gen_random_uuid(),
  name          text not null references thy_protected_names(name),
  context       text not null,
  age           integer not null,
  declared_by   text not null,
  declared_at   timestamptz not null default now(),
  constraint thy_adult_use_is_adult check (age >= 18)
);

-- Returns true when a piece of text may be published under the protocol.
create or replace function thy_math_name_rule_ok(p_text text, p_adult_use_id uuid default null)
returns boolean language sql stable as $$
  select case
    when p_text is null then true
    when not exists (
      select 1 from thy_protected_names n
      where p_text ~* ('\m' || n.name || '\M')
    ) then true
    when p_adult_use_id is null then false
    else exists (select 1 from thy_protected_name_adult_uses u where u.id = p_adult_use_id and u.age >= 18)
  end;
$$;

comment on function thy_math_name_rule_ok is
  'THY-MINOR-NAME-ADULT-USE-001: text carrying a protected name passes only against a declared adult use of age 18 or over.';

commit;
