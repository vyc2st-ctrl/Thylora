# PRODUCT RECORD — CW-ENG-NOTEBOOK-VOL1

**Title:** C&W Vehicle Civilization — Engineering Notebook Vol. 1
**Created:** 2026-09-17
**Programme:** ER PRODUCTS — AUTOMOTIVE / WR-AUTOMOTIVE
**Customer artifact:** `products/CW-ENGINEERING-NOTEBOOK-VOL1/notebook.md`

---

## 1. SOURCE MANIFEST

Every technical statement traces to a verified backend record. No source outside this list was used, and nothing was invented for publication.

| Source record | Backend table | What it supplied |
|---|---|---|
| `ER-AUTO-BS-009` (state: GATE_1_ARCHITECTURE_COMPLETE_VALIDATION_OPEN) | `er_automotive_build_sheets` | Occupant package (11 inputs, design population, 7 hard gates, adjustable systems, verification list); body architecture (cell, rollover rule, side impact, crash modules, restraints, post-crash); crash engineering (3 fault trees with branches, controls and minimum cut sets; 6-item FMEA); 10 open gaps; 9 blockers |
| `ER-AUTO-GAP-001` … `ER-AUTO-GAP-008` | `er_automotive_gap_registry` | Chapter 8 gap table: domain, Earth baseline, C&W improvement direction, evidence state, engineering state |
| Transport safety cases (4 rows, vehicle `67bd3506-…`) | `transport_safety_case_registry` | Chapter 6 submersion material; collision intrusion; pre-crash side impact; validation states including the explicit "do not represent a force field" constraint |
| `AUTO-VISUAL-GATE-001` (LOCKED, Chairman approval required) | `transport_design_gate_registry` | Cover and imagery constraints; the prohibition on rendering before design brief and geometry gates are reviewed |
| `AUTO-NAME-001` (LOCKED) | `er_automotive_naming_corrections` | Chapter 0 naming note: CNW is a voice-transcription artifact; C&W is canonical; legacy identifiers preserved, not destructively renamed |

**Verification method:** each record was read directly from the live backend (`jvsdxhrfhtlgaknhjxlz`) during this session. Figures and states are reproduced as recorded, including every OPEN and UNVALIDATED state.

---

## 2. OUTLINE (as built)

0. What this notebook is, and the three labels · the naming note
1. Occupant package: the body comes first
2. Body architecture, rollover and the closed ring
3. Mass, centre of gravity and the honest gap
4. Hydroplaning, crosswind and the loss-of-control tree
5. The FMEA: six items, all open
6. Submersion, and where the notebook refuses
7. Repairability as a safety property
8. The eight open gaps
9. The nine blockers
10. How to use this method on your own work

Closing · Provenance · Rights · Statement

---

## 3. AUTHOR AND PROVENANCE

**Author of record:** ErsatzReality / THYLORA, Automotive Engineering Desk (WR-AUTOMOTIVE)
**Chairman:** VYC / Vyctor Peete
**Compiled by:** THYLORA execution session, 2026-09-17, from the backend records listed above
**Editorial rule applied:** DOCUMENTED / HYPOTHESIS / UNKNOWN are never merged. Where the record says open, the artifact says open.

---

## 4. RIGHTS CLASSIFICATION

| Element | Classification |
|---|---|
| Text | **ORIGINAL_THYLORA.** Written for this product from backend records. |
| Engineering content | **ORIGINAL_THYLORA.** C&W programme work. |
| Earth manufacturer designs, identity, trade dress | **NOT_USED.** Earth vehicles appear only as generalised baseline context in the gap register and are never named. |
| Photography | **NOT_USED.** None. |
| Third-party diagrams | **NOT_USED.** None. |
| Licensed standards text | **NOT_USED.** No standards text is quoted. Regulatory concepts are referred to generically. |
| Cover artwork | **ORIGINAL_THYLORA.** Engineering-sheet geometry only — see §6. |

**Clearance:** no third-party rights are engaged. No likeness. No logo. No licensed material.

---

## 5. DIGITAL PRODUCT PASSPORT (DPP)

| Field | Value |
|---|---|
| Product code | CW-ENG-NOTEBOOK-VOL1 |
| Edition | First edition, 2026 |
| Format | PDF, digital download |
| Publisher | ErsatzReality / THYLORA |
| Origin | WR-AUTOMOTIVE, ER PRODUCTS — AUTOMOTIVE |
| Source records | ER-AUTO-BS-009; ER-AUTO-GAP-001…008; transport safety case register; AUTO-VISUAL-GATE-001; AUTO-NAME-001 |
| Content class | Design, simulation and research documentation |
| Certification claims | **NONE.** Explicitly not a certified production vehicle. No road homologation claim. |
| Physical claims | **NONE.** No crash test, no measured dimension, no prototype, no validated control. |
| Rights | Original THYLORA work; no third-party rights engaged |
| Delivery | THYLORA library, entitlement-gated secure download |
| Re-access | Unlimited, non-expiring, no additional charge |
| Supersession | Volume 2 supersedes nothing; this edition remains the record of the programme's state at 2026-09-17 |

---

## 6. PRODUCT-SPECIFIC VISUAL BRIEF

**Gate:** `AUTO-VISUAL-GATE-001` is LOCKED and requires Chairman approval for transportation imagery. It prohibits rendering before design brief and geometry gates are reviewed, prohibits generic crest/crown/wings filler branding, and prohibits substituting unrequested vehicle forms.

**Therefore the cover contains no vehicle.**

Permitted cover language — engineering-sheet visual vocabulary only:

- Drawing-sheet border with title block (product code, edition, revision, sheet 1 of 1)
- Dimensional framework: extension lines and arrows enclosing an **unspecified** envelope, with dimension callouts rendered as `———` rather than numbers, because the numbers are open
- Occupant-envelope schematic: seated H-point geometry as abstract construction lines, no body rendering
- The dependency chain from Chapter 3 set as a systems map
- The three labels DOCUMENTED / HYPOTHESIS / UNKNOWN set as a legend block at equal weight
- Grid, centrelines, section marks

**Prohibited on the cover and throughout:**
- Any final or suggested body geometry — final body geometry is unresolved and sits at the bottom of an open dependency chain
- Any rendered, shaded or three-quarter vehicle view
- Earth manufacturer identity or trade dress
- Generic ErsatzReality crown/wings branding
- Any numeric dimension presented as settled

**Preflight gate:** if any cover element implies a resolved vehicle form or a settled number, it does not render.

---

## 7. PRICE RECOMMENDATION

**Recommended: $29.00 USD.**

Reasoning against the existing shelf:
- Build a World From One Idea (13-page workbook, general method) — $19
- Question Deck (27-page deck, general method) — $12
- Gap Hunt (9-page workbook) — $7

This notebook is longer, materially denser, and addresses a specialist professional audience (engineering, systems safety, design management, technical writing). It carries reproducible method — cut-set reasoning, plausibility-based detection, gated dependency chains — that transfers beyond vehicles.

$29 sits above the general-method shelf without pretending to be a technical standard or a certification document, which it explicitly is not. **It is a recommendation, not a decision: pricing is the Chairman's.**

---

## 8. READINESS RECORD

| Gate | State | Evidence |
|---|---|---|
| Source manifest | **COMPLETE** | §1; all five source records read live from backend this session |
| Outline | **COMPLETE** | §2 |
| Finished customer artifact | **COMPLETE (markdown master)** | `notebook.md`, 10 chapters + front and back matter |
| Author / provenance | **COMPLETE** | §3 |
| Rights classification | **COMPLETE — CLEAR** | §4; no third-party rights engaged |
| DPP | **COMPLETE** | §5 |
| Price recommendation | **COMPLETE — AWAITING CHAIRMAN** | §7 |
| Shopify product | **CREATED AS DRAFT** | See product-creation record in backend |
| Product-specific visual brief | **COMPLETE** | §6 |
| Cover asset | **NOT PRODUCED** | Requires Chairman approval under AUTO-VISUAL-GATE-001 |
| PDF render of artifact | **NOT PRODUCED** | Markdown master is complete; PDF generation not run in this session |
| Delivery asset | **BLOCKED ON PDF** | Cannot register a delivery asset without rendered bytes |
| EDF | **CHAIRMAN-CREDENTIALED** | `thylora_edf_create_v1` gates on `thylora_is_chairman()`; this session has `auth.uid()=null` |
| Download delivery route | **AVAILABLE ONCE ASSET EXISTS** | The library download control repaired this session (THY-STORE-DELIVERY-REPAIR-001) serves any product with an ACTIVE delivery asset, with or without an EDF |
| Release | **HELD** | Product remains DRAFT. Release is a Chairman decision. |

**Irreducible blockers:** cover asset (Chairman visual approval), PDF render, EDF creation (Chairman credential). Everything else is complete.
