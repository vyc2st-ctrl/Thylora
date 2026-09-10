# Q351 — four personalized products on the shelf as drafts, and the shipping trap they arrived with

Continuity: `THY-Q-20260909-AUTOFRONT-CATALOG-CASH-HYUNDAI-351`
Read at `2026-09-09T18:52Z`.

`CHECKOUT: NOT PROVEN.` `PAYMENT: UNPROVEN — REAL MONEY NOT YET CAPTURED.` `REACCESS: 0.` Unchanged.

## Cards created — all DRAFT, all unpriced

| product | Shopify | status | price |
|---|---|---|---|
| THYLORA Anywhere Portrait | `7965307142221` · `thylora-anywhere-portrait` | DRAFT | pending, not authorized |
| THYLORA Celebration Card Studio | `7965307961421` · `thylora-celebration-card-studio` | DRAFT | pending, not authorized |
| EdereAirah MirrorWardrobe Portrait Catalog | `7965308452941` · `edereariah-mirrorwardrobe-portrait-catalog` | DRAFT | pending, not authorized |
| Family Image Storybook | `7965308616781` · `family-image-storybook` | DRAFT | pending, not authorized |

`onlineStoreUrl` is `null` on all four — they are not reachable by a customer on the storefront, which
is what DRAFT means and is what was asked for.

Each carries all ten required fields — who it is for, what you send us, what you choose, what we
deliver, turnaround, price state, privacy, rights, refund and cancellation, revisions — and the
seven order requirements: photo, style, location, clothing, text, privacy level, publication
consent. Publication consent defaults to **no** on every one.

Registry rows updated to `store_state = DRAFT_CARD_CREATED_NOT_OPEN` with the Shopify IDs bound.

## The defect that came with them

All four arrived with **`requiresShipping: true`**. Shopify defaults a new variant that way and
`ProductCreateInput` has no field to set it, so it must be corrected afterwards. On a product whose
own copy says nothing is ever shipped, that would have asked a buyer for a postal address and then
blocked them on missing shipping rates.

Auditing every product in the store rather than only mine found the same trap already sitting on the
two QYRIS cards from the previous run. Six variants fixed. All 19 products read back: every variant
is now `requiresShipping: false`, `tracked: false`.

## Shelf verified live

`https://thylora-store.vercel.app` — `200`, `text/html; charset=utf-8`, **27,254 bytes**, body md5
`77b827da0babc39bdd13d0421b64b2ab`, identical to the committed file. Ten cards, zero scripts.
Fetched by `pg_net`.

It now carries two paths. The finished-goods path — Discover → Understand → Buy → Pay → Receive →
Read again. And the made-for-you path — **Discover → Buy → Submit → Create → Approve → Deliver**.

## What could be sold by hand today, and what cannot

Three of the four could be **made** by a person with no new software: Anywhere Portrait, Celebration
Card, Family Image Storybook. The making is manual work.

But "sold" is not "made", and the honest line falls somewhere else entirely:

- **SUBMIT cannot be manual.** There is no upload surface, no consent capture, no way to attach a
  brief to an order. Email is not a substitute: it captures no consent record, leaves photographs in
  an inbox, and cannot prove afterwards what the customer approved. On products whose whole promise
  is *your material stays private and yours*, that is not a shortcut, it is the wrong answer.
- **APPROVE cannot be manual either**, for the same reason — the Family Image Storybook card
  promises nothing is final until the customer says yes, and a promise with no record behind it is
  the kind of claim this system exists to refuse.
- **DELIVER has no path.** The customer library serves published EDF packages, not per-customer
  files. A personalized artifact has nowhere to land.

**MirrorWardrobe is blocked for a different reason and price will not unblock it.** Zero EdereAirah
houses and zero looks are published. The product's central act is choosing a house and a look; today
that is choosing from an empty rail. The card supports multiple houses structurally and says so, and
no house names were invented to fill the gap.

## What still prevents a stranger from paying us

Nothing about these four. They are drafts on purpose.

The blocker is the one that has not moved: **no real-money capture has ever occurred.**
`thylora_payment_capture_witness` holds 0 rows, the storefront checkout has never been exercised by
anyone, and the only order that ever reached a gateway ran in test mode. Adding nine draft cards
does not touch that, and none of them is closer to revenue than the $1.99 story that is already
open, priced and reachable.

## Fastest cash action

Sell the item that is already for sale. One real $1.99 purchase of *Twelve Miles for Flour* through
the storefront proves CHECKOUT, writes the first PAYMENT witness, and confirms test mode is off — all
three from one event. Every personalized product here waits on a submit-and-consent runtime that does
not exist yet; the story waits on nothing.


---

## Correction, 2026-09-10

The spelling in this document and on the cards it describes was wrong. The controlling spelling is
**`EdereAirah`** — AIRAH, not ARIAH. Corrected here and in the live Shopify record; the product was
renamed from *EdereAriah MirrorWardrobe Portrait Catalog* to **EdereAirah MirrorWardrobe Portrait**
and its handle from `edereariah-...` to `edereairah-mirrorwardrobe-portrait`. Its price is now
authorized at $34.99. The Earth-facing brand is **ErsatzV**.

Prices for all eight personalized items were authorized on 2026-09-10 and are recorded in
`docs/CATALOG-25-SPEC-Q351.md`. Authorization did not open any of them: every one stays DRAFT
because its submit, consent, approval and delivery mechanisms still do not exist.
