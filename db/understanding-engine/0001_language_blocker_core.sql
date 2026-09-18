-- THYLORA UNDERSTANDING ENGINE · LANGUAGE BLOCKER / MEANING RESOLVER
-- Lane: LANGUAGE_BLOCKER_RESOLVER (named in carryforward sequence 468)
-- Parent: THY-SIX-UNDERSTANDING-ENGINE-001 (sequence 467)
--
-- Additive only. Every object is new and prefixed ue_lb_.
-- No existing table is dropped, renamed or rewritten.
-- Three layers are held apart by table and by column:
--   DOCUMENTED RESEARCH     -> ue_lb_sources
--   THYLORA ANALYSIS        -> ue_lb_terms, ue_lb_senses, ue_lb_sentence_cases,
--                              ue_lb_misreading_patterns
--   PROPOSED PRODUCT DESIGN -> ue_lb_product_designs
-- ue_lb_analysis carries a layer column and may hold sections of any one layer,
-- never a blend of two.

-- ---------------------------------------------------------------- 1. SOURCES
-- DOCUMENTED RESEARCH. Verbatim retrieved material only. Nothing in this table
-- is THYLORA's own wording, and nothing written here may be paraphrased in place.
create table if not exists ue_lb_sources (
  source_code              text primary key,
  source_kind              text not null,
  jurisdiction             text,
  statement_code           text,
  academic_subject         text,
  grade_levels             jsonb not null default '[]'::jsonb,
  verbatim_text            text not null,
  retrieved_via            text not null,
  retrieved_at             timestamptz not null default now(),
  friction_terms_observed  jsonb not null default '[]'::jsonb,
  truth_state              text not null default 'VERIFIED_SOURCED',
  what_remains_unknown     text not null,
  created_at               timestamptz not null default now(),
  constraint ue_lb_sources_kind_ck check (source_kind in (
    'STANDARDS_STATEMENT','TEST_ITEM_STEM','TEXTBOOK_LINE','DIRECTION_LINE',
    'ADULT_SPEECH_OBSERVED','NEWS_LINE')),
  constraint ue_lb_sources_truth_ck check (truth_state in (
    'VERIFIED_SOURCED','CONTESTED','UNCERTAIN','UNKNOWN')),
  constraint ue_lb_sources_unknown_ck check (length(btrim(what_remains_unknown)) > 0)
);

-- ------------------------------------------------------------------ 2. TERMS
-- THYLORA ANALYSIS. One row per high-friction term. A term earns a row because
-- it changes the relation between quantities without changing its own spelling.
create table if not exists ue_lb_terms (
  term_code                text primary key,
  term                     text not null,
  term_class               text not null,
  blocker_type             text not null,
  why_high_friction        text not null,
  first_met_band           text not null,
  subjects                 jsonb not null default '[]'::jsonb,
  plain_substitute_default text not null,
  visual_model             text,
  what_remains_unknown     text not null,
  source_refs              jsonb not null default '[]'::jsonb,
  required_seed            boolean not null default false,
  state                    text not null default 'ACTIVE',
  version                  integer not null default 1,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  constraint ue_lb_terms_class_ck check (term_class in (
    'FUNCTION_WORD','COMPARISON_OPERATOR','QUANTITY_WORD','DIRECTIVE_VERB',
    'BOUND_PHRASE','RESULT_NOUN','HEDGE_WORD','EXCLUSION_WORD','BOUNDARY_PHRASE',
    'ORDER_WORD','STRUCTURE_NOUN')),
  constraint ue_lb_terms_blocker_ck check (blocker_type in (
    'SILENT_SENSE_SWITCH','INVISIBLE_RELATION','FALSE_FRIEND_EVERYDAY',
    'DIRECTION_NOT_TOPIC','BOUNDARY_INCLUSION','ORDER_CARRIER','CERTAINTY_GRADE',
    'SCOPE_AMBIGUITY')),
  constraint ue_lb_terms_state_ck check (state in ('ACTIVE','SUPERSEDED','RETIRED')),
  constraint ue_lb_terms_unknown_ck check (length(btrim(what_remains_unknown)) > 0)
);

-- ----------------------------------------------------------------- 3. SENSES
-- THYLORA ANALYSIS. The jobs one word does. This is the table that makes
-- "One Word, Five Jobs" possible; the product reads it, it does not own it.
create table if not exists ue_lb_senses (
  sense_code           text primary key,
  term_code            text not null references ue_lb_terms(term_code) on delete cascade,
  ordinal              integer not null,
  job_label            text not null,
  sense_gloss          text not null,
  relationship_created text not null,
  typical_subjects     jsonb not null default '[]'::jsonb,
  plain_substitute     text not null,
  tell_tale            text not null,
  everyday_or_school   text not null default 'SCHOOL',
  created_at           timestamptz not null default now(),
  constraint ue_lb_senses_ord_ck check (ordinal > 0),
  constraint ue_lb_senses_reg_ck check (everyday_or_school in ('EVERYDAY','SCHOOL','BOTH')),
  constraint ue_lb_senses_uq unique (term_code, ordinal)
);

-- --------------------------------------------------------- 4. SENTENCE CASES
-- THYLORA ANALYSIS. The full ten-field model instantiated against one sentence.
-- A term record without at least one sentence case is a dictionary entry, which
-- is the thing this lab exists not to build.
create table if not exists ue_lb_sentence_cases (
  case_code                 text primary key,
  term_code                 text not null references ue_lb_terms(term_code) on delete cascade,
  sense_code                text references ue_lb_senses(sense_code) on delete set null,
  subject_code              text not null,
  band_min                  text not null,
  sentence                  text not null,
  sentence_source           text not null default 'CONSTRUCTED_FOR_LAB',
  source_ref                text,
  meaning_in_this_sentence  text not null,
  relationship_created      text not null,
  plain_substitute          text not null,
  visual_model              text,
  misreading_risk           jsonb not null default '[]'::jsonb,
  child_explains_back       text not null,
  transfer_example          text not null,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  constraint ue_lb_cases_src_ck check (sentence_source in (
    'SOURCED_VERBATIM','SOURCED_ADAPTED','CONSTRUCTED_FOR_LAB')),
  -- a sentence claimed as sourced must name its source row
  constraint ue_lb_cases_ref_ck check (
    sentence_source = 'CONSTRUCTED_FOR_LAB' or source_ref is not null),
  constraint ue_lb_cases_risk_ck check (jsonb_array_length(misreading_risk) > 0)
);

-- --------------------------------------------------- 5. MISREADING PATTERNS
-- THYLORA ANALYSIS. The general shapes behind the individual misreadings.
-- Each names the loop stage it breaks and the mastery factor it zeroes.
create table if not exists ue_lb_misreading_patterns (
  pattern_code      text primary key,
  pattern_name      text not null,
  ordinal           integer not null,
  what_happens      text not null,
  child_sentence    text not null,
  worked_example    jsonb not null default '{}'::jsonb,
  terms_affected    jsonb not null default '[]'::jsonb,
  detection_signal  text not null,
  repair_move       text not null,
  loop_stage        text not null,
  factor_damaged    text not null,
  created_at        timestamptz not null default now(),
  constraint ue_lb_mis_stage_ck check (loop_stage in (
    'OBSERVE','NAME','MEASURE','CAUSE','EVIDENCE','GAP','CONNECT','TEST','APPLY','EXPLAIN')),
  constraint ue_lb_mis_factor_ck check (factor_damaged in ('K','E','C','X','T'))
);

-- --------------------------------------------------------------- 6. ANALYSIS
-- Layered prose sections. layer is mandatory so no section can sit between
-- what was retrieved, what THYLORA concluded, and what is merely proposed.
create table if not exists ue_lb_analysis (
  section_code   text primary key,
  section_title  text not null,
  ordinal        integer not null,
  layer          text not null,
  body           jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now(),
  constraint ue_lb_analysis_layer_ck check (layer in (
    'DOCUMENTED_RESEARCH','THYLORA_ANALYSIS','PROPOSED_PRODUCT_DESIGN'))
);

-- -------------------------------------------------------- 7. PRODUCT DESIGNS
-- PROPOSED PRODUCT DESIGN only. product_code is a soft reference into
-- ue_products, which remains the single product registry. Nothing here is built,
-- priced or released, and state may not claim otherwise.
create table if not exists ue_lb_product_designs (
  design_code             text primary key,
  product_code            text not null,
  title                   text not null,
  ordinal                 integer not null,
  audience                text not null,
  what_it_is              text not null,
  the_single_move         text not null,
  session_shape           jsonb not null default '[]'::jsonb,
  reads_from              jsonb not null default '[]'::jsonb,
  writes_to               jsonb not null default '[]'::jsonb,
  scores_into             jsonb not null default '[]'::jsonb,
  refusals                jsonb not null default '[]'::jsonb,
  proof_artefact_required text not null,
  pricing                 text not null default 'UNKNOWN_UNTIL_COMMERCE_EVIDENCE',
  state                   text not null default 'DESIGN_ONLY_NOT_BUILT',
  store_state             text not null default 'NOT_RELEASED',
  what_remains_unknown    text not null,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  constraint ue_lb_pd_state_ck check (state in ('DESIGN_ONLY_NOT_BUILT','DESIGN_ACTIVE')),
  constraint ue_lb_pd_store_ck check (store_state = 'NOT_RELEASED'),
  constraint ue_lb_pd_price_ck check (pricing = 'UNKNOWN_UNTIL_COMMERCE_EVIDENCE'),
  constraint ue_lb_pd_refusal_ck check (jsonb_array_length(refusals) > 0),
  constraint ue_lb_pd_unknown_ck check (length(btrim(what_remains_unknown)) > 0)
);

-- ----------------------------------------------------------------- INDEXES
create index if not exists ue_lb_senses_term_idx          on ue_lb_senses (term_code, ordinal);
create index if not exists ue_lb_cases_term_idx           on ue_lb_sentence_cases (term_code);
create index if not exists ue_lb_cases_subject_idx        on ue_lb_sentence_cases (subject_code);
create index if not exists ue_lb_cases_sense_idx          on ue_lb_sentence_cases (sense_code);
create index if not exists ue_lb_terms_class_idx          on ue_lb_terms (term_class);
create index if not exists ue_lb_terms_blocker_idx        on ue_lb_terms (blocker_type);
create index if not exists ue_lb_analysis_layer_idx       on ue_lb_analysis (layer, ordinal);
create index if not exists ue_lb_pd_product_idx           on ue_lb_product_designs (product_code);
