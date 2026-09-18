# DESIGN LOGIC — HERB FILE shelf

Governed by `THY-VISUAL-OUTPUT-IDENTITY-001` (LOCKED), `THY-INTERWORLD-OLDFILM-BARRIER-001`
(LOCKED) and `THY-VISUAL-PREFLIGHT-LOCK-001` (LOCKED). The design system of record is
`products/redesign/design.py` on branch `claude/thylora-backend-continuity-djn6ih`.

**No plate has been generated.** This file contains the written briefs that
`THY-VISUAL-PREFLIGHT-LOCK-001` requires *before* any render is permitted.

---

## 1. WHAT THIS SHELF INHERITS UNCHANGED

Palette (`INK #1A1714`, `CHARCOAL #2E2823`, `UMBER #6B4F32`, `SEPIA #8A6A45`, `CREAM #F2EADA`,
`PAPER #EAE0CB`, `RULE #C2B69B`, `MUTED #7A6E5C`), the laid-paper substrate with fibre tint
and plate tone, the running rail with typographic wordmark, the mono provenance footer, the
folio treatment, and the Edition v2 page architecture — designed cover, identity/serial page,
body pages, wordmark and provenance footer on every page.

Type is PROPOSED — NOT CANON, because `BRAND-FONT-FAMILY` is UNKNOWN: Charter serif for
reading, Liberation Sans for structure, Courier for evidence marks.

## 2. WHAT IS NEW FOR THIS SHELF — and why

### 2.1 The shelf accent — `#5F7168` withy grey-green — PROPOSED
Every product in the approved set carries exactly one low-saturation accent. The warm greens
are taken (`#4E6B4A` pitch green, `#5E7A4A` deck VALUE). `#5F7168` is a cool grey-green: it
reads as botanical, sits correctly against umber and cream, holds up in greyscale, and is
unmistakably not one of the existing six.

### 2.2 The four register bands — the shelf's whole visual signature
The registers are not typographic labels. They are **ruled bands** with both a colour and a
tick-pattern, exactly as the Question Deck encodes its five classes — so they survive
greyscale, photocopying and a phone screenshot.

| Register | Colour | Ticks | Rule weight |
| --- | --- | --- | --- |
| DOCUMENTED | `#3E6B8A` | 1 | solid, heaviest |
| TRADITION | `#8A6A45` | 2 | dashed |
| MODERN SCIENCE | `#5F7168` | 3 | solid, light |
| UNKNOWN | `#7A6E5C` | 4 | dotted |

**The rule weight carries the epistemic weight.** Documented is solid and heavy; unknown is
dotted and light. A reader who never reads the key still absorbs the hierarchy. This is the
single design decision that makes the shelf's content rule visible rather than stated.

A THYLORA PRODUCT INTERPRETATION passage never gets a band. It is set in italic umber inside
a hairline box marked `THYLORA READS IT THIS WAY`, so canon can never be mistaken for
evidence — which is the content rule expressed as geometry.

### 2.3 `TRIM["field_card"]` = 88.9 × 127 mm (3.5 × 5 in) — PROPOSED
A new trim for the collectible card. Story (6×9) and letter (8.5×11) already exist; the card
is a third object with a different job — it is handled, pinned and kept, not read through.

## 3. THE THREE OBJECTS

**The card** (`field_card`) — one plate, the four registers at one line each, the open
question on the reverse. Recto is the object; verso is the method. It is the free post's
physical logic and the series' collectible unit.

**The field-note page** (letter) — the working surface. Two-column asymmetric: a wide reading
column and a narrow outer margin carrying the register bands and dates aligned to the lines
they govern. The margin is not decoration — it is the index to the claims.

**The poster** — one plate at full scale with the mechanism diagram as a quiet secondary. Its
job is the shelf's identity at a distance: a reader across a room should read *botanical
record office*, not *wellness brand*.

## 4. WHAT IS PROHIBITED HERE

No plain-white generic PDF interior. No stock botanical clip art, no watercolour wellness
look, no photograph, no sampled reference. No glow, sparkle, portal, smoke or neon. No QR
(`BRAND-QR-DESTINATIONS` NOT_APPROVED). No invented graphic logo (`BRAND-THYLORA-MARK`
UNKNOWN) — typographic wordmark only. **No leaf-and-mortar-and-pestle apothecary iconography:
it reads as a health claim before a single word is read, and this shelf makes no health claim.**

## 5. THE BARRIER RULE FOR THIS SHELF

Willow is a real Earth plant. **Earth-side botanical plates and instructional diagrams carry
no interworld barrier.** The barrier applies only if a plate shows the EdereAriah side through
the viewer plane. Under `THY-INTERWORLD-OLDFILM-BARRIER-001` the barrier marks the world
boundary; applying it to an Earth specimen plate would destroy its meaning. For File 001 as
specified, **no plate takes the barrier.**

## 6. PLATE BRIEFS — required by `THY-VISUAL-PREFLIGHT-LOCK-001`

Written before generation. Nothing generated. Each requires registration in
`thylora_visual_assets` at `approval_state=proposed`, `rights_state=cleared`,
`provenance_state=documented`, with a matching `thylora_visual_provenance` row carrying the
component sha256 — the procedure used for the 45 Edition v2 components.

### Plate 1 — *Salix* specimen (cover, card, poster)
Subject: one willow bough, drawn as a 19th-century botanical record plate. Composition: bough
entering from upper left, descending right; six to nine lanceolate leaves with visible
mid-rib and fine serration; two catkins lower right; a bark-section detail at lower left at
roughly twice scale showing the diamond fissure pattern of mature *Salix alba*. Technique:
charcoal and umber line with cross-hatched shadow, no fill washes, laid-paper substrate
showing through. Accent `#5F7168` used **once**, on the catkins only. Labels in Courier at
plate scale: `SALIX`, `BARK — SECTION`, `CATKIN`. Barrier: none. Prohibited: photographic
render, watercolour, colour saturation beyond the single accent, apothecary props.

### Plate 2 — bark to molecule (page 10)
Subject: the chemistry line as a drawn diagram, not a stock chemical schematic. Four stations
left to right — bark section, salicin, salicylic acid, acetylsalicylic acid — joined by a
single ruled line with the date and the name under each station in Courier. Structures drawn
in the same line weight as the botanical plate so the page reads as one hand. Accent used
once, on the final station, marking where the plant stops and the manufactured drug begins —
which is the page's entire argument. Barrier: none.

### Plate 3 — the 1763 page mark (page 7)
Subject: a small ruled evidence mark, not an illustration — a Courier-set block reproducing
the title of Stone's account with its date, set as an archival slip on the page. No portrait
of Stone: no approved likeness exists and none may be invented.

---

## 7. VIEWABLE APPROVAL ARTIFACT

Under carryforward #459 — *approval must be immediately viewable* — and
`THY-VISIBLE-PRODUCTION-SLA-001`, this design is rendered for review at
`preview/out/`. The preview is **layout, typography, palette, register bands and page
architecture only**: it deliberately contains **no generated plate**, because
`THY-VISUAL-PREFLIGHT-LOCK-001` forbids generation before the briefs above are approved. Plate
areas are shown as marked reserves stating which brief fills them.
