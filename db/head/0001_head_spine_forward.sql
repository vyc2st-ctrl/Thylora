-- HEAD · 0001 · Spine Forward: MIRROR LINE, the house company, made-to-measure, restaurant partners
-- Workroom: WR-HEAD-001. Additive only. Every object is new and prefixed head_.
-- Soft references (text *_ref) into RAE Link and existing registries; nothing is duplicated:
--   family share  -> rael_family_partnerships / rael_split_policies (already exist)
--   media/publish -> rael_media_assets (already exists)

begin;

-- ── 1. MIRROR LINE: the show and its editorial standard ──────────────────────
create table if not exists head_shows (
  show_code      text primary key,
  display_name   text not null,
  tagline        text not null,
  rael_channel_ref text,
  created_at     timestamptz not null default now()
);
insert into head_shows (show_code, display_name, tagline) values
  ('MIRROR_LINE', 'MIRROR LINE', 'Our place first. Then the mirror. Context on every number.')
on conflict (show_code) do nothing;

create table if not exists head_editorial_rules (
  code text primary key, statement text not null
);
insert into head_editorial_rules (code, statement) values
  ('NO_OPINION',          'The reporter does not give an opinion on air.'),
  ('NO_SIDES',            'The show does not take a side. Every party is asked the same kind of question.'),
  ('NO_PRESUMED_GUILT',   'No question assumes guilt that evidence has not established.'),
  ('NO_SLIDE_WORDS',      'No adjective tells the viewer what to feel.'),
  ('NO_INFERENCE_AS_FACT','Inference is labelled as inference.'),
  ('CONTEXT_ON_NUMBERS',  'No number airs without source, base, period and comparison.'),
  ('OUR_PLACE_FIRST',     'Mississippi is reported first, good and bad, before any comparison.'),
  ('FAMILY_IS_A_PARTNER', 'A family is a collaborator, never a prop. Their share is declared before publication.'),
  ('NAME_THE_PROPAGANDA', 'When a claim is propaganda, the show names the technique and shows the missing context.')
on conflict (code) do nothing;

create table if not exists head_stories (
  id               uuid primary key default gen_random_uuid(),
  show_code        text not null references head_shows(show_code),
  story_code       text not null unique,
  working_title    text not null,
  place            text not null,
  family_partnership_ref text,           -- rael_family_partnerships.partnership_code
  story_state      text not null default 'OUTREACH'
                   check (story_state in ('OUTREACH','FAMILY_REVIEW','RESEARCH','PRODUCTION','REVIEW','PUBLISHED','PAUSED','WITHDRAWN')),
  created_at       timestamptz not null default now()
);

-- Numbers cannot be stored without their context.
create table if not exists head_story_numbers (
  id          uuid primary key default gen_random_uuid(),
  story_id    uuid not null references head_stories(id) on delete cascade,
  claim       text not null,
  value       numeric not null,
  source      text not null check (length(trim(source)) > 0),
  base        text not null check (length(trim(base)) > 0),
  period      text not null check (length(trim(period)) > 0),
  comparison  text not null check (length(trim(comparison)) > 0)
);

-- Team introductions sent to a family before anything else happens.
create table if not exists head_outreach (
  id             uuid primary key default gen_random_uuid(),
  story_id       uuid not null references head_stories(id) on delete cascade,
  recipient_label text not null,
  invited_role   text not null default 'CO_PRODUCER'
                 check (invited_role in ('CO_PRODUCER','ADVISOR','CONTRIBUTOR')),
  team_intro     jsonb not null check (jsonb_typeof(team_intro) = 'array' and jsonb_array_length(team_intro) >= 1),
  approved_by_chairman_at timestamptz,
  sent_at        timestamptz,
  response       text check (response in ('YES','NO','LATER') or response is null),
  constraint head_outreach_approved_before_send check (sent_at is null or approved_by_chairman_at is not null)
);

-- ── 2. The house company and its branches ────────────────────────────────────
create table if not exists head_companies (
  company_code text primary key,
  display_name text,                    -- name pending Chairman decision
  name_state   text not null default 'PENDING' check (name_state in ('PENDING','CHOSEN'))
);
insert into head_companies (company_code) values ('HOUSE') on conflict do nothing;

create table if not exists head_branches (
  branch_code  text primary key,
  company_code text not null references head_companies(company_code),
  display_name text not null,
  lead_ref     text,                    -- one of the five/six principals
  purpose      text not null
);
insert into head_branches (branch_code, company_code, display_name, purpose) values
  ('HEADWEAR',   'HOUSE', 'Headwear',             'Nightcaps and caps, made to the head.'),
  ('APPAREL',    'HOUSE', 'Made-to-measure apparel','Shirts and dress shirts cut to the body and fit preference.'),
  ('STORY',      'HOUSE', 'Story & media',        'MIRROR LINE, children''s books, animated stories.'),
  ('PLAY',       'HOUSE', 'Toys & characters',    'Characters and toys that wear the house products.'),
  ('HOSPITALITY','HOUSE', 'Restaurant partners',  'Turnaround partnerships with restaurants that need help.'),
  ('MAKERS',     'HOUSE', 'Licensed makers',      'Vetted, licensed manufacturers. Nothing made before it is paid for.')
on conflict (branch_code) do nothing;

-- Brand rules: every image connects back to the same world.
create table if not exists head_brand_rules (
  code text primary key, statement text not null
);
insert into head_brand_rules (code, statement) values
  ('OUR_MOON',  'Only our moon appears. Never Earth''s moon. Nothing drawn inside it.'),
  ('OUR_TREE',  'Any tree is our tree, the same tree as on the sample.'),
  ('BLUE_MARK', 'Every product carries something blue — a partial line, not all the way around.'),
  ('SILHOUETTE','The character face is a silhouette with a small visible smile; features are not shown.'),
  ('LOGO_ON_BRIM','The little logo and the name sit on the front fold of the brim, readable.')
on conflict (code) do nothing;

-- ── 3. Made to measure ───────────────────────────────────────────────────────
create table if not exists head_fit_profiles (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null default auth.uid(),
  wearer        text not null check (wearer in ('WOMAN','MAN','CHILD','BABY')),
  head_readings_mm integer[] not null,
  head_photo_ref text not null,
  chest_mm integer, waist_mm integer, body_length_mm integer, sleeve_mm integer,
  fit_preference text check (fit_preference in ('TIGHT','SNUG','REGULAR','RELAXED','BAGGY')),
  created_at    timestamptz not null default now(),
  constraint head_fit_two_readings check (cardinality(head_readings_mm) >= 2),
  constraint head_fit_human_range  check (300 <= all(head_readings_mm) and 660 >= all(head_readings_mm))
);

create table if not exists head_production_runs (
  id              uuid primary key default gen_random_uuid(),
  branch_code     text not null references head_branches(branch_code),
  maker_ref       text not null,
  maker_licence_ref text not null,
  maker_minimum   integer not null check (maker_minimum > 0),
  paid_preorders  integer not null default 0 check (paid_preorders >= 0),
  run_cost_minor  bigint not null check (run_cost_minor >= 0),
  cash_on_hand_minor bigint not null default 0,
  released_at     timestamptz,
  constraint head_run_paid_before_made check (
    released_at is null or (paid_preorders >= maker_minimum and cash_on_hand_minor >= run_cost_minor))
);

-- ── 4. Restaurant partners ───────────────────────────────────────────────────
create table if not exists head_restaurant_partners (
  id                 uuid primary key default gen_random_uuid(),
  business_label     text not null,
  baseline_monthly_minor bigint not null check (baseline_monthly_minor >= 0),
  fee_on_lift_bp     integer not null check (fee_on_lift_bp between 0 and 5000),
  standards_signed_at timestamptz,
  open_to_whole_neighborhood boolean not null default true check (open_to_whole_neighborhood),
  partner_state      text not null default 'ASSESSING'
                     check (partner_state in ('ASSESSING','ACTIVE','GRADUATED','ENDED'))
);

create or replace function head_turnaround_fee(baseline bigint, after_amount bigint, rate_bp integer)
returns bigint language sql immutable as $$
  select round(greatest(0, after_amount - baseline) * rate_bp / 10000.0)::bigint
$$;

-- ── RLS ───────────────────────────────────────────────────────────────────────
alter table head_fit_profiles enable row level security;
drop policy if exists head_fit_owner on head_fit_profiles;
create policy head_fit_owner on head_fit_profiles for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

do $$ declare t text; begin
  foreach t in array array['head_shows','head_editorial_rules','head_stories','head_story_numbers','head_outreach',
    'head_companies','head_branches','head_brand_rules','head_production_runs','head_restaurant_partners'] loop
    execute format('alter table %I enable row level security', t);
  end loop;
  foreach t in array array['head_shows','head_editorial_rules','head_branches','head_brand_rules'] loop
    execute format('drop policy if exists %I on %I', t || '_read', t);
    execute format('create policy %I on %I for select to anon, authenticated using (true)', t || '_read', t);
  end loop;
end $$;

commit;
