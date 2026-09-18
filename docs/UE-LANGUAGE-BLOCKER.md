# THYLORA Language Blocker / Meaning Resolver

Understanding Engine, layer zero. Backend of record `thylora-dash`
(`jvsdxhrfhtlgaknhjxlz`). Engine spec section `UE-SPEC-P`.

---

## 1 · The problem this exists for

A child reads: *"You are paid $50 per week plus $3 per sale. This week you want
your pay to be at least $100."*

That is one published sentence, from 7.EE.B.4.b. It carries four separate blockers:

- **per**, twice, doing two different jobs — money against time, then money
  against an action the child controls;
- **plus**, joining a fixed amount to a growing one, which is the whole structure
  of the equation about to be written;
- **at least**, an inclusive floor that children reliably read as *more than*;
- **solutions**, plural, describing a set rather than a value.

A child can know every piece of the algebra and still fail this sentence. The
failure is not in the reasoning. It is in the reading, and nothing on the page
marks the words that did it — they are all short, familiar and unremarkable.

## 2 · Why not a dictionary

A dictionary answers *what does this word mean*. This lab answers **what is this
word doing to the numbers on either side of it, in this sentence, right now**.

Telling a child that *per* is a preposition meaning *for each* leaves them exactly
where they were. What they cannot do is see that *per* **built** the number, that
it can be scaled and inverted, and that fifty dollars per week is not fifty dollars.

The unit of work is therefore not the word. It is the word, in one sentence, doing
one job, creating one relationship. A term record with no sentence case is treated
as incomplete, and after this run every one of the forty terms carries at least one.

## 3 · The ten fields

Every sentence case carries the full model the directive specified:

| Field | Column |
|---|---|
| WORD | `ue_lb_terms.term` |
| POSSIBLE SENSES | `ue_lb_senses` (job, gloss, relationship, tell-tale) |
| SENTENCE | `sentence`, with `sentence_source` and `source_ref` |
| MEANING IN THIS SENTENCE | `meaning_in_this_sentence` |
| RELATIONSHIP CREATED | `relationship_created` |
| PLAIN SUBSTITUTE | `plain_substitute` |
| VISUAL MODEL WHEN USEFUL | `visual_model` (nullable — *when useful* is honoured) |
| MISREADING RISK | `misreading_risk` — at least one, enforced |
| CHILD EXPLAINS BACK | `child_explains_back` |
| TRANSFER EXAMPLE | `transfer_example` |

`misreading_risk` is not a warning list. Each entry names the wrong answer the
child gives **and why it feels right to them**, because a misreading that does not
feel right to the child is not the misreading they are actually making.

## 4 · The eight blocker types

Classified by mechanism of failure, not by part of speech, because the mechanism
determines the repair.

| Type | Mechanism | Examples |
|---|---|---|
| `SILENT_SENSE_SWITCH` | Changes job mid-text with no marker | with, mean, given, interval, solution, plus |
| `INVISIBLE_RELATION` | Builds a relation, then hides in one number | per, of, remaining, unless, inference, context |
| `FALSE_FRIEND_EVERYDAY` | Common sense collides with school sense | difference, rate, product, average, properties, model |
| `DIRECTION_NOT_TOPIC` | A how-to-answer verb read as what-to-answer-about | estimate, compare, interpret, determine, represent |
| `BOUNDARY_INCLUSION` | Sets a limit, silent on whether the limit is in | at least, at most, between, within |
| `ORDER_CARRIER` | One word carries a whole list mapping | respectively |
| `CERTAINTY_GRADE` | A dial read as a switch | likely |
| `SCOPE_AMBIGUITY` | Never states the group it applies to | except, such as, involving, increase, decrease |

The taxonomy earns its place because it predicts the repair. A boundary blocker is
repaired by drawing a filled or hollow circle. A false friend is repaired by naming
both senses aloud. Applying the boundary repair to a false friend does nothing —
which is why undifferentiated vocabulary teaching fails.

## 5 · Where the blocker sits in the mastery equation

```
U = K × E × C × X × T
```

**A language blocker does not reduce understanding. It cancels it.** The factors
multiply, so a misread relation zeroes K, and zero times anything is zero however
strong the other four are.

This is the only failure mode in the engine where a learner can be strong on every
factor and still score zero through no fault of their own reasoning. The arithmetic
was right; the sentence was misread. A mark scheme cannot tell those apart. The
engine must, so the blocker check runs **before** any low U score is treated as a
knowledge gap, and a zero caused by misreading is recorded as a misreading.

## 6 · The eleven misreading patterns

1. **The everyday sense wins** — correct English, wrong mathematics, high confidence.
2. **The unstressed operator** — the word commanding the operation is the quietest one.
3. **The lost boundary** — wrong by exactly one, always toward the boundary.
4. **The collapsed hedge** — *likely* becomes *will*; the middle of the dial is deleted.
5. **The unanchored base** — a percentage with no stated whole, and the sentence sounds complete.
6. **The skipped order carrier** — flawless working, wrong pairing.
7. **The invisible scope** — two careful readers do different work and neither can tell.
8. **The additive default** — when the relation is unclear, add.
9. **The directive read as a topic** — right content, wrong form, marked down for something that feels arbitrary.
10. **The one-answer assumption** — a single value where a set was asked for.
11. **The word nobody said out loud** — a child cannot ask about a word they did not notice they did not know.

The eleventh hides the other ten. It produces no signal at all: the absence of
questions is indistinguishable from mastery unless the child is asked to explain
the **relationship** rather than to produce the answer. Under the inherited Bramble
principle, repeated blockers across a class are read as a signal about the
material, never about the learners.

## 7 · The resolver loop

Detect → **stop** → offer the jobs → child chooses and states the tell-tale →
substitute → name the relationship with no numbers → restore and solve →
**return to the original** → transfer.

The resolver never supplies the meaning. It supplies the question that makes the
child supply the meaning, inherited directly from the question engine's hard rule:
*never supply the observation, the alternative or the gap on the learner's behalf.*

It fails closed. A highlighted word with no sense record stops the session and is
recorded as an `OPEN_QUESTION` in learner memory — which is an asset, not a
failure. It never invents a job to keep things moving.

## 8 · The four product candidates

All `DESIGN_ONLY_NOT_BUILT`, all `NOT_RELEASED`, all pricing
`UNKNOWN_UNTIL_COMMERCE_EVIDENCE`.

| Product | Works on | Answers |
|---|---|---|
| **One Word, Five Jobs** | the WORD, before any sentence | What can this word do? |
| **Meaning Before Math** | the SENTENCE, before any number | What is this sentence doing? |
| **Question Autopsy** | the WRONG ANSWER, after the fact | Which word did this? |
| **Word Problem Translator** | a WHOLE PROBLEM, end to end | Can I get through this alone? |

All four read from the same `ue_lb_` records, so a card, an opener, a game and a
tool cannot drift apart from one another or from the sources. Build order: One
Word, Five Jobs first, because the other three read its senses; Question Autopsy
last, because it needs the misreading patterns tested against real errors that do
not yet exist.

Each design names its own largest risk. The sharpest is the Translator's: that
children stop at the plain version and never return to the original, which would
make them dependent rather than fluent. The design makes the final read of the
original a required step for exactly that reason.

## 9 · What this lab cannot do

- Rank the terms by how often children actually fail on them.
- Say what proportion of wrong answers are misreadings rather than arithmetic.
- Prove any repair move works better than doing nothing.
- Distinguish a child who misread from a child who reasoned badly, without asking.
- Work in any language other than English, which the whole design assumes.

**First measurement to take:** run Meaning Before Math on one real class with a
real worksheet and count how many name the relationship correctly before the
numbers are restored. That single run would convert most of this lab from
reasoning to evidence.

**The acceptance test**, inherited from Kealorp: if the Six do not enjoy using it,
the system has failed, whatever the scores say.
