# THY-STUCK-LOOP-RESET-001 · design specification

**State:** production copy complete (`content.mjs`), design specified here, artifact not yet built.
**Engine:** THYLORA Artifact Engine v1 — no new machinery required.

## Visual system

Identical to `THY-QYRIS-QUICKCHECK-001`, which is the point: the Standards Series
must read as one shelf.

- Ink field `#0a0e14`, panel `#111823`, hairline `#24303f`, text `#f4efe6`,
  muted `#8e9bad`, gold `#e0b35b`, deep gold `#6d4f18`.
- Work surfaces — worked example and the card — run on the ivory ground
  `#f4efe6` with ink `#0f1620`. The ivory page is the one you print.
- Serif heads (Times-Bold, standing in for Georgia), sans working face
  (Helvetica), gold small-caps labels tracked at 1.8–2.2.
- Series mark: the nine-square grid, **one square lit**. For series 02 the lit
  square moves to position 6 (centre-right) — the same mark, advanced one step,
  so the three products are distinguishable at thumbnail size and obviously
  related at shelf size.

## Page map — 12 pages, print edition (612 × 792 pt)

| # | Page | Content source | Layout component |
|---|---|---|---|
| 1 | Cover | `COVER` | `coverPage()` — series 02, contents in two columns |
| 2 | Plate 00 · Five tells | `PLATE_00` | `ruleBlock()` ×5 + `panelList()` ×2 |
| 3 | Plate 01 · The reset in six moves | `MOVES[0..1]` | two-column `inspectionBlock()` + pair band |
| 4 | Plate 02 · Moves 3–4 | `MOVES[2..3]` | as above |
| 5 | Plate 03 · Moves 5–6 | `MOVES[4..5]` | as above |
| 6 | Plate 04 · The one-thing rule | `PLATE_04` | readiness-style example band + `ruleBlock()` + round card `panelList()` |
| 7 | Plate 05 · The stop line | `PLATE_05` | `ruleBlock()` + "four honest exits" `panelList()` |
| 8 | Plate 06 · Person, system, or you | `PLATE_06` + `LOOP_TYPES` | four-item stack left, six loop types as a two-column table right |
| 9 | Plate 07 · Re-entry and five failures | `PLATE_07` | numbered stack + room `panelList()` |
| 10 | Worked example (ivory) | `WORKED` | six-row table, `chipLight()` for DONE/FOUND/SET, readiness band, two-column close |
| 11 | The Reset Card (ivory, fillable) | `SHEET` | 4 header fields, 6 rows × 3 fields, 2 footer fields = **24 AcroForm fields** |
| 12 | Colophon | `PRODUCT` | serial block, credits, provenance, rights, re-access, limits |

Six moves rather than nine inspections means one fewer plate of pairs; plate 08
in the QuickCheck map is replaced by the loop-type table on plate 06, which is
the copy that most needs width.

## Mobile edition (360 × 640 pt, portrait)

Same content, reflowed: cover, plate 00, one move per screen (6), loop types over
two screens, one-thing rule, stop line, person/system/you, re-entry, room,
worked example over two screens, card over two screens, colophon — **21 screens**.
Body 9.8 pt, question 10.4 pt, as tuned for the QuickCheck phone edition.

## Delivery

Reuses the same path with no change: `buildRelease(serial)` → print PDF, mobile
PDF, `READ-ME-FIRST.txt`, `LICENCE-AND-RIGHTS.txt`, `RE-ACCESS.txt`,
`manifest.json`, zipped deterministically. Registration via
`db/store/0002_digital_delivery_stuck_loop_reset.sql`, written from the same
template as `0001`, **not applied**.

## Proposed price

$24.00 USD one-off, permanent re-access. Below QuickCheck because it is a single
protocol rather than a nine-inspection instrument, and because the two are
designed to be bought together.

## Open before build

1. Confirm the price and the customer-facing title.
2. Confirm the lit-square position convention for series numbering.
3. One layout pass and one proof read, then the artifact is bytes.
