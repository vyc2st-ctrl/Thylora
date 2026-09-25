## 10. Continuity

### 10.1 Source phrases preserved

- The full request is kept verbatim in §1 of this report **and** in backend row `thylora_query_carryforward` `THY-Q-20260925-SPINE-610-PHASE2-FULL-SPINE-611` (`verbatim_locked = true`, with SHA-256 hashes of the request and of the pass summary).
- Earlier source phrases used here are quoted, not rewritten: program 608's first-post text; program 609's rule "never imply one dollar has magically become more than one dollar"; program 610's phase rule.

### 10.2 Current phase

**Phase 2 — Full Spine Continuity.** Under program 610, the next numbered query inherits Phase 2 unless the Chairman advances it.

### 10.3 Restart point

**PHASE 2 · RESTART 611.** Read this report's §10.6–§10.7. Get the Chairman's rulings in the order in §10.6, then do the agent-only work that each ruling unlocks. Backend pointer: `thylora_query_carryforward.sequence_no = 611`.

### 10.4 Completed work (this pass)

1. Live read of 225 Shopify products (5 pages), 4 orders, the #1004 transaction and fee.
2. Backend read: the 4 authority programs, readiness, delivery assets, release decisions, entitlements, recent carryforward and ledger.
3. All 11 existing delivery PDFs pulled, hash-verified (11/11), opened and rendered; opening pages checked; two layout defects found; three earlier assumptions checked against the text (Question Deck 50/50 cards, Gap Hunt 21/21 hunts, C&W 11 chapters).
4. Per-product report for all 226 products with the equation beside each (§4).
5. Twelve Miles: first-product record preserved; history (company + Black trail-cowboy record); welcome screen; consent-gated simulated thank-you; feedback path; v2 defect list (§5).
6. Ten-product batch, ten fields each (§6).
7. Sponsor terms draft, consent, PROPOSED splits, unused credit, monthly report (§7).
8. $1 pilot item built on the witnessed delivery path — DRAFT, HELD, no payment (§8).
9. First-post still image prepared and held (§9).
10. Continuity row 611 written.

### 10.5 Blockers (open)

| # | Blocker | Owner |
|---|---|---|
| B1 | Three products ACTIVE with no backend record of who activated them | Chairman |
| B2 | $1 card: no cover; asset HELD; product DRAFT; checkout not exercised | Chairman, then agent |
| B3 | Lakisha pilot invitation not found in backend | Chairman |
| B4 | First-post conflict (604 doctor vs. 608 help); no posting account; mailbox sending unverified; no privacy notice | Chairman |
| B5 | Sponsor program: no rates, no partner, no stored-value/gift-card review, no redemption codes | Chairman + qualified reviewer |
| B6 | Twelve Miles v1 defects (§5.6) — v2 not authorized | Chairman |
| B7 | Carryforward rows missing for sequences 609 and 610 | Chairman (supply the text) or accept the gap |
| B8 | 201 DRAFT products have no artifact; 152 of them are Deep-View titles | Chairman (prune or prioritise) |
| B9 | Help path: 0 verified country directories, 0 caseworkers | Chairman + staff |
| B10 | C&W Vol. 1 still set to "requires shipping" on a digital file; Eight Things duplicates it | Chairman |

### 10.6 Next action (in order)

1. **Chairman:** confirm or reverse the 12:59 activation of Gap Hunt, Question Deck and Build a World (B1).
2. **Chairman:** review the $1 card (two preview PNGs); say yes/no to activation steps §8.3 (B2).
3. **Chairman:** send Lakisha's invitation wording and what she is invited to do (B3).
4. **Chairman:** name the first post (604 or 608); approve or amend the still (B4).
5. **Agent, once 2 is approved:** flip the card's asset to ACTIVE, publish the product, run one $1 checkout, verify entitlement and two downloads, and record N from the real transaction.
6. **Chairman:** approve §7.3 splits as a draft for one partner's review (B5).
7. **Chairman:** Twelve Miles v2 yes/no and the Uncle/Unkle spelling (B6).

### 10.7 What the Chairman may be missing

1. **The store changed today without a record.** Three products went live at 12:59 UTC and nothing in the backend says who did it or why. If it was you, the backend should record it; if it wasn't, something else can change the store.
2. **No outside customer yet.** All three Twelve Miles entitlements belong to your own accounts. The $1.99 proves the path, not demand. The first stranger's purchase is still the milestone.
3. **Small prices lose a third to the card fee.** On $1.00, $0.33 goes to fees. On $1.99, $0.36. Any "proceeds go to…" promise on a price under about $5 is mostly fee.
4. **Two "first posts" are competing.** Sequence 604 made "BEFORE YOU CALL THE DOCTOR" the first post; sequence 608 drafted "NEED HELP?". Publishing one without retiring the other breaks the "first" record.
5. **The help inbox can promise more than it can deliver.** Zero verified directories and zero caseworkers. The first post invites the world to write in; the first week of replies will be the real test. A privacy notice is not written yet.
6. **Selling to people in crisis.** The Homelessness Navigation Guide should be free to anyone who needs it (§6.6). A paid version aimed at unhoused people would read badly and could harm people.
7. **Sponsor money is not a donation.** Unless a qualified review says otherwise, ErsatzReality is a business; sponsors should not be told payments are charitable or tax-deductible.
8. **The catalog is 89% concept.** 201 of 226 products have no file. Each is honestly labelled, but the volume hides the four that can be bought. Consider archiving concept cards into a backend list instead of the store.
9. **The Twelve Miles cover and listing drift from canon.** The body says "Uncle", the title "Unkle"; the planet tag is misspelled; the image alt text names placeholder people.
10. **A history the product already carries.** In canon, Seezin is a Black Southern trailman — one of the most erased figures of the American West (Black cowboys were roughly one in seven to one in four trail hands). The story itself never says so. Decide whether v2 should.
11. **Missing continuity rows 609 and 610.** The programs exist; the conversation turns that created them are not in `thylora_query_carryforward`.
12. **Customer lines are implied, not stated.** None of the four live listings has a plain "who it's for" line. The activation rule asks for a customer description; the current text only implies one.

---

## 11. Every write made this pass (and what stayed untouched)

| # | System | Write | Reversible? |
|---|---|---|---|
| W1 | Shopify | Created DRAFT product `gid://shopify/Product/10319334309965` "Where Does One Dollar Go? — THYLORA Money Path Card", $1.00, SKU `THY-MONEY-PATH-CARD-001`, 0 channels | Yes (archive/delete) |
| W2 | Shopify | Set that variant's `requiresShipping` to false | Yes |
| W3 | Backend | Inserted `thylora_delivery_assets` `THY-DELIVERY-MONEY-PATH-CARD-001`, HELD, 5,963 bytes, sha256 `6d1f2c4b…` | Yes |
| W4 | Backend | Inserted `thylora_store_product_readiness` `a599086b-9640-4678-b639-2e545a5b3d99`, `active_allowed = false` | Yes |
| W5 | Backend | Inserted `thylora_query_carryforward` `e19bc172-e3ec-41c9-9326-98e4d5f07d71`, sequence 611, verbatim-locked | Yes |
| W6 | Git | Folder `spine-610/` on branch `claude/thylora-spine-phase-2-uan480` | Yes |

**Versions.** New: Money Path Card v1 (Edition 1). Unchanged: every other product, file, listing and backend row — including Twelve Miles v1, which is preserved and has a v2 *proposal* only. Nothing was deleted, activated, archived, published, emailed or charged.

**Untouched on purpose:** the three unrecorded ACTIVE products; the Bramble/Last Match/City/Handoff holds; the C&W shipping flag; every Twelve Miles field; all family records naming Lakisha.
