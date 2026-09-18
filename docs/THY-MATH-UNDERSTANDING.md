# THY-MATH-UNDERSTANDING — the three-layer model

**Model:** `THY-MATH-LMS-001`
**Workroom:** `WR-MATH-SURFACE-001`
**Opened:** 2026-09-18

---

## 1 · The equation

```
L = Do I understand the sentence?
M = Do I understand the mathematical relationship?
S = Can I solve it?

P_solve = L × M × S
```

Each factor sits in `[0, 1]`.

### Why it is a product and not a sum

A sum would let strength in two layers carry the third. That is not how a word
problem behaves. A learner who cannot read the sentence gets it wrong whatever
their arithmetic is like; a learner with perfect reading and no procedure gets
it wrong too. Any single zero takes the whole thing to zero, and a product is
the only shape that says so.

Two consequences follow immediately, and both are useful:

- **`P_solve ≤ min(L, M, S)`.** The lowest layer is a ceiling. Effort spent on a
  layer that is not the ceiling returns almost nothing, and the arithmetic will
  say how little before a term is spent finding out.
- **A zero is uninformative about the other factors.** `0 × x = 0` for every
  `x`. This is the whole of the hard rule, and it is not a policy preference —
  it is a property of multiplication.

---

## 2 · The hard rule

> **If `L = 0`, do NOT infer that the learner lacks the mathematics.**

A learner who could not read the sentence produces `P_solve = 0` whether their
mathematics is perfect or absent. Those two children are indistinguishable on a
marked page and need opposite help. Recording the first as a mathematics
weakness buys a year of the wrong intervention, and the child learns that
mathematics is a thing they are bad at.

The model therefore separates two properties that are usually collapsed:

| | meaning |
|---|---|
| **value** | what was measured |
| **admissibility** | whether it was measured in a way attributable to that layer alone |

An observation taken from the mixed word problem is recorded — it happened — but
it is **not admissible evidence** for `M` or `S`, because the language layer sat
in front of it. Only an isolated probe produces admissible evidence.

| Layer | An isolated probe | Not isolated if |
|---|---|---|
| `L` | The learner says what the sentence tells us and what it asks for. No numbers, no operators. | the probe contains a calculation that could be failed |
| `M` | The quantities are handed over already extracted. The learner names the relationship. Nothing is computed. | the learner still has to find the numbers in a sentence |
| `S` | Bare computation. No story, no words. | there is a context to interpret |

### What the model will and will not say

| Situation | `P_solve` | Permitted | Refused |
|---|---|---|---|
| `L = 0`, `M` and `S` unmeasured | `0`, determined | "cannot be solved as presented" | any claim about mathematics or procedure |
| `L = 0`, `M` measured at `0` in isolation | `0`, determined | "the relationship is not yet held" | nothing; the evidence exists |
| `L = 0.5`, `S = 1`, `M` unmeasured | undetermined, bounded `[0, 0.5]` | the bounds | a single number for `P_solve` |
| all three measured | the product | whatever the values support | claims about layers below threshold that were not probed |

An unmeasured layer is stored as `NULL` and printed as `?`. It never becomes a
zero anywhere in the system — not in the JavaScript, not in the SQL, not on a
printed card.

---

## 3 · The language layer

Ten words decide whether a word problem can be read at all. They are in
`math-surface/lib/language.js` and seeded into `thy_math_vocabulary`.

| Word | Signals | The reasonable misread |
|---|---|---|
| remain | `a − b` | the amount given is the amount left |
| difference | `|a − b|` | "how are these unalike" |
| per | `a ÷ b` | join the numbers whichever way round they appear |
| between | `a − b` **or** `a < x < b` | one word, two unrelated jobs |
| at least | `x ≥ n` | "more than n", which throws away `n` |
| at most | `x ≤ n` | "exactly n" |
| respectively | pairing, no arithmetic at all | skip it, pair by proximity |
| estimate | `≈`, round first | close is wrong, so compute exactly |
| compare | `>`, `<`, `=` | produce a number |
| rate | `a / b` with units | keep the number, drop the units |

Each misread is the *reasonable* one — which is why it is so common, and why
treating it as carelessness is wrong.

### Language load

A sentence carries a measurable reading cost, printed on the surface beside it:

```
load = distinct registry words
     + 1 for each edge-sensitive word (bound or pairing family)
     + 1 if the sentence exceeds 28 words
```

Bands: `NONE`, `LIGHT`, `CARRIED`, `HEAVY`. A load score is a property of the
**sentence**, never of the learner.

---

## 4 · The four isolations

Every worked example is the same problem looked at four times:

1. **Language isolated** — the sentence only, arithmetic-free by construction.
2. **Relationship isolated** — quantities supplied, nothing computed.
3. **Solve isolated** — bare working, no story.
4. **The child explains back** — what the answer *means* in the story, in their
   own words. Not how they got it.

The fourth is not a formality. A result a child cannot say back has not been
understood, whatever `P_solve` reads, and the words they use are preserved
verbatim rather than summarised or corrected.

Twelve examples are held in `math-surface/lib/examples.js`, covering all ten
words. `WE-07` is the reference case: one missed adverb produces
`14 − 3 = 11` — flawless arithmetic answering about the wrong person, routinely
recorded as a subtraction weakness.

---

## 5 · Understanding Cards

A card records one sitting. Required fields, enforced by `cardIntegrity()` and
by check constraints in `db/math-surface/0003_understanding_cards.sql`:

- the equation written out with the measured factors filled in
- `not_measured` — every layer not measured in isolation
- `not_measured_statement` — the same thing in plain words
- `refused_claims` — printed, not omitted
- the child's explain-back, preserved as said

Cards are **append-only**. A later reading inserts a new version with
`supersedes` set; the original stays readable. This is the Family Story archive
rule — the source is preserved and interpretation is added beside it — applied
to assessment.

A card is not a grade, a level, a diagnosis or a prediction, and there is no
column in the schema that could quietly become one.

---

## 6 · What this changes for an adult

The teacher surface computes the lift question directly: what would raising each
layer to 1 actually return?

```
L = 0.25, M = 1, S = 1   →  P_solve = 0.25
lifting L → 1 :  +0.75
lifting M → 1 :   0
lifting S → 1 :   0
```

Two thirds of the available interventions here are worth exactly nothing, and
the two that are worth nothing are the two a mathematics department is
best equipped to deliver. That is the practical content of the model.

---

## 7 · Where it lives

| Concern | File |
|---|---|
| The model | `math-surface/lib/understanding.js` |
| The words | `math-surface/lib/language.js` |
| The examples | `math-surface/lib/examples.js` |
| Cards | `math-surface/lib/cards.js` |
| Protocols | `math-surface/lib/continuity.js` |
| Persistence | `math-surface/lib/persistence.js`, `persistence-fs.js` |
| Backend client | `math-surface/lib/backend.js` |
| Store candidates | `math-surface/lib/store.js` |
| Learner surface | `math-surface/index.html`, `app.js` |
| Teacher surface | `math-surface/teacher.html`, `teacher.js` |
| Family surface | `math-surface/family.html`, `family.js` |
| Schema | `db/math-surface/` |
| Handoff | `workrooms/WR-MATH-SURFACE-001.md` |
