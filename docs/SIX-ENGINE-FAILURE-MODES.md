# Six Understanding Engine · failure modes

**Workroom:** `WR-SIXENGINE-001`
**Runtime:** `six-engine/lib/failures.js` · **Backend:** `sixu_run_failures`

Every failure mode here is a way an engine can look like it is teaching while it
is not. Each carries a detector that runs against the finished run record, so the
failure is caught by the machine rather than noticed later by a person — if it is
noticed at all.

| Severity | Effect |
|---|---|
| `BLOCKING` | halts the answer; `sixu_close_run` refuses to mark the run `COMPLETE` |
| `CORRECTING` | rewrites the answer before it is shown |
| `NOTING` | recorded on the run and shown to the adult reviewing it |

---

## FM-01 · Silent word-sense guess — `BLOCKING`

A word with more than one job in this context was resolved without the context
separating the senses.

**Detects:** any unresolved ambiguity in the run's language report.
**Response:** ask the learner which job the word is doing. Do not proceed on a guess.

## FM-02 · Language failure read as a mathematics deficit — `BLOCKING`

A wrong answer to a word problem taken as evidence about the mathematics when the
sentence was never understood. *This is the failure the whole load-separation
module exists to stop.*

**Detects:** a `SUPPORTED_*` deficit claim where `L` is null or below 0.5.
**Response:** report `LANGUAGE_BLOCKED`, discard the uncontrolled M and S, re-present in language-controlled form.
**Also held by:** `sixu_low_language_forbids_deficit_claim` in the schema.

## FM-03 · Confidence above the evidence — `CORRECTING`

Stated confidence exceeds the strength of the independent lines under it.

**Detects:** `confidence > cap` across the graded positions.
**Response:** lower the stated confidence to the cap and say what the cap is.
**Also held by:** `sixu_confidence_within_evidence_cap`.

## FM-04 · Contested presented as settled — `BLOCKING`

A question the field is split on, answered as a single fact.

**Detects:** a route requiring a contest report that produced none.
**Response:** return every position with its evidence and standing, and what would settle it.

## FM-05 · Gap in the record read as a finding — `CORRECTING`

Absence of a record treated as evidence that the event did not happen.

**Detects:** a `RESOLVED` state returned over an open `RECORD_GAP`.
**Response:** report the gap, who kept the records and who was outside them. Read silence as evidence about the record-keeping.

## FM-06 · Explanation landed on nothing — `BLOCKING`

The explanation was delivered over an unmet prerequisite.

**Detects:** unmet prerequisites with `EXPLAIN` run and `started_at_floor` false.
**Response:** start at the floor concept instead.

## FM-07 · Simplification that shrank the concept — `BLOCKING`

The child-facing wording dropped a concept invariant.

**Detects:** a failed parity check.
**Response:** refuse the wording. Keep the invariant, reduce only the language.

## FM-08 · Answering a malformed question as asked — `BLOCKING`

The question carried an assumption never established, and the answer let it
through as fact.

**Detects:** a presupposition on a route that is not `MALFORMED`.
**Response:** name the assumption and offer the repaired question.
**Also held by:** `sixu_route_malformed_needs_presupposition`.

## FM-09 · Source monoculture — `NOTING`

Several sources counted that all trace to one origin.

**Detects:** the `REPETITION_COLLAPSED` flag on any graded position.
**Response:** collapse them to one line and say so.

## FM-10 · Understanding assumed, never checked — `CORRECTING`

An explanation was delivered with no transfer task, so nothing verified the
learner understood. A run that halted *before* explaining is not charged with
this — it had nothing to verify.

**Detects:** route requires `TRANSFER`, an explanation exists, no task was produced.
**Response:** attach the transfer task before closing the run.

## FM-11 · Endless prerequisite regress — `NOTING`

The prerequisite walk hit its depth cap or a cycle.

**Detects:** `truncated`, or any cycle in the walk.
**Response:** teach from the deepest concept reached and mark the chain below it unexamined.

## FM-12 · Safety-gated topic answered without the gate — `BLOCKING`

A medical, legal, financial or safety question answered to a child without
routing to a named adult. Stopping at the gate is correct behaviour and is **not**
charged as a failure; answering anyway is.

**Detects:** a guardian gate, not routed, and an answer or explanation produced.
**Response:** give general understanding only and route to the guardian.

## FM-13 · Stale evidence — `NOTING`

The strongest lines are old enough that the position may have moved.

**Detects:** the `EVIDENCE_MAY_BE_STALE` flag.
**Response:** date the evidence in the answer and flag it for refresh.

## FM-14 · Personal question answered from general knowledge — `BLOCKING`

A question about the learner's own life answered from general sources instead of
the records the backend actually holds.

**Detects:** a `backend_only` route carrying evidence whose origin scope is not `BACKEND_RECORD`.
**Response:** answer only from the backend record, with provenance, or say the record does not hold it.

---

## Where each one is caught

| Failure | Runtime detector | Schema constraint | Test |
|---|---|---|---|
| FM-01 | ✓ | — | `six-pipeline` |
| FM-02 | ✓ | ✓ ×3 | `six-mathload`, `six-pipeline` |
| FM-03 | ✓ | ✓ | `six-evidence`, `six-pipeline` |
| FM-04 | ✓ | — | `six-pipeline` |
| FM-05 | ✓ | ✓ (record gap must name what is missing) | `six-evidence` |
| FM-06 | ✓ | — | `six-pipeline` |
| FM-07 | ✓ | — | `six-parity`, `six-pipeline` |
| FM-08 | ✓ | ✓ | `six-routing`, `six-evidence` |
| FM-09 | ✓ | — | `six-evidence` |
| FM-10 | ✓ | ✓ (`sixu_close_run`) | `six-pipeline` |
| FM-11 | ✓ | ✓ (truncation must be explained) | `six-routing` |
| FM-12 | ✓ | — | `six-pipeline` |
| FM-13 | ✓ | — | `six-evidence` |
| FM-14 | ✓ | — | `six-pipeline` |

A `BLOCKING` hit that stands against a run makes `sixu_close_run` refuse to close
it `COMPLETE`, whatever state the caller asked for:

```
close={"state": "HALTED",
       "detail": "A run carrying a blocking failure mode cannot be reported as complete.",
       "blocking_failures": 1}
```
