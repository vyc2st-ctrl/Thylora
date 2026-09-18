# ErsatzReality Storefront — Experience Redesign

**2026-09-18** · Agent: CLAUDE · Workstream: STORE_BACKEND · Backend read through sequence **#470**
**Custody:** `THY-Q-20260918-CLAUDE-STOREFRONT-EXPERIENCE-471`
**Handoff:** `THY-HANDOFF-STORE-CHATGPT-20260918-014` · **Restart:** `THY-RESTART-20260918-STOREFRONT-EXPERIENCE-001`

**NOT PUBLISHED. NO PRODUCT ACTIVATED. NO THEME MODIFIED OR OVERWRITTEN.** Zero Shopify writes.

Viewable preview: **`storefront/preview/index.html`** — built first, per the locked rule in #459
(*if a preview surface is missing, create the preview before asking for approval*).

---

## The equation this is measured against

```
S_store = I × C × D × T
```

| Symbol | Meaning | Live reading, 2026-09-18 |
|---|---|---|
| **S_store** | Storefront experience strength. **Multiplicative** — any factor at zero zeroes the whole store. | **HOLD** |
| **I** | **Identity** — unmistakably ErsatzReality; could this page belong to anyone else? | **1 / 5** |
| **C** | **Clarity** — visitor understands what they can do here, within one screen. | **0–1 / 5** |
| **D** | **Depth** — every item connects outward to a world, story or open question. | **0 / 5** |
| **T** | **Trust** — polished, coherent, usable, professional. | **1 / 5** |

**Verdict: HOLD.** `D = 0` is literal, not rhetorical — the store has **zero metafield definitions
and zero metaobject definitions**, so there is no mechanism by which any item can connect to
anything. Under the Chairman's own rule, any factor at zero forces HOLD.

*Equations in this document always travel with their variable definitions, per #470 and #469.*

---

## A. Current generic Shopify problems

Every item below was read from the live Shopify Admin API on 2026-09-18.

**1. The navigation is Shopify's factory default and has never been touched.**
Main menu: `Home` → `Catalog` → `Contact`. Footer: `Search` → `Your Privacy Choices`. This is the
single strongest signal of a generic store, and it is free to fix.

**2. Four of eight collections render completely empty to a visitor.**

| Collection | Products | ACTIVE (visible) |
|---|---|---|
| `thylora-quick-wins` | 3 | **0 — empty** |
| `thylora-what-everyone-is-talking-about` | 3 | **0 — empty** |
| `questions-amp-games` | 2 | **0 — empty** |
| `thylora-tools` | 3 | **0 — empty** |
| `stories` | 5 | 1 |
| `family-learning` | 4 | 1 |
| `new-this-week` | 8 | 1 |
| `frontpage` | 9 | 1 |

**3. A collection makes a promise the store cannot keep.** `new-this-week` reads: *"Everything here
is done — not a preorder, not a coming-soon."* It contains 8 products and shows **1**. That is a
direct Trust (**T**) failure, and it is worse than an empty shelf because it is a stated claim.

**4. No structured data layer exists.** Zero product metafield definitions, zero metaobject
definitions. Nothing carries a world, a question, a character, a series or a page count as data —
so nothing can be cross-linked, filtered or templated. This is what pins **D** at zero.

**5. There is no page that says what ErsatzReality is.** The five pages are `Contact`, plus three
legal pages, plus `Your order`. A first-time visitor has no route to understanding. This pins **C**.

**6. "Catalog" as the primary verb.** An undifferentiated grid is the exact failure mode named in
the objective. It invites browsing by nothing.

**7. The production theme is named `THYLORA Shelf Build — Review`** and carries `role: MAIN`. A
working title is running the storefront.

**8. The real problem underneath all seven.** The store does not read as generic because of the
theme — **Horizon is a capable OS 2.0 theme.** It reads as generic because it is *empty and
unexplained*: **1 ACTIVE product, 224 DRAFT.** No amount of design work changes that ratio. The
six Edition v2 approvals do.

---

## B. ErsatzReality storefront information architecture

The top level is **intent**, not category. A visitor arrives wanting to *do* something.

```
/                         The question, then five ways in
├─ /enter-a-story         Read something tonight
├─ /follow-a-question     A question with no settled answer
├─ /learn-how-it-works    Working methods you come out the other side of
├─ /explore-the-world     EdereAriah itself — FREE, no products
└─ /take-something        Everything you can keep, by price
```

**Three rules that make this an experience rather than a menu.**

1. **A product may appear in more than one lane.** *Build a World* is both "Learn how it works" and
   "Take something with you". A grid forces one home; an intent model does not.
2. **Lane 04 sells nothing, on purpose.** A store that only sells reads as a shelf. One free,
   genuinely interesting room is what makes the other four mean something — and it is where **D**
   is earned.
3. **Lanes map onto collections that already exist.** `stories`, `questions-amp-games`,
   `thylora-tools`, `family-learning` are reused, not replaced. Only *Explore the World* is new,
   and it is pages, not products.

**Retire or merge:** `thylora-quick-wins` and `thylora-what-everyone-is-talking-about` are both
empty and both overlap lanes 02/03. Merging them removes two dead rooms at zero cost.

---

## C. Homepage section order

Each section is a Horizon section; the order is the argument.

| # | Section | Job | Factor |
|---|---|---|---|
| 1 | **The claim** — one sentence, no carousel | "Every object here is the end of an investigation." | I |
| 2 | **Five ways in** — the lane grid | Visitor picks an intent in one screen | C |
| 3 | **Start here for $1.99** — single product, the cheapest | Remove the decision; one real thing to buy | M |
| 4 | **What arrives** — 3 icons: library, PDF, forever | Kill the "is this a subscription?" doubt | T |
| 5 | **From the world** — free world entry, no price | Prove depth before asking for money | D |
| 6 | **Newest finished editions** | Only genuinely ACTIVE items — never a promise | T |
| 7 | **How an ErsatzReality product is made** | Documented / believed / unknown, kept apart | I, D |
| 8 | **One open question** — rotating, links to a product | Leave them curious, not sold at | D |

**Section 3 is the highest-leverage block on the page.** A visitor who buys a $1.99 story becomes a
customer; a visitor who browses eight $3–$19 items usually does not. *Bramble Wick* at $1.99 is the
front door, and *Twelve Miles* is the proof it works — it is the one product that has ever sold.

---

## D. Product discovery model

```
R_item = F × P × L × A
```

| Symbol | Meaning |
|---|---|
| **R_item** | Rank score for showing an item in a lane. Multiplicative — a zero on any factor removes the item from that lane rather than burying it. |
| **F** | **Fit to lane** (0–5). How squarely the item answers the intent the visitor just chose. |
| **P** | **Proof** (0–5). Evidence the thing is finished and real: artifact hash, page count, rights state. |
| **L** | **Life** (0–5). Freshness and sequence position — is it the current edition. |
| **A** | **Availability** (0 or 1). **1 if `status = ACTIVE`, else 0.** |

**`A` is binary and it is the whole discipline.** A DRAFT product scores zero and cannot be
surfaced anywhere, which structurally prevents the `new-this-week` failure — a collection can never
again promise what it cannot show. When the six are approved, `A` flips and the store fills
without anyone rewriting a section.

**Sort within a lane:** `R_item` descending, price ascending as tiebreak, so the cheapest real
thing surfaces first.

---

## E. Story / question / world cross-linking

This is what `D` buys, and it needs **three metaobject definitions** — all free, all native.

| Metaobject | Fields | Purpose |
|---|---|---|
| `world_entity` | name, kind (person/place/trade/object), world (EdereAriah/THYLORA/Earth), one-line, image | Unkle Seezin, Mara Vale, Bell Crossing, the Trail Table |
| `open_question` | question text, state (open/contested/answered), what is documented, what is believed, what is unknown | The spine of Depth. Maps directly to the Herb File four-register method |
| `series` | name, position, next/previous | Trail Table No. 001…, Herb File 001…, Edition v2 |

Then **five product metafields**, referencing those:

```
custom.world_entities   → list.metaobject_reference(world_entity)
custom.open_question    → metaobject_reference(open_question)
custom.series           → metaobject_reference(series)
custom.what_you_receive → single_line_text  ("9-page edition · read-aloud")
custom.page_count       → number_integer
```

**`custom.page_count` as data solves a live defect.** All six Edition v2 descriptions currently
state the *v1* page count — Question Deck promises 27 and the artifact has 19. If the page count is
a metafield rendered into the description instead of prose, the claim cannot drift from the
artifact again. **That one field turns a recurring Trust failure into a structural impossibility.**

**Cross-link surfaces:** "Also from Unkle Seezin" (shared `world_entity`), "The question behind
this" (`open_question`), "Next in this series" (`series`). All three are Horizon blocks reading
dynamic sources — **no custom code.**

---

## F. Mobile experience

Phone is the majority surface and the storefront is currently a default grid on it.

- **Lane grid is the mobile homepage.** Five tappable cards above the fold beat a carousel.
- **Sticky price + buy bar** on product pages once scrolled past the fold.
- **Cover images are square (1254×1254) for four of six products** and 1445×1870 for two — see
  section H; mixed aspect ratios break a mobile grid visibly.
- **One-thumb reach:** primary action bottom-right, never a top-corner tap target.
- **No horizontal scroll at 320px.** The preview is built to this.
- **Test the real failure:** the library hand-off after purchase. A buyer on a phone must get from
  Shopify checkout to a readable PDF without a desktop. This is unwitnessed today —
  `mobile_preview_passed = false` on every product, and it cannot be witnessed while they are DRAFT.

---

## G. Product card redesign

```
K_card = W × Q × G × P
```

| Symbol | Meaning |
|---|---|
| **K_card** | Card completeness. Multiplicative — a card missing any element is not a weaker card, it is a generic card. |
| **W** | **World tag** — which world/character/trade this belongs to. |
| **Q** | **Question** — the question the item asks, in the item's own voice. |
| **G** | **Get** — exactly what arrives: extent, format, delivery. |
| **P** | **Price + availability truth** — real price, and honest state (Available now / Available soon / Gate unresolved). |

Today's card carries **P only**, so `K_card = 0`. Worked example, same product:

> **Now:** `Bramble Wick — The Lantern That Wouldn't Go Out` · `$1.99`
>
> **Proposed:** `EdereAriah · Mara Vale · Nightfall` / **Bramble Wick** / *"What is a light actually
> for, if nobody is looking for it?"* / `9-page edition · bedtime read-aloud · ends on one question`
> / `$1.99` `Available soon`

Rendered side by side in the preview. `W`, `Q` and `G` all come from the metafields in section E —
**the card redesign is a consequence of the data model, not extra work on top of it.**

---

## H. Visual identity requirements

**Three constraints are already locked and must be honoured.**

1. **`BRAND-THYLORA-MARK` is UNKNOWN / NOT_APPROVED.** No graphic logo may be invented. The preview
   uses a **typographic wordmark only**. This is a recorded constraint from the Edition v2 build.
2. **`BRAND-FONT-FAMILY` is UNKNOWN.** Any family used is **PROPOSED, not canon.** The preview uses
   system stacks deliberately so nothing is smuggled into canon.
3. **`THY-INTERWORLD-BARRIER-GLOBAL-001` is a LOCKED global visual gate** applying by default to
   every THYLORA / ErsatzReality / EdereAriah image, with both a prohibition half and a
   required-form half. **No new imagery was generated for this work**, and none should be until a
   prompt carries the full barrier block.

**What the storefront needs, stated as requirements rather than decisions:**

- **Cover aspect ratio must be unified.** Four covers are 1254×1254, two are 1445×1870. Mixed
  ratios are the most visible "unfinished store" tell on a phone. Recommend 1:1 for grid.
- **One accent per lane**, drawn from the already-locked palette direction: leaf green-gold, ember
  orange, lamp amber.
- **Dark editorial ground**, not white retail. The world is lantern-lit; the store should be too.
- **A cover treatment, not a logo:** a consistent plate frame + file number is what makes a set read
  as a collection. This is already the recorded direction for the Field File posts.

---

## I. Search and filter logic

Filters must be **world-native, not commerce-native.** "Price, low to high" is a shelf. Filter by:

- **World** — EdereAriah / THYLORA / Earth-real
- **Who it's for** — read alone / read together / classroom / working adult
- **Time it takes** — one sitting / a weekend / ongoing
- **What it is** — story / deck / workbook / file
- **Question state** — open / contested / answered *(this filter exists on no other store)*

**Search must match the metaobjects, not just titles.** Searching `Unkle Seezin` should return every
product carrying that `world_entity` even when his name is not in the title — that is the single
clearest demonstration that this is a world and not a catalog.

Shopify native search covers title, description, tags and (with a filter app or Search & Discovery)
metafields. **Tags are the zero-cost stand-in** until metafields land.

---

## J. What can be done with the current Shopify theme

Horizon (`themeStoreId 2481`) is a current OS 2.0 theme. More is possible than the store uses.

**Available now, no code:**
- Sections and blocks on every template, reorderable — the whole of section C
- **Dynamic sources**: bind any block to a metafield or metaobject — all of section E and G
- Custom collection/product templates per item type (story vs deck vs workbook)
- Menus, mega-menus, and the five lanes as top-level nav
- Pages for *Explore the World* and *What ErsatzReality is*
- Native filtering by tag, and by metafield with Search & Discovery (free, first-party)
- Colour/type/layout theme settings

**Needs Liquid edits inside the theme (still no separate frontend):**
- The product card layout in section G
- "Also from this world" / "The question behind this" blocks
- Availability-truth badge logic

**Roughly 80% of this redesign is theme configuration and Liquid**, not a custom storefront.

---

## K. What needs custom frontend

Only where Shopify genuinely cannot go:

1. **The Understanding Engine surfaces.** All seven `ue_surfaces` are `build_state = NOT_BUILT` and
   every one is hosted on the **THYLORA app or dashboard**, not the store — `/games`, `/family`,
   `/language-lab`, `/six-learning`, `/six-dashboards`, `/learning`, `/continuity`. **The store's
   job is to be the front door that routes into them, not to host them.**
2. **Interactive question-walking** (Evidence Journey, Question Autopsy, Word Problem Translator) —
   stateful, learner-memory-backed, privacy-gated. Not a Shopify page.
3. **The customer library** (`thylora-library.vercel.app`) — already custom, already live.
4. **The world explorer** — if it becomes a live graph of `world_entity` records rather than a
   handful of static pages.

**Everything a buyer touches between arriving and owning a file can stay on Shopify.**

---

## L. Zero-cost and low-cost first moves

Ordered by effect per hour. Nothing here needs a designer or a developer.

| # | Move | Cost | Factor | Effect |
|---|---|---|---|---|
| 1 | **Rewrite the main menu** to the five lanes; delete "Catalog" | 10 min | I, C | Removes the loudest generic signal on the store |
| 2 | **Empty or hide the four empty collections** | 10 min | T | Stops four dead rooms |
| 3 | **Fix the `new-this-week` description** so it stops promising 8 while showing 1 | 2 min | T | Removes a false claim |
| 4 | **Write one page: "What ErsatzReality is"** and link it first in nav | 1 hr | C, I | The single biggest **C** move available |
| 5 | **Add tags** (`world:ederearah`, `who:read-together`, `time:one-sitting`, `question:open`) | 30 min | D | Free stand-in for metafields; enables section I immediately |
| 6 | **Create the 3 metaobjects + 5 metafields** in section E | 1–2 hr | D | Unlocks cross-linking and kills the page-count drift permanently |
| 7 | **Install Search & Discovery** (free, Shopify first-party) | 15 min | D, C | Metafield filtering without code |
| 8 | **Unify cover aspect ratio to 1:1** | — | T, I | Two covers to re-crop |

**Moves 1–5 total under two hours and cost nothing.** They raise **I**, **C** and **T** off the
floor before a single product is activated.

---

## M. Conversion improvements

- **One $1.99 front door, above the fold.** *Bramble Wick*. A first purchase is a different act from
  a browse, and $1.99 is the price at which the decision stops being a decision.
- **Say "nothing ships" early and loudly.** Digital-goods stores lose buyers to the shipping
  question. *Twelve Miles* already proves the path end to end.
- **State re-access as a feature, not fine print:** *"Download it again next year. It costs nothing
  and it does not expire."* This is genuinely unusual and is currently buried mid-description.
- **Never show a DRAFT product.** `A = 0` in section D enforces it structurally.
- **Give the price a reason.** `$19.00 · 15-page workbook · the method used to build EdereAriah`
  converts better than `$19.00`, and it is already true.
- **One honest badge.** *Available now* / *Available soon*. A visitor who trusts the badge trusts
  the store.
- **Bundle the ladder once there are six:** story → deck → workbook is a natural $1.99 → $12 → $19
  progression, and *Build a World* is the top of it.

---

## N. Exact preview plan

**Stage 1 — done, viewable now.** `storefront/preview/index.html`. Static, self-contained, real
product data, real prices, real covers read from Shopify on 2026-09-18. No theme touched, no Shopify
write, no generated imagery. Open it in any browser.

**Stage 2 — on Chairman approval of the direction.** Duplicate the MAIN theme to an **unpublished**
copy named `ErsatzReality Experience — Preview`. Shopify gives every unpublished theme a shareable
preview link. **The live theme is never touched**, and publishing remains a separate, explicit act.

**Stage 3 — build in the preview theme:** menu, lane pages, homepage section order, metaobjects and
metafields, product card. Still unpublished.

**Stage 4 — witness on a phone**, including the checkout → library → PDF hand-off, which is the one
path never yet tested on mobile.

**Stage 5 — Chairman publishes**, or does not. Rollback is instant: the old theme remains.

---

## O. Exact next executable action

**Open `storefront/preview/index.html` and return one word on the direction: proceed or change.**

If proceed, the next action needs no further authority and takes under two hours: **moves 1–5 in
section L** — rewrite the menu to the five lanes, hide the four empty collections, fix the
`new-this-week` claim, write the "What ErsatzReality is" page, and add the tag vocabulary. Those
five raise **I**, **C** and **T** without activating a single product or touching the theme's code.

**But the largest single move on this board is not a storefront move.** The store reads as one
product because it *is* one product: **1 ACTIVE, 224 DRAFT.** Approving the six Edition v2 previews
puts six real items across five lanes at $1.99–$19.00. **Design cannot substitute for that, and
this redesign is worth materially less until it lands.**
