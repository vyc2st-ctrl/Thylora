-- THYLORA APP · row level security
-- Workroom: WR-THYAPP-001
--
-- HELD FOR CHAIRMAN APPLICATION.
--
-- This is the real access boundary. The shell's route guard decides what to
-- DRAW; these policies decide what a token may READ. A tampered browser can
-- open the Chairman view and still receive nothing.
--
-- Posture:
--   * public surfaces are readable by anyone, but only when PUBLISHED
--   * a reader's own questions and follows are readable only by that reader
--   * every Chairman artefact requires thy_is_chairman()
--   * no policy grants write access to the public surfaces; publication stays
--     with the existing THYLORA production path

alter table thy_transmissions          enable row level security;
alter table thy_transmission_tracks    enable row level security;
alter table thy_earth_watch_signals    enable row level security;
alter table thy_casefiles              enable row level security;
alter table thy_casefile_evidence      enable row level security;
alter table thy_correspondents         enable row level security;
alter table thy_follows                enable row level security;
alter table thy_live_sessions          enable row level security;
alter table thy_ersatz_questions       enable row level security;
alter table thy_global_arrivals        enable row level security;
alter table thy_origin                 enable row level security;
alter table thy_approvals              enable row level security;
alter table thy_prompt_ledger          enable row level security;
alter table thy_margin_notes           enable row level security;
alter table thy_chairman_sketches      enable row level security;

/* ----------------------------------------------------- public reading only */
-- An unpublished transmission is invisible, not merely unlisted.
drop policy if exists thy_transmissions_read_published on thy_transmissions;
create policy thy_transmissions_read_published on thy_transmissions
  for select using (publish_state = 'PUBLISHED' or thy_is_chairman());

drop policy if exists thy_tracks_read_published on thy_transmission_tracks;
create policy thy_tracks_read_published on thy_transmission_tracks
  for select using (
    thy_is_chairman() or exists (
      select 1 from thy_transmissions t
      where t.transmission_code = thy_transmission_tracks.transmission_code
        and t.publish_state = 'PUBLISHED'
    )
  );

drop policy if exists thy_earth_watch_read_published on thy_earth_watch_signals;
create policy thy_earth_watch_read_published on thy_earth_watch_signals
  for select using (publish_state = 'PUBLISHED' or thy_is_chairman());

drop policy if exists thy_casefiles_read_published on thy_casefiles;
create policy thy_casefiles_read_published on thy_casefiles
  for select using (
    (publish_state = 'PUBLISHED' and casefile_state <> 'SEALED') or thy_is_chairman()
  );

-- Evidence follows its casefile: sealing a casefile seals its evidence.
drop policy if exists thy_evidence_read_published on thy_casefile_evidence;
create policy thy_evidence_read_published on thy_casefile_evidence
  for select using (
    thy_is_chairman() or exists (
      select 1 from thy_casefiles c
      where c.casefile_code = thy_casefile_evidence.casefile_code
        and c.publish_state = 'PUBLISHED'
        and c.casefile_state <> 'SEALED'
    )
  );

drop policy if exists thy_correspondents_read on thy_correspondents;
create policy thy_correspondents_read on thy_correspondents
  for select using (true);

drop policy if exists thy_live_sessions_read on thy_live_sessions;
create policy thy_live_sessions_read on thy_live_sessions
  for select using (live_state <> 'CANCELLED' or thy_is_chairman());

drop policy if exists thy_arrivals_read on thy_global_arrivals;
create policy thy_arrivals_read on thy_global_arrivals
  for select using (true);

drop policy if exists thy_origin_read on thy_origin;
create policy thy_origin_read on thy_origin
  for select using (origin_state = 'ACTIVE' or thy_is_chairman());

/* ------------------------------------------------------- a reader's own rows */
drop policy if exists thy_questions_own_read on thy_ersatz_questions;
create policy thy_questions_own_read on thy_ersatz_questions
  for select using (owner_user_id = auth.uid() or thy_is_chairman());

-- Insert only as yourself. submit_ersatz_question_v1 runs security invoker, so
-- it is bound by this policy rather than bypassing it.
drop policy if exists thy_questions_own_insert on thy_ersatz_questions;
create policy thy_questions_own_insert on thy_ersatz_questions
  for insert with check (owner_user_id = auth.uid());

drop policy if exists thy_questions_own_withdraw on thy_ersatz_questions;
create policy thy_questions_own_withdraw on thy_ersatz_questions
  for update using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid() and question_state = 'WITHDRAWN');

drop policy if exists thy_follows_own_all on thy_follows;
create policy thy_follows_own_all on thy_follows
  for all using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());

/* ----------------------------------------------------- chairman artefacts */
drop policy if exists thy_approvals_chairman on thy_approvals;
create policy thy_approvals_chairman on thy_approvals
  for all using (thy_is_chairman()) with check (thy_is_chairman());

drop policy if exists thy_prompt_ledger_chairman on thy_prompt_ledger;
create policy thy_prompt_ledger_chairman on thy_prompt_ledger
  for all using (thy_is_chairman()) with check (thy_is_chairman());

-- A margin note or sketch is authored by the Chairman and stays with them.
drop policy if exists thy_margin_notes_chairman on thy_margin_notes;
create policy thy_margin_notes_chairman on thy_margin_notes
  for all using (thy_is_chairman() and author_user_id = auth.uid())
  with check (thy_is_chairman() and author_user_id = auth.uid());

drop policy if exists thy_sketches_chairman on thy_chairman_sketches;
create policy thy_sketches_chairman on thy_chairman_sketches
  for all using (thy_is_chairman() and author_user_id = auth.uid())
  with check (thy_is_chairman() and author_user_id = auth.uid());

/* ---------------------------------------------------------------- the view */
-- thy_order_arrivals reads `orders`, so it must never widen access to money.
-- It is created with security_invoker so the caller's own `orders` policies
-- apply; without this a view owner's rights would leak order rows.
alter view thy_order_arrivals set (security_invoker = true);

revoke all on thy_order_arrivals from anon;
grant select on thy_order_arrivals to authenticated;
