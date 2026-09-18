-- THYLORA MATHEMATICS SURFACE · 0005 · Row level security
-- Workroom: WR-MATH-SURFACE-001
--
-- ACCESS != AUTHORITY.
--
-- The model, the vocabulary and the worked examples are teaching material and
-- are readable by anybody, signed in or not — a family should not need an
-- account to read what the three layers are.
--
-- A child's record is the opposite. Observations and Understanding Cards are
-- readable only by the account that holds the learner reference. There is no
-- staff role, no school-wide read, and no analytics view over children in this
-- schema. If one is ever wanted, it is a separate, argued decision with its own
-- migration — not something that arrives quietly through a permissive policy.

begin;

alter table thy_math_model                  enable row level security;
alter table thy_math_vocabulary             enable row level security;
alter table thy_math_worked_examples        enable row level security;
alter table thy_math_learner_refs           enable row level security;
alter table thy_math_sittings               enable row level security;
alter table thy_math_layer_observations     enable row level security;
alter table thy_math_understanding_cards    enable row level security;
alter table thy_protocols                   enable row level security;
alter table thy_workstreams                 enable row level security;
alter table thy_voice_lines                 enable row level security;
alter table thy_voice_mutations             enable row level security;
alter table thy_protected_names             enable row level security;
alter table thy_protected_name_adult_uses   enable row level security;

-- --- teaching material: readable by everyone, written by nobody from a client -

do $$ begin
  create policy thy_math_model_read on thy_math_model for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy thy_math_vocabulary_read on thy_math_vocabulary for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy thy_math_examples_read on thy_math_worked_examples for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy thy_protocols_read on thy_protocols for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy thy_workstreams_read on thy_workstreams for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy thy_voice_lines_read on thy_voice_lines for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy thy_voice_mutations_read on thy_voice_mutations for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy thy_protected_names_read on thy_protected_names for select using (true);
exception when duplicate_object then null; end $$;

-- Adult-use declarations name a real person's age. Readable by staff paths only,
-- which in this schema means: not from a client role at all.
do $$ begin
  create policy thy_adult_use_no_client_read on thy_protected_name_adult_uses
    for select using (false);
exception when duplicate_object then null; end $$;

-- --- a child's record: owner only --------------------------------------------

do $$ begin
  create policy thy_math_learner_owner_all on thy_math_learner_refs
    for all using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy thy_math_sittings_owner_all on thy_math_sittings
    for all using (
      exists (select 1 from thy_math_learner_refs l where l.id = learner_id and l.owner_user_id = auth.uid())
    ) with check (
      exists (select 1 from thy_math_learner_refs l where l.id = learner_id and l.owner_user_id = auth.uid())
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy thy_math_observations_owner_all on thy_math_layer_observations
    for all using (
      exists (
        select 1 from thy_math_sittings s
        join thy_math_learner_refs l on l.id = s.learner_id
        where s.id = sitting_id and l.owner_user_id = auth.uid()
      )
    ) with check (
      exists (
        select 1 from thy_math_sittings s
        join thy_math_learner_refs l on l.id = s.learner_id
        where s.id = sitting_id and l.owner_user_id = auth.uid()
      )
    );
exception when duplicate_object then null; end $$;

-- Cards: the owner may read and insert. Update and delete are refused by the
-- append-only trigger in 0003 as well as by the absence of a policy here, so
-- the rule holds even if a policy is later loosened by accident.
do $$ begin
  create policy thy_math_cards_owner_read on thy_math_understanding_cards
    for select using (
      exists (
        select 1 from thy_math_learner_refs l
        where l.learner_ref = thy_math_understanding_cards.learner_ref
          and l.owner_user_id = auth.uid()
      )
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy thy_math_cards_owner_insert on thy_math_understanding_cards
    for insert with check (
      exists (
        select 1 from thy_math_learner_refs l
        where l.learner_ref = thy_math_understanding_cards.learner_ref
          and l.owner_user_id = auth.uid()
      )
    );
exception when duplicate_object then null; end $$;

commit;
