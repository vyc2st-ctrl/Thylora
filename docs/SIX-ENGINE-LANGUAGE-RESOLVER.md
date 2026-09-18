# Six Understanding Engine · language blocker resolver

**Workroom:** `WR-SIXENGINE-001`
**Runtime:** `six-engine/lib/language.js`, `lexicon.js`, `mathload.js`, `parity.js`
**Backend:** `db/six-engine/0002_lexicon_word_sense.sql`, `0005_load_separation.sql`

---

## 1 · The resolution card

For every **material** word or phrase, the engine returns seven fields and the
schema requires all seven:

```
WORD                 less than
CONTEXT              Ada has 3 less than Sam.
MEANING HERE         the first amount is smaller — and the sentence names the
                     smaller one first, so the subtraction runs backwards from
                     the reading order
SIMPLER SUBSTITUTE   smaller by
EXAMPLE              Ada has 3 less than Sam. If Sam has 8, Ada has 5 — you take
                     3 off Sam, not off Ada.
NON-EXAMPLE          Ada has 3 less than Sam does NOT mean 3 − 8.
LEARNER RESTATEMENT  Say "Ada has 3 less than Sam." back in your own words —
                     what is "less than" telling you to do there?
```

**No dictionary dumps.** A dictionary answers *"what does this word mean?"* with
every sense it has ever carried. This answers a different question: *"what job is
this word doing in THIS sentence, for THIS learner?"* Two guards enforce it:

- `assertNotDictionaryDump()` rejects a card with no context, no non-example, no
  restatement prompt, a meaning over 180 characters, or one that opens as a
  gloss ("a word meaning…").
- `sixu_word_senses.meaning_here` carries the same 180-character ceiling and a
  `not null` non-example, so a dump cannot be written to the backend either.

**The non-example is load-bearing.** It names the sense the learner was about to
reach for instead. That is where comprehension actually breaks.

**The restatement is the evidence.** A card stays `OPEN` until the learner says
it back. `recordRestatement()` scores fidelity against the *job* the word is
doing, not against a form of words, and a restatement that reaches for the wrong
sense is capped at 0.3 and does not clear the blocker. Until then, the engine
holds that comprehension was assumed, not observed.

---

## 2 · Which words get a card

Explaining every word is itself a language load, and it buries the words that
matter. A word is material when:

| Reason | Meaning |
|---|---|
| `SENSE_SWITCH_CHANGES_ANSWER` | the lemma carries more than one job, and the wrong one changes the answer |
| `CARRIES_LOGICAL_WEIGHT` | it is a quantifier, negation, condition, comparison or rate |
| `ABOVE_LANGUAGE_BAND` | it costs this learner effort they have not yet banked |

A word already cleared by this learner (`sixu_learner_known_lemmas`) gets no
card. Cards are ordered so invariant-carrying words come first, and capped at
eight — the rest are reported as deferred, not silently dropped.

A word above band that the lexicon does not carry is recorded in
`sixu_lexicon_gaps` for a person to fill. **The engine never invents a meaning.**

---

## 3 · Word sense: one word, many jobs

A lemma holds several senses. Each records the job it performs, the cues that
select it, a substitute, an example and a non-example.

| Word | Sense | Job | Selected by |
|---|---|---|---|
| left | `left#remainder` | how many are still there after some went | "how many … left", "are left" |
| left | `left#direction` | the side opposite your right hand | "turn left", "on the left" |
| of | `of#part` | **multiply** — a part taken from an amount | "half of", "a third of", "40% of" |
| of | `of#belonging` | says what belongs to what | "the lid of the jar" |
| table | `table#data` | rows and columns you read across and down | "the table shows", "row", "column" |
| table | `table#furniture` | the thing you sit at | "on the table" |
| mean | `mean#average` | add them all, then split the total evenly | "the mean of" |
| mean | `mean#signify` | stands for | "what does … mean" |
| primary | `primary#source` | made at the time by someone who was there | "primary source" |
| primary | `primary#main` | the main one | "primary reason" |
| record | `record#document` | a written or kept trace of something | "parish records show" |
| record | `record#best` | the best result anyone has reached | "broke the record" |
| consensus | `consensus#standing` | what most researchers currently hold — **not** that it is proved | "consensus", "mainstream view" |

Sense selection scores cue matches and domain fit. Where the context does **not**
separate the top two senses, the engine returns `ambiguous` with **no** chosen
sense and a question for the learner:

> In "Look at the table and write down what it shows.", is "table" doing the job
> of "rows and columns holding numbers you read across and down" or "the thing
> you sit at"?

The run halts there. A silent sense guess is failure mode **FM-01**, and it is
`BLOCKING`.

Cues live in `sixu_sense_cues` as data, so a department can teach the engine a
new context without a code change. The seed generator converts JavaScript `\b`
word boundaries to PostgreSQL `\y`, and `tests/six-seed.test.mjs` fails if a raw
`\b` ever reaches the SQL — it would silently match a backspace, not a boundary.

---

## 4 · Language load vs mathematical load

```
P_solve = L × M × S

L = the sentence is understood
M = the mathematical relationship is understood
S = the solving procedure can be carried out
```

A word problem failure is one number with three possible causes. Multiplying
makes the product zero when any factor is zero — **which is exactly why the
product must never be read backwards.**

### The rule

> **If L = 0, the attempt carries no information about M or S.**
> The learner never reached the mathematics. The engine records M and S as
> `UNMEASURED` (null), never 0, and returns
> `mathematics_deficit_claim: NOT_SUPPORTED`.

`UNMEASURED` is not a smaller number than zero. It is a different kind of thing,
and the whole module exists to keep the two apart. Below the L threshold, any M
or S taken from the story presentation is **discarded** — not scored low,
discarded — unless it was measured under a language-controlled presentation.

Five check constraints in `0005_load_separation.sql` mean no client, present or
future, can write it any other way:

| Constraint | Refuses |
|---|---|
| `sixu_low_language_forbids_deficit_claim` | a mathematics deficit claimed while the sentence was not understood |
| `sixu_low_language_discards_uncontrolled_m` | an uncontrolled M recorded below the L threshold |
| `sixu_low_language_discards_uncontrolled_s` | the same for S |
| `sixu_p_solve_requires_all_three` | a product written with a factor missing |
| `sixu_p_solve_is_the_product` | a product that is not L × M × S |
| `sixu_verdict_matches_measurement` | a verdict naming a blocker that was never measured |

### The control condition

`languageControlledForm()` re-presents the *same* relationship, the *same*
numbers and the *same* step count with the sentence load taken out:

```
Sam = 8
Ada = Sam - 3
Find: Ada ÷ 5
```

If the learner can do this and not the story, the deficit was never mathematical.

### Verdicts

| Verdict | Teaching target | Deficit claim |
|---|---|---|
| `LANGUAGE_UNMEASURED` | unknown — measure first | `NOT_SUPPORTED` |
| `LANGUAGE_BLOCKED` | the sentence | `NOT_SUPPORTED` |
| `RELATIONSHIP_UNMEASURED` | unknown — measure under control | `NOT_CLAIMED` |
| `RELATIONSHIP_BLOCKED` | the relationship | `SUPPORTED_RELATIONSHIP` |
| `PROCEDURE_UNMEASURED` | unknown — measure bare | `NOT_CLAIMED` |
| `PROCEDURE_BLOCKED` | the procedure | `SUPPORTED_PROCEDURE` |
| `SECURE` | transfer | `NOT_CLAIMED` |

No restatement at all means `L = null`, not `L = 0`: comprehension was never
observed, only assumed. The next action is to collect the restatement before any
score is written down.

A relationship stated with its operands swapped or its operator inverted
(`Ada = Sam + 3` for `Ada = Sam - 3`) is scored 0.4 and reported as *"relationship
recognised, direction reversed"* — a different finding from not having the
relationship at all, and a different lesson.

---

## 5 · Adult-to-child concept parity

Simplifying language is permitted. Simplifying the concept is not.

`extractInvariants()` reads the load-bearing logic of a statement independently
of its wording: `QUANTIFIER`, `NEGATION`, `CONDITIONAL`, `CAUSAL_DIRECTION`,
`COMPARISON_DIRECTION`, `UNIT`, `SCOPE`, `UNCERTAINTY`, `POSITION_HOLDER`,
`MULTI_STEP`, `TEMPORAL_ORDER`.

`languageFriction()` measures what a sentence costs to read with no reference to
what it means: words per sentence, rare words, clause depth, passive voice,
nominalisation, pronoun distance.

A rewrite passes only when **both** hold:

```
parity === 1              every concept invariant survived
friction fell             the child-facing text is genuinely easier
```

| Permitted | Forbidden |
|---|---|
| shorter sentences | dropping a quantifier |
| one idea per sentence | dropping a negation |
| common word for rare word | dropping a condition |
| active voice for passive | reversing or removing a cause |
| name for pronoun | reversing a comparison |
| verb for nominalisation | dropping units |
| concrete example added | collapsing a multi-step relation into one step |
| clause split out | replacing a mechanism with a label |
| | presenting a contested position as settled |
| | removing who holds the position |
| | removing stated uncertainty |

Worked example, from the sample runs:

> **Adult:** Most physicists hold that ice floats because, if the same space
> holds less mass, the object is less dense than the water around it.
>
> **Refused:** "Ice floats because it is light."
> parity 0.25 · friction 20.08 → 3.50 · lost QUANTIFIER, CONDITIONAL,
> POSITION_HOLDER. It is much easier to read and it is a smaller concept.
>
> **Accepted:** "Most scientists say this. If the same amount of space holds less
> stuff, then the thing floats because of that. Ice holds less stuff in that
> space than water does."
> parity 1.00 · friction 20.08 → 8.37.

`gateSimplification()` returns the *source* text plus a rewrite instruction
naming each lost invariant. It does not quietly accept the smaller concept.

This is the guarantee the phrase "adult-to-child concept parity" is making: the
Six get the real concept in reachable words, never a smaller concept in easy
words.
