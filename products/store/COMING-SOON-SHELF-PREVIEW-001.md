# Coming Soon shelf — preview for Chairman review

**Status:** PREVIEW ONLY. The theme has not been touched. Nothing is live.
**Live theme (untouched):** `THYLORA Shelf Build — Review` · `gid://shopify/OnlineStoreTheme/149121499213` · role MAIN
**Preview file:** `products/store/coming-soon-shelf-preview.html`

Rules this shelf obeys, on every card: **no purchase button, no price, no add-to-cart, no link
into a product page, no form, no date.** "Coming Soon" is a statement that work exists, not a
promise about when.

---

## 1. Rain-Side Beans — **eligible, with a correction to my previous report**

I told the Chairman last pass that Trail Table had no canonical product record. **That was wrong.**
I had checked the readiness and realization registries and not the shelf assignments or Shopify
itself. The record exists:

| Field | Live value |
| --- | --- |
| Product | `gid://shopify/Product/7956697481293` |
| Title | Trail Table No. 001 — Unkle Seezin's Rain-Side Beans |
| Handle | `trail-table-no-001-old-jaros-rain-side-beans` |
| Status | **DRAFT**, `publishedAt: null` |
| Price | $2.00 · SKU `ER-TRAIL-TABLE-001` |
| Cover | bound — `uncle-seezin-trail-table-cover.jpg`, alt "Unkle Seezin in an EdereAirah frontier town scene" |
| Shelf | `TASTEPRINT_FOOD` |

DRAFT and unpublished, so a Coming Soon card for it cannot collide with a purchase path. **Eligible.**

Two things the Chairman should see before it goes on a live shelf:

- **The handle still says `old-jaros`.** The product's own description carries the canon note:
  "Unkle Seezin is the subject of this product. Old Gerald is a separate person and must not be
  substituted for Unkle Seezin." The URL slug predates that ruling. I have not changed it —
  changing a handle changes a URL, and that is a Chairman call, not a cleanup.
- Alt text reads "EdereAirah"; elsewhere the spelling is **EdereAriah**. One of the two is wrong.
  Not fixed silently.

The card carries no price and no link, so neither issue reaches a customer through this shelf.

## 2. The Oakfield / Batavia story — **NOT eligible under its own name**

This one cannot go on a public shelf as asked, and the reason is a standing Chairman policy, not
my judgement.

`THY-LAND-INDIGENOUS-001` (status ACTIVE, authority Chairman Vyctor Peete):

> Earth names such as **Batavia or Oakfield** identify only the Earth mirror/reference and
> **MUST NOT appear as EdereAriah place names** unless the Chairman intentionally and explicitly
> authorizes that specific Earth name.

And the seed itself, `THY-STORY-MIRROR-OAKFIELD-BATAVIA-001`:

> The audience is not told the Earth counterpart until a deliberate reveal or recognizes it from
> the map.

A shelf card titled "The Oakfield / Batavia Story" would put both Earth names on the most public
surface the company has, and would spend the reveal the story is built around before the story
exists.

Second, independent blocker: that seed's `rights_release.state` is
**`CHAIRMAN_RIGHTS_AND_PRIVATE_PERSON_RIGHTS_REVIEW_REQUIRED`**. It is not cleared for public
release in any form. The related family seed
(`THY-STORY-SEED-FAMILY-LIVING-ARCHIVE-001`) is `NOT_CLEARED` with `public_release: false`,
minors PROTECTED and living people CONSENT_REQUIRED.

**What I have staged instead**, for the Chairman to accept or reject: a card that says a story is
being built and names nothing.

> **A town, a post office, and an aunt one town over**
> A young adult living alone above a post office. A beloved aunt a town away. An ordinary life
> with a mystery running under it. In development.

No Earth name. No EdereAriah place name either — none has been approved yet. No date. It is
honest, it holds the reveal, and it breaks no policy. **If the Chairman wants the real names on
the shelf, that is the explicit authorization the land policy requires, and it should be given in
those words.**

## 3. Other future products — **none currently eligible**

The five replacement cover candidates in `WR-STORE-001` — Bramble Wick, Build a World, City That
Needed More Power, Gap Hunt, Question Deck — are all `PENDING_CHAIRMAN_VISUAL_APPROVAL`. Putting
an unapproved cover on a live public shelf is the same failure as putting it on a product page.

They are DRAFT products, not future products. They belong on the shelf when their covers are
approved, not before. I have left them off rather than fill the shelf.

Bramble Wick additionally must not carry public naming while the WICK / WYCK custody conflict is
open (`bramble_project_registry.wick_continuity.canonical_name = "WYCK"`, `CHAIRMAN_LOCK`).

---

## 4. What the shelf looks like

Two cards. The preview file renders exactly what would ship.

| Card | Source | Purchase control | Date |
| --- | --- | --- | --- |
| Trail Table No. 001 — Unkle Seezin's Rain-Side Beans | live DRAFT product `7956697481293` | none | none |
| A town, a post office, and an aunt one town over | `THY-STORY-MIRROR-OAKFIELD-BATAVIA-001`, names withheld | none | none |

Each card: title, one line of description, the words "In development". No price, no button, no
link, no form, no date, no countdown, no email capture.

## 5. To make it live

1. Chairman reviews `coming-soon-shelf-preview.html`
2. Chairman accepts or replaces the withheld-name card, or explicitly authorizes the Earth names
3. Only then is the section added to the theme — and the theme is published only after the shelf
   is witnessed on a real device

**Nothing in step 3 has been done.** The live theme is untouched.
