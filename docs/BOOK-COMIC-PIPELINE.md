# THYLORA · Physical Book and Comic Pipeline

**Work item:** THY-WORK-MERCH-BOOKS-LAUNCH-586
**Store of record:** ErsatzReality · `ersatzreality.myshopify.com` · Basic plan · USD

---

## 1 · Evidence posture

No vendor page was reachable from this session (egress 403 on CONNECT). Every figure
below is `SECONDARY_REPORT`, retrieved 2026-09-22, **not a vendor quote**. One of the
sources states plainly that Lulu revises print costs annually and that any quoted figure
should be re-checked in the live calculator at order time. Do that.

---

## 2 · The decision: Lulu Direct primary, Bookvault second

| Criterion | Lulu Direct | Bookvault |
|---|---|---|
| Home base | US, global print network | UK, with US printing available |
| Shopify integration | Yes, first-party app | Yes |
| Upfront cost to start | None reported | ~£19.95 upfront fee reported, then per-book |
| Reported per-book, 200pp paperback | Re-check live; revised annually | ~$4.01 to print in the US |
| Bindings | Perfect, saddle-stitch, coil, hardcover | Perfect, saddle-stitch, case, **wire-o**, **spiral** |
| Natural fit | US-domiciled store selling to US customers | UK/EU delivery, and specialty bindings |

**Lulu Direct is the primary pipeline.** The store is US-domiciled, sells in USD, and
Lulu asks nothing upfront — which matters when the first print run is one proof copy of
one title, not a catalogue.

**Bookvault is the named second source, for two specific jobs:** UK/EU orders when they
appear, and the wire-o / spiral bindings that an engineering notebook actually wants.
Neither vendor is rejected; one is sequenced ahead of the other.

**Do not open both accounts now.** Open Lulu, run one title end to end, then decide.

---

## 3 · Format spec per product line

| Line | Trim | Binding | Interior | Notes |
|---|---|---|---|---|
| **Comics** | 6.625 × 10.25 in | Saddle-stitch ≤ 48pp, perfect ≥ 48pp | Colour, 70# | Page count must be a multiple of 4 for saddle-stitch |
| **Storybooks** | 8.5 × 8.5 in | Perfect, or case for a keepsake edition | Colour | Square trim reads as a children's book on a shelf |
| **Question books** | 6 × 9 in | Perfect | B&W, with write-in space | Cheapest line to produce; best margin |
| **Engineering notebooks** | 7 × 10 in | **Wire-o** — it must lie flat while someone draws in it | B&W, grid or dot | Wire-o is a Bookvault strength; Lulu's coil is the equivalent |
| **Coloring books** | 8.5 × 11 in | Perfect | B&W, **single-sided**, heaviest stock offered | Single-sided is non-negotiable: markers bleed |
| **Successor Manual** | 6 × 9 in | Case-bound hardcover, dust jacket | B&W or 2-colour | The one title where the object itself carries meaning |

## 4 · The pipeline, stage by stage

```
MANUSCRIPT → INTERIOR PDF → COVER WRAP PDF → PROOF COPY → WITNESS → LIST → LIVE TEST ORDER
```

1. **Manuscript** — finished text and art. Not an outline. A title enters the pipeline
   when it is finished, not when it is planned.
2. **Interior PDF** — exact trim, 0.125 in bleed on any element running to the edge,
   0.5 in gutter margin minimum, all fonts embedded, images ≥ 300 dpi, CMYK for colour
   interiors. Page count fixed before the cover is drawn.
3. **Cover wrap PDF** — a single flat file: back cover + **spine + front cover**. Spine
   width = page count × the vendor's paper caliper for the chosen stock. A spine computed
   for the wrong paper is the single most common reason a cover is rejected.
4. **Proof copy** — one physical copy. Always. Screens lie about colour, gutter and weight.
5. **Witness** — run the §6 checklist with the proof in hand.
6. **List** — one Shopify product per title. Real page count, real trim, real shipping
   estimate in the description.
7. **Live test order** — one real order through the storefront, paid properly, to prove
   cart → payment → vendor routing → tracking → delivery.

## 5 · What not to do

**Do not create empty Shopify shells.** Not for a comic that is not drawn, not for a
Successor Manual that is not written. The store already holds **50+ DRAFT product records,
none of them purchasable** (read live 2026-09-22). That is the failure mode this line is
under instruction to avoid, and it has already happened once at scale.

A title becomes a Shopify product when a proof copy has passed witness. Not before.

## 6 · Proof witness checklist

**Block**
- [ ] Trim is the specified size, measured with a rule
- [ ] Gutter margin is readable without cracking the spine open
- [ ] No text or art cut off at any edge
- [ ] Page count matches the interior file exactly

**Print**
- [ ] Type is sharp, not fuzzy or doubled
- [ ] Colour matches the proof expectation under daylight
- [ ] No show-through on coloring-book pages (the single-sided test)
- [ ] Images show no visible pixellation

**Cover**
- [ ] Spine text is centred on the spine, not wrapping onto a face
- [ ] Spine width is correct — the cover is not straining or loose
- [ ] Finish (matte/gloss) is the one ordered

**Object**
- [ ] Binding holds when the book is opened flat and flexed
- [ ] Wire-o notebooks actually lie flat
- [ ] Saddle-stitched comics close square

**Verdict** — [ ] List it · [ ] Re-proof with a named change · [ ] Change vendor

## 7 · Blockers

**BK1 · No finished manuscript is committed.** Nothing in this repository is a
print-ready interior. The pipeline is built; it has nothing to run yet. The fastest first
title is whichever is closest to finished — most likely a question book or a coloring
book, both of which are B&W interiors with the lowest production cost.

**BK2 · Vendor account and spend — HELD.** Opening a Lulu account and buying a proof copy
commits money. Chairman action.

**BK3 · Figures are second-hand.** Re-check every cost in the live calculator before
pricing anything.

**BK4 · ISBN not decided.** Selling only through the ErsatzReality store needs no ISBN.
Any later retail or library distribution does, and an ISBN must be assigned before the
cover is finalised, not after.
