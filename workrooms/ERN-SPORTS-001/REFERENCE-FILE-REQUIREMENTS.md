# REFERENCE-FILE REQUIREMENTS
## ERN-SPORTS-001-RENDER-PACKET-001 · binds ERN-SPORTS-LOCK-001
### Document THY-RAVENS-PAPER-20260917-001 · Sep 17, 2026

The visual workroom renders from the packet JSON. These files are the only
permitted visual inputs. Anything not listed here is not a reference.

---

## 1 · REQUIRED — supplied and checksummed

| Slot | File | Size | MD5 | Role |
|---|---|---|---|---|
| **REF-A** | `reference/REF-A__LOCKED-RENDER__THY-RAVENS-PAPER-20260917-001.png` | 1024 × 1536 | `8cb763f48bf0e08958f83f5c234a73c2` | **The locked render.** Single source of truth for Neyra Sol, the necklace, the tablet mark, the cup, field direction, player set, routes, the six-figure band, the footer and the format family. Every packet bbox was measured from this file. |
| **REF-B** | `reference/REF-B__SUPERSEDED-CHAIRMAN-PREVIEW__DO-NOT-RENDER.png` | 1122 × 1402 | `42a8f83b89a26d7c3962f3cdc4a7c657` | **SUPERSEDED. Carries the "CHAIRMAN PREVIEW — NOT FOR PUBLICATION" banner.** Held for audit only. Its anchor render, its 4:5 format, its cup-less desk and its panel order are all non-compliant. Do not sample it for anything. |
| **REF-C** | `reference/REF-C__UNCLASSIFIED__NOT-A-RENDER-INPUT.png` | 1536 × 1024 | `330666573c42bf5a340ab9148bc06021` | **UNCLASSIFIED.** Sepia four-panel illustration with no declared role in the lock. Not a render input until the Chairman assigns one. See open item OI-02. |

**Rule:** REF-A governs. Where REF-A and this packet ever disagree, the render
stops and the discrepancy goes back to the lock holder. The renderer does not
break a tie.

---

## 2 · REQUIRED — must be supplied before render

These are named in the packet as `asset.*` and are **not** in hand. The render
cannot be signed off without them.

| Asset key | What it is | Why it is blocking |
|---|---|---|
| `asset.roundel` | ErsatzReality roundel mark — magnifier-and-hat in a gold ring, on transparent ground | Appears five times: top rail (Z01), tablet screen, cup face, footer Explore cell, and as the pendant on the locked necklace. Re-drawing it per instance guarantees drift. Supply **one** vector master. |
| `asset.explore_url` | The exact destination string the footer QR encodes | AC-12 is a live two-device scan. A placeholder QR fails it. See OI-01. |
| `asset.stadium` | Dusk stadium plate used behind the hero (Z04) | Must contain no legible signage, no sponsor boards, no club marks. If regenerated rather than supplied, it re-enters exclusion review. |
| `asset.trail_plate` | "Twelve Miles for Flur" house-ad artwork for footer cell F02 | Footer content is locked; the ad cannot be substituted or omitted. |

---

## 3 · OPTIONAL — improves fidelity, not blocking

| Asset key | What it is |
|---|---|
| `asset.fonts` | The actual masthead / headline / body faces. The packet describes them by class only, because the lock document is not in hand (OI-03). Supply before the 2048 × 3072 print master. |
| `asset.neyra_sheet` | Any existing Neyra Sol character sheet — multiple angles, necklace detail, wardrobe. Reduces re-cast risk across future editions of this format family. |
| `asset.palette` | Signed-off hex values. The packet's palette was eyedropped from REF-A and is subject to AC-20 (delta-E 5, soft). |

---

## 4 · FORBIDDEN as reference

- Any photograph of a real player, coach, broadcaster or stadium interior.
- Any club, league or network asset — logo, shield, helmet mark, scorebug, lower third.
- Any sponsor or betting-brand asset.
- Any stock sports photography.
- REF-B, for any purpose other than audit.
- Any prior ERN-SPORTS render not listed in section 1.

---

## 5 · HANDOFF CHECKLIST — visual workroom

1. Load `ERN-SPORTS-001-RENDER-PACKET-001.json`.
2. Verify REF-A's MD5 against section 1 before sampling it.
3. Confirm all four section-2 assets are in hand. If any is missing, **stop** —
   do not substitute, do not approximate.
4. Render to 1024 × 1536, sRGB.
5. Run AC-01 through AC-20 in order. Any HARD failure is a re-render, not a retouch.
6. Return the render plus a filled acceptance table. Do not return a render
   without one.

---

## 6 · OPEN ITEMS CARRIED FROM THE PACKET

- **OI-01** — `asset.explore_url` not carried. Blocks AC-12.
- **OI-02** — REF-C has no declared role. Held unclassified.
- **OI-03** — Typefaces described by class, not named. Blocks the print master, not the primary.
- **OI-04** — `ERN-SPORTS-LOCK-001` (JSON + lock document) is not present in this
  repository. This packet was transcribed from REF-A and the Chairman's
  enumerated lock list, with provenance tagged per block. Commit the lock
  artifacts alongside this packet so future editions bind to the lock itself
  rather than to a transcription.
