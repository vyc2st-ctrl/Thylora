# THYLORA · First Shirt

**Work item:** THY-WORK-POD-FIRST-SHIRT-587
**Scope:** ONE shirt. First sample only. The catalogue is not to be flooded and will not be.

---

## 1 · Evidence posture on every number below

No vendor page was reachable from this session — the egress proxy answered **403 on
CONNECT** to `printful.com` and to every other vendor host tried. Every figure in this
document therefore comes from **third-party comparisons retrieved 2026-09-22**, and is
classed `SECONDARY_REPORT`, **not** `VENDOR_QUOTE`.

Treat each one as a planning band to be replaced by the live figure at the moment of
ordering. They are close enough to decide *which* vendor; they are not close enough to
commit a cent against. This is the same discipline as blocker B7 in WR-RAELINK-001.

---

## 2 · The decision: Printful for sample #1

| Criterion | Printful | Printify | Weight for a **first sample** |
|---|---|---|---|
| Shopify app | Mature, first-party | Mature, first-party | Tie |
| Base cost, Bella+Canvas 3001 | ~$11.69 free tier | ~$11.29 free tier, ~$9.04 on Premium | Printify, by ~$1.33 |
| US shipping, single item | ~$4.75 (+$2.20 each additional) | ~$4.85 | Tie |
| Sample discount | 20% free tier, 25% on Growth, up to 3 items/month | 20% off **base only**, shipping not discounted | Printful |
| Paid tier to unlock best price | Growth $24.99/mo | Premium $39/mo ($24.99 billed annually) | Printful, and **neither is bought yet** |
| Who actually prints it | Printful's own facilities | A marketplace of third-party providers | **Printful — decisive** |
| Quality consistency | One party accountable | Varies by provider chosen | **Printful — decisive** |
| Fulfilment | ~2–5 business days production + shipping | Provider-dependent: 48h to 7 days | Printful, on predictability |
| Embroidery | In-house | Provider-dependent | Printful |
| Inside/neck branding | Available | Provider-dependent | Printful |
| Exit cost if switched later | Low — the art is one-ink and portable | Low | Tie |

**Choice: Printful for the first sample. Printify stays a live second source, not a
rejected one.** For one shirt, a $1.33 unit saving is worth nothing and a consistent,
accountable print is worth everything. Once the design is proven on cloth, run the same
art through Printify as a same-shirt test and compare the two in hand. That comparison is
the only honest way to choose a production vendor, and it costs about $14 to run.

**Do not subscribe to any paid tier yet.** A $24.99/mo plan saving ~$2.65 a shirt needs
about 10 shirts a month to break even. One sample does not establish that volume; nothing
in the store currently does.

---

## 3 · Garment

| | |
|---|---|
| Blank | **Bella+Canvas 3001** unisex jersey short sleeve — the industry reference blank, carried by both vendors, so the same-shirt test is possible |
| Fabric | 100% cotton (heather colourways are blends) |
| Colour | Dark garment — **Black** or **Heather Forest**; the one-ink Bone artwork is built for a dark ground |
| Size, sample #1 | Chairman's own size. **Not yet stated — see blocker F1** |
| Decoration, sample #1 | **DTG.** It reproduces the fine rule work and the mono relationship block at 300 dpi. Embroidery cannot hold 60 px type and is deferred to a later cap or left-chest mark. |

---

## 4 · Print-ready design spec

Master artwork is committed:

- `commerce/thylora-shirt-front.svg` — 3600 × 4800 px = **12.00in × 16.00in @ 300 dpi**
- `commerce/thylora-shirt-back-serial.svg` — 1200 × 600 px = **4.00in × 2.00in @ 300 dpi**

### Front

| Element | Spec |
|---|---|
| **THYLORA wordmark** | 400 px cap height, letter-spaced 26. The **O is the globe** — it is not a letter decorated with a globe, the globe *is* the letter |
| **Globe-O** | Pure geometry, not a font glyph: 150 px radius rim at 42 px stroke, three parallels at 20 px, two meridians (rx 58 and rx 112) giving the rotation read. It survives any later typeface decision unchanged |
| **Rule** | 1420 px wide, 7 px, 80% opacity, under the wordmark |
| **ERSATZREALITY** | 126 px, letter-spaced 38, centred |
| **Embedded relationship** | Three mono lines with a bracket rule: `THYLORA HOUSE` / `ERSATZREALITY ENTERPRISE` / `VYC2ST ORIGIN` — the house, the enterprise that sells, the origin that answers for it, read top down |
| **Serial** | `THY-G-001-0001 / FIRST SAMPLE / 2026` |
| Live area | Inside a 2700 × 2400 px safe band (9in × 8in) so smaller garment sizes do not crop it |
| Ink | **One colour.** THYLORA Bone `#F2EDE3` |

One ink is deliberate: it prints identically in DTG, screen print and single-head
embroidery, so the decoration method stays an open decision *after* the art is finished
rather than before.

### Serial scheme

```
THY-G-<LINE>-<UNIT>        THY-G-001-0001
     │      │      └─ unit number within the line, zero-padded to 4
     │      └──────── garment line, zero-padded to 3 (001 = the first THYLORA shirt)
     └─────────────── THYLORA garment
```
Unit **0001** is the Chairman's own shirt and is not to be re-issued.

### Preflight — before either file is uploaded anywhere

1. **Convert every `<text>` element to outlines.** A print service does not have your
   font. Text left as text is substituted or dropped.
2. **Delete the layer `id="preflight"`.** The red and green guides must never print.
3. Export PNG at **300 dpi, transparent background**.
4. Confirm the Bone ink against the chosen garment colour on screen at 100%.

No visual proof was rendered in this session — no SVG rasteriser is installed here. Both
files open correctly in any browser, and both parse as valid XML (checked).

---

## 5 · Sample order flow, and the cost path

**Order the sample from the Printful dashboard directly. Do not create a Shopify product
to do it.** A sample order needs no published product, and this keeps the instruction "do
not flood the catalogue" intact — nothing appears in the store until the shirt is in hand
and approved.

1. Create / sign in to the Printful account *(Chairman action — see blocker F3)*.
2. Preflight and export the two PNGs per §4.
3. Product Catalog → Bella+Canvas 3001 → colour → size.
4. Place the front file: **centred, 3.0 in below the collar**, scaled to the 9in safe band.
5. Place the back file: **centred, 3.0 in below the back collar seam**.
6. Order as a **sample** so the sample discount applies (up to 3 items per month).
7. Standard US shipping; choose expedited only if §6 says the date needs it.

### Cost path — planning band, not a quote

| Line | Planning figure |
|---|---|
| Bella+Canvas 3001 base | ~$11.69 |
| Less 20% sample discount (free tier) | ~−$2.34 |
| Shipping, single item, US | ~$4.75 |
| **Landed, before tax** | **~$14.10** |
| Honest range to budget | **$13 – $18** |
| Second shirt in the same order | ~+$11.55 (discounted base + $2.20 additional-item shipping) |
| Subscription | **$0 — none is bought** |

Retail arithmetic, for when there is something to sell: at $32 retail and ~$16.44 landed
at full base cost, gross margin is ~$15.56 before payment fees.

---

## 6 · Arrival estimate against 3 October

Today is **22 September 2026**. Twelve days.

| Step | Planning duration |
|---|---|
| Preflight and export | under an hour, once the font is settled |
| Printful production | ~2–5 business days |
| US standard shipping | ~3–5 business days |
| **Total** | **~5–10 business days from order** |

- **Order by Wed 24 September** → arrival window ~**1–8 October**. 3 October is inside it
  but is not guaranteed by standard shipping.
- **Order by Thu 25 September with expedited shipping** → 3 October is comfortable.
- **Order 29 September or later** → 3 October will not hold on standard shipping.

**The date is reachable. It is reachable only if blockers F1, F2 and F3 below clear within
about seventy-two hours.** That is the whole truth of it: the artwork is not the long pole,
the three decisions are.

---

## 7 · Quality witness checklist — on arrival

Run this with the shirt in hand, before anything is published or photographed. Mark each
line PASS or FAIL and write the failure, not a feeling.

**Print**
- [ ] Globe-O rim is unbroken; the two meridians are both visible and distinct
- [ ] The three parallels are separate lines, not a smear
- [ ] The 7 px rule under the wordmark is continuous, with no dropout
- [ ] All three relationship lines are legible at arm's length
- [ ] The serial `THY-G-001-0001` is legible without leaning in
- [ ] No banding, no pixellation at the letter edges, no halo or box around the print
- [ ] Ink is Bone, not grey and not blue-white, under daylight and under indoor light

**Placement**
- [ ] Front print is centred within ±0.25 in, measured collar seam to artwork top
- [ ] Front print sits 3.0 in below the collar, ±0.25 in
- [ ] Back serial is centred and square to the collar seam
- [ ] Artwork is square to the shoulder line, not rotated

**Garment**
- [ ] Correct blank, correct colourway, correct size on the label
- [ ] No holes, no pulls, no stains, seams intact
- [ ] Hand feel: the print is not a stiff plastic plate

**After one wash** — cold, inside out, tumble low
- [ ] No cracking in the globe rim or the rule
- [ ] No measurable fade against an unwashed photograph
- [ ] No shrink beyond the blank's stated tolerance

**Verdict**
- [ ] Reorder as-is · [ ] Reorder with a named change · [ ] Test Printify with the same art · [ ] Change blank

Log the outcome into the workroom. A sample whose result is not written down has to be
bought twice.

---

## 8 · Shopify connection path

Store, read live 2026-09-22: **ErsatzReality** · `ersatzreality.myshopify.com` · Basic
plan · USD · America/New_York.

**Nothing has been created, changed or published in the store by this session.**

Also read: the catalogue holds **50+ product records and every one returned was `DRAFT`**.
A customer cannot buy anything today. The installed-app list could not be read — the
Admin API returned `access denied` on `appInstallations` — so whether a POD app is already
connected must be confirmed by eye in **Shopify Admin → Apps**.

When, and only when, the sample passes §7:

1. Confirm in Admin → Apps whether Printful or Printify is already installed. Install one,
   not both.
2. Connect it to the store; authorise the product and order scopes it asks for.
3. Push **one** product: *THYLORA Shirt — First Edition*. One product, sizes as variants.
4. Create **one** collection, `THYLORA Wear`. Do not build a merchandise section around a
   single item.
5. Publish that one product to the Online Store channel. Leave every draft alone.
6. Place one live test order through the storefront, at full price, paid properly, to
   prove the whole path: cart → payment → POD routing → tracking → delivery. An untested
   fulfilment path is an unproven one.

**Do not create empty shells.** No placeholder shirt, no "coming soon" variants, no
colourway that has never been printed.

---

## 9 · Blockers — all three are Chairman decisions

**F1 · Size and colourway — NOT STATED.** The order cannot be placed without the
Chairman's shirt size and a choice between Black and Heather Forest. One line of reply.

**F2 · Display font licence — OPEN, and it gates the artwork.** The masters carry Inter
and IBM Plex Mono as placeholders, both open-licensed and both usable commercially. If the
wordmark is to be a distinctive licensed face instead, that licence must permit
**merchandise/physical-goods use**, which many display licences exclude. Either confirm
the open-licensed placeholders or name the face and check its licence. Until this closes,
"convert text to outlines" cannot be completed honestly.

**F3 · Vendor account and spend — HELD.** Opening a Printful account and authorising
~$13–$18 commits money and creates an account in the Chairman's name. Per the standing
execution rules this session did not do it, and did not pre-fill anything toward it.

Nothing else stands between the design and the shirt.
