# THYLORA · Understanding Transfer Gate

**Work item:** THY-WORK-UNDERSTANDING-TRANSFER-GATE-587
**Code:** `understanding/understanding.js` · **Tests:** `tests/understanding.test.mjs`

```
U = K × E × C × X × T
```

| | Factor | The question it answers |
|---|---|---|
| **K** | KNOWLEDGE | What is actually known, stated as something a person could check? |
| **E** | EVIDENCE | What backs each claim, cited, with an evidence class? |
| **C** | CONNECTIONS | What does this join to that the audience already holds? |
| **X** | EXPLANATION | How many genuinely different ways is it shown? |
| **T** | TRANSFER | What proves the audience can now do something new? |

## Why it multiplies

An average lets a strong factor hide a missing one. A beautiful explanation with no
evidence averages to "pretty good". A product cannot do that: **if any factor is zero,
U is zero.** The test suite asserts this for all five factors.

At the same average score, the product prefers the balanced asset:

| Asset | Factors | Average | U |
|---|---|---|---|
| Balanced | 60 · 60 · 60 · 60 · 60 | 60 | **8** |
| Lopsided | 100 · 80 · 60 · 40 · 20 | 60 | **4** |

That gap is the entire design. `weakestFactor()` names where one unit of work buys the
most U, because the product punishes the weakest factor hardest.

## Scores, floors and bands

Factors score 0–100 as integers. U is computed by exact integer multiplication
(`100⁵ = 10¹⁰`, inside the safe integer range) and rounded once at the end, so two runs
never disagree.

- **FACTOR_FLOOR = 20.** Every factor must clear it on its own. A floor failure is
  reported by factor, never as a vague "not ready".
- **RELEASE_THRESHOLD = 25.** U must clear it before an asset goes outward.

| Band | U ≥ | Meaning |
|---|---|---|
| `TRANSFERRED` | 55 | The audience can do the new thing without the asset in front of them. |
| `WORKING` | 30 | Transfer happens with the asset present. Not yet portable. |
| `FRAGILE` | 10 | Something lands, but one weak factor is carrying the rest. |
| `NO_TRANSFER` | 0 | Nothing reliably moves. |

**CHILD, ADULT and SCHOLAR are not math display labels.** The prohibition is carried
forward from earlier sequences and is now machine-enforced: `FORBIDDEN_BAND_LABELS`
holds those three words, `assertLabelsLegal()` throws if a band ever takes one, and the
gate calls it on every run. Bands describe the *state of transfer*, never a person and
never an age.

## Every outward asset must show what the audience learns

`LEARNING_STATEMENT_MISSING` is a blocker. An asset with no `learning_statement` does
not leave, whatever else it has.

## The gate returns every blocker at once

One call, the whole list, each with a code, a plain-language detail and a route. Nobody
learns their problems one round trip at a time. An empty asset returns eleven blockers.

Blocker codes: `AUDIENCE_MISSING`, `LEARNING_STATEMENT_MISSING`, `KNOWLEDGE_NOT_STATED`,
`CLAIM_UNCITED`, `EVIDENCE_REFERENCE_BROKEN`, `EVIDENCE_CLASS_UNSOUND`,
`CONNECTIONS_MISSING`, `EXPLANATION_MISSING`, `SINGLE_REPRESENTATION`,
`TRANSFER_TEST_MISSING`, `TRANSFER_PASS_CONDITION_MISSING`,
`FACTOR_BELOW_FLOOR_{K|E|C|X|T}`, `UNDERSTANDING_BELOW_THRESHOLD`.

Two of those deserve naming out loud:

- **`SINGLE_REPRESENTATION`** — one representation is a telling, not an explaining.
  A person who does not think in that mode is simply left out.
- **`TRANSFER_PASS_CONDITION_MISSING`** — a test that cannot be failed is not evidence.

## Evidence classes and their weight

`PRIMARY_RECORD` 100 · `MEASUREMENT` 95 · `OFFICIAL_PUBLICATION` 85 · `PEER_REVIEWED` 85 ·
`VENDOR_QUOTE` 70 · `SECONDARY_REPORT` 55 · `ORAL_HISTORY` 45 · `MODELLED_ESTIMATE` 35 ·
`UNSOURCED` 0.

**E is set by the weakest cited claim, not the average.** One uncited claim in an
otherwise excellent asset puts E at 0 and therefore U at 0. That is tested.

## The eight audiences

`understanding/examples.js` builds a complete asset for each. Run the gate over them:

| Audience | U | Band | State |
|---|---|---|---|
| CHILD | 57 | TRANSFERRED | READY |
| PARENT | 48 | WORKING | READY |
| TEACHER | 48 | WORKING | READY |
| BUSINESS | 28 | FRAGILE | READY — and fragile for a reason: its cost figures are `SECONDARY_REPORT`, not vendor quotes |
| NEWS | 48 | WORKING | READY |
| STORY | 48 | WORKING | READY |
| VEHICLE | 50 | WORKING | READY |
| HEALTH EDUCATION | 18 | FRAGILE | **BLOCKED** |

### The eighth one is blocked on purpose

HEALTH EDUCATION is a complete, well-built asset — three claims, three representations,
two connections, a transfer test with a pass condition. It is blocked because its central
evidence is `MODELLED_ESTIMATE`: a description of how nutrition panels are generally laid
out, not a photograph of a label in hand. That was the honest class available this session.

A test asserts that swapping that one evidence record for `PRIMARY_RECORD` — a photograph
of the actual label — makes it pass with nothing else changed. The gate is not decoration;
it refused the one asset whose evidence could not be obtained.

It also carries `not_medical_advice: true` and `collects_medical_detail: false`,
consistent with the standing THYLORA refusal of medical fields.

## Using it

```js
import { understandingGate } from './understanding/understanding.js';

const result = understandingGate(asset);
// { ready, factors: {K,E,C,X,T}, u, band, learning_statement, blockers[] }
```
