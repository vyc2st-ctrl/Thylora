# THYLORA customer artifact redesign — Edition v2

Built under Chairman directive `THY-Q-20260917-SIX-PRODUCTS-APPROVED-REDESIGN-455`:
the six approved products keep their content, meaning, price, rights, delivery, product IDs
and Shopify handles; the plain-white generic PDF interiors are replaced with world-specific
THYLORA / ErsatzReality editions.

**Nothing here is activated, published or scheduled.** These are Chairman preview editions.

## Backend canon this build obeys

| Record | State | Effect on this build |
| --- | --- | --- |
| `THY-VISUAL-OUTPUT-IDENTITY-001` | LOCKED | stock/template default prohibited; evidence dominates |
| `THY-INTERWORLD-OLDFILM-BARRIER-001` | LOCKED | sepia/charcoal/umber/cream, faint variable film, no portals or neon |
| `THY-VISUAL-PREFLIGHT-LOCK-001` | LOCKED | explicit brief before any render (see briefs in `scenes.py`) |
| `BRAND-THYLORA-MARK` | **UNKNOWN / NOT_APPROVED** | no logo invented — typographic wordmark only |
| `BRAND-FONT-FAMILY` | **UNKNOWN** | families used are PROPOSED — NOT CANON |
| `BRAND-QR-DESTINATIONS` | **NOT_APPROVED** | no QR printed in any edition |
| `BRAND-EDITORIAL-TONE` | CHAIRMAN_APPROVED | technical, evidence-led, question-driven |

## Files

| File | Purpose |
| --- | --- |
| `design.py` | palette, type scale, page CSS, world-view barrier (T/R/D), paper substrate |
| `scenes.py` | every world scene and diagram, each with its written brief; asset hash log |
| `editions.py` | page shells: cover, identity/serial page, story page, discussion page |
| `books.py` | the four story editions (content locked to v1) |
| `books2.py` | workbook and question deck (content locked to v1) |
| `build.py` | renders to PDF via Chromium, hashes, page maps, mobile previews |
| `gate.py` | Chairman page gate `Pq = C·W·H·L·E` and `V = (Ir+Dr+Tr+Sr)/Nc` |
| `overflow.py` | clipping check in a real browser — required by the visual identity gate |
| `out/` | the six preview PDFs plus manifest, gate report and clipping report |

## Reproduce

```bash
pip install reportlab pypdf Pillow playwright
python3 build.py      # renders out/*.v2.pdf + manifest.json
python3 overflow.py   # must report: total clipped pages: 0
python3 gate.py       # must report: gate=PASS for all six
```

## The world-view barrier

Pages that show EdereAriah through the viewer plane implement

```
I_seen(x,y,t) = T(x,y,t)·I_world + R(x,y,t)·I_viewer + D(x,y,t)
```

- **T** transmission — an uneven field, mostly open, thickening irregularly toward the edges
- **R** reflection — a low-angle viewer-side sheen across the plane the reader sits on
- **D** distortion — gate weave, emulsion grain, specks and scratches

Earth-side and purely instructional diagrams carry **no** barrier: the barrier marks the
world boundary, so applying it everywhere would make it meaningless.

## One declared presentation change

v1 of the Question Deck reprinted the identical `Look for: … / Do: …` instruction under all
fifty cards. Under `V = (Ir+Dr+Tr+Sr)/Nc` that repetition is pure `Nc`. The exact wording is
preserved once, on the *How to use it* page, and encoded per card by the class band and the
ruled answer field. **No question text was altered.**
