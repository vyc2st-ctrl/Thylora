# QYRIS QuickCheck — complete packet

**Product:** `THY-QYRIS-QUICKCHECK-001` · **Revision:** A · **Issued:** 2026-09-21
**Workroom:** WR-STORE-QYRIS-581 · **State:** CHAIRMAN PREVIEW · **Not published**

---

## 1 · What the product is

A **twelve-minute check you run on one decision before you commit to it.** Five
moves — Question, Yield, Reason, Inspect, Safeguard — then a **rule table**
returns one of four verdicts and **names the rule that produced it**.

The claim is deliberately narrow and checkable: not "better decisions on
average" (unmeasured, so unclaimed), but **the same four answers always produce
the same verdict, the verdict names its rule, and hope never returns a proceed.**

## 2 · Page map — 14 pages

| # | Page | Carries |
|---|---|---|
| 1 | Cover | Promise, the five marks on a rule |
| 2 | What it is / what it is not | Two columns, the one rule of use, where the name comes from |
| 3 | The twelve minutes | Timing bar 2·2·3·3·2, three working notes |
| 4 | Visual grammar | Amber, chain, ladder, bracket — plus the evidence ladder drawn full width |
| 5 | **Q · Question** | 3 registers, the test, three failing examples |
| 6 | **Y · Yield** | 3 registers, yield/exposure diagram with the absorbable line, the test |
| 7 | **R · Reason** | 3 registers, the three-link chain with the thin amber link, the test |
| 8 | **I · Inspect** | The four-rung table with "what moves it down a rung", 3 registers, the disconfirmer |
| 9 | **S · Safeguard** | Reversal-cost dial, what a stop rule is, 3 registers, the test |
| 10 | The readout | The five-rule table, the 48-combination spread, "a hold is not a no" |
| 11 | Worked example 1 | Q, Y, R filled in, with the chain drawn and the thin link marked |
| 12 | Worked example 2 | I, S, and the readout band showing R4 fired |
| 13 | **The sheet** | One fillable page, all five moves, live readout |
| 14 | Credits and rights | Serial, credits, provenance, rights, corrections, what is not claimed |

Pages 5–9 all carry the same three explanation registers: **Plain / Everyday /
Technical**. Plain is one sentence. Everyday is how you would say it to a friend.
Technical is the same idea stated precisely enough to argue with.

## 3 · Visual grammar

| Mark | Means | Used on |
|---|---|---|
| **Amber** | The weakest part — never decoration, never danger. **At most once per diagram.** | Every page |
| **Chain** | A reasoning chain. Thick link = pointable premise. Thin amber link = the weakest. | 7, 11 |
| **Ladder** | The evidence ladder, read bottom-up: solid = observed, dashed = reported, dotted = assumed, faint amber = hoped. | 4, 8 |
| **Bracket + bar** | A safeguard. Bracket = the decision, bar = what stops it. A bracket with no bar is a decision with no stop rule. | 9 |
| **Line with blocks above and below** | Yield above, exposure below, with the absorbable limit as a dashed amber line. | 6 |
| **Three-segment arc** | Reversal cost: low, medium, high. | 9 |

Verdict states are distinguished by **shape and fill, not by colour alone** —
filled, grey, outlined-ink, outlined-amber — so the spread bar survives
monochrome printing and colour-blind reading.

Palette: one paper, one ink, one accent, plus greys. Typography: system serif
for reading, system sans for labels. **No web font, no CDN, no external asset.**

## 4 · Worked example

A real, ordinary decision: **a $4,200 transmission quote against a car worth
about $6,800.** Filled in fully across pages 11–12.

The example earns its place by doing something: it moves the decision from
"just fix it" to **a $180 pre-repair inspection plus a written stop rule**,
because the thinnest link ("the rest of the car has three years left") turns out
to rest on an **assumption** — and an assumption is checkable. Rule **R4** fires.

`tests/quickcheck.test.mjs` asserts the worked example's four inputs really do
produce PROCEED WITH SAFEGUARD on R4, so the example on the page cannot drift
away from the engine.

No person and no business is quoted or identified. There are **no testimonials**,
and a test asserts the document contains none.

## 5 · Fillable page design

One page, seven rows, twenty-two writable fields, four decision choices.

- **On paper:** print it with the four choices blank and it is a clean sheet you
  fill by hand, then apply the rule table on page 10 yourself.
- **On screen:** the four choices are buttons; the readout band updates live and
  names the rule.
- **Storage:** answers are held in `localStorage` on that device only. Every read
  and write is wrapped, so a private window, blocked site data or a print preview
  still renders a usable sheet.
- **Nothing leaves the device.** No account, no telemetry, no network call — and
  a test asserts the shipped script contains no `fetch`, no `XMLHttpRequest`, no
  `sendBeacon` and no external URL.

## 6 · Credits · serial · provenance · rights

| | |
|---|---|
| **Serial** | `THY-QYRIS-QUICKCHECK-001 · Rev A`, issued 2026-09-21 |
| **Credits** | Method, page design, visual grammar, worked example and verdict table: THYLORA |
| **Provenance** | Authored in `vyc2st-ctrl/Thylora` under workroom WR-STORE-QYRIS-581. The verdict table is executable at `store/qyris-quickcheck/lib/readout.js` and covered by 19 tests |
| **Rights granted** | Personal, household, team and internal business use; unlimited printing; filled-in sheets are the buyer's own work to keep or share |
| **Rights withheld** | Resale or redistribution of the document; republication in whole or part; presenting the method as one's own; use as training data for any model |
| **Corrections** | Issued as a new revision letter with the serial unchanged. **Never a silent edit.** |

## 7 · Delivery plan

| Artifact | Form | Notes |
|---|---|---|
| **A · Printable PDF** | 14 pages, Letter | Generated from the same HTML. Verified at 14 PDF pages. |
| **B · Interactive page** | Single HTML + CSS + JS, three files | Opens by **double-click from disk** — the script is deliberately a classic script, because a module script is blocked on `file://`. Verified in Chromium from `file://` with zero console errors and zero failed requests. |
| **C · Blank sheet** | Page 13 alone | For reprinting without reissuing the document. |

Delivery rides the existing THYLORA store and entitlement rails. No new backend,
no new identity system, no account required to use the product after delivery.

**A4 note:** the page box is Letter. An A4 variant is a one-line `@page` change
and is **not cut** for Rev A — it is listed as an open item, not silently claimed.

## 8 · Mobile plan

Verified in Chromium at 390 × 844:

| Check | Result |
|---|---|
| Horizontal overflow | **None.** `scrollWidth` 390 = viewport. |
| Tap targets | **Minimum 44 px** across every choice button. |
| Body text | 15 px at 1.55 line height; inputs 16 px so iOS does not zoom on focus. |
| Tables | Collapse to labelled stacked rows; headers hidden, each cell carries its own label. |
| Grids | Two- and three-column layouts collapse to one column. |
| Diagrams | SVG scales to container width; no fixed pixel widths. |
| Dark mode | Full token set under `prefers-color-scheme: dark`, with a `[data-theme]` override. |
| Sheet | Fully usable and saveable on a phone; print/share to PDF from the toolbar. |

## 9 · Store copy

> **QYRIS QuickCheck**
> *A twelve-minute check you run on one decision before you commit to it.*
>
> Five moves, in order. Each one asks for something you can point at. At the end
> a rule table — not a score, not a feeling — tells you which of four things to
> do, and names the rule it used so you can argue with it.
>
> Fourteen designed pages, including a worked example filled in end to end and a
> one-page sheet you can print or fill in on your phone. The verdict table is the
> same one used on the page: five ordered rules, forty-eight possible input
> combinations, every one reaching exactly one verdict.
>
> No account. No tracking. Nothing you write leaves your device.

**Not used, and not to be used:** testimonials, star ratings, invented
percentages, outcome promises, urgency, scarcity, "transform your life".

## 10 · Price proposal

| Tier | Price | What it is | Reasoning |
|---|---|---|---|
| **Preview** | Free | Pages 1–4 | Shows the method and the visual grammar; the sheet, the rule table and the worked example are what is bought. |
| **Single** | **$14** | Full 14 pages, PDF + interactive + blank sheet, one person | Priced against one small decision, not against a course. The worked example alone identifies a $180 check on a $4,200 decision. |
| **Working set** | **$34** | Same, licensed for a household or a team of up to eight | Under two and a half singles; the product is more useful when a second person runs it with you, and page 3 says so. |

**Recommended:** open at **$14 / $34** with the free preview. No launch discount,
no strike-through pricing, no countdown.

**What must not happen to the price:** it must not be presented as a discount
from a higher number that was never charged.

## 11 · Chairman preview packet

**Read in this order:**

1. `store/qyris-quickcheck/quickcheck.html` — open it from disk, in a browser, on a phone if possible.
2. Page 13, the sheet — fill it in on one real decision and watch the readout name its rule.
3. Pages 11–12, the worked example — the strongest test of whether the product is worth anything.
4. Page 10, the rule table — this is the part to disagree with, if any part is wrong.
5. This packet, sections 6, 9 and 10 — rights, store copy, price.

**Decisions required:**

| # | Decision | Default if silent |
|---|---|---|
| 1 | Price: $14 / $34, or other | Held, not published |
| 2 | Rights wording as written in §6 | Held |
| 3 | Whether R4 is correct — should a hard-to-undo decision with *observed* evidence really require a safeguard? | Stays as written |
| 4 | Whether an A4 page box ships in Rev A | Letter only |
| 5 | Whether the free preview is pages 1–4 or pages 1–3 | Pages 1–4 |
| 6 | Release order against Stuck Loop Reset and Before You Buy | QuickCheck first |

**What is complete:** all 14 pages, the verdict engine, 19 tests, the worked
example, the fillable sheet, the mobile and print behaviour, rights, serial,
provenance, store copy and price proposal.

**What is not done, and is not claimed to be:**

- Not published anywhere. No route, no nav entry, no store listing exists.
- No PDF is committed to the repository; the PDF is generated from the HTML.
- Not tested on physical paper — print behaviour is verified via Chromium's
  print pipeline (14 PDF pages, correct breaks), not by a printer.
- No outcome claim is made or measured.
- A4 not cut.
