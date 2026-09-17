# THYLORA / ErsatzReality merchandise — product family structure

Workroom: `WR-MERCH-001`. Backend of record: `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`).
Schema: `db/merch/`, reviewable and **not applied**.

Every state below was read from the backend on 2026-09-17. Nothing here is
manufactured or on sale.

---

## Three families

A SKU belongs to exactly one family. No SKU carries both a phrase and a scene.

| Family | Short | Composition | State |
|---|---|---|---|
| `LOGO_ONLY` | `L` | Exactly one approved mark or masthead, alone. No phrase, no scene, no secondary lockup, no added tagline. A second approved treatment may appear on a *different surface*, never combined into one lockup. | **OPEN** |
| `LOGO_PHRASE` | `LP` | One approved mark plus exactly one approved phrase. The phrase never overlaps the mark and never becomes part of it. | HELD — no approved phrase |
| `LOGO_SCENE` | `LS` | One approved mark plus one approved scene crop from a registered master with a recorded SHA-256. The mark is never placed over a face or over story action. | HELD — no approved scene |

`LOGO_ONLY` is open because every input it needs is an already-approved mark
treatment. The other two are held by their *inputs*, not by their classes: the mug
in `ERM-MUG-LP-ERGLASSHAT-R001` is ready; its phrase is not.

### Why no phrase is approved

`merch_phrase_registry` holds four candidates, each traced to a string that already
exists in the backend. None was composed for merchandise, because
`BRAND-EDITORIAL-TONE` prohibits generic or inspirational copy and inventing a
slogan here would be exactly that.

| Code | Text | Origin |
|---|---|---|
| `PHR-001` | DON'T LOSE THE QUESTION | `THY-LOGIC-POST-20260916-C` caption |
| `PHR-002` | ONE STORE PATH. WHAT DOES IT PROVE? | `THY-LOGIC-POST-20260916-A` caption |
| `PHR-003` | THE MISSING PAGES ARE PART OF THE STORY | `THY-LOGIC-POST-20260916-B` caption |
| `PHR-004` | WOULD YOU WALK TWELVE MILES FOR FLOUR? | `THY-LOGIC-POST-20260916-A` title |

### Why no scene is approved

| Code | Master | Blocked by |
|---|---|---|
| `SCN-SPORTS001` | `ER_NEWS_MORNING_001_RAVENS_PUBLISH_MASTER.png` | Master is `POSTPUBLICATION_REJECTED_REPLACEMENT_REQUIRED`, **and** the scene contains the presenter with no merchandise likeness decision |
| `SCN-TWELVEMILES-V3` | `THY-VIS-TWELVE-MILES-WESTERN-ILLUSTRATION-V3` | Recorded `image_reserved_for` the Twelve Miles product and storefront shelf; extending it to merchandise is a scope change on a reserved asset |

---

## Eleven product classes

| Class | Goods kind | Programme row | Tooling | Mark redraw | Serial carrier |
|---|---|---|---|---|---|
| `MUG` | vessel | `MERCH-MUG-001` | no | no | base print |
| `CUP` | vessel | `MERCH-CUP-001` | no | no | base etch or print |
| `STK` | adhesive | — | no | no | backing print |
| `PCH` | appliqué | — | **yes** | **yes** | back twill tag |
| `SHIRT` | apparel | `MERCH-SHIRT-001` | no | no | inner neck print |
| `SWEAT` | apparel | — | no | no | inner neck print |
| `SOCK` | knit | — | **yes** | **yes** | cuff knit or pack tag |
| `TABDEC` | adhesive | — | no | no | backing print |
| `LOCDEC` | adhesive | — | yes (scale) | no | backing print |
| `NECK` | jewellery | `JEWEL-WATCH-HOUSE-001` | **yes** | **yes** | clasp or reverse stamp |
| `ORAH` | jewellery | `ORAH-BRACELET-001` | **yes** | **yes** | band reverse stamp |

`MERCH-HAT-001` exists in `merchandise_program` and was not requested in this lane.
It is left untouched.

**Mark redraw is the hinge.** Embroidery, knit and casting cannot reproduce the
glass-and-hat mark as drawn. Simplifying it is a *mark change* and needs its own
Chairman approval — `no_silent_change` applies. That is why the patch and the socks
sit behind the decals and the mug, despite looking like simple goods.

---

## Thirteen candidate SKUs

| # | SKU | Family | Speed | First real blocker |
|---|---|---|---|---|
| 1 | `ERM-TABDEC-L-ERREARTABLET-R001` | L | FIRST_WAVE | master replacement question, then supplier |
| 2 | `ERM-STK-L-ERGLASSHAT-R001` | L | FIRST_WAVE | supplier |
| 3 | `ERM-LOCDEC-L-ERREARTABLET-R001` | L | FIRST_WAVE | scale re-proof, rides on #1 |
| 4 | `ERM-MUG-L-ERGLASSHAT-R001` | L | FIRST_WAVE | physical proof for handle clearance |
| 5 | `ERM-CUP-L-ERGLASSHAT-R001` | L | FIRST_WAVE | vessel body unspecified |
| 6 | `ERM-SHIRT-L-ERGLASSHAT-R001` | L | SECOND_WAVE | inner-neck label needs the font family |
| 7 | `ERM-SWEAT-L-ERGLASSHAT-R001` | L | SECOND_WAVE | print or embroidery route undecided |
| 8 | `ERM-PCH-L-ERGLASSHAT-R001` | L | HELD | mark simplification is a mark change |
| 9 | `ERM-SOCK-L-ERGLASSHAT-R001` | L | HELD | same question as #8 |
| 10 | `ERM-MUG-LP-ERGLASSHAT-R001` | LP | HELD | no approved phrase |
| 11 | `ERM-CUP-LS-SPORTS001-R001` | LS | HELD | rejected master **and** undecided likeness |
| 12 | `ERM-NECK-L-NEYRANECK-R001` | L | HELD | prop is not a manufacturable design |
| 13 | `ERM-ORAH-L-ORAHBAND-R001` | L | HELD | visual lock not closed |

"Speed" means fewest open approvals and least new artwork work. It is **not** a
delivery estimate: no supplier is selected and no lead time is known.

### Why the rear-tablet decal is first

The rear-tablet mark is already an approved flat mark applied to a hard rear shell.
A decal is the same job on a different shell. One surface, no tooling, no likeness,
no phrase, no scene, no QR. Nothing has to be designed — only extracted at the
master's own proportions.

The sticker ranks second on a single distinction: the glass-and-hat mark is approved
as a *standalone* mark in `BRAND-ER-MARK-GLASS-HAT`, so it carries no
master-replacement question, whereas the rear-tablet treatment was approved *inside*
the master. Both are first wave; if the master question stays open, the sticker moves
to rank 1.

### Why the necklace and the ORAH bracelet are last

Both are approved as rendered props, which is not the same as an approved
manufacturable design. Neither has geometry, gauge, clasp, setting or an
Earth-manufacturable material. `Vycara` and `Edereaireum` have unverified Earth
composition, so no material claim may be printed. The first real work on either is a
jewellery realization brief under `JEWEL-WATCH-HOUSE-001` — not a printing job.

ORAH carries a further question that is not about manufacturing at all: it is a
personnel recognition instrument. Whether a *saleable* ORAH should exist, or whether
it is only ever issued to recognised personnel, is a decision before it is a product.
