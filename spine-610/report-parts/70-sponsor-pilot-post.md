## 7. Sponsor Access Credits (THY-SPONSOR-ACCESS-CREDITS-609)

**Status stays DESIGN_READY_NO_FUNDS_COLLECTED.** No money was requested, invoiced or collected. No sponsor was contacted. No charitable, non-profit or tax-deductible status is claimed: ErsatzReality Enterprise is, on record, a commercial business, and a sponsor payment is a **commercial purchase of access credits**, not a donation. That statement must stay in the terms until a qualified review says otherwise.

### 7.1 Draft sponsor terms — DRAFT FOR QUALIFIED REVIEW, NOT AN OFFER

1. **Parties.** ErsatzReality Enterprise ("we") and the sponsoring company ("Sponsor").
2. **What the Sponsor buys.** Bundles of access credit at $100 each (PROPOSED). Each bundle creates a published amount of store credit for people referred by an Approved Partner. The Sponsor buys no goods for itself and receives no rights in any content.
3. **Not a donation.** This is a commercial agreement. We are not a registered charity. We make no statement that any payment is tax-deductible. The Sponsor should take its own tax advice.
4. **Published math before any payment.** Before a bundle is sold, we publish N = P − F − T − D and N = B + C + A + O + R with the exact percentages (§7.3). The percentages cannot change for bundles already paid.
5. **Who receives credit.** Only people referred by an Approved Partner who have given the consent in §7.2. The Sponsor does not choose, meet, or learn the identity of any recipient.
6. **What credit can buy.** Items in the eligible catalog: ACTIVE digital products and, once they exist, help-path guides. The recipient chooses. The Sponsor cannot require a story, a photo, a post or any public thanks.
7. **No work for help.** Credit is never conditional on unpaid work, testimony or publicity.
8. **Payment.** By invoice, not the public store, so sponsor money is recorded separately from store sales. Funds are held in a separately recorded ledger line (a separate bank account is recommended).
9. **Reporting.** Monthly (§7.5), within 10 business days of month end, with a two-person reconciliation.
10. **Unused credit.** As §7.4.
11. **Ending the agreement.** Either party may end it with 30 days' notice. Money not yet converted to credit is refunded within 30 days, minus card fees already charged. Credit already issued to recipients is honoured to its end date.
12. **Publicity.** The Sponsor may say it funds access through THYLORA, using wording both sides approve. We will not name the Sponsor without approval.
13. **Governing law, gift-card and consumer-credit rules.** To be set after review in each country where credit is issued. Stored-value and gift-card law differs by state and country; this term is deliberately blank.

### 7.2 Beneficiary consent (read by, or to, the recipient by the Approved Partner)

> "A company has paid for store credit so people can get digital guides and stories from THYLORA at no cost. If you'd like some, we will give THYLORA only a code, your country or region, and your preferred language — not your name, address or story. The company will never know who you are. You choose what to get. You don't have to say thank you, post anything, or do any work. You can stop at any time. Do you want the credit?"

- Yes/no recorded by the partner, with date and language. THYLORA stores only the code, region, language and consent date.
- Minors: only with a guardian's consent, through a partner with safeguarding procedures.
- The recipient may ask the partner to delete the record at any time.

### 7.3 Splits — PROPOSED, NOT APPROVED

For one $100 bundle paid by card:

N = P − F − T − D = $100.00 − $3.20 − $0.00 − $0.00 = **$96.80** (T left at $0.00 pending review of whether a sale of credit is taxable where the Sponsor is).

| Share | Meaning in this program | % of N (PROPOSED) | Amount |
|---|---|---|---|
| B — beneficiary | Store credit issued to recipients | 70% | $67.76 |
| C — creator | 0% at sponsor level. Creators are paid through each item's own split when credit is redeemed, so a creator is never paid twice or left out. | 0% | $0.00 |
| A — approved partner | Referral and consent work by a *named* partner that has agreed in writing. Held at 0% until one exists. | 10% | $9.68 |
| O — operation | Library, store, reporting, reconciliation | 12% | $11.62 |
| R — reserve | Refunds, chargebacks, reconciliation differences | 8% | $7.74 |
| **Total** | | **100%** | **$96.80** |

Check: 67.76 + 0 + 9.68 + 11.62 + 7.74 = 96.80. Until a partner signs, A's 10% stays unallocated in the pool and is reported as such — it is never moved to O.

### 7.4 Unused-credit treatment — PROPOSED

- Credit is valid **24 months** from the day it is issued to a recipient. (Legal review may require longer, or no expiry.)
- Credit never becomes cash and cannot be transferred or resold.
- Credit left unissued in the pool at month end stays in the pool and is reported.
- Credit that expires unredeemed returns to the **same sponsor's pool** for new recipients. It is never moved into O or R.
- If the program ends, unissued pool money is refunded under §7.1(11).

### 7.5 Monthly report — fields (from program 609 metadata, extended)

For each sponsor, each month: amount received · fees · taxes · N · credit issued (count and $) · credit redeemed (count and $) · items redeemed by title · A paid, and to whom · O and R taken · unissued pool balance · expired credit returned to pool · reconciliation sign-off by two people with dates. No recipient identity, ever.

### 7.6 Blockers and next question

- **Blockers:** rates not approved; no sponsor; no Approved Partner; no gift-card/stored-value review; no separate funds ledger; no redemption code mechanism at checkout.
- **Next question:** Will the Chairman approve the §7.3 percentages as the draft sent for one partner's review, or set different ones?

---

## 8. The one-dollar pilot

### 8.1 Does digital fulfillment exist? — Yes, and it is witnessed

Order #1004 proves the path: Shopify checkout → paid-order webhook → entitlement row → library sign-in → protected open. The library also serves ACTIVE files from `thylora_delivery_assets` for download. So a real $1 item could be built on it.

### 8.2 What was built (real, DRAFT, not for sale yet)

| Part | Record |
|---|---|
| Product | **Where Does One Dollar Go? — THYLORA Money Path Card** |
| Shopify | `gid://shopify/Product/10319334309965`, **DRAFT**, 0 sales channels, variant `…/50528743260237`, **$1.00**, SKU `THY-MONEY-PATH-CARD-001`, requires shipping = **false** (fixed after creation; Shopify defaults new variants to true) |
| File | `THYLORA-Money-Path-Card-001.pdf`, 2 pages, 5,963 bytes, sha256 `6d1f2c4b04a4d4e66d8895459aefb53b955ab9194fd59a917022273414dacde4` |
| Backend | `thylora_delivery_assets` row `THY-DELIVERY-MONEY-PATH-CARD-001`, **HELD** (server-side hash matches the local file) · `thylora_store_product_readiness` row `a599086b-9640-4678-b639-2e545a5b3d99`, `active_allowed = false` |
| Source | `spine-610/one-dollar-pilot/build_card.py` (regenerates the PDF) |

**Page 1 (not blank):** title "Where Does One Dollar Go?", the equation N = P − F − T − D, a plain-words table, and a real $1 walk-through: P $1.00 − F $0.33 − T $0.00 − D $0.00 = **N $0.67**, with the point that the flat 30 cents takes almost a third of a one-dollar sale. **Page 2:** N = B + C + A + O + R with blanks, four questions to ask about any "proceeds go to…" offer, and a disclaimer that it is not advice and not a charity program.

**Why this item:** it teaches the Chairman's own two equations, costs nothing to deliver, needs no likeness or consent, and is honest about its own fee.

### 8.3 What must happen before the first dollar — exact dependencies

1. Chairman reviews the two pages (previews: `spine-610/one-dollar-pilot/card-page1-preview.png`, `card-page2-preview.png`).
2. A cover image (none generated; the painted-imagery rule applies).
3. Flip the delivery row HELD → ACTIVE.
4. Set the Shopify product ACTIVE and publish it to the Online Store.
5. One real $1 checkout, then confirm: entitlement row → library download → second download.

### 8.4 No payment is claimed

**No payment has happened for this item.** It is DRAFT, on no channel, and its file is HELD. Its expected money line is N = $1.00 − $0.33 − T − $0.00 = **$0.67 − T**, and that stays an expectation until an order exists.

### 8.5 Lakisha's pilot invitation and history record — PENDING

- **Searched:** every text/JSON column in 900+ backend tables for "Lakisha", "one dollar", "$1 pilot" and the four authority codes.
- **Found:** Lakisha appears in family-continuity records (a family-relationship custody thread, a 2026-09-06 opportunity-report reference, a VycKey naming note, and a 2026-09-01 ledger entry about a trust instruction). **No pilot invitation record exists.**
- **Recorded this pass, as PENDING:** the continuity row (§11) and the $1 readiness row both carry `lakisha_pilot = PENDING — invitation record not located in backend`. No invitation was sent, no message drafted to her, and none of her family records were read further or changed.
- **Needed from the Chairman:** the invitation's words (or where they are kept), and whether she is invited to *buy* the $1 card, to *test* it free, or something else.

---

## 9. The first public post

### 9.1 Still image — prepared

- Files: `spine-610/first-post/first-post-still.png` (1080 × 1350, portrait feed size) and its source `first-post-still.html`.
- Style: type only — no photographs, no people, no AI-looking imagery (following the Chairman's seq. 604 correction).
- Wording is taken from the program-608 first-post draft:
  - Headline: **"Need help? Tell us where the next step breaks."**
  - Body: any country; send country/city, language, need, deadline; "email only" if you can't call.
  - **Help email** in a black band: `ersatzrealityenterprise@gmail.com`.
  - Safety line: don't send ID numbers, medical records, or where you sleep in the first email.
  - **THYLORA math:** `N = P − F − T − D` with the real first sale: "$1.99 − $0.36 card fee − $0 tax − $0 delivery = $1.63. No split is promised until it is written down first."
  - **Store path:** `ersatzreality.myshopify.com` · "Twelve Miles for Flour — $1.99 digital story".
  - Footer: "Not an emergency service. Replies are by people, not guaranteed same-day."

### 9.2 Routed to Chairman review — not published

Nothing was posted anywhere. The still is marked DRAFT in its source file.

### 9.3 Publication gate — what is still unmet

| Gate item | State |
|---|---|
| Chairman approval of this exact image and caption | **Not given** |
| Which "first post" is canonical: seq. 604 "BEFORE YOU CALL THE DOCTOR" (Transmission 001) or seq. 608 "Need help?" | **Conflict — Chairman to rule** (§10.7) |
| Company mailbox connected so replies can be read and answered | **Unverified** — seq. 603 recorded that only a personal Gmail was connected as a sender |
| Privacy notice for the help inbox (program 608 `privacy_next`) | **Not drafted** |
| Store path a stranger can type | Uses the `.myshopify.com` address; **confirm the public domain** before posting |
| A posting account and a witnessed publish | **None connected** in this session |
| Store Draw + Worth Gate (Attention, Help, Match, Path, Trust) | **Not run** on this post |
