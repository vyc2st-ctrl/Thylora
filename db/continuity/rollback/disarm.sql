-- THYLORA CONTINUITY WATCHDOG · rollback step 1 · DISARM
-- Workstream: THY-CONTINUITY-WATCHDOG-001
--
-- Stops the watchdog from holding or alerting while keeping every record it has
-- written. Use this if the watchdog itself is wrong — a bad registry entry, a
-- misclassification, a hold nobody can clear — and work must move while it is
-- fixed. It is reversible by re-applying 0002.
--
-- What this does NOT do: it does not delete a controlling fact, a check, a
-- finding or an alert. Historical records are not rewritten, including by a
-- rollback. To remove the schema entirely, run rollback/remove.sql after this,
-- and read the warning at the top of that file first.

begin;

drop trigger if exists thy_findings_raise_alert on thy_continuity_findings;
drop trigger if exists thy_facts_conflict_watch on thy_controlling_facts;

-- The append-only guard is deliberately left in place: disarming the watchdog
-- must not also make history editable. Drop it only in remove.sql.

-- Park every open alert rather than deleting it, so the disarm is on the record.
update thy_continuity_alerts
   set alert_state = 'CLEARED',
       cleared_at = now(),
       clearance_note = coalesce(clearance_note, '') ||
         '[WATCHDOG DISARMED ' || now()::text || ' · rollback/disarm.sql · alert not adjudicated]'
 where alert_state <> 'CLEARED';

commit;
