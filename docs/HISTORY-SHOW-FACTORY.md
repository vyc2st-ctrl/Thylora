# History → Show Factory

Workroom: **WR-SHOWFACTORY-001** · Backend of record: `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)

A repeatable system that turns documented historical statements, disputes,
discoveries, mistakes, questions and turning points into original ErsatzReality
shows, shorts, cards and products.

**Not biography summaries.** That refusal is enforced in code, not asserted in a
mission statement: see `isBiographySummary()` in `show-factory/lib/formula.js`
and the `BIOGRAPHY_SUMMARY` blocker in the gate.

---

## 1 · The formula

```
SHOW_SEED =
    DOCUMENTED MOMENT
  × HIDDEN MECHANISM
  × HUMAN DECISION
  × EVIDENCE GAP
  × QUESTION FOR TODAY
```

It is a product, not a sum. A missing factor is a zero, not a deduction. A
biography summary is what you get when four of the five are blank and the first
one is padded out to fill the hour.

| Factor | What it is | What it is not |
|---|---|---|
| **Documented moment** | A dated thing that happened, with a source | A life, a career, a period |
| **Hidden mechanism** | How it actually worked, below what the audience can see | An adjective |
| **Human decision** | A person choosing under constraint, where they could have chosen otherwise | A personality trait |
| **Evidence gap** | What the record does not contain, named out loud | A hedge |
| **Question for today** | The live question the moment hands the viewer | A moral |

`scoreFactor()` refuses a factor that is too short, and refuses a list of known
moods — *inspiring, ahead of their time, changed the world, overcame adversity,
never gave up, trailblazer*. A mood is not a mechanism.

---

## 2 · The evidence ladder

The single thing that makes this safe is refusing to let four different kinds of
knowing wear the same clothes.

| Tier | Meaning | May be asserted? | In a short? | In the children's cut? |
|---|---|---|---|---|
| **DOCUMENTED** | A primary or archival source says it, and we can name it | yes | yes | yes |
| **CONTESTED** | Sources conflict, or qualified people dispute it | no — stated as disputed | no | no |
| **INFERENCE** | We reason to it from documented facts | no — labelled as ours | no | no |
| **UNKNOWN** | Nobody knows | no — said out loud | no | no, but the gap is still named |

Source classes, strongest first: `PRIMARY`, `ARCHIVAL`, `SCHOLARLY`,
`INSTITUTIONAL`, `JOURNALISTIC`, `POPULAR`, `UNSOURCED`. A claim cannot be tiered
`DOCUMENTED` unless it reaches `SCHOLARLY` or better. Popular repetition is not
documentation, however universal.

### Quotations fail differently

A quotation can be real, altered, unsourced, or somebody else's entirely, so it
gets its own states rather than a tier:

- `DOCUMENTED_WORDING` — exact words, primary or archival source
- `REPORTED_WORDING` — someone else reports the words; no primary text
- `ALTERED_IN_CIRCULATION` — a real source exists; the popular version is not what it says
- `ATTRIBUTED_UNSOURCED` — universally attributed, never traced
- `MISATTRIBUTED` — traced to a different author

**An unsourced or misattributed line may be the subject of an episode. It may
never be its factual spine.** This rule is why the three starting seeds survived
verification: two of the three quotations the brief supplied turned out not to
say what they are said to say, and in both cases the discrepancy became the
episode rather than an embarrassment buried in a footnote.

---

## 3 · The output ladder

One seed, seven rungs, each with its own job, its own budget and its own rule
about what it is allowed to assert. Produced top down, so a correction upstream
propagates instead of stranding a rung.

| Rung | Job | Contested? | Inference? | Must name the gap? |
|---|---|---|---|---|
| **20-minute episode** | The full five factors; the dispute named, the inference labelled | yes | yes | yes |
| **3-minute version** | Moment, mechanism, decision; the gap gets one sentence | yes | no | yes |
| **60-second short** | One documented surprise and one question. Nothing else | no | no | no |
| **Children's version** | The real question, at the real size, nothing invented to smooth it | no | no | **yes** |
| **Question cards** | Questions that survive being asked by someone who has not seen the episode | yes | yes | no |
| **Discussion page** | One page that lets an adult run the conversation without being an expert | yes | yes | yes |
| **Store product** | An object that carries the question home | no | no | no |

Two rules deserve naming because they are the ones under commercial pressure:

- **The children's cut is the strictest rung in the factory**, not the loosest.
  It may rest only on `DOCUMENTED` claims, and it must still say what nobody
  knows. "Nobody knows" is a children's sentence too.
- **A store product cannot ship on unresolved rights**, and never a portrait
  sold as a relic. Each of the three built seeds carries a product designed to
  need no likeness clearance — because a product that needs an estate's
  permission is a product the estate should be paid for.

---

## 4 · Rights, provenance and the people still living

Three questions, answered separately, because a yes to one is not a yes to the
others.

1. **Copyright** — may we reproduce this?
2. **Provenance** — how did the holding institution come to hold it?
3. **People** — is someone alive who is owed consent, credit or a share?

A 19th-century photograph can be out of copyright, held by an institution that
took it in a punitive raid, and depict a person whose descendants are named and
findable — all three at once.

People flags: `LIVING_DESCENDANTS_IDENTIFIED`, `CONSENT_HISTORY_VIOLATED`,
`HUMAN_REMAINS`, `NAMED_PRIVATE_INDIVIDUAL`, `COMMUNITY_CUSTODIAN`.

`HUMAN_REMAINS` and `CONSENT_HISTORY_VIOLATED` are **hard**: research may
continue, production may not, until a named clearance exists. Four entries in the
candidate queue carry that hard gate — Henrietta Lacks, the Tuskegee Study, the
Benin Bronzes and the Tulsa excavations — and they are in the queue *with* the
gate rather than left out to keep the queue tidy.

---

## 5 · Corrections

Corrections are append-only and public. `hsf_corrections` raises on `update` and
on `delete`; the JS side appends and never overwrites. A history product that
quietly edits itself is a history product nobody can trust twice.

---

## 6 · Layout

```
show-factory/lib/evidence.js   the ladder: tiers, source classes, quotation states
show-factory/lib/formula.js    SHOW_SEED as a product; the biography test
show-factory/lib/rights.js     copyright / provenance / people, kept apart
show-factory/lib/formats.js    the seven rungs and their rules
show-factory/lib/seed.js       the production gate; candidates; corrections
show-factory/seeds/*.json      three built seeds and the candidate queue
db/show-factory/*.sql          the same rules at the data layer
tests/show-factory.test.mjs    43 tests over the rules above
```

The rules are written twice on purpose — once in `lib/` so the researcher sees
the answer immediately, once in SQL so a different client cannot bypass them.
A test asserts the two do not drift.

---

## 7 · How to build a seed

1. Find a **dated moment**, not a person.
2. Write every claim you intend to make, one row each, and tier it. If you cannot
   name a source, the tier is `INFERENCE` or `UNKNOWN`, and that is a finding, not
   a failure.
3. Check every quotation against a primary source before you fall in love with it.
   Two of the three seeds in this build changed shape at this step.
4. Fill all five factors. If you cannot find the hidden mechanism, you do not yet
   have a show; you have a subject.
5. List the visual evidence and answer all three rights questions per item.
6. Cut the ladder top down from the 20-minute episode.
7. Run the gate. It returns every unmet prerequisite at once, each with the route
   that clears it. Fix the record in one pass.

```js
import { productionGate } from './show-factory/lib/seed.js';
const result = productionGate(seed);
// { gate_state, blockers: [{ code, detail, route }], tier_profile, formula_product, evidence_ready }
```

---

## 8 · What this system does not do

- It does not decide what is true. It decides what may be asserted, by whom, on
  which rung, and it makes the uncertainty visible instead of invisible.
- It does not clear rights. It refuses to let unresolved rights pass silently.
- It does not replace a historian. Every built seed names the archive that has to
  be reached before broadcast, and the gate stays blocked until it is.
