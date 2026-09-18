# HERB FILE 001 — WHITE WILLOW · Chairman preview candidate

**Asset ID** `THY-ART-HERB-FILE-001-WHITE-WILLOW-65e14c5c`
**File** `THY-HERB-001-WHITE-WILLOW`
**Version** `v1` · candidate · **NOT PUBLISHED, NOT SCHEDULED**
**Backend of record** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
**Branch** `claude/herb-file-001-preview-5mt1nu`

---

## 1 · What this is

A public-facing social still in the collectible **field-file** form: one specimen,
one plate, one question, four evidence bands. It is a history / evidence artifact,
not a treatment claim and not a product.

Format 1080 × 1350 (4:5). Two renders ship: `@2x` (2160 × 2700) for master, `1x`
for reference.

## 2 · Version / hash binding

| Artifact | SHA-256 |
|---|---|
| `herb-file-001-white-willow.html` (source) | `c6d8d73f13c1c9bbb6061073f5b732a3bfb338bbbb3ecedafe996fe0f7f346af` |
| `herb-file-001-white-willow.png` (1080×1350) | `65e14c5ceacccea0f7014db8460bd2d306b86808e9392cd8415859fa21b06777` |
| `herb-file-001-white-willow@2x.png` (2160×2700) | `b12d45e68e7ee7aa24856c6e8e196545f2361f34782d66a3090f9beacc5cb092` |

The generator is seeded (`SEED = 20260918001`, wear stream `991733`). Re-running
`./render.sh` reproduces the same bytes and therefore the same hashes; verified by
a second independent run. **If a hash moves, the image moved — the binding is real.**

## 3 · Gates applied

### `THY-INTERWORLD-BARRIER-GLOBAL-001` — LOCKED
Implemented literally as `B = g1·F + g2·S + g3·E + g4·D`, applied on a fixed
viewer plane over the world plane, with the required weight ordering `g1 > g2 > g3 > g4`:

| term | component | implementation | weight |
|---|---|---|---|
| `g1 F` | material / film texture | static seeded `feTurbulence`, desaturated, overlay | 0.120 |
| `g2 S` | scratches, gate wear | 7 fixed vertical hairlines, 14 fixed edge nicks, registration ticks | 0.035–0.085 |
| `g3 E` | fixed edge / frame behaviour | four linear edge falloffs + fixed inner frame | 0.050 |
| `g4 D` | slight density variation | two wide linear gradients, no cloud form | 0.035 |

- `dB/dt = 0` — the barrier is geometry-fixed to the viewer plane, not to the scene.
- `swirl_term = 0`, `smoke_like_term = 0` — every barrier term is linear or
  point-noise. There is no vortex, no drift field, no rainbow channel separation,
  no ring, no portal, no lens flare.
- Composite relative visual weight ≈ **0.22**, inside the required 0.18–0.28.
- Priority `SUBJECT > WORLD > DEPTH > BARRIER` holds: the willow and the text carry
  the image; the barrier is felt, not looked at.

### `THY-APPROVAL-MUST-BE-VIEWABLE-001` — LOCKED
The rendered still is delivered in the same response as the approval request, bound
to the exact version and hashes above, in the required order
`WHAT_IT_IS → VIEW_IT → WHAT_APPROVAL_DOES → APPROVE / REVISE / HOLD`.

### `THY-VISUAL-PREFLIGHT-LOCK-001` — LOCKED
Backend canon read before authoring. No person likeness, no identity lock engaged,
no engineered object, no invented canon. Subject is an Earth botanical species.

### `THY-VISUAL-OUTPUT-IDENTITY-001` — LOCKED
No stock default; every mark is authored vector. Evidence dominates; the imagery
carries place, water, weather and specimen identity without competing with the text.
Earth/world truth boundary is marked on the face of the file
(`RECORD CLASS — EARTH · DOCUMENTARY`).

## 4 · Visual construction

- **Left cell** — specimen in situ: tapered fissured trunk with root flare into a
  riverbank, four boughs, eighteen drooping shoots, ~450 lanceolate leaves with
  roughly a third turned to show the silvery underside, three catkins, bank grasses,
  and a calm horizontally-hatched water band with a broken trunk reflection.
- **Right cell** — `DETAIL A · BARK ×4` (interlacing ridges, cross-cracks, lichen
  flecks, 20 mm scale bar) and `DETAIL B · LEAF` (upper face, under face, catkin).
- **Identity** — restrained. Wordmark once in the header, series mark once, serial
  block and a twelve-slot series index with 001 filled and the run ahead left open.
- **Palette** — archival dark: ink ground, bone text, sage/teal labels, single gold
  accent reserved for series identity, the question line, and the UNKNOWN band.

## 5 · Rights

Fully original authored vector. No stock, no photography, no third-party artwork,
no persons, no external assets or webfonts. Subject `Salix alba` is a wild species.

## 6 · Render

```bash
./render.sh [output-dir]      # needs only python3 + chromium
```

`pngcrop.py` is a stdlib-only PNG cropper; it exists because headless Chromium here
paints 80 CSS px short of the requested window height, so the still is rendered into
an over-tall viewport and the exact frame is cut out. No image library required.
