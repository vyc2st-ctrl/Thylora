# THY-SHIRT-FIRST-001 — First Shirt Provenance Sheet

**Work:** THY-WORK-QUESTIONMARK-SHIRT-594 (art direction), THY-WORK-POD-FIRST-SHIRT-587 (first physical sample)
**State:** `AWAITING_CHAIRMAN_APPROVAL` · **order_placed: false** · **product created: no** · **backend written: no**
**Prepared:** 2026-09-24 by Claude Code (THYLORA session, branch `claude/thylora-head-spine-forward-4nf7hh`), read-only everywhere
**Target:** Chairman wears it by 2026-10-03 (from carryforward seq 587, registry 587)

---

## 1 · Files

| File | What it is | Prints? |
|---|---|---|
| `front.svg` | Front print master, 12 × 16 in, viewBox 3600 × 4800 (300 dpi), transparent, one ink `#ECE4D2` | yes |
| `front-print-3600x4800.png` | Raster of `front.svg` at 3600 × 4800 px, transparent. **This is the upload file for Printful** | yes |
| `back.svg` / `back-print-3600x4800.png` | Back print (upper back), same format | optional |
| `sleeve-or-hem.svg` | 3 × 3 in inner-neck serial carrier (optional; MERCH-SERIAL-001 names inner neck print as the SHIRT class serial carrier) | optional |
| `mockup-2XL.svg/.png`, `mockup-3XL.svg/.png` | Flat front + back mockups drawn to the Bella+Canvas 3001 chest/length for each size, print at true 12 × 16 in scale | no |
| `front-preview.png` | Front on a dark field with the non-printing guide layer shown | no |
| `first-shirt-package.json` | Structured manifest of everything in this sheet | no |
| `build/gen.js`, `build/render.js` | Deterministic generator + Playwright/Chromium renderer used to make every file above | no |

Print files carry the THYLORA-mark slot as a **hidden** guide group (`GUIDE-NONPRINT-THYLORA-MARK-SLOT`, `display="none"`); it is visible in red only in the preview and mockups.

## 2 · Design concept

The question mark is the whole front: a 13.8 in tall mark built as masonry — the hook is an arch of voussoirs set out with a compass from one centre point, the stem is coursed ashlar. The dot is a round world-window aperture looking into the EdereAirah Royal Kitchen's hearth wall: the high window band with **one pane older than its neighbours**, the live hearth with the crane swung half out and one pot hung, the banked second hearth, and a smoke column that bends because the east door is open. Around it, working marks — a setting-out circle, crosshair, radius, centre axis and a 0–14 in measuring rule — show the question being worked out, not decorated.

## 3 · Element provenance and approval state

| # | Element | Source (exactly what it is derived from) | Approval state |
|---|---|---|---|
| E1 | **Question mark** (primary) | Constructed vector geometry in `build/gen.js`: arc centre (1800,1450), radius 1000, stone depth 440 px; hook 165°→30°; cubic into stem; 18 radial joints + 4 curve joints + 3 ashlar courses knocked out by mask. No font glyph, no traced image | PROPOSED — Chairman |
| E2 | Masonry language of the mark (voussoir arch, ashlar courses, "SET OUT FROM THE VAULT") | Royal Kitchen barrel vault `EA-RK-STRUCT-VAULT` and limewashed ashlar walls `EA-RK-STRUCT-WALL` ("Castle masons' lodge, original build"), WR-WORLD-WINDOW-583 §10, branch `origin/claude/thylora-world-window-vefjrp` | PROPOSED — source scene is itself awaiting Chairman decision (a) at seq 589 |
| E3 | **World fragment in the aperture** (secondary) | WR-WORLD-WINDOW-583 §4, §10, §11 = SCENE-WW-001-ROYAL-KITCHEN-20260922, serial `ER-VIS-20260922-0001`: window band `EA-RK-WIN-001` (5 panes, one replaced pane, drawn hatched), live hearth `EA-RK-HC-001` (crane half out, one pot, lid off, even coal bed), banked hearth `EA-RK-HC-002` (cold, raked), ash bucket `EA-RK-IR-0031`, dished floor `EA-RK-STRUCT-FLOOR`, smoke bent by the open east door `EA-RK-DR-001`. **No people are drawn** (no Inés, Clara or Veronica; no locket; no kinship cue) | PROPOSED — derived from a scene packet that is not yet Chairman-approved |
| E4 | Aperture ring text "WINDOW EA-RK-WIN-001 · ROYAL KITCHEN · UPPER COURT · EDEREAIRAH · ONE PANE OLDER THAN ITS NEIGHBOURS" | Same source, §10 and §12 row 5 (Upper Court service range) | PROPOSED |
| E5 | Back question "WHOSE KNIFE IS THAT, AND WHERE DOES IT SLEEP?" | WR-WORLD-WINDOW-583 §2.1 REASON: "a simulation that cannot answer 'whose knife is that and where does it sleep' is a set, not a world". Tone lock BRAND-EDITORIAL-TONE (question-driven, no cliché) | PROPOSED |
| E6 | Back line "THE KNIFE: EA-RK-KN-0114 · LOCKED_TO ITS USER · RETURNS TO BOX EA-RK-BX-0114" | WR-583 §11 object table. The user is not named on the shirt | PROPOSED |
| E7 | **ErsatzReality** (tertiary) | Spelling from BRAND-ERNEWS-MASTHEAD (`CHAIRMAN_APPROVED`). Set in DejaVu Sans Mono because BRAND-FONT-FAMILY is `CHAIRMAN_VISUAL_REFERENCE_LOCKED`, exact font name UNKNOWN. Relation "PUBLISHED BY" from WR-583 §13 | Spelling APPROVED · typeface PROVISIONAL |
| E8 | **VYC2ST** (tertiary) | Listed "available now" in registry evidence (spine_589.marks_available_now). Relation "COMMISSIONED BY" from WR-583 §13. Set as plain text, no drawn mark | Available; typeface PROVISIONAL |
| E9 | ErsatzReality magnifying-glass-and-hat mark | BRAND-ER-MARK-GLASS-HAT is `CHAIRMAN_APPROVED` as a description, but **no mark file** was found in the backend or any remote branch. Not redrawn (MERCH class SHIRT: "Mark redraw: no") | NOT USED — no file |
| E10 | **THYLORA mark** | BRAND-THYLORA-MARK: truth_class UNKNOWN, `NOT_APPROVED`, "No approved THYLORA mark file is registered" (WR-VISUAL-BIBLE-001). The in-world "globe-O" in WR-583 is a scene description, not an approved file. `git grep` of all remote branches found none | **BLOCKED** — empty labelled slot, non-printing |
| E11 | Serial `ERM-SHIRT-LS-QMARKWINDOW-R001` | Grammar MERCH-SERIAL-001 (`origin/claude/thylora-merchandise-dev-8fs58s`, docs/MERCH-SERIAL-RIGHTS.md): class SHIRT, family LS (logo + scene), artwork QMARKWINDOW, run R001, SKU level (copy omitted) | PROPOSED — gate G6 "serial assigned" is SYSTEM-owned; nothing written |
| E12 | QR | BRAND-QR-DESTINATIONS UNKNOWN / NOT_APPROVED | NOT USED |
| E13 | Measuring rule, compass marks, annotations | Constructed in `build/gen.js` | PROPOSED |

**Print constraints held** (registry evidence spec): one ink, no gradient, thinnest line 7 px = 1.68 pt at 300 dpi (limit 1.5 pt); all ink sits inside 9.6 in of width (spec max 280 mm = 11.0 in). **Conflict to decide:** the seq-589 spec says "front centre chest, 280 mm wide max, top edge 75 mm below collar seam"; seq 594 says "HUGE". This file keeps within 280 mm width but runs ~14.5 in tall; that height is the new variable.

**Ink / garment colour:** ink `#ECE4D2` (bone) is for a **black** garment. If the Chairman chooses a bone/natural garment, the same file must be re-inked dark (one value, `INK` in `build/gen.js`) and re-rendered.

## 4 · Garment source

| Fact | Value | State / source |
|---|---|---|
| Provider | Printful (Chairman report: connected; registry `printful_connected_user_report: true`) | USER-REPORTED, not API-witnessed |
| Blank | Bella+Canvas 3001 Unisex Staple T-Shirt (Printful catalog) | Printful product page, fetched 2026-09-24 (Exa / Firecrawl cache 2026-09-23): https://www.printful.com/custom/mens/t-shirts/unisex-staple-t-shirt-bella-canvas-3001 |
| Fibre | Solid colours 100% combed and ring-spun cotton; heathers/some colours 99% cotton / 1% polyester | B+C spec sheet https://www.bellacanvas.com/spec/3001%20specs.pdf (fetched 2026-09-24). Black = solid, **100% cotton** (inferred from the sheet's colour split; confirm on the Printful colour picker) |
| Fabric weight | ~4.2 oz/yd² (~142 gsm) | UNVERIFIED (quoted only in a customer review on the Printful page). **Below the 180–220 gsm "heavyweight" target in the 589 spec** — Chairman decision |
| Size chart (flat, inches) | 2XL chest 26 / length 32 · 3XL chest 28 / length 33 | B+C spec sheet above. VERIFIED |
| Country of manufacture of the blank | UNKNOWN (B+C head office is Los Angeles per the sheet; that is not the garment's origin) | UNKNOWN |
| Print method | DTG (direct-to-garment) | Printful default for this product; exact technique shown in the Printful design maker — confirm there |
| Print area | 12 × 16 in front | UNVERIFIED for this product (page is not machine-readable). The art is exactly 12 × 16 in so it scales proportionally if Printful's area differs |
| Fulfillment facility | Printful US facility chosen at routing | UNKNOWN — shown only on the order after it is placed |
| Maker (who prints / packs) | Printful staff at the routed facility | UNKNOWN by name. Blank maker: Bella+Canvas; mill UNKNOWN |

## 5 · Sample cost (1 × 2XL + 1 × 3XL, black)

| Line | Amount | State |
|---|---|---|
| Base (one front DTG print) | $11.92 | Printful product page schema.org offer price, "from" price; size/colour it applies to is not stated. SOURCED, PARTIAL |
| 2XL upcharge | +$2.50 to +$2.56 | UNVERIFIED — third-party only (podvector.ai, May 2026, two articles disagree) |
| 3XL upcharge | +$3.50 to +$4.56 | UNVERIFIED — same |
| Colour premium for black | $0 to +$1.00 | UNVERIFIED — third-party claim only |
| Back print (second placement), per shirt | +$5.95 | UNVERIFIED — third-party only |
| Inner-neck print | not priced | UNKNOWN |
| Shipping, USA Flat Rate (Standard), T-shirt category | $4.95 first item + $2.20 additional | Printful shipping page https://www.printful.com/shipping (search-index copy read 2026-09-24). Help-center example still shows $4.75; confirm at checkout |
| Sales tax | UNKNOWN | depends on ship-to state and Printful's tax registration; shown at checkout |

**Arithmetic — front only (recommended: 589 "one position, one variable"):**
- 2XL: 11.92 + 2.50 = 14.42 (low) · 11.92 + 2.56 = 14.48 (high)
- 3XL: 11.92 + 3.50 = 15.42 (low) · 11.92 + 4.56 = 16.48 (high)
- Garments: 14.42 + 15.42 = **29.84** (low) · 14.48 + 16.48 = **30.96** (high)
- Shipping: 4.95 + 2.20 = **7.15**
- **Total before tax: $36.99 – $38.11** (+ black premium up to $2.00 → up to $40.11)

**With back print on both:** + 2 × 5.95 = 11.90 → **$48.89 – $52.01** before tax.

**Timing:** Printful states fulfillment 2–5 business days + US Standard 3–4 business days after fulfillment (shipping page). Ordered on Thu 2026-09-24, that is 5–9 business days → **Thu 2026-10-01 to Wed 2026-10-07**. The 2026-10-03 target is **not guaranteed** on Standard; Express (1–3 business days after fulfillment, price UNVERIFIED) lands 2026-09-29 to 2026-10-06.

## 6 · Shopify read (read-only, 2026-09-24)

- Shop: ErsatzReality, `ersatzreality.myshopify.com`, Basic plan, USD.
- `vendor:Printful` → **0 products**. Title/type search for shirts → **0 products**.
- Newest product created 2026-09-17 (a draft digital notebook). No Printful-synced product exists, so nothing in the store will be affected by a manual sample order.

## 7 · EXACT ORDER PATH (do not execute until the checklist in §8 is signed)

This path places a **manual sample order in Printful**. It does **not** create a Shopify product and does not publish anything. Printful UI labels may differ slightly from the words below (UNVERIFIED — the dashboard is behind login).

1. Open **https://www.printful.com** → **Sign in** with the account already connected to the ErsatzReality store.
   (From Shopify instead: Shopify Admin → **Apps** → **Printful** → **Open app**, which lands in the same Printful dashboard.)
2. Left menu → **Orders**.
3. Top right → **New order** (a.k.a. **Create order**). If asked which store, choose **ErsatzReality** or the manual-order option; do **not** choose "Add product to store".
4. **Add product** → catalog: **Men's clothing → T-shirts → Unisex Staple T-Shirt | Bella + Canvas 3001**.
5. Colour: **Black** (Chairman choice). Size: **2XL**. Quantity: **1**.
6. Design: **Front** placement → **Upload** → `front-print-3600x4800.png`. Choose **Fit to print area**; check the file fills the 12 × 16 area with no warning about DPI. Leave **Back**, **Sleeve** and **Inside label** empty (unless the Chairman ticks the back-print box in §8; then upload `back-print-3600x4800.png` to **Back**).
7. **Add to order** / **Save**.
8. **Add product** again (or duplicate the line) → same product, same colour, **3XL**, quantity **1**, same front file → **Add to order**.
9. **Shipping address**: the Chairman's address. **Shipping method**: Flat Rate (Standard), or Express if the 2026-10-03 date matters more than cost.
10. **Continue / Review order**. Record on this sheet: item cost per size, placement fees, shipping, tax, estimated delivery date, and the fulfillment facility if shown.
11. **Billing**: confirm the payment method on file.
12. The last screen shows **Place order** (may read **Confirm order** / **Pay**). **STOP. Do not press it.** Pressing it is the Chairman's act after §8 is complete.

## 8 · Chairman approval checklist

- [ ] Question mark as drawn (masonry hook + world-window dot) — approve / amend
- [ ] World fragment inside the dot: Royal Kitchen hearth wall from SCENE-WW-001 — approve, noting the scene packet itself is still awaiting decision (a)
- [ ] Back print: **front only** (recommended, one variable) / front + back
- [ ] Back question wording, if back is printed
- [ ] ErsatzReality and VYC2ST set in the provisional monospace (exact font UNKNOWN) — accept for sample 001 / supply font
- [ ] THYLORA mark: stays **BLOCKED / empty** on sample 001 (no approved file exists)
- [ ] Garment: Bella+Canvas 3001 (~4.2 oz, below the 180–220 gsm target) / choose a heavier blank
- [ ] Garment colour **black** (ink bone) / bone garment (re-ink required)
- [ ] Sizes: 1 × 2XL + 1 × 3XL
- [ ] Shipping: Standard (~$7.15) / Express (for the 2026-10-03 date)
- [ ] Budget ceiling accepted: ~$37–$40 front only, ~$49–$52 with back, before tax
- [ ] Proposed serial `ERM-SHIRT-LS-QMARKWINDOW-R001` accepted for gate G6
- [ ] Chairman presses **Place order** personally

After delivery, the registry witness list applies: print registration and edge sharpness · colour against the art file · hand-feel after 24 h · fit against the size chart · first wash · total landed cost · order-to-door days.
