# Continuity Watchdog · backend

Workstream: **THY-CONTINUITY-WATCHDOG-001**
Backend of record: `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`) — **not applied**, see the workroom.

```
D = max_i | F_i(current) - F_i(controlling) |
unauthorized D > 0  =>  HOLD + ALERT
```

## Files

| File | Contents |
|---|---|
| `0001_continuity_watchdog.sql` | Watch registry (19 fields), controlling facts, authorities, supersessions, checks, findings, alerts, workstream carryforward |
| `0002_watchdog_functions.sql` | Normalization, authority check, `compile`, `classify`, `check`, `carryforward_gap`, and three triggers |
| `0003_dashboard_surface.sql` | Four read views, one feed function, alert clearance, RLS, department registration |
| `rollback/disarm.sql` | Stop holding and alerting, keep every record |
| `rollback/remove.sql` | Drop the schema — read the warning at the top first |
| `validation/run.sh` | Apply twice, run the behavioural checks, roll back, re-apply |
| `validation/behaviour.sql` | 25 checks; the `ERROR` lines are the passing result |

Apply in numeric order. Every file is idempotent and re-appliable.

## Distance

Distance is per field, not per character:

```
d(field) = 0   UNCHANGED · ADVANCED · EXPLICITLY_SUPERSEDED
d(field) = 1   DRIFTED   · MISSING  · CONFLICTING
```

`D = max(d)`, so `D > 0` is exactly "something moved and nothing authorized it".
Numeric fields also carry a raw `magnitude`, which is reported and never used to
soften the verdict: a price that drifts by one cent holds like one that drifts by
a thousand. Two check constraints enforce this rather than describing it —
`thy_finding_distance_matches_class` and `thy_check_hold_on_hard_breach`.

## The six classifications

| | Meaning | Proceed |
|---|---|---|
| `UNCHANGED` | Normalized values identical | yes |
| `ADVANCED` | Moved the one way the field is allowed to move: an age forward inside elapsed time, a ladder forward on a live authority, a set that only grew | yes |
| `EXPLICITLY_SUPERSEDED` | A supersession names this subject, this field, the value it came from, the value it goes to, and a live authority | yes |
| `DRIFTED` | Changed with nothing authorizing it | **no** |
| `MISSING` | Controlling carries a value, the produced state carries none, or a set member vanished | **no** |
| `CONFLICTING` | Two current controlling facts disagree, or a supersession points somewhere other than the produced value | **no** |

## Calling it

```sql
-- PRE: compile the controlling facts relevant to a task
select thy_continuity_compile('T-1234', array['P-001'], array['names','identity']);

-- POST: compare produced state and write the check, findings and any alert
select thy_continuity_check(
  'T-1234', 'POST', 470,
  '{"P-001": {"names": "Ada Vyc2st",
              "publication_state": {"value": "PUBLISHED",
                                    "authority_ref": "CHAIR-2026-09-18"}}}'::jsonb,
  array['P-001']);

-- Did an active workstream disappear between two sequences?
select thy_continuity_carryforward_gap(469, 470);

-- One payload for a dashboard panel
select thy_continuity_dashboard_feed(25);
```

A value is given bare, or wrapped as `{"value": …, "authority_ref": …}` when the
produced state carries the authority that moved it. An authority only counts
when it is a live row in `thy_continuity_authorities`; a reference the produced
state supplies about itself authorizes nothing.

## What the triggers hold

| Trigger | Holds |
|---|---|
| `thy_facts_no_rewrite` | A controlling fact cannot be updated or deleted. A correction is a new fact plus a supersession pointer. History is never rewritten, including by a rollback. |
| `thy_facts_conflict_watch` | A second current fact that disagrees with the standing one raises a check and an alert **on write**, not at the next task boundary. |
| `thy_findings_raise_alert` | The alert is raised from the findings, so whatever wrote the breach — the check function, the conflict watch, or a hand at the console — the alert exists. |

## Validation

```
sudo service postgresql start
db/continuity/validation/run.sh
```

Expect exit 0: three migrations applied twice, 25 behavioural checks, disarm and
remove leaving zero tables, then the three migrations applied again from empty.

`tests/continuity.parity.test.mjs` runs 26 classification cases through this
schema and through `spine/continuity/` and fails if any verdict differs. It
skips, reported as skipped, when no local PostgreSQL is reachable.

## Not done here

Nothing in this directory has been applied to the live backend, and nothing here
edits a dashboard file. `DASHBOARD_AUTHORITY.md` places the Chairman dashboard
outside this repository; `0003` offers a read side for it to call and stops
there.
