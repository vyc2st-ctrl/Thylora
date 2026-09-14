-- THYLORA APP · Ask Ersatz, arrivals and the declared origin
-- Workroom: WR-THYAPP-001
--
-- HELD FOR CHAIRMAN APPLICATION.
--
-- ASK ERSATZ IS NOT DUPLICATED. There is exactly one question pipeline and it
-- is owned by the existing storefront/commerce service: a question that becomes
-- a paid report is fulfilled through `orders`/`entitlements`, not through a
-- second checkout invented for this lane. This file adds the question table and
-- ONE submit function. It does not add a storefront.

/* ------------------------------------------------------------ ask ersatz */
do $$ begin
  create type thy_question_state as enum (
    'SUBMITTED', 'IN_REVIEW', 'ANSWERED', 'DECLINED', 'WITHDRAWN'
  );
exception when duplicate_object then null; end $$;

create table if not exists thy_ersatz_questions (
  id uuid primary key default gen_random_uuid(),
  question_code text not null unique,
  owner_user_id uuid not null default auth.uid(),
  question_text text not null check (length(btrim(question_text)) >= 3),
  answer_text text,
  -- An Ersatz answer is an interpretation and must be labelled as one. The
  -- default is the same label the member app already uses for interpretations.
  answer_label text not null default 'ERSATZ_INTERPRETATION',
  question_state thy_question_state not null default 'SUBMITTED',
  -- Set when an answer is delivered as a purchasable report through the
  -- existing storefront, so the link is recorded rather than re-implemented.
  fulfilled_product_code text,
  asked_at timestamptz not null default now(),
  answered_at timestamptz,
  constraint thy_questions_answer_dated check (
    question_state <> 'ANSWERED' or (answer_text is not null and answered_at is not null)
  )
);

create index if not exists thy_ersatz_questions_owner_idx
  on thy_ersatz_questions (owner_user_id, asked_at desc);

-- The single submission path the shell calls. It binds the question to the
-- caller's own identity; a caller cannot file a question as someone else.
create or replace function submit_ersatz_question_v1(p_question_text text)
returns table (question_code text, question_state thy_question_state, asked_at timestamptz)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_code text;
begin
  if auth.uid() is null then
    raise exception 'A signed-in THYLORA session is required to ask Ersatz a question.'
      using errcode = '42501';
  end if;
  if p_question_text is null or length(btrim(p_question_text)) < 3 then
    raise exception 'Write the question first.' using errcode = '22023';
  end if;

  v_code := 'ERS-Q-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 8));

  insert into thy_ersatz_questions (question_code, owner_user_id, question_text)
  values (v_code, auth.uid(), btrim(p_question_text));

  return query
    select q.question_code, q.question_state, q.asked_at
    from thy_ersatz_questions q
    where q.question_code = v_code;
end;
$$;

/* -------------------------------------------------------- global arrivals */
create table if not exists thy_global_arrivals (
  id uuid primary key default gen_random_uuid(),
  arrival_code text not null unique,
  region_label text not null,
  country_code text,
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  arrivals integer not null default 0 check (arrivals >= 0),
  sessions integer not null default 0 check (sessions >= 0),
  observed_on date not null default current_date,
  unique (region_label, observed_on)
);

create index if not exists thy_global_arrivals_observed_idx
  on thy_global_arrivals (observed_on desc, arrivals desc);

/* --------------------------------------------------------- declared origin */
-- Money-distance measures from a declared origin. If no row here is ACTIVE the
-- Chairman view reports ORIGIN_NOT_DECLARED and shows revenue without distance.
-- An origin is never assumed on the shell's behalf.
create table if not exists thy_origin (
  id uuid primary key default gen_random_uuid(),
  origin_code text not null unique,
  label text not null,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  origin_state text not null default 'ACTIVE' check (origin_state in ('ACTIVE', 'RETIRED'))
);

-- At most one active origin, so "distance from THYLORA" is unambiguous.
create unique index if not exists thy_origin_single_active
  on thy_origin (origin_state) where origin_state = 'ACTIVE';

/* ------------------------------------------------------- order → arrival */
-- Revenue by arrival region, for the money-distance view. A VIEW, not a table:
-- order rows are never copied into this lane, so the storefront stays the one
-- source of truth for money.
--
-- APPLICATION NOTE FOR THE CHAIRMAN: this view assumes the live `orders` table
-- exposes `order_code`, `amount_minor`, `currency`, `order_state`, `created_at`
-- and a region column named `region_label`. The live column names must be
-- confirmed and this SELECT adjusted to match before the migration is applied.
-- Until then the shell reports money-distance as "not provisioned yet" rather
-- than showing a zero that looks like no revenue.
create or replace view thy_order_arrivals as
select
  o.order_code,
  o.amount_minor,
  o.currency,
  o.order_state,
  o.region_label,
  o.created_at
from orders o;
