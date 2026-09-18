# STORE RELEASE PREVIEW SPRINT 003
## Cover bindings · readiness · viewable previews · math clarity · storefront · fulfillment repair

- Document ID: `THY-STORE-SPRINT-003`
- Run date: 2026-09-18
- Backend head at start: **495**
- Prohibitions honored: NO IMAGE GENERATION · NO PRODUCT ACTIVATION · NO PUBLICATION · NO THEME PUBLICATION

---

# A. BACKEND HANDSHAKE

## A.1 Head and deltas since my last run

| Seq | Query | Source | What it carries |
|---|---|---|---|
| 493 | `THY-Q-20260918-CLAUDE-STORE-EXECUTION-SPRINT` | CLAUDE_CODE | my previous run |
| **494** | `THY-Q-20260918-BELL-EMERGENT-GATE-AUDIT-494` | CHATGPT | Bell Crossing confirmed a **recovered EdereAriah settlement, not an Earth place**; its parent land/region is UNKNOWN and must be assigned before geography-dependent publication. Media plan locked to still-led posts until Runway is funded. Hard-gate audit found several policies still only PARTIAL/PASSIVE. |
| **495** | `THY-Q-20260918-COVER-APPROVAL-MATH-STUDIO-495` | CHATGPT | **Chairman approval of the five 2026-09-12 replacement covers.** Learner-facing math adopts SAY IT → BUILD IT → SOLVE IT → CHECK IT while retaining `P_solve = L × M × S`. Studio realism system locked. Emergent route paused on exhausted credits. |

Head is **495**. No newer deltas.

## A.2 What I checked before treating §1 as done — and why it was not

Delta 495 states that Gap Hunt's `visual_complete` and `visual_preflight` are now true. **I selected those exact fields rather than accepting the statement.** They are indeed true — five readiness rows were updated at `2026-09-18 19:47:34Z`, after my previous run ended at 19:19.

But the same read showed the flags had been flipped **without the evidence being moved**:

| Product | `vis` / `pre` | `evidence.shopify_featured_media_url` before this run |
|---|---|---|
| Bramble Wick | true / true | `bramble-wick-lantern-cover.png?v=1788370716` ← the superseded 09-02 file |
| Build a World | true / true | `thylora-build-a-world-starter-kit-cover.png?v=1788370731` ← superseded |
| City Power | true / true | `thylora-city-needed-more-power-cover.png?v=1788371187` ← superseded |
| Gap Hunt | true / true | `thylora-gap-hunt-21-cover.png?v=1788370761` ← superseded |
| Question Deck | true / true | `thylora-question-deck-50-cover.png?v=1788370745` ← superseded |

And `chairman_visual_approved_at` still read **2026-09-08** on every row — four days before the approved files existed.

**So the flags said "approved" while the record still named a different file.** That is the precise failure the previous run refused to create by flipping flags, and it is exactly what §1 of this directive asked me to fix: bind the approval to the *exact* asset. The binding was real work, not bookkeeping.

## A.3 Governing policies read this run

| Policy | State | Effect here |
|---|---|---|
| `THY-APPROVAL-MUST-BE-VIEWABLE-001` | LOCKED | Approval requests must present WHAT_IT_IS → VIEW_IT → WHAT_APPROVAL_DOES → APPROVE/REVISE/HOLD, and a title-plus-hash with no way to see the item is **prohibited**. Section D is built to that order. |
| `THY-MATH-CRYSTAL-FIRST-PASS-001` | LOCKED | `SAY IT → BUILD IT → SOLVE IT → CHECK IT`, mapped to `P_solve = L × M × S` with CHECK as a separate validation step, not a replacement for L/M/S. Scope: all learner-facing math **and reasoning**. |
| `THY-VICTORPEETE-REALITY-VISUAL-SYSTEM-001` | LOCKED | `VPR = D × L × C × E × I × P`; zero rule; equations and explanations stay co-located; no filler; one dominant question per visual. |
| `THY-VISUAL-SCENE-SELECTION-GATE-001` | LOCKED | No generation this run. Nothing was generated. |

## A.4 ADDENDUM — sequences 496 and 497 landed while this run was in progress

Both arrived from ChatGPT after I read head 495 and before I wrote custody. Neither changes anything above, but one of them now depends on work done in Section B, so both are recorded here rather than left for the next reader to discover.

**496 — `THY-Q-20260918-STUDIO-WORKFORCE-POST-496`.** The Meaning Before Math approved image is scheduled as a static Instagram/Facebook post at 17:00 ET; provider state is PENDING and **publication is not yet witnessed**. The image hash is registered as `ER-VIS-20260918-0001`, and **every future image or revision must receive a new unique serial**. ErsatzReality Studios is now a persistent 34-person studio (26 crew, 8-person actor ensemble) with work history, privacy and relationship edges.

> **Consequence for this thread:** the $295 diagnostic cover, when it is eventually authorized, needs a serial of its own at generation time. That is now a fourth requirement on top of the seven scene fields, the same-turn approval from 492, and the binding procedure in Section B.

**497 — `THY-Q-20260918-GLOBAL-LANGUAGE-NEXT-POST-497`.** ShareChat is recorded `USER_REPORTED_CONNECTED_PENDING_WITNESS` — the Chairman says it is connected, but account and create-post access are not yet witnessed, so publishing access cannot be claimed. The next content pivot is **Global Question 001 — "What is one thing everyone in your city sees, but almost nobody questions?"** — Spanish and Simplified Chinese for Instagram/Facebook, Hindi for ShareChat. **It uses the already-approved Gap Hunt cover**, with no new imagery and no product-sale claim.

> **Two consequences for this thread.** First, the Gap Hunt cover binding written in Section B is now load-bearing for a content plan: the post can name the exact file, media ID and approval it is using, which it could not have done this morning. Second, and worth stating plainly — **Gap Hunt the product is NEEDS_ONE_FIX, not ready.** A post carrying its cover must not imply the product is buyable. The 497 note already says "no product sale claim", which is correct; this is a flag to keep it that way.

---

# B. COVER APPROVAL BINDINGS

## B.1 Verification before binding

For each of the five approved products I read the **live** `featuredMedia` from the Shopify Admin API and matched four independent identifiers before writing anything: media ID, CDN URL with version token, `createdAt`, and pixel dimensions.

**Filename similarity was never accepted as identity.** Every one of these files contains the word "approved" in its name; that is a string, not a record, and it was treated as such.

## B.2 The five bindings

| Product | Shopify product ID | Media ID | Approved file | Created | Size |
|---|---|---|---|---|---|
| **Bramble Wick** | `7956697448525` | `28674415591501` | `thylora-bramble-wick-approved-cover.png?v=1789219245` | 2026-09-12T13:20:43Z | 1254×1254 |
| **Build a World** | `7957200109645` | `28674417197133` | `thylora-build-a-world-approved-cover.png?v=1789219249` | 2026-09-12T13:20:48Z | 1254×1254 |
| **City Power** | `7957206892621` | `28674420637773` | `thylora-city-power-approved-cover.png?v=1789219260` | 2026-09-12T13:20:58Z | 1254×1254 |
| **Gap Hunt** | `7957199749197` | `28674418606157` | `thylora-gap-hunt-approved-cover.png?v=1789219255` | 2026-09-12T13:20:53Z | 1254×1254 |
| **Question Deck** | `7957199913037` | `28674422112333` | `thylora-question-deck-approved-cover.png?v=1789219265` | 2026-09-12T13:21:03Z | 1254×1254 |

All five were created within a 20-second window on 2026-09-12 and all five are square at 1254×1254 — consistent with one deliberate batch.

## B.3 What was written

**Into `thylora_store_product_readiness.evidence`**, per product: the approved URL replacing the superseded one, `chairman_visual_approved_at` moved to 2026-09-18, and a new `cover_approval_binding` object holding the approving authority, the delta it came from (sequence 495), the media ID, the product ID, the asset version date, the pixel dimensions, **the superseded file it replaces**, the verification method, and the scope limits verbatim.

**Into `thylora_visual_assets`**, five new rows — `THY-VIS-COVER-{BRAMBLE-WICK|BUILD-A-WORLD|CITY-POWER|QUESTION-DECK|GAP-HUNT}-20260912` — each `approval_state: approved`, `rights_state: cleared`, `provenance_state: documented`, version 2, carrying the exact file and the note that supersession is recorded, not erased.

That second write is the structural repair: the approval now lives in the asset registry, which is where `THY-DEFECT-COVER-APPROVAL-DRIFT-001` said it had to live for a cover swap to stop being invisible.

## B.4 Scope, recorded on every binding

Written into each row verbatim, so it travels with the record:

> DOES NOT authorize activation · DOES NOT authorize publication · DOES NOT authorize theme publication · DOES NOT authorize price changes

## B.5 Gap Hunt — contradiction closed

| Before | After |
|---|---|
| `visual_complete` false, then flipped true at 19:47 | **true**, and now earned |
| Evidence named `thylora-gap-hunt-21-cover.png?v=1788370761` | Evidence names `thylora-gap-hunt-approved-cover.png?v=1789219255` |
| Approval recorded 2026-09-08, four days before the file existed | Approval recorded 2026-09-18, from sequence 495 |
| No row in `thylora_visual_assets` | `THY-VIS-COVER-GAP-HUNT-20260912`, approved, documented |

The contradiction was never that the flags were wrong. It was that the flags and the file were describing different things. They now describe the same thing.

## B.6 The Last Match, deliberately not bound

**The Last Match is not in the Chairman's five and did not need to be.** Its cover was never replaced — `thylora-last-match-cover.png?v=1788371198`, created 2026-09-02, is both what the listing shows and what the readiness row always recorded. Binding it to a 2026-09-18 approval would have invented an approval nobody gave.

## B.7 Readback

All five rows re-read after writing. Each returns `vis=true`, `pre=true`, and a `cover_approval_binding.approved_media_id` that matches the live `featuredMedia` ID exactly.

---

# C. SIX-PRODUCT MATRIX — CURRENT STATE ONLY

| | **Last Match** | **City Power** | **Bramble Wick** | **Question Deck** | **Build a World** | **Gap Hunt** |
|---|---|---|---|---|---|---|
| Price | $3.00 | $5.00 | $1.99 | $12.00 | $19.00 | $7.00 |
| Exact pages | 6 | 6 | 3 | 27 | 13 | 9 |
| Copy matches | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Rights | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Delivery asset ACTIVE | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| requiresShipping false | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Cover approved **and bound** | ✅ (never changed) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Delivery class | SINGLE ✅ | SINGLE ✅ | SINGLE ✅ | BUNDLE ❌ | BUNDLE ❌ | BUNDLE ❌ |
| Interior read this run | — | — | ✅ clean | ✅ defects found | — | ✅ defects found |
| **Classification** | **READY_FOR_CHAIRMAN_PREVIEW** | **READY_FOR_CHAIRMAN_PREVIEW** | **READY_FOR_CHAIRMAN_PREVIEW** | **BLOCKED** | **BLOCKED** | **NEEDS_ONE_FIX** |

**Why each non-ready product landed where it did:**

- **Gap Hunt — NEEDS_ONE_FIX.** Everything is now resolved except one thing: the listing promises "21 gap prompts **with space to answer**" and ships a flat PDF with typed underscores. One fillable answer sheet closes it. The character defect in E is a second, smaller fix but it is a text correction, not a missing artifact.
- **Question Deck — BLOCKED**, two independent fixes: the listing instructs the buyer to "print it and cut the cards" and the file provides no cut guides or card backs; and every card repeats the same two boilerplate lines (see E.3).
- **Build a World — BLOCKED.** Highest price in the catalog, furthest below the bundle standard: the listing promises "worksheet pages to fill in as you go" and a flat PDF cannot be filled in. At $19 the standard is 5 artifacts across 3 kinds; it ships 1 artifact, 1 kind.

**No product was activated.** All six remain DRAFT.

---

# D. EXACT VIEWABLE PREVIEWS

Built to `THY-APPROVAL-MUST-BE-VIEWABLE-001`'s required order — WHAT_IT_IS → VIEW_IT → WHAT_APPROVAL_DOES → APPROVE/REVISE/HOLD.

## D.1 Open this

```
storefront/preview/chairman-product-preview-001.html
```

A single page carrying all three ready products. **Verified to open**: rendered in headless Chromium at 320, 390, 430, 768 and 1200 px. `documentElement.scrollWidth` equals `body.scrollWidth` equals the viewport at every width, and no element crosses the viewport edge. Covers load live from the Shopify CDN, so what you see is the file that is actually bound.

## D.2 What each panel carries

Every one of the nine required fields, per product:

| Field | Source |
|---|---|
| Product title | live Shopify |
| Cover | live CDN URL + media ID + dimensions + approval date |
| Actual artifact | filename, byte count, **SHA-256**, page count — all from the stored bytes |
| Exact page count | `/Count` cross-checked against `/Type /Page` object count |
| Price | live Shopify variant |
| Customer description | live Shopify, full text |
| Delivery contents | register state, shipping flag, delivery classification with its justification |
| Shopify handle | live Shopify |
| Release blockers | per product, including "none" where none |

## D.3 One honest limit, stated on the page itself

**Bramble Wick's interior is rendered page by page.** I extracted and read all three pages from the stored bytes and the preview reproduces them.

**City Power and The Last Match are identified but not re-rendered.** Their filename, size, SHA-256 and page count were read from the stored bytes today; their page text was not extracted this run. The preview page says so in those words rather than implying a completeness it does not have.

Per the gate's own rule — *"if preview unavailable, do not present approval as pending Chairman action"* — I am not claiming those two interiors have been previewed. Their covers, facts and descriptions have. Say the word and both interiors get rendered the same way Bramble Wick's did.

## D.4 What this preview does not do

Accepting it means the three products are what they say they are. It does not activate them, publish them, publish a theme, or change a price. Each still needs a separate activation decision that this page does not request.

---

# E. MATH / REASONING CLARITY FINDINGS

## E.1 What I actually read, and what I did not

**Read in full from the stored PDF bytes:** Gap Hunt (8 of 9 pages — page 8's content stream failed decompression), Question Deck (pages 1–6 of 27), Bramble Wick (all 3 pages).

**Not read:** Build a World, City Power, The Last Match interiors. No finding below is asserted about them.

The instruction was not to rewrite sound material. **The prompts themselves are good and I am not proposing to change a single one.** Every finding below is a defect or a structural gap, with an exact page reference.

## E.2 FINDING 1 — Characters are silently dropped, fusing words together

**Severity: high. Category: language unnecessarily difficult.** This makes sentences read as nonsense, and no reader will guess why.

| Product | Page | What the file actually says | What it should say |
|---|---|---|---|
| Gap Hunt | **p.1** | "21 things you**re** not seeing**turned** into evidence and action." | "you're not seeing — turned into" |
| Gap Hunt | **p.2** | "Record what you **observenot** what should happen." | "observe — not what" |
| Gap Hunt | **p.3** | "Follow the work after **done**." | "after 'done'." |
| Gap Hunt | **p.7** | "Who has access but not **authorityor** authority but not access?" | "authority — or authority" |
| Question Deck | **p.2, CARD 01** | "What do we know because we witnessed **itnot** because somebody reported it?" | "witnessed it — not because" |

**Cause:** both files declare `/BaseFont /Helvetica /Encoding /WinAnsiEncoding`. The em-dash and the curly apostrophe both exist in WinAnsi (0x97 and 0x92). The generator failed to map them and emitted nothing — so the characters vanished without any error.

**Scope — and a correction to my own first inference.** I initially expected this to be catalog-wide. **It is not.** Bramble Wick reads perfectly: "Mara's father", "Wouldn't", every apostrophe intact, no fused words. The two files differ by generation batch:

| Batch | Creation timestamp | Products | Defect |
|---|---|---|---|
| A | `D:20260831185638+00'00'` | Bramble Wick | **clean** |
| B | `D:20260901232029+03'00'` | Gap Hunt, Question Deck | **defective** |

Both Gap Hunt and Question Deck carry the *identical* creation timestamp to the second — one batch, one bug. **Build a World should be checked against batch B before it is assumed clean; I have not checked it.**

**Fix:** regenerate the two affected PDFs with the dashes and apostrophes correctly encoded. No content changes.

## E.3 FINDING 2 — Question Deck: the same two lines repeat on every card

**Severity: high. Category: relationship is hidden.**

Cards 01 through 06 (pages 2, 3 and 4) are structurally identical beneath the question:

> **Look for:** sources, behavior, dates, consequences, missing voices, or customer-visible proof.
> **Do:** write one observation and one evidence-producing next move.

Word for word. Six times in the first six cards. At that rate the deck repeats those two lines roughly **50 times across 27 pages**.

**Why this matters more than it looks.** Against `SAY IT → BUILD IT → SOLVE IT → CHECK IT`:

- **SAY IT** ✅ — the question is clear and specific. "Which sentence is secretly an assumption?" is a genuinely good card.
- **BUILD IT** ❌ — "Look for" is supposed to be the step where the reader forms the relationship for *this* question. Being identical on every card, it carries no information about any card. The relationship is hidden behind boilerplate.
- **SOLVE IT** ❌ — "Do" is likewise generic. The same instruction cannot be right for "What changed most recently?" and "What would prove us wrong?"
- **CHECK IT** ❌ — absent. Nothing asks the reader whether their answer fits.

It also explains the page economics: 50 questions occupy 27 pages because two-thirds of each card is the same paragraph.

**Fix — and deliberately not a rewrite of the questions.** Make "Look for" card-specific (one line per card, naming what *that* question's evidence looks like) and add a one-line CHECK per card. Fifty short lines, questions untouched.

## E.4 FINDING 3 — Gap Hunt is missing CHECK IT

**Severity: medium. Category: explanation and equation separated.**

Gap Hunt's structure per hunt (pp.2–7) is: prompt → "Bring back:" one artifact → ruled lines. Mapped:

- **SAY IT** ✅ — the prompts are plain and concrete ("Where does the work sit untouched longest?").
- **BUILD IT** ✅ — "Bring back" names the exact artifact, which is a genuine relationship step and better than the Question Deck's boilerplate.
- **SOLVE IT** ✅ — the ruled lines are the work.
- **CHECK IT** ❌ — nothing asks whether what came back is actually a gap.

This matters because page 2 already promises the missing piece: *"how to tell a real gap from a complaint."* The distinction is stated on the instruction page and never applied at any of the 21 hunts. **That one line, repeated per hunt as a check, would close it** — and it is material the product already contains.

**Note:** the closing **Gap map** on p.9 ("Top three gaps and consequences" / "First evidence-producing move, owner, date, and pass/fail signal") *is* a CHECK IT step, and a good one. It arrives once, at the end, after 21 unchecked hunts.

## E.5 What I am explicitly NOT flagging

- **The prompts and questions themselves.** Both sets are specific, answerable and non-generic. No rewrite proposed.
- **Bramble Wick.** It is a story, not a teaching surface, and forcing the four-step frame onto it would be exactly the change-for-its-own-sake the directive prohibits. It also closes on p.3 with "A little question before sleep" — a CHECK step arrived at naturally. Nothing to fix.
- **Gap Hunt's "Bring back" pattern.** It works. It is the model the Question Deck should copy.

## E.6 No math products were found needing meaning-before-math repair

None of the three files I read shows math before meaning, because none of them contains arithmetic. **The `P_solve = L × M × S` instrument has no learner-facing math product in this catalog to sit inside yet.** The nearest candidate is City Power, a science story about power consumption, and I did not read it. That is the honest state: the framework is locked and the product it belongs in does not exist.

---

# F. STOREFRONT PREVIEW

## F.1 Exact preview URL

```
https://ersatzreality.myshopify.com/?preview_theme_id=149333082189
```

| Field | Value |
|---|---|
| Theme | ErsatzReality Experience — Preview |
| Theme ID | `gid://shopify/OnlineStoreTheme/149333082189` |
| Role | **UNPUBLISHED** — and unchanged by this run |
| Shop primary domain | `ersatzreality.myshopify.com` |
| Shop internal domain | `sracnp-zg.myshopify.com` |
| Live theme (untouched) | `149121499213` "THYLORA Shelf Build — Review", role MAIN |

**A loose end closed:** the webhook payload on order #1003 recorded `shop_domain: sracnp-zg.myshopify.com`, which looked like a different store. It is the same store's internal myshopify domain. Not a discrepancy.

## F.2 Homepage

`templates/index.json` in the preview theme replaces the stock Horizon homepage entirely with two sections in order: `er-experience-home`, then `er-about`. Nothing of the stock theme's homepage survives.

The section carries its own truth guarantee, quoted from its header comment:

> *the "Available now" rail reads real storefront products. Shopify does not expose DRAFT products to Liquid at all, so a DRAFT product physically cannot render as buyable here. The "In preparation" rail is explicitly labelled and carries no price and no buy control.*

That is enforced by the platform, not by discipline. A draft product cannot accidentally appear buyable.

It also carries `S_store = I × C × D × T` — **Identity, Clarity, Depth, Trust**, multiplicative, any factor at zero making the storefront zero — stated on the surface itself so the formula never travels without its meaning.

## F.3 About ErsatzReality

`sections/er-about.liquid`, 6,421 bytes live / 102 lines in the repo, rendered as the second homepage section. Its own header states its purpose: to answer the four things a first-time visitor currently has no way to learn — what this is, how the pieces connect, why evidence is the point, and what they can actually do here.

**It is a homepage section, not a standalone `/pages/about` route.** A visitor reaches it by scrolling, not by navigating. Worth knowing before anyone links to it.

## F.4 Five-lane navigation

| # | Lane | Promise | Meta |
|---|---|---|---|
| 01 | Enter a Story | Read something tonight. Short, finished, yours to re-open forever. | Editions from $1.99 |
| 02 | Follow a Question | A question with no settled answer, and the evidence laid out either side of it. | Decks and hunts |
| 03 | Learn How It Works | The working methods, not the theory. You come out with something built. | Workbooks |
| 04 | Explore the World | EdereAriah itself: people, trades, places, and what is still unresolved. | Free · no purchase |
| 05 | Take Something With You | Everything is a file you keep. Download it again next year at no cost. | Instant · nothing ships |

Plus seven "in preparation" cards — Bramble Wick, Build a World, City Power, Question Deck, Gap Hunt, Last Match, Handoff — each with a world tag, a real question, and what the buyer gets, referencing the `*-approved-cover.png` files now bound in Section B.

**The one structural gap:** the lanes are section blocks, not Shopify collections, so `world_url` is `/` and **no lane navigates anywhere yet.** That is not broken code; it is a build step nobody has done. I did not fix it, because building five collections is new construction, not a repair.

## F.5 Current mobile state — measured, not assumed

Rendered in headless Chromium inside a fixed-width iframe (Chromium clamps top-level windows at 500 px, which would have made a naive measurement lie):

| Width | `documentElement.scrollWidth` | `body.scrollWidth` | Elements crossing the viewport |
|---|---|---|---|
| 320 | 320 | 320 | none |
| 360 | 360 | 360 | none |
| 390 | 390 | 390 | none |
| 430 | 430 | 430 | none |
| 768 | 768 | 768 | none |

**Clean.** No horizontal overflow at any tested width. The section collapses lanes and cards to one column below 560 px, types fluidly with `clamp()`, and keeps a 16 px side gutter throughout.

## F.6 Nothing was redesigned and nothing needed repair

I found nothing broken. No theme file was modified. No theme was published. The only storefront artifact added this run is the new Chairman preview page in Section D, which is a separate standalone file and touches no theme.

---

# G. FULFILLMENT REPORTING REPAIR

## G.1 The mismatch

Delivery runs through the THYLORA entitlement path — `thylora_product_entitlements` → `thylora_delivery_attempts` → the customer library. Shopify cannot see that path, so its fulfillment state never advances. Every paid digital order stays UNFULFILLED forever regardless of whether the buyer got the file.

## G.2 What was built

**`thylora_shopify_fulfillment_reconciliation`** — one row per order, with a **UNIQUE constraint on `order_reference`**. That constraint is the anti-duplication guarantee: the database will refuse a second reconciliation of the same order, so no amount of re-running can deliver or fulfil twice. States: `CANDIDATE | ALREADY_FULFILLED | RECONCILED | SKIPPED | FAILED`.

**`thylora_fulfillment_reconciliation_candidates`** — a view that surfaces an order only when **all** of these hold: provider is SHOPIFY, entitlement is ACTIVE, `revoked_at` is null, a delivery attempt exists, its state is DELIVERED, and its `failure_reason` is null. It never fulfils on payment; only on **recorded delivery**.

**`thylora_fulfillment_reconciliation_open`** — the same view filtered to orders with no reconciliation row. This is what a scheduled job would read.

## G.3 The safety rules, enforced structurally

| Rule | How it is enforced |
|---|---|
| Never duplicate delivery | The mechanism creates a **Shopify fulfillment record only**. It never touches the entitlement path, never re-grants, never re-sends. Delivery already happened; this is bookkeeping. |
| Never fulfil an undelivered order | The candidate view requires `delivery_attempts.state = 'DELIVERED'` and a null `failure_reason`. Payment alone is not a trigger. |
| Never double-fulfil | UNIQUE constraint on `order_reference`, plus `ALREADY_FULFILLED` as a terminal recorded state. |
| Never send a misleading notification | `notify_customer` defaults to **false** and every call passed `notifyCustomer: false`. Telling a customer something "has shipped" ten days after they received it would be false. |

## G.4 Tested before production use

**Test 1 — idempotency guard.** Order #1004 was fulfilled by hand earlier today, before the mechanism existed. It was recorded as `ALREADY_FULFILLED` carrying its existing fulfillment ID. The candidate view still lists it; the open view does not. **The mechanism declines work already done.**

**Test 2 — first production run.** Orders #1002 and #1003, both $0.00, both with ACTIVE entitlements and DELIVERED attempts dated 2026-09-08, both still reading UNFULFILLED ten days later. Both fulfilled with `notifyCustomer: false`.

| Order | Delivered | Fulfillment created | Result |
|---|---|---|---|
| #1002 | 2026-09-08T20:02:12Z | `gid://shopify/Fulfillment/5586006999117` | SUCCESS, no user errors |
| #1003 | 2026-09-08T19:43:55Z | `gid://shopify/Fulfillment/5586007064653` | SUCCESS, no user errors |

## G.5 Post-run verification

| Check | Result |
|---|---|
| Open candidates remaining | **0** |
| Duplicate order references | **UNIQUE_OK** — none |
| Rows in `RECONCILED` | 2 |
| Rows in `ALREADY_FULFILLED` | 1 |
| Rows with `notify_customer = true` | **0** |
| Shopify: #1001 / #1002 / #1003 / #1004 | **FULFILLED / FULFILLED / FULFILLED / FULFILLED** |

**Every order in the store's history now reports its true delivery state.** The mismatch that made me misreport #1004 as undelivered in the previous run cannot recur silently: the open-candidates view will be non-empty the moment it does.

## G.6 What remains

The view and the guard are live; the **trigger** is not. Something still has to call `fulfillmentCreate` when a new row appears in `thylora_fulfillment_reconciliation_open`. Today that is a manual read-and-call, exactly as executed above. Wiring it to the existing entitlement flow is a small job and needs no approval — it is the last step of H.1 from the previous run.

---

# H. THREE NEAREST BUYABLE OFFERS

Internal production priority only. **No revenue forecast is made.**

## H.1 — The three ready stories: Bramble Wick, City Power, The Last Match

| | |
|---|---|
| **Complete** | Artifacts verified from bytes. Page counts match copy exactly. Prices set ($1.99 / $5.00 / $3.00). Rights clear. Delivery ACTIVE. `requiresShipping` false. Covers approved and now bound. Delivery classification justified as single-file. **A viewable preview exists and opens** (Section D). |
| **Remains** | Two of three interiors not re-rendered into the preview. PDF-on-phone readability still untested. |
| **Chairman decision** | Accept the preview, then authorize activation. Two separate decisions. |
| **Exact next action after approval** | Set status DRAFT → ACTIVE on products `7956697448525`, `7957206892621`, `7957206630477`. One mutation each. Nothing else is required. |

## H.2 — Gap Hunt

| | |
|---|---|
| **Complete** | 9 pages verified. Copy correct at $7.00. Rights clear. Delivery ACTIVE. Cover approved and bound, contradiction closed. Content read and assessed. |
| **Remains** | One fillable answer sheet — the listing already promises "space to answer". Plus the character fix (four instances, E.2) and a per-hunt CHECK line drawn from material the product already contains (E.4). |
| **Chairman decision** | None to unblock the production work. Activation only, once the sheet exists. |
| **Exact next action after approval** | Build the fillable answer sheet, regenerate the PDF with correct dash encoding, re-ingest to `thylora_delivery_assets`, re-verify page count and hash, then activate. |

## H.3 — The $295 Bounded Diagnostic

| | |
|---|---|
| **Complete** | Full product package written last run: title, promise, audience, intake, five deliverables, turnaround, boundaries, refund schedule, fulfillment workflow, delivery format, follow-up, Shopify description, SEO pair, CTA, nine-item FAQ. Price set. Commerce mechanism proven — paid and fulfilled once at exactly $295. |
| **Remains** | Intake form (~2 hours, no approval). SEO fields still null on the product. **Cover: all seven scene-selection fields unresolved, and per sequence 492 generation now also needs same-turn approval.** |
| **Chairman decision** | Seven scene selections; title (keep, or "One Problem, Examined"); authorization to generate; activation. |
| **Exact next action after approval** | Generate the cover under the pass-token rules, bind it through `thylora_visual_assets` as in Section B, write the SEO pair, build the intake form, then activate. |

---

# I. WORK COMPLETED THIS RUN

| # | Work | Evidence |
|---|---|---|
| 1 | **Five cover approvals bound** to exact URL, media ID, product ID and version date, each verified on four independent identifiers before writing | readback confirms each `approved_media_id` matches live `featuredMedia` |
| 2 | **Five approval records created** in `thylora_visual_assets`, closing the structural hole behind the cover-drift defect | `approval_state: approved`, `provenance_state: documented` |
| 3 | **Gap Hunt contradiction closed** — flags true *and* the record now names the file actually bound | B.5 |
| 4 | **Discovered the flags had been flipped without the evidence moving** on all five products, and repaired it | A.2 |
| 5 | **Three PDF interiors extracted and read** from stored bytes — Gap Hunt, Question Deck, Bramble Wick | E |
| 6 | **Character-drop defect found**, located to five exact page references, and **correctly scoped to one generation batch** rather than the whole catalog | E.2 |
| 7 | **Question Deck boilerplate repetition found** — the same two lines on every card | E.3 |
| 8 | **Viewable Chairman preview built** and verified to open at five widths with zero overflow | `storefront/preview/chairman-product-preview-001.html` |
| 9 | **Fulfillment reconciliation mechanism designed, built, tested and run** | G — 0 open candidates, 0 duplicates, 0 notifications |
| 10 | **Orders #1002 and #1003 reconciled**; all four orders now report true state | G.5 |
| 11 | **Storefront preview measured at five widths**, mobile state verified clean rather than assumed | F.5 |
| 12 | **Shop domain discrepancy resolved** — `sracnp-zg` is the same store's internal domain | F.1 |

**Not done, deliberately:** no image generated · no product activated · no theme published · nothing posted · no price changed · The Last Match not given an approval nobody issued · no prompt or question rewritten.

---

# J. BLOCKERS

## J.1 Chairman

| # | Item | Needed |
|---|---|---|
| 1 | Three ready stories | Accept the preview, then authorize activation |
| 2 | Diagnostic cover | Seven scene-selection fields + same-turn generation approval (sequence 492) |
| 3 | Diagnostic title | Keep, or adopt "One Problem, Examined" |
| 4 | C&W duplication | Withdraw *Eight Things Cars* or reposition beneath Vol. 1 |
| 5 | Portfolio clearance | Samples 1, 2, 7 |

## J.2 Production, no approval needed

| Item | Effort |
|---|---|
| Gap Hunt fillable answer sheet | ~2 h |
| Regenerate Gap Hunt + Question Deck with correct dash/apostrophe encoding | ~1 h |
| Question Deck print-and-cut guide, screen version, per-card "Look for" and CHECK lines | ~5 h |
| Build a World fillable worksheets + 4 missing bundle artifacts | ~6 h |
| Verify whether Build a World is in the defective generation batch | ~15 min |
| Wire the reconciliation trigger into the entitlement flow | ~30 min |
| Render City Power and Last Match interiors into the preview | ~40 min |
| SEO fields across the catalog | ~1 h |
| PDF-on-phone readability test | ~20 min |

## J.3 Carried, unresolved

- **Bell Crossing's parent land/region is UNKNOWN** (sequence 494) and must be assigned before any geography-dependent publication.
- **Five storefront lanes navigate nowhere** — they are section blocks, not collections (F.4).
- Several policies remain PARTIAL/PASSIVE per the 494 audit; the single execution router is the named repair.

---

# K. EXACT NEXT ACTION

> **Open `storefront/preview/chairman-product-preview-001.html` and accept, revise, or hold the three ready products.**

| Field | Value |
|---|---|
| Why this one | It is the only thing on the entire list that unblocks three finished products at once, and it costs one look. All three have verified artifacts, correct copy, correct prices, clear rights, active delivery, correct shipping flags and bound covers. Nothing is being built for them any more. |
| What it does | Accepts the preview. Nothing activates, publishes or changes price. |
| Time | Minutes |
| If accepted | Activation becomes a separate one-line decision per product |
| If held | The three stories stay exactly where they are; nothing else is blocked by it |

**And the one thing needing nobody, starting now:** wire the reconciliation trigger into the entitlement flow (G.6). The mechanism is built, tested and proven on three orders; only the automatic call remains, and it is the difference between a repair that holds and one that needs a human every time.

