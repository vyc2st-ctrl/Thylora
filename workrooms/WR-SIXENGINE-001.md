# WR-SIXENGINE-001 · Six Understanding Engine

**Lane:** understanding engine · universal question resolution · language blocker resolution · load separation
**Engine:** `THY-SIX-UNDERSTANDING-ENGINE-001`
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
**Source repository:** `vyc2st-ctrl/Thylora`, branch `claude/universal-question-resolution-yincrb`
**Opened:** 2026-09-18
**Prior sequence read:** through 468 (`db/rae-link`, `WR-RAELINK-001`, 48 tests)

---

## 1 · Authority position

Read before execution, and held throughout:

- `DASHBOARD_AUTHORITY.md` — this repository is **not** the deployment authority
  for the Chairman dashboard. Authority remains `vyc2st-ctrl/thylora-executive-dashboard`
  → `thylora-public-world`. **Nothing in this delta touches `dashboard-current-head.html`.**
- `dashboard-baseline.json` — floor `THY-DASH-FLOOR-20260823-001`. **No baseline
  capability was removed, renamed or disconnected.**
- Existing surfaces `app/`, `public-site/` and `rae-link/` are **untouched**. This
  delta adds no navigation entry, no route and no imagery. It was not published.
- The Six Understanding Engine is a **backend module**, not a surface.

Dashboard ≠ RAE Link ≠ app ≠ backend ≠ understanding engine. That separation is
held in this delta.

---

## 2 · Directive executed

`THY-SIX-UNDERSTANDING-ENGINE-001` expanded into **UNIVERSAL QUESTION RESOLUTION**.

The engine is no longer limited to curriculum concepts. Any question a learner
asks is admitted and routed by kind. Where evidence supports a definitive answer,
the engine produces the deepest understanding that evidence carries. Where it
does not, it returns `KNOWN · EVIDENCE · CONTESTED · UNKNOWN · WHAT WOULD ANSWER IT`
— five sections, in that order, never skipped.

Core pipeline, as built:

```
QUESTION → MEANING → PREREQUISITES → KNOWLEDGE → EVIDENCE
         → CONNECTIONS → EXPLAIN → TRANSFER → NEXT QUESTION
```

with `LOAD_SEPARATION` inserted after `MEANING` for word problems.

---

## 3 · Execution delta

### Added — runtime (`six-engine/`, 2,353 lines, no dependencies)

| File | Holds |
|---|---|
| `lib/lexicon.js` | 23 lemmas, 34 senses, 18 invariant-carrying. Job, cues, substitute, example, non-example |
| `lib/language.js` | LANGUAGE BLOCKER RESOLVER · word-sense selection · restatement scoring |
| `lib/parity.js` | Adult-to-child concept parity · 11 invariant kinds · friction measurement |
| `lib/mathload.js` | `P_solve = L × M × S` and the rule that L = 0 proves nothing about M or S |
| `lib/evidence.js` | Independent lines, standing, record gaps, what would answer it |
| `lib/prerequisites.js` | Concept graph, the floor, mastery, depth cap, cycle cut |
| `lib/routing.js` | 11 question classes, each with stages, a contract and an evidence floor |
| `lib/failures.js` | 14 failure modes, each with a detector, a severity and a response |
| `lib/pipeline.js` | The nine stages, the gates, the append-only trail |
| `tools/generate-seed-sql.mjs` | Generates the backend seed **from** the runtime lexicon |
| `samples/run-samples.mjs` | Seven real runs |

### Added — backend schema (reviewable, **not applied**)

`db/six-engine/` — 1,858 lines, **37 tables**, **11 functions**, **151 constraints**,
10 numbered migrations, all `sixu_`-prefixed and additive.

Rules the schema refuses to let a client talk past, in full in
`db/six-engine/README.md`. The load-bearing ones:

- a mathematics deficit claimed while the sentence was not understood
- an uncontrolled M or S recorded below the language threshold
- `P_solve` written with a factor missing, or that is not L × M × S
- confidence above the evidence under it
- a record gap that does not say what is missing
- "more research is needed" offered as what would answer it
- mastery recorded as HELD with no evidence behind it
- rewriting, deleting from, or running backwards through the stage trail
- a dictionary dump offered as a contextual meaning

### Added — tests

`tests/six-*.test.mjs` — **95 new tests**, all passing. Whole repository:
**143 tests, 143 passing** (`npm test`; the 48 RAE Link tests are unaffected).

### Added — validation

`db/six-engine/validation/` — throwaway-database harness in the RAE Link pattern.
Last authoring run:

- all ten migrations OK on both passes (idempotent)
- every behavioural check rejected as intended
- **twin check: 700 input combinations, 0 mismatches** between `sixu_diagnose_load`
  and the runtime `diagnose()`

### Added — documentation

`docs/SIX-ENGINE-ARCHITECTURE.md`, `-LANGUAGE-RESOLVER.md`, `-FAILURE-MODES.md`,
`-SAMPLE-RUNS.md`, plus `db/six-engine/README.md`.

### Changed

Nothing. No existing file in this repository was modified by this delta.

---

## 4 · The two rules this delta exists to hold

**1 · A language failure is not a mathematics failure.**

```
P_solve = L × M × S
```

If `L = 0` the learner never reached the mathematics, so the attempt carries no
information about `M` or `S`. They are recorded as `UNMEASURED` (null), never 0;
any M or S taken from the story presentation is **discarded**, not scored low; and
`mathematics_deficit_claim` returns `NOT_SUPPORTED`. The verdict is
`LANGUAGE_BLOCKED`, the teaching target is *the sentence*, and the next action is
to clear the word blockers and re-present the same problem in language-controlled
form — same relationship, same numbers, same step count, sentence load removed.

This is held in three places: the runtime, five check constraints, and a
700-combination twin check that fails if the two ever disagree.

**2 · Reduce the language, never the concept.**

A child-facing rewrite passes only when every concept invariant survives —
quantifier, negation, condition, causal direction, comparison direction, unit,
scope, uncertainty, who holds the position, multi-step, temporal order — **and**
the reading friction actually falls. A rewrite that is easier and smaller is
refused, and the engine returns the source text with an instruction naming each
lost invariant.

Sample 5 in `docs/SIX-ENGINE-SAMPLE-RUNS.md` is the refusal; sample 6 is the
accepted rewrite of the same sentence: parity 1.00, friction 20.08 → 8.37.

---

## 5 · What the engine refuses to do

| Situation | Behaviour |
|---|---|
| A word's sense is not separated by the context | Halts and asks the learner. Never guesses (FM-01) |
| No knowledge positions were supplied | Halts with `NO_KNOWLEDGE_SUPPLIED`. Never fills the space |
| A concept is not in the graph | Records the gap. Never invents a prerequisite chain |
| A word above band is not in the lexicon | Records the gap. Never invents a meaning |
| A question assumes something unestablished | Returns `MALFORMED` with the repaired question |
| A medical, legal, financial or safety question | Gates to a named adult before anything actionable |
| A question about the learner's own life | Answers only from the backend record, with provenance |
| A blocking failure stands against a run | `sixu_close_run` refuses to mark it `COMPLETE` |

Stopping with a named reason and a next action is a result. Continuing past a
gate to produce a confident paragraph is the thing being prevented.

---

## 6 · Open positions (not blockers)

1. **Lexicon coverage.** 23 lemmas seed the resolver and cover the word-problem
   and source-evaluation traps. Extending it is a data task (`sixu_lexemes`,
   `sixu_word_senses`, `sixu_sense_cues`) — no code change. `sixu_lexicon_gaps`
   collects what learners hit that the lexicon does not carry, which is the
   extension queue.
2. **Concept graph.** 17 seed concepts. Same shape: department-extensible data.
3. **Restatement fidelity** is scored lexically. It is deliberately conservative
   (a restatement reaching for the wrong sense is capped at 0.3) and can be
   replaced with a stronger judge without touching the pipeline — the score
   enters at one point, `measureLanguageLoad`.
4. **No surface.** Deliberate, per directive. When a surface is authorised, it
   reads `sixu_*` through the functions in `0007`; it does not re-implement a
   rule.

---

## 7 · Exact next action

**One decision, for the Chairman:**

> Authorise application of `db/six-engine/0001`–`0010` to `thylora-dash`
> (`jvsdxhrfhtlgaknhjxlz`), in numeric order, one transaction per file.

Nothing in this delta is applied. Until that authorisation, the migrations are
review material and the runtime has no backend to write to.

**Before applying**, run the harness on a throwaway database and confirm three
results — it never touches the THYLORA backend:

```
sudo service postgresql start
db/six-engine/validation/run.sh
```

1. all ten migrations OK on both passes
2. every behavioural check rejects as intended (the `ERROR` lines are the pass)
3. `twin check: 700 input combinations, 0 mismatch(es)`

**On authorisation**, apply `0001`–`0010` in order, then re-run the behavioural
file against the live schema as a read-only confirmation.

**Held for the next sequence, not started here:** the learner-facing surface, the
lexicon extension pass, and the adult review view over `sixu_run_failures`.
