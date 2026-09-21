-- 0011 · Award classes, vehicle awards, viewer voting, people voting.
-- Winning is broader than arriving first. Unsafe speed is never the main score.

begin;

create table if not exists thytr_award_class (
  award_code          text primary key,
  award_label         text not null,
  award_group         text not null
                      check (award_group in (
                        'HELP','BUILD','VEHICLE','ANIMAL','CREW','COMMUNITY','VIEWER','SAFETY','CONDUCT')),
  decided_by          text not null
                      check (decided_by in (
                        'VERIFIED_RECORD','HOST_COMMUNITY','VIEWER_VOTE','PEOPLE_VOTE','PANEL','CROWN')),
  catalog_ref         text,                        -- soft ref into thylora_time_run_award_catalog
  speed_weighted      boolean not null default false,
  requires_verification boolean not null default true,
  public_release      boolean not null default false,
  award_note          text
);

insert into thytr_award_class
  (award_code, award_label, award_group, decided_by, speed_weighted, requires_verification, public_release, award_note) values
  ('AWD-MOST-HELP',      'Most Help Given',            'HELP',      'VERIFIED_RECORD', false, true,  true,
   'Verified direct benefit to people or communities. Counted from double-verified help orders only.'),
  ('AWD-BEST-BUILD',     'Best Useful Build',          'BUILD',     'VERIFIED_RECORD', false, true,  true,
   'A repair, design or improvement that is still standing and still useful when the team has gone.'),
  ('AWD-VEHICLE-VIEWER', 'Viewer Vehicle Pick',        'VEHICLE',   'VIEWER_VOTE',     false, true,  true,
   'Audience recognition, after eligibility and safety review.'),
  ('AWD-VEHICLE-PERIOD', 'Truest to the Era',          'VEHICLE',   'PANEL',           false, true,  true,
   'Period correctness of build, materials and operation. A non-period vehicle is ineligible, not penalised in secret.'),
  ('AWD-VEHICLE-ROAD',   'Best Road Vehicle',          'VEHICLE',   'PANEL',           false, true,  true,
   'Survived the road, carried the load, stayed repairable with era tools.'),
  ('AWD-CARAVAN',        'Best Repair Caravan',        'VEHICLE',   'VERIFIED_RECORD', false, true,  true,
   'Counted on repairs done for OTHER people, not on repairs done for itself.'),
  ('AWD-ANIMAL-CARE',    'Best Animal Care',           'ANIMAL',    'PANEL',           false, true,  true,
   'Care records, condition at finish, rest honoured. A lame animal at the finish ends eligibility.'),
  ('AWD-COMMUNITY-PICK', 'Community Pick',             'COMMUNITY', 'HOST_COMMUNITY',  false, false, true,
   'Chosen by the host communities. Needs no verification by the Run: the community''s word is the finding.'),
  ('AWD-PEOPLE-PICK',    'People''s Pick',             'COMMUNITY', 'PEOPLE_VOTE',     false, false, true,
   'Open vote of the people of the era visited. Counted separately from the viewer vote and never merged with it.'),
  ('AWD-CREW-TRUST',     'Most Trusted Crew',          'CREW',      'PEOPLE_VOTE',     false, false, true,
   'Voted by hosts, local hires and other teams.'),
  ('AWD-SAFE-PASSAGE',   'Safe Passage',               'SAFETY',    'VERIFIED_RECORD', false, true,  true,
   'No preventable injury to any person or animal, own or local, across the whole run.'),
  ('AWD-STOPPED-FIRST',  'Stopped First',              'CONDUCT',   'VERIFIED_RECORD', false, true,  true,
   'For the team that halted first for an emergency. Deliberately an award, so that stopping is never a cost.'),
  ('AWD-FRIENDSHIP',     'Kept Company',               'CONDUCT',   'PEOPLE_VOTE',     false, false, true,
   'Real friendships made and kept. Voted by the people who made them.'),
  ('AWD-FINISH',         'Completed the Run',          'CREW',      'VERIFIED_RECORD', false, true,  true,
   'Arrival with crew, animals and obligations intact. Arrival order is recorded; it is not the award.')
on conflict (award_code) do nothing;

comment on column thytr_award_class.speed_weighted is
  'Every seeded class is false. A speed-weighted class may exist only if the Chairman seals it, and it can never outweigh the HELP and SAFETY groups combined.';

-- ---------------------------------------------------------------------------
-- Voting. Viewer voting and people voting are separate populations and are
-- never merged into one number.
-- ---------------------------------------------------------------------------
create table if not exists thytr_vote_round (
  round_id            uuid primary key default gen_random_uuid(),
  run_code            text not null references thytr_run(run_code),
  award_code          text not null references thytr_award_class(award_code),
  population          text not null
                      check (population in ('VIEWER','PEOPLE_OF_ERA','HOST_COMMUNITY','CREW')),
  opens_at            timestamptz,
  closes_at           timestamptz,
  eligibility_reviewed boolean not null default false,
  safety_reviewed     boolean not null default false,
  round_state         text not null default 'DRAFT'
                      check (round_state in ('DRAFT','OPEN','CLOSED','REVIEWED','PUBLISHED','VOIDED')),
  unique (run_code, award_code, population)
);

-- A round cannot open before eligibility and safety review.
alter table thytr_vote_round drop constraint if exists thytr_vote_round_review_gate;
alter table thytr_vote_round add constraint thytr_vote_round_review_gate
  check (round_state in ('DRAFT','VOIDED') or (eligibility_reviewed and safety_reviewed));

create table if not exists thytr_vote (
  vote_id             uuid primary key default gen_random_uuid(),
  round_id            uuid not null references thytr_vote_round(round_id) on delete cascade,
  voter_ref           text not null,               -- soft ref; one voter, one vote per round
  subject_kind        text not null
                      check (subject_kind in ('TEAM','VEHICLE','CREW_SLOT','ANIMAL','HELP_ORDER')),
  subject_ref         text not null,
  cast_at             timestamptz not null default now(),
  unique (round_id, voter_ref)
);

create table if not exists thytr_award_result (
  result_id           uuid primary key default gen_random_uuid(),
  run_code            text not null references thytr_run(run_code),
  award_code          text not null references thytr_award_class(award_code),
  subject_kind        text not null,
  subject_ref         text not null,
  verified_count      integer not null default 0 check (verified_count >= 0),
  viewer_votes        integer not null default 0 check (viewer_votes >= 0),
  people_votes        integer not null default 0 check (people_votes >= 0),
  community_finding   text,
  result_state        text not null default 'PROVISIONAL'
                      check (result_state in ('PROVISIONAL','REVIEWED','FINAL','WITHDRAWN')),
  decided_at          timestamptz,
  unique (run_code, award_code, subject_kind, subject_ref)
);

comment on column thytr_award_result.people_votes is
  'Kept as its own column, never summed into viewer_votes. The people of the era and the audience watching are two different publics with two different stakes.';

commit;
