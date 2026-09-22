# THY-BEFORE-YOU-BUY-001 · design specification

**State:** production copy complete (`content.mjs`), design specified here, artifact not yet built.
**Engine:** THYLORA Artifact Engine v1 — no new machinery required.

## Visual system

Standards Series house style, shared with `THY-QYRIS-QC-001` and `THY-SLR-002`.

- Ink field `#0a0e14`, panel `#111823`, hairline `#24303f`, text `#f4efe6`,
  muted `#8e9bad`, gold `#e0b35b`, deep gold `#6d4f18`; ivory work surfaces
  `#f4efe6` on ink `#0f1620`.
- Series mark: nine-square grid with the lit square at position 8 for series 03.
- One deviation, deliberate: the decision line (BUY / HOLD / WALK) uses the
  same three-tone chip as the QuickCheck disposition — green, amber, red
  outlines on both grounds — because a buyer scanning the sheet in a showroom
  needs the answer readable at arm's length.

## Page map — 12 pages, print edition (612 × 792 pt)

| # | Page | Content source | Layout component |
|---|---|---|---|
| 1 | Cover | `COVER` | `coverPage()` — series 03 |
| 2 | Plate 00 · How to run it | `PLATE_00` | `ruleBlock()` ×4 + `panelList()` ×2 |
| 3 | Plate 01 · Job · Real cost | `QUESTIONS[0..1]` | two-column `inspectionBlock()` + pair band |
| 4 | Plate 02 · Exit · Proved or asserted | `QUESTIONS[2..3]` | as above |
| 5 | Plate 03 · What you own · When it fails | `QUESTIONS[4..5]` | as above |
| 6 | Plate 04 · The walk-away | `QUESTIONS[6]` | single wide block + the three-limits panel |
| 7 | Plate 05 · The decision line | `DISPOSITION` | chip stack + note band |
| 8 | Plate 06 · Exit cost worked in full | derived from `QUESTIONS[2]` | a costed exit example laid out as a small table — the plate the product is bought for |
| 9 | Plate 07 · Five ways buyers fool themselves | `PLATE_07` | numbered stack + room `panelList()` |
| 10 | Worked example (ivory) | `WORKED` | seven-row table, `chipLight()` for CLEAR/COSTED/RED/A/THIN/WEAK/CROSSED, decision band, two-column close |
| 11 | The Decision Sheet (ivory, fillable) | `SHEET` | 4 header fields, 7 rows × 3 fields, 2 footer fields = **27 AcroForm fields** |
| 12 | Colophon | `PRODUCT` | serial block, credits, provenance, rights, re-access, limits |

Plate 06 is the one genuinely new component in the series: an exit-cost table
with a subtotal rule. It reuses the worked-example table renderer with a
right-aligned numeric column.

## Mobile edition (360 × 640 pt, portrait)

Cover, plate 00 ×2, one question per screen (7), decision line, exit-cost table
over two screens, five failures, room, worked example over two screens, sheet
over three screens, colophon — **21 screens**. This edition matters more than
for the other two: the pass is run standing up, in a showroom or a pitch, on a
phone. Chips and the decision line are sized for arm's length.

## Delivery

Unchanged path: `buildRelease(serial)` → two PDFs, three text files, manifest,
deterministic zip. Registration via
`db/store/0003_digital_delivery_before_you_buy.sql` from the `0001` template,
**not applied**.

## Proposed price

$24.00 USD one-off, permanent re-access. Same tier as Stuck Loop Reset.
A three-item Standards Series bundle at $59.00 is the obvious next SKU and is
**not** proposed here — it needs a bundle entitlement decision first.

## Open before build

1. Confirm price, customer-facing title, and whether the bundle is wanted.
2. Confirm the worked example may cite a real category (scheduling software)
   with no vendor named — as written, no vendor is identifiable.
3. One layout pass, one proof read, and the exit-cost table component.
