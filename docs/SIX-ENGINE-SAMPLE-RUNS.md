# Six Understanding Engine · sample runs

**Workroom:** `WR-SIXENGINE-001`
**Source:** `six-engine/samples/run-samples.mjs`

Seven questions through the real pipeline. Nothing below is a mock-up — this file
is the script's actual output, reproduced with:

```
node six-engine/samples/run-samples.mjs
```

What each sample is for:

| # | Shows |
|---|---|
| 1 | A word problem failure that is a **sentence** failure — and the refusal to call it mathematics |
| 2 | The same learner once the sentence is cleared: the real blocker appears |
| 3 | A word the context does not separate — the engine asks rather than guesses |
| 4 | A contested record answered as contested, with the gap and who was outside it |
| 5 | A child-facing wording the engine **refuses** although it is easier to read |
| 6 | A wording it accepts: same concept, lower friction |
| 7 | A question with a real-world consequence for a child, routed to an adult |

---

```text

──────────────────────────────────────────────────────────────────────────────
SAMPLE 1 · The failure that is not a mathematics failure
──────────────────────────────────────────────────────────────────────────────
QUESTION      Ada has 3 less than Sam. Sam has 8 sweets. If Ada shares hers equally between 5 children, how many does each child get?
ROUTE         MATH_WORD_PROBLEM — a mathematics problem wrapped in a sentence
CONTRACT      language load and mathematical load reported separately, never as one score
STATE         GATED (LANGUAGE_BLOCKED)

TRAIL
   1 QUESTION         OK  routed as MATH_WORD_PROBLEM: a mathematics problem wrapped in a sentence
   2 MEANING          OK  3 material word(s) resolved; 0 ambiguous; 0 unknown
   3 LOAD_SEPARATION  OK  LANGUAGE_BLOCKED · L=0 M=UNMEASURED S=UNMEASURED · P_solve=UNMEASURED

LANGUAGE BLOCKERS RESOLVED
  WORD                less than
  CONTEXT             Ada has 3 less than Sam.
  MEANING HERE        the first amount is smaller — and the sentence names the smaller one first, so the subtraction runs backwards from the reading order
  SIMPLER SUBSTITUTE  smaller by
  EXAMPLE             Ada has 3 less than Sam. If Sam has 8, Ada has 5 — you take 3 off Sam, not off Ada.
  NON-EXAMPLE         Ada has 3 less than Sam does NOT mean 3 − 8.
  LEARNER RESTATEMENT Say "Ada has 3 less than Sam." back in your own words — what is "less than" telling you to do there?
  STATE               OPEN (CARRIES_LOGICAL_WEIGHT)

  WORD                if
  CONTEXT             If Ada shares hers equally between 5 children, how many does each child get?
  MEANING HERE        the rest only holds when this part is true
  SIMPLER SUBSTITUTE  only when
  EXAMPLE             If the bag is full, she buys another — when it is not full, she does not.
  NON-EXAMPLE         She buys another bag — with no "if" there is no condition at all.
  LEARNER RESTATEMENT Say "If Ada shares hers equally between 5 children, how many doe…" back in your own words — what is "if" telling you to do there?
  STATE               OPEN (CARRIES_LOGICAL_WEIGHT)

  WORD                each
  CONTEXT             If Ada shares hers equally between 5 children, how many does each child get?
  MEANING HERE        the same amount goes to every one of them, one at a time
  SIMPLER SUBSTITUTE  every single one gets this much
  EXAMPLE             4 children get 3 sweets each — every child gets 3, not 3 between them.
  NON-EXAMPLE         4 children share 3 sweets — that is one amount split, not 3 per child.
  LEARNER RESTATEMENT Say "If Ada shares hers equally between 5 children, how many doe…" back in your own words — what is "each" telling you to do there?
  STATE               OPEN (CARRIES_LOGICAL_WEIGHT)


LOAD SEPARATION
  L (sentence understood)      0
  M (relationship understood)  UNMEASURED
  S (procedure carried out)    UNMEASURED
  P_solve = L × M × S          NOT COMPUTABLE
  VERDICT                      LANGUAGE_BLOCKED
  MATHEMATICS DEFICIT CLAIM    NOT_SUPPORTED
  DISCARDED                    S
  NOTE                         L is below threshold. A wrong answer here is evidence about the sentence, not about the mathematics.
  NOTE                         Any M or S taken from the story presentation has been discarded rather than scored: the learner never reached the mathematics, so the attempt carries no information about it.
  TEACHING TARGET              the sentence
  NEXT ACTION                  Clear the open word blockers, then re-present the SAME problem in language-controlled form. Do not reteach the mathematics yet — it has not been shown to be the problem.

  LANGUAGE-CONTROLLED FORM
    Sam = 8
    Ada = Sam - 3
    Find: Ada ÷ 5
    (Same relationship, same numbers, same step count as the story version. Only the sentence load is removed.)

──────────────────────────────────────────────────────────────────────────────
SAMPLE 2 · Sentence cleared, the real blocker appears
──────────────────────────────────────────────────────────────────────────────
QUESTION      Ada has 3 less than Sam. Sam has 8 sweets. If Ada shares hers equally between 5 children, how many does each child get?
ROUTE         MATH_WORD_PROBLEM — a mathematics problem wrapped in a sentence
CONTRACT      language load and mathematical load reported separately, never as one score
STATE         COMPLETE

TRAIL
   1 QUESTION         OK  routed as MATH_WORD_PROBLEM: a mathematics problem wrapped in a sentence
   2 MEANING          OK  0 material word(s) resolved; 0 ambiguous; 0 unknown
   3 LOAD_SEPARATION  OK  RELATIONSHIP_BLOCKED · L=1 M=0.4 S=1 · P_solve=0.4
   4 PREREQUISITES    OK  no concept was named for this question, so no prerequisite chain was walked
   5 EXPLAIN          OK  explanation starts at the question itself
   6 TRANSFER         OK  transfer task: Write a different story that needs the same relationship (Ada = Sam - 3) and the same number of steps.
   7 NEXT_QUESTION    OK  1 question(s) opened by this answer

LOAD SEPARATION
  L (sentence understood)      1
  M (relationship understood)  0.4
  S (procedure carried out)    1
  P_solve = L × M × S          0.4
  VERDICT                      RELATIONSHIP_BLOCKED
  MATHEMATICS DEFICIT CLAIM    SUPPORTED_RELATIONSHIP
  TEACHING TARGET              the relationship
  NEXT ACTION                  Teach the relationship with two contrasting cases, one of each direction. The sentence is already understood.

ANSWER
  VERDICT                    RELATIONSHIP_BLOCKED
  LANGUAGE_LOAD              1
  MATHEMATICAL_LOAD          0.4
  SOLVING_PROCEDURE          1
  P_SOLVE                    0.4
  MATHEMATICS_DEFICIT_CLAIM  SUPPORTED_RELATIONSHIP
  TEACHING_TARGET            the relationship
  NEXT_ACTION                Teach the relationship with two contrasting cases, one of each direction. The sentence is already understood.

TRANSFER
  Write a different story that needs the same relationship (Ada = Sam - 3) and the same number of steps.
  verifies: the relationship, not the wording

NEXT QUESTION
  · Which way round does the comparison run, and how would you show it with objects?  [LOAD_DIAGNOSIS]

──────────────────────────────────────────────────────────────────────────────
SAMPLE 3 · The engine refuses to guess a word sense
──────────────────────────────────────────────────────────────────────────────
QUESTION      Look at the table and write down what it shows.
ROUTE         FACTUAL_SETTLED — a fact with a settled answer
CONTRACT      the answer, plus what it rests on
STATE         HALTED (LANGUAGE_AMBIGUOUS)

TRAIL
   1 QUESTION         OK  routed as FACTUAL_SETTLED: a fact with a settled answer
   2 MEANING          HALT  0 material word(s) resolved; 1 ambiguous; 0 unknown

ASK THE LEARNER (the engine does not guess)
  · In "Look at the table and write down what it shows.", is "table" doing the job of "rows and columns holding numbers you read across and down" or "the thing you sit at"?

FAILURE MODES DETECTED
  · FM-01 Silent word-sense guess [BLOCKING] — unresolved word sense: table

──────────────────────────────────────────────────────────────────────────────
SAMPLE 4 · A contested record, answered as contested
──────────────────────────────────────────────────────────────────────────────
QUESTION      Was the founder really born in that town?
ROUTE         CONTESTED_RECORD — a question the field is split on, or where the record is incomplete
CONTRACT      every position with its evidence and its standing, the gaps in the record named, and what would settle it
STATE         COMPLETE

TRAIL
   1 QUESTION         OK  routed as CONTESTED_RECORD: a question the field is split on, or where the record is incomplete
   2 MEANING          OK  0 material word(s) resolved; 0 ambiguous; 0 unknown
   3 PREREQUISITES    OK  start at "record_survival" — 5 prerequisite(s) are not held; an explanation of "contested_claim" would land on nothing
   4 KNOWLEDGE        OK  2 position(s), 1 named unknown(s)
   5 EVIDENCE         OK  state CONTESTED at confidence 0.6 — capped by DIRECT_TESTIMONY across 1 independent line(s)
   6 CONNECTIONS      OK  1 connection(s) to what the learner already holds
   7 EXPLAIN          OK  explanation starts at record_survival
   8 TRANSFER         OK  transfer task: Take one of the positions and say what single piece of evidence would make you drop it.
   9 NEXT_QUESTION    OK  5 question(s) opened by this answer

PREREQUISITES
  floor        record_survival — why some records survive and others do not
  teach order  record_survival → primary_source → who_was_recorded → evidence_weighing → contested_claim

ANSWER
  KNOWN
    · Nothing here is settled enough to state as known.
  EVIDENCE
    · elsewhere: 1 independent line(s), best is first-hand account given later — SINGLE_LINE
    · town: 2 independent line(s), best is written later, using sources — REPETITION_COLLAPSED, NO_PRIMARY_LINE
  CONTESTED
    · She was born elsewhere and was brought to the town as a child — Fewer researchers hold this, and the evidence under it is strong. Being outnumbered is not being wrong.
    · She was born in the town — Most researchers in the field currently hold this, but the evidence under it is thin. Widely held is not the same as well evidenced.
  UNKNOWN
    · the parish register for 1748–1761 — the record that would settle it was destroyed, never kept, or kept only about some people; outside those records: families who were not baptised in that church, and people recorded only by first name
  WHAT_WOULD_ANSWER_IT
    · A surviving record from the time, or a parallel record kept elsewhere [EXISTS_UNEXAMINED] — the record that would settle it was destroyed, never kept, or kept only about some people
    · One piece of evidence that fits elsewhere and cannot fit town [OBTAINABLE] — Both positions currently survive the same evidence. The discriminator is the observation the two would disagree about in advance: a baptism entry naming the parish.
    · A primary source under "town" [EXISTS_UNEXAMINED] — This position currently rests only on later accounts. A contemporaneous record or physical evidence would move it.
  state CONTESTED · confidence 0.6

TRANSFER
  Take one of the positions and say what single piece of evidence would make you drop it.
  verifies: that the learner can hold a position without being held by it

NEXT QUESTION
  · What would it take to get: a surviving record from the time, or a parallel record kept elsewhere?  [WHAT_WOULD_ANSWER_IT · EXISTS_UNEXAMINED]
  · What would it take to get: one piece of evidence that fits elsewhere and cannot fit town?  [WHAT_WOULD_ANSWER_IT · OBTAINABLE]
  · What would it take to get: a primary source under "town"?  [WHAT_WOULD_ANSWER_IT · EXISTS_UNEXAMINED]
  · Who was outside those records, and what happened to what they knew?  [RECORD_GAP]
  · What is "why some records survive and others do not" for, in a case the learner already cares about?  [PREREQUISITE_FLOOR]

FAILURE MODES DETECTED
  · FM-09 Source monoculture [NOTING] — repeated sources collapsed to their origin

──────────────────────────────────────────────────────────────────────────────
SAMPLE 5 · A simplification the engine refuses
──────────────────────────────────────────────────────────────────────────────
QUESTION      Why does ice float?
ROUTE         CONCEPTUAL_MECHANISM — why or how something works
CONTRACT      the mechanism, not the label — the learner must be able to run it forward on a new case
STATE         HALTED (PARITY_VIOLATION)

TRAIL
   1 QUESTION         OK  routed as CONCEPTUAL_MECHANISM: why or how something works
   2 MEANING          OK  0 material word(s) resolved; 0 ambiguous; 0 unknown
   3 PREREQUISITES    OK  start at "floating" — 1 prerequisite(s) are not held; an explanation of "floating" would land on nothing
   4 KNOWLEDGE        OK  1 position(s), 0 named unknown(s)
   5 EVIDENCE         OK  state RESOLVED at confidence 0.98 — capped by REPLICATED_EXPERIMENT across 2 independent line(s)
   6 CONNECTIONS      OK  1 connection(s) to what the learner already holds
   7 EXPLAIN          HALT  child-facing wording refused — parity 0.25

PREREQUISITES
  floor        floating — why some things float
  teach order  floating

PARITY REFUSAL
  · PARITY_LOST_QUANTIFIER: "most" carried quantifier in the source and has no counterpart in the simplified text
  · PARITY_LOST_CONDITIONAL: "if" carried conditional in the source and has no counterpart in the simplified text
  · PARITY_LOST_POSITION_HOLDER: "hold" carried position holder in the source and has no counterpart in the simplified text

FAILURE MODES DETECTED
  · FM-07 Simplification that shrank the concept [BLOCKING] — parity 0.25, lost QUANTIFIER, CONDITIONAL, POSITION_HOLDER

──────────────────────────────────────────────────────────────────────────────
SAMPLE 6 · A simplification the engine accepts
──────────────────────────────────────────────────────────────────────────────
QUESTION      Why does ice float?
ROUTE         CONCEPTUAL_MECHANISM — why or how something works
CONTRACT      the mechanism, not the label — the learner must be able to run it forward on a new case
STATE         COMPLETE

TRAIL
   1 QUESTION         OK  routed as CONCEPTUAL_MECHANISM: why or how something works
   2 MEANING          OK  0 material word(s) resolved; 0 ambiguous; 0 unknown
   3 PREREQUISITES    OK  start at "floating" — 1 prerequisite(s) are not held; an explanation of "floating" would land on nothing
   4 KNOWLEDGE        OK  1 position(s), 0 named unknown(s)
   5 EVIDENCE         OK  state RESOLVED at confidence 0.98 — capped by REPLICATED_EXPERIMENT across 2 independent line(s)
   6 CONNECTIONS      OK  1 connection(s) to what the learner already holds
   7 EXPLAIN          OK  explanation starts at floating
   8 TRANSFER         OK  transfer task: Use floating to predict what happens in a case we have not talked about.
   9 NEXT_QUESTION    OK  2 question(s) opened by this answer

PREREQUISITES
  floor        floating — why some things float
  teach order  floating

ANSWER
  KNOWN
    · Ice floats because it is less dense than the water around it
  EVIDENCE
    · density: 2 independent line(s), best is result reproduced by independent teams
  CONTESTED
    · No live dispute at this level of detail.
  UNKNOWN
    · Nothing further is outstanding for this question.
  WHAT_WOULD_ANSWER_IT
    · An independent line of evidence not already counted [OBTAINABLE] — The present answer rests on 2 independent lines. A line of a different KIND — a record where there is now only measurement, or the reverse — is what would test it further.
  state RESOLVED · confidence 0.98

CHILD-FACING (parity 1, friction 20.08 → 8.37)
  Most scientists say this. If the same amount of space holds less stuff, then the thing floats because of that. Ice holds less stuff in that space than water does.

TRANSFER
  Use floating to predict what happens in a case we have not talked about.
  verifies: mechanism, not recall

NEXT QUESTION
  · What would it take to get: an independent line of evidence not already counted?  [WHAT_WOULD_ANSWER_IT · OBTAINABLE]
  · What is "why some things float" for, in a case the learner already cares about?  [PREREQUISITE_FLOOR]

──────────────────────────────────────────────────────────────────────────────
SAMPLE 7 · A question that goes to an adult first
──────────────────────────────────────────────────────────────────────────────
QUESTION      Is it safe to take two of these pills?
ROUTE         SAFETY_GATED — medical, legal, financial or safety consequence for a child
CONTRACT      general understanding only, routed to a named adult before anything actionable
STATE         GATED

TRAIL
   1 QUESTION         OK  routed as SAFETY_GATED: medical, legal, financial or safety consequence for a child
   2 QUESTION         HALT  guardian gate: this question carries a real-world consequence for a child
```
