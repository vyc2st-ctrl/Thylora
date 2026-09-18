# VPR — VictorPeete Reality Visual System

**Policy code:** `THY-VICTORPEETE-REALITY-VISUAL-SYSTEM-001`
**2026-09-18** · Agent: CLAUDE · Workstream: `VPR_VISUAL_SYSTEM` · Thread: PRODUCTION
**Backend head at authoring:** sequence 477 · **Controlling anchor:** `THY-Q-20260903-1412-SPINE-002` (anchor_sequence_no 263)

**NO IMAGE GENERATED. NOTHING PUBLISHED. NO LIVE STORE MUTATION. NO PRODUCT ACTIVATION.**

Preserved: **ACCESS != AUTHORITY · UNKNOWN != ASSUMED · SAID != DONE · TESTED != LIVE**

---

## 0. What this document is, and what it is not

This is the **measuring instrument and the layer grammar**. It does not authorise a single image.
Generation authority lives in `THY-IMAGE-GENERATION-CHAIRMAN-EXPLICIT-001`, which is LOCKED and
requires **explicit Chairman direction in the current turn**. A score of R = 1 from this document
means *the plan is releasable-quality on paper*. It does not mean generate.

This system **does not replace** the ten LOCKED visual gates already in the backend. It sits on top
of them and reads them. Where this document and a LOCKED gate disagree, the LOCKED gate wins and
the disagreement is reported, not resolved silently.

---

## 1. The gauge, with its variables

> **VPR = D × Lv × C × E × I × P**
>
> | Symbol | Name | What it measures |
> |---|---|---|
> | **D** | **DEPTH** | Is there real separation between viewer plane, subject, and world — or is the piece flat? |
> | **Lv** | **LAYER INTEGRITY** | Are all seven `VISUAL_LAYER_0…6` strata present, in order, none collapsed into another? |
> | **C** | **COMPOSITIONAL LEGIBILITY** | Contrast, hierarchy, whitespace, reading path. Can the eye find the entry point in one second? |
> | **E** | **EVIDENCE DOMINANCE** | Do words, numbers and sources dominate? Does no decorative element obscure a caveat, a figure, or a qualifier? |
> | **I** | **IDENTITY & PROVENANCE** | Vyc2st mark present and legible; serial, version, SHA-256, rights state, correction state all resolvable. |
> | **P** | **PLATFORM & PRINT SURVIVAL** | Does it survive a phone crop, a greyscale print, an ink-load test, and a screen reader? |

**Why `Lv` and not `L`.** `L` is already bound in `P_solve = L × M × S`, where it means *language
access*. Using `L` for a visual layer term would collide two different meanings in one system.
`Lv` is the layer term. The strata are always written in full — `VISUAL_LAYER_3` — never `L3`.

### 1.1 Band definitions

Each factor is scored **0–5**. The bands are behavioural, not aesthetic opinion.

| Score | Meaning |
|---|---|
| **0** | The factor is absent or actively violated. Hard zero. |
| **1** | Present but broken — a reviewer would name it as a defect unprompted. |
| **2** | Amateur floor. Recognisably a draft. |
| **3** | Competent. Nothing wrong; nothing distinguishing. |
| **4** | Professional. Would pass in a paid publication without comment. |
| **5** | Distinguishing. A reader could identify the house style from this alone. |

### 1.2 Floors — and why the product alone is not the gate

**A product threshold is gameable.** `5 × 5 × 5 × 5 × 5 × 1 = 3125`, which beats
`4 × 4 × 4 × 4 × 4 × 4 = 4096`… no it does not, but `5×5×5×5×5×2 = 6250` does, and that piece has a
**broken** factor. A single high score must never buy a defect. Therefore the release gate is
**per-factor floors**, not the product. The product is reported for tracking only.

| Factor | Floor | Why this floor |
|---|---|---|
| **D** | **≥ 3** | Depth can be restrained. It cannot be absent. |
| **Lv** | **= 5** | Layer integrity is structural. A collapsed stratum is not "slightly worse", it is a different object. |
| **C** | **≥ 4** | Below professional legibility the piece fails its only job. |
| **E** | **≥ 4** | `THY-VISUAL-OUTPUT-IDENTITY-001`: "Words and evidence dominate." |
| **I** | **= 5** | `THY-VYC2ST-MARK-GLOBAL-001` and the provenance rule are binary. A mark is present or it is not. |
| **P** | **≥ 4** | A piece that dies on a phone or in greyscale is not finished. |

**Zero rule (inherited, `THY-WORLD-CONTINUITY-FLOOR-001`): any hard factor = 0 ⇒ HOLD.**
No generation, no build, no release.

### 1.3 The release gate

> **R = 1 if and only if:**
> **(a)** every VPR factor meets its floor in §1.2, **and**
> **(b)** every applicable hard gate in §3 returns PASS.
>
> **R = 0 otherwise. R has no middle value.**

R = 0 is not a rejection of the work. It names which factor or which gate is short, and that is
the next action.

### 1.4 Reference product values

For tracking only, never as the gate: minimum passing product is
`3 × 5 × 4 × 4 × 5 × 4 = 4800` out of a ceiling of `5⁶ = 15625`.
**A product of 4800 with `I = 4` is still R = 0.**

---

## 2. `VISUAL_LAYER_0 … VISUAL_LAYER_6`

Seven strata, ordered **from the viewer inward**. This is a *spatial* stack. Attention priority is a
separate ordering and is given in §2.2 — conflating the two is the most common way these systems rot.

| Stratum | Name | Contains | Collapse test — fails if… |
|---|---|---|---|
| **`VISUAL_LAYER_0`** | **VIEWER MEMBRANE** | The fixed interworld plane. `B = g1F + g2S + g3E + g4D`, `dB/dt = 0`, relative visual weight **0.18–0.28**. | It drifts, swirls, becomes smoke or haze, or reads as weather inside the world. |
| **`VISUAL_LAYER_1`** | **PROVENANCE STRATUM** | Vyc2st mark, serial, version, SHA-256 reference, rights state, corrections line. | Any one of these is missing, or the mark obscures evidence. |
| **`VISUAL_LAYER_2`** | **NAVIGATION STRATUM** | Masthead, rules, section labels, folio, date, edition number. | The reader cannot tell what publication this is and which issue. |
| **`VISUAL_LAYER_3`** | **EDITORIAL STRATUM** | Headline, deck, byline, body columns, pull quotes. | Headline and deck sit at the same typographic weight. |
| **`VISUAL_LAYER_4`** | **EVIDENCE STRATUM** | Equation block, claim table, source list, DOCUMENTED / INFERENCE / UNKNOWN tags. | Evidence is decoration-adjacent rather than structurally separated. |
| **`VISUAL_LAYER_5`** | **SUBJECT STRATUM** | The lead image or primary illustration; the thing the piece is *about*. | There is no single identifiable subject, or the subject is a stock gesture. |
| **`VISUAL_LAYER_6`** | **WORLD DEPTH STRATUM** | Background, period ground, material wear, atmosphere, light falloff. | The background is a flat fill or a generic gradient. |

**No free-floating decorative annotation exists in any stratum.** Every mark on the surface belongs
to exactly one stratum and has a stated job. If a mark cannot be assigned, it is removed.

### 2.2 Attention priority, and a conflict that needs a Chairman ruling

Two LOCKED gates order attention differently, and both apply to a newspaper front:

- `THY-INTERWORLD-BARRIER-GLOBAL-001` — **`SUBJECT > WORLD > DEPTH > BARRIER`**
- `THY-VISUAL-OUTPUT-IDENTITY-001` — evidence-document floor: **"Words and evidence dominate.
  Imagery carries atmosphere, place, weather, time, event and identity without competing with
  the evidence."**

**These are not the same ordering.** One puts the subject first; the other puts the words first.

**Resolution proposed here, by scope — NOT yet Chairman-confirmed:**
the barrier gate orders attention **inside a generated image**; the output-identity gate orders
attention **inside a document that contains an image**. On a newspaper front, the document rule
governs the page and the image rule governs the plate inside it:

> **Page order:** `EDITORIAL > EVIDENCE > SUBJECT > NAVIGATION > WORLD > PROVENANCE > MEMBRANE`
> **Inside the lead plate:** `SUBJECT > WORLD > DEPTH > BARRIER`

This is recorded as an **open conflict**, not a settled rule. See §8.

---

## 3. Hard gates — all must PASS for R = 1

Each maps to a record already LOCKED in the backend. None of these is scored; each is PASS or FAIL.

| # | Gate | Source record | Fails when |
|---|---|---|---|
| 1 | **Generation authority** | `THY-IMAGE-GENERATION-CHAIRMAN-EXPLICIT-001` | No explicit current-turn Chairman generation direction. Discussion, scene lock and an approved brief are **all** explicitly non-authoritative. |
| 2 | **Preflight sequence** | `THY-VISUAL-PREFLIGHT-LOCK-001` | The eleven-step sequence was not run in order before generation. |
| 3 | **Viewer membrane** | `THY-INTERWORLD-BARRIER-GLOBAL-001` | Barrier moves, swirls, hazes, or falls outside 0.18–0.28 relative weight. |
| 4 | **Mark & serial** | `THY-VYC2ST-MARK-GLOBAL-001` | **Vyc2st** mark absent, illegible, oversized, or obscuring evidence; serial or provenance missing. |
| 5 | **Viewable approval** | `THY-APPROVAL-MUST-BE-VIEWABLE-001` | Approval is requested without a working view surface bound to the exact version. |
| 6 | **World continuity floor** | `THY-WORLD-CONTINUITY-FLOOR-001` | Any hard factor = 0; unregistered person, impossible geometry, out-of-period technology. |
| 7 | **Substrate lock** | `THY-SUBSTRATE-LOCKED-VISUAL-ARCHITECTURE-001` | Identity, geometry, causal light, time or provenance drifts from the reference substrate. |
| 8 | **Output identity** | `THY-VISUAL-OUTPUT-IDENTITY-001` | Stock-template appearance; decoration obscuring evidence, caveats, numbers or legal qualifiers. |
| 9 | **Visual grammar** | `THY-VYC-VISUAL-GRAMMAR-002` | Photographic default, generic-AI gloss, sparkle noise, internal fog, colour-wash. |
| 10 | **Claim classification** | `ER-NEWS-001.claim_gate` | Any factual claim is not tagged DOCUMENTED / INFERENCE / UNKNOWN with a source. |
| 11 | **Accessibility** | §5 below | Contrast below 4.5:1 for body text; meaning carried by colour alone; no text alternative for the lead plate. |
| 12 | **Print survival** | §6 below | Fails greyscale, ink-load or 60% -scale legibility. |

Gates 3, 4, 6, 7, 9 apply **only when an image exists**. On a text-and-wireframe deliverable they
return **N/A**, and N/A is not PASS — it means the piece cannot yet reach R = 1.

---

## 4. Mobile rules

1. The front is authored at **1080 × 1350** (4:5) and must survive a **1080 × 1080** centre crop and
   a **1080 × 1920** extension without losing the headline, the equation block, or the Vyc2st mark.
2. **Minimum rendered body size is 28 px at 1080 width** — roughly 9 pt at print scale. Anything
   smaller is decoration and must be removed rather than shrunk.
3. The reader must reach the **equation and its explanation together** without scrolling past one
   screen boundary. Formula and meaning never separate across a fold. (`THY-Q-…-EQUATION-STORE-PACE-470`.)
4. No text within **48 px** of any edge.
5. Thumbnail test: at **160 px wide**, the masthead and the headline's first three words must
   remain distinguishable as shapes.

## 5. Accessibility rules

1. Body text contrast **≥ 4.5:1**; headline and large display **≥ 3:1**.
2. **No meaning is carried by colour alone.** DOCUMENTED / INFERENCE / UNKNOWN carry a word and a
   shape, not just a hue.
3. Every plate has a written **text alternative** stored in the episode's `asset_manifest` — not
   generated at publish time.
4. Reading order in the source markup matches the visual reading path.
5. The equation is written in **linear plain text** (`P_solve = L × M × S`) alongside any set
   typography, so a screen reader speaks it correctly.

## 6. Print rules

1. Judged after physical constraints: **ink load, paper opacity, dry time, smudge risk, contrast,
   legibility** (`THY-VISUAL-OUTPUT-IDENTITY-001`).
2. Maximum total ink coverage **280%**. Deep blacks keep intentional shadow information — a crushed
   black is a FAIL, not a style.
3. **Greyscale test is mandatory.** Convert and re-read. If any distinction disappears, it was
   colour-only and violates §5.2.
4. Bleed 3 mm; no evidence element within 6 mm of trim.
5. **60% -scale test:** print at 60% and read the evidence block unaided. If it fails, the block is
   over-dense, not the reader's problem.

---

## 7. Serial and provenance system

Every VPR-governed surface carries a serial resolvable to a backend row.

```
ER-NEWS-<YYYYMMDD>-<NNN>          newspaper edition
VPR-PLATE-<YYYYMMDD>-<NNN>        an individual image plate
VPR-WIRE-<YYYYMMDD>-<NNN>         a wireframe or preview, pre-image
```

Required beside the serial, in `VISUAL_LAYER_1`:

| Field | Authority |
|---|---|
| Vyc2st mark | `THY-VYC2ST-MARK-GLOBAL-001` |
| Serial | this document |
| Version integer | episode registry `script_version` |
| SHA-256 of the exact file | computed, never asserted |
| Rights state | episode registry `rights_manifest` |
| Correction state | claim ledger `correction_state` |

**The visible mark is a discovery clue. The backend ID and hash are the authority**, because a
visible mark can be copied (`THY-SUBSTRATE-LOCKED-VISUAL-ARCHITECTURE-001.badge_rule`).

---

## 8. Preflight checklist — run in this order, stop at first FAIL

```
[ ]  1. Read backend head, controlling anchor, and newer deltas.
[ ]  2. Read every LOCKED gate in §3 fresh. Do not work from memory.
[ ]  3. Confirm the subject, world, time, style and use are exactly named.
[ ]  4. Confirm identity/person lock and rights/privacy for everyone depicted.
[ ]  5. Confirm every factual claim is in the claim ledger with a class and a source.
[ ]  6. Assemble the explicit written brief. Brief is not authority.
[ ]  7. Run the contradiction/regression check against the prior approved floor.
[ ]  8. Score D, Lv, C, E, I, P against §1.2 floors. Record each score with its reason.
[ ]  9. Evaluate the twelve hard gates. Record PASS / FAIL / N/A each.
[ ] 10. Compute R. If R = 0, stop and report which factor or gate is short.
[ ] 11. Produce a VIEWABLE preview bound to the exact version.
[ ] 12. Obtain explicit current-turn Chairman generation direction.  <-- ONLY THEN GENERATE
[ ] 13. Post-generation: compare against the brief. Reject mismatch; revise only the failed region.
[ ] 14. Write serial, hash, version, rights and approval state to the backend. Read it back.
```

Steps 1–11 are what this workstream can complete without Chairman action. **Step 12 is a hard stop.**

---

## 9. Chairman authority matrix

| Action | Claude may do | Requires Chairman |
|---|---|---|
| Read backend, gates, registries | ✅ | — |
| Score a piece against VPR | ✅ | — |
| Write a wireframe / non-image preview | ✅ | — |
| Write DRAFT / BLOCKED backend records | ✅ | — |
| Record an open conflict | ✅ | — |
| **Generate or edit any image** | ❌ | **Explicit, current turn** |
| Resolve a conflict between two LOCKED gates | ❌ | **Ruling required** |
| Move an episode past DRAFT | ❌ | ✅ |
| Publish, schedule, or post anything | ❌ | ✅ |
| Change a product's live availability | ❌ | ✅ |
| Supersede a LOCKED record | ❌ | ✅ |
| Approve a piece for release (R = 1 → ship) | ❌ | ✅ |

---

## 10. Open conflicts raised by this document

| # | Conflict | Status |
|---|---|---|
| 1 | Attention-priority disagreement between `THY-INTERWORLD-BARRIER-GLOBAL-001` and `THY-VISUAL-OUTPUT-IDENTITY-001` on a document containing an image (§2.2). | **OPEN — scope resolution proposed, not confirmed.** |
| 2 | `LR-20260918-BARRIER-CONFLICT` is still `state = OPEN` in the learning/repair ledger: "Multiple LOCKED records remained execution-eligible", repair = "Lock compiler/supersession graph required." Conflict 1 is an instance of exactly this unbuilt mechanism. | **OPEN — prerequisite.** |
| 3 | `ER-NEWS-001` episode 4 (`THY-RAVENS-PAPER-20260917-001`) is `POSTPUBLICATION_REJECTED_REPLACEMENT_REQUIRED`. A new edition is being added to a program whose last edition is unresolved. | **OPEN — Chairman decision on ordering.** |
