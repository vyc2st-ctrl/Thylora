# Cross-reference proposal — THY-VEH-SAFE-SERVICEABLE-001 ↔ ER-AUTO-BS-009

**Status:** PROPOSAL. Nothing merged, nothing overwritten, no record altered.
**Prepared:** 2026-09-17

> Both records stay independent. This proposes a *link*, not a merge. Neither record is
> destroyed, absorbed, or rewritten by what follows.

---

## The two records, as they actually stand

| | `THY-VEH-SAFE-SERVICEABLE-001` | `ER-AUTO-BS-009` |
|---|---|---|
| Kind | Programme / architecture standard | Build sheet |
| Lives in | `program_registry` | `er_automotive_build_sheets` |
| Title | THYLORA Safe + Serviceable Vehicle Architecture | (build sheet, WR-AUTOMOTIVE) |
| State | `SPEC_IN_PROGRESS` | `GATE_1_ARCHITECTURE_COMPLETE_VALIDATION_OPEN` |
| World layer | `EDEREARIAH` | ErsatzReality automotive |
| Authority | Chairman Vyc — Vyctor Peete | Chairman/backend canon |
| Scope | 14 principles: understructure before aesthetics, life-safety as baseline not premium trim, diagnostics that explain, mechanical fallback, redundant sensing with disagreement detection, repair access before styling freeze | Occupant package, body architecture, crash engineering, 10 open gaps, 9 blockers |

The programme's `next_action` reads: *"Select first proof vehicle and complete Gate-1
architecture with serviceability map, fault-tree, baseline-safety feature matrix and
premium-vs-standard justification review."*

That sentence is the whole reason these two records should be looked at together.

---

## 1. What overlaps

**Fault tree — direct, complete overlap.** Gate-1 asks for a fault-tree. BS-009 contains
three top events, each with branches and controls, and `LOSS_OF_CONTROL` carries explicit
minimum cut sets:

- common power loss **plus** no reserve
- shared sensor corruption **plus** missing plausibility check
- actuator jam **plus** no mechanical/degraded path

**Principle-to-artifact overlap.** Several programme principles already have concrete
expression in BS-009 rather than remaining as stated intent:

| Programme principle | BS-009 expression |
|---|---|
| "redundant sensing with disagreement detection" | Every FMEA detection column is a plausibility check — pressure *and* pedal travel; dual *diverse* sensing; sensor *disagreement* with conservative fallback |
| "mechanical fallback for safety-critical functions" | Restraints carry "mechanical release accessible after power loss"; door-release FMEA control is an ambidextrous mechanical release plus external rescue point |
| "failure isolation without total vehicle blindness" | Safety-network-gateway FMEA: segmentation, safe state, signed rollback-capable update |
| "understructure before aesthetics" | Rollover rule: closed load ring preserved independent of cosmetic roof; door openings cannot sever the primary ring |
| "repair access designed before styling freeze" | Replaceable crash boxes with keyed interfaces and post-repair dimensional verification |

---

## 2. What is reusable

Reusable by the programme **as Gate-1 evidence, without rework**:

- the three fault trees with cut sets
- the six-line FMEA (item / mode / effect / control / detection / validation)
- the occupant package: eleven inputs, design population, seven hard gates, adjustable
  systems, verification list
- the body architecture: cell, rollover rule, side-impact strategy, crash modules,
  restraints, post-crash
- the nine blockers and ten open work packages, which map cleanly onto the programme's
  own five `unresolved` items

---

## 3. What remains missing

Gate-1 is **not** satisfied by BS-009 alone. Three of its four named deliverables are absent:

| Gate-1 deliverable | Status |
|---|---|
| Fault-tree | **PRESENT** in BS-009 |
| Serviceability map | **MISSING.** The programme's serviceability principles exist as prose; there is no map. BS-009 records `serviceability: ARCHITECTURE_DEFINED_PHYSICAL_LAYOUT_OPEN`. |
| Baseline-safety feature matrix | **MISSING.** The programme carries a strong position — life-safety capability must not be reserved for premium trims where the safer design can be standard — but no matrix enumerates which features are baseline. |
| Premium-vs-standard justification review | **MISSING.** Cannot be produced before the matrix exists. |

Also still open across both records: first native vehicle class, powertrain architecture,
redundancy budget, serviceability metrics, and Earth reference vehicles for redesign study.

---

## 4. Does linking change either record's meaning?

**Yes — in one specific way, and it is a Chairman determination, not a clerical one.**

The programme's `next_action` begins *"Select first proof vehicle"*. Its `dependencies`
list includes *"C&W proof vehicle"*. Linking BS-009 to the programme as its Gate-1 evidence
would, by implication, **designate BS-009's vehicle as the programme's first proof
vehicle.** That is a scope decision about which vehicle the architecture is being proven
on. It is not established by the fact that the fault trees happen to match.

Second, more minor: the programme is `world_layer = EDEREARIAH`, and BS-009 sits in the
ErsatzReality automotive programme. Linking them asserts these are the same engineering
lineage. That is almost certainly the intent, but it should be stated rather than assumed.

If the Chairman does **not** intend BS-009's vehicle to be the proof vehicle, the correct
link is weaker: cite BS-009 as *reusable prior art* for Gate-1 rather than as *Gate-1
evidence for this programme*.

---

## 5. Proposed action, on approval

1. Add a `gate_1_evidence` reference on `THY-VEH-SAFE-SERVICEABLE-001` pointing to
   `ER-AUTO-BS-009`, with an explicit `coverage` field reading
   `fault_tree: SATISFIED; serviceability_map: MISSING; baseline_safety_matrix: MISSING; premium_vs_standard_review: MISSING`.
2. Add a reciprocal `satisfies_programme` reference on BS-009.
3. Record whether the link designates BS-009 as the **first proof vehicle** (scope
   decision) or as **reusable prior art** (citation only).
4. Leave both records otherwise untouched. No field is merged, moved, or deleted.

**Nothing in steps 1–4 has been executed.** Both records remain exactly as found.

---

## 6. Chairman decision required

1. Does linking designate BS-009's vehicle as the programme's **first proof vehicle**, or
   is this a citation of reusable prior art?
2. Confirm the EdereAriah / ErsatzReality lineage is one lineage for this purpose.

Until those are answered, the two records stay independent and Gate-1 stays open on three
of its four deliverables.
