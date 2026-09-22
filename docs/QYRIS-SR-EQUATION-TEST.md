# SR = N × E × S × A × C × R — test result

**Status: CANDIDATE. HELD FOR CHAIRMAN. NOT CANON.**

The equation was implemented exactly as proposed, then tested against eight
failure modes. **One of eight passes.** It is not used to gate anything, is not
published as a score anywhere a decision is made, and `qyr_sr_candidate.canon`
carries a check constraint that refuses the value `true`.

Reproduce: `npm test` (tests/qyris-sr.test.mjs), or in the browser under
**SR Test Bench** on the QYRIS surface.

---

## The factors, as defined against the Trusted Six model

| | Factor | Meaning | Critical |
|---|---|---|---|
| **N** | NEED | The declared need is real, current, and matches this role family. | |
| **E** | EVIDENCE | The basis to act is checkable rather than asserted. | |
| **S** | SAFETY | Safety clearance stands, with no open safety finding. | ✓ |
| **A** | AUTHORITY FIT | The requested scope is inside what this family may ever hold. | |
| **C** | CONFLICT CLEARANCE | Declared, and cleared by someone other than the supporter. | ✓ |
| **R** | RESTORATION STANDING | Breach record resolved, remedies completed, watch served. | |

---

## Results

| # | Test | Result | Finding |
|---|---|---|---|
| T1 | ZERO_PROPAGATION | **PASS** | Any single factor at zero drives SR to zero. This is the candidate working as intended, and it is the part worth keeping. |
| T2 | RANGE_COLLAPSE | DEFECT | Sweeping all six factors across a healthy 0.6–1.0 band over **1,771,561 points**, **97.0%** of results fall below 0.5 and the mean is **0.262**. A supporter with nothing wrong anywhere reads as a failing score. |
| T3 | COMPENSABILITY_ORDERING | **DEFECT — blocking** | A supporter with SAFETY at 0.12 scores **0.1200**, *above* a supporter who is 0.7 on everything at **0.1176**. The product ranks a near-total safety failure above uniform adequacy, because it has no concept of a critical factor. |
| T4 | NOISE_AMPLIFICATION | DEFECT | ±10% error on each of six factors produces a **124.0%** swing (−46.9% to +77.2%) from inputs that are each individually acceptable. Several of these factors are judgements, not measurements. |
| T5 | GAMING_GRADIENT | DEFECT | ∂SR/∂f = SR/f, so the steepest available gain sits on the lowest factor. In a realistic vector that is **EVIDENCE** — the factor cheapest to raise by producing paperwork. The incentive points at documentation rather than at safety or conflict clearance. |
| T6 | THRESHOLD_UNDEFINED | DEFECT | At a threshold of 0.3, a vector with CONFLICT at 0.35 is admitted alongside one that is 0.8 across the board. The scalar has already discarded *which* factor was weak, so no threshold can separate them. |
| T7 | DIMENSION_SENSITIVITY | DEFECT | Adding a seventh factor at the same 0.9 quality drops SR from 0.5314 to 0.4783 — a **10.0%** fall with nothing about the supporter changed. Scores are not comparable across model versions, so historical SR becomes meaningless the moment the model grows. |
| T8 | UNKNOWN_HAS_NO_TERM | DEFECT | With one factor unestablished: treating UNKNOWN as 1 scores a perfect 1.00 and hides that nothing was checked; as 0 it refuses everyone whose paperwork is merely incomplete; as 0.5 it invents a number nobody measured. The equation has no term for "not established" — the exact distinction THYLORA's evidence rule exists to hold. |

**Verdict: `DEFECTS_FOUND_DO_NOT_CANONIZE`.**

---

## T3 in detail, because it is the one that blocks

```
uniformly acceptable   N .7  E .7  S .7  A .7  C .7  R .7   →  SR = 0.1176
critical near-failure  N 1   E 1   S .12 A 1   C 1   R 1    →  SR = 0.1200  ← ranks HIGHER
```

A multiplicative score treats all six factors as interchangeable. SAFETY and
CONFLICT are not interchangeable with NEED and EVIDENCE. There is no weighting
of a product that fixes this without destroying T1, which is the one property
worth keeping: weights that make SAFETY dominate also make a zero in NEED
survivable.

The obvious repair — the normalised geometric mean `SR^(1/6)`, which at least
puts the number on the same scale as its factors — is implemented as
`srGeometric()` and **still fails T3**, because normalising a product does not
change its ordering. That is asserted in the test suite rather than argued.

---

## What is recommended instead

Keep what the candidate gets right and discard the scalar.

1. **Gate, do not score.** `srGate()` applies a **per-factor floor** and returns
   every blocker at once. SAFETY and CONFLICT carry higher floors (0.90) than
   NEED, EVIDENCE and RESTORATION (0.60); AUTHORITY FIT is 1.00, because scope
   fit is not a matter of degree. This is what zero-propagation was reaching for,
   made explicit and made non-compensable.
2. **Name the binding constraint.** `srBinding()` returns *which* factor is
   weakest, by name and meaning. A refusal that names its cause can be acted on;
   a number cannot.
3. **Carry UNKNOWN as UNKNOWN.** `qyr_sr_observations` records a `basis` of
   OBSERVATION / MEASUREMENT / INFERENCE / PROOF / UNKNOWN, with a check
   constraint making UNKNOWN the only basis that may carry a null value, and
   the only one that may. An unestablished factor binds before any known one.
4. **Publish the vector, not a score.** `srReport()` returns
   `{ eligible, binding, blockers, vector, score: null }`. `qyr_sr_score()`
   exists in the database only to raise `SR_NOT_CANON` and point the caller at
   `qyr_sr_gate()`, and it is revoked from `anon` and `authenticated`.

```js
srReport({ N: 0.9, E: 0.4, S: 0.95, A: 1, C: 'UNKNOWN', R: 0.9 })
// {
//   canon: false,
//   eligible: false,
//   binding: 'C',
//   bindingValue: null,
//   blockers: [ { code: 'FACTOR_UNKNOWN', factor: 'C', … },
//               { code: 'BELOW_FLOOR', factor: 'E', value: 0.4, floor: 0.6, … } ],
//   vector: { N: 0.9, E: 0.4, S: 0.95, A: 1, C: null, R: 0.9 },
//   score: null
// }
```

---

## What this build did not do

It did not canonize the equation, and it did not reject it on the Chairman's
behalf either. The candidate is stored in `qyr_sr_candidate` with
`status = 'HELD_FOR_CHAIRMAN'`, the eight results are stored in
`qyr_sr_test_results`, and both read back through `qyr_readback_summary()`.

Canonization requires a migration and a Chairman act. Nothing in this delta
performs one.
