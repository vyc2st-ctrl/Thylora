-- LANGUAGE BLOCKER · row level security and privilege floor
--
-- Rule inherited from the Understanding Engine: concept-shaped reference material
-- is readable by any signed-in learner; only the Chairman writes it. No row in
-- this subsystem carries learner data, so there is no owner path here — learner
-- state continues to live in ue_learner_memory under its existing owner policy.
-- anon is closed explicitly rather than left to the absence of a policy.

alter table ue_lb_sources             enable row level security;
alter table ue_lb_terms               enable row level security;
alter table ue_lb_senses              enable row level security;
alter table ue_lb_sentence_cases      enable row level security;
alter table ue_lb_misreading_patterns enable row level security;
alter table ue_lb_analysis            enable row level security;
alter table ue_lb_product_designs     enable row level security;

revoke all on ue_lb_sources             from anon;
revoke all on ue_lb_terms               from anon;
revoke all on ue_lb_senses              from anon;
revoke all on ue_lb_sentence_cases      from anon;
revoke all on ue_lb_misreading_patterns from anon;
revoke all on ue_lb_analysis            from anon;
revoke all on ue_lb_product_designs     from anon;

revoke insert, update, delete, truncate on ue_lb_sources             from authenticated;
revoke insert, update, delete, truncate on ue_lb_terms               from authenticated;
revoke insert, update, delete, truncate on ue_lb_senses              from authenticated;
revoke insert, update, delete, truncate on ue_lb_sentence_cases      from authenticated;
revoke insert, update, delete, truncate on ue_lb_misreading_patterns from authenticated;
revoke insert, update, delete, truncate on ue_lb_analysis            from authenticated;
revoke insert, update, delete, truncate on ue_lb_product_designs     from authenticated;

grant select on ue_lb_sources             to authenticated;
grant select on ue_lb_terms               to authenticated;
grant select on ue_lb_senses              to authenticated;
grant select on ue_lb_sentence_cases      to authenticated;
grant select on ue_lb_misreading_patterns to authenticated;
grant select on ue_lb_analysis            to authenticated;
grant select on ue_lb_product_designs     to authenticated;

do $$
declare
  t text;
begin
  foreach t in array array[
    'ue_lb_sources','ue_lb_terms','ue_lb_senses','ue_lb_sentence_cases',
    'ue_lb_misreading_patterns','ue_lb_analysis','ue_lb_product_designs']
  loop
    execute format(
      'drop policy if exists %I on %I', 'learner_read_'||t, t);
    execute format(
      'create policy %I on %I for select to authenticated using (true)',
      'learner_read_'||t, t);

    execute format(
      'drop policy if exists %I on %I', 'chairman_manage_'||t, t);
    execute format(
      'create policy %I on %I for all to authenticated using (thylora_is_chairman()) with check (thylora_is_chairman())',
      'chairman_manage_'||t, t);
  end loop;
end $$;
