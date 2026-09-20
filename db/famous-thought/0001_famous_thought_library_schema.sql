-- THY-WORK-COMPLETE-QUOTE-LIBRARY-561 : Famous Thought library schema
-- Companion tables for the existing thylora_famous_thought_* registries.
-- Nothing here duplicates the registry, the gate table or the publication map.
-- Source query: THY-Q-20260920-COMPLETE-QUOTE-LIBRARY-561 (carryforward sequence 561)

create table if not exists thylora_famous_thought_theme_registry (
  theme_code text primary key,
  label      text not null,
  created_at timestamptz not null default now()
);

create table if not exists thylora_famous_thought_themes (
  thought_id text not null references thylora_famous_thought_registry(thought_id),
  theme_code text not null references thylora_famous_thought_theme_registry(theme_code),
  authority  text not null default 'THYLORA_ANALYSIS',
  source_ref text not null,
  created_at timestamptz not null default now(),
  primary key (thought_id, theme_code)
);

-- PEOPLE IN TIME. One row per accepted thought. Every column is required except
-- the open-uncertainty note, because a thought that cannot answer these is not
-- allowed to be published as a card.
create table if not exists thylora_famous_thought_people_in_time (
  thought_id            text primary key references thylora_famous_thought_registry(thought_id),
  person_name           text not null,
  problem_faced         text not null,
  what_they_knew        text not null,
  what_they_could_not_know text not null,
  historical_context    text not null,
  reasoning_rule        text not null,
  where_the_rule_fails  text not null,
  transfer_today        text not null,
  authority             text not null default 'THYLORA_ANALYSIS',
  source_ref            text not null,
  semver                text not null default '1.0.0',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- MATH BINDING. Foreign key to the equation registry, so a thought can never be
-- bound to an equation whose variables have not been authoritatively recovered.
create table if not exists thylora_famous_thought_math_bindings (
  thought_id   text not null references thylora_famous_thought_registry(thought_id),
  equation_id  text not null references thylora_math_equation_registry(equation_id),
  binding_note text not null,
  authority    text not null default 'THYLORA_ANALYSIS',
  source_ref   text not null,
  created_at   timestamptz not null default now(),
  primary key (thought_id, equation_id)
);

-- HELD / REJECTED QUOTATIONS. The registry row carries state HELD and
-- verification_state UNKNOWN or REJECTED; this table carries the dispute record.
create table if not exists thylora_famous_thought_holds (
  thought_id      text primary key references thylora_famous_thought_registry(thought_id),
  person_name     text not null,
  claimed_source  text not null,
  finding         text not null,
  evidence_urls   jsonb not null default '[]'::jsonb,
  next_step       text not null,
  authority       text not null default 'THYLORA_ANALYSIS',
  source_ref      text not null,
  created_at      timestamptz not null default now()
);

-- Row level security is enabled with no policies, exactly as the existing
-- thylora_famous_thought_* tables are configured: no anon or authenticated
-- access, service-role and Chairman paths only.
alter table thylora_famous_thought_theme_registry    enable row level security;
alter table thylora_famous_thought_themes            enable row level security;
alter table thylora_famous_thought_people_in_time    enable row level security;
alter table thylora_famous_thought_math_bindings     enable row level security;
alter table thylora_famous_thought_holds             enable row level security;

create index if not exists thylora_famous_thought_themes_theme_idx on thylora_famous_thought_themes(theme_code);
create index if not exists thylora_famous_thought_bindings_eq_idx on thylora_famous_thought_math_bindings(equation_id);

insert into thylora_famous_thought_theme_registry (theme_code,label) values
  ($q$STRUGGLE_PROGRESS$q$,$q$Struggle / Progress$q$),
  ($q$EDUCATION_LEARNING$q$,$q$Education / Learning$q$),
  ($q$QUESTIONING_CURIOSITY$q$,$q$Questioning / Curiosity$q$),
  ($q$TRUTH_EVIDENCE$q$,$q$Truth / Evidence$q$),
  ($q$INVENTION_DESIGN$q$,$q$Invention / Design$q$),
  ($q$RESPONSIBILITY$q$,$q$Responsibility$q$),
  ($q$LEADERSHIP$q$,$q$Leadership$q$),
  ($q$FAMILY_LEGACY$q$,$q$Family / Legacy$q$),
  ($q$WORK_CRAFT$q$,$q$Work / Craft$q$),
  ($q$MONEY_VALUE$q$,$q$Money / Value$q$),
  ($q$COURAGE$q$,$q$Courage$q$),
  ($q$FAILURE_RECOVERY$q$,$q$Failure / Recovery$q$),
  ($q$FREEDOM$q$,$q$Freedom$q$),
  ($q$JUSTICE$q$,$q$Justice$q$),
  ($q$SCIENCE$q$,$q$Science$q$),
  ($q$UNCERTAINTY$q$,$q$Uncertainty$q$),
  ($q$DECISION_MAKING$q$,$q$Decision-making$q$),
  ($q$CREATIVITY$q$,$q$Creativity$q$),
  ($q$DISCIPLINE$q$,$q$Discipline$q$),
  ($q$COMMUNITY_CHANGE$q$,$q$Community / Change$q$)
on conflict (theme_code) do update set label=excluded.label;

-- ---------------------------------------------------------------------------
-- READ MODEL for the existing MATH / FAMOUS THOUGHT dashboard surfaces.
-- No new top-level app. These are read-only and return only records that are
-- ACTIVE, F-gate PASS and meaning-chain PASS.
-- ---------------------------------------------------------------------------
create or replace view thylora_famous_thought_public_v1 as
select
  r.thought_id, r.person_name, r.layer, r.quote_excerpt,
  r.source_title, r.source_url, r.source_context, r.source_class, r.verification_state,
  r.transfer_question, r.rights_note,
  p.public_question, p.tension, p.evidence_prompt, p.connection_prompt, p.action_prompt,
  p.destination_type, p.destination_ref,
  g.source_score, g.attribution_score, g.context_score, g.transfer_score,
  g.equation_score as f_score, g.minimum_factor, g.gate_state as f_gate_state,
  coalesce((select array_agg(t.theme_code order by t.theme_code)
            from thylora_famous_thought_themes t where t.thought_id=r.thought_id),'{}') as themes,
  coalesce((select array_agg(b.equation_id order by b.equation_id)
            from thylora_famous_thought_math_bindings b where b.thought_id=r.thought_id),'{}') as equations,
  (pt.thought_id is not null) as people_in_time_present
from thylora_famous_thought_registry r
join thylora_famous_thought_gate_evaluations g on g.thought_id=r.thought_id and g.gate_state='PASS'
join thylora_famous_thought_publication_map p on p.thought_id=r.thought_id and p.meaning_gate_state='PASS'
left join thylora_famous_thought_people_in_time pt on pt.thought_id=r.thought_id
where r.state='ACTIVE' and r.verification_state in ('VERIFIED_SOURCE','VERIFIED_INSTITUTIONAL');

create or replace function thylora_famous_thought_card_v1(p_thought_id text)
returns jsonb language sql stable set search_path to 'public' as $fn$
  select case when v.thought_id is null then
      jsonb_build_object('found',false,'thought_id',p_thought_id,
        'reason','No public-ready record with that id. UNKNOWN remains UNKNOWN; no card was invented.')
    else jsonb_build_object(
      'found',true,
      'person', v.person_name,
      'thought', v.quote_excerpt,
      'why_it_mattered_then', pt.historical_context,
      'tension', v.tension,
      'the_question_it_opens', v.public_question,
      'what_evidence_would_matter', v.evidence_prompt,
      'what_it_connects_to', v.connection_prompt,
      'what_you_can_do_next', v.action_prompt,
      'thylora_destination', jsonb_build_object('type',v.destination_type,'ref',v.destination_ref),
      'source', jsonb_build_object('title',v.source_title,'url',v.source_url,'class',v.source_class,
                                   'context',v.source_context,'verification',v.verification_state,
                                   'rights',v.rights_note),
      'math_connection', to_jsonb(v.equations),
      'themes', to_jsonb(v.themes),
      'people_in_time', case when pt.thought_id is null then null else jsonb_build_object(
          'problem_faced',pt.problem_faced,'what_they_knew',pt.what_they_knew,
          'what_they_could_not_know',pt.what_they_could_not_know,
          'historical_context',pt.historical_context,'reasoning_rule',pt.reasoning_rule,
          'where_the_rule_fails',pt.where_the_rule_fails,'transfer_today',pt.transfer_today) end,
      'f_gate', jsonb_build_object('S',v.source_score,'A',v.attribution_score,'C',v.context_score,
                                   'T',v.transfer_score,'F',v.f_score,'state',v.f_gate_state),
      'publication_state','DRAFT_NOT_PUBLISHED')
    end
  from (select p_thought_id as id) k
  left join thylora_famous_thought_public_v1 v on v.thought_id=k.id
  left join thylora_famous_thought_people_in_time pt on pt.thought_id=k.id;
$fn$;

create or replace function thylora_famous_thought_library_v1(p_theme text default null, p_person text default null)
returns jsonb language sql stable set search_path to 'public' as $fn$
  select jsonb_build_object(
    'generated_at', now(),
    'filter', jsonb_build_object('theme',p_theme,'person',p_person),
    'count', count(*),
    'records', coalesce(jsonb_agg(jsonb_build_object(
        'thought_id',v.thought_id,'person',v.person_name,'thought',v.quote_excerpt,
        'themes',to_jsonb(v.themes),'equations',to_jsonb(v.equations),
        'question',v.public_question,'destination',v.destination_ref,
        'source_class',v.source_class,'f_score',v.f_score) order by v.person_name),'[]'::jsonb))
  from thylora_famous_thought_public_v1 v
  where (p_theme is null or p_theme = any(v.themes))
    and (p_person is null or v.person_name ilike '%'||p_person||'%');
$fn$;

-- TODAY'S THOUGHT. Deterministic for a given date so the dashboard and any
-- readback agree on what "today" showed.
create or replace function thylora_famous_thought_today_v1(p_date date default current_date)
returns jsonb language sql stable set search_path to 'public' as $fn$
  select thylora_famous_thought_card_v1(thought_id)
  from (select v.thought_id, row_number() over (order by v.thought_id) as rn,
               count(*) over () as n
        from thylora_famous_thought_public_v1 v) s
  where s.rn = 1 + (((p_date - date '2026-09-20')::int % s.n) + s.n) % s.n;
$fn$;

create or replace function thylora_famous_thought_random_v1()
returns jsonb language sql volatile set search_path to 'public' as $fn$
  select thylora_famous_thought_card_v1(v.thought_id)
  from thylora_famous_thought_public_v1 v order by random() limit 1;
$fn$;

-- Dashboard header counters, including the held set, so the surface can show
-- rejections as a result rather than hiding them.
create or replace function thylora_famous_thought_dashboard_v1()
returns jsonb language sql stable set search_path to 'public' as $fn$
  select jsonb_build_object(
    'generated_at', now(),
    'lane','SYSTEM-FAMOUS-THOUGHT-001',
    'public_ready', (select count(*) from thylora_famous_thought_public_v1),
    'registered', (select count(*) from thylora_famous_thought_registry),
    'held_or_rejected', (select count(*) from thylora_famous_thought_registry where state='HELD'),
    'themes_covered', (select count(distinct theme_code) from thylora_famous_thought_themes),
    'themes_total', (select count(*) from thylora_famous_thought_theme_registry),
    'people', (select count(distinct person_name) from thylora_famous_thought_public_v1),
    'people_in_time_complete', (select count(*) from thylora_famous_thought_people_in_time),
    'equations_bound', (select count(distinct equation_id) from thylora_famous_thought_math_bindings),
    'today', thylora_famous_thought_today_v1(),
    'publication_state','DRAFT_ONLY_NO_CHAIRMAN_APPROVAL_TO_PUBLISH');
$fn$;

