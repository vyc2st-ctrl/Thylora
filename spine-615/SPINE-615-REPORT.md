# THYLORA HEAD — SPINE FORWARD · FULL SPINE · Pass 615

**Main lane:** help-first global email invitation, and a usable store that can fund and teach practical next steps.
**Phase:** 2 — Full Spine Continuity (inherited under `THY-CONTINUITY-SPINE-610`; not advanced by the Chairman).
**Backend of record:** `thylora-dash` (Supabase `jvsdxhrfhtlgaknhjxlz`). **Store:** `ersatzreality.myshopify.com` (live Admin API).
**Read:** 2026-09-25, 16:00–16:45 UTC. **Truth rule:** UNKNOWN stays UNKNOWN. Nothing was published, activated, emailed, charged or deployed.

---

## 0. What was read first

| Authority / record | State read | Evidence |
|---|---|---|
| Custody head | `thylora_query_carryforward` seq **611** `THY-Q-20260925-SPINE-610-PHASE2-FULL-SPINE-611` (CURRENT). Restart point: "PHASE 2 · RESTART 611 … Chairman rulings first (1)–(6)". | `evidence/carryforward-599-611-raw.json` |
| Custody gap | No carryforward rows for 609, 610, 612, 613, 614. Programs 609, 610, 611 (Silhouette Bus), 612 (Money Router), and the 613 design and 614 rejection on the post row, were written by turns that left no carryforward row. **Not back-filled.** | same |
| THY-CONTINUITY-SPINE-610 | ACTIVE_RULE; math `N = P − F − T − D; N = B + C + A + O + R` | program_registry (read live) |
| THY-GLOBAL-HELP-PATH-608 | DESIGN_ACTIVE_INBOX_CONNECTED_NO_GLOBAL_SERVICE; 0 caseworkers; 0 verified country directories | program_registry |
| THY-GLOBAL-HELP-FIRST-POST-608 | `social_content_queue`: **REJECTED_VISUAL_PRE_RENDER_GATE** — `first_page_design_613` rejected by Chairman (`chairman_rejection_614`) | `evidence/backend-post-social-visual-raw.json` |
| THY-SPONSOR-ACCESS-CREDITS-609 | DESIGN_READY_NO_FUNDS_COLLECTED | program_registry |
| THY-TARGET-MONEY-ROUTER-612 | DESIGN_NOT_AUTONOMOUS_BANK_RUNTIME — "fix incomplete fulfillment before scaling traffic" | program_registry |
| THY-ERSATZ-CREATOR-NETWORK-001 | DESIGN_ACTIVE; portal not built; creator agreement not drafted | program_registry |
| Visual locks | `THY-VISUAL-PREFLIGHT-LOCK-001` and `-002` **LOCKED** (scene contract required) | `evidence/backend-post-social-visual-raw.json` |
| Rights / product readiness | `thylora_store_product_readiness` (5 relevant rows), `thylora_delivery_assets` (5) | `evidence/backend-store-readback-raw.json` |
| Social publication locks | Instagram `SOC-IG-ERSATZ-001` and Facebook `SOC-FB-ENTERPRISE-001`: **PUBLISHING_LOCKED**; Chairman publish freeze ACTIVE | same |
| THY-SILHOUETTE-BUS-611 | PHASE_1_TREATMENT_READY — **film lane; does not supersede the help-first post** (its own metadata says so: "film bus treatment branch only") | program_registry |

---

## 1. Reconciliation of the four ACTIVE store products

### 1.1 The conflict in one line each

| Product | Shopify (live) | Backend record before this pass | Precise conflict |
|---|---|---|---|
| Twelve Miles for Flour | ACTIVE · 2 channels · published 2026-09-08 | ACTIVE, `active_allowed = true`, all gates true | **None.** Record matches reality. |
| Gap Hunt | ACTIVE · 1 channel · **published 2026-09-25 12:59:55Z** | `product_state = DRAFT`, `active_allowed = false`, blocker "NOT BUYABLE: product status on Shopify is DRAFT" | Record says DRAFT and not buyable; the store is live and buyable. The activation has **no backend record** of who or why. |
| Question Deck | ACTIVE · 1 channel · published 12:59:56Z | same as Gap Hunt | same |
| Build a World | ACTIVE · 1 channel · published 12:59:56Z | same as Gap Hunt | same |

Evidence: `evidence/backend-store-readback-raw.json` (backend) and the Shopify Admin API `nodes()` read in this pass (IDs, status, `publishedAt`, `resourcePublicationsCount`, variant `requiresShipping`). The storefront screenshot `evidence/storefront-catalog-20260925.png` shows exactly these four at $19.00, $7.00, $12.00 and $1.99. The Gap Hunt product page returned HTTP 200 with "Add to cart" and no password gate (Firecrawl live fetch).

### 1.2 What each product actually delivers — checked link by link

| Link in the chain | Twelve Miles | Gap Hunt | Question Deck | Build a World |
|---|---|---|---|---|
| Actual deliverable in backend | `3dae3f75…` 4,767 B, 3 pp, **ACTIVE** | `THY-DELIVERY-8658F16FFC521665` 8,644 B, 9 pp, **ACTIVE** | `THY-DELIVERY-0CE19B19BC288F59` 22,594 B, 27 pp, **ACTIVE** | `THY-DELIVERY-589D0EC598F737C1` 10,024 B, 13 pp, **ACTIVE** |
| Re-hashed this pass (SHA-256 = stored) | `9be1fae6…` ✔ | `926a35f1…` ✔ | `64add6c7…` ✔ | `4a0c96e1…` ✔ |
| First PDF page | Not blank. Story text begins. **Defect: title overprints the kicker line** (v1). | Not blank. Title and subtitle; lower 60% empty. | Not blank. Same layout. | Not blank. Same layout. |
| Art inside the PDF | **None** (0 embedded images) | None | None | None |
| Product-specific cover (Shopify) | Painted trail scene, 1122×1402, alt text names placeholder people ("Freight Woman 01, Wagon Hand 01") | Painted stair and map, 1254×1254, Chairman-approved (seq. 495) | Painted card table, 1254×1254, approved (495) | Painted world map, 1254×1254, approved (495) |
| Delivery surface the buyer is told about | "opens in the protected reader" | "download it as a PDF" from the library | same | same |
| That surface exists? | **Yes:** `EDF-TWELVE-MILES-FOR-FLOUR-001` PUBLISHED | **No.** Live library has no download control (below). | **No.** | **No.** |
| Checkout exercised | Yes: orders #1002 ($0), #1003 ($0), #1004 ($1.99) | **0 orders** | **0** | **0** |
| Entitlement → delivery | 3 webhook `ENTITLEMENT_GRANTED` → 3 entitlements → 3 `DELIVERED` attempts | 0 | 0 | 0 |
| Buyer re-access | 3 FIRST_ACCESS + 3 REACCESS in `thylora_entitlement_access_log` (last 2026-09-19 17:23Z) | 0 | 0 | 0 |

Page-1 renders: `evidence/page1/*.png`; montage `evidence/four-products-page1-montage.png`. Files: `evidence/pdf/`.

### 1.3 The defect that decides the classification

The live customer library (`https://thylora-library.vercel.app`, source fetched this pass) draws **one** control:

```js
const control = it.openable
  ? '<button class="primary" data-open="…">Read it</button>'
  : '<span class="meta">' + esc(it.not_openable_reason || 'Not available to open yet.') + '</span>';
```

`openable` is true only when a **published EDF reader package** exists. Only Twelve Miles has one. The backend function `thylora_customer_library_v1` already returns `download_available` and a `download` object for any product with an ACTIVE file, and the server function `thylora-protected-download` (v2) will serve it. **The page never uses them.** Someone who buys Gap Hunt today would sign in and read: *"No EDF package exists for this product yet"* — with no way to get the PDF they paid for.

Supporting facts: `thylora_product_download_audit` holds **0 rows** system-wide, so no protected download has ever been served to anyone. The same failure was recorded on 2026-09-17 in `products/store/GAP-HUNT-VERIFICATION-001.md` (branch `claude/thylora-product-pipeline-pv9kir`), step 5: "Library visibly presents the correct control — FAIL". Nothing fixed it before the 12:59 activation.

### 1.4 Classification

| Product | Class | Money line (beside the words) |
|---|---|---|
| **Twelve Miles for Flour** | **ACTIVE / DELIVERED** — delivered through the reader, re-access witnessed; buyers are the owner's own accounts, so no outside customer is evidenced | Order #1004: $1.99 − $0.36 fee − $0.00 tax − $0.00 delivery = **N = $1.63** (OBSERVED). N = B + C + A + O + R: **no split recorded**. |
| **Gap Hunt** | **ACTIVE / DELIVERY UNVERIFIED** — and by code inspection, **delivery would fail in the live library** | $7.00 − $0.50 − T − $0.00 = **N = $6.50 − T** (ESTIMATED at 2.9% + $0.30; no sale) |
| **Question Deck** | **ACTIVE / DELIVERY UNVERIFIED** — same defect | $12.00 − $0.65 − T − $0.00 = **N = $11.35 − T** (ESTIMATED) |
| **Build a World** | **ACTIVE / DELIVERY UNVERIFIED** — same defect | $19.00 − $0.85 − T − $0.00 = **N = $18.15 − T** (ESTIMATED) |

"ACTIVE" here only means the listing is live. It does not mean a buyer has received anything.

### 1.5 Corrections written (real evidence only)

| # | Record | Change | Kept | Evidence for the change |
|---|---|---|---|---|
| C1 | readiness `e036c1ea…` Gap Hunt | `product_state` DRAFT → **ACTIVE**. Stale blocker marked **SUPERSEDED** (text preserved). New blockers: activation unwitnessed; library cannot deliver; download never exercised; checkout never exercised. | `active_allowed = false` (no authorization on record); re-access, checkout and mobile flags stay false; Shopify untouched. All prior values stored in `evidence.reconciliation_615.prior_*`. | Admin API read; storefront HTTP 200; library source; 0 audit rows |
| C2 | readiness `f7e82a47…` Question Deck | same as C1 | same | same |
| C3 | readiness `b156a034…` Build a World | same as C1 | same | same |
| C4 | readiness `9bb67797…` Twelve Miles | Annotation only: `evidence.reconciliation_615` (ACTIVE / DELIVERED with limits) | Every field | orders, webhook, entitlements, access log |

**Not done, on purpose:** no product was set back to DRAFT and none was left "approved". Reversing a possibly Chairman-made activation is a Chairman decision; it stays open as ruling R1 (§6.6).

### 1.6 The fix, prepared and tested — not deployed

`library-fix/index.html` (patch: `library-fix/download-control.patch`, 73 lines) adds a **Download PDF** button wherever the backend reports `download_available`. It sends the signed-in session token to `thylora-protected-download` and saves the file. Read it stays for reader products. Products with neither surface still show the reason.

- Test: `library-fix/test_download_control.py` runs in Chromium against a mocked backend. **PASS.** Twelve Miles shows [Read it, Download PDF]; Gap Hunt shows [Download PDF]; a file-less product shows "No ACTIVE delivery asset…"; the click calls the endpoint once with `Bearer <token>` and saves `THYLORA-Gap-Hunt-21.pdf`.
- Base: `library-fix/index.repo-source-0804770.html` (branch `claude/thylora-continuity-floor-repair-humhtd`, commit `0804770`). **The live page is an older build**: it also lacks that commit's visit-label fix.
- **Deploy authority is outside this session.** The Vercel project for `thylora-library.vercel.app` was not identified, and `DASHBOARD_AUTHORITY.md` reserves deploy decisions. Until it is deployed and one real purchase is witnessed, the three products remain ACTIVE / DELIVERY UNVERIFIED.

### 1.7 Twelve Miles — the history the product already carries

In canon, Seezin is a Black Southern trailman. That places the story inside one of the most thinly remembered parts of the American West. **Evidence:** Durham & Jones, *The Negro Cowboys* (1965), estimated that more than 5,000 of roughly 35,000 trail hands on the post–Civil War cattle drives were Black, about **one in seven**. Later historians and museum accounts often give a higher figure, up to **one in four**. **Counterargument:** both figures are estimates built from fragmentary crew rosters, memoirs and census entries. "One in four" is usually repeated without its source or caveats, so it should be shown as a range, not a fact. **Context:** even the lower estimate is far above the near-zero presence of Black cowboys in 20th-century film and textbook images of the West. That gap between record and popular memory is itself documented, not assumed. The story text never says any of this. Whether v2 should is Chairman ruling R6 (§6.6), together with the Uncle/Unkle spelling and the placeholder names in the cover alt text.

---

## 2. Next help-first product batch

**Source:** the Chairman's own words, sequences 599–608 (`evidence/carryforward-599-611-raw.json`). Every interior quotes its source line.
**Rule applied:** each interior opens on page 1 with meaningful wording and a **reserved painted plate**. Per rejection 614, no image was generated. Each plate names a scene contract in `batch/SCENE-CONTRACTS.md`.
**Nothing listed.** No Shopify record was created or changed. Checked for duplicates first: none exist for items 1–5, and item 6 builds on an existing draft.
**Fee rule:** F = 2.9% × P + $0.30 (the rate recorded on order #1004).

| # | Item | Customer-facing material | Opens with | Source (Chairman words) | Rights record | Price | Money line | Delivery route | Preview | Exact blocker |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **Help Me Post This** | `batch/pdf/help-me-post-this.pdf` (6 pp): six-question gap check, rewrite pattern with a labelled invented example, public-safety table, optional send-to-us | Title, promise, plate SC-615-01 | 605 "give you a better way to post that"; 606 "doubt remover"; 608 "help them with their post" | Original ErsatzReality × THYLORA text; example person invented and labelled; no likeness | **PROPOSED $0 — free** | P = $0 → N = $0. Nothing to split. | Free file: open download page (does not exist yet) **or** library at $0 (checkout path proven by orders #1002/#1003) | `batch/preview/help-me-post-this-p1.png` | Plate art (SC-615-01 approval); a paid review service does not exist and is not offered |
| 2 | **Help Me Sell This** | `batch/pdf/help-me-sell-this.pdf` (6 pp): can/can't table, intake, proof of ownership, price table, **blank** split sheet, idea-credit clause, consent, 14-day cooling-off, signatures | Title, promise, plate SC-615-02 | 608 "put their stuff in our store … work out a deal"; 602 "Joey's corner" idea credit | Creator keeps ownership; non-exclusive digital licence; withdrawal right | **PROPOSED $0 to apply**; creator sets their own price | Example table only: $10.00 → F $0.59 → **$9.41 − T**; split left **blank** by design | Intake by email → signed agreement → creator's own product and delivery asset → shared path | `…/help-me-sell-this-p1.png` | No payout processor; creator agreement needs legal review; benefits-impact review for low-income creators; plate art |
| 3 | **Money Path Map** | `batch/pdf/money-path-map.pdf` (5 pp): both lines, the five gap positions, **"I need $10" worked from the store's own record**, blank map, four questions for any "proceeds" promise | Title, promise, plate SC-615-03 | 599 gap positions SIGNAL/BLOCK/BUFFER/BRIDGE/BRANCH; 608 "how is that money gonna be allocated … is there a ceiling?"; 609 "one dollar stays one dollar" | Original; worked numbers from order #1004 | **PROPOSED $3.00** | $3.00 − $0.39 − T − $0 = **N = $2.61 − T** | Shared library path (file) — **needs the library fix** | `…/money-path-map-p1.png` | Plate art; library download fix; price authorization; department name "Treasury Path Office" is PROPOSED |
| 4 | **School Question Pack** | `batch/pdf/school-question-pack.pdf` (5 pp): KNOWN/INFERENCE/UNKNOWN/CONTRADICTION sort, next-question ladder, exchange format, reading an equation as a sentence, "count your own dance", exit tickets | Title, promise, plate SC-615-04 | 600 Kealorp curriculum; 601 Position Mathematics; 602 school-equation translations; 604 next-question inheritance; 608 "it's an exchange … what's your next question", the dance game | Original; single-teacher licence; no student data | **PROPOSED $5.00** (single teacher) | $5.00 − $0.45 − T − $0 = **N = $4.55 − T** | Shared library path — needs the library fix | `…/school-question-pack-p1.png` | Plate art (minors: painted figures only); classroom licence text; library fix |
| 5 | **Local Help Route Worksheet** | `batch/pdf/local-help-route-worksheet.pdf` (5 pp): emergency numbers by country (with a check-your-own note), route card with *source* and *date checked* columns, questions for any door, medical-bill assistance question, tonight/week/month, writing to us | Title, promise, plate SC-615-05 | 606 medical bill help ("they qualify for some fund"), links broken down; 608 "not everybody is 211", any country, email | Original; factual claims: 911/112/999/000/111; 211 in US and Canada; US non-profit hospitals must keep a written financial assistance policy | **FREE — $0, never sold to a person in need** | P = $0 → N = $0 | Open free download (page does not exist yet) | `…/local-help-route-worksheet-p1.png` | Plate art; free-download page; 0 verified country directories (the worksheet works without them, but no filled city edition exists) |
| 6 | **Celebration Card Studio** (birthday/family) — existing Shopify draft `gid://shopify/Product/7965307961421` | `batch/pdf/celebration-card-studio-interior.pdf` (3 pp): sample front with [Name] and the customer's message, inside openings, **proof-approval sheet — nothing delivered until approved**, consent | Title "Happy Birthday, [Name]", plate SC-615-06 | 611 batch item 1 ("birthday and family message cards") | Customer supplies names and words under the consent line; no photos or likenesses in this version | **AUTHORIZED $9.99** (tag `PRICE-AUTHORIZED` on the existing record) | $9.99 − $0.59 − T − $0 = **N = $9.40 − T** | **Does not exist:** submit → proof → customer approval → deliver. The record stays DRAFT, NOT-OPEN-FOR-ORDERS. | `…/celebration-card-studio-interior-p1.png` | Personalized order path; no customer yet, so "customer-approved" cannot be true until a real customer approves a real proof |

Opening pages together: `batch/batch-opening-pages-montage.png`. Builder: `batch/build_batch.py` (DejaVu/Liberation embedded fonts, so the earlier WinAnsi defect class cannot recur).

**Not claimed:** no partner allocation (A = 0 everywhere; no partner exists), no creator split, no listing.

---

## 3. First help post

Full package: **`first-post/CHAIRMAN-REVIEW-PACKAGE.md`**. Summary:

- **Read:** caption 608 verbatim (`first-post/caption-608-verbatim.txt`). The painted first-page preview 613 could not be opened: its file is in another session's scratch space. Its backend description was read, along with its **rejection (614)**.
- **Checks:** email spelled identically in all 15 occurrences, but a trailing period makes copying risky (E1). v1 still unreadable on a phone; **v2 readable** (`first-post-still-v2-phone-390.png`). The 613 math line implied a fund; v2 shows the help route and "Replies are free", and the caption gains `P = $0, N = $0` (E3). Privacy statement missing; drafted (E2) for adoption. Literal Markdown asterisks removed (E4). Country invitation is correct but capacity is unproven. **Duplicate-post risk HIGH** (597/604 doctor post never validly superseded; a Facebook post published 09-17). World-name spelling is UNKNOWN.
- **Still:** v2 type-only (`first-post/first-post-still-v2.png`) **or** painted after SC-615-07 approval.
- **Account:** Instagram `ersatz.reality` is the best candidate (account CONNECTED_VERIFIED; channel PUBLISHING_LOCKED; freeze ACTIVE). Facebook page identity is unproven.
- **Gate:** eight items, `CHAIRMAN-REVIEW-PACKAGE.md` §7. **NOT PUBLISHED.**

---

## 4. Money router — "I need $10"

Rules (program 612): `net_i = price_i − fees_i − tax_i − delivery_i − agreed shares_i − refunds_i`; required count `n = ceil(target ÷ net_i)`; money counts as available only when a payout has settled.

| Route i | Available now? | price | fees | tax | delivery | shares | refunds | **net_i** | n for $10 | Label |
|---|---|---|---|---|---|---|---|---|---|---|
| Twelve Miles, $1.99 | **Yes — delivery verified** | 1.99 | 0.36 | 0.00 | 0.00 | 0.00 (none agreed) | 0.00 (0 of 4 orders refunded) | **1.63** | **7** | OBSERVED (order #1004) |
| Gap Hunt, $7 | Listed, but **the buyer cannot download** | 7.00 | 0.50 | T | 0.00 | 0.00 | UNKNOWN | **6.50 − T** | 2 | ESTIMATED |
| Question Deck, $12 | Same defect | 12.00 | 0.65 | T | 0.00 | 0.00 | UNKNOWN | **11.35 − T** | 1 | ESTIMATED |
| Build a World, $19 | Same defect | 19.00 | 0.85 | T | 0.00 | 0.00 | UNKNOWN | **18.15 − T** | 1 | ESTIMATED |
| $1 Money Path Card | **No** — DRAFT, asset HELD | 1.00 | 0.33 | T | 0.00 | 0.00 | — | 0.67 − T | 15 | ESTIMATED |
| Authorized paid services | **None active** (the $295 reading is DRAFT) | — | — | — | — | — | — | — | — | OBSERVED |
| Willing buyers | **None recorded** outside the owner's accounts | | | | | | | | | UNKNOWN |
| Sponsors | **None**; no agreement | | | | | | | | | OBSERVED (program 609) |

**Timing:**

| Question | Answer | Label |
|---|---|---|
| Payout schedule | Could not be read: the connector lacks `read_shopify_payments` | UNKNOWN |
| Current balance | Not read | UNKNOWN |
| Last payout | Not read | UNKNOWN |
| Time from sale to bank | Not known for this account | UNKNOWN |

**Honest answer to "I need $10":**

1. **Delivery is the gate.** The only product a stranger can buy *and* receive today is Twelve Miles: 7 real buyers × $1.63 = $11.41 − T. No such buyers are on record.
2. **The best route:** deploy the library fix, run one witnessed Gap Hunt purchase, then 2 sales × $6.50 = **$13.00 − T**, or 1 Question Deck sale = **$11.35 − T**. This route sends people to a product that currently fails delivery, so it opens only after the fix is witnessed.
3. **No dollar amount is promised in a bank account.** No payout has been read, and no settlement has been observed for any order in this pass.

`batch/pdf/money-path-map.pdf` p.3 shows this same worked example to customers.

---

## 5. Sponsor, creator, beneficiary and partner terms; buyer welcome; Kisha

### 5.1 Sponsor terms — v2 of the Phase-2 draft

The Phase-2 draft is `spine-610/report-parts/70-sponsor-pilot-post.md` §7 (preserved). v2 changes only:

| # | Change from Phase 2 | Why |
|---|---|---|
| S1 | Add: "A sponsor bundle creates no discount or share for the sponsor's own staff and no advertising placement unless separately written." | Stops sponsorship being read as undisclosed advertising |
| S2 | Add: "Credit is redeemable only for items classified **ACTIVE / DELIVERED**." | §1 shows ACTIVE ≠ delivered. Today that is Twelve Miles only. |
| S3 | Split table: A (approved partner) stays **0% and unallocated** until a named partner signs. The Phase-2 10% is held in the pool and reported, never moved to O. | No partner exists; no invented allocation |
| S4 | Add: the monthly report shows OBSERVED / ESTIMATED / UNKNOWN beside every figure | Same truth labels as the router |

Money line, one $100 bundle by card: $100.00 − $3.20 − T − $0 = **N = $96.80 − T**, then N = B + C + A + O + R at PROPOSED shares (B 70% · C 0% · A 0% held · O 12% · R 8% · unallocated 10%). **Not approved. No money requested or collected.** No charitable or tax status is claimed: a sponsor payment is a commercial purchase of access credit.

### 5.2 Creator terms

Printed in full on pp. 5–6 of `batch/pdf/help-me-sell-this.pdf`: ownership stays with the creator; non-exclusive digital licence for the approved version only; withdrawal at any time (completed sales stay valid); fees shown before signing; 14-day cooling-off; split written per creator before the first sale; idea credit agreed in advance. **Blockers:** payout processor; legal review.

### 5.3 Beneficiary terms

The Phase-2 consent (§7.2) stands. The partner reads it; THYLORA stores only code, region, language and consent date. Added: **help is never conditional on a story, post, thank-you or unpaid work** (also printed on the Local Help Route Worksheet p.5).

### 5.4 Partner terms (draft)

A partner:

- is a named organization that agrees in writing;
- reads the beneficiary consent aloud or in writing;
- sends THYLORA only code, region, language and consent date;
- keeps its own client records;
- is paid A only at a rate written before any bundle is sold;
- can be removed with 30 days' notice, with outstanding credit honoured.

**No partner exists.**

### 5.5 Buyer's optional welcome and simulated-maker thank-you

The welcome screen already exists as a draft: `spine-610/twelve-miles/welcome.html` (not deployed).

- The thank-you appears **only if the buyer taps "Yes, show me."**
- It is labelled **SIMULATED**, and its disclosure reads: *"This note is written in the voice of a character from our story world. No real person wrote it to you, and it was not generated from anything about you."*

The same pattern applies to every batch item that later gets a character voice. Nothing is shown by default.

### 5.6 Buyer information

**Default: nothing is shared with any maker, sponsor or partner.**

| Scope | What it releases | Condition |
|---|---|---|
| Scope 1 | The buyer's first name and country go to the maker, for a thank-you | Separate opt-in checkbox, off by default |
| Scope 2 | Nothing else | Email, full name and order details are never shared |

Opt-in can be withdrawn by email, and the record is deleted. Sponsors see only aggregate counts. No buyer information was shared in this pass.

### 5.7 The $1 Kisha invitation

**PENDING — no invitation record exists.**

- **Searched:** every carryforward row mentioning Kisha or Lakisha (seq. 9, 135, 296, 351) and the $1 pilot records.
- **Found:** Kisha appears only in family and program design (`THY-FAMILY-BUSINESS-MIRROR-001`: "Kisha — Baltimore-area salon operating track … INVITATION_DESIGN"). The $1 readiness row carries `lakisha_pilot = PENDING - invitation record not located in backend`.
- **Not done:** no invitation drafted or sent, no payment, no celebration, no history entry. Her family records were not read further or changed.
- **Needed from the Chairman:** the wording, and what she is invited to do (buy the $1 card, test it free, or something else).

---

## 6. Full-spine evidence

### 6.1 Every request, itemized

| # | Request (source words) | Done? | Where / evidence |
|---|---|---|---|
| 1a | Read backend and retrieve head, 610, 608, 608 post + 613, 609, 612, creator network, locks | Done | §0 |
| 1b | Use the live Shopify catalog as evidence | Done | Admin API reads; `evidence/storefront-catalog-20260925.png` |
| 1c | Inspect each deliverable, first page, cover, file link, checkout delivery, re-access | Done | §1.2; `evidence/pdf/`, `evidence/page1/` |
| 1d | Identify the precise conflict in each record | Done | §1.1 |
| 1e | Correct stale records only with real evidence | Done (C1–C4) | §1.5 |
| 1f | Do not equate ACTIVE with delivered | Done | §1.4: three ACTIVE / DELIVERY UNVERIFIED |
| 1g | Report each item as ACTIVE/DELIVERED, ACTIVE/DELIVERY UNVERIFIED, DRAFT or BLOCKED | Done | §1.4 |
| 2a | Build Help Me Post This, Help Me Sell This, Money Path Map, School Question Pack, Local Help Route Worksheet, customer-approved card | Done as drafts | §2; `batch/pdf/` |
| 2b | Reuse approved material from 600 onward; read the source | Done | §2 "Source" column |
| 2c | Each interior opens to meaningful art and wording | **Wording: done. Art: blocked** by rejection 614. Plates reserved; contracts presented. | `batch/SCENE-CONTRACTS.md` |
| 2d | Material, rights/source, price PROPOSED/AUTHORIZED, delivery route, preview | Done | §2 table |
| 2e | Do not publish incomplete items; no invented partner allocations | Done | Nothing listed; A = 0 |
| 3a | Read caption and painted preview | Caption done. Preview image **unreadable** (other session's scratch); its record and its **rejection** were read. | §3 |
| 3b | Email, small screen, math, alt text, platform, country, privacy, duplicate risk | Done | package §3–§4 |
| 3c | Final still-plus-caption package | Done | `first-post/` |
| 3d | Verified account and exact gate | Done | package §6–§7 |
| 3e | Do not publish | Done: not published | — |
| 4 | Money router for "$10" with net_i, OBSERVED/ESTIMATED/UNKNOWN, no promised bank amount | Done | §4 |
| 5 | Sponsor, creator, beneficiary, partner terms; optional welcome; simulated thank-you; scoped consent; Kisha pending | Done as drafts | §5 |
| 6 | Itemize; equations beside words; evidence; changes; unresolved; publication state; phase; one restart | Done | §6 |
| — | Film lane kept separate | Done | §0: THY-SILHOUETTE-BUS-611 untouched and not in this lane |

### 6.2 Every write made this pass

| # | System | Write | Reversible |
|---|---|---|---|
| W1–W3 | Backend | Readiness C1–C3 (three products; prior values preserved in-row) | Yes (prior values stored) |
| W4 | Backend | Readiness C4 annotation (Twelve Miles) | Yes |
| W5 | Backend | `social_content_queue` post row: appended `publish_evidence.review_package_615` pointer (no state change) | Yes |
| W6 | Backend | `thylora_query_carryforward` seq **615**, verbatim-locked, with this restart point | Yes |
| W7 | Git | Folder `spine-615/` on branch `claude/thylora-store-reconciliation-cjjoxi` (Phase-2 `spine-610/` merged in unchanged) | Yes |

**Untouched:**

- Every Shopify product: no status, price, media or channel changed.
- The library deployment.
- Every social channel.
- The $1 card (still DRAFT/HELD).
- All family records.
- THY-SILHOUETTE-BUS-611.

### 6.3 Unresolved

| # | Item | Owner |
|---|---|---|
| U1 | Three products are live and **cannot deliver** in the live library | Chairman (R1) + whoever deploys the library |
| U2 | 12:59 activation has no record of who or why | Chairman |
| U3 | No outside customer has ever bought | — |
| U4 | Payout schedule and balance UNKNOWN (connector scope) | Chairman (grant scope or read in Shopify admin) |
| U5 | All six batch plates wait on scene-contract approval | Chairman |
| U6 | First-post canon (597/604 vs 608), spelling, privacy adoption, inbox staffing, account unlock | Chairman |
| U7 | Kisha invitation wording | Chairman |
| U8 | Carryforward rows missing for 609, 610, 612, 613, 614 | Chairman (supply or accept the gap) |
| U9 | Twelve Miles v1 defects: title overprint, Uncle/Unkle, placeholder alt names | Chairman (R6) |
| U10 | No payout processor for creators; no sponsor; no partner | Chairman + qualified review |

### 6.4 Publication state

| Item | State |
|---|---|
| First help post | NOT PUBLISHED |
| Social posts | None made |
| Store items | Nothing listed or activated |
| Emails | None sent |
| Money | None collected |
| Library fix | NOT DEPLOYED |

### 6.5 Current phase

**Phase 2 — Full Spine Continuity** (THY-CONTINUITY-SPINE-610; not advanced).

### 6.6 Chairman rulings, in order

- **R1.** Keep Gap Hunt, Question Deck and Build a World ACTIVE and deploy the download fix, **or** return them to DRAFT until it is deployed.
- **R2.** Name the canonical first post.
- **R3.** Approve still v2, or approve SC-615-07.
- **R4.** Approve the caption edits E1–E4 and the spelling.
- **R5.** Approve scene contracts SC-615-01…06.
- **R6.** Twelve Miles v2 yes/no, the Uncle/Unkle spelling, and whether v2 names Seezin's history.
- **R7.** The Kisha invitation wording.

### 6.7 What the Chairman may be missing

1. **Money can be taken today for files a buyer cannot get.** Three live listings promise a PDF download, and the live library has no download button. The first stranger to buy Gap Hunt would pay $7 and see "No EDF package exists."
2. **The fix is small and ready.** One page and one button, tested. What remains is deciding who deploys it and witnessing one real purchase.
3. **"ACTIVE" in Shopify and "ready" in the backend are separate switches.** Someone flipped the Shopify one at 12:59 without the backend. Until the store's changes write back to the backend, this can happen again.
4. **The rejected 613 image and the rule it created cover every product plate.** That is why all six batch items open with an empty plate and a contract, not a painting.
5. **The two spellings of the world's name** will become a public inconsistency with the first post.

### 6.8 ONE exact restart point

> **PHASE 2 · RESTART 615.** Read `spine-615/SPINE-615-REPORT.md` §6.6 on branch `claude/thylora-store-reconciliation-cjjoxi`, then get Chairman ruling **R1** first (keep the three products ACTIVE and deploy `spine-615/library-fix/index.html`, or return them to DRAFT). Backend pointer: `thylora_query_carryforward.sequence_no = 615`.
