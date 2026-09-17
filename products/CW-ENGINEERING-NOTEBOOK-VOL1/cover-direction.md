# C&W Engineering Notebook Vol. 1 — COVER DIRECTION

**Status:** PREPARED — NOT GENERATED. Visual production stays gated.
**Gate:** `AUTO-VISUAL-GATE-001` (LOCKED, `chairman_approval_required = true`)
**Product:** `CW-ENG-NOTEBOOK-VOL1` · Shopify `7985315577933` (DRAFT, no featured media)

---

## The one thing this cover must say

**This is an engineering notebook about building the system. It is not a claim that the
vehicle is finished.**

Every decision below serves that sentence. A cover that shows a car — even a stylised,
partial or silhouetted car — says the opposite, and would be false, because final body
geometry is unresolved and sits at the bottom of an open dependency chain headed by
unresolved propulsion and mass.

## Hard prohibitions

Carried from `AUTO-VISUAL-GATE-001` and from the notebook's own argument:

- **No finished vehicle depiction.** No rendered, shaded, silhouetted or three-quarter view.
- **No suggested body geometry.** Not even an abstract "it might look like this" profile line.
- **No Earth manufacturer identity or trade dress.**
- **No generic ErsatzReality crown / wings / crest filler branding.**
- **No numeric dimension presented as settled.** Mass, CG, track, wheelbase are all open.
- **No photography.** No licensed standards text.

## Permitted visual vocabulary

Engineering-sheet and technical-notebook language only:

1. **Drawing-sheet frame with a real title block** — product code, edition, revision,
   sheet 1 of 1, and a state field reading `GATE 1 ARCHITECTURE — VALIDATION OPEN`.
   The title block is the cover's anchor: it tells the reader immediately that they are
   holding a working document, not a brochure.

2. **Dimensional framework with withheld values.** Extension lines and arrows enclosing an
   unspecified envelope, with every dimension callout rendered as `———` instead of a
   number. This is the single strongest image in the whole brief: a drawing that has done
   the work of asking the question and is visibly refusing to invent the answer.

3. **Occupant-envelope construction lines.** Seated H-point geometry as abstract
   construction geometry — no body rendering, no human figure illustration. It states the
   notebook's first principle (the body comes first) without depicting a person or a car.

4. **The dependency chain as a systems map.** Chapter 3's chain, set as a directed graph:
   propulsion → mass model → CG envelope → track/wheelbase → rollover threshold, suspension,
   brakes, tyre load → wheel validation → *final body geometry*. The terminal node is
   drawn as an open, unfilled box. That open box at the end of the chain is the cover's
   argument in one shape.

5. **Fault-tree fragment.** One top event with its branch structure and a minimum cut set
   shown as a pair. Communicates method, not conclusion.

6. **The three-label legend block** — DOCUMENTED / HYPOTHESIS / UNKNOWN — set at equal
   visual weight. UNKNOWN is not greyed, not smaller, not parenthetical. Equal weight is
   the house position and it belongs on the cover.

7. **Evidence callouts.** Leader lines pointing to sheet regions with short labels
   (`ARCHITECTURE DEFINED`, `NUMERIC LIMITS OPEN`, `CAE CORRELATION REQUIRED`).

## Composition

Portrait. Sheet frame occupies the full trim with a generous margin. Dimensional
framework upper two-thirds, dependency map lower third, legend block bottom-left in the
title block's rule line. Title set in the drafting typeface, not a display face — this is
a working document and should read as one.

## Palette

Ink on drafting stock. One accent reserved exclusively for open/unknown states, used on
the withheld dimension dashes, the terminal open box and the UNKNOWN legend entry, and
used nowhere else. The accent is therefore a reading key, not decoration: wherever the eye
catches it, something is unresolved.

## Preflight, before any render is accepted

1. Does any element depict or imply a finished vehicle form? → reject.
2. Does any numeric value appear that is not in the notebook's DOCUMENTED strip? → reject.
3. Is UNKNOWN rendered at parity with DOCUMENTED? → if not, reject.
4. Any likeness, logo, trade dress or traced broadcast/photographic source? → reject.
5. Does the accent colour appear on anything that is not an open/unknown state? → reject.

## Authority

Cover generation is **not** authorized by this document. `AUTO-VISUAL-GATE-001` requires
Chairman approval and prohibits rendering before the design brief and geometry gates are
reviewed. This file **is** that design brief, submitted for review.

On approval, the executable sequence needs no further authority: render the cover,
regenerate the notebook PDF with it, replace the bytes on
`THY-ASSET-CW-ENG-NOTEBOOK-VOL1-001`, verify sha256 against the local master, and flip
`release_state` from HELD to ACTIVE. Delivery is already live through the repaired
customer-library download control.
