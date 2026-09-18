# Fresh Store Slate — Chairman Release Board

**2026-09-18** · Agent: CLAUDE · Workstream: STORE_BACKEND · Purpose: FRESH_STORE_SLATE
**Custody:** `THY-Q-20260918-CLAUDE-FRESH-STORE-SLATE-466` (seq 466)
**Handoff:** `THY-HANDOFF-STORE-CHATGPT-20260918-013` · **Restart:** `THY-RESTART-20260918-FRESH-STORE-SLATE-001`

**NOT ACTIVATED. NOT PUBLISHED. NOT SCHEDULED.** Zero Shopify records modified. Zero gate flags
moved. Zero fake readiness rows created.

---

## The problem, stated as a number

The storefront reads as one product because **it is one product: 1 ACTIVE, 224 DRAFT.**

Six products are a single approval from changing that, and they span six different lanes at
$1.99 to $19.00 — method, reasoning, family, science, bedtime, leadership. **Releasing those six
is the fix.** Nothing else on this board moves the needle as much.

---

## The three shelves

Created in `thylora_store_shelves`, all `BLOCKED`.

| Shelf | Items | Entry rule |
|---|---|---|
| `RELEASE_AVAILABLE_SOON` | 6 | Artifact byte-verified, rights passed, delivery route proven. Only a decision or one bounded copy step remains. |
| `RELEASE_DEVELOPMENT` | 5 | A real artifact or built preview exists and is hash-identified, but a named gate is open. |
| `RELEASE_WORLD_EXPANSION` | 2 | Designed and sequenced, expands an existing IP tree, reuses a proven architecture — **no artifact yet.** |

**Two things to know about these shelves.**

1. **They are a release-stage layer, not a new category system.** The ten existing shelves
   (`FRESHPATH_HOUSEHOLD` … `HERB_PLANT_FILE`) answer *what is it*. These three answer *how close
   is it*. A product may sit on one of each.
2. **Axis note, raised rather than hidden:** both layers now live in one table and share one
   `sort_order`. That is a mixed taxonomy and a dashboard-rendering decision you should make.
   All three were created `BLOCKED` because the table's CHECK constraint allows only
   `EMPTY/STOCKED/BLOCKED/RETIRED` — there is no `PROPOSED` value — so proposed-not-approved
   status is carried in `state_reason`.

---

## What I verified rather than accepted

The six Edition v2 artifacts were built in an earlier pass. I re-verified them independently
against the repo: **every recorded sha256 and byte count matches exactly**, and I counted the
pages out of the bytes.

| Product | v1 → v2 pages | v2 bytes | v2 sha256 (first 16) | Recorded value |
|---|---|---|---|---|
| Bramble Wick | 3 → **9** | 4,457,406 | `abbeafb32570abc3` | ✅ confirmed |
| Build a World | 13 → **15** | 2,559,819 | `39185610c576b5e1` | ✅ confirmed |
| City Power | 6 → **8** | 2,577,970 | `7c0b5fac19ac9398` | ✅ confirmed |
| The Handoff | 6 → **8** | 3,369,099 | `c8cc9260646a3c80` | ✅ confirmed |
| The Last Match | 6 → **8** | 4,454,317 | `1aa4e10577fb4618` | ✅ confirmed |
| Question Deck | 27 → **19** | 3,264,161 | `ab86a85efbe88e22` | ✅ confirmed |

The v2 binaries are **not** in `thylora_delivery_assets` — 2.5–4.5 MB each, held in the repo
pending your visual approval.

---

## The twelve, ranked

`STORE_PRIORITY = READINESS × DISTINCTIVENESS × CUSTOMER_VALUE × WORLD_CONNECTION × REUSE_POTENTIAL`,
each factor 1–5. **READINESS 5 means artifact byte-verified AND rights passed AND delivery route
proven AND only a decision or one bounded copy step remaining. It never means activated.**

Full dossiers — exact asset state, what the buyer receives, price, visual requirement, rights,
delivery, remaining work, time-to-release class, cross-sell, show/story relationship, IP-tree
expansion — are in `thylora_store_product_readiness.evidence → fresh_slate_candidate_2026_09_18`.

### AVAILABLE SOON

| # | Product | Score | Price | Class | Remaining |
|---|---|---|---|---|---|
| 1 | **Build a World From One Idea** | **3125** | $19.00 | T0 | Approve v2 · fix "13-page"→15 · ingest · publish decision |
| 2 | **THYLORA Question Deck** | **1875** | $12.00 | T0 | Approve v2 · fix "27-page"→**19** · ingest · publish decision |
| 3 | The Last Match | 1280 | $3.00 | T0 | Approve v2 · fix "6-page"→8 · ingest · publish decision |
| 4 | The City That Needed More Power | 1280 | $5.00 | T0 | Approve v2 · fix "6-page"→8 · ingest · publish decision |
| 5 | Bramble Wick | 1200 | $1.99 | T0 | Approve v2 · fix "3-page"→9 · ingest · publish decision |
| 6 | The Handoff | 960 | $7.00 | T0 | Approve v2 · fix "6-page"→8 · ingest · publish decision |

**Build a World scores highest on every factor** — it is the only product that is simultaneously
the most valuable ($19), the most distinctive (the method THYLORA uses on itself), the most
world-connected (every EdereAriah product is downstream of it) and the most reusable. It is the
right flagship.

**Bramble Wick at $1.99 is the store's front door** — the cheapest thing on the shelf and the
obvious first purchase for a cold visitor.

### DEVELOPMENT

| # | Product | Score | Price | Class | Open gate |
|---|---|---|---|---|---|
| 7 | HERB FILE 001 — Willow | 800 | $5.00 **PROPOSED** | T2 | Claims gate not in force · no artifact · rights open |
| 8 | THYLORA Gap Hunt | 768 | $7.00 | T1 | **Visual-flag contradiction — see below** |
| 9 | C&W Vehicle Civilization Vol. 1 | 640 | $29.00 **recommendation only** | T2 | Cover locked · `requiresShipping` defect · price unconfirmed |
| 10 | Eight Things Cars Still Get Wrong | 324 | $9.00 | T2 | Blocked by decision, not work: positioning vs Vol. 1 |
| — | **HOLD** — Trail Table No. 001 Rain-Side Beans | *(800)* | $2.00 | **HOLD** | `rights_passed=false` — hard failure |

**Trail Table would rank 7th on score.** The formula's own rule forces HOLD on a rights hard
failure regardless of score, so it is shown as HOLD rather than ranked. Old Jaro attribution
preserved unchanged.

**Eight Things at $9.00 for 4 pages is the thinnest value ratio on the shelf** — worth weighing in
the positioning decision against Vol. 1.

### WORLD EXPANSION

| # | Product | Score | Class | Note |
|---|---|---|---|---|
| 11 | The Four Registers — working card deck | 400 | T3 | Reuses the Question Deck card architecture directly; natural bundle partner for every Herb File |
| 12 | HERB FILE 002 — Kola | 320 | T3 | Ranked second in the File 001 selection (S=1280), held deliberately for slot 2 |

**Neither has a readiness row, and I did not create one.** They have no artifact; a row would be
fake readiness. They live in the shelf assignments and in `products/herb-file/shelf-expansion.md`.

Also sequenced there, beyond the twelve: Herb File 003 Cinchona, 004 Meadowsweet (the deliberate
pair with Willow), and the Files 001–006 bound collection at $19.00.

---

## Check this first — it is the cheapest item on the board

**THYLORA Gap Hunt has a cover bound on Shopify** — `thylora-gap-hunt-approved-cover.png`, the
same `approved-cover` naming convention as the four covers on products whose visual gates read
**true**. Yet its row carries `product_specific_visual_complete=false` and
`visual_preflight_passed=false`.

Either the flags are stale and Gap Hunt is one decision from release, or the cover was bound
without passing preflight and the filename overstates its status.

**I did not change the flags and did not raise its score.** Resolving this one question decides
whether Gap Hunt is T0 or T1 — and may hand you a **seventh** near-term product for the cost of
one look.

---

## Blocking any activation, regardless of approval

1. **The page-count claim in all six Shopify descriptions is now wrong.** Five understate.
   **Question Deck overstates** — it promises 27 pages and the v2 artifact has 19. Correct the copy
   before activation or the listing becomes an untrue claim.
2. **C&W Vol. 1 still has `requiresShipping = true`** on a digital PDF (variant
   `43797278785613`). It must not activate before that is fixed.
3. **`THY-BOTANICAL-CLAIMS-GATE-001` is `DRAFT_INTERNAL` and not in force**, blocking the Herb shelf.

---

## Chairman decisions required

1. **Approve the six Edition v2 previews**, or reject with direction. This gates the whole
   Available Soon shelf.
2. **Approve, rename or reject the three release-stage shelves** — and decide whether they render
   as a layer separate from the ten category shelves.
3. **Herb File 001:** approve the shelf, confirm willow over kola, approve the claims-gate text,
   confirm $5.00 and 16 pages.
4. **C&W Vol. 1 vs Eight Things** positioning, and confirm or change the $29.00 recommendation.
5. **Trail Table:** clear the recipe/story rights and the EdereAriah canon check to lift the HOLD.

## Exact next action

Resolve the Gap Hunt visual-flag contradiction, then put the six Edition v2 previews in front of
the Chairman, correct the six page-count claims, ingest the v2 binaries as version 2 — and only
then consider the publish decision.
