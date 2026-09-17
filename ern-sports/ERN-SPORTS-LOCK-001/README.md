# ERN-SPORTS-LOCK-001 — Chairman Preview

**THY-RAVENS-PAPER-20260917-001 · Sep 17, 2026 · Morning Edition 001**

One Chairman preview. Not for publication.

## Files

| File | Purpose |
| --- | --- |
| `chairman-preview.html` | Deterministic source. 1130 x 1520 CSS px. |
| `chairman-preview.png` | Render. 2260 x 3040 px (2x). |
| `qr.svg` | Scannable QR encoding the Twelve Miles for Flour product URL. |

## Locked assets — rendered as received, not reinterpreted

- Headline, deck, central question, stat bar, three-branch block, Bateman
  block, path-to-win / path-to-failure, information classification,
  source & rights, and the bottom line are set verbatim.
- Necklace: the magnifier-with-fedora emblem is a single identity-locked
  object (SVG `#erMark`), reused at three scales — masthead, necklace
  pendant, footer strip. One definition, no variants.
- Bottom strip follows the supplied footer reference: Explore ErsatzReality
  + QR | Twelve Miles for Flour — An Uncle Seezin Trail Story | ErsatzReality
  A Higher View + ER-NEWS-001.
- Old-world artwork was used only for editorial-illustration language
  (rim light, dusk staging, painted-plate framing). Its brown palette and
  its subject matter are not carried over.

## Field diagram — exact counts

- Offense travels LEFT to RIGHT (+x).
- QB #8: three-quarter side view facing +x. Helmet in profile with the
  facemask on the +x side, throwing arm cocked back, lead arm extended
  downfield, striding toward +x.
- Exactly 3 receivers: WR 1 / WR 2 / WR 3.
- Exactly 3 route arrows, one per receiver.
- Exactly 1 passing window.
- Exactly 4 player figures on the field. No other marks or decorations.

## Reproduce

```
chromium --headless --hide-scrollbars \
  --run-all-compositor-stages-before-draw --virtual-time-budget=6000 \
  --force-device-scale-factor=2 --window-size=1130,1800 \
  --screenshot=tall.png file://$PWD/chairman-preview.html
# then crop tall.png to the top 3040 rows
```

Render at a viewport taller than the page and crop: headless Chromium
drops paint below roughly 1432 CSS px when the viewport ends exactly at
the page edge.
