-- RAE LINK · 0007 · Family Story Partnership / GiveForward Studio
-- Workroom: WR-RAELINK-001
--
-- SAFEGUARDS ENFORCED IN SCHEMA:
--   1. Participation is voluntary and the storytelling mode is the family's choice.
--   2. Minimum necessary information. No medical field exists here.
--   3. Children require guardian authority (inherited from rael_consents).
--   4. Beneficiary percentage is explicit and must be declared BEFORE publication.
--   5. No hidden percentage: the declared share is published with the story.

begin;

create table if not exists rael_family_partnerships (
  id                    uuid primary key default gen_random_uuid(),
  partnership_code      text not null unique,
  family_label          text not null,
  -- Soft link to the existing family_story_archives record, if one exists.
  story_archive_ref     text,
  channel_id            uuid references rael_channels(id) on delete set null,
  consent_id            uuid not null references rael_consents(id) on delete restrict,
  storytelling_mode     rael_storytelling_mode not null default 'PRIVATE',
  beneficiary_ref       text not null,
  beneficiary_share_bp  integer not null check (beneficiary_share_bp between 1 and 10000),
  split_policy_id       uuid references rael_split_policies(id),
  purpose_statement     text not null,
  declared_at           timestamptz not null default now(),
  published_at          timestamptz,
  withdrawn_at          timestamptz,
  partnership_state     text not null default 'DECLARED'
                        check (partnership_state in
                          ('DECLARED','ACTIVE','PAUSED','WITHDRAWN','COMPLETED')),
  evidence              jsonb not null default '{}'::jsonb,
  -- The share must exist before anything is published under it.
  constraint rael_partnership_declared_before_publication
    check (published_at is null or declared_at <= published_at)
);

create table if not exists rael_partnership_assets (
  partnership_id uuid not null references rael_family_partnerships(id) on delete cascade,
  asset_id       uuid not null references rael_media_assets(id) on delete cascade,
  attached_at    timestamptz not null default now(),
  primary key (partnership_id, asset_id)
);

-- Explicit, reviewable list of what a partnership may never require. Stored as
-- data so the rule is visible in the product, not only in a document.
create table if not exists rael_partnership_prohibitions (
  code        text primary key,
  statement   text not null
);

insert into rael_partnership_prohibitions (code, statement) values
  ('NO_MEDICAL_DISCLOSURE',   'A family is never required to disclose a diagnosis, condition, prognosis, treatment or medical record to participate.'),
  ('NO_ILLNESS_EXPLOITATION', 'Illness, grief or hardship is never used as a promotional hook, thumbnail device or engagement tactic.'),
  ('NO_SENSATIONALISM',       'Story presentation must not dramatize suffering beyond what the family agreed to tell.'),
  ('NO_FORCED_PUBLICITY',     'A family may participate privately, pseudonymously, in limited form, or publicly, and may change mode going forward.'),
  ('NO_DIAGNOSIS',            'RAE Link does not diagnose, assess, predict or advise on any medical matter.'),
  ('NO_PERSUASION',           'No political, religious or ideological persuasion may be attached as a condition of help.'),
  ('NO_HIDDEN_PERCENTAGE',    'The beneficiary percentage is declared before publication and shown with the story and in every statement.'),
  ('NO_GUARDIAN_BYPASS',      'A child participant requires recorded guardian authority. There is no exception path.')
on conflict (code) do nothing;

-- A partnership cannot be published while its beneficiary share is undeclared or
-- its consent has been revoked.
create or replace function rael_guard_partnership_publication() returns trigger
language plpgsql as $$
declare revoked timestamptz;
begin
  if new.published_at is not null then
    select revoked_at into revoked from rael_consents where id = new.consent_id;
    if revoked is not null then
      raise exception 'RAE LINK: consent % is revoked; partnership cannot be published', new.consent_id;
    end if;
    if new.beneficiary_share_bp is null or new.beneficiary_share_bp < 1 then
      raise exception 'RAE LINK: beneficiary share must be declared before publication';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists rael_partnership_publication_guard on rael_family_partnerships;
create trigger rael_partnership_publication_guard
  before insert or update on rael_family_partnerships
  for each row execute function rael_guard_partnership_publication();

commit;
