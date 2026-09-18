-- ============================================================================
-- PUBLIC QUESTION RADAR (PQR) · 0001 · core tables
-- Workstream: PUBLIC_QUESTION_RADAR
-- Backend of record: thylora-dash (jvsdxhrfhtlgaknhjxlz)
--
-- Purpose: detect repeated public questions and problems, check the evidence
-- under them, find where THYLORA can answer better, and route original
-- investigations, tools, stories and products. We do not copy creators.
--
-- Rules held in this schema:
--   * Additive only. Every object is new and prefixed thylora_pqr_.
--   * No second source of truth. Products, stories, concepts, gaps and news
--     stay where they already live; PQR holds soft text references.
--   * Virality is not truth. Reach is stored as metadata on a signal and is
--     structurally excluded from scoring.
--   * O = R x Q x E x U x P is multiplicative, so any zero factor kills the
--     candidate. A question with no evidence cannot score.
--   * No publishing in v1. The opportunity state domain contains no published
--     value. Publishing requires a later migration and a Chairman decision.
-- ============================================================================

-- 1 ---------------------------------------------------------------- sources
create table if not exists public.thylora_pqr_sources (
  source_code          text primary key,
  source_name          text not null,
  source_class         text not null check (source_class in (
                         'NEWS','SEARCH_TREND','PUBLIC_SOCIAL','FORUM',
                         'CREATOR_COMMENT_PATTERN','PARENT_QUESTION',
                         'TEACHER_QUESTION','CONSUMER_COMPLAINT',
                         'SCIENCE_HISTORY_CURIOSITY','SPORTS_QUESTION',
                         'BUSINESS_QUESTION','VENDOR_CONTENT','ACADEMIC',
                         'SURVEY_REPORT')),
  access_method        text not null default 'MANUAL_OBSERVATION'
                         check (access_method in ('PUBLIC_WEB','PUBLIC_API',
                         'MANUAL_OBSERVATION','PARTNER_FEED')),
  rights_posture       text not null default 'OBSERVE_PARAPHRASE_ONLY'
                         check (rights_posture in ('OBSERVE_PARAPHRASE_ONLY',
                         'QUOTE_WITH_ATTRIBUTION','LICENSED','RESTRICTED')),
  commercial_interest  text,
  collection_state     text not null default 'DECLARED'
                         check (collection_state in ('DECLARED','MANUAL',
                         'AUTOMATED','PAUSED','RETIRED')),
  cadence              text,
  evidence             jsonb not null default '{}'::jsonb,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

comment on column public.thylora_pqr_sources.commercial_interest is
  'Who profits from what this source says. Recorded so an evidence check can weigh it.';

-- 2 ---------------------------------------------------------------- signals
create table if not exists public.thylora_pqr_signals (
  signal_id            uuid primary key default gen_random_uuid(),
  source_code          text not null references public.thylora_pqr_sources(source_code),
  observed_at          timestamptz not null default now(),
  observed_window      text,
  question_as_observed text not null,
  paraphrased          boolean not null default true,
  verbatim_quote       text,
  attribution          text,
  observed_url         text,
  audience             text,
  region               text not null default 'US',
  reach_note           text,
  capture_method       text not null default 'MANUAL_OBSERVATION',
  notes                text,
  created_at           timestamptz not null default now(),
  constraint thylora_pqr_signal_quote_needs_attribution
    check (verbatim_quote is null or attribution is not null),
  constraint thylora_pqr_signal_lift_needs_attribution
    check (paraphrased or attribution is not null)
);

comment on column public.thylora_pqr_signals.question_as_observed is
  'THYLORA paraphrase of the public question. Never a lift of creator wording.';
comment on column public.thylora_pqr_signals.reach_note is
  'Popularity metadata only. Never an input to O. Virality is not truth.';

create index if not exists thylora_pqr_signals_source_idx
  on public.thylora_pqr_signals (source_code, observed_at desc);

-- 3 -------------------------------------------------------- question clusters
create table if not exists public.thylora_pqr_question_clusters (
  cluster_code           text primary key,
  cluster_question       text not null,
  domain                 text not null,
  audience               text not null,
  first_observed_at      timestamptz,
  last_observed_at       timestamptz,
  recurrence_basis       text not null default 'UNMEASURED'
                           check (recurrence_basis in ('UNMEASURED',
                           'PRIOR_KNOWLEDGE','OBSERVED_SAMPLE','MEASURED_FEED')),
  distinct_source_count  integer not null default 0,
  signal_count           integer not null default 0,
  recurrence_window_days integer,
  state                  text not null default 'OPEN'
                           check (state in ('OPEN','SCORED','ROUTED','PARKED',
                           'CLOSED_NO_GAP','CLOSED_NOT_OURS')),
  state_reason           text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

comment on column public.thylora_pqr_question_clusters.cluster_question is
  'THYLORA own formulation of the question under the noise, not a quoted headline.';

-- 4 ----------------------------------------------------------- cluster links
create table if not exists public.thylora_pqr_cluster_signals (
  cluster_code text not null references public.thylora_pqr_question_clusters(cluster_code) on delete cascade,
  signal_id    uuid not null references public.thylora_pqr_signals(signal_id) on delete cascade,
  added_at     timestamptz not null default now(),
  primary key (cluster_code, signal_id)
);

-- 5 --------------------------------------------------------- evidence checks
create table if not exists public.thylora_pqr_evidence_checks (
  check_id                 uuid primary key default gen_random_uuid(),
  cluster_code             text not null references public.thylora_pqr_question_clusters(cluster_code) on delete cascade,
  claim_examined           text not null,
  claim_class              text not null check (claim_class in ('STATISTIC',
                             'CAUSAL','DEFINITIONAL','HISTORICAL','PRODUCT','POLICY')),
  evidence_state           text not null check (evidence_state in ('SETTLED',
                             'CONTESTED','THIN','ABSENT','MISREPORTED',
                             'STALE_RECIRCULATED')),
  what_is_known            text not null,
  what_is_unknown          text not null,
  primary_source_found     boolean not null default false,
  primary_source_refs      jsonb not null default '[]'::jsonb,
  recirculated_refs        jsonb not null default '[]'::jsonb,
  source_commercial_interest text,
  sample_description       text,
  source_date              text,
  confidence               text not null default 'LOW'
                             check (confidence in ('LOW','MEDIUM','HIGH')),
  checked_at               timestamptz not null default now(),
  checker                  text not null default 'PQR',
  notes                    text,
  constraint thylora_pqr_high_confidence_needs_primary_source
    check (confidence <> 'HIGH' or primary_source_found)
);

create index if not exists thylora_pqr_evidence_cluster_idx
  on public.thylora_pqr_evidence_checks (cluster_code);

-- 6 ------------------------------------------------------------ THYLORA gap
create table if not exists public.thylora_pqr_gap_findings (
  gap_code                   text primary key,
  cluster_code               text not null references public.thylora_pqr_question_clusters(cluster_code) on delete cascade,
  gap_statement              text not null,
  gap_class                  text not null check (gap_class in (
                               'NO_PLAIN_ANSWER','STALE_NUMBER_REPEATED',
                               'VENDOR_FRAMED','MISSING_TOOL','MISSING_EVIDENCE',
                               'WRONG_QUESTION_ASKED','HARDER_QUESTION_UNASKED')),
  why_thylora_can_answer     text not null,
  existing_thylora_asset_refs jsonb not null default '[]'::jsonb,
  gap_intelligence_ref       text,
  state                      text not null default 'OPEN'
                               check (state in ('OPEN','ROUTED','CLOSED')),
  created_at                 timestamptz not null default now()
);

comment on column public.thylora_pqr_gap_findings.gap_intelligence_ref is
  'Soft reference to thylora_gap_intelligence_registry.gap_serial. Not a foreign key.';

-- 7 ------------------------------------------------- scores  O = R*Q*E*U*P
create table if not exists public.thylora_pqr_scores (
  score_id                uuid primary key default gen_random_uuid(),
  cluster_code            text not null references public.thylora_pqr_question_clusters(cluster_code) on delete cascade,
  scored_at               timestamptz not null default now(),
  r_recurrence            smallint not null check (r_recurrence between 0 and 5),
  q_question_quality      smallint not null check (q_question_quality between 0 and 5),
  e_evidence_availability smallint not null check (e_evidence_availability between 0 and 5),
  u_usefulness            smallint not null check (u_usefulness between 0 and 5),
  p_product_potential     smallint not null check (p_product_potential between 0 and 5),
  opportunity_score       integer generated always as (
                            r_recurrence::int * q_question_quality::int
                            * e_evidence_availability::int * u_usefulness::int
                            * p_product_potential::int) stored,
  score_band              text generated always as (
                            case
                              when r_recurrence::int * q_question_quality::int * e_evidence_availability::int * u_usefulness::int * p_product_potential::int = 0 then 'DEAD'
                              when r_recurrence::int * q_question_quality::int * e_evidence_availability::int * u_usefulness::int * p_product_potential::int < 100 then 'LOW'
                              when r_recurrence::int * q_question_quality::int * e_evidence_availability::int * u_usefulness::int * p_product_potential::int < 500 then 'WATCH'
                              when r_recurrence::int * q_question_quality::int * e_evidence_availability::int * u_usefulness::int * p_product_potential::int < 1500 then 'BUILD'
                              else 'PRIORITY'
                            end) stored,
  r_basis                 text not null,
  q_basis                 text not null,
  e_basis                 text not null,
  u_basis                 text not null,
  p_basis                 text not null,
  basis_class             text not null default 'PROVISIONAL'
                            check (basis_class in ('PROVISIONAL','OBSERVED','MEASURED')),
  virality_excluded       boolean not null default true,
  virality_note           text,
  superseded              boolean not null default false,
  constraint thylora_pqr_virality_is_not_truth check (virality_excluded)
);

comment on constraint thylora_pqr_virality_is_not_truth on public.thylora_pqr_scores is
  'Reach may never be a scoring input. A row asserting otherwise cannot be stored.';

create index if not exists thylora_pqr_scores_cluster_idx
  on public.thylora_pqr_scores (cluster_code, scored_at desc);

-- 8 ------------------------------------------------------------ opportunities
create table if not exists public.thylora_pqr_opportunities (
  opportunity_code   text primary key,
  cluster_code       text not null references public.thylora_pqr_question_clusters(cluster_code) on delete cascade,
  output_class       text not null check (output_class in ('INVESTIGATION',
                       'ERSATZREALITY_STORY','THYLORA_TOOL','STORE_PRODUCT',
                       'SHOW','NEWSPAPER')),
  title              text not null,
  description        text not null,
  originality_basis  text not null,
  audience           text,
  effort_class       text check (effort_class in ('SMALL','MEDIUM','LARGE')),
  revenue_path       text,
  target_registry    text,
  target_ref         text,
  state              text not null default 'CANDIDATE'
                       check (state in ('CANDIDATE','ACCEPTED','IN_BUILD',
                       'HELD_NO_PUBLISH','REJECTED')),
  state_reason       text,
  blockers           jsonb not null default '[]'::jsonb,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

comment on table public.thylora_pqr_opportunities is
  'Routed outputs. The state domain deliberately contains no published value: publishing is out of scope for v1 and needs a later migration plus a Chairman decision.';
comment on column public.thylora_pqr_opportunities.originality_basis is
  'Why this output is THYLORA original work rather than a restatement of a creator. Required, not nullable.';

-- 9 -------------------------------------------------------- originality gate
create table if not exists public.thylora_pqr_originality_gate (
  gate_id                  uuid primary key default gen_random_uuid(),
  opportunity_code         text not null references public.thylora_pqr_opportunities(opportunity_code) on delete cascade,
  evaluated_at             timestamptz not null default now(),
  question_is_public       boolean not null default false,
  no_creator_work_reused   boolean not null default false,
  independent_evidence_path boolean not null default false,
  distinct_thylora_angle   text,
  named_creator_influences jsonb not null default '[]'::jsonb,
  verdict                  text not null default 'BLOCKED'
                             check (verdict in ('PASS','BLOCKED')),
  blockers                 jsonb not null default '[]'::jsonb
);

comment on table public.thylora_pqr_originality_gate is
  'We do not copy creators. A candidate passes only when the question is public, no creator work is reused, an independent evidence path exists, and a distinct THYLORA angle is stated.';

-- 10 ------------------------------------------------------------- daily board
create table if not exists public.thylora_pqr_boards (
  board_code       text primary key,
  board_date       date not null,
  board_class      text not null default 'DAILY'
                     check (board_class in ('SEED_CANDIDATE','DAILY','WEEKLY')),
  generated_at     timestamptz not null default now(),
  generated_by     text not null default 'PQR',
  summary          text,
  evidence_posture text not null,
  state            text not null default 'DRAFT'
                     check (state in ('DRAFT','REVIEWED','ARCHIVED')),
  unique (board_date, board_class)
);

comment on column public.thylora_pqr_boards.evidence_posture is
  'Plain statement of how far the evidence on this board actually goes, so a reader is never left to assume it is measured.';

create table if not exists public.thylora_pqr_board_rows (
  board_code              text not null references public.thylora_pqr_boards(board_code) on delete cascade,
  row_order               integer not null,
  cluster_code            text not null references public.thylora_pqr_question_clusters(cluster_code),
  what_people_are_asking  text not null,
  why_it_matters          text not null,
  what_evidence_exists    text not null,
  what_is_unknown         text not null,
  ersatzreality_story     text,
  thylora_tool            text,
  store_product           text,
  show_possibility        text,
  opportunity_score       integer,
  score_band              text,
  primary key (board_code, row_order)
);
