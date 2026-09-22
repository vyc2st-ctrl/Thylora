# WR-HEAD-588 · THYLORA HEAD — SPINE FORWARD

**Lane:** head assembly · dynamic gate law · QYRIS transfer recursion · milestone 874 floor · dashboard closeout
**Work:** `THY-WORK-OMNIVIEW-ROUNDTRIP-587`, `THY-WORK-DYNAMIC-GATE-LAW-588`,
`THY-WORK-TRANSFER-RECURSION-588`, `THY-WORK-MILESTONE-874-588`,
`THY-WORK-DASHBOARD-INTERACTION-CLOSEOUT-562`
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
**Source repository:** `vyc2st-ctrl/Thylora`, branch `claude/thylora-head-spine-forward-k4po2s`
**Opened:** 2026-09-22 · **Sequence:** 588

---

## 1 · Authority position

Held throughout, and read before anything was written:

- `DASHBOARD_AUTHORITY.md` — this repository is **not** the deployment authority.
  Authority remains `vyc2st-ctrl/thylora-executive-dashboard` → `thylora-public-world`.
  **Nothing in this delta is live.** `GATE-DEPLOYMENT-AUTHORITY` now holds that
  position as a versioned gate rather than as a sentence in a file.
- `dashboard-baseline.json` — floor `THY-DASH-FLOOR-20260823-001`. **No baseline
  capability was removed, renamed or disconnected.** The pre-existing seven-capability
  shortfall recorded at 587 is unchanged and is now `GATE-BASELINE-FLOOR`, BLOCKED.
- Backend DDL is **reviewable, not applied**. Four packs are written and verified
  against PostgreSQL 16. None has touched `thylora-dash`.

## 2 · Evidence position

This session **could not reach** `jvsdxhrfhtlgaknhjxlz.supabase.co`. Egress was denied,
the same gap `WR-RAELINK-001` recorded on 2026-09-11 and `WR-OMNIVIEW-587` recorded
earlier on 2026-09-22.

Stated rather than worked around:

- **No live backend row was read.** Nothing here claims the live state of any THYLORA table.
- **No live backend row was written.** "WRITE BACKEND" was executed as: the schema,
  the read model and the write path were written as reviewable SQL and verified by
  applying them to a throwaway PostgreSQL 16 database.
- **"VERIFY READBACK" was executed against that database**, not against `thylora-dash`.
  Every readback quoted below came from a real database with the packs applied.
- Every commerce figure at 588 is recorded as **UNMEASURED / UNREACHABLE with a reason**,
  never as zero. The milestone table refuses to store it any other way.

This is now a gate in its own right: `GATE-BACKEND-EGRESS`, BLOCKED, and it is what
the head read returns as the **next question**.

---

## 3 · HEAD

The head was not missing. It was **never assembled**.

Four branches each held real, tested work and none was merged. This branch is the
merge of all four, plus this delta:

| Branch | Merged | Lines | Conflicts |
|---|---|---|---|
| `claude/thylora-omniview-sequence-dxpnqw` | yes | 3,851 | 0 |
| `claude/thylora-qyris-support-build-aiopuf` | yes | 9,323 | 0 |
| `claude/thylora-genealogy-commerce-m6q9hn` | yes | 2,702 | 0 |
| `claude/tomorrows-starting-packet-krgmpj` | yes | 3,175 | 0 |

All four merged clean. The merged head passed **339 tests before this delta began**,
which is the evidence that they are head material and not drafts.

`npm test` on the head now: **418 pass, 0 fail.**

## 4 · QYRIS — visible

QYRIS is visible in three places, and all three are reachable:

1. **The surface** — `/qyris` (`qyris/index.html`), routed in `vercel.json`, linked
   from both `app/index.html` and `public-site/index.html`. It arrived on the
   qyris-support branch and is in the head for the first time here.
2. **The read trace** — every OMNIVIEW answer carries `qyris`: scope, topic, read
   time, sequence head, the exact tables read with row counts, and an explicit
   `not_read` list. An answer may claim only the tables in `tables_read`.
3. **The recursion** — new in this delta. `db/qyris-transfer/`, below.

## 5 · EXISTING BRANCH DELTA — what actually landed

Read before anything was declared. None of these was a stub.

- **`thylora-omniview-sequence-dxpnqw`** — the OMNIVIEW read model: 7 migrations,
  8 tables, 17 functions, the sequence ledger opened at 587, CONTEXT and SEQUENCE
  surfaces, 4 proof tests. This is the real 587/588 spine.
- **`thylora-qyris-support-build-aiopuf`** — the QYRIS surface and question grammar:
  9 migrations, the `/qyris` app, premarriage and industry packs, Trusted Six support,
  5 test suites. **9,323 lines — the largest of the four.**
- **`thylora-genealogy-commerce-m6q9hn`** — genealogy evidence journey, understanding
  gate, teacher card, first shirt spec and SVGs, book/comic pipeline.
- **`tomorrows-starting-packet-krgmpj`** — World Windows (3), the lexicon, store
  quickcheck artifact and manifest, the tomorrow floor migrations.

**Not delivered before this session:** none of it was on `main`, and the workflows
that were supposed to carry the dashboard half forward had not run a single job.

---

## 6 · What this delta adds

### GATE THAT — `db/gate-law/`

Dynamic versioned gates. The rule itself is the record.

| Law | Enforced by |
|---|---|
| HOLD CURRENT RULE STRONGLY | `thy_gate_law_current` = highest version, unfiltered by state |
| NO SILENT MUTATION | every UPDATE and DELETE refused at the table; no policy grants either |
| NO OLD RULE OVERRIDING NEWER RULE | `GATE_LAW_STALE_VERSION` + `GATE_LAW_SUPERSEDES_MISMATCH` |
| EXPLICIT SUPERSESSION ONLY | v1 supersedes nothing and says so; every later version names what it replaces |

Eleven fields travel with every version: SCOPE, AUTHORITY, EVIDENCE, CONTEXT,
TRIGGER, STATE, EXCEPTION, VERSION, SUPERSEDES, READBACK, NEXT REVIEW.
`EXCEPTION` is `not null` — a gate with no exception must say `NO EXCEPTION`, so
silence is never read as permission. `NEXT REVIEW` is a date **or** a stated reason
there is none. A state change is a new version; there is no setter for `gate_state`.

Seven gates are in force at 588: three BLOCKED, one OPEN, one HELD, two PASSED.

### QYRIS TRANSFER — `db/qyris-transfer/`

`Q → Y → R → I → S → T → Q′`. The recursion that was missing.

- **TRANSFER CREATES THE NEXT CONTEXT.** `thy_qyris_transfer` opens the successor
  itself; a transfer with no next question is refused; the only way a chain ends is
  `thy_qyris_terminate`, which demands a reason.
- **PRESERVE OPEN FRONTIER.** Every open item is copied forward carrying the row it
  came from, the original is marked CARRIED, and the transfer re-checks afterwards
  that nothing was left behind. A frontier item cannot be deleted; it is carried or
  closed with a stated reason.

`0005_seed_cycle_588.sql` records the cycle **this build actually ran** — Q through S,
with the six items it genuinely leaves open. **T is deliberately not written:** the
transfer is what creates 589, and that is the Chairman's act, not this file's.

### SEQUENCE 874 — `db/milestone-874/`

**Sequence 874 has not happened.** The ledger head is 588. 286 sequences remain.

The comparison refuses rather than guesses, in two directions:

- A reading whose milestone is not already in the ledger is refused
  (`MILESTONE_UNRECORDED_SEQUENCE`). No sequence may be written to reach a milestone.
- A delta is reported **only** where both ends were measured numbers. Revenue at 874
  against an unmeasured 588 floor returns `NO DELTA`, not a number.

The ten measures are recorded at the floor. Four are counted **at apply time** from
real tables; six state why they could not be measured:

| Measure | 588 |
|---|---|
| Elapsed time | MEASURED — zero against itself |
| Revenue · Live products · Orders | **UNREACHABLE** — backend egress denied |
| Conversion | UNMEASURED — both inputs unmeasured |
| Social | UNMEASURED — no platform queried |
| Dashboard and app | MEASURED — 8 surfaces in source; live state **not claimed** |
| World Windows | MEASURED — 3 |
| Gate health | MEASURED — counted from the gate law at apply time |
| Canon changes | MEASURED — 11 statements at or before 588 |

### DASHBOARD — `db/spine-588/` and `app/omniview-surface.js`

`thy_spine_head()` returns the four required surfaces in one read: **TOPIC CONTEXT,
SEQUENCE LEDGER, CURRENT GATES, NEXT QUESTION.**

NEXT QUESTION did not exist before, because "the next question" lived in three places.
It now joins them and **orders** them: a BLOCKED gate outranks an open frontier item,
which outranks a topic question. The surface does not choose.

Two tabs were added to the existing panel — GATES and NEXT — alongside CONTEXT and
SEQUENCE. **No second dashboard was built.**

---

## 7 · OMNIVIEW TEST — the five named topics

`db/omniview/validation/proof_5_named_topics.sql` — **PROOF PASS.**

| Topic | Result |
|---|---|
| TIME RUN | answered from source |
| ALISTAIR | **refused** — registered at 588, no source anywhere in this repository |
| CASTLE | **refused** — registered at 587, still unseeded |
| STORE | answered from source |
| SPORTS | answered from source, as EVIDENCE only — **not canon** |

Each read returned, in one call: CURRENT AUTHORITY · SUPERSEDED STATE · PEOPLE ·
PLACES · OBJECTS · PRODUCTS · WORK · GATES · LAST RESTART · SOURCE REFERENCES,
in the order the read path declares.

ALISTAIR and SPORTS were **not registered** before this delta — a different and
fixable thing from "unknown". Both are now in the manifest with the Chairman holding
authority and the question that would settle them recorded:

- *Who is ALISTAIR in THYLORA — a person of the house, a character, or a lineage
  claim — and what source settles it?*
- *Is SPORTS the betting surface, the ERN sports edition lane, the FOOTBALL
  programme, or the parent of all three?*

**Nothing was invented from either name.** ALISTAIR returns zero canon statements.

## 8 · GATE TEST

`db/gate-law/validation/run.sh` — **exit 0.**

- 4 migrations applied twice (idempotency) — 8/8 OK
- **10/10 expect-reject cases rejected**, including: a later version that names
  nothing; a rule superseding version 1 while version 3 is in force; a rewritten
  version; an edit in place; a delete; a missing EXCEPTION; an unanswered NEXT REVIEW;
  an invented authority; superseding an undeclared gate; reviving a retired gate.
- `proof_gate_law.sql` — **PROOF PASS.** One gate through three versions: version 3
  held as current, both superseded rules readable newest-first, a stale rule refused
  without disturbing the current one, and the scope read returned only current versions.

## 9 · QYRIS LOOP TEST

`db/qyris-transfer/validation/run.sh` — **exit 0.**

- **11/11 expect-reject cases rejected**, including: a stage out of order; transfer
  at stage 2; a second Q; an orphan cycle; a deleted frontier item; a silent close;
  a chain ending on an open frontier; a silent termination; an edited stage; work
  added to a transferred cycle; a second successor.
- `proof_transfer.sql` — **PROOF PASS.** The loop ran twice. Each transfer created
  the next context and carried its open frontier: **2 items survived 2 transfers.**
  An explicitly closed item did not travel. A transfer to nowhere was refused.

## 10 · DASHBOARD TEST

`db/spine-588/validation/run.sh` — **exit 0.** `proof_head.sql` — **PROOF PASS.**
One read returned all four surfaces; CURRENT GATES showed only current versions with
a blocking one first; NEXT QUESTION came from a blocking gate ahead of every topic
question; milestone 874 still refused.

**Dead-control closeout continued.** The sweep was one-directional before: it caught
a control that was created and never wired, but only when the id was written as a
literal `id="..."`. It now runs **both directions** and understands three creation
forms (literal attribute, builder helper, property assignment):

- created and never wired → dead button
- **wired and never created → a crash the first time the surface opens** (new)
- every one of the four surfaces is reachable from both a tab and an entry point,
  and every named view has a loader behind it (new)

**Dead controls found: zero**, across the dashboard, member app, sports surface,
Time Run, public site, store, RAE Link, QYRIS and the OMNIVIEW surfaces.

## 11 · SEQUENCE LEDGER

| | |
|---|---|
| Ledger floor | 587 |
| Head | **588** |
| Sequences 1–586 | not imported; they remain pre-ledger context in `thylora_query_carryforward` |
| 589 | **not written.** It is created by the QYRIS transfer out of cycle 588 |
| 874 | **has not happened.** 286 sequences away |

The ledger refuses UPDATE and DELETE at the database level. A correction is a new
sequence naming what it supersedes. `GATE-SEQUENCE-HONESTY` holds this as law.

## 12 · BLOCKED WORKFLOW CAUSE

GitHub reported **"NO JOBS WERE RUN."** That was accurate, and it was not a job failure.

The last 20 workflow runs were all `conclusion: failure` with the **workflow file path
as the run name** — the signature of a run that failed at startup, before any job was
created.

**Root cause, one mechanism, four files.** Each embeds a Python raw string inside a
`run: |` block:

```yaml
        run: |
          insert=r'''
function workCard(x,kind){ ... }      <-- column 0
'''
```

In YAML, a non-empty line indented **less** than the block scalar **ends the block
scalar**. The parser then tried to read `function workCard(x,kind){...}` as a mapping
key, found no `:`, and the file failed to parse. GitHub cannot create jobs from a file
it cannot parse, so it recorded a startup failure with an empty job list.

Confirmed by parser, not by inference:

| File | `yaml.safe_load` before |
|---|---|
| `patch-dashboard-r6.yml` | ScannerError at line 37 |
| `patch-dashboard-r7.yml` | ScannerError at line 33 |
| `patch-dashboard-r7-repair.yml` | ScannerError at line 53 |
| `patch-dashboard-r8.yml` | ScannerError at line 73 |
| `patch-dashboard-r3.yml` | parses — its payload was already indented |
| `spine-forward-both.yml` | parses — its payload was already indented |

The two files that parse are the two that indent their payload. That is the whole
difference, and it is why some dashboard work landed and some silently did not.

## 13 · EXACT FIX

Indent the payload lines into the block scalar, matching the pattern the two working
files already use.

**The emitted script does not change at all.** GitHub strips the block scalar's common
indentation before running it, so the payload returns to column 0 exactly where the
author put it. Proven rather than asserted:

```
patch-dashboard-r6:        emitted python identical = True
patch-dashboard-r7:        emitted python identical = True
patch-dashboard-r7-repair: emitted python identical = True
patch-dashboard-r8:        emitted python identical = True
```

All six workflows now parse and declare a runnable job. **No workflow logic, no
baseline guard and no commit step was altered.**

Held by `tests/workflow-integrity.test.mjs` (27 tests) so it cannot come back:
no payload line at column 0 inside a step; block scalars end only on a YAML key;
triple-quoted strings balanced; every file declares a job, a runner and steps; every
dashboard patcher still refuses to patch a foreign baseline. Verified by
reintroducing the exact break — the suite went red, and green again on restore.

### What the fix then did, observed rather than predicted

The fix worked, and it had a consequence worth stating plainly. Four patchers had
been dormant **only** because they did not parse. Repairing the parse re-armed all
of them, and three fired on the very push that repaired them — because they were
triggered by a change to their own workflow file, which is exactly what the repair
was.

| Run | Result |
|---|---|
| `Patch THYLORA dashboard R7` | **success** — patched the head and pushed |
| `Patch THYLORA dashboard R6` | failure — patched fine, push rejected: `cannot lock ref` |
| `Build repaired THYLORA R7` | failure — same race |

The two failures were **not logic failures**. All three checked out the same commit,
patched the same file, and raced to push; R7 won. R6's log shows the patch applied
cleanly and only the push rejected.

The run names alone prove the parse fix landed: they now read *"Patch THYLORA
dashboard R7"* instead of the file path, and jobs were created and executed.

**Two things were changed in response**, and both are behaviour changes rather than
formatting, so they are named here:

1. **The three self-firing patchers now fire from a trigger file** —
   `.github/triggers/r3-dashboard.txt`, `r6-dashboard.txt`, `r7-dashboard.txt`,
   `r7-repair-dashboard.txt` — plus a manual `workflow_dispatch`. This is the
   convention `patch-dashboard-r8` and `spine-forward-both` already used, and it is
   why those two never self-fired. A workflow repair can no longer rewrite the head
   as a side effect.
2. **All six patchers share one concurrency group** (`thylora-dashboard-head`), so
   two can never again race for the same branch.

**R7's patch was kept, not reverted.** It is the Chairman's own workflow doing the
work it was written to do, blocked until now only by the parse bug. Reverting it
would be this session overriding that. One consequence is recorded rather than
hidden: **the head marker moved R5 → R7**, so R6, R7-repair and R8 — which all guard
on an R5 floor — will no longer match and will refuse to patch. That is their guard
working correctly, and it means the R6/R8 lanes now need the Chairman's decision
rather than a re-run.

This is held as `GATE-DASHBOARD-PATCHERS` (HELD).

### The new triggers were then tested by their own arrival

Adding `.github/triggers/*.txt` matched the new path filters, so the patchers fired
once more — the last time they can fire without being asked. That firing is the
proof the fix works, because this time nothing raced and nothing landed:

| Run | Result |
|---|---|
| `Patch THYLORA dashboard R3` | **cancelled** by the concurrency group |
| `Patch THYLORA dashboard R6` | **cancelled** by the concurrency group |
| `Patch THYLORA dashboard R7` | refused: `R5 floor marker missing; refuse silent patch` |
| `Build repaired THYLORA R7` | refused on the same guard |

Two were stopped by the shared group before they could run; the two that ran were
stopped by their own baseline guard, because the head is at R7 and they require R5.
**No push was made and the branch did not move.** Compare with the first firing, an
hour earlier, where three ran and one overwrote the head.

Both layers are doing their job: the group stops the race, and the baseline guard
stops the patch. The head is unchanged at `fc1b0c8`.

### One inherited test was too narrow

R7's patch introduced `<select data-speech-rate>`, and
`every form input is named or read` failed on it. That was a **false positive in the
test, not a regression in the patch**: the select is genuinely read, by
`closest('[data-speech-rate]').value` in a change listener. The test accepted only
an `id` or a `name`; a control reached through its own data attribute is a third,
equally real wiring, and the sweep now accepts it. Confirmed still strict by
injecting a genuinely orphaned input — the suite went red, then green on restore.

## 14 · WRITEBACK — verified readback

Every pack applied to a throwaway PostgreSQL 16 database, twice, then exercised.

```
db/omniview/validation/run.sh          exit 0   18 reject · 5 proof
db/gate-law/validation/run.sh          exit 0   10 reject · 1 proof
db/qyris-transfer/validation/run.sh    exit 0   11 reject · 1 proof
db/milestone-874/validation/run.sh     exit 0    9 reject · 1 proof
db/spine-588/validation/run.sh         exit 0    5 reject · 1 proof
                                                ---------------------
                                                53 reject · 9 proof

npm test                               418 pass · 0 fail
```

Readback from that database, quoted as returned:

> **NEXT QUESTION** — `GATE-BACKEND-EGRESS` · *What clears GATE-BACKEND-EGRESS? The
> backend of record is unreachable from build sessions. Backend state is written as
> reviewable SQL and verified locally; it is not applied and not read.*

> **MILESTONE 874** — *Sequence 874 has not happened. The ledger head is 588.
> 286 sequences remain, and not one of them may be written to reach this milestone.*

> **CURRENT GATES** — 3 blocked · 1 open · 2 settled, across 6 gates in force.

> **TOPIC CONTEXT** — 13 topics, sequence head 588.

## 15 · Findings

**FINDING 1 — the head was never assembled, and the workflows hid it.**
Four branches of finished, tested work sat unmerged while the workflows meant to carry
the dashboard half forward failed to parse on every push. The two failures compound:
the branches looked delivered because work was reported, and the workflows looked
attempted because runs appeared. Both are fixed here, and both are now held by tests.

**FINDING 2 — ALISTAIR has no source anywhere in this repository.**
Registered, authority on the Chairman, canon UNSEEDED, and the read refuses to answer.
This is the designed behaviour, not a gap. It joins CASTLE, INÉS, VERONICA, FOOTBALL
and VEHICLES — **six named topics now await a source**, and SPORTS awaits a definition.

**FINDING 3 — a dormant workflow is not a safe workflow.**
Four dashboard patchers were harmless only because they were broken. Repairing them
re-armed four agents that rewrite the head and push, and three fired immediately on
the repair itself. Anything that edits the head and pushes should fire deliberately,
never as a side effect of maintenance — now enforced by trigger-file activation and
a shared concurrency group, and held as `GATE-DASHBOARD-PATCHERS`.

**FINDING 4 — two lanes have now failed to reach the backend of record.**
`WR-RAELINK-001` on 2026-09-11 and this session on 2026-09-22. It is no longer a
per-session note; it is `GATE-BACKEND-EGRESS`, and it is the top of the queue. Until
it clears, every commerce number THYLORA reports is UNMEASURED — and the milestone
table now makes it impossible to record one as zero instead.

---

## 16 · RESTART

The head is assembled, tested and pushed. **Nothing is applied to `thylora-dash`, and
nothing is witnessed on `thylora-public-world`.**

Next, in order:

1. **Clear `GATE-BACKEND-EGRESS`** — it is the next question, and it blocks the other
   three. Either grant a session egress to `jvsdxhrfhtlgaknhjxlz.supabase.co`, or the
   Chairman runs the applies and pastes the readback.
2. **Apply the packs** in order: `db/omniview/` → `db/gate-law/` → `db/qyris-transfer/`
   → `db/milestone-874/` → `db/spine-588/`. Expect `sequence_head = 588`.
3. **Record the apply as sequence 589** — by running the QYRIS transfer out of cycle
   588, so 589 inherits the six open frontier items rather than starting clean. That
   transfer is what creates the next context.
4. **Merge the dashboard delta** into `vyc2st-ctrl/thylora-executive-dashboard` and
   witness CONTEXT, SEQUENCE, GATES and NEXT on `thylora-public-world`.
5. **Answer the two new questions:** who is ALISTAIR, and what is SPORTS.
6. **Take real readings at 874 when 874 arrives.** Not before. 286 sequences remain.

**Open frontier carried forward — 6 items**, recorded in `thy_qyris_frontier` on
cycle 588 and surfaced by NEXT QUESTION:

1. Four packs verified locally and not applied to `thylora-dash`.
2. The head is seven capabilities below `dashboard-baseline.json`; the live head was not checked.
3. No build session has reached the backend in two lanes; every commerce figure at 588 is UNMEASURED.
4. Five topics have no source; ALISTAIR and SPORTS join them at 588.
5. The Chairman local timezone of record is unknown, so LOCAL DATE/TIME still defaults to UTC.
6. Sequences 589–873 have not happened. Milestone 874 cannot be compared until they do.
