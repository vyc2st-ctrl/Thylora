-- STATUS: PROPOSED — NOT APPLIED. Append-only record of this audit for thy_sequence_ledger.
-- Head at read time was 595. If the head has moved, set previous_sequence_no to the new head.
-- Confirm truth_class value against existing rows (select distinct truth_class from thy_sequence_ledger) before applying.
insert into public.thy_sequence_ledger
  (sequence_no, previous_sequence_no, occurred_utc, occurred_local, local_timezone,
   why_change_occurred, what_changed, why_it_changed, what_remained, authority, truth_class,
   next_better_question, restart_point, supersedes_sequence_no, source_ref)
values
  (596, 595, now(), (now() at time zone 'America/New_York'), 'America/New_York',
   'Chairman directive: SYSTEM PROMOTION AUDIT under QYRIS-2ST and M=DxPxExWxT.',
   'Read-only audit of 907 tables. 69 at M=1; 304 WITNESS MISSING; 285 EXECUTION MISSING; 163 POPULATION MISSING; 58 SCAFFOLD ONLY; 24 TRANSFER MISSING; 3 INTENTIONALLY EMPTY; 1 UNKNOWN. Repair queue R1-R12 filed.',
   'Mechanisms were being introduced faster than they were executed, witnessed and transferred; the audit makes the gap measurable per table.',
   'No rows populated. No table, row, predecessor or branch modified. All prior sequences stand.',
   'Chairman directive (THYLORA HEAD-SPINE FORWARD)', 'AUDIT_READ_ONLY',
   'R2: through which path did the single existing order arrive, given stripe_webhook_events is empty?',
   'Resume at repair R1 (witness trigger) after Chairman approval; then R2 commerce chain witness.',
   null,
   'vyc2st-ctrl/Thylora branch claude/thylora-system-promotion-audit-7rgw0w audits/system-promotion/REPORT.md');
