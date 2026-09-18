-- THYLORA MATHEMATICS SURFACE · 0001 · The model, the words, the examples
-- Workroom: WR-MATH-SURFACE-001
-- Backend: thylora-dash (jvsdxhrfhtlgaknhjxlz)
--
-- AUTHORITY NOTE
-- This file is a reviewable migration. It is NOT applied by this repository.
-- Applying DDL to the live backend is a production mutation and is held for
-- Chairman execution. Every statement is idempotent and additive: it creates new
-- thy_math_* objects and never drops, renames or rewrites an existing THYLORA
-- table.
--
-- The model:
--   L = Do I understand the sentence?
--   M = Do I understand the mathematical relationship?
--   S = Can I solve it?
--   P_solve = L × M × S
--
-- The hard rule, carried in the schema rather than in a comment:
--   If L = 0, do NOT infer that the learner lacks the mathematics.
-- It is enforced by a check constraint in 0003 and by a function in 0006.

begin;

create extension if not exists "pgcrypto";

do $$ begin
  create type thy_math_layer as enum ('L','M','S');
exception when duplicate_object then null; end $$;

-- How a layer was looked at. NOT_ISOLATED and UNMEASURED are both "we cannot
-- speak about this layer"; they are kept apart because they call for different
-- next actions.
do $$ begin
  create type thy_math_evidence as enum ('OBSERVED','NOT_ISOLATED','UNMEASURED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type thy_math_claim as enum (
    'LANGUAGE_DEFICIT',
    'MATH_DEFICIT',
    'PROCEDURE_DEFICIT',
    'CANNOT_SOLVE_AS_PRESENTED'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type thy_math_word_family as enum (
    'RESIDUE','GAP','RATE','INTERVAL','BOUND','PAIRING','APPROXIMATION','RELATION'
  );
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- The model itself, stored so a surface, a report and a print run cannot drift
-- from each other.
-- ---------------------------------------------------------------------------

create table if not exists thy_math_model (
  id                    text primary key,
  equation              text not null,
  question_l            text not null,
  question_m            text not null,
  question_s            text not null,
  hard_rule             text not null,
  admissibility_rule    text not null,
  holding_threshold     numeric not null check (holding_threshold > 0 and holding_threshold <= 1),
  created_at            timestamptz not null default now()
);

insert into thy_math_model (
  id, equation, question_l, question_m, question_s,
  hard_rule, admissibility_rule, holding_threshold
) values (
  'THY-MATH-LMS-001',
  'P_solve = L × M × S',
  'Do I understand the sentence?',
  'Do I understand the mathematical relationship?',
  'Can I solve it?',
  'If L = 0, do not infer that the learner lacks the mathematics.',
  'Only an isolated probe is evidence about its own layer.',
  0.6
) on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- The vocabulary registry: the words that decide whether a sentence can be read.
-- ---------------------------------------------------------------------------

create table if not exists thy_math_vocabulary (
  word              text primary key,
  family            thy_math_word_family not null,
  surface_forms     text[] not null default '{}',
  plain_meaning     text not null,
  relationship      text not null,
  notation          text not null,
  common_misread    text not null,
  why_it_misleads   text not null,
  probe_ask         text not null,
  probe_accept      text[] not null,
  probe_reject      text[] not null,
  -- A language probe that can be failed for arithmetic reasons is not measuring
  -- language. Digits and operators are refused at the column.
  constraint thy_math_probe_is_arithmetic_free
    check (probe_ask !~ '[0-9+\-×÷=<>]'),
  created_at        timestamptz not null default now()
);

insert into thy_math_vocabulary (word, family, surface_forms, plain_meaning, relationship, notation, common_misread, why_it_misleads, probe_ask, probe_accept, probe_reject) values
  ('remain','RESIDUE', array['remain','remains','remaining','left','left over','still has'],
   'what is still there after some of it is gone','start − taken away = remain','a − b',
   'reading "remain" as the total, or as a word that always means subtract',
   'Six remain and six were taken are the same shape of sentence and opposite quantities.',
   'In this sentence, is the number given the amount that went away, or the amount still there?',
   array['the amount still there','what is left'], array['the amount that went away','the total at the start']),

  ('difference','GAP', array['difference','how many more','how much more','how many fewer','how much less'],
   'how far apart two amounts are','larger − smaller = difference','|a − b|',
   'reading "difference" as what is different about them',
   'Everywhere else in the school day, difference means how two things are unalike.',
   'Is this sentence asking how the two things are unalike, or how far apart their amounts are?',
   array['how far apart the amounts are','the gap between them'], array['how they are unalike','their total']),

  ('per','RATE', array['per','for each','each','a piece','apiece','every'],
   'how much there is for one of them','total ÷ number of groups = amount per group','a ÷ b',
   'reading past "per" and joining the two numbers whichever way round they appear',
   'Nothing in the sentence looks like an operator, so the direction has to be read rather than spotted.',
   'Point at the thing there is exactly one of in this sentence.',
   array['the one box','the single unit named after per'], array['the total','the biggest number']),

  ('between','INTERVAL', array['between','in between'],
   'either the space separating two things, or the room inside two ends',
   'the difference between a and b is a gap; a number between a and b is an interval','a − b  or  a < x < b',
   'treating both meanings as the same',
   'The word is identical in both sentences; only the words around it decide.',
   'Does this sentence want one number that sits inside two ends, or the gap separating two amounts?',
   array['a number inside the two ends','the gap separating them'], array['both numbers added together']),

  ('at least','BOUND', array['at least','no fewer than','no less than','a minimum of','or more'],
   'this much is allowed, and more is allowed too','answer ≥ the stated number; the stated number itself counts','x ≥ n',
   'reading at least twelve as more than twelve',
   'In speech it sounds like a floor you are meant to beat, so the boundary case is lost.',
   'If the sentence says at least twelve, is twelve itself allowed?',
   array['yes, twelve counts'], array['no, it has to be more than twelve']),

  ('at most','BOUND', array['at most','no more than','a maximum of','up to','or fewer'],
   'this much is allowed, and less is allowed too, but not more','answer ≤ the stated number; the stated number itself counts','x ≤ n',
   'reading at most nine as exactly nine',
   'It is a ceiling that includes itself, and speech uses it loosely as a guess.',
   'If the sentence says at most nine, is nine itself allowed? Is eight allowed?',
   array['yes and yes'], array['only nine','nine is not allowed']),

  ('respectively','PAIRING', array['respectively','in that order','in turn'],
   'match them up in the order they were said, first with first',
   'it carries no arithmetic; it decides which number belongs to which name','(a1,a2) <-> (b1,b2)',
   'skipping the word, then pairing numbers by how near they sit',
   'It arrives after both lists and changes the meaning of everything before it.',
   'Say which number belongs to which name.',
   array['first name with first number, second with second'], array['the nearest number to each name']),

  ('estimate','APPROXIMATION', array['estimate','about','roughly','approximately','around'],
   'a close answer is the right answer here, on purpose','round first, then work; the result is a defensible approximation','a ~ b',
   'believing an estimate is a worse answer and computing the exact one instead',
   'Everywhere else in school, being close is being wrong.',
   'Does this question want the exact answer, or a close one on purpose?',
   array['a close one on purpose'], array['the exact answer']),

  ('compare','RELATION', array['compare','which is greater','which is smaller','order them'],
   'say how two amounts stand next to each other','the answer is a relationship or a ranking, not a new quantity','a > b, a < b, a = b',
   'producing a number when the question asked for a relationship',
   'Years of find the answer train a learner that the output of mathematics is a number.',
   'Should the answer to this be a number, or a statement about which is bigger?',
   array['a statement about which is bigger'], array['a number']),

  ('rate','RATE', array['rate','per hour','per mile','speed','each hour','a day'],
   'how much of one thing happens for one of another thing','rate = amount ÷ the thing it is measured against; both units must be named','a / b with units',
   'holding the number and dropping the two units',
   'A rate is the only number in the sentence that is really two numbers.',
   'Name both units in this rate — what for every what?',
   array['both units named in order'], array['just the number','one unit only'])
on conflict (word) do nothing;

-- ---------------------------------------------------------------------------
-- Worked examples and their four isolations.
-- ---------------------------------------------------------------------------

create table if not exists thy_math_worked_examples (
  id                     text primary key,
  title                  text not null,
  band                   text not null,
  story                  text not null,
  word_focus             text[] not null,
  quantities             jsonb not null default '[]'::jsonb,
  -- the four isolations, each held separately so none can quietly absorb another
  language_isolation     jsonb not null,
  relationship_isolation jsonb not null,
  solve_isolation        jsonb not null,
  explain_back           jsonb not null,
  answer_in_story        text not null,
  expected_failure_mode  text not null,
  language_load          integer not null check (language_load >= 0),
  created_at             timestamptz not null default now(),
  constraint thy_math_example_has_four_isolations check (
    language_isolation ? 'ask'
    and relationship_isolation ? 'options'
    and solve_isolation ? 'prompt'
    and explain_back ? 'prompt'
  ),
  -- THY-MINOR-NAME-ADULT-USE-001, at the column. A protected name cannot enter
  -- a child-facing example at all.
  constraint thy_math_example_no_protected_name check (
    story !~* '\mdaniel\M' and title !~* '\mdaniel\M' and answer_in_story !~* '\mdaniel\M'
  )
);

create index if not exists thy_math_worked_examples_word_focus_idx
  on thy_math_worked_examples using gin (word_focus);

comment on table thy_math_worked_examples is
  'Each row is one problem held four ways: language alone, relationship alone, procedure alone, and the child explaining the result back. Seeded from math-surface/lib/examples.js.';

commit;
