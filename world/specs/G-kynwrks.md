# G · KynWrks

Spelling locked: **KynWrks**. Idea `THY-IDEA-KYNWRKS-001` · app `THY-KYNWRKS-APP-001` (registry `IN PRODUCTION` v1; **runtime not witnessed**) · code `world/lib/recipe-capture.js` · table drafted: `thy_kynwrks_recipe_attempts`

| Lane | State |
|---|---|
| Kennedy Checks It | ACTIVE, format to be built |
| Jordyn Second Gear | ACTIVE, format to be built |
| Cali Taste Lab | ACTIVE: starts with the Chairman's current egg and potato experiments |
| Mateo | **OPEN pending observed evidence.** The code refuses to create a recipe in this lane |

## Cali Taste Lab recipe capture

**No canonical measured formula exists yet.** Every recipe starts in the state `NO_CANONICAL_MEASURED_FORMULA`.

One attempt = one version (`0.1`, `0.2`, …). Each ingredient line records:

| Field | Rule |
|---|---|
| ingredient | plain name |
| form | e.g. *whole large egg*, *russet, peeled, 1 cm dice*, *fine salt* |
| brand | only where it changes the result (salt grain, butter fat %, oil) |
| intended_amount | what the cook meant to add |
| actual_amount | what went in. **Never copied from intended.** If it wasn't measured, record `UNKNOWN` |
| unit | `g`, `ml`, `each`, `pinch_UNMEASURED`, or `UNKNOWN`. Grams are preferred for everything that can be weighed |
| spill_or_deviation | a first-class record: "extra shake", "yolk broke", "left 2 min long" |
| delta | computed as actual − intended when both are numbers |

Per attempt: `method_notes`, `tastings[]` (taster, response, score 1–5, notes), `next_change` (the one variable the next version will change).

**Formula eligibility** (`formulaEligibility`): every line measured in g/ml/each **and** at least two distinct tasters. Even then the result is only *eligible to propose*. **Chairman approval is required** before a version becomes canonical.

### Starter cards to fill at the next cook (blank on purpose; no invented quantities)
```
CTL-EGG-001    Chairman egg experiment      v0.1  lines: egg (each), fat (g), salt (g), other (g) — intended/actual/spill
CTL-POTATO-001 Chairman potato experiment   v0.1  lines: potato (g, form), fat (g), salt (g), liquid (ml), other — intended/actual/spill
```
A kitchen scale reading in grams is the single upgrade that turns these experiments into a formula.

Lineage hook (`THY-IDEA-RECIPE-LINEAGE-001`): when a version is locked, the Royal Kitchen staff (Inés Morales's kitchen) may produce native variations. Each variation cites the parent version, and the contributor receipt flows to the originator.
