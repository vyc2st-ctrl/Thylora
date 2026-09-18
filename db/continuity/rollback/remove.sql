-- THYLORA CONTINUITY WATCHDOG · rollback step 2 · REMOVE
-- Workstream: THY-CONTINUITY-WATCHDOG-001
--
-- WARNING. This drops the continuity record itself: controlling facts, checks,
-- findings, alerts and carryforward snapshots. That is a loss of history, which
-- every other rule in this spine exists to prevent. Export first:
--
--   \copy (select * from thy_controlling_facts)        to 'facts.csv'        csv header
--   \copy (select * from thy_continuity_supersessions) to 'supersessions.csv' csv header
--   \copy (select * from thy_continuity_checks)        to 'checks.csv'       csv header
--   \copy (select * from thy_continuity_findings)      to 'findings.csv'     csv header
--   \copy (select * from thy_continuity_alerts)        to 'alerts.csv'       csv header
--   \copy (select * from thy_workstream_carryforward)  to 'carryforward.csv' csv header
--
-- Run rollback/disarm.sql first. Nothing outside the thy_continuity_* and
-- thy_controlling_facts namespace is touched: no RAE Link table, no dashboard
-- file, no existing registry row other than the department entry this
-- workstream added.

begin;

drop trigger if exists thy_facts_no_rewrite on thy_controlling_facts;

drop view if exists thy_continuity_workstream_state;
drop view if exists thy_continuity_hold_state;
drop view if exists thy_continuity_open_alerts;
drop view if exists thy_continuity_dashboard;

drop function if exists thy_continuity_dashboard_feed(integer);
drop function if exists thy_continuity_clear_alert(text, text, uuid);
drop function if exists thy_continuity_carryforward_gap(bigint, bigint);
drop function if exists thy_continuity_check(text, text, bigint, jsonb, text[], text[], text);
drop function if exists thy_continuity_classify(text, text, jsonb, jsonb, timestamptz, text, boolean, boolean, timestamptz);
drop function if exists thy_continuity_compile(text, text[], text[]);
drop function if exists thy_continuity_raise_alert();
drop function if exists thy_continuity_fact_conflict_watch();
drop function if exists thy_continuity_facts_immutable();
drop function if exists thy_continuity_authority_valid(text);
drop function if exists thy_continuity_is_absent(thy_continuity_kind, jsonb);
drop function if exists thy_continuity_normalize(thy_continuity_kind, jsonb);
drop function if exists thy_continuity_normalize_text(text);
drop function if exists thy_continuity_text(jsonb);

drop table if exists thy_workstream_carryforward;
drop table if exists thy_continuity_alerts;
drop table if exists thy_continuity_findings;
drop table if exists thy_continuity_checks;
drop table if exists thy_continuity_supersessions;
drop table if exists thy_continuity_authorities;
drop table if exists thy_controlling_facts;
drop table if exists thy_continuity_fields;

drop type if exists thy_continuity_class;
drop type if exists thy_continuity_rule;
drop type if exists thy_continuity_kind;

-- The department registry row, if this workstream added one.
do $$
begin
  if to_regclass('public.thylora_departments') is not null then
    execute $q$ delete from thylora_departments where department_code = 'THY-CONTINUITY-WATCHDOG-001' $q$;
  end if;
end $$;

commit;
