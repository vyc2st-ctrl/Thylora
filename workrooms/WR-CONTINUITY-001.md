# THY-CONTINUITY-WATCHDOG-001 · Continuity Watchdog

**Lane:** continuity · drift detection · hold gate · carryforward integrity
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
**Source repository:** `vyc2st-ctrl/Thylora`, branch `claude/continuity-watchdog-spine-4ldyyg`
**Opened:** 2026-09-18

```
D = max_i | F_i(current) - F_i(controlling) |
unauthorized D > 0  =>  HOLD + ALERT
```

---

## 1 · Authority position

Read before execution and held throughout:

- `DASHBOARD_AUTHORITY.md` — this repository is **not** the deployment authority
  for the Chairman dashboard. **Nothing in this delta touches
  `dashboard-current-head.html`.** The dashboard surface here is a read side the
  authoritative dashboard calls; it is not a dashboard.
- `dashboard-baseline.json` — floor `THY-DASH-FLOOR-20260823-001`. **No baseline
  capability was removed, renamed or disconnected.**
- `workrooms/WR-RAELINK-001.md` — still OPEN, and carried forward by this delta
  rather than replaced. Its blocker B1 (backend unreachable) still stands and is
  re-confirmed below.
- Nothing was published. No imagery was generated. No DDL was applied to
  production. No historical record was rewritten — the schema refuses to.

---

## 2 · The answer, A through I

### A · Schema reuse

Nothing was re-invented that already exists.

| Reused | From | How |
|---|---|---|
| Append-only event trail written by trigger | `rael_pipeline_events` (`0002_media_pipeline.sql`) | `thy_controlling_facts` is append-only and enforced by `thy_facts_no_rewrite`, so a direct column write still leaves the original |
| `to_regclass`-guarded registry link | `0010_registry_link.sql` | `0003` registers the workstream in `thylora_departments` only if that table exists and has the expected column; otherwise it no-ops with a notice |
| Guarded enum creation, `if not exists` everywhere, idempotent re-apply | all RAE Link migrations | Every file here applies twice with no error |
| Evidence-bearing state constraint | `rael_payouts` "PAID requires evidence" | `thy_alert_clearance_evidence` — an alert cannot be cleared without a hand and a reason; `thy_carryforward_closure_evidence` — a workstream cannot leave the active set without a closure reference |
| Blocker list that names every unmet prerequisite at once | `rael_publish_gate` | A check returns every field that lost continuity in one call, each with its classification and detail |
| Local validation harness and `supabase_stub.sql` | `db/rae-link/validation/` | `db/continuity/validation/run.sh` reuses the same stub file rather than copying it |
| Test runner and layout | `tests/*.test.mjs`, `npm test` | Six new suites in the same place, same command |

**Deliberately not reused:** no second identity system, no second product,
order, approval or department truth. The watchdog records what the controlling
value *was* and whether the produced value still matches it. It does not own
the value.

### B · Code path

```
spine/continuity/
  fields.mjs      the 19 watched fields and what a legal change to each looks like
  normalize.mjs   comparison normalization and the continuity digest
  watchdog.mjs    compileControlling · preTask · postTask · classifyField · carryforwardGap · alertRecord
  gate.mjs        runGuarded — where the watchdog sits in the real path
```

A task does not call the comparison and then decide what to do about it. It runs
*inside* the gate:

```js
import { runGuarded, verdictLine } from './spine/continuity/gate.mjs';

const record = await runGuarded(
  { task_ref: 'T-1234', sequence_no: 470, subjects: ['P-001'] },
  { facts, supersessions, authorities, carryforward: { previous, carried, closed } },
  async brief => doTheWork(brief)          // the brief is sealed before work starts
);

if (!record.proceed_allowed) throw new Error(verdictLine(record));
```

`runGuarded` returns one of `PASSED`, `HELD_PRE`, `HELD_POST`,
`HELD_CARRYFORWARD`, `FAILED`. A held task never returns `proceed_allowed`.
`HELD_PRE` means the work function **never ran**: if the controlling set already
contradicts itself there is no target to build against, and producing anything
would silently pick a side.

Backend path, same rule, for writes that never pass through the application:

```
thy_continuity_compile(task, subjects, fields)   PRE
thy_continuity_check(task, 'POST', seq, produced) POST — writes check, findings, alert
thy_continuity_carryforward_gap(prev_seq, seq)    carryforward
```

Records are handed to an optional `sink` rather than written by the gate, so the
gate holds whether or not storage is reachable. A watchdog that only works when
the backend is up is not a watchdog — and this session's backend is down.

### C · Trigger and function design

| Name | Kind | What it does |
|---|---|---|
| `thy_continuity_normalize` | function | Kind-aware normalization. Case, quote style and surrounding whitespace are not continuity; meaning is. Spacing *inside* a value is left alone so distinct values are not quietly merged |
| `thy_continuity_authority_valid` | function | An authority counts only as a live, unexpired, unrevoked row. Verified on the controlling side |
| `thy_continuity_compile` | function | PRE. Current facts for the named subjects and fields, plus every contradiction inside the controlling set |
| `thy_continuity_classify` | function | One field, one verdict. Conflict outranks absence, absence outranks difference, supersession is checked before any advance rule |
| `thy_continuity_check` | function | POST. Writes one check row and one finding per field, updates `d_max` / breach counts / `proceed_allowed` |
| `thy_continuity_carryforward_gap` | function | Active workstreams at sequence *n-1* with no row at *n* and no closure record |
| `thy_facts_no_rewrite` | **trigger** BEFORE UPDATE OR DELETE | A controlling fact cannot be edited or deleted. A correction is a new fact plus a supersession pointer |
| `thy_facts_conflict_watch` | **trigger** AFTER INSERT | A second current fact disagreeing with the standing one raises a check and an alert **on write** — detection before propagation, not at the next task boundary |
| `thy_findings_raise_alert` | **trigger** AFTER INSERT | The alert is raised from the findings, so it cannot be skipped by writing findings another way |

Two check constraints make the equation structural rather than advisory:
`thy_finding_distance_matches_class` (`d = 1` exactly when the classification is
a breach) and `thy_check_hold_on_hard_breach` (a check carrying a hard-watch
breach cannot claim `proceed_allowed`).

### D · Conflict handling

Conflict is its own classification, never quietly resolved:

1. **Two current controlling facts disagree** → `CONFLICTING` at **PRE**, before
   work. `thy_facts_conflict_watch` also catches it at write time.
2. **A supersession points elsewhere than the produced value** → `CONFLICTING`,
   not a pass. Two authorities disagreeing is worse than one silent change.
3. **A supersession records a prior value that never stood** → `CONFLICTING`.
4. **A controlling value that is not on its own declared ladder** → `CONFLICTING`
   (the registry and the fact disagree, which is not the task's fault).

The watchdog never picks a winner between contradictory controlling facts. It
holds and names both values, because choosing one would be the exact failure it
exists to catch.

### E · Alert record

Raised by trigger, shaped the same in SQL and JS. It carries what is needed to
re-run the comparison, not a count:

```
alert_code    THY-CONT-<sequence>-<8 hex>     stable for the same breach
severity      HOLD (hard-watch) | WARN (soft-watch)
alert_state   OPEN | ACKNOWLEDGED | CLEARED
headline      "HOLD · 2 hard-watch field(s) lost continuity at POST."
breaches[]    subject, field, classification, controlling value, current value,
              magnitude, and a plain-language detail naming the reason
evidence      brief_digest, produced_digest, field_count, breach_count, hard_breach_count
```

Clearing is a named, evidenced act: `thy_continuity_clear_alert` refuses an
empty reason, and `thy_alert_clearance_evidence` refuses a cleared row without
one at the database level. `rollback/disarm.sql` parks open alerts with an
explicit `[WATCHDOG DISARMED …]` note rather than deleting them, so a disarm is
itself on the record.

### F · Dashboard surface

`DASHBOARD_AUTHORITY.md` holds. No dashboard file was edited. What `0003` adds
is a read side the authoritative dashboard calls — one panel, one fetch:

| Surface | Answers |
|---|---|
| `thy_continuity_hold_state` | Is the spine holding right now, on how many holds, how many warnings, how many fields in breach |
| `thy_continuity_open_alerts` | Every open alert with its breaches expanded — the Chairman-facing panel |
| `thy_continuity_dashboard` | Current controlling value per subject and field, with its last verdict and `in_breach` |
| `thy_continuity_workstream_state` | Latest sequence against the one before it, with `carried_forward` per workstream |
| `thy_continuity_dashboard_feed(limit)` | All four plus the watch registry in **one** jsonb payload |

Reads are open to any signed-in reader under RLS. Writing a controlling fact, a
supersession or an authority stays with the service role. `ACCESS ≠ AUTHORITY`.

### G · Test suite

`npm test` → **106 tests, 106 pass, 0 fail** (48 pre-existing RAE Link, 58 new).

| Suite | Tests | Covers |
|---|---|---|
| `continuity.fields.test.mjs` | 7 | The 19 fields in order, all hard-watch, ladders valid, **the SQL seed and the JS registry are the same registry**, extension validation |
| `continuity.watchdog.test.mjs` | 27 | All six classifications, PRE sealing and digest stability, authority verification, ladders, ages against elapsed time, sets, magnitude never softening the verdict, `D = max` |
| `continuity.carryforward.test.mjs` | 8 | Vanished vs closed-on-the-record, several at once, empty carryforward, the same loss through the ordinary field check |
| `continuity.alerts.test.mjs` | 8 | HOLD vs WARN, named values and reasons, evidence sufficient to re-run, stable alert codes, PRE conflict alerts |
| `continuity.gate.test.mjs` | 7 | The gate itself: work never runs against a contradictory brief, carryforward holds a task whose fields all matched, a throwing task fails rather than passes, holding with no sink |
| `continuity.parity.test.mjs` | 1 (26 cases) | **26 cases through PostgreSQL and through JavaScript; fails if any verdict differs.** Skips, reported as skipped, with no local PostgreSQL |

Backend: `db/continuity/validation/run.sh` → exit 0. Three migrations applied,
re-applied for idempotency, 25 behavioural checks, rollback disarm + remove
leaving **0** tables, then the three migrations applied again from empty.

### H · Rollback path

Two steps, in order, both re-runnable:

1. **`rollback/disarm.sql`** — drops the alerting and conflict-watch triggers and
   parks open alerts with a disarm note. Every record is kept. The append-only
   guard is deliberately **left in place**: disarming the watchdog must not also
   make history editable. Reversible by re-applying `0002`.
2. **`rollback/remove.sql`** — drops the schema entirely. It carries the `\copy`
   export lines at the top, because this step *is* a loss of history and the file
   says so. Nothing outside the `thy_continuity_*` / `thy_controlling_facts`
   namespace is touched.

Both are exercised in the validation run, and the migrations are re-applied
afterwards to prove the rollback is not one-way.

### I · Exact next action

**Apply `db/continuity/0001`, `0002`, `0003` to `thylora-dash` — Chairman
execution, because B1 stands.** The backend host was tried again this session:

```
https://jvsdxhrfhtlgaknhjxlz.supabase.co  ->  CONNECT tunnel failed, response 403
2026-09-18, egress policy denial, same as WR-RAELINK-001 B1
```

Then, in order, none of which needs an authority this build lacks:

1. Seed `thy_continuity_authorities` with the real Chairman authority references.
   Until a live authority exists, every ladder advance and every price change
   classifies as `DRIFTED` — that is the designed default, not a bug.
2. Load the controlling facts for sequence 469 into `thy_controlling_facts`, and
   the active workstreams into `thy_workstream_carryforward` at sequence 469.
3. Wire `runGuarded` around the first real task and read `verdictLine(record)`.
4. Add the `thy_continuity_dashboard_feed` panel to
   `vyc2st-ctrl/thylora-executive-dashboard` — **there**, not here.

---

## 3 · Evidence

| Claim | Evidence |
|---|---|
| Tests pass | `npm test` → 106 tests, 106 pass, 0 fail, 547 ms |
| The backend rule and the JS rule agree | 26 classification cases run through both; `continuity.parity.test.mjs` passes |
| The SQL registry and the JS registry are one registry | `continuity.fields.test.mjs` parses the migration's seed block and compares every field, kind, rule, authority flag, ladder and order |
| Migrations apply cleanly and twice | 3 files, two passes, exit 0 |
| History cannot be rewritten | `update` and `delete` on `thy_controlling_facts` both rejected by trigger, not by a comment |
| A breach cannot claim proceed | `insert` of a check with `hard_breach_count = 1, proceed_allowed = true` rejected by `thy_check_hold_on_hard_breach` |
| Distance cannot disagree with classification | `insert` of a `DRIFTED` finding with `d = 0` rejected by `thy_finding_distance_matches_class` |
| An alert cannot be cleared silently | Clearing with a blank reason raises `THY_CONTINUITY_CLEARANCE_NOTE_REQUIRED` |
| A workstream cannot leave the active set silently | `insert` of a `CLOSED` row with no `closure_ref` rejected by `thy_carryforward_closure_evidence` |
| A contradictory controlling set is caught before work | `HELD_PRE` with the work function asserted never to have run |
| One letter holds a task | `Ada Vyc2st` → `Ada Vycst` gives `D = 1`, `proceed_allowed = false`, `HOLD` |
| Formatting is not drift | `  ADA   Vyc2st ` against `Ada Vyc2st` gives `UNCHANGED` |
| Self-declared authority authorizes nothing | An `authority_ref` not in the registry classifies `DRIFTED`; with no registry compiled at all, also `DRIFTED` |
| Magnitude never softens the verdict | Price drift of 1 and of 4800 produce the same `D` and the same hold |
| Rollback is reversible | disarm → remove → 0 tables → all three migrations re-applied, exit 0 |
| Backend unreachable | `CONNECT tunnel failed, response 403`, 2026-09-18 |

**Not measured, and not claimed:** behaviour against the live backend's existing
objects, live query latency, and whether any live name collides with the `thy_`
prefix. Those need B1 cleared. They are named here rather than estimated.

---

## 4 · Unresolved blockers

### B1 · Backend unreachable from this session — **HARD, carried from WR-RAELINK-001**
`jvsdxhrfhtlgaknhjxlz.supabase.co:443` returned **403 on CONNECT**, retried this
session. Consequences, carried honestly:
- The live schema could not be inspected. The `thylora_departments` link in
  `0003` is `to_regclass`-guarded and no-ops on a shape mismatch.
- Sequence 469's actual controlling facts could not be read, so
  `thy_controlling_facts` ships **empty**. The watchdog is correct and tested but
  watches nothing until it is loaded. That is step 2 of the next action.
- No live read, write or latency measurement was possible.

**Needs:** a session with egress to the backend host, or a Chairman-run apply.

### B2 · Production DDL is a held action — **BY RULE**
`0001`–`0003` mutate the production backend. Held for Chairman execution. The
files are complete, reviewable and validated locally; nothing was applied.

### B3 · The authority registry is empty until the Chairman fills it — **HELD**
`thy_continuity_authorities` ships with no rows. Every authority-bearing change
therefore classifies as `DRIFTED` until real references are seeded. This is the
designed default: authorization comes from the controlling side, and inventing a
default authority would invent an authority this build does not have.

### B4 · Controlling facts for sequences ≤ 469 are not loaded — **HELD, needs B1**
The watchdog compares against what is in `thy_controlling_facts`. Backfilling it
is a read of the live backend plus a Chairman confirmation of what is
controlling. Nothing was guessed and nothing was seeded from prompt text.

### B5 · Dashboard panel placement — **BY AUTHORITY**
`thy_continuity_dashboard_feed` exists and is tested. Adding the panel belongs to
`vyc2st-ctrl/thylora-executive-dashboard`, which is outside this repository.

---

## 5 · Gap report

Nine inspections against the design. **Routed** = handled in this delta;
**held** = needs an authority this build lacks.

| # | Inspection | Gap found | Disposition |
|---|---|---|---|
| 1 | Missing prerequisite | A task could start against a controlling set that already contradicts itself | **Routed** — PRE holds and the work function never runs |
| 1b | Missing prerequisite | A task learning its breaches one at a time | **Routed** — every field is classified in one call, each with its own detail |
| 2 | Hidden handoff | A correction quietly overwriting the controlling value | **Routed** — `thy_facts_no_rewrite` refuses update and delete; a correction is a new fact |
| 2b | Hidden handoff | A breach written directly to findings, skipping the alert | **Routed** — the alert is raised by trigger from the findings |
| 2c | Hidden handoff | A contradictory fact landing quietly and being discovered a task later | **Routed** — `thy_facts_conflict_watch` raises on write |
| 3 | Authority mismatch | Produced state authorizing its own change | **Routed** — an `authority_ref` counts only as a live row in the registry; with no registry compiled the answer is HOLD, not trust |
| 3b | Authority mismatch | A supersession with no approval acting as one | **Routed** — `approved_at` and a live `authority_ref` are both required |
| 3c | Authority mismatch | A browser session clearing a hold | **Routed** — clearance is a security-definer function requiring a reason; writes are service-role only under RLS |
| 4 | Evidence gap | An alert saying "continuity lost" with no way to check | **Routed** — both values, the magnitude, the reason, and both digests travel on the alert |
| 4b | Evidence gap | Live backend shape unverifiable | **Held → B1.** Routed as far as possible: validated end to end on PostgreSQL 16 by a committed harness, registry link `to_regclass`-guarded |
| 5 | Unnecessary waiting | The watchdog useless until the backend exists | **Routed** — `gate.mjs` holds with no storage at all; the sink is optional |
| 5b | Unnecessary waiting | A soft concern stopping all work | **Routed** — soft-watch extensions raise `WARN` and do not hold; the 19 named fields are all hard |
| 6 | Friction | "Held" with no reason | **Routed** — `verdictLine` names every field and its classification; no blocker is anonymous |
| 6b | Friction | A legitimate change treated as drift forever | **Routed** — supersession, ladder advance and monotonic advance are all first-class passes, not exceptions |
| 6c | Friction | A task punished for not touching a subject | **Routed** — a subject the task never produced is `UNCHANGED`; only a produced subject with a dropped field is `MISSING` |
| 7 | Rights/privacy | The watchdog becoming a second identity store | **Routed** — it records that a value was controlling and whether it still matches; it owns no person, product or approval record |
| 7b | Rights/privacy | Drift detection leaking values to any reader | **Partly routed** — RLS limits reads to signed-in readers; finer scoping needs the live role model → B1 |
| 8 | Opportunity | Only the 19 named fields ever watchable | **Routed** — `extendField` registers more, soft-watch by default because a hard watch stops work |
| 8b | Opportunity | The dashboard needing many queries | **Routed** — one feed function returns the whole panel |
| 9 | Failure/recovery | The watchdog itself being wrong and unstoppable | **Routed** — `rollback/disarm.sql` stops it in one step while keeping every record |
| 9b | Failure/recovery | Rollback destroying history | **Routed** — disarm keeps everything and leaves the append-only guard in place; remove carries its export lines and its warning |
| 9c | Failure/recovery | Two implementations drifting from each other | **Routed** — 26 cases run through both; the registries are compared field by field |
| 9d | Failure/recovery | A numeric field holding an unparseable value and being called drift for it | **Routed** — it falls back to text comparison on both sides |
| 9e | Failure/recovery | A vanished workstream passing because every field matched | **Routed** — carryforward is checked separately and holds a task whose fields all matched |

**24 gaps inspected · 22 routed · 1 partly routed · 1 held against a named blocker.**

---

## 6 · Restart vector

If this work resumes cold:

1. **Read first:** `DASHBOARD_AUTHORITY.md`, `dashboard-baseline.json`,
   `workrooms/WR-RAELINK-001.md`, this file. Confirm dashboard authority still
   sits outside this repository.
2. **Verify the floor:** `npm test` → expect 106 passing. Then
   `sudo service postgresql start && db/continuity/validation/run.sh` → expect
   exit 0 and `tables_left_after_remove = 0`.
3. **Check B1 first.** Try the backend host. If reachable, the next executable
   action is section 2 · I.
4. **Do not:** apply DDL to production without Chairman execution, seed a default
   authority, guess a controlling fact, edit a dashboard file, or weaken a hard
   watch to make a task pass.

---

## 7 · State

| | |
|---|---|
| Workroom | **OPEN** |
| Schema | Written · validated on PostgreSQL 16 · idempotent · rollback proved reversible · **not applied to the live backend** (B1, B2) |
| Spine code | Built · gated · holds with no backend |
| Tests | 106 / 106 JavaScript · 26 / 26 SQL↔JS parity cases · 3 / 3 migrations applied twice · 6 / 6 constraint rejections |
| Controlling facts | **Empty** — needs B1, then B4 |
| Authority registry | **Empty** by design — needs B3 |
| Dashboard panel | Read side built here; placement held (B5) |
| Carried forward | `WR-RAELINK-001` remains **OPEN**, unchanged by this delta |
| Baseline regression | **None.** No baseline capability removed, renamed or disconnected. |

NO LOSS. DO NOT GO BACKWARD. ONE SOURCE OF TRUTH. ACCESS ≠ AUTHORITY.
CURRENT BACKEND OUTRANKS HISTORICAL PROMPTS.
