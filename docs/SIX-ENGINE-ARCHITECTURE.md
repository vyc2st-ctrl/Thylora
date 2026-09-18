# Six Understanding Engine · architecture

**Engine:** `THY-SIX-UNDERSTANDING-ENGINE-001`
**Workroom:** `WR-SIXENGINE-001`
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
**Scope of this delta:** UNIVERSAL QUESTION RESOLUTION

---

## 1 · What changed

The engine was scoped to curriculum concepts. It is not any more.

Any question a learner asks is admitted. Where a definitive answer is supported
by available evidence, the engine produces the deepest understanding that
evidence will carry. Where no definitive answer exists, it does not go quiet and
it does not bluff. It returns:

```
KNOWN              what is settled, with the conditions it holds under
EVIDENCE           what that rests on, counted in independent lines
CONTESTED          every live position, with its standing
UNKNOWN            what is missing, and what kind of missing it is
WHAT WOULD ANSWER IT   the observation that would settle it, and whether
                       anyone can currently go and get it
```

Those five sections are produced in that order by `understandingReport()` and
are never skipped. A question with no settled answer returns all five with
`KNOWN` reading *"Nothing here is settled enough to state as known."* That is an
answer, not a failure.

---

## 2 · The core pipeline

```
QUESTION → MEANING → PREREQUISITES → KNOWLEDGE → EVIDENCE
         → CONNECTIONS → EXPLAIN → TRANSFER → NEXT QUESTION
```

The order is fixed. Which stages are *mandatory* is not: the route decides that,
because the kind of question decides what an honest answer is allowed to look
like. A word problem inserts `LOAD_SEPARATION` after `MEANING` and drops
`KNOWLEDGE`/`EVIDENCE` entirely — its answer is a load diagnosis, not a weighing
of sources.

| Stage | What it does | Where it can stop |
|---|---|---|
| `QUESTION` | Routes by kind; catches presupposition failure; applies the guardian gate | gated → route to a named adult |
| `MEANING` | Resolves material words in context; word-sense selection | ambiguous sense → ask the learner |
| `LOAD_SEPARATION` | Separates L from M and S (word problems) | L below threshold → teach the sentence |
| `PREREQUISITES` | Walks the chain, finds the floor | concept not in graph → record the gap |
| `KNOWLEDGE` | Takes the positions and the named unknowns | nothing supplied → refuse to invent |
| `EVIDENCE` | Grades independent lines, caps confidence | short of the route's floor → add conditions |
| `CONNECTIONS` | Links to what the learner verifiably holds | nothing held → claim nothing |
| `EXPLAIN` | Starts at the floor; gates the child-facing wording | parity violation → refuse the wording |
| `TRANSFER` | Produces the task that verifies understanding | no task derivable → flagged (FM-10) |
| `NEXT QUESTION` | Opens what this answer opened | — |

**Stopping is a result.** A run that halts with a named reason and a next action
has done its job. A run that continues past a gate to produce a confident
paragraph has not.

### Run states

| State | Meaning |
|---|---|
| `COMPLETE` | The route's contract was met |
| `GATED` | Stopped at a gate (guardian, language load) with a next action |
| `HALTED` | Continuing would have required a guess |
| `PARTIAL` | Some stages ran; the contract was not met, and it says which |

---

## 3 · Question routing

`six-engine/lib/routing.js` · backend `sixu_question_routes`

Eleven classes, each with a stage list, an answer contract and an evidence floor.

| Class | Contract |
|---|---|
| `DEFINITIONAL` | the job the term does, in context, with an example and a non-example |
| `FACTUAL_SETTLED` | the answer, plus what it rests on (2 independent lines) |
| `CONCEPTUAL_MECHANISM` | the mechanism, not the label — runnable forward on a new case |
| `PROCEDURAL` | the steps, the reason for each, and the check that it worked |
| `MATH_WORD_PROBLEM` | language load and mathematical load reported **separately** |
| `CONTESTED_RECORD` | every position with evidence and standing, gaps named, what would settle it |
| `OPEN_RESEARCH` | what is known at the edge, why it is open, what would close it |
| `VALUE_JUDGEMENT` | facts separated from values, values named as values, choice left with the person |
| `PERSONAL_RECORD` | only what the backend holds, with provenance — never general knowledge |
| `MALFORMED` | name the assumption, say what must be settled, offer the repaired question |
| `SAFETY_GATED` | general understanding only, routed to a named adult before anything actionable |

Three routing rules are deliberate:

1. **Safety wins over everything.** Whatever else matched, a medical, legal,
   financial or safety question for a child is gated.
2. **A near tie goes to the more careful reading.** Where a question scores as
   both settled and contested, it routes contested. Over-caution costs a
   paragraph; under-caution teaches a dispute as a fact.
3. **A presupposition failure overrides the class.** "When did people stop
   believing that?" is not answered as asked, because answering it would smuggle
   the assumption through as established.

---

## 4 · Evidence and the honest unknown

`six-engine/lib/evidence.js` · backend `sixu_evidence_items`, `sixu_claim_resolutions`

**Strength comes from independent lines.** Twenty articles tracing to one dataset
are one line. Sources are collapsed by origin *before* anything is counted, and
the collapse is flagged (`REPETITION_COLLAPSED`). Strength is capped by the best
line, with a small lift for genuine corroboration.

**Standing is not strength.** `CONSENSUS`, `MAJORITY`, `MINORITY`, `CONTESTED`,
`EMERGING`, `FRINGE` say *who holds a position*. Standing is recorded, reported
to the learner in words, and never added to the arithmetic. The consequence is
deliberate and visible in the sample runs: a minority position resting on a
contemporaneous record outranks a consensus resting on textbook summaries, and
the learner is told both facts — what the evidence is, and who holds what.

**One line is still one line.** A single strong line returns
`RESOLVED_WITH_CONDITIONS`, never `RESOLVED`, and the condition says so.

**A gap in the record is not evidence of absence.** `RECORD_GAP` carries
`what_is_missing`, `why_missing`, `who_kept_records` and
`who_was_outside_the_records`, and the schema refuses a record gap that does not
say what is missing. The reading rule travels with the data:

> Silence in a record can only be read once you know who was writing it, what
> they wrote about, and who they never wrote about. Where the record-keepers
> excluded people, the gap is evidence about the record-keeping, not about the
> people.

An open record gap also blocks a `RESOLVED` state. The question is not closed
while the thing that would close it is missing.

**WHAT WOULD ANSWER IT names an observation.** Not "more research is needed" —
the schema rejects that phrase with a check constraint. Each entry carries a
feasibility: `EXISTS_UNEXAMINED`, `OBTAINABLE`, `NOT_CURRENTLY_OBTAINABLE`,
`IMPOSSIBLE`.

---

## 5 · Prerequisites

`six-engine/lib/prerequisites.js` · backend `sixu_concepts`, `sixu_learner_mastery`

The walk finds the **floor**: the deepest concept the learner does not hold. The
explanation starts there, not at the question. A held concept ends the dig —
there is no reason to unpack what the learner already carries.

Three refusals:

- A concept the graph does not contain produces `CONCEPT_NOT_IN_GRAPH`. The
  engine will not invent a prerequisite chain.
- A cycle is cut and reported, not followed.
- The walk stops at depth 6 and says the chain below is **unexamined, not
  assumed held**.

Mastery is only raised by evidence — a passed transfer task, a controlled task,
or an adult's recorded judgement. `sixu_mastery_held_needs_evidence` rejects a
`HELD` row with `evidence_kind = 'NONE'`. Showing an explanation is not evidence
that it landed.

---

## 6 · The two implementations, and why they are checked against each other

The rules exist twice: in `six-engine/lib/` (what the app shows a learner) and in
`db/six-engine/` (what the backend stores and enforces). Two implementations of
one rule drift, and drift here is not cosmetic — it ends with a child being told
they cannot do mathematics.

| Rule | Runtime | Backend |
|---|---|---|
| Evidence grading | `gradeEvidence` | `sixu_grade_evidence` |
| Claim resolution | `resolveClaim` | `sixu_resolve_claim` |
| Load diagnosis | `diagnose` | `sixu_diagnose_load` |
| Prerequisite floor | `prerequisiteClosure` | `sixu_prerequisite_floor` |
| Run closure | `finish` | `sixu_close_run` |
| Lexicon and concepts | `lexicon.js`, `SEED_CONCEPTS` | `0009_seed…` (generated from them) |

Two harnesses hold this:

- `db/six-engine/validation/twin-check.mjs` walks **700 combinations** of
  L, M, S and the two control flags through both the SQL function and the
  JavaScript, and fails on the first disagreement. Current result: 0 mismatches.
- `tests/six-seed.test.mjs` fails if the committed seed migration stops matching
  the runtime lexicon it was generated from.

---

## 7 · Files

```
six-engine/lib/
  lexicon.js        word senses: the job a word does, its cues, example, non-example
  language.js       LANGUAGE BLOCKER RESOLVER · word-sense selection
  parity.js         adult-to-child concept parity · invariants and friction
  mathload.js       P_solve = L × M × S · the separation rule
  evidence.js       independent lines, standing, record gaps, what would answer it
  prerequisites.js  concept graph, the floor, mastery
  routing.js        eleven question classes and their contracts
  failures.js       fourteen failure modes with detectors
  pipeline.js       the nine stages, the gates, the append-only trail
six-engine/tools/
  generate-seed-sql.mjs   generates the backend seed FROM the runtime lexicon
six-engine/samples/
  run-samples.mjs   seven real runs (docs/SIX-ENGINE-SAMPLE-RUNS.md is its output)
db/six-engine/      0001–0010, README.md, validation/
tests/              six-language · six-parity · six-mathload · six-evidence
                    six-routing · six-pipeline · six-seed
```

No framework. No runtime dependency. No external script. `npm test` runs
everything; the SQL is validated separately by `db/six-engine/validation/run.sh`.

---

## 8 · What this delta does not do

- It is **not applied** to the backend. The migrations are reviewable; applying
  DDL is a production mutation held for Chairman execution.
- It touches **no** existing surface. No file in `app/`, `public-site/`,
  `rae-link/` or `dashboard-current-head.html` is modified. There is no UI in
  this delta.
- It opens **no second source of truth**. Identity, the family archive and
  department registries stay where they live; `0010_registry_link.sql` holds soft
  references behind `to_regclass` guards.
- It does **not** supply knowledge. The engine weighs, routes, gates and refuses.
  Positions and evidence are supplied to it. Given none, it halts with
  `NO_KNOWLEDGE_SUPPLIED` rather than filling the space.
