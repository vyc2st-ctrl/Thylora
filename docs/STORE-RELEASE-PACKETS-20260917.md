# Chairman Release Packets — 2026-09-17

**Agent:** CLAUDE · **Workstream:** STORE_BACKEND · **Prompt purpose:** RELEASE_PACKET_PASS
**Custody:** `THY-Q-20260917-CLAUDE-RELEASE-PACKET-PASS-451` (sequence 451)
**Handoff:** `THY-HANDOFF-STORE-CHATGPT-20260917-012`
**Restart:** `THY-RESTART-20260917-RELEASE-PACKETS-001`

**NO PUBLICATION. NO ACTIVATION. NO SCHEDULING.** Zero Shopify records modified. Zero gate flags
moved. Re-verified after the pass: all nine products still `DRAFT`, all with zero sales-channel
publications and `onlineStoreUrl: null`.

Every field below was re-read live on 2026-09-17 from **both** Supabase (`thylora-dash`) and the
**Shopify Admin API** (`ersatzreality`). The machine-readable copy of each packet lives in
`thylora_store_product_readiness.evidence -> chairman_release_packet_2026_09_17`.

---

## Read this first: a backend defect was found and repaired

The custody write required by the backend-first protocol **failed on its first attempt**:

```
ERROR: function digest(bytea, unknown) does not exist
CONTEXT: thylora_capture_query_pair ... v_user_hash := encode(digest(convert_to(p_user_message,'UTF8'),'sha256'),'hex')
```

**Root cause:** `pgcrypto` is installed in schema `extensions`, but `thylora_capture_query_pair`
and `thylora_complete_query_pair` were pinned to `search_path=public`, so `digest()` could not
resolve. **Until this was repaired, the continuity custody path could not capture anything** — the
backend-first protocol was itself broken.

**Repair applied:** `set search_path = public, extensions` on both functions. No function body was
changed. The capture then succeeded at sequence 451.

**Suspect but unproven — not touched:** five further functions reference pgcrypto symbols without
`extensions` on their search_path. `claim_thylora_dashboard_identity_invite_v1`,
`issue_thylora_dashboard_identity_invite_v1`, `thylora_first_sale_chain_v1`,
`thylora_webhook_health_v1`, `thylora_retrieve_memory`. `thylora_webhook_health_v1` could not be
probed because it is Chairman-only. These are reported, not assumed broken.

---

## The verification that matters

Page counts were counted **directly in the stored PDF bytes** and compared with the page count each
listing promises. **All six match exactly.**

| Product | Listing promises | Artifact contains | Match |
|---|---|---|---|
| The Last Match | 6-page | 6 page objects | ✅ |
| Question Deck | 27-page | 27 page objects | ✅ |
| The City That Needed More Power | 6-page | 6 page objects | ✅ |
| Build a World From One Idea | 13-page | 13 page objects | ✅ |
| The Handoff | 6-page | 6 page objects | ✅ |
| Bramble Wick | 3-page | 3 page objects | ✅ |

Every artifact is `%PDF-1.4`, unencrypted, `release_state = ACTIVE`.

**Variant configuration verified identical to the one product that has already sold.** All six:
`inventory tracked = false`, `requiresShipping = false`, `policy = DENY`, `quantity = 0`. Because
inventory is untracked, quantity 0 is **inert and cannot read as sold out** — the same configuration
as *Twelve Miles for Flour*, which took a real paid checkout at quantity −3.

---

## The six packets

Common to all six — stated once rather than repeated:

- **Delivery route:** Shopify checkout → `orders/paid` webhook → entitlement → THYLORA library
  (`thylora-library.vercel.app`), sign in with the checkout email → `thylora-protected-download`
  serves the ACTIVE asset. No EDF for these titles; **download is the delivery medium.**
- **Rights state:** PASSED. Original THYLORA work, no third-party rights engaged.
- **Storefront state:** `DRAFT`, zero sales-channel publications, no public URL.
- **Mobile state:** not witnessed. **Checkout state:** never exercised for this SKU —
  `thylora_product_checkout_events` and `thylora_product_download_audit` are both **empty
  backend-wide**. No evidence is inherited from Twelve Miles.
- **Exact remaining release action:** **one Chairman decision** — publish to Online Store + Shop and
  set status ACTIVE. No engineering step remains.

### 1. The Last Match — A THYLORA Family Story About Legacy
- **Price:** $3.00 USD · **SKU:** `THY-STORY-LASTMATCH-001` · **Variant:** `43710160928845`
- **Handle:** `the-last-match-a-thylora-family-story-about-legacy`
- **Cover:** `thylora-last-match-cover.png` · 1445×1870 · bound
- **Artifact:** `THY-DELIVERY-C01C1E9077FF1001` · 28,459 bytes · 6 pages · `c01c1e90…53aa1`
- **Description promise:** a family keeps one thing nobody has explained, and the person who
  inherits it must work out what it was for before deciding whether to keep it.
- **Buyer receives:** a 6-page digital story edition with discussion questions, as a PDF.

### 2. THYLORA Question Deck — 50 Better Questions
- **Price:** $12.00 USD · **SKU:** `THY-Q-DECK-050` · **Variant:** `43710114267213`
- **Handle:** `thylora-question-deck-50-better-questions`
- **Cover:** `thylora-question-deck-approved-cover.png` · 1254×1254 · bound
- **Artifact:** `THY-DELIVERY-0CE19B19BC288F59` · 50,058 bytes · 27 pages · `0ce19b19…a3a50e091`
- **Description promise:** fifty questions that open a subject up instead of closing it down.
- **Buyer receives:** a 27-page printable PDF deck — print and cut the cards, or use on screen.

### 3. The City That Needed More Power — A THYLORA Science Story
- **Price:** $5.00 USD · **SKU:** `THY-STORY-POWER-001` · **Variant:** `43710163157069`
- **Handle:** `the-city-that-needed-more-power-a-thylora-science-story`
- **Cover:** `thylora-city-power-approved-cover.png` · 1254×1254 · bound
- **Artifact:** `THY-DELIVERY-C2C9C1723056FD7F` · 28,579 bytes · 6 pages · `c2c9c172…65a3c5a4`
- **Description promise:** a city runs out of power; the obvious fix is to build more, and the story
  follows someone asking the less obvious question first — where is it all actually going?
- **Buyer receives:** a 6-page digital story edition with discussion questions, written to be read
  by a curious child and an adult together without either being talked down to.

### 4. Build a World From One Idea — THYLORA Starter Kit
- **Price:** $19.00 USD · **SKU:** `THY-WORLD-KIT-001` · **Variant:** `43710115184717`
- **Handle:** `build-a-world-from-one-idea-thylora-starter-kit`
- **Cover:** `thylora-build-a-world-approved-cover.png` · 1254×1254 · bound
- **Artifact:** `THY-DELIVERY-589D0EC598F737C1` · 33,803 bytes · 13 pages · `589d0ec5…b4b82a36`
- **Description promise:** take one idea and build a world with rules, people, work, money and
  history that hold together — the method THYLORA uses on itself.
- **Buyer receives:** a 13-page printable PDF workbook with worksheet pages to fill in.

### 5. The Handoff — A THYLORA Story About Leadership and Change
- **Price:** $7.00 USD · **SKU:** `THY-STORY-HANDOFF-001` · **Variant:** `43710163222605`
- **Handle:** `the-handoff-a-thylora-story-about-leadership-and-change`
- **Cover:** `thylora-story-the-handoff-cover.png` · 1445×1870 · bound
- **Artifact:** `THY-DELIVERY-AACFB78F40A2C446` · 28,666 bytes · 6 pages · `aacfb78f…e52556c05`
- **Description promise:** someone who built a thing must give it to someone who will run it
  differently — and the handoff is the hard part, not the decision.
- **Buyer receives:** a 6-page digital story edition with discussion questions.

### 6. Bramble Wick — The Lantern That Wouldn't Go Out
- **Price:** $1.99 USD · **SKU:** `ER-BRAMBLE-WICK-001` · **Variant:** `43707803697229`
- **Handle:** `bramble-wick-the-lantern-that-wouldnt-go-out`
- **Cover:** `thylora-bramble-wick-approved-cover.png` · 1254×1254 · bound
- **Artifact:** `THY-DELIVERY-6C7891CF5FCFF948` · 26,310 bytes · 3 pages · `6c7891cf…7a5ad9c9`
- **Description promise:** Mara Vale keeps one small lantern burning through a storm and learns what
  a light is really for. A short nighttime story from EdereAriah.
- **Buyer receives:** a 3-page digital story edition, for screen or bedtime read-aloud.

### Unknowns recorded against all six

1. **No `thylora_visual_assets` row backs any of the six covers**, although
   `product_specific_visual_complete` and `visual_preflight_passed` are both true. The covers are
   bound and present on Shopify; what is missing is the registry entry recording approval, rights
   and provenance. An **evidence gap, not a contradiction** of the gate.
2. **No EDF package** for any of the six — the library reader returns `NO_PUBLISHED_EDF`. Not a
   delivery blocker: protected download is the medium.
3. `reaccess_verified`, `checkout_path_verified` and `mobile_preview_passed` are false and **cannot
   become true until a product is buyable**. They are consequences of DRAFT, not separate defects.

---

## Reconciliations

### Rain-Side Beans — Trail Table No. 001 (`7956697481293`)

**A blocker on this record was false and has been corrected.** It said
*"thylora_delivery_assets holds no row for this product."* It does.
`THY-DELIVERY-TRAIL-TABLE-001-ED1` was ingested at **13:35:40Z**, before that blocker was rewritten
at 20:18 — so it was already false when written.

- **Artifact:** complete at four sheets · 15,785 bytes · 4 pages ·
  `d3965a22ad6e1b49b49035bf11af7e9ee08bb7f9b5f58270e80cc1c946202105`
- That hash **matches `EDF-TRAIL-TABLE-001.provenance_source_sha256` exactly** — artifact and EDF
  are bound to the same bytes.
- Stale evidence superseded (not deleted): `recovered_page_count: 2` and
  `sheets_3_4_state: ABSENT`.

**`delivery_connected` stays false, and that is correct** — the asset is `HELD`, and
`thylora-protected-download` serves only `ACTIVE` assets. **No gate flag was moved.**

**Exact remaining steps:**

| Track | Step |
|---|---|
| **Cover** | Chairman approves/revises the recorded `NO_IMAGE_COVER` typographic sheet-1 brief (`products/store/RAIN-SIDE-BEANS-COVER-BRIEF-001.md`) → generate → bind → unbind the rejected incumbent (`THY-VIS-TRAIL-TABLE-001-SHOPIFY-COVER-EXISTING`, still bound deliberately as evidence) |
| **Rights** | Close recipe/story rights + EdereAriah canon check → set EDF release metadata (currently `download=false`, `stream=false`, age unset) → validate → publish `EDF-TRAIL-TABLE-001` (Chairman-credentialed) |
| **Delivery** | After the cover binds, flip the asset `HELD → ACTIVE` |

**Old Jaro attribution: preserved unchanged.** Present in the title lineage, the handle
`trail-table-no-001-old-jaros-rain-side-beans`, the description's attribution paragraph (which
distinguishes Old Jaro the cook from Unkle Seezin the trailman), and the artifact filename
`Trail-Table-001-Old-Jaros-Rain-Side-Beans.pdf`. **Nothing was renamed, scrubbed or rebound.**

### C&W Vehicle Civilization — Engineering Notebook Vol. 1 (`7985315577933`)

**Artifact preserved untouched:** 8 pages · 19,535 bytes · `9159ed18…f2d386ec` · `HELD`.

**NEW DEFECT FOUND — this digital PDF is marked as requiring shipping.** Variant
`gid://shopify/ProductVariant/43797278785613` has `inventoryItem.requiresShipping = true`. Every
other digital product on the shelf is `false`, including *Eight Things* and all six above.
Activated as-is, Shopify would **demand a shipping address for a file that never ships** and may
apply shipping rates — contradicting the listing text. Left as found; recorded as blocking. It is a
one-field correction that **must happen before activation, not after.**

**Cover decision needed:** `AUTO-VISUAL-GATE-001` is LOCKED for transportation imagery and
prohibits rendering before the design-brief and geometry gates are reviewed. A product-specific
brief exists — *engineering-sheet geometry only, explicitly no vehicle form* — and awaits Chairman
approval. No image was generated.

**Price recommendation:** **$29.00 stands as a recommendation only**, set on the DRAFT variant
against an existing shelf of $19 / $12 / $7. Chairman confirms or changes it.

**Opened as an unknown, not asserted as an error:** the listing says *"ten-chapter PDF notebook"*
while the artifact holds 8 page objects. Ten chapters across eight pages is possible. One visual
pass over the rendered PDF settles it.

**Not activated.**

### Eight Things Cars Still Get Wrong (`7985698275405`)

**Not advanced, as directed.** Read only — no flag moved, no blocker rewritten, no Shopify field
touched, no artifact altered.

- **Artifact preserved and re-verified intact:** 4 pages · 6,895 bytes · `50961292…c261feb0` ·
  `ACTIVE`. The listing claims a 4-page notebook; **copy and artifact agree.**
- **Provenance preserved:** eight gap records from `er_automotive_gap_registry`, each with its
  evidence state and open engineering state intact. Deleting this product would destroy the record
  of the duplication, which is itself evidence.

**For the Chairman's positioning decision:** the two notebooks are not interchangeable. Vol. 1 is
8 pages at $29.00 with **no cover** and `requiresShipping` **incorrectly true**. This one is 4 pages
at $9.00, also with no cover, but correctly configured and with an **ACTIVE** delivery asset. The
decision is a real one, not a formality.

---

## Correction carried forward

Restart record `THY-STORE-RECONCILIATION-001` states *"SEVEN other products are ACTIVE and publicly
buyable."* The Shopify Admin API says all are **DRAFT with zero publications**. The readiness board
had already withdrawn that claim; **this pass confirms the withdrawal against the live storefront.**

---

## Chairman decisions required

1. **Publish the six ready products** to Online Store + Shop and set status ACTIVE.
2. **C&W Vol. 1:** approve or revise the engineering-sheet cover brief, and confirm or change $29.00.
3. **C&W Vol. 1 vs Eight Things:** withdraw one, or reposition *Eight Things* as a short entry
   companion beneath Vol. 1 with the overlap stated in both listings.
4. **Rain-Side Beans:** approve or revise the `NO_IMAGE_COVER` brief, and close the recipe/story
   rights and EdereAriah canon check.

## Exact next action

**Chairman publishes the six to Online Store + Shop and sets status ACTIVE.** Then witness checkout,
re-access and mobile on the first of them, which closes `reaccess_verified`,
`checkout_path_verified` and `mobile_preview_passed` — the three gates that cannot be witnessed
while a product is DRAFT.
