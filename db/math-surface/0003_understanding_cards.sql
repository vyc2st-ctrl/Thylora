-- THYLORA MATHEMATICS SURFACE · 0003 · Understanding Cards
-- Workroom: WR-MATH-SURFACE-001
--
-- A card is a record of what an adult watched a child do on one morning. It is
-- append-only. A later reading writes a new version that points back at the old
-- one; the old one stays readable. That is the family story archive rule applied
-- to assessment: the source is preserved, interpretation is added beside it.
--
-- Two constraints in this file carry the Chairman's hard rule into the database,
-- so that the refusal survives a client that forgets it:
--
--   thy_math_card_math_claim_requires_isolated_m
--   thy_math_card_undetermined_has_no_value

begin;

create table if not exists thy_math_understanding_cards (
  id                        text primary key,
  version                   integer not null default 1 check (version >= 1),
  supersedes                text references thy_math_understanding_cards(id),
  sitting_id                uuid references thy_math_sittings(id) on delete set null,
  learner_ref               text not null,
  example_id                text,
  recorded_by               text,
  observed_at               timestamptz not null default now(),

  -- the equation as it stood
  p_solve_value             numeric check (p_solve_value is null or (p_solve_value >= 0 and p_solve_value <= 1)),
  p_solve_determined        boolean not null,
  p_solve_reason            text not null
                            check (p_solve_reason in ('ZERO_FACTOR','INCOMPLETE_EVIDENCE','ALL_FACTORS_OBSERVED')),

  layer_l                   numeric check (layer_l is null or (layer_l >= 0 and layer_l <= 1)),
  layer_m                   numeric check (layer_m is null or (layer_m >= 0 and layer_m <= 1)),
  layer_s                   numeric check (layer_s is null or (layer_s >= 0 and layer_s <= 1)),
  layer_l_isolated          boolean not null default false,
  layer_m_isolated          boolean not null default false,
  layer_s_isolated          boolean not null default false,

  -- required fields: a card that reports a number without reporting what was
  -- not measured is a card that lies by omission
  not_measured              text[] not null,
  not_measured_statement    text not null check (length(trim(not_measured_statement)) > 0),
  refused_claims            thy_math_claim[] not null default '{}',

  -- claims this card asserts; empty is the normal state
  claims_made               thy_math_claim[] not null default '{}',

  -- the child's own words, preserved as said
  explain_back_child_words  text not null default '',
  language_load             integer,

  created_at                timestamptz not null default now(),

  -- A value is only present for a layer that was measured in isolation.
  constraint thy_math_card_l_value_needs_isolation check (layer_l is null or layer_l_isolated),
  constraint thy_math_card_m_value_needs_isolation check (layer_m is null or layer_m_isolated),
  constraint thy_math_card_s_value_needs_isolation check (layer_s is null or layer_s_isolated),

  -- THE HARD RULE. A card may not claim a mathematics deficit unless the
  -- relationship layer was measured on its own. L = 0 grants nothing here.
  constraint thy_math_card_math_claim_requires_isolated_m check (
    not ('MATH_DEFICIT' = any(claims_made)) or layer_m_isolated
  ),
  constraint thy_math_card_procedure_claim_requires_isolated_s check (
    not ('PROCEDURE_DEFICIT' = any(claims_made)) or layer_s_isolated
  ),
  constraint thy_math_card_language_claim_requires_isolated_l check (
    not ('LANGUAGE_DEFICIT' = any(claims_made)) or layer_l_isolated
  ),

  -- An undetermined product has no value. No placeholder, no zero.
  constraint thy_math_card_undetermined_has_no_value check (
    p_solve_determined or p_solve_value is null
  ),

  -- A determined product must say which shape it is.
  constraint thy_math_card_determined_has_value check (
    not p_solve_determined or p_solve_value is not null
  ),

  -- If any layer is unmeasured, it has to be listed.
  constraint thy_math_card_unmeasured_listed check (
    (layer_l_isolated or 'L' = any(not_measured))
    and (layer_m_isolated or 'M' = any(not_measured))
    and (layer_s_isolated or 'S' = any(not_measured))
  ),

  constraint thy_math_card_no_protected_name check (
    learner_ref !~* '\mdaniel\M'
  )
);

create index if not exists thy_math_cards_learner_idx
  on thy_math_understanding_cards (learner_ref, observed_at desc);
create index if not exists thy_math_cards_supersedes_idx
  on thy_math_understanding_cards (supersedes);

-- ---------------------------------------------------------------------------
-- Append-only, enforced. A correction writes a new row.
-- ---------------------------------------------------------------------------

create or replace function thy_math_cards_are_append_only()
returns trigger language plpgsql as $$
begin
  raise exception
    'Understanding Cards are append-only. Write a superseding version (supersedes = %) instead of changing this record.',
    coalesce(old.id, '?')
    using errcode = 'restrict_violation';
end;
$$;

drop trigger if exists thy_math_cards_no_update on thy_math_understanding_cards;
create trigger thy_math_cards_no_update
  before update or delete on thy_math_understanding_cards
  for each row execute function thy_math_cards_are_append_only();

-- The live version of a card: the newest row in its supersede chain.
create or replace view thy_math_current_cards as
select c.*
from thy_math_understanding_cards c
where not exists (
  select 1 from thy_math_understanding_cards later where later.supersedes = c.id
);

comment on view thy_math_current_cards is
  'The newest version of each card. Superseded versions remain readable in the base table; nothing is overwritten.';

commit;
